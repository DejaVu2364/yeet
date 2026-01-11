"""
Crompton Smart Bulb Controller
Uses TinyTuya for local LAN control of Tuya-based Crompton bulbs.
"""

import json
import time
from pathlib import Path

try:
    import tinytuya
    TINYTUYA_AVAILABLE = True
except ImportError:
    TINYTUYA_AVAILABLE = False
    print("⚠️  TinyTuya not installed. Run: pip install tinytuya")


def _load_config():
    """Load configuration from config.json"""
    config_path = Path(__file__).parent / "config.json"
    with open(config_path, "r") as f:
        return json.load(f)


class BulbController:
    """Controller for Crompton/Tuya smart bulb"""
    
    def __init__(self):
        config = _load_config()
        bulb_config = config.get("bulb", {})
        
        self.device_id = bulb_config.get("device_id", "")
        self.local_key = bulb_config.get("local_key", "")
        self.ip = bulb_config.get("ip", "")
        self.device = None
        
        if not TINYTUYA_AVAILABLE:
            print("❌ TinyTuya not available. Bulb control disabled.")
            return
        
        if self.device_id == "YOUR_DEVICE_ID":
            print("⚠️  Bulb not configured. Update config.json with your device credentials.")
            return
        
        self._connect()
    
    def _connect(self):
        """Establish connection to the bulb"""
        if not TINYTUYA_AVAILABLE:
            return
        
        try:
            self.device = tinytuya.BulbDevice(
                dev_id=self.device_id,
                address=self.ip,
                local_key=self.local_key
            )
            self.device.set_version(3.3)  # Most Crompton bulbs use protocol 3.3
            print(f"✅ Connected to bulb at {self.ip}")
        except Exception as e:
            print(f"❌ Failed to connect to bulb: {e}")
            self.device = None
    
    def set_color(self, r: int, g: int, b: int):
        """
        Set bulb to specific RGB color.
        
        Args:
            r: Red (0-255)
            g: Green (0-255)
            b: Blue (0-255)
        """
        if not self.device:
            print(f"🎨 [SIMULATION] Setting color to RGB({r}, {g}, {b})")
            return False
        
        try:
            # TinyTuya uses HSV internally, but set_colour handles RGB
            self.device.set_colour(r, g, b)
            print(f"💡 Bulb color set to RGB({r}, {g}, {b})")
            return True
        except Exception as e:
            print(f"❌ Failed to set color: {e}")
            return False
    
    def turn_on(self):
        """Turn the bulb on"""
        if not self.device:
            print("🔆 [SIMULATION] Turning bulb ON")
            return False
        
        try:
            self.device.turn_on()
            return True
        except Exception as e:
            print(f"❌ Failed to turn on: {e}")
            return False
    
    def turn_off(self):
        """Turn the bulb off"""
        if not self.device:
            print("🌑 [SIMULATION] Turning bulb OFF")
            return False
        
        try:
            self.device.turn_off()
            return True
        except Exception as e:
            print(f"❌ Failed to turn off: {e}")
            return False
    
    def pulse_color(self, r: int, g: int, b: int, pulses: int = 3, duration: float = 0.5):
        """
        Create a pulsing effect with the specified color.
        Used for milestone celebrations.
        
        Args:
            r, g, b: RGB color values
            pulses: Number of pulse cycles
            duration: Duration of each pulse phase in seconds
        """
        if not self.device:
            print(f"✨ [SIMULATION] Pulsing RGB({r}, {g}, {b}) x{pulses}")
            return
        
        try:
            for _ in range(pulses):
                self.set_color(r, g, b)
                time.sleep(duration)
                # Dim to 20% brightness
                self.device.set_brightness(50)
                time.sleep(duration)
                self.device.set_brightness(255)
            print(f"✨ Pulse effect complete!")
        except Exception as e:
            print(f"❌ Pulse effect failed: {e}")
    
    def update_from_streak(self, streak: int, celebrate_milestone: bool = False):
        """
        Update bulb color based on current streak.
        
        Args:
            streak: Current streak count
            celebrate_milestone: If True, play pulse animation for milestones
        """
        from streak_tracker import get_streak_color
        
        color = get_streak_color(streak)
        r, g, b = color["r"], color["g"], color["b"]
        
        # Milestone celebrations
        milestones = [5, 16, 22]
        if celebrate_milestone and streak in milestones:
            print(f"🎉 Milestone reached: {streak} days!")
            self.pulse_color(r, g, b, pulses=5)
        
        self.set_color(r, g, b)
        
        # Log the streak level
        if streak == 0:
            print("😢 Streak broken. Room shame mode activated.")
        elif streak < 5:
            print(f"🌱 Building momentum: {streak} day(s)")
        elif streak < 16:
            print(f"🔥 On a roll: {streak} days!")
        elif streak < 22:
            print(f"⭐ Almost there: {streak} days! Just {22 - streak} to habit!")
        else:
            print(f"👑 HABIT FORMED: {streak} days! You're unstoppable!")


def test_colors():
    """Test all streak color levels"""
    bulb = BulbController()
    
    test_streaks = [0, 1, 5, 16, 22, 30]
    
    for streak in test_streaks:
        print(f"\n--- Testing streak = {streak} ---")
        bulb.update_from_streak(streak)
        time.sleep(2)


if __name__ == "__main__":
    print("🔌 Testing Bulb Controller...")
    test_colors()
