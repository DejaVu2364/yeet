# 🎓 Study Streak Bulb

**Your room roasts you when you don't study.**

A smart bulb that changes color based on your study streak — powered by habit formation psychology.

## 🌈 Color Progression

| Streak | Color | Meaning |
|--------|-------|---------|
| 0 days | 🔴 Red | Streak broken |
| 1-4 days | 🟡 Yellow | Building |
| 5-15 days | 🟢 Green | Momentum |
| 16-21 days | 🩵 Cyan | Almost there |
| **22+ days** | 🟣 **Purple** | **HABIT FORMED!** |

## 🧠 The Psychology

- **Environment Design** — Your room becomes a feedback system
- **Loss Aversion** — Red light triggers shame, motivating consistency  
- **Identity Reinforcement** — Purple light = "I am someone who studies"
- **Immediate Feedback** — No waiting for exam results

## 📦 Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Get Bulb Credentials (Tuya)

Your Crompton bulb uses Tuya. You need:
- Device ID
- Local Key  
- IP Address

**Quick Setup:**
1. Create free account at [iot.tuya.com](https://iot.tuya.com)
2. Add your bulb to Smart Life app
3. Link Smart Life to Tuya IoT Platform
4. Run: `python -m tinytuya wizard`
5. Copy credentials to `config.json`

### 3. Configure

Edit `config.json`:

```json
{
  "bulb": {
    "device_id": "YOUR_DEVICE_ID",
    "local_key": "YOUR_LOCAL_KEY",
    "ip": "192.168.1.XXX"
  }
}
```

### 4. Start Server

```bash
python server.py
```

Server runs on `http://0.0.0.0:5555`

## 📱 Android Setup (MacroDroid)

1. Install **MacroDroid** from Play Store
2. Create new macro:
   - **Trigger**: Time = 4:00 AM (or your preferred reset time)
   - **Action**: HTTP Request
     - URL: `http://YOUR_PC_IP:5555/log`
     - Method: POST
     - Body: `{"date": "{date}", "minutes": {app_usage_minutes}}`

MacroDroid can track app usage natively — no root needed.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/log` | Log daily study minutes |
| `GET` | `/status` | Get current streak |
| `POST` | `/sync` | Force sync bulb color |
| `POST` | `/test` | Test with specific streak |

### Example: Log Study Time

```bash
curl -X POST http://localhost:5555/log \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-01-08", "minutes": 145}'
```

### Example: Test Purple (22-day streak)

```bash
curl -X POST http://localhost:5555/test \
  -H "Content-Type: application/json" \
  -d '{"streak": 22}'
```

## 📁 Project Structure

```
study-streak-bulb/
├── config.json          # Bulb credentials & settings
├── server.py            # Webhook server
├── streak_tracker.py    # Streak calculation logic
├── bulb_controller.py   # TinyTuya bulb control
├── requirements.txt     # Python dependencies
├── data/
│   └── study_log.json   # Daily study records
└── README.md
```

## 🎯 Success Criteria

**Study ≥ 2 hours/day = streak continues**

The 2-hour threshold is based on deliberate practice research. Adjust in `config.json` if needed:

```json
"success_threshold_minutes": 120
```

## 🚀 Quick Test

```bash
# Test streak = 0 (red)
curl -X POST localhost:5555/test -d '{"streak": 0}'

# Test streak = 22 (purple celebration!)
curl -X POST localhost:5555/test -d '{"streak": 22}'
```

---

**Built for medical students who need ambient accountability.** 🩺
