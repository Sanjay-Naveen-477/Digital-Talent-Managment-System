from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient("mongodb+srv://sanjaynaveen477:sanjay123@cluster0.an0tz.mongodb.net/talent_db?retryWrites=true&w=majority")
db = client["talent_db"]
users = db["users"]

@app.route("/")
def home():
    return "Backend Running 🚀"

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users.find_one({"email": email, "password": password})

    if user:
        return jsonify({
            "status": "success",
            "role": user["role"]
        })
    return jsonify({"status": "fail"})

if __name__ == "__main__":
    app.run(debug=True)


@app.route("/google-login", methods=["POST"])
def google_login():
    data = request.json
    email = data.get("email")
    name = data.get("name")

    user = users.find_one({"email": email})

    if not user:
        users.insert_one({
            "email": email,
            "name": name,
            "role": "user",
            "auth_type": "google"
        })

    return jsonify({"status": "success"})