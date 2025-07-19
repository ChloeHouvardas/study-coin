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
