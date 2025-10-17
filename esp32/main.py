

import time
import network
import urequests
import json
from machine import Pin, SPI
from mfrc522 import MFRC522
import ntptime  # For time sync via NTP
import machine

# ===== Configuration =====
SSID = "NIGEL 9325"
PASSWORD = "nigel123"
BACKEND_URL = "http://192.168.137.1:5000/api/students/log-attendance"

# Time limits (24-hour format)
CHECKIN_DEADLINE = (9, 0)   # Before 09:00 → On Time; after → Late
CHECKOUT_START = (15, 0)    # After 15:00 → Check-Out allowed

# ===== Global Variables =====
scan_log = {}  # {uid: {"count": int, "last_date": "YYYY-MM-DD"}}

# ===== Hardware Setup =====
LED_PIN = 2  # Built-in LED (GPIO 2 on most ESP32 boards)
led = Pin(LED_PIN, Pin.OUT)
led.off()

# ===== Helper Functions =====
def get_local_time():
    try:
        t = time.localtime()
        return t
    except:
        return None

def format_time(t):
    return f"{t[3]:02d}:{t[4]:02d}"

def current_date_str():
    t = get_local_time()
    return f"{t[0]}-{t[1]:02d}-{t[2]:02d}"

def reset_daily_log():
    today = current_date_str()
    for uid in list(scan_log.keys()):
        if scan_log[uid]["last_date"] != today:
            del scan_log[uid]

# ===== Time Sync (with IST offset) =====
def sync_time_ist():
    try:
        ntptime.host = "in.pool.ntp.org"
        ntptime.settime()
        print("🕒 Time synchronized via NTP (UTC)")

        # Apply IST offset (UTC +5:30)
        t = time.time() + 19800  # 5 hours 30 minutes = 19800 seconds
        tm = time.localtime(t)
        machine.RTC().datetime((
            tm[0], tm[1], tm[2], tm[6] + 1, tm[3], tm[4], tm[5], 0
        ))
        print("🕒 Adjusted to Indian Standard Time (UTC+5:30)")
    except Exception as e:
        print("⚠️ NTP sync failed, using local RTC:", e)

# ===== WiFi Connection =====
def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, PASSWORD)
    
    print("Connecting to WiFi...")
    while not wlan.isconnected():
        time.sleep(1)
    
    print("✅ Connected! ESP32 IP:", wlan.ifconfig()[0])

    # Sync time with IST
    sync_time_ist()

# ===== RFID Setup =====
def setup_rfid():
    spi = SPI(1, baudrate=1000000, polarity=0, phase=0,
              sck=Pin(18), mosi=Pin(23), miso=Pin(19))
    rdr = MFRC522(spi, Pin(5, Pin.OUT), Pin(22, Pin.OUT))
    rdr.antenna_on()
    print("📡 RFID Reader Ready")
    return rdr

# ===== LED Blink Function =====
def blink_led(times=1, duration=0.3):
    """Blink built-in LED"""
    for _ in range(times):
        led.on()
        time.sleep(duration)
        led.off()
        time.sleep(0.2)

# ===== Attendance Classification =====
def classify_scan(uid):
    """Determine scan type and status"""
    t = get_local_time()
    hour, minute = t[3], t[4]
    date_str = current_date_str()

    if uid not in scan_log or scan_log[uid]["last_date"] != date_str:
        scan_log[uid] = {"count": 0, "last_date": date_str}

    count = scan_log[uid]["count"]

    if count >= 2:
        print("⚠️ Scan ignored — limit reached for today.")
        blink_led(3, 0.15)  # Blink fast 3 times for limit reached
        return None, None

    # Check-In logic
    if count == 0:
        if (hour, minute) <= CHECKIN_DEADLINE:
            status = "On-Time"
            blink_led(1, 0.5)
        else:
            status = "Late"
            blink_led(2, 0.3)
        scan_type = "Check-In"
    
    # Check-Out logic
    elif count == 1:
        if (hour, minute) >= CHECKOUT_START:
            status = "Checked-Out"
            scan_type = "Check-Out"
            blink_led(1, 0.5)
        else:
            print("⏱️ Too early to check out.")
            blink_led(2, 0.1)
            return None, None
    
    scan_log[uid]["count"] += 1
    return scan_type, status

# ===== Send to Backend =====
def send_rfid_to_backend(uid, scan_type, status):
    try:
        headers = {"Content-Type": "application/json"}
        payload = {
            "rfidTag": uid,
            "scanType": scan_type,
            "status": status,
            "timestamp": format_time(get_local_time())
        }

        print(f"📤 Sending {scan_type} ({status}) for {uid} to backend...")
        response = urequests.post(BACKEND_URL, json=payload, headers=headers)
        
        try:
            response_data = response.json()
            print(f"📥 Response: {response_data.get('message', 'Success')}")
        except:
            print(f"📥 Response: {response.text}")
            
        response.close()
        return True
    except Exception as e:
        print(f"❌ Error sending to backend: {e}")
        blink_led(3, 0.2)
        return False

# ===== Main Application =====
def main():
    connect_wifi()
    rdr = setup_rfid()
    print("✅ System Ready - Place your RFID card...")

    last_scan_time = 0

    while True:
        reset_daily_log()
        (stat, tag_type) = rdr.request(rdr.REQIDL)
        
        if stat == rdr.OK:
            (stat, raw_uid) = rdr.anticoll()
            if stat == rdr.OK:
                uid = "%02x%02x%02x%02x" % tuple(raw_uid[:4])
                uid = uid.upper()

                current_time = time.time()
                if current_time - last_scan_time > 2:
                    print(f"🔑 Card detected: {uid}")
                    scan_type, status = classify_scan(uid)
                    if scan_type and status:
                        send_rfid_to_backend(uid, scan_type, status)
                    last_scan_time = current_time
                else:
                    print("⏱️ Scan ignored (cooldown period)")
                
                time.sleep(2)
        time.sleep(0.1)

if __name__ == "__main__":
    main()

