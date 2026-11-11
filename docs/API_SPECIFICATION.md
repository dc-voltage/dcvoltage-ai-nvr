# DC VOLTAGE AI NVR — REST API SPECIFICATION
**Developer:** DC VOLTAGE NETWORK  
**Product:** DC VOLTAGE AI NVR  
**Tagline:** *Intelligent Surveillance. Zero Blind Spots.*  
**Baseline Version:** Frigate 0.18.2 with DC VOLTAGE Extensions  

---

## 1. Overview & Authentication

All DC VOLTAGE AI NVR REST endpoints are served on port `5000` under the `/dcv/` prefix (alongside native `/api/` endpoints).

### Base URL
```
http://<NVR_IP>:5000/dcv
```

### Authentication & Roles
- **Public Endpoints:** Read-only health and version endpoints (`/dcv/system/profile`, `/api/version`).
- **Protected Endpoints:** Require session cookie or JWT bearer token:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Roles:**
  - `admin`: Full configuration, model upload, camera modification, tamper-evident evidence export, and user management.
  - `operator`: Live stream monitoring, PTZ control, event review, ALPR query, and face enrollment.
  - `viewer`: Read-only access to authorized live streams and review events.

---

## 2. Universal Camera Management (`/dcv/cameras`)

### 2.1 Auto-Discovery (ONVIF WS-Discovery)
Scans the local subnet for ONVIF Profile S and T compliant cameras.
- **Method:** `POST`
- **Path:** `/dcv/cameras/discover`
- **Query Parameters:** `timeout` (float, default: `3.0`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 2,
  "devices": [
    {
      "ip": "192.168.0.3",
      "name": "HIKVISION DS-2CD2043G2-I",
      "hardware": "Hikvision 4K IP Camera",
      "xaddrs": "http://192.168.0.3:80/onvif/device_service",
      "supported_profiles": ["Profile S", "Profile T"]
    }
  ]
}
```

### 2.2 RTSP Stream Probe & Testing
Tests and inspects an RTSP stream using the internal OpenCV diagnostics engine.
- **Method:** `POST`
- **Path:** `/dcv/cameras/test-stream`
- **Request Body:**
```json
{
  "url": "rtsp://admin:password@192.168.0.3:554/Streaming/Channels/102",
  "timeout_sec": 4
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "status": "online",
  "resolution": "640x360",
  "fps": 5.0,
  "codec": "H264",
  "latency_ms": 120.4
}
```

### 2.3 Camera Health & Score
Calculates uptime, stream latency, and health scores for all active cameras.
- **Method:** `GET`
- **Path:** `/dcv/cameras/health`
- **Response `200 OK`:**
```json
{
  "success": true,
  "fleet_score": 98.5,
  "cameras": [
    {
      "name": "hikvision_cam",
      "status": "healthy",
      "uptime_hours": 142.5,
      "fps": 5.0,
      "dropped_frames": 0,
      "score": 100
    }
  ]
}
```

### 2.4 PTZ Pan-Tilt-Zoom Command
Dispatches PTZ movement commands to compatible cameras.
- **Method:** `POST`
- **Path:** `/dcv/cameras/ptz/move`
- **Request Body:**
```json
{
  "camera_name": "hikvision_cam",
  "action": "move_up",
  "speed": 0.8
}
```

---

## 3. 30 AI Tracking Capabilities (`/dcv/tracking`)

### 3.1 List All 30 Tracking Capabilities
- **Method:** `GET`
- **Path:** `/dcv/tracking/rules`
- **Response `200 OK`:**
```json
{
  "success": true,
  "total_rules": 30,
  "rules": {
    "person_tracking": {"enabled": true, "confidence_threshold": 0.70},
    "vehicle_tracking": {"enabled": true, "confidence_threshold": 0.65},
    "face_recognition": {"enabled": true, "consent_verified": true},
    "alpr": {"enabled": true, "confidence_threshold": 0.85},
    "loitering": {"enabled": true, "dwell_threshold_seconds": 60},
    "intrusion": {"enabled": true},
    "camera_tampering": {"enabled": true},
    "smoke_and_fire": {"enabled": true},
    "package_detection": {"enabled": true}
  }
}
```

### 3.2 Face Recognition Biometric Enrollment (Consent-Verified)
- **Method:** `POST`
- **Path:** `/dcv/tracking/enroll-face`
- **Request Body:**
```json
{
  "name": "John Doe",
  "consent_verified": true,
  "role": "Authorized Resident",
  "image_base64": "<BASE64_IMAGE_STRING>",
  "notes": "Building A, Apartment 402"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "subject_id": "face_sub_918237",
  "name": "John Doe",
  "enrolled_at": "2026-11-11T16:45:00Z"
}
```

### 3.3 ALPR Allow / Deny List Registry
- **Method:** `POST`
- **Path:** `/dcv/tracking/alpr/register`
- **Request Body:**
```json
{
  "plate_number": "KL07CD4512",
  "status": "allowed",
  "owner": "Sarah Jenkins",
  "notes": "Company Delivery Van"
}
```

- **Method:** `POST`
- **Path:** `/dcv/tracking/alpr/verify`
- **Request Body:**
```json
{
  "plate_number": "KL07CD4512",
  "confidence": 0.94,
  "camera": "front_gate"
}
```

---

## 4. Intelligent AI Assistant (`/dcv/assistant`)

### 4.1 Natural Language Query (English & Malayalam)
- **Method:** `POST`
- **Path:** `/dcv/assistant/query`
- **Request Body:**
```json
{
  "prompt": "ഇന്ന് ഫ്രണ്ട് ഗേറ്റിൽ കാറുകൾ വന്നിരുന്നോ?",
  "language": "ml",
  "provider": "gemini"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "language": "ml",
  "provider": "gemini",
  "response": "അതെ, ഇന്ന് ഫ്രണ്ട് ഗേറ്റിൽ 3 വാഹനങ്ങൾ കണ്ടെത്തുകയുണ്ടായി. ഉച്ചയ്ക്ക് 12:30 ന് വെളുത്ത സെഡാൻ കാറും, വൈകുന്നേരം 4:15 ന് ഒരു മോട്ടോർ സൈക്കിളും രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്.",
  "relevant_events": ["evt_veh_001", "evt_veh_002"]
}
```

### 4.2 Automated Daily Security Briefing
- **Method:** `GET`
- **Path:** `/dcv/assistant/daily-briefing?language=en`
- **Response `200 OK`:**
```json
{
  "success": true,
  "briefing": "DC VOLTAGE AI NVR 24-Hour Security Briefing: 84 total events processed. 42 person detections, 18 vehicle detections, 0 tampering alerts. All 4 cameras maintained 100% uptime.",
  "timestamp": "2026-11-11T17:00:00Z"
}
```

---

## 5. Telegram Bot Notification Engine (`/dcv/telegram`)

### 5.1 Configure Bot Credentials
- **Method:** `POST`
- **Path:** `/dcv/telegram/configure`
- **Request Body:**
```json
{
  "bot_token": "123456789:ABCdefGHIjklMNOpqrSTUvwxYZ",
  "chat_id": "-1001234567890",
  "enabled": true
}
```

### 5.2 Trigger Test Notification
- **Method:** `POST`
- **Path:** `/dcv/telegram/test`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Test message dispatched to Telegram chat -1001234567890"
}
```

---

## 6. Storage Vault & Tamper-Evident Chain of Custody (`/dcv/storage`)

### 6.1 Lock Event from Automatic Pruning
- **Method:** `POST`
- **Path:** `/dcv/storage/lock-event`
- **Request Body:**
```json
{
  "event_id": "evt_intrusion_8842",
  "reason": "Police investigation incident report #9102"
}
```

### 6.2 Export Tamper-Evident SHA-256 Forensic Package
- **Method:** `POST`
- **Path:** `/dcv/storage/export-tamper-evident`
- **Request Body:**
```json
{
  "event_id": "evt_intrusion_8842",
  "operator_name": "Chief Security Officer"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "package": {
    "package_id": "ev_pkg_8842",
    "event_id": "evt_intrusion_8842",
    "sha256_integrity_hash": "a4b7f8c192d3e56a89c201d7e8b9f3a123456789abcdef0123456789abcdef01",
    "chain_of_custody_verified": true,
    "sealed_by": "Chief Security Officer",
    "timestamp": "2026-11-11T17:15:00Z"
  }
}
```

---

## 7. System Profiler & Setup Wizard (`/dcv/system`)

### 7.1 Inspect Hardware & Detect Profile
- **Method:** `GET`
- **Path:** `/dcv/system/profile`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "architecture": "x86_64",
    "cpu_cores": 4,
    "total_ram_gb": 8.0,
    "free_disk_gb": 216.5,
    "accelerators": {
      "intel_gpu": false,
      "amd_gpu": true,
      "nvidia_gpu": false,
      "coral_tpu": false,
      "vaapi_render_node": true
    },
    "recommended_profile": "B",
    "recommended_description": "Standard Desktop / Laptop (Hardware VAAPI / Coral TPU, 4-8 cameras)",
    "recommended_detector": "cpu",
    "recommended_shm_size": "512mb",
    "product": "DC VOLTAGE AI NVR"
  }
}
```

### 7.2 Apply Wizard Setup Preferences
- **Method:** `POST`
- **Path:** `/dcv/system/wizard/apply`
- **Request Body:**
```json
{
  "language": "ml",
  "profile": "B",
  "admin_username": "admin",
  "telegram_token": "123456:ABC-DEF",
  "telegram_chat_id": "987654321",
  "storage_path": "/media/frigate/recordings",
  "retention_days": 14,
  "enable_vault": true
}
```

---
*DC VOLTAGE NETWORK — Intelligent Surveillance. Zero Blind Spots.*
