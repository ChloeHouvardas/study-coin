import os
import sys
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime, timedelta
import requests
import traceback
from flask import send_from_directory

# Fix Python path so we can import from CNN/project
sys.path.append(os.path.join(os.path.dirname(__file__), "CNN", "project"))

from auth import requires_auth
from study_analyzer import StudyAnalyzer
from evidence_capture import EvidenceCapture
from study_monitor_app import StudyMonitorApp
from supabase import create_client
import requests 
from datetime import datetime, timezone

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Supabase init
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

MINING_NODE_URL = "http://localhost:3001"
active_sessions = {}
monitor_app = StudyMonitorApp()

# ------------------ Utility ------------------

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

    XMR_USD_RATE = 140  # hardcoded for now
    usd_value = f"${(total_mined / XMR_USD_RATE)}"

    return {
        "studyTime": study_time_str,
        "btcMined": f"{total_mined:.8f}",
        "usdValue": usd_value,
        "focusScore": focus_score,
        "sessions": total_sessions,
        "efficiency": efficiency
    }

# ------------------ API Routes ------------------

@app.route("/api/user-stats", methods=["GET"])
@requires_auth
def user_stats(payload):
    auth0_id = payload["sub"]
    user_response = supabase.table("users").select("id").eq("auth0_id", auth0_id).execute()

    if not user_response.data:
        return jsonify({"error": "User not found"}), 404

    user_id = user_response.data[0]["id"]
    now = datetime.now(timezone.utc)

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
    start_time = datetime.now(timezone.utc).isoformat()
    active_sessions[auth0_id] = {
        "start_time": start_time
    }

    try:
        print("Skipping mining startup on Windows for now.")
        # r = requests.post(f"{MINING_NODE_URL}/start-session")
        # r.raise_for_status()
    except Exception as e:
        return jsonify({"error": "Failed to start mining", "details": str(e)}), 500

    return jsonify({ "message": "Session started" })

@app.route("/api/end-session", methods=["POST"])
@requires_auth
def end_session(payload):
    try:
        auth0_id = payload["sub"]
        data = request.get_json()
        expired = data.get("expired", False)

        session_data = active_sessions.pop(auth0_id, None)
        if not session_data:
            return jsonify({"error": "No active session found"}), 404

        try:
            # earnings_resp = requests.get(f"{MINING_NODE_URL}/earnings")
            # hashrate_resp = requests.get(f"{MINING_NODE_URL}/hashrate")
            # earnings_resp.raise_for_status()
            # hashrate_resp.raise_for_status()

            # When mining is re-enabled:
            # mined_amount = float(earnings_resp.json().get("estimated_usd", 0))
            # avg_hashrate = float(hashrate_resp.json().get("hashrate_hs", 0))

            user_data = user_resp.data[0]
            user_id = user_data["id"]
            before_amount = user_data.get("amount", 0) or 0

            result = supabase.table("sessions").insert({
                "user": user_id,
                "start_time": session_data["start_time"],
                "end_time": datetime.now(timezone.utc).isoformat(),
                "mined_amount": mined_amount,
                "avg_hash_rate": avg_hashrate,
                "success": expired
            }).execute()

            if not result.data:
                return jsonify({"error": "Failed to save session"}), 500

            # TODO UNCOMMENT LATER DONT WORK FOR ME ON WINDOWS
            mined_amount = 0.0009  # pretend user mined 0.0009 coins
            avg_hashrate = 123.45  # pretend average hash rate

            # try:
            #     r = requests.post(f"{MINING_NODE_URL}/end-session")
            #     r.raise_for_status()
            # except Exception as e:
            #     return jsonify({"error": "Failed to stop mining", "details": str(e)}), 500

        except Exception as e:
            return jsonify({"error": "Failed to fetch mining stats", "details": str(e)}), 500

        # user_resp = supabase.table("users").select("id", "amount").eq("auth0_id", auth0_id).execute()
        # if not user_resp.data:
        #     return jsonify({"error": "User not found"}), 404

        # user_data = user_resp.data[0]
        # user_id = user_data["id"]
        # before_amount = user_data.get("amount", 0) or 0

        # result = supabase.table("sessions").insert({
        #     "user": user_id,
        #     "start_time": session_data["start_time"],
        #     "end_time": datetime.utcnow().isoformat(),
        #     "mined_amount": mined_amount,
        #     "avg_hash_rate": avg_hashrate,
        #     "success": expired
        # }).execute()

        # if not result.data:
        #     return jsonify({
        #         "error": "Failed to save session to database"
        #     }), 500

        if expired:
            # new_amount = before_amount + mined_amount
            # supabase.table("users").update({"amount": new_amount}).eq("id", user_id).execute()
            # print(f"💰 Updated user {user_id}: before = {before_amount:.4f}, mined = {mined_amount:.4f}, after = {new_amount:.4f}")

            # 📸 Trigger Discord photo alert
            frame = monitor_app.get_current_frame()
            if frame is not None:
                photo_path = monitor_app.capture.take_photo(frame)
                filename = os.path.basename(photo_path)
                monitor_app.capture.send_to_discord("🚨 Session failed due to distraction.", photo_path)

        return jsonify({
            "message": "Session saved",
            "expired": expired,
            "minedAmount": mined_amount,
            "screenshot": filename  # <-- new
        })


    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route('/photos/<path:filename>')
def get_photo(filename):
    return send_from_directory("CNN/photos", filename)

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
    return jsonify({"message": "Wallet updated" })

# ------------------ Video + AI Monitoring ------------------

@app.route("/video_feed")
def video_feed():
    return Response(
        monitor_app.generate_stream(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )

@app.route("/focus-status")
def focus_status():
    try:
        frame = monitor_app.get_current_frame()
        if frame is None:
            print("⚠️ Warning: No webcam frame available.")
            return jsonify({"error": "No webcam frame available"}), 500

        studying, _ = monitor_app.analyzer.analyze(frame)
        return jsonify({"studying": studying})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Failed to analyze frame", "details": str(e)}), 500

@app.route("/api/withdraw-funds", methods=["POST"])
@requires_auth
def withdraw_funds(payload):
    auth0_id = payload["sub"]
    data = request.get_json()
    amount = data.get("amount")
    wallet = data.get("wallet")
    
    if not amount or amount <= 0:
        return jsonify({"error": "Invalid withdrawal amount"}), 400
        
    if not wallet:
        return jsonify({"error": "No wallet address provided"}), 400
    
    # Get current user balance
    user_resp = supabase.table("users").select("id, amount").eq("auth0_id", auth0_id).execute()
    
    if not user_resp.data:
        return jsonify({"error": "User not found"}), 404
        
    user_data = user_resp.data[0]
    user_id = user_data["id"]
    current_balance = user_data.get("amount", 0) or 0
    
    if amount > current_balance:
        return jsonify({"error": "Insufficient funds"}), 400
    
    # Calculate new balance
    new_balance = current_balance - amount
    
    # Update user balance
    update_resp = supabase.table("users").update({"amount": new_balance}).eq("id", user_id).execute()
    
    if not update_resp.data:
        return jsonify({"error": "Failed to process withdrawal"}), 500
    
    return jsonify({
        "success": True,
        "previousBalance": current_balance,
        "withdrawnAmount": amount,
        "newBalance": new_balance
    })

if __name__ == "__main__":
    app.run(debug=True)