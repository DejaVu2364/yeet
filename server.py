"""
Exam Score Bulb - Web Server
Serves the visual web app and optionally controls smart bulb
"""

import json
from pathlib import Path
from flask import Flask, request, jsonify, render_template
from bulb_controller import BulbController

# --- Configuration ---
CONFIG_PATH = Path("config.json")
with open(CONFIG_PATH, "r") as f:
    config = json.load(f)

PORT = config.get("server_port", 5555)
app = Flask(__name__, template_folder='templates', static_folder='static')
bulb = BulbController()

# --- Routes ---

@app.route("/")
def home():
    """Serves the viral web visualizer."""
    return render_template("index.html")

@app.route("/api/set-color", methods=["POST"])
def set_color():
    """Receives color from web app and syncs to bulb."""
    data = request.json
    try:
        r, g, b = data['r'], data['g'], data['b']
        bulb.set_color(r, g, b)
        return jsonify({"status": "success", "color": f"rgb({r},{g},{b})"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/record-score", methods=["POST"])
def record_score():
    """Records a new score and returns history/delta context."""
    try:
        data = request.json
        # Structure: {timestamp, exam, score, total, percentage}
        
        history_file = Path("data/score_history.json")
        history = []
        if history_file.exists():
            with open(history_file, "r") as f:
                history = json.load(f)
        
        # Append new score
        history.append(data)
        
        # Keep last 100 entries to prevent infinite growth
        if len(history) > 100:
            history = history[-100:]
            
        with open(history_file, "w") as f:
            json.dump(history, f, indent=2)

        # Calculate context (Delta & Previous Scores)
        exam_type = data.get('exam')
        exam_history = [h for h in history if h.get('exam') == exam_type]
        
        # We need the one BEFORE the current one we just added
        previous_entry = None
        if len(exam_history) >= 2:
            previous_entry = exam_history[-2]
            
        return jsonify({
            "status": "success", 
            "previous": previous_entry,
            "history": exam_history[-5:] # Last 5 for sparkline
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/status", methods=["GET"])
def status():
    """Health check."""
    bulb_ip = config.get("bulb", {}).get("ip", "not configured")
    return jsonify({"status": "online", "bulb_ip": bulb_ip})

# --- User Authentication ---
USERS_FILE = Path("data/users.json")

def load_users():
    if USERS_FILE.exists():
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    return {}

def save_users(users):
    USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

@app.route("/api/login", methods=["POST"])
def login():
    """Handle username login. Creates new user or returns existing."""
    from datetime import datetime, timezone
    try:
        data = request.json
        username = data.get("username", "").strip().lower()
        
        if not username or len(username) < 2:
            return jsonify({"status": "error", "message": "Username too short (min 2 chars)"}), 400
        
        users = load_users()
        now = datetime.now(timezone.utc).isoformat()
        
        if username in users:
            # Existing user - calculate days since last login
            last_login_str = users[username].get("last_login", now)
            last_login = datetime.fromisoformat(last_login_str.replace('Z', '+00:00'))
            days_since = (datetime.now(timezone.utc) - last_login).days
            
            # Update last login
            users[username]["last_login"] = now
            save_users(users)
            
            return jsonify({
                "status": "success",
                "isNewUser": False,
                "daysSince": days_since,
                "user": users[username]
            }), 200
        else:
            # New user
            users[username] = {
                "created_at": now,
                "last_login": now,
                "scores": []
            }
            save_users(users)
            
            return jsonify({
                "status": "success",
                "isNewUser": True,
                "daysSince": 0,
                "user": users[username]
            }), 200
            
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/record-score/<username>", methods=["POST"])
def record_score_user(username):
    """Records a score for a specific user."""
    try:
        data = request.json
        users = load_users()
        
        if username not in users:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        # Append score to user's history
        users[username]["scores"].append(data)
        
        # Keep last 50 scores per user
        if len(users[username]["scores"]) > 50:
            users[username]["scores"] = users[username]["scores"][-50:]
        
        save_users(users)
        
        # Get history for this exam type
        exam_type = data.get("exam")
        exam_history = [s for s in users[username]["scores"] if s.get("exam") == exam_type]
        
        previous_entry = None
        if len(exam_history) >= 2:
            previous_entry = exam_history[-2]
        
        return jsonify({
            "status": "success",
            "previous": previous_entry,
            "history": exam_history[-5:]
        }), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/onboarding/<username>", methods=["POST"])
def save_onboarding(username):
    """Save onboarding questionnaire data."""
    try:
        data = request.json
        users = load_users()
        
        if username not in users:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        # Save onboarding data
        users[username]["exam"] = data.get("exam", "")
        users[username]["total_marks"] = data.get("total_marks", 800)
        users[username]["goal"] = data.get("goal", 0)
        users[username]["exam_date"] = data.get("exam_date", "")
        users[username]["onboarded"] = True
        
        # Generate anonymous display name if not already set
        if "display_name" not in users[username]:
            import random
            users[username]["display_name"] = f"Grinder_{random.randint(1000, 9999)}"
        
        save_users(users)
        
        return jsonify({
            "status": "success",
            "user": users[username]
        }), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    """Get top 10 grinders by weekly average score."""
    from datetime import datetime, timezone, timedelta
    try:
        users = load_users()
        one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        
        leaderboard = []
        for username, user_data in users.items():
            scores = user_data.get("scores", [])
            
            # Filter scores from last 7 days
            weekly_scores = []
            for s in scores:
                try:
                    ts = datetime.fromisoformat(s.get("timestamp", "").replace('Z', '+00:00'))
                    if ts > one_week_ago:
                        weekly_scores.append(s.get("percentage", 0))
                except:
                    pass
            
            if weekly_scores:
                avg = sum(weekly_scores) / len(weekly_scores)
                leaderboard.append({
                    "display_name": user_data.get("display_name", f"Grinder_{hash(username) % 10000}"),
                    "weekly_avg": round(avg, 1),
                    "scores_count": len(weekly_scores)
                })
        
        # Sort by weekly average (descending)
        leaderboard.sort(key=lambda x: x["weekly_avg"], reverse=True)
        
        return jsonify({
            "status": "success",
            "leaderboard": leaderboard[:10]  # Top 10
        }), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- Study Session Tracking ---
@app.route("/api/session/start/<username>", methods=["POST"])
def start_session(username):
    """Start a study session."""
    from datetime import datetime, timezone
    try:
        users = load_users()
        if username not in users:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        users[username]["current_session"] = {
            "start_time": datetime.now(timezone.utc).isoformat()
        }
        save_users(users)
        
        return jsonify({"status": "success", "message": "Session started"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/session/end/<username>", methods=["POST"])
def end_session(username):
    """End a study session and save duration."""
    from datetime import datetime, timezone
    try:
        data = request.json
        users = load_users()
        
        if username not in users:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        current = users[username].get("current_session")
        if not current:
            return jsonify({"status": "error", "message": "No active session"}), 400
        
        start_time = datetime.fromisoformat(current["start_time"].replace('Z', '+00:00'))
        end_time = datetime.now(timezone.utc)
        duration_mins = int((end_time - start_time).total_seconds() / 60)
        pomodoros = data.get("pomodoros", 0)
        
        # Initialize study_sessions if needed
        if "study_sessions" not in users[username]:
            users[username]["study_sessions"] = []
        
        # Add session
        today = end_time.strftime("%Y-%m-%d")
        users[username]["study_sessions"].append({
            "date": today,
            "duration_mins": duration_mins,
            "pomodoros": pomodoros
        })
        
        # Clear current session
        users[username]["current_session"] = None
        save_users(users)
        
        return jsonify({
            "status": "success",
            "duration_mins": duration_mins,
            "pomodoros": pomodoros
        }), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/study-history/<username>", methods=["GET"])
def get_study_history(username):
    """Get last 7 days of study data for dot graph + streak."""
    from datetime import datetime, timezone, timedelta
    try:
        users = load_users()
        if username not in users:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        sessions = users[username].get("study_sessions", [])
        today = datetime.now(timezone.utc).date()
        
        # Build 7-day history
        history = []
        streak = 0
        for i in range(7):
            day = today - timedelta(days=6-i)
            day_str = day.strftime("%Y-%m-%d")
            day_sessions = [s for s in sessions if s.get("date") == day_str]
            total_mins = sum(s.get("duration_mins", 0) for s in day_sessions)
            history.append({
                "date": day_str,
                "day_name": day.strftime("%a"),
                "duration_mins": total_mins,
                "dots": min(8, total_mins // 15)  # Each dot = 15 mins, max 8
            })
        
        # Calculate streak (consecutive days with >0 study)
        for i in range(len(history) - 1, -1, -1):
            if history[i]["duration_mins"] > 0:
                streak += 1
            else:
                break
        
        return jsonify({
            "status": "success",
            "history": history,
            "streak": streak
        }), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def main():
    print(f"\n╔═══════════════════════════════════════════════════════════╗")
    print(f"║           🎓 EXAM SCORE BULB - WEB SERVER                 ║")
    print(f"╠═══════════════════════════════════════════════════════════╣")
    print(f"║  Open: http://localhost:{PORT}                             ║")
    print(f"╚═══════════════════════════════════════════════════════════╝\n")
    
    app.run(host="0.0.0.0", port=PORT, debug=True)

if __name__ == "__main__":
    main()
