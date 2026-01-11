# 🔌 TinyTuya Setup Guide — Crompton Bulb Credentials

This guide walks you through extracting the Device ID, Local Key, and IP Address from your Crompton smart bulb.

---

## Prerequisites

- Your Crompton bulb connected to **MyCrompton** or **Smart Life** app
- Python installed on your PC
- Both PC and bulb on the same WiFi network

---

## Step 1: Create Tuya IoT Developer Account

1. Go to [iot.tuya.com](https://iot.tuya.com)
2. Click **"Create Developer Account"**
3. Verify email and complete profile

---

## Step 2: Create a Cloud Project

1. Go to **Cloud → Development → Create Cloud Project**
2. Fill in:
   - **Project Name**: `Study Streak Bulb`
   - **Industry**: `Smart Home`
   - **Development Method**: `Smart Home`
   - **Data Center**: `India` (or your region)
3. Click **Create**

---

## Step 3: Link Your Smart Life App

1. In your project, go to **Devices → Link Tuya App Account**
2. Click **Add App Account**
3. A QR code appears
4. Open **Smart Life** app (or MyCrompton if it supports linking)
5. Go to **Profile → Scan QR Code** (top right)
6. Scan the QR code from Tuya IoT website
7. Your devices now appear in the Tuya IoT dashboard

---

## Step 4: Get API Keys

1. Go to **Cloud → Development → Your Project**
2. Click on your project
3. Go to **Overview** tab
4. Copy:
   - **Access ID** (also called Client ID)
   - **Access Secret** (also called Client Secret)

Save these — you'll need them for TinyTuya.

---

## Step 5: Run TinyTuya Wizard

Open terminal in your project folder:

```bash
cd "c:\Users\harik\OneDrive\Desktop\Side Hustles\Bulb"
python -m tinytuya wizard
```

The wizard will ask:

```
Enter API Key from tuya.com: [paste Access ID]
Enter API Secret from tuya.com: [paste Access Secret]
Enter Device ID to scan (or 'scan' for all): scan
```

---

## Step 6: Get Device Credentials

TinyTuya will output something like:

```
Polling Tuya Cloud for devices...

Device: Crompton Smart Bulb
    ID: bf1234567890abcdef
    IP: 192.168.1.105
    Key: abc123def456789
    Version: 3.3
```

Copy these values!

---

## Step 7: Update config.json

Edit `config.json` with your credentials:

```json
{
  "bulb": {
    "device_id": "bf1234567890abcdef",
    "local_key": "abc123def456789",
    "ip": "192.168.1.105"
  }
}
```

---

## Step 8: Test Connection

```bash
python bulb_controller.py
```

If successful, you'll see:
```
✅ Connected to bulb at 192.168.1.105
--- Testing streak = 0 ---
💡 Bulb color set to RGB(255, 0, 0)
```

Your bulb should turn **red**! 🔴

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Device not found" | Ensure bulb is on same WiFi as PC |
| "Invalid key" | Re-run wizard, key may have changed |
| "Connection timeout" | Check if bulb IP is correct, try static IP in router |
| "Protocol error" | Try changing `set_version(3.3)` to `3.1` or `3.4` in `bulb_controller.py` |

---

## Pro Tip: Static IP

Assign a static IP to your bulb in your router settings. This prevents the IP from changing and breaking the connection.

---

**Time to complete:** ~10 minutes
