from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from functools import wraps
from bson import ObjectId
from datetime import datetime

app = Flask(__name__)

# Enhanced CORS configuration
CORS(app, resources={
    r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}
}, supports_credentials=True)

client = MongoClient("mongodb+srv://sanjaynaveen477:sanjay123@cluster0.an0tz.mongodb.net/talent_db?retryWrites=true&w=majority")

def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        role = request.headers.get("X-User-Role", "").lower()
        if role != "admin":
            return jsonify({"status": "fail", "message": "Admin privileges required."}), 403
        return f(*args, **kwargs)
    return wrapper
db = client["talent_db"]
users = db["users"]
tasks_col = db["tasks"]
teams_col = db["teams"]

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
            "role": user.get("role", "user"),
            "name": user.get("name", ""),
            "email": user.get("email", "")
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
            "auth_type": "google",
            "bio": "",
            "picture": ""
        })
        role = "user"
    else:
        role = user.get("role", "user")

    return jsonify({"status": "success", "role": role, "name": name, "email": email})

@app.route("/profile", methods=["GET"])
def get_profile():
    email = request.args.get('email')
    if not email:
        return jsonify({"status": "fail", "message": "Email is required."}), 400

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"status": "fail", "message": "User not found."}), 404

    user_data = {
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "user"),
        "bio": user.get("bio", ""),
        "picture": user.get("picture", "")
    }
    return jsonify({"status": "success", "user": user_data})

@app.route("/profile", methods=["PUT"])
def update_profile():
    data = request.json
    current_email = data.get("currentEmail")
    if not current_email:
        return jsonify({"status": "fail", "message": "Current email is required."}), 400

    update_payload = {}
    if data.get("name") is not None:
        update_payload["name"] = data.get("name")
    if data.get("email") is not None:
        update_payload["email"] = data.get("email")
    if data.get("bio") is not None:
        update_payload["bio"] = data.get("bio")
    if data.get("picture") is not None:
        update_payload["picture"] = data.get("picture")

    if not update_payload:
        return jsonify({"status": "fail", "message": "No profile fields provided."}), 400

    result = users.update_one({"email": current_email}, {"$set": update_payload})
    if result.matched_count == 0:
        return jsonify({"status": "fail", "message": "User not found."}), 404

    user = users.find_one({"email": update_payload.get("email", current_email)})
    user_data = {
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "user"),
        "bio": user.get("bio", ""),
        "picture": user.get("picture", "")
    }
    return jsonify({"status": "success", "user": user_data})

@app.route("/change-password", methods=["PUT"])
def change_password():
    data = request.json
    email = data.get("email")
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    if not email or not current_password or not new_password:
        return jsonify({"status": "fail", "message": "Email, current password, and new password are required."}), 400

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"status": "fail", "message": "User not found."}), 404

    if user.get("password") != current_password:
        return jsonify({"status": "fail", "message": "Current password is incorrect."}), 401

    users.update_one({"email": email}, {"$set": {"password": new_password}})
    return jsonify({"status": "success", "message": "Password updated successfully."})

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
        t["createdAt"] = t.get("createdAt").isoformat() if t.get("createdAt") else None
        t["updatedAt"] = t.get("updatedAt").isoformat() if t.get("updatedAt") else None
        tasks.append(t)
    return jsonify({"status": "success", "tasks": tasks})


@app.route("/reports", methods=["GET"])
def get_reports():
    tasks = list(tasks_col.find())
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.get("status", "").lower() == "completed")
    pending_tasks = sum(1 for t in tasks if t.get("status", "").lower() in ["pending", "in progress"])
    delayed_tasks = 0
    now = datetime.utcnow()
    for t in tasks:
        deadline_str = t.get("deadline")
        status = t.get("status", "").lower()
        if deadline_str and status != "completed":
            try:
                deadline = datetime.fromisoformat(deadline_str)
                if deadline < now:
                    delayed_tasks += 1
            except ValueError:
                pass

    completion_rate = round((completed_tasks / total_tasks * 100), 2) if total_tasks else 0

    # User performance
    user_perf_map = {}
    for t in tasks:
        user = t.get("assignedTo", "Unassigned")
        if user not in user_perf_map:
            user_perf_map[user] = {"assigned": 0, "completed": 0}
        user_perf_map[user]["assigned"] += 1
        if t.get("status", "").lower() == "completed":
            user_perf_map[user]["completed"] += 1

    user_performance = []
    for i, (user, vals) in enumerate(sorted(user_perf_map.items(), key=lambda x: -x[1]["completed"]), start=1):
        assigned = vals["assigned"]
        completed = vals["completed"]
        rate = round((completed / assigned * 100), 0) if assigned else 0
        status = "Active" if rate >= 70 else "Low Performance"
        user_performance.append({"id": i, "name": user, "assigned": assigned, "completed": completed, "rate": rate, "status": status})

    most_productive = max(user_performance, key=lambda x: x["completed"], default={"name": "N/A", "rate": 0})

    insights = [
        {"icon": "🏆", "text": f"Most productive user: {most_productive['name']}", "trend": "up"},
        {"icon": "⚠️", "text": f"Tasks delayed: {delayed_tasks}", "trend": "down" if delayed_tasks > 0 else "up"},
        {"icon": "📈", "text": f"Completion rate: {completion_rate}%", "trend": "up"}
    ]

    # Activity timeline - from latest task updates
    timeline = []
    sorted_tasks = sorted(tasks, key=lambda t: t.get("updatedAt", datetime.min), reverse=True)
    for t in sorted_tasks[:8]:
        state = t.get("status", "pending")
        text = f"{t.get('assignedTo', 'Unknown')} changed '{t.get('name', 'task')}' to {state.capitalize()}"
        age = t.get("updatedAt")
        if isinstance(age, datetime):
            age_text = age.strftime("%Y-%m-%d %H:%M")
        else:
            age_text = str(age)
        timeline.append({"id": str(t.get("_id", "")), "time": age_text, "type": "completion" if state == 'completed' else ('late' if state == 'delayed' else 'new'), "text": text})

    task_reports = []
    for t in tasks:
        task_reports.append({
            "id": str(t.get("_id", "")),
            "name": t.get("name", ""),
            "assignee": t.get("assignedTo", ""),
            "deadline": t.get("deadline", ""),
            "status": t.get("status", ""),
            "priority": t.get("priority", "Medium")
        })

    data = {
        "summary": {
            "totalTasks": total_tasks,
            "completedTasks": completed_tasks,
            "pendingTasks": pending_tasks,
            "completionRate": completion_rate
        },
        "insights": insights,
        "userPerformance": user_performance,
        "taskReports": task_reports,
        "activityTimeline": timeline
    }

    return jsonify({"status": "success", "data": data})

@app.route("/tasks", methods=["POST"])
@admin_required
def add_task():
    data = request.json
    now = datetime.utcnow()
    new_task = {
        "name": data.get("name"),
        "assignedTo": data.get("assignedTo"),
        "deadline": data.get("dueDate", data.get("deadline")),
        "dueDate": data.get("dueDate", data.get("deadline")),
        "teamId": data.get("teamId"),
        "status": data.get("status", "pending"),
        "tags": data.get("tags", []),
        "description": data.get("description", ""),
        "user": data.get("assignedTo", "").lower().split(' ')[0],
        "createdAt": now,
        "updatedAt": now
    }
    result = tasks_col.insert_one(new_task)
    task_doc = tasks_col.find_one({"_id": result.inserted_id})
    task_doc["id"] = str(task_doc["_id"])
    del task_doc["_id"]
    # convert datetimes to strings for JSON output
    task_doc["createdAt"] = task_doc["createdAt"].isoformat()
    task_doc["updatedAt"] = task_doc["updatedAt"].isoformat()
    return jsonify({"status": "success", "task": task_doc})

@app.route("/tasks/<task_id>", methods=["PUT"])
@admin_required
def update_task(task_id):
    data = request.json
    now = datetime.utcnow()
    update_data = {
        "name": data.get("name"),
        "assignedTo": data.get("assignedTo"),
        "deadline": data.get("dueDate", data.get("deadline")),
        "dueDate": data.get("dueDate", data.get("deadline")),
        "teamId": data.get("teamId"),
        "status": data.get("status"),
        "tags": data.get("tags", []),
        "description": data.get("description", ""),
        "user": data.get("assignedTo", "").lower().split(' ')[0],
        "updatedAt": now
    }
    tasks_col.update_one({"_id": ObjectId(task_id)}, {"$set": update_data})

    task_doc = tasks_col.find_one({"_id": ObjectId(task_id)})
    task_doc["id"] = str(task_doc["_id"])
    del task_doc["_id"]
    task_doc["createdAt"] = task_doc.get("createdAt").isoformat() if task_doc.get("createdAt") else None
    task_doc["updatedAt"] = task_doc.get("updatedAt").isoformat() if task_doc.get("updatedAt") else None

    return jsonify({"status": "success", "task": task_doc})

@app.route("/tasks/<task_id>", methods=["DELETE"])
@admin_required
def delete_task(task_id):
    tasks_col.delete_one({"_id": ObjectId(task_id)})
    return jsonify({"status": "success"})

@app.route("/tasks/delete_batch", methods=["POST"])
@admin_required
def delete_batch():
    data = request.json
    task_ids = data.get("ids", [])
    if task_ids:
        object_ids = [ObjectId(tid) for tid in task_ids]
        tasks_col.delete_many({"_id": {"$in": object_ids}})
    return jsonify({"status": "success"})

# --- TEAMS ENDPOINTS ---

@app.route("/teams", methods=["GET"])
def get_teams():
    teams = []
    for t in teams_col.find():
        t["id"] = str(t["_id"])
        del t["_id"]
        teams.append(t)
    return jsonify({"status": "success", "teams": teams})

@app.route("/teams", methods=["POST"])
@admin_required
def add_team():
    data = request.json
    new_team = {
        "name": data.get("name"),
        "lead": data.get("lead"),
        "status": data.get("status", "Active"),
        "members": data.get("members", []),
        "tasks": data.get("tasks", [])
    }
    result = teams_col.insert_one(new_team)
    new_team["id"] = str(result.inserted_id)
    del new_team["_id"]
    return jsonify({"status": "success", "team": new_team})

@app.route("/teams/<team_id>", methods=["PUT"])
@admin_required
def update_team(team_id):
    data = request.json
    update_data = {
        "name": data.get("name"),
        "lead": data.get("lead"),
        "status": data.get("status"),
        "members": data.get("members", []),
        "tasks": data.get("tasks", [])
    }
    teams_col.update_one({"_id": ObjectId(team_id)}, {"$set": update_data})
    update_data["id"] = team_id
    return jsonify({"status": "success", "team": update_data})

@app.route("/teams/<team_id>", methods=["DELETE"])
@admin_required
def delete_team(team_id):
    teams_col.delete_one({"_id": ObjectId(team_id)})
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)