# 💡 Smart Bulb Integration

Yeet can optionally sync your room light color to your study streak, creating an ambient feedback system.

## How It Works

Your room becomes a visual reminder:
- 🔴 **Red** = Streak broken (time to get back on track)
- 🟡 **Yellow** = 1-4 days (building momentum)
- 🟢 **Green** = 5-15 days (you're in the zone)
- 🩵 **Cyan** = 16-21 days (almost there!)
- 🟣 **Purple** = 22+ days (habit formed!)

## Supported Bulbs

Most WiFi smart bulbs that work with common smart home platforms are supported:
- Bulbs using the Smart Life app
- Other WiFi-enabled RGB bulbs

## Setup Requirements

1. A WiFi-enabled RGB smart bulb
2. Bulb connected to your local network
3. Bulb credentials (Device ID, Local Key, IP Address)

## Configuration

Edit `config.json` with your bulb credentials:

```json
{
  "bulb": {
    "device_id": "YOUR_DEVICE_ID",
    "local_key": "YOUR_LOCAL_KEY",
    "ip": "192.168.1.XXX"
  }
}
```

## Getting Your Credentials

Most smart bulbs use cloud platforms. To get local control credentials:

1. Create a developer account on your bulb's IoT platform
2. Link your smart home app to the developer platform
3. Use discovery tools to extract local credentials
4. Add credentials to `config.json`

## Enabling Sync

In the Yeet app:
1. Toggle "Sync Bulb" when entering scores
2. Your bulb will change color based on your streak

## Note

The smart bulb feature works best when:
- Your PC and bulb are on the same WiFi network
- You've assigned a static IP to your bulb (recommended)

---

**Pro Tip:** Assign a static IP to your bulb in your router settings to prevent connection issues.
