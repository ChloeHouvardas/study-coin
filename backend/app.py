from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from supabase import create_client
from auth import requires_auth
import requests 

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
active_sessions = {}
MINING_NODE_URL = "http://localhost:3001"
# Supabase init
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

from datetime import datetime, timedelta

def get_user_stats(user_id, start_time, end_time):
    response = supabase.table("sessions").select("*")\
        .eq("user", user_id)\
        .gte("start_time", start_time.isoformat())\
        .lte("end_time", end_time.isoformat())\
        .execute()

    sessions = response.data or []

    total_sessions = len(sessions)
    successful_sessions = sum(1 for s in sessions if s["success"])
    total_mined = sum(s["mined_amount"] or 0 for s in sessions)

    total_study_seconds = sum(
        (datetime.fromisoformat(s["end_time"]) - datetime.fromisoformat(s["start_time"])).total_seconds()
        for s in sessions if s["end_time"] and s["start_time"]
    )

    study_time_str = str(timedelta(seconds=int(total_study_seconds)))
    focus_score = f"{(successful_sessions / total_sessions * 100):.0f}%" if total_sessions else "0%"
    efficiency = f"{(total_mined / (total_study_seconds / 3600)):.1%}" if total_study_seconds else "0%"

    XMR_USD_RATE = 140  # Update to current XMR price or fetch dynamically
    usd_value = f"${(total_mined / XMR_USD_RATE)}"

    return {
        "studyTime": study_time_str,
        "btcMined": f"{total_mined:.8f}",
        "usdValue": usd_value,
        "focusScore": focus_score,
        "sessions": total_sessions,
        "efficiency": efficiency
    }

@app.route("/api/user-stats", methods=["GET"])
@requires_auth
def user_stats(payload):
    auth0_id = payload["sub"]

    # Fetch user
    user_response = supabase.table("users").select("id").eq("auth0_id", auth0_id).execute()
    if not user_response.data:
        return jsonify({"error": "User not found"}), 404

    user_id = user_response.data[0]["id"]
    now = datetime.utcnow()

    stats = {
        "today": get_user_stats(user_id, now.replace(hour=0, minute=0, second=0, microsecond=0), now),
        "week": get_user_stats(user_id, now - timedelta(days=7), now),
        "month": get_user_stats(user_id, now.replace(day=1, hour=0, minute=0, second=0, microsecond=0), now),
        "year": get_user_stats(user_id, now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0), now),
    }

    return jsonify(stats)



@app.route("/api/save-user", methods=["POST"])
@requires_auth
def save_user(payload):
    email = request.json.get("email")
    auth0_id = payload["sub"]

    if not email:
        return jsonify({"error": "Missing email"}), 400

    existing = supabase.table("users").select("*").eq("auth0_id", auth0_id).execute()

    if existing.data:
        return jsonify({"message": "User already exists"}), 200

    supabase.table("users").insert({
        "auth0_id": auth0_id,
        "email": email
    }).execute()

    return jsonify({"message": "User saved"}), 201


@app.route("/api/start-session", methods=["POST"])
@requires_auth
def start_session(payload):
    auth0_id = payload["sub"]

    # Save session start time in memory
    start_time = datetime.utcnow().isoformat()
    active_sessions[auth0_id] = {
        "start_time": start_time
    }

    # Start mining via Node
    try:
        r = requests.post(f"{MINING_NODE_URL}/start-session")
        r.raise_for_status()
    except Exception as e:
        return jsonify({"error": "Failed to start mining process", "details": str(e)}), 500

    return jsonify({ "message": "Session started" })


@app.route("/api/end-session", methods=["POST"])
@requires_auth
def end_session(payload):
    auth0_id = payload["sub"]
    data = request.get_json()
    expired = data.get("expired", False)

    session_data = active_sessions.pop(auth0_id, None)
    if not session_data:
        return jsonify({"error": "No active session found"}), 404

    try:
        earnings_resp = requests.get(f"{MINING_NODE_URL}/earnings")
        hashrate_resp = requests.get(f"{MINING_NODE_URL}/hashrate")
        earnings_resp.raise_for_status()
        hashrate_resp.raise_for_status()
        earnings_data = earnings_resp.json()
        hashrate_data = hashrate_resp.json()

        mined_amount = float(earnings_data.get("estimated_usd", 0))
        avg_hashrate = float(hashrate_data.get("hashrate_hs", 0))

        try:
            r = requests.post(f"{MINING_NODE_URL}/end-session")
            r.raise_for_status()
            print(r.json())
            print("Session ended successfully")
        except Exception as e:
            return jsonify({"error": "Failed to stop mining process", "details": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Failed to fetch mining stats", "details": str(e)}), 500

    user_resp = supabase.table("users").select("id", "amount").eq("auth0_id", auth0_id).execute()
    if not user_resp.data:
        return jsonify({"error": "User not found"}), 404

    user_data = user_resp.data[0]
    user_id = user_data["id"]
    before_amount = user_data.get("amount", 0) or 0

    result = supabase.table("sessions").insert({
        "user": user_id,
        "start_time": session_data["start_time"],
        "end_time": datetime.utcnow().isoformat(),
        "mined_amount": mined_amount,
        "avg_hash_rate": avg_hashrate,
        "success": expired
    }).execute()

    if not result.data:
        return jsonify({"error": "Failed to save session"}), 500

    # ✅ Update amount only if session is successful
    print(expired)
    if expired:
        new_amount = before_amount + mined_amount

        supabase.table("users").update({"amount": new_amount}).eq("id", user_id).execute()

        print(f"💰 Updated user {user_id}: before = {before_amount:.4f}, mined = {mined_amount:.4f}, after = {new_amount:.4f}")

    return jsonify({ "message": "Session saved" })



@app.route("/api/wallet-info", methods=["GET"])
@requires_auth
def get_wallet_info(payload):
    auth0_id = payload["sub"]
    user = supabase.table("users").select("wallet", "amount").eq("auth0_id", auth0_id).execute()
    if not user.data:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "wallet": user.data[0].get("wallet", ""),
        "balance": user.data[0].get("amount", "0.00")
    })

@app.route("/api/update-wallet", methods=["POST"])
@requires_auth
def update_wallet(payload):
    auth0_id = payload["sub"]
    data = request.get_json()
    wallet = data.get("wallet")
    if not wallet:
        return jsonify({"error": "No wallet provided"}), 400
    supabase.table("users").update({"wallet": wallet}).eq("auth0_id", auth0_id).execute()
    return jsonify({"message": "Wallet updated"})



if __name__ == "__main__":
    app.run(debug=True)
