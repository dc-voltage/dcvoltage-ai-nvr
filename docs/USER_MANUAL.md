# DC VOLTAGE AI NVR — USER MANUAL
**Developer:** DC VOLTAGE NETWORK  
**Product:** DC VOLTAGE AI NVR  
**Tagline:** *Intelligent Surveillance. Zero Blind Spots.*  
**Baseline Version:** Frigate 0.18.2 Baseline with DC VOLTAGE Enterprise Core  

---

## 1. System Overview & Architecture

**DC VOLTAGE AI NVR** is a next-generation universal AI surveillance and network video recorder platform. Built atop the high-performance Frigate 0.18.2 baseline, it expands classical object detection into an enterprise-grade surveillance system featuring:

- **Universal Camera Compatibility:** Native ONVIF Profile S/T discovery and RTSP ingestion for Hikvision, Dahua, CP Plus, TP-Link Tapo, Reolink, Imou, EZVIZ, Axis, Uniview, Amcrest, and USB webcams.
- **30 Advanced AI Tracking Capabilities:** Multi-camera re-identification (Re-ID), explicit-consent face recognition, ALPR allow/deny list verification, loitering detection, restricted zone intrusion, fall & rapid downward motion detection, smoke/fire visual hazard detection, and camera tampering alerts.
- **Intelligent Bilingual AI Assistant:** Natural language search and automated security briefings powered by local Ollama models, Google Gemini (`gemini-2.5-flash`), OpenAI, or deterministic offline fallback in both **English** and **മലയാളം (Malayalam)**.
- **Telegram Alert Bot Engine:** Instant event alerts delivered with high-resolution snapshots, MP4 video clips, camera health notices, and interactive bot commands.
- **Tamper-Evident Evidence Vault:** Cryptographic SHA-256 integrity hashing and digital chain-of-custody tracking for forensic exports.
- **Optimized Hardware Profiles (A, B, C, D):** Engineered to run smoothly on older laptops and PCs with low memory footprints, all the way up to multi-GPU enterprise AI clusters.

---

## 2. Quick Start & Guided Setup Wizard

### Accessing the Web Dashboard
Open any modern web browser (Chrome, Firefox, Safari, Edge) and navigate to:
```
http://<NVR_IP_ADDRESS>:5000
```
*(Default internal port is `5000`)*

### The Guided Setup Wizard (`/setup`)
Upon initial deployment or by navigating to `http://<NVR_IP_ADDRESS>:5000/setup`, the 7-step guided setup wizard walks operators through complete provisioning:

1. **Language Selection:** Switch between English and മലയാളം (Malayalam) with instantaneous interface localization.
2. **Hardware Profiler:** Automatic inspection of CPU cores, physical RAM, GPU/accelerators (VAAPI, CUDA, Coral TPU), and free disk storage. Select between Profile A, B, C, or D.
3. **Admin & Security RBAC:** Configure the primary administrator account and review role-based access policies (Admin, Operator, Viewer).
4. **Camera Discovery & Stream Tester:** Execute local subnet ONVIF discovery and validate RTSP video feeds in real time.
5. **AI Tracking Capabilities:** Enable multi-object tracking rules (Person, Vehicle, Face Recognition, ALPR, Loitering, Intrusion, Smoke/Fire, Tampering).
6. **Telegram Bot Setup:** Input Telegram Bot Token and Chat ID; click **Send Test Alert** to verify end-to-end messaging.
7. **Storage Vault & Retention:** Set primary recording storage paths, retention policies (e.g. 14 days), and enable the SHA-256 evidence vault.

---

## 3. Universal IP Camera Management

Navigate to **Cameras** (`/cameras`) on the main sidebar:

### 3.1 Auto-Discovery (ONVIF WS-Discovery)
1. Click **Scan Local Subnet (ONVIF Probe)**.
2. The NVR transmits multicast WS-Discovery probes to `239.255.255.250:3702`.
3. Discovered cameras appear in the table with detected IP address, manufacturer/hardware, and supported ONVIF profiles (Profile S, Profile T).

### 3.2 RTSP Stream Testing & Verification
1. Enter the target RTSP stream URL (e.g. `rtsp://admin:password@192.168.1.100:554/Streaming/Channels/101`).
2. Click **Test Stream**.
3. The built-in OpenCV diagnostic engine attempts frame retrieval and reports:
   - Status (Online / Offline)
   - Video Resolution (e.g., `1920x1080` or `3840x2160`)
   - Stream FPS (e.g., `25.0 FPS`)
   - Video Codec (H.264 / H.265 HEVC)

### 3.3 PTZ (Pan-Tilt-Zoom) Control
For cameras supporting ONVIF PTZ or HTTP PTZ protocols:
- Use the directional keypad (Up, Down, Left, Right) to pan and tilt.
- Use **Zoom In (+)** and **Zoom Out (-)** for optical zoom control.
- Adjust speed slider from `0.1` (fine precision) to `1.0` (rapid movement).

### 3.4 Camera Health & Diagnostics
The dashboard continuously calculates a health score (0–100%) for each camera based on connection stability, dropped frames, and RTSP stream latency. Alerts are automatically triggered if a camera drops offline.

---

## 4. 30 Advanced AI Tracking Capabilities

Navigate to **AI Tracking** (`/tracking`) to manage detection models and tracking state machines:

| # | Capability | Description | Default Status |
|---|---|---|---|
| 1 | **Person Tracking** | Persistent multi-camera person detection with stable track IDs | Enabled |
| 2 | **Vehicle Tracking** | Detection of cars, trucks, buses, motorcycles, bicycles | Enabled |
| 3 | **Face Detection** | Real-time face localization and pose estimation | Enabled |
| 4 | **Face Recognition** | 1:N biometric gallery match with explicit enrollment & consent | Configurable |
| 5 | **Human Re-Identification (Re-ID)** | Cross-camera person tracking across blind spots | Enabled |
| 6 | **Vehicle Zone-to-Zone Tracking** | Transition tracking of vehicles across defined camera zones | Enabled |
| 7 | **Vehicle Attribute Classification** | Make, body type (sedan/SUV/van), and color classification | Enabled |
| 8 | **License Plate Recognition (ALPR)** | Plate OCR with Allow List / Deny List matching | Enabled |
| 9 | **Pet Detection & Tracking** | Dogs, cats, and domestic pets | Enabled |
| 10 | **Animal Classification** | Livestock and wildlife identification | Enabled |
| 11 | **Object Left Behind** | Static unattended item detection | Enabled |
| 12 | **Object Removed** | Missing asset and theft alerting | Enabled |
| 13 | **Abandoned Luggage** | Stationary unattended bag alerting | Enabled |
| 14 | **Loitering Detection** | Dwell-time monitoring beyond configured threshold | Enabled |
| 15 | **Restricted Area Intrusion** | Polygonal virtual perimeter breach alarm | Enabled |
| 16 | **Line-Crossing Detection** | Bi-directional virtual tripwire triggers | Enabled |
| 17 | **Crowd Detection** | Density estimation exceeding threshold | Enabled |
| 18 | **People Counting** | In/Out ingress and egress counting | Enabled |
| 19 | **Vehicle Counting** | Parking and transit volume counting | Enabled |
| 20 | **Occupancy Monitoring** | Live area capacity tracking | Enabled |
| 21 | **Unusual Movement** | Erratic trajectory and rapid acceleration alerts | Enabled |
| 22 | **Running & Falling Detection** | Sudden posture collapse and slip detection | Optional |
| 23 | **Smoke & Fire Detection** | Visual combustion, flame flicker, and smoke plume alerts | Enabled |
| 24 | **Camera Tampering Detection** | Defocus, spray paint, occlusion, and redirection | Enabled |
| 25 | **Suspicious Activity Detection** | Multi-attribute anomalous behavior scoring | Enabled |
| 26 | **After-Hours Activity Detection** | Time-scheduled movement alerts during curfew hours | Enabled |
| 27 | **Delivery Person Detection** | Uniform/carrier identification (courier, post) | Enabled |
| 28 | **Package Detection** | Parcel placement and porch pickup monitoring | Enabled |
| 29 | **Person-Vehicle Association** | Correlates individuals entering or exiting specific vehicles | Enabled |
| 30 | **Operator Review & Correction** | Human-in-the-loop review for AI classification validation | Always Active |

### 4.1 Face Recognition with Consent & Enrollment
To enroll an authorized individual:
1. Navigate to **Face Enrollment** in the AI Tracking tab.
2. Enter the subject's **Full Name** and optional **Notes/Badge ID**.
3. Check **"Explicit Subject Consent Verified"** (mandatory requirement).
4. Upload or capture 1–5 reference images.
5. Click **Enroll Subject**. The embedding is indexed into the SQLite vector database.

### 4.2 Automatic License Plate Recognition (ALPR)
Navigate to **Vehicles** (`/vehicles`):
- View real-time plate OCR reads with confidence percentage and timestamp.
- Register license plates under **Allow List** (e.g., residents, authorized staff) or **Deny List** (e.g., unauthorized vehicles, security flags).
- Deny List detections instantly dispatch priority Telegram and dashboard push alerts.

---

## 5. Intelligent AI Assistant & Malayalam Interface

Navigate to **Chat / AI Assistant** (`/chat`):

### 5.1 Pluggable LLM Providers
The AI Assistant supports seamless switching between:
- **Local Ollama:** Fully offline privacy-preserving inference (e.g. `llama3`, `mistral`).
- **Google Gemini:** High-speed cloud reasoning using `gemini-2.5-flash`.
- **OpenAI:** Compatible with `gpt-4o` or local OpenAI-compatible APIs (vLLM, LocalAI).
- **Deterministic Offline Fallback:** Guaranteed uptime with built-in rule and regex matching even without internet or GPU access.

### 5.2 Natural Language Queries (English & Malayalam)
You can converse with the assistant in either language:

**Example English Queries:**
- *"What happened at the front gate today?"*
- *"Show all person detections from yesterday."*
- *"Was any vehicle detected near the warehouse after midnight?"*
- *"Give me a summary of today's security events."*
- *"Which cameras are currently offline?"*

**Example മലയാളം (Malayalam) Queries:**
- *"ഇന്ന് ഫ്രണ്ട് ഗേറ്റിൽ എന്താണ് സംഭവിച്ചത്?"*
- *"ഇന്നലത്തെ ആളുകളുടെ ഡിറ്റക്ഷനുകൾ കാണിക്കുക."*
- *"അർദ്ധരാത്രിക്ക് ശേഷം പാർക്കിംഗിൽ കാറുകൾ കണ്ടിരുന്നോ?"*
- *"ഇന്നത്തെ സുരക്ഷാ സംഗ്രഹം നൽകുക."*
- *"ഏതെങ്കിലും ക്യാമറ ഓഫ്‌ലൈൻ ആണോ?"*

### 5.3 Automated Daily Security Briefing
Click **Generate Daily Briefing** or call `GET /dcv/assistant/daily-briefing`. The AI Assistant compiles 24-hour detection counts, camera health, and incident highlights into an executive summary.

---

## 6. Telegram Notifications & Mobile Alerts

Navigate to **Telegram** (`/telegram`):

### 6.1 Setting Up the Telegram Bot
1. Open Telegram on your smartphone or desktop and search for `@BotFather`.
2. Send `/newbot`, choose a name and username, and copy the provided **Bot Token**.
3. Start a chat with your new bot, or add it to a private security group.
4. Obtain your numeric **Chat ID** (via `@userinfobot` or bot updates).
5. In the DC VOLTAGE NVR dashboard:
   - Enter **Bot Token**
   - Enter **Chat ID**
   - Click **Save Telegram Configuration**
   - Click **Send Test Alert** to verify immediate delivery.

### 6.2 Telegram Alert Payload Example
```text
🚨 DC VOLTAGE AI NVR ALERT
Camera: Front Gate (Hikvision 4K)
Detection: Person (96% confidence)
Time: 2026-11-11 22:45:12 UTC
Zone: Driveway Intrusion Zone
Action: High-resolution snapshot & MP4 clip attached.
```

### 6.3 Telegram Bot Interactive Commands
- `/status` — Fleet health summary and active camera counts.
- `/snapshot <camera>` — Requests an instant real-time snapshot.
- `/daily_summary` — Delivers the AI-generated 24-hour activity report.

---

## 7. Storage Vault & Tamper-Evident Security

Navigate to **Storage** (`/storage`):

### 7.1 Recording Retention Policies
- **Continuous 24/7 Recording:** Stored as continuous 10-second MP4 fragments.
- **Event-Only Recording:** Saves pre-event buffer (configurable 5–15 seconds) and post-event footage.
- **Automatic Storage Pruning:** When disk capacity reaches the configured threshold (e.g. 90%), oldest non-protected recordings are safely removed.

### 7.2 Locked Recordings & Evidence Protection
- Crucial incidents can be locked with an operator reason (e.g., *"Police investigation - incident #4410"*).
- **Protected Guarantee:** Locked recordings are immune to automated storage pruning and cannot be deleted by standard retention policies.

### 7.3 Tamper-Evident SHA-256 Chain of Custody
1. Select an incident in the Storage Vault and click **Export Tamper-Evident Package**.
2. The NVR computes an immutable cryptographic SHA-256 hash across all video segments, snapshot frames, and metadata.
3. An audit package (`.json` + media) is created containing:
   - Package ID and timestamp
   - Operator credentials
   - Master SHA-256 hash
   - Verified chain-of-custody seal for court and insurance admissibility.

---

## 8. Hardware Profiles & System Administration

### 8.1 Hardware Profiles Summary

| Profile | Target Hardware | RAM | SHM Size | Primary Detector | Cameras |
|---|---|---|---|---|---|
| **Profile A** | Older PC / Laptop (Dual/Quad Core) | 4–8 GB | 256 MB | CPU (`ai-edge-litert`) | 2–4 |
| **Profile B** | Standard PC / Desktop (Intel/AMD) | 8–16 GB | 512 MB | VAAPI / Coral TPU | 4–8 |
| **Profile C** | Advanced Server (Dedicated GPU) | 16–32 GB | 1024 MB | NVIDIA TensorRT / CUDA | 8–16 |
| **Profile D** | Enterprise AI Cluster | 32+ GB | 2048 MB | Multi-GPU + Ollama Sidecar | 16–64+ |

### 8.2 Command-Line Management Scripts
Located in `/home/dc/Documents/nvr/`:

- **Install / Provision:**
  ```bash
  ./install.sh --profile B
  ```
- **Hardware Diagnostic:**
  ```bash
  ./hardware-detect.sh
  ```
- **System Healthcheck:**
  ```bash
  ./healthcheck.sh
  ```
- **Cryptographic Backup:**
  ```bash
  ./backup.sh
  ```
- **Disaster Recovery Restore:**
  ```bash
  ./restore.sh --archive backups/dcv_nvr_backup_YYYYMMDD_HHMMSS.tar.gz
  ```
- **Zero-Downtime Update:**
  ```bash
  ./update.sh
  ```
- **Clean Uninstallation:**
  ```bash
  ./uninstall.sh --keep-data
  ```

---
*DC VOLTAGE NETWORK — Intelligent Surveillance. Zero Blind Spots.*
