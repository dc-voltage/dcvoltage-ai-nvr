"""DC VOLTAGE AI NVR - System Profiler & Setup Wizard API
Provides runtime hardware detection, profile recommendation (A, B, C, D),
and initial guided setup configuration management.
"""

import os
import shutil
import platform
import subprocess
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .common import get_dcv_storage_dir

router = APIRouter(prefix="/dcv/system", tags=["System & Wizard"])


class WizardSetupRequest(BaseModel):
    language: str = Field(default="en", description="Default UI language (en or ml)")
    profile: str = Field(default="B", description="Selected Hardware Profile (A, B, C, or D)")
    admin_username: Optional[str] = Field(default="admin", description="Admin username")
    admin_password: Optional[str] = Field(default=None, description="Admin password")
    telegram_token: Optional[str] = Field(default="", description="Telegram Bot Token")
    telegram_chat_id: Optional[str] = Field(default="", description="Telegram Chat ID")
    storage_path: Optional[str] = Field(default="/media/frigate/recordings", description="Primary storage directory")
    retention_days: int = Field(default=14, description="Default retention days")
    enable_vault: bool = Field(default=True, description="Enable tamper-evident evidence vault")


def detect_hardware_profile() -> Dict[str, Any]:
    """Inspects host/container hardware and determines the optimal profile."""
    cpu_count = os.cpu_count() or 2
    system_arch = platform.machine()
    
    # Memory detection
    total_ram_gb = 4.0
    try:
        if os.path.exists("/proc/meminfo"):
            with open("/proc/meminfo", "r") as f:
                for line in f:
                    if line.startswith("MemTotal:"):
                        kb = int(line.split()[1])
                        total_ram_gb = round(kb / (1024 * 1024), 1)
                        break
    except Exception:
        pass

    # Disk storage detection
    free_disk_gb = 50.0
    try:
        storage_stat = shutil.disk_usage(get_dcv_storage_dir())
        free_disk_gb = round(storage_stat.free / (1024 ** 3), 1)
    except Exception:
        pass

    # Acceleration detection
    intel_gpu = False
    amd_gpu = False
    nvidia_gpu = False
    coral_tpu = False
    vaapi_available = os.path.exists("/dev/dri/renderD128")

    # Check for Coral TPU USB device
    if os.path.exists("/dev/bus/usb"):
        try:
            # Check for Coral TPU vendor id 1a6e or 0960
            lsusb_out = subprocess.run(["lsusb"], capture_output=True, text=True, timeout=1).stdout
            if "1a6e:" in lsusb_out or "0960:" in lsusb_out or "Google" in lsusb_out:
                coral_tpu = True
        except Exception:
            pass

    # Check for NVIDIA
    if os.path.exists("/proc/driver/nvidia") or shutil.which("nvidia-smi"):
        nvidia_gpu = True

    # Check for Intel / AMD DRI
    if vaapi_available:
        try:
            lspci_out = subprocess.run(["lspci"], capture_output=True, text=True, timeout=1).stdout.lower()
            if "intel" in lspci_out:
                intel_gpu = True
            if "amd" in lspci_out or "radeon" in lspci_out or "ati" in lspci_out:
                amd_gpu = True
        except Exception:
            intel_gpu = True  # Generic VAAPI render node

    # Recommendation heuristic
    if nvidia_gpu and total_ram_gb >= 30.0:
        recommended = "D"
        description = "Enterprise Cluster / High-VRAM Server (NVIDIA CUDA / TensorRT, 32GB+ RAM)"
        detector = "tensorrt"
        shm_size = "2048mb"
    elif nvidia_gpu:
        recommended = "C"
        description = "Advanced Server (NVIDIA GPU TensorRT / CUDA Acceleration, 8-16 cameras)"
        detector = "tensorrt"
        shm_size = "1024mb"
    elif total_ram_gb <= 7.5 and not intel_gpu and not amd_gpu:
        recommended = "A"
        description = "Older PC / Laptop (Low-RAM CPU-only, 3-5 FPS detection, 2-4 cameras)"
        detector = "cpu"
        shm_size = "256mb"
    else:
        recommended = "B"
        description = "Standard Desktop / Laptop (Hardware VAAPI / Coral TPU, 4-8 cameras)"
        detector = "coral" if coral_tpu else "cpu"
        shm_size = "512mb"

    return {
        "architecture": system_arch,
        "cpu_cores": cpu_count,
        "total_ram_gb": total_ram_gb,
        "free_disk_gb": free_disk_gb,
        "accelerators": {
            "intel_gpu": intel_gpu,
            "amd_gpu": amd_gpu,
            "nvidia_gpu": nvidia_gpu,
            "coral_tpu": coral_tpu,
            "vaapi_render_node": vaapi_available,
        },
        "recommended_profile": recommended,
        "recommended_description": description,
        "recommended_detector": detector,
        "recommended_shm_size": shm_size,
        "product": "DC VOLTAGE AI NVR",
        "branding": {
            "developer": "DC VOLTAGE NETWORK",
            "tagline": "Intelligent Surveillance. Zero Blind Spots.",
            "version": "1.0.0 (Frigate 0.18.2 Baseline)"
        }
    }


@router.get("/profile")
def get_system_profile():
    """Returns detected hardware metrics, accelerators, and recommended profile."""
    return {
        "success": True,
        "data": detect_hardware_profile()
    }


@router.post("/wizard/apply")
def apply_wizard_setup(req: WizardSetupRequest):
    """Saves guided setup preferences into DC VOLTAGE persistent state."""
    storage_dir = get_dcv_storage_dir()
    os.makedirs(storage_dir, exist_ok=True)
    setup_file = os.path.join(storage_dir, "wizard_setup.json")
    
    import json
    data = req.model_dump()
    with open(setup_file, "w") as f:
        json.dump(data, f, indent=2)

    return {
        "success": True,
        "message": "DC VOLTAGE AI NVR setup configuration applied successfully.",
        "configuration": data
    }


@router.get("/wizard/status")
def get_wizard_status():
    """Checks whether the initial setup wizard has been completed."""
    storage_dir = get_dcv_storage_dir()
    setup_file = os.path.join(storage_dir, "wizard_setup.json")
    completed = os.path.isfile(setup_file)
    data = None
    if completed:
        try:
            import json
            with open(setup_file, "r") as f:
                data = json.load(f)
        except Exception:
            completed = False

    return {
        "success": True,
        "completed": completed,
        "configuration": data
    }
