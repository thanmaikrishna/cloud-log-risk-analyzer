import json
import os
from passlib.hash import pbkdf2_sha256
from functools import wraps
from flask import request, jsonify
import jwt
from config import SECRET_KEY  # ✅ Import here

USERS_FILE = 'users.json'

def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, 'r') as f:
        data = json.load(f)
        # Ensure data is a dict, else return empty dict to avoid errors
        if not isinstance(data, dict):
            return {}
        return data


def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def register_user(email, password, update=False):
    users = load_users()
    if not update and email in users:
        return False, 'User already exists'
    hashed = pbkdf2_sha256.hash(password)
    users[email] = hashed
    save_users(users)
    return True, 'User registered' if not update else 'Password updated'

def authenticate_user(email, password):
    users = load_users()
    hashed = users.get(email)
    if not hashed:
        return False
    return pbkdf2_sha256.verify(password, hashed)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])  # ✅ Use from config
            current_user = data['email']
        except Exception:
            return jsonify({'message': 'Token is invalid or expired'}), 401
        return f(current_user, *args, **kwargs)
    return decorated
