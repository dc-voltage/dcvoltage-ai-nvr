"""DC VOLTAGE AI NVR - Core API Router Bundle
Combines camera management, 30 AI tracking capabilities, AI assistant,
Telegram bot, analytics engine, storage vault, and security RBAC.
"""

from fastapi import APIRouter

from .analytics_engine import router as analytics_router
from .assistant_service import router as assistant_router
from .camera_manager import router as camera_router
from .security_manager import router as security_router
from .storage_vault import router as storage_router
from .telegram_bot import router as telegram_router
from .tracking_manager import router as tracking_router
from .system_profile import router as system_router

router = APIRouter()

router.include_router(camera_router)
router.include_router(tracking_router)
router.include_router(assistant_router)
router.include_router(telegram_router)
router.include_router(analytics_router)
router.include_router(storage_router)
router.include_router(security_router)
router.include_router(system_router)
