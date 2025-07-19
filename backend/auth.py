from functools import wraps
from flask import request, jsonify
from jose import jwt
import requests
import os

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("AUTH0_API_AUDIENCE")
ALGORITHMS = ["RS256"]

def get_token_auth_header():
    auth = request.headers.get("Authorization", None)
    if not auth or not auth.startswith("Bearer "):
        raise Exception("Authorization header must be Bearer token")
    return auth.split()[1]

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_auth_header()

        jsonurl = requests.get(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json")
        jwks = jsonurl.json()
        unverified_header = jwt.get_unverified_header(token)

        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }

        if not rsa_key:
            return jsonify({"message": "Unable to find RSA key"}), 401

        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=ALGORITHMS,
                audience=API_AUDIENCE,
                issuer=f"https://{AUTH0_DOMAIN}/"
            )
        except Exception as e:
            return jsonify({"message": f"Token error: {str(e)}"}), 401

        return f(payload, *args, **kwargs)
    return decorated
