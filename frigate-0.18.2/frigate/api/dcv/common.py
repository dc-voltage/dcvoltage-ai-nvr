"""DC VOLTAGE AI NVR - Common utilities and paths."""

import sys
import os

# Auto-register parent package in sys.path if invoked directly
_pkg_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if _pkg_root not in sys.path:
    sys.path.insert(0, _pkg_root)

from frigate.const import CONFIG_DIR

def get_dcv_storage_dir() -> str:
    """Returns persistent storage directory, falling back gracefully if /config is not writeable."""
    target = os.environ.get("DCV_CONFIG_DIR", os.path.join(CONFIG_DIR, "dcv"))
    try:
        os.makedirs(target, exist_ok=True)
        return target
    except (PermissionError, OSError):
        fallback = os.path.expanduser("~/.config/dcv")
        os.makedirs(fallback, exist_ok=True)
        return fallback
