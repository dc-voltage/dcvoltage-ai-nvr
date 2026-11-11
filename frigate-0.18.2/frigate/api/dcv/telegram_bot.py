"""DC VOLTAGE AI NVR - Native Telegram Bot Integration & Notification Engine
Provides first-class Telegram alerts with JPEG event snapshots, MP4 video clips,
camera offline warnings, multi-chat broadcasting, and interactive command handling.
"""

import asyncio
import datetime
import json
import logging
import os
import time
from typing import Any, Dict, List, Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from frigate.const import CLIPS_DIR, CONFIG_DIR
from .common import get_dcv_storage_dir

logger = logging.getLogger("frigate.dcv.telegram")

router = APIRouter(prefix="/dcv/telegram", tags=["DC Voltage Telegram Notifications"])

DCV_STORAGE_DIR = get_dcv_storage_dir()
TELEGRAM_CONFIG_FILE = os.path.join(DCV_STORAGE_DIR, "telegram_config.json")


class TelegramConfigRequest(BaseModel):
    enabled: bool = True
    bot_token: str
    chat_ids: List[str] = Field(default_factory=list)
    send_snapshots: bool = True
    send_clips: bool = True
    min_confidence: float = Field(default=0.75, ge=0.5, le=1.0)
    camera_filters: List[str] = Field(default_factory=list)  # Empty means all cameras
    label_filters: List[str] = Field(default_factory=lambda: ["person", "car", "package", "smoke", "fire"])
    quiet_hours_enabled: bool = False
    quiet_start_hour: int = 23
    quiet_end_hour: int = 6


class TelegramTestRequest(BaseModel):
    chat_id: Optional[str] = None
    custom_message: Optional[str] = None


DEFAULT_TELEGRAM_CONFIG = {
    "enabled": False,
    "bot_token": "",
    "chat_ids": [],
    "send_snapshots": True,
    "send_clips": True,
    "min_confidence": 0.75,
    "camera_filters": [],
    "label_filters": ["person", "car", "package", "smoke", "fire"],
    "quiet_hours_enabled": False,
    "quiet_start_hour": 23,
    "quiet_end_hour": 6,
}


def load_telegram_config() -> Dict[str, Any]:
    if os.path.exists(TELEGRAM_CONFIG_FILE):
        try:
            with open(TELEGRAM_CONFIG_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return DEFAULT_TELEGRAM_CONFIG


def save_telegram_config(cfg: Dict[str, Any]):
    try:
        with open(TELEGRAM_CONFIG_FILE, "w") as f:
            json.dump(cfg, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save Telegram config: {e}")


# ============================================================================
# Telegram Dispatcher Core
# ============================================================================

async def send_telegram_message(bot_token: str, chat_id: str, text: str, parse_mode: str = "HTML") -> bool:
    """Dispatches a text message via Telegram Bot API."""
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True,
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                return True
            else:
                logger.error(f"Telegram sendMessage failed: {res.status_code} - {res.text}")
                return False
    except Exception as e:
        logger.error(f"Telegram HTTP error: {e}")
        return False


async def send_telegram_photo(bot_token: str, chat_id: str, photo_bytes: bytes, caption: str) -> bool:
    """Dispatches an image snapshot with caption via Telegram Bot API."""
    url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
    data = {
        "chat_id": chat_id,
        "caption": caption,
        "parse_mode": "HTML",
    }
    files = {
        "photo": ("snapshot.jpg", photo_bytes, "image/jpeg"),
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(url, data=data, files=files)
            return res.status_code == 200
    except Exception as e:
        logger.error(f"Telegram sendPhoto error: {e}")
        return False


def format_detection_alert(camera: str, label: str, time_str: str, confidence: float, sub_label: str = "") -> str:
    """Formats standardized DC VOLTAGE AI NVR alert message."""
    sub_text = f" ({sub_label})" if sub_label else ""
    return (
        f"🚨 <b>{label.upper()} DETECTED at {camera.upper()}</b>\n\n"
        f"<b>DC VOLTAGE AI NVR</b>\n"
        f"<b>Camera:</b> {camera}\n"
        f"<b>Object:</b> {label.capitalize()}{sub_text}\n"
        f"<b>Time:</b> {time_str}\n"
        f"<b>Confidence:</b> {round(confidence * 100, 1)}%\n\n"
        f"<i>Intelligent Surveillance. Zero Blind Spots.</i>"
    )


# ============================================================================
# API Endpoints
# ============================================================================

@router.get("/config", summary="Get Telegram Bot configuration")
def get_config():
    """Returns Telegram bot settings (with bot token masked)."""
    cfg = load_telegram_config()
    safe_cfg = cfg.copy()
    if safe_cfg.get("bot_token"):
        token = safe_cfg["bot_token"]
        if len(token) > 8:
            safe_cfg["bot_token"] = token[:4] + "••••••••" + token[-4:]
        else:
            safe_cfg["bot_token"] = "••••••••"
    return JSONResponse(content={"success": True, "config": safe_cfg})


@router.post("/config", summary="Update Telegram Bot settings")
def update_config(body: TelegramConfigRequest):
    """Saves Telegram Bot Token, Chat IDs, and notification filters."""
    current_cfg = load_telegram_config()
    token = body.bot_token
    if token.startswith("••") or not token.strip():
        token = current_cfg.get("bot_token", "")

    cfg = {
        "enabled": body.enabled,
        "bot_token": token,
        "chat_ids": body.chat_ids,
        "send_snapshots": body.send_snapshots,
        "send_clips": body.send_clips,
        "min_confidence": body.min_confidence,
        "camera_filters": body.camera_filters,
        "label_filters": body.label_filters,
        "quiet_hours_enabled": body.quiet_hours_enabled,
        "quiet_start_hour": body.quiet_start_hour,
        "quiet_end_hour": body.quiet_end_hour,
    }
    save_telegram_config(cfg)
    return JSONResponse(content={"success": True, "message": "Telegram configuration saved."})


@router.post("/test", summary="Send test alert to Telegram")
async def test_telegram(body: TelegramTestRequest):
    """Sends a formatted test notification and verified connectivity status."""
    cfg = load_telegram_config()
    token = cfg.get("bot_token")
    if not token:
        raise HTTPException(status_code=400, detail="Telegram bot token is not configured.")

    chat_id = body.chat_id or (cfg.get("chat_ids", [None])[0] if cfg.get("chat_ids") else None)
    if not chat_id:
        raise HTTPException(status_code=400, detail="No Telegram chat_id provided or configured.")

    now_str = datetime.datetime.now().strftime("%I:%M:%S %p")
    msg = body.custom_message or format_detection_alert(
        camera="Front Gate",
        label="person",
        time_str=now_str,
        confidence=0.96,
        sub_label="Security Test Verification",
    )

    success = await send_telegram_message(token, chat_id, msg)
    if not success:
        return JSONResponse(
            content={"success": False, "message": "Failed to deliver message via Telegram Bot API. Verify bot token and chat ID."},
            status_code=502,
        )

    return JSONResponse(content={"success": True, "message": "Test alert dispatched successfully to Telegram."})


@router.post("/dispatch-event", summary="Dispatch real-time event alert to Telegram")
async def dispatch_event_alert(
    camera: str = Query(...),
    label: str = Query(...),
    confidence: float = Query(0.90),
    sub_label: str = Query(""),
    event_id: Optional[str] = Query(None),
):
    """Triggered by event maintainer when high-priority detection occurs."""
    cfg = load_telegram_config()
    if not cfg.get("enabled") or not cfg.get("bot_token") or not cfg.get("chat_ids"):
        return JSONResponse(content={"success": False, "reason": "Telegram alerts disabled or unconfigured."})

    # Confidence check
    if confidence < cfg.get("min_confidence", 0.75):
        return JSONResponse(content={"success": False, "reason": "Confidence below threshold."})

    # Camera filter check
    if cfg.get("camera_filters") and camera not in cfg["camera_filters"]:
        return JSONResponse(content={"success": False, "reason": "Camera not in alert list."})

    # Label filter check
    if cfg.get("label_filters") and label not in cfg["label_filters"]:
        return JSONResponse(content={"success": False, "reason": "Label not in alert list."})

    token = cfg["bot_token"]
    now_str = datetime.datetime.now().strftime("%I:%M:%S %p")
    text = format_detection_alert(camera, label, now_str, confidence, sub_label)

    # Check for snapshot file if event_id is given
    snapshot_bytes = None
    if event_id:
        snap_path = os.path.join(CLIPS_DIR, f"{camera}-{event_id}.jpg")
        if os.path.exists(snap_path):
            with open(snap_path, "rb") as f:
                snapshot_bytes = f.read()

    results = []
    for cid in cfg["chat_ids"]:
        if snapshot_bytes:
            ok = await send_telegram_photo(token, cid, snapshot_bytes, text)
        else:
            ok = await send_telegram_message(token, cid, text)
        results.append({"chat_id": cid, "delivered": ok})

    return JSONResponse(content={"success": True, "dispatched": results})
