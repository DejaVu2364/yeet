"""
Study Streak Tracker
Tracks daily study time and calculates consecutive successful days.
Success = studying >= 2 hours/day
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
STUDY_LOG_PATH = DATA_DIR / "study_log.json"


def _load_config():
    """Load configuration from config.json"""
    config_path = Path(__file__).parent / "config.json"
    with open(config_path, "r") as f:
        return json.load(f)


def _load_study_log():
    """Load study log from JSON file"""
    if not STUDY_LOG_PATH.exists():
        return {}
    with open(STUDY_LOG_PATH, "r") as f:
        return json.load(f)


def _save_study_log(log: dict):
    """Save study log to JSON file"""
    DATA_DIR.mkdir(exist_ok=True)
    with open(STUDY_LOG_PATH, "w") as f:
        json.dump(log, f, indent=2)


def log_day(date: str, minutes: int) -> dict:
    """
    Record study minutes for a specific date.
    
    Args:
        date: Date string in YYYY-MM-DD format
        minutes: Total study minutes for the day
    
    Returns:
        dict with success status and updated streak
    """
    config = _load_config()
    log = _load_study_log()
    
    threshold = config.get("success_threshold_minutes", 120)
    success = minutes >= threshold
    
    log[date] = {
        "minutes": minutes,
        "success": success,
        "logged_at": datetime.now().isoformat()
    }
    
    _save_study_log(log)
    
    streak = calculate_streak()
    
    return {
        "date": date,
        "minutes": minutes,
        "success": success,
        "threshold": threshold,
        "current_streak": streak
    }


def is_day_successful(date: str) -> bool:
    """Check if a specific date met the study threshold"""
    log = _load_study_log()
    if date not in log:
        return False
    return log[date].get("success", False)


def calculate_streak() -> int:
    """
    Calculate the current streak of consecutive successful days.
    Counts backwards from yesterday (today is still in progress).
    
    Returns:
        Number of consecutive successful days
    """
    config = _load_config()
    log = _load_study_log()
    reset_hour = config.get("streak_reset_hour", 4)
    
    # Determine "today" based on reset hour (4 AM default)
    now = datetime.now()
    if now.hour < reset_hour:
        # Before 4 AM, we're still on "yesterday"
        today = (now - timedelta(days=1)).date()
    else:
        today = now.date()
    
    streak = 0
    check_date = today
    
    # If today has a successful entry, count it
    today_str = check_date.strftime("%Y-%m-%d")
    if today_str in log and log[today_str].get("success", False):
        streak = 1
        check_date = check_date - timedelta(days=1)
    
    # Count consecutive successful days backwards
    while True:
        date_str = check_date.strftime("%Y-%m-%d")
        if date_str in log and log[date_str].get("success", False):
            streak += 1
            check_date = check_date - timedelta(days=1)
        else:
            break
    
    return streak


def get_streak_color(streak: int) -> dict:
    """
    Get the RGB color for the current streak level.
    
    Color progression:
    - 0 days: Red (streak broken)
    - 1-4 days: Yellow (building)
    - 5-15 days: Green (momentum)
    - 16-21 days: Cyan (almost there)
    - 22+ days: Purple (habit formed!)
    """
    config = _load_config()
    colors = config.get("streak_colors", {})
    
    # Find the appropriate color tier
    thresholds = sorted([int(k) for k in colors.keys()], reverse=True)
    
    for threshold in thresholds:
        if streak >= threshold:
            return colors[str(threshold)]
    
    # Default to red if no match
    return {"r": 255, "g": 0, "b": 0}


def get_status() -> dict:
    """Get current streak status summary"""
    streak = calculate_streak()
    color = get_streak_color(streak)
    log = _load_study_log()
    
    # Get today's study time if available
    today = datetime.now().strftime("%Y-%m-%d")
    today_minutes = log.get(today, {}).get("minutes", 0)
    
    return {
        "current_streak": streak,
        "color": color,
        "today_minutes": today_minutes,
        "habit_milestone": 22,
        "days_to_habit": max(0, 22 - streak)
    }


if __name__ == "__main__":
    # Quick test
    status = get_status()
    print(f"Current Streak: {status['current_streak']} days")
    print(f"Color: RGB({status['color']['r']}, {status['color']['g']}, {status['color']['b']})")
    print(f"Days to habit: {status['days_to_habit']}")
