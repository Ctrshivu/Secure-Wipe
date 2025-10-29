from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psutil
import subprocess
import os
import shutil
import tempfile
from urllib.parse import unquote

app = FastAPI()

# Allow all CORS (frontend–backend communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Utility Functions ----------------

def run_adb_command(serial, command):
    """Safely execute ADB commands"""
    try:
        result = subprocess.run(
            ["adb", "-s", serial, "shell"] + command.split(),
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.stdout.strip()
    except Exception as e:
        return f"ADB Error: {e}"

def get_windows_drives():
    """List connected Windows drives"""
    drives = []
    for part in psutil.disk_partitions(all=False):
        drives.append({
            "device": part.device,
            "mountpoint": part.mountpoint,
            "fstype": part.fstype,
            "name": os.path.basename(part.device) or part.device,
        })
    return drives

def get_android_devices():
    """Detect connected Android devices using ADB"""
    try:
        result = subprocess.run(
            ["adb", "devices", "-l"], capture_output=True, text=True
        )
        lines = result.stdout.strip().split("\n")
        devices = []

        for line in lines[1:]:
            if not line.strip():
                continue

            parts = line.split()
            serial = parts[0]
            name = "Android Device"
            status = parts[1].strip().lower() if len(parts) > 1 else "unknown"

            for p in parts:
                if p.startswith("model:"):
                    name = p.split(":", 1)[1]

            # Determine connection state
            if status == "device":
                adb_status = "debugging_on"
                details = "✅ USB Debugging enabled and authorized"
            elif status == "unauthorized":
                adb_status = "debugging_off"
                details = "⚠️ USB Debugging detected but not authorized. Allow access on phone."
            elif status == "offline":
                adb_status = "offline"
                details = "⚠️ Device connected but ADB offline — reconnect or check cable"
            else:
                adb_status = "not_detected"
                details = "🔌 Device connected but USB Debugging disabled"

            devices.append({
                "serial": serial,
                "name": name,
                "adb_status": adb_status,
                "details": details,
            })

        return devices
    except Exception as e:
        print("ADB error:", e)
        return []


# ---------------- Routes ----------------

@app.get("/devices")
def get_devices():
    """Return all connected devices and drives"""
    return {
        "phones": get_android_devices(),
        "pc_name": os.getenv("COMPUTERNAME") or "My-PC",
        "drives": get_windows_drives(),
    }


@app.post("/wipe/safe/{device_id}")
def safe_wipe(device_id: str):
    """
    Safe wipe:
    - On Android → clears cache/data
    - On Windows → clears temp directory
    """
    device_id = unquote(device_id)

    # Android Safe Wipe
    if not os.path.exists(device_id) and len(device_id) > 5:
        output = run_adb_command(device_id, "pm clear-all")
        return {
            "status": "success",
            "message": f"Safe wipe (Android) completed on {device_id}",
            "details": output,
            "deleted_files": [],
        }

    # Windows Safe Wipe
    temp_dir = tempfile.gettempdir()
    removed = []
    for root, dirs, files in os.walk(temp_dir):
        for f in files:
            try:
                file_path = os.path.join(root, f)
                os.remove(file_path)
                removed.append(file_path)
            except Exception:
                pass

    return {
        "status": "success",
        "message": f"Safe wipe completed on {device_id} — cleared {len(removed)} files",
        "files_deleted": len(removed),
        "deleted_files": removed,  # ✅ Return ALL deleted files, not limited to 10
    }


@app.post("/wipe/full/{device_id}")
def full_wipe(device_id: str):
    """
    Full wipe:
    - On Android → deletes all user data
    - On Windows → deletes all files from selected drive
    """
    device_id = unquote(device_id)

    # Android Full Wipe
    if not os.path.exists(device_id) and len(device_id) > 5:
        output = run_adb_command(device_id, "rm -rf /sdcard/*")
        return {
            "status": "success",
            "message": f"Full destructive wipe (Android) completed on {device_id}",
            "details": output,
            "deleted_files": [],
        }

    # Windows Full Wipe
    if not os.path.exists(device_id):
        return {"status": "error", "message": f"Path {device_id} does not exist."}

    deleted = []
    for root, dirs, files in os.walk(device_id, topdown=False):
        for f in files:
            path = os.path.join(root, f)
            try:
                os.chmod(path, 0o777)
                os.remove(path)
                deleted.append(path)
            except Exception:
                pass

        for d in dirs:
            try:
                shutil.rmtree(os.path.join(root, d), ignore_errors=True)
                deleted.append(os.path.join(root, d))
            except Exception:
                pass

    return {
        "status": "success",
        "message": f"Full destructive wipe completed on {device_id} — deleted {len(deleted)} items",
        "files_deleted": len(deleted),
        "deleted_files": deleted,  # ✅ Return ALL deleted files
    }


@app.get("/verify/{device_id}")
def verify_wipe(device_id: str):
    """Check if any files remain after a wipe"""
    device_id = unquote(device_id)
    files = []
    try:
        for root, dirs, fs in os.walk(device_id):
            for f in fs:
                files.append(os.path.join(root, f))
    except Exception:
        pass

    return {
        "status": "ok",
        "files_remaining": len(files),
        "remaining_files": files,
    }
