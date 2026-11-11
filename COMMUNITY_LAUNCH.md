# DC VOLTAGE AI NVR — COMMUNITY LAUNCH & ANNOUNCEMENT KIT
**Developer & Maintainer:** DC VOLTAGE NETWORK  
**Product:** DC VOLTAGE AI NVR  
**Tagline:** *Intelligent Surveillance. Zero Blind Spots.*  
**GitHub URL:** [https://github.com/dc-voltage/dcvoltage-ai-nvr](https://github.com/dc-voltage/dcvoltage-ai-nvr)  
**Docs Website:** [https://dc-voltage.github.io/dcvoltage-ai-nvr/](https://dc-voltage.github.io/dcvoltage-ai-nvr/)  

---

## 1. Reddit Post 1: r/selfhosted & r/homelab

**Subreddits:** `r/selfhosted`, `r/homelab`  
**Title:**  
> **Show Selfhosted: DC VOLTAGE AI NVR — Advanced Universal AI Surveillance Platform with 30 Vision Models, Local LLMs, and Runs Even on Old Laptops!**

**Post Body:**
```markdown
Hey r/selfhosted and r/homelab! 👋

Like many of you, I've tried various NVR solutions for my IP cameras over the years. While Frigate is a fantastic foundation for lightweight detection, we found ourselves wanting much deeper computer vision intelligence, seamless pluggable AI assistants, out-of-the-box universal camera discovery, and forensic-grade security without burning through hundreds of watts or requiring expensive cloud subscriptions.

Today, we are officially open-sourcing **DC VOLTAGE AI NVR v1.0.0**!

🔗 **GitHub:** https://github.com/dc-voltage/dcvoltage-ai-nvr  
🌐 **Documentation & Live Site:** https://dc-voltage.github.io/dcvoltage-ai-nvr/

### 🌟 What makes DC VOLTAGE AI NVR different?

1. **Universal IP Camera Support:**
   - Real-time ONVIF Profile S/T WS-Discovery multicast probe (`239.255.255.250:3702`).
   - Native ingestion for Hikvision, Dahua, CP Plus, TP-Link Tapo, Reolink, Imou, EZVIZ, Axis, Uniview, Amcrest, and USB webcams.
   - Built-in OpenCV live stream tester and motorized PTZ controls.

2. **30 Advanced AI Tracking Engines:**
   - Person & vehicle tracking with persistent multi-camera track IDs.
   - Face recognition with explicit consent enrollment.
   - Cross-camera human Re-Identification (Re-ID) across blind spots.
   - Automatic License Plate Recognition (ALPR) with Allow/Deny List registry.
   - Behavioral analytics: Loitering dwell time, restricted zone polygonal fences, tripwires.
   - Safety & hazard alarms: Sudden fall/collapse detection, visual smoke & fire hazards, and camera tampering (spray paint, defocus, redirection).

3. **Intelligent Bilingual AI Assistant (English & Malayalam):**
   - Natural language search over surveillance history: *"Was any vehicle detected near the warehouse after midnight?"* or in Malayalam: *"ഇന്ന് ഫ്രണ്ട് ഗേറ്റിൽ കാറുകൾ വന്നിരുന്നോ?"*
   - Pluggable backends: Local Ollama (`llama3`), Google Gemini (`gemini-2.5-flash`), OpenAI, or deterministic offline fallback.
   - Executive 24-hour security briefings automatically compiled daily.

4. **First-Class Telegram Alerts:**
   - Real-time event notifications with camera name, detection confidence %, high-resolution snapshot frame, and authorized MP4 video clip.
   - Interactive bot commands: `/status`, `/snapshot <camera>`, and `/daily_summary`.

5. **Tamper-Evident SHA-256 Storage Vault:**
   - Lock critical investigation footage from automatic retention pruning.
   - Export forensic packages with immutable SHA-256 cryptographic hashes for court chain-of-custody.

6. **4 Hardware Profiles (From 4GB Laptops to Multi-GPU Servers):**
   - **Profile A (Older PC / Laptop):** CPU-only inference, 256MB SHM buffer, 2–4 cameras at 3–5 FPS.
   - **Profile B (Standard PC):** Intel/AMD VAAPI or Google Coral TPU, 512MB SHM.
   - **Profile C (Advanced Server):** Dedicated NVIDIA GPU with TensorRT / CUDA, 1024MB SHM.
   - **Profile D (AI Cluster):** Multi-GPU + Ollama sidecar, 2048MB SHM.

### 🚀 Quick Start (60 Seconds):
```bash
git clone https://github.com/dc-voltage/dcvoltage-ai-nvr.git
cd dcvoltage-ai-nvr
./install.sh
```
Once launched, open `http://localhost:5000/setup` to complete the 7-step guided setup wizard!

We’d love to hear your feedback, feature requests, and see what hardware you're running it on!
```

---

## 2. Reddit Post 2: r/HomeAssistant & r/computervision

**Subreddits:** `r/HomeAssistant`, `r/computervision`  
**Title:**  
> **DC VOLTAGE AI NVR — Extending Frigate 0.18.2 with 30 AI Tracking Models, Re-ID, ALPR, Local LLM Assistant & Forensic Storage Vault**

**Post Body:**
```markdown
Hello everyone!

We wanted to share an open-source surveillance architecture we've built: **DC VOLTAGE AI NVR**.

Using Frigate 0.18.2's zero-copy shared memory POSIX architecture as our foundation, we deeply re-engineered the backend, computer vision pipeline, and frontend to create an end-to-end universal surveillance platform.

🔗 **Repository:** https://github.com/dc-voltage/dcvoltage-ai-nvr

### 🛠️ Key Technical Architecture & Additions:
- **Zero-Copy Ingestion:** `/dev/shm` IPC ring buffers with FFmpeg hardware acceleration (Intel QuickSync, AMD VAAPI, NVIDIA NVDEC).
- **FastAPI Core Extension:** Added decoupled `/dcv/` REST API namespaces while preserving 100% upstream Frigate API compatibility.
- **30 Multi-Object Tracking Capabilities:** Engineered state machines covering Cross-Camera Re-ID, ALPR OCR, Face Consent Enrollment with SQLite-vec vector embeddings, Loitering, Intrusion, Smoke/Fire detection, and Camera Tampering.
- **Bilingual Generative AI Layer:** Pluggable assistant service connecting to local Ollama endpoints or Gemini 2.5 Flash, generating daily incident summaries in both English and Malayalam.
- **Forensic Chain-of-Custody:** Tamper-evident evidence vault generating SHA-256 cryptographic packages with locked retention guarantees.
- **Full React 18 + Vite Frontend:** Includes a 7-step guided setup wizard (`/setup`), responsive dark mode, vector aperture branding, and complete native Malayalam translations.

Looking forward to your questions on our architecture and pipeline!
```

---

## 3. Hacker News: Show HN

**Title:**  
> **Show HN: DC VOLTAGE AI NVR – Universal AI Surveillance Platform with 30 Vision Models**

**Body:**
```text
Hi HN,

We built DC VOLTAGE AI NVR (https://github.com/dc-voltage/dcvoltage-ai-nvr), an open-source, universal AI Network Video Recorder built atop Frigate 0.18.2.

Most commercial NVRs lock you into proprietary ecosystems, while existing open-source solutions often require substantial manual configuration. We wanted an NVR that:
1. Auto-discovers any ONVIF/RTSP camera (Hikvision, Dahua, CP Plus, Tapo, Reolink, etc.) with a single click.
2. Supports 30 distinct tracking capabilities (cross-camera Re-ID, ALPR plate OCR, consent face enrollment, fall detection, loitering, smoke/fire).
3. Integrates a bilingual AI Assistant (English & Malayalam) for natural language surveillance queries via Ollama or Gemini.
4. Provides tamper-evident SHA-256 evidence vaulting for legal chain-of-custody.
5. Runs smoothly on older laptops (256MB SHM, CPU inference) all the way up to multi-GPU clusters.

Installer & Docker compose configurations are included:
$ git clone https://github.com/dc-voltage/dcvoltage-ai-nvr.git && cd dcvoltage-ai-nvr && ./install.sh

Architecture reports and docs: https://dc-voltage.github.io/dcvoltage-ai-nvr/

Feedback and critique are very welcome!
```

---

## 4. Product Hunt Launch Copy

- **Name:** DC VOLTAGE AI NVR
- **Tagline:** Intelligent Universal Surveillance. Zero Blind Spots.
- **Short Description:** An enterprise-grade universal AI surveillance and NVR platform with 30 vision tracking models, bilingual AI assistant (English & Malayalam), Telegram bot alerts, and tamper-evident SHA-256 forensic vaulting.
- **Pricing:** 100% Free & Open Source (MIT License).
- **First Comment by Maker:**
```text
Hey hunters! 🚀

We created DC VOLTAGE AI NVR to solve the biggest headaches in video surveillance: clunky proprietary software, vendor lock-in, and high false alarms.

With DC VOLTAGE AI NVR, you can plug in any standard IP camera (Hikvision, Dahua, Tapo, CP Plus, Reolink), run 30 advanced computer vision detectors locally, ask an AI assistant what happened today in natural English or Malayalam, and receive instant Telegram alerts with snapshots and MP4 clips.

Best of all, our turnkey installer auto-detects your PC's hardware and selects the perfect profile—whether you're reviving an old dual-core laptop or deploying a high-end server with NVIDIA GPUs.

Try it out and let us know what you think!
```

---

## 5. Twitter / X & LinkedIn Announcement Thread

```text
🚀 Excited to introduce DC VOLTAGE AI NVR v1.0.0!

An advanced, universal AI surveillance & NVR platform:
⚡ 30 Advanced Computer Vision Detectors (Re-ID, ALPR, Loitering, Tampering)
📹 Universal IP Cameras (ONVIF WS-Discovery & RTSP)
💬 Bilingual AI Assistant (English & Malayalam)
📱 Real-Time Telegram Alerts with Video Clips
🛡️ Tamper-Evident SHA-256 Storage Vault
💻 4 Profiles: From 4GB Laptops to Multi-GPU AI Clusters

100% Open Source:
👉 https://github.com/dc-voltage/dcvoltage-ai-nvr
👉 https://dc-voltage.github.io/dcvoltage-ai-nvr/

#OpenSource #ComputerVision #Surveillance #AI #SelfHosted #Python #React #Docker
```
