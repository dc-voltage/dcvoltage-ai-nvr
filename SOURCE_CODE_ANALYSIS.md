# DC VOLTAGE AI NVR — Comprehensive Source Code Audit & Technical Analysis
**Product:** DC VOLTAGE AI NVR  
**Developer:** DC VOLTAGE NETWORK  
**Tagline:** Intelligent Surveillance. Zero Blind Spots.  
**Baseline Version:** Frigate 0.18.2  
**Date:** November 2026  

---

## 1. Executive Summary & Archive Integrity Audit

A comprehensive source-code and binary artifact audit was conducted on the two supplied source archives:
1. `frigate-0.18.2.tar.gz` (SHA-256: `e6af192d610f6f5fd26677aa509412620b2bc60216f6105b509ad57ec8dcf0c0`, size: 46,309,483 bytes)
2. `frigate-0.18.2.zip` (SHA-256: `d6b31ef82e9538aa49f13812d9a3b143158ee40952c13c868ec50ba8336c88f8`, size: 47,645,514 bytes)

### 1.1 Archive Comparison Results
To verify archive integrity and determine whether discrepancies existed between formats, an automated file-by-file cryptographic hash verification was executed:
- **Total file entries in tar.gz:** 3,018 regular files + 2 symbolic links.
- **Total file entries in zip:** 3,020 entries.
- **Cryptographic Match:** 3,018 files matched with **100% SHA-256 identity**.
- **Discrepancy Details:** 
  - In `frigate-0.18.2.tar.gz`, `frigate-0.18.2/.github/copilot-instructions.md` and `frigate-0.18.2/CLAUDE.md` were archived as POSIX symbolic links (`SYMTYPE` / type flag `b'2'`) pointing to `AGENTS.md`.
  - In `frigate-0.18.2.zip`, these links were preserved as standard files containing the target references depending on zip extraction tooling.
  - No functional differences or source omissions exist between the archives; the codebase baseline is completely validated and accounted for.

---

## 2. Python Backend Architecture (`frigate/`)

The backend is built in Python 3.11+ using a multi-process architecture orchestrated via Python's `multiprocessing` and POSIX shared memory buffers (`/dev/shm`).

```
                              +-----------------------+
                              |      FrigateApp       |
                              |   (Process Manager)   |
                              +-----------+-----------+
                                          |
        +------------------+--------------+---------------+------------------+
        |                  |                              |                  |
+-------v-------+  +-------v-------+              +-------v-------+  +-------v-------+
|  Camera Capture|  | Object Detect |              |  Event Review |  | FastAPI Server|
| (FFmpeg / SHM)|  | (DetectorProc)|              |  & Maintainer |  | (Uvicorn / WS)|
+-------+-------+  +-------+-------+              +-------+-------+  +-------+-------+
        |                  |                              |                  |
        +----------> POSIX Shared Memory <----------------+                  |
        |           (/dev/shm/frame_cache)                                   |
        +---------------------> ZMQ IPC Proxy / Dispatcher <-----------------+
```

### 2.1 Core Process Model (`frigate/app.py`, `frigate/__main__.py`)
- **Lifecycle Management:** `FrigateApp` manages subprocess initialization, health checks, graceful termination, signal handling (`SIGTERM`, `SIGINT`), and watchdog loops.
- **Inter-Process Communication (IPC):**
  - **ZeroMQ (ZMQ) Proxy (`frigate/comms/zmq_proxy.py`):** Acts as an IPC pub/sub and dealer/router broker between isolated processes.
  - **Dispatcher (`frigate/comms/dispatcher.py`):** High-level message bus connecting internal topics (e.g. `events/review`, `config/update`, `model/metrics`).
  - **Shared Memory Frame Manager (`frigate/util/builtin.py`):** Allocates memory-mapped buffers for raw uncompressed video frames (`YUV420P` / `NV12`) so detection processes read frames with zero network or disk overhead.
- **Process Components:**
  1. `capture_process`: Runs FFmpeg for each camera, writing raw frames to shared memory.
  2. `detect_process`: Samples frames at configured detection FPS, runs motion detection, crops candidate regions, passes to object detection runners.
  3. `event_processor`: Manages object tracking, zone crossing, stationary classification, and event state persistence.
  4. `review_maintainer`: Groups tracked events into cohesive review segments (`alert` vs `detection`).
  5. `recording_process`: Coordinates 24/7 or segment-based recording writes via FFmpeg segmentation.
  6. `sqlitevecq`: Background dedicated thread/process executing transactional and vector queries on SQLite.
  7. `api_process`: FastAPI web application running on Uvicorn.

### 2.2 FastAPI Architecture (`frigate/api/`)
The REST and WebSocket interfaces are defined in modular routers:
- `fastapi_app.py`: Core FastAPI application instance, lifespan handler, Starlette middleware, and SlowAPI rate limiter.
- `auth.py`: JWT-based token generation, validation, password hashing (bcrypt), cookie and header extraction, RBAC enforcement (`admin` vs `viewer`).
- `camera.py`: Camera snapshot extraction, PTZ commands, dynamic stream info, activity stats.
- `chat.py`: GenAI natural-language query engine against surveillance metadata.
- `classification.py`: Custom classification model configurations and inference diagnostics.
- `event.py` & `review.py`: Paginated retrieval, filtering, manual review status, retained snapshot downloads.
- `export.py`: Case export management, video segment stitching, download packaging.
- `media.py`: Serving static MP4 segments, HLS playlists, review thumbnails, and snapshots.
- `notification.py`: WebPush VAPID key exchange and client push token registration.

---

## 3. Video Pipeline, Live Streaming & Hardware Acceleration

### 3.1 FFmpeg Pipeline Architecture (`frigate/video/ffmpeg.py`, `frigate/ffmpeg_presets.py`)
- **Dual Pipeline Concept:**
  - **Detect Stream:** Typically low-resolution (e.g. 640x360 or 1280x720) at low frame rates (5-10 FPS) to minimize CPU/GPU inference load.
  - **Record Stream:** High-resolution (1080p, 2K, 4K) at native camera FPS (15-30 FPS) encoded in H.264 or H.265, copied directly (`-c copy`) without re-encoding to minimize CPU utilization.
- **Hardware Acceleration Matrix:**
  - **Intel:** QuickSync Video (`qsv`), VA-API (`vaapi`).
  - **NVIDIA:** NVDEC/CUDA (`cuda`).
  - **AMD:** VA-API / AMF (`vaapi`, `amf`).
  - **Rockchip:** RKMPP (`rkmpp`).
  - **Raspberry Pi:** V4L2 M2M (`v4l2m2m`).
- **Live Streaming (`go2rtc`):**
  - High-performance Go-based RTSP/WebRTC/MSE streaming proxy bundled within the container.
  - Translates diverse camera RTSP streams into ultra-low latency WebRTC and MSE streams for browser playback.

---

## 4. Object Detection, Tracking & Computer Vision Subsystems

### 4.1 Detector Framework (`frigate/detectors/`)
Frigate uses an extensible plugin model with dedicated runner processes communicating via ZMQ IPC:
- **Available Plugins:**
  - `cpu_tfl.py`: TensorFlow Lite CPU fallback.
  - `edgetpu_tfl.py`: Google Coral TPU (PCIe and USB).
  - `openvino.py`: Intel OpenVINO runtime (Intel Gen 9-14 iGPUs and Intel Arc dGPUs).
  - `onnx.py`: ONNX Runtime (CPU and GPU execution providers).
  - `tensorrt.py`: NVIDIA TensorRT engine execution.
  - `hailo8l.py`, `rknn.py`, `memryx.py`, `axengine.py`: Specialized edge accelerators.

### 4.2 Motion Detection & Region Selection (`frigate/motion/`)
- Frame difference and OpenCV MOG2 background subtractor.
- Computes motion bounding boxes, merges contiguous regions, and ignores masked zones.
- Generates bounding boxes fed into the detector only when motion exceeds configured thresholds, reducing inference load by up to 80% on static scenes.

### 4.3 Object Tracking (`frigate/track/`)
- Multi-tracker architecture combining:
  - **Norfair Tracker (`norfair_tracker.py`):** Kalman-filter-based tracking with distance calculation and velocity estimation.
  - **Centroid Tracker (`centroid_tracker.py`):** Geometric centroid tracking for lower compute profiles.
  - **Stationary Object Classifier (`stationary_classifier.py`):** Tracks parked cars and stationary objects to prevent repeated redundant alerting.

### 4.4 Data Processing & Analytics (`frigate/data_processing/`)
- **Real-Time Subsystem:**
  - `face.py`: Face detection (YOLO-Face / SCRFD) and feature extraction (ArcFace / FaceNet).
  - `license_plate.py`: Plate localization and OCR via PaddleOCR / custom ONNX.
  - `custom_classification.py`: Secondary image classification.
- **Post-Processing Subsystem:**
  - `semantic_trigger.py`, `review_descriptions.py`, `audio_transcription.py` (Whisper online/offline).

---

## 5. Storage, Database & Recording Architecture

### 5.1 Storage Engine (`frigate/storage.py`, `frigate/record/`)
- Segment-based rolling video recorder storing segments in 10-second MP4 chunks.
- Database records track segment start time, end time, camera ID, motion presence, active objects, and storage size.
- Dynamic retention engine purges unflagged recordings while locking flagged events and user exports.

### 5.2 Database (`frigate/models.py`, `frigate/db/sqlitevecq.py`)
- SQLite 3 managed via Peewee ORM.
- `sqlite-vec` extension enabled for storing and vector-searching 512-dimension / 768-dimension embeddings (CLIP, Jina, MobileNet).
- Thread-safe query queue (`SqliteQueueDatabase`) preventing SQLite locking contention under high concurrency.

---

## 6. Frontend Architecture (`web/`)

- Built with **React 18**, **TypeScript**, and **Vite**.
- Component library based on **Tailwind CSS**, **Radix UI**, and Lucide / React Icons.
- Live WebRTC / MSE player with dynamic latency management.
- Multi-camera grid with adaptive bitrate switching.
- **Internationalization (i18n):**
  - Configured with `i18next`.
  - Supports 60 language directories in `web/public/locales/`.
  - **Critical Discovery:** Malayalam (`ml`) directory exists (`web/public/locales/ml/`), but contains empty placeholder stubs (`{}`).
  - Full Malayalam localization must be authored and integrated for DC VOLTAGE AI NVR.

---

## 7. Architectural Weaknesses & Gaps in Frigate 0.18.2

| Component | Frigate 0.18.2 Limitation | DC VOLTAGE AI NVR Enhancement Required |
|---|---|---|
| **Camera Discovery** | Manual YAML configuration only; no auto-discovery. | Automated ONVIF Profile S/T/G discovery, WS-Discovery, RTSP auto-probing. |
| **Camera Health** | Simple watchdog with basic reconnect. | Health scoring, ping monitoring, RTSP stream reconnect backoff, offline alerting. |
| **Notifications** | Basic WebPush and MQTT; no native Telegram bot. | First-class Telegram bot with snapshots, clips, commands, and multi-chat support. |
| **AI Tracking** | Person, car, basic face/plate stubs. | 30 advanced analytics: Loitering, intrusion, crowd, smoke/fire, package, cross-camera Re-ID. |
| **AI Assistant** | Basic GenAI chat using external cloud LLM. | Integrated Assistant supporting local Ollama, Gemini, OpenAI, natural language search, Malayalam & English. |
| **Hardware Profiles** | Generic configuration; heavy for older laptops. | 4 explicit hardware profiles (A, B, C, D) with adaptive FPS, CPU fallbacks, and memory tuning. |
| **Setup & Mgmt** | Command line YAML editing. | Guided first-time setup wizard, hardware auto-detect, installation and backup shell scripts. |
| **Security** | Basic single/multi-user JWT with plain YAML secrets. | Role-Based Access Control (RBAC), encrypted credential vault, audit logging, rate limiting. |

---

## 8. Conclusion
Frigate 0.18.2 provides a solid core video processing and shared memory architecture. However, it lacks out-of-the-box universal camera discovery, native Telegram notifications, an end-to-end local AI assistant with multilingual support (Malayalam + English), advanced multi-class surveillance tracking (smoke, loitering, intrusion, crowd, tampering), and turnkey setup scripts for older PCs. These gaps define the direct engineering mandate for **DC VOLTAGE AI NVR**.
