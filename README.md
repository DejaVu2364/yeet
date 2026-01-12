# Yeet 💀

**A study tracker for students who need a little roasting to stay motivated.**

Built by a med student, for students grinding exams at 2am.

## ✨ Features

- 📊 **Score Tracking** — Track exam scores with trend visualization
- 🔥 **50+ Rotating Comments** — Get roasted or celebrated based on your score
- 🍅 **Pomodoro Timer** — 25-minute focus sessions
- 📈 **Weekly Comparison** — See +/-% vs last week
- 🏆 **Day Streak** — Build habits with 22-day milestone
- 💡 **Smart Bulb Integration** — Optional: sync your room light to your score

## 🚀 Quick Start

### Live Demo
Try it at: [yeet.study](https://yeet.study)

### Run Locally

```bash
# Clone
git clone https://github.com/DejaVu2364/yeet.git
cd yeet

# Install
pip install -r requirements.txt

# Run
python server.py
```

Open `http://localhost:5555`

## 🎨 Score Feedback Tiers

| Score | Vibe | Example Comment |
|-------|------|-----------------|
| 0-39% | 💀 Critical | "bruh... we need to talk 😬" |
| 40-59% | 😅 Below | "mid but make it motivational 🚀" |
| 60-74% | 📚 Okay | "not bad, keep grinding 📚" |
| 75-89% | 🔥 Good | "you're cooking fr 🍳" |
| 90-100% | 🏆 Excellent | "literally cracked at this 🥚💥" |

## 🌈 Streak Colors

| Days | Color | Meaning |
|------|-------|---------|
| 0 | 🔴 Red | Streak broken |
| 1-4 | 🟡 Yellow | Building |
| 5-15 | 🟢 Green | Momentum |
| 16-21 | 🩵 Cyan | Almost there |
| **22+** | 🟣 **Purple** | **Habit formed!** |

## 💡 Smart Bulb Integration (Optional)

Yeet can sync your room light color to your study streak!

When enabled:
- 🔴 Red room = streak broken (shame mode)
- 🟣 Purple room = 22+ day streak (you're a legend)

See [SMART_BULB_SETUP.md](SMART_BULB_SETUP.md) for setup instructions.

## 📁 Project Structure

```
yeet/
├── server.py            # Flask backend
├── static/
│   ├── script.js        # Frontend logic
│   └── style.css        # Styling
├── templates/
│   └── index.html       # Main UI
├── data/
│   └── users.json       # User data
└── requirements.txt
```

## ☕ Support

If this helped you study, consider supporting:

[chai4.me/keepyeeting](https://www.chai4.me/keepyeeting)

---

**Built with 💙 by a student, for students.**
