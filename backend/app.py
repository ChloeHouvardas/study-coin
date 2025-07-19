from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from supabase import create_client
from auth import requires_auth

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

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
    usd_value = f"${(total_mined * XMR_USD_RATE):.2f}"

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

if __name__ == "__main__":
    app.run(debug=True)
