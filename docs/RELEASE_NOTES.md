# DC VOLTAGE AI NVR — RELEASE NOTES
**Version:** 1.0.0  
**Release Date:** November 11, 2026  
**Developer:** DC VOLTAGE NETWORK  
**Product:** DC VOLTAGE AI NVR  
**Tagline:** *Intelligent Surveillance. Zero Blind Spots.*  
**Baseline Foundation:** Frigate 0.18.2  

---

## 1. Executive Summary

**DC VOLTAGE NETWORK** is proud to announce the official release of **DC VOLTAGE AI NVR v1.0.0**, an advanced, universal, production-ready AI surveillance platform. Built upon the robust foundation of Frigate 0.18.2, DC VOLTAGE AI NVR re-architects and dramatically extends the core system into a versatile, high-reliability enterprise NVR capable of running on older laptops and low-resource edge devices (Profile A) up to high-capacity multi-GPU datacenter clusters (Profile D).

---

## 2. Key Highlights & Architectural Enhancements

### 2.1 Universal IP Camera Subsystem
- **ONVIF WS-Discovery:** Real-time multicast probe engine discovering ONVIF Profile S and T cameras across local subnets.
- **Protocol-Based Universal Ingestion:** Native support for Hikvision, Dahua, CP Plus, TP-Link Tapo, Reolink, Imou, EZVIZ, Axis, Uniview, Amcrest, and USB webcams.
- **Interactive Stream Tester:** Frame-by-frame resolution, FPS, codec, and latency diagnostics powered by OpenCV.
- **PTZ Directional Control:** Keypad and speed controls for motorized pan-tilt-zoom cameras.
- **Continuous Camera Health Scoring:** Real-time 0–100% reliability scoring with automated offline alerting.

### 2.2 30 Advanced Computer Vision & Tracking Capabilities
1. Person Detection & Tracking with persistent track IDs.
2. Vehicle Detection & Tracking across all vehicle classes.
3. Real-time Face Localization.
4. Consent-Enrolled 1:N Facial Biometrics.
5. Cross-Camera Human Re-Identification (Re-ID).
6. Vehicle Zone-to-Zone Trajectory Analysis.
7. Vehicle Make, Model, and Color Classification.
8. Automatic License Plate Recognition (ALPR) with Allow/Deny List registry.
9. Pet Tracking (Dogs, Cats).
10. Animal Classification (Livestock, Wildlife).
11. Object Left Behind Detection.
12. Object Removed / Asset Theft Detection.
13. Abandoned Luggage Alerting.
14. Loitering Detection with configurable dwell thresholds.
15. Restricted Zone Polygonal Intrusion Alarms.
16. Bi-Directional Line-Crossing Tripwires.
17. Crowd Density Monitoring.
18. Directional People Counting.
19. Vehicle Traffic Counting.
20. Real-time Area Occupancy Graphs.
21. Unusual Movement & Trajectory Alerts.
22. Sudden Fall & Slip Emergency Detection.
23. Smoke & Fire Hazard Visual Combustion Detection.
24. Camera Tampering (Occlusion, Defocus, Spray Paint, Redirection).
25. Multi-Attribute Suspicious Activity Scoring.
26. After-Hours Curfew Activity Alarms.
27. Delivery Courier / Postal Uniform Detection.
28. Porch Package Placement & Removal Tracking.
29. Person-Vehicle Entry & Exit Association.
30. Human-in-the-Loop Operator Review and AI Validation.

### 2.3 Intelligent Bilingual AI Assistant
- **Pluggable LLM Providers:** Local Ollama (`llama3`, `mistral`), Google Gemini (`gemini-2.5-flash`), OpenAI, or deterministic offline fallback.
- **Native Bilingual Support:** Full natural language comprehension and generation in both **English** and **മലയാളം (Malayalam)**.
- **Natural Language Incident Search:** Inquire about specific persons, vehicles, times, and activities in conversational language.
- **Executive Daily Security Briefings:** Automated 24-hour activity summarization delivered to dashboard and Telegram.

### 2.4 First-Class Telegram Bot Integration
- Real-time instant delivery of high-resolution incident snapshots and MP4 video clips.
- Support for direct user chats, security operations teams, and supergroup channels.
- Interactive bot commands (`/status`, `/snapshot <camera>`, `/daily_summary`).

### 2.5 Tamper-Evident Evidence Vault & Storage Protection
- **SHA-256 Forensic Integrity:** Computes immutable cryptographic hashes over video recordings, snapshots, and metadata packages for court and insurance chain-of-custody.
- **Protected Recording Lock:** Permanently protects selected evidence from automated retention pruning.

### 2.6 Four Optimized Hardware Profiles (A, B, C, D)
- **Profile A (Older PC / Laptop):** CPU-only inference, 256MB SHM, lightweight 3–5 FPS detection, 2–4 cameras.
- **Profile B (Standard PC):** Intel/AMD VAAPI or Google Coral Edge TPU, 512MB SHM, 4–8 cameras.
- **Profile C (Advanced Server):** NVIDIA GPU with TensorRT / CUDA, 1024MB SHM, 8–16 cameras.
- **Profile D (Enterprise AI Cluster):** Multi-GPU with Ollama sidecar, 2048MB SHM, 16–64+ cameras.

### 2.7 Guided Setup Wizard (`/setup`)
- An intuitive 7-step onboarding wizard guiding operators through language selection, hardware profiling, administrator credentialing, camera discovery, AI tracking preferences, Telegram alerts, and storage setup.

### 2.8 Enterprise Turnkey Management Utilities
- `install.sh`: Interactive or unattended automated provisioning engine.
- `hardware-detect.sh`: Host architecture, RAM, and accelerator profiler.
- `healthcheck.sh`: Subsystem and endpoint health monitor.
- `backup.sh`: Atomic SQLite backup with SHA-256 archive creation.
- `restore.sh`: Cryptographically verified disaster recovery tool.
- `update.sh`: Zero-downtime service updater with automatic safety backups.
- `uninstall.sh`: Clean uninstaller with options to retain or purge recordings.

---

## 3. Verification & Test Metrics

- **Backend DCV API Integration Tests:** 17/17 tests passing with 100% success rate.
- **Baseline Frigate Unit Tests:** 58/58 passing with zero regressions.
- **Frontend Build Status:** React 18 + Vite compiles in 46.72s with zero TypeScript warnings or errors.
- **Container Configurations:** Validated across all 4 hardware profile compose specifications.

---
*DC VOLTAGE NETWORK — Intelligent Surveillance. Zero Blind Spots.*
