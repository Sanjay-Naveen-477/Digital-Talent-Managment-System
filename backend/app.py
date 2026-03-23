from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from functools import wraps
from bson import ObjectId

app = Flask(__name__)

# Enhanced CORS configuration
CORS(app, resources={
    r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}
}, supports_credentials=True)

client = MongoClient("mongodb+srv://sanjaynaveen477:sanjay123@cluster0.an0tz.mongodb.net/talent_db?retryWrites=true&w=majority")
db = client["talent_db"]
users = db["users"]
tasks_col = db["tasks"]

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

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "user")

    if users.find_one({"email": email}):
        return jsonify({"status": "fail", "message": "Email already exists. Please log in."}), 400

    new_user = {
        "name": username,  # Mapping username to name for consistency with google_login
        "email": email,
        "password": password,
        "role": role,
        "auth_type": "email"
    }
    users.insert_one(new_user)
    return jsonify({"status": "success", "message": "Account created successfully!"})

# --- TASKS ENDPOINTS ---

@app.route("/tasks", methods=["GET"])
def get_tasks():
    tasks = []
    for t in tasks_col.find():
        t["id"] = str(t["_id"])
        del t["_id"]
        tasks.append(t)
    return jsonify({"status": "success", "tasks": tasks})

@app.route("/tasks", methods=["POST"])
def add_task():
    data = request.json
    new_task = {
        "name": data.get("name"),
        "assignedTo": data.get("assignedTo"),
        "deadline": data.get("deadline"),
        "status": data.get("status", "pending"),
        "user": data.get("assignedTo", "").lower().split(' ')[0]
    }
    result = tasks_col.insert_one(new_task)
    new_task["id"] = str(result.inserted_id)
    del new_task["_id"]
    return jsonify({"status": "success", "task": new_task})

@app.route("/tasks/<task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.json
    update_data = {
        "name": data.get("name"),
        "assignedTo": data.get("assignedTo"),
        "deadline": data.get("deadline"),
        "status": data.get("status"),
        "user": data.get("assignedTo", "").lower().split(' ')[0]
    }
    tasks_col.update_one({"_id": ObjectId(task_id)}, {"$set": update_data})
    update_data["id"] = task_id
    return jsonify({"status": "success", "task": update_data})

@app.route("/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    tasks_col.delete_one({"_id": ObjectId(task_id)})
    return jsonify({"status": "success"})

@app.route("/tasks/delete_batch", methods=["POST"])
def delete_batch():
    data = request.json
    task_ids = data.get("ids", [])
    if task_ids:
        object_ids = [ObjectId(tid) for tid in task_ids]
        tasks_col.delete_many({"_id": {"$in": object_ids}})
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)