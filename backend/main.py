from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psutil
import subprocess
import socket

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hackathon demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_android_devices():
    devices = []
    try:
        out = subprocess.check_output(["adb", "devices"], encoding="utf-8", errors="ignore")
        lines = [l.strip() for l in out.splitlines()]
        for l in lines[1:]:
            if l and "device" in l:
                serial = l.split()[0]
                try:
                    model = subprocess.check_output(
                        ["adb", "-s", serial, "shell", "getprop", "ro.product.model"],
                        encoding="utf-8", errors="ignore"
                    ).strip()
                except Exception:
                    model = serial
                devices.append({"serial": serial, "name": model})
    except Exception:
        pass
    return devices

def get_windows_drives():
    drives = []
    for p in psutil.disk_partitions(all=False):
        try:
            # Replace single backslash with double backslash for wmic
            device_id = p.device.replace("\\", "\\\\")
            out = subprocess.check_output(
                ["wmic", "logicaldisk", f"where DeviceID='{device_id}'", "get", "VolumeName"],
                encoding="utf-8", errors="ignore"
            )
            lines = [l.strip() for l in out.splitlines() if l.strip()]
            # Second line usually contains the volume name
            name = lines[1] if len(lines) > 1 else p.device
        except Exception:
            name = p.device
        drives.append({
            "device": p.device,
            "mountpoint": p.mountpoint,
            "fstype": p.fstype,
            "name": name
        })
    return drives



@app.get("/devices")
def list_devices():
    # First, check for Android phones
    phones = get_android_devices()
    if phones:
        return {"phones": phones}

    # If no phones, get Windows drives
    drives = get_windows_drives()
    # Also get Windows PC name
    try:
        pc_name = socket.gethostname()
    except Exception:
        pc_name = "Windows PC"

    return {
        "pc_name": pc_name,
        "drives": drives
    }
