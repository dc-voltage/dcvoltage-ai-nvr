# DC VOLTAGE AI NVR — Hardware Compatibility & Performance Optimization Guide
**Product:** DC VOLTAGE AI NVR  
**Developer:** DC VOLTAGE NETWORK  
**Tagline:** Intelligent Surveillance. Zero Blind Spots.  
**Baseline Version:** Frigate 0.18.2  
**Target Architecture:** x86_64 & ARM64 (Linux & Windows WSL2)  

---

## 1. Core Hardware Philosophy

Surveillance systems must not be restricted to ultra-expensive AI cluster servers. **DC VOLTAGE AI NVR** is engineered from the ground up to operate reliably on older laptops and re-purposed desktop PCs, while scaling seamlessly to high-throughput enterprise servers with dedicated GPU acceleration.

---

## 2. Hardware Deployment Profiles

```
========================================================================================
PROFILE A: OLDER LAPTOP / LOW-POWER MINI PC
========================================================================================
Intended Scenario:   Residential, small shop, single entrance, budget deployment
Processor:           Intel Core i3/i5 (4th Gen or newer), AMD Ryzen 3 / Athlon (2-4 cores)
RAM:                 4 GB minimum (practical baseline), 8 GB recommended
Acceleration:        CPU-only fallback or Intel QuickSync / VAAPI
Camera Capacity:     1 to 2 IP cameras (Substream: 640x360 or 720p @ 5 FPS detect)
Recording:           1080p stream copied directly to disk (-c copy)
Detection FPS:       3 to 5 FPS (Motion-triggered inference only)
Inference Engine:    TFLite CPU or OpenVINO CPU
Optimization:        Adaptive frame skipping, motion mask tuning, zero re-encoding

========================================================================================
PROFILE B: STANDARD DESKTOP PC (RECOMMENDED SWEET SPOT)
========================================================================================
Intended Scenario:   Retail store, office, home surveillance (3 to 6 cameras)
Processor:           Intel Core i5/i7 (7th Gen or newer), AMD Ryzen 5 / 7 (4-8 cores)
RAM:                 8 GB to 16 GB
Acceleration:        Intel UHD/Iris Graphics (VAAPI/QSV) or Google Coral USB TPU / AMD Radeon
Camera Capacity:     4 to 8 IP cameras (Detect: 720p @ 5-7 FPS, Record: 1080p/2K @ 15-20 FPS)
Inference Engine:    Intel OpenVINO (iGPU) or Google Coral TPU (8-12 ms latency) or ONNX
Detection FPS:       5 to 8 FPS
Features Enabled:    Person, vehicle, face detection, line-crossing, Telegram bot, PWA

========================================================================================
PROFILE C: ADVANCED NVR SERVER
========================================================================================
Intended Scenario:   Commercial building, school campus, warehouse (8 to 16 cameras)
Processor:           Intel Core i7/i9, AMD Ryzen 7/9, Intel Xeon / AMD EPYC (8-16 cores)
RAM:                 16 GB to 32 GB
Acceleration:        NVIDIA GeForce GTX 1650/RTX 3060/4060 or Intel Arc A380/A770 or Dual Coral
Camera Capacity:     8 to 16 high-resolution IP cameras (4K recording + 1080p detect)
Inference Engine:    NVIDIA TensorRT / CUDA or OpenVINO GPU or Dual Coral
Detection FPS:       10 to 15 FPS
Features Enabled:    Full 30 analytics: ALPR, Face Recognition, Cross-Camera Re-ID, AI Assistant

========================================================================================
PROFILE D: HIGH-PERFORMANCE ENTERPRISE AI CLUSTER
========================================================================================
Intended Scenario:   Industrial plant, multi-building enterprise, airport (16 to 64+ cameras)
Processor:           Multi-socket Xeon / EPYC / AMD Threadripper (16-64+ cores)
RAM:                 32 GB to 128+ GB ECC
Acceleration:        NVIDIA RTX 4080/4090, RTX A4000/A5000/A6000 or Tesla L4
Camera Capacity:     16 to 64+ IP cameras
Inference Engine:    NVIDIA TensorRT FP16/INT8 concurrent multi-stream engines
Detection FPS:       15 to 30 FPS continuous real-time tracking
Features Enabled:    All 30 analytics + concurrent Local Ollama LLM + multi-channel ALPR
========================================================================================
```

---

## 3. Hardware Video Acceleration Matrix

Video decoding is the single most CPU-intensive task in video surveillance. DC VOLTAGE AI NVR integrates hardware-accelerated decoding across all major vendors:

| Vendor / Architecture | Driver / Technology | FFmpeg Acceleration Preset | Supported Codecs | Typical Decode Offload |
|---|---|---|---|---|
| **Intel (Gen 7-14, Core/Xeon)** | QuickSync Video | `preset-intel-qsv-h264`<br>`preset-intel-qsv-h265` | H.264, H.265/HEVC, MJPEG | 85% - 95% CPU reduction |
| **Intel / AMD / Generic Linux** | VA-API | `preset-vaapi` | H.264, H.265, VP9 | 75% - 90% CPU reduction |
| **NVIDIA (Pascal, Turing, Ampere, Ada)** | NVDEC / CUDA | `preset-nvidia-h264`<br>`preset-nvidia-h265` | H.264, H.265, AV1 | 90% - 98% CPU reduction |
| **AMD (Radeon RX, APUs, Mendocino)** | AMF / VA-API | `preset-vaapi-amf` | H.264, H.265 | 70% - 85% CPU reduction |
| **Rockchip (RK3588, RK3566)** | RKMPP | `preset-rkmpp` | H.264, H.265 | 80% - 92% CPU reduction |
| **Raspberry Pi 4 / 5 (ARM64)** | V4L2 M2M | `preset-rpi-64-h264`<br>`preset-rpi-64-h265` | H.264, H.265 | 60% - 75% CPU reduction |

---

## 4. AI Inference Accelerators & Latency Benchmarks

| Inference Hardware | Model Architecture | Quantization / Precision | Average Inference Time | Recommended Concurrency |
|---|---|---|---|---|
| **Intel CPU Fallback (i5-8250U)** | MobileNet SSD / YOLOv8n | FP32 | 45 - 85 ms | 1-2 cameras |
| **Intel iGPU (Iris Xe 96EU)** | YOLOv8n / OpenVINO | FP16 | 12 - 18 ms | 4-8 cameras |
| **Google Coral USB TPU** | MobileNet EdgeTPU | INT8 | 8 - 14 ms | 4-6 cameras |
| **Google Coral Dual PCIe TPU** | MobileNet EdgeTPU | INT8 | 4 - 8 ms | 8-12 cameras |
| **NVIDIA GTX 1650 (Turing)** | YOLOv8s TensorRT | FP16 | 6 - 10 ms | 6-10 cameras |
| **NVIDIA RTX 3060 (Ampere)** | YOLOv8m TensorRT | FP16 | 3 - 6 ms | 12-24 cameras |
| **NVIDIA RTX 4070 (Ada Lovelace)**| YOLOv8x TensorRT | FP16 / INT8 | 1.8 - 3.5 ms | 24-48 cameras |

---

## 5. Storage Calculation & Capacity Sizing Formulas

### 5.1 Video Storage Formula
$$\text{Storage Required (GB/day)} = \frac{\text{Bitrate (kbps)} \times 86400 \text{ seconds}}{8 \times 1024 \times 1024}$$

### 5.2 Storage Sizing Reference Table (Per Camera)

| Stream Resolution | Codec | Target Bitrate | Daily Storage (GB) | 30-Day Retention (GB) | 90-Day Retention (GB) |
|---|---|---|---|---|---|
| **720p @ 15 FPS** | H.264 | 1,024 kbps | 10.8 GB | 324 GB | 972 GB |
| **1080p @ 15 FPS** | H.264 | 2,048 kbps | 21.6 GB | 648 GB | 1.94 TB |
| **1080p @ 20 FPS** | H.265 | 1,536 kbps | 16.2 GB | 486 GB | 1.46 TB |
| **2K (1440p) @ 20 FPS** | H.265 | 3,072 kbps | 32.4 GB | 972 GB | 2.91 TB |
| **4K (2160p) @ 20 FPS** | H.265 | 6,144 kbps | 64.8 GB | 1.94 TB | 5.83 TB |

### 5.3 Multi-Tier Storage Topology
1. **Tier 1 (Hot NVMe/SSD):** Holds active shared memory (`/dev/shm`), rolling pre-event ring buffers, recent thumbnails, and SQLite database.
2. **Tier 2 (Warm Local HDD):** Continuous 24/7 video recordings retained for 7 to 30 days.
3. **Tier 3 (Cold Network Storage / NAS):** Long-term event archives, locked evidence clips, and encrypted backups over SMB/CIFS or NFS shares.

---

## 6. Optimization Strategies for Older Laptops & PCs

1. **Direct Stream Passthrough (`-c copy`):** Never re-encode recording streams. FFmpeg captures the native camera H.264/H.265 bitstream directly into MP4 containers, consuming less than 1% CPU per camera.
2. **Substream Decoupling:** Configure the low-resolution substream (e.g. 640x360 @ 5 FPS) for motion detection and deep learning inference, while recording the high-resolution main stream.
3. **Adaptive Detection FPS:** Scale down detection FPS from 5 FPS to 2 FPS when scenes are static, automatically scaling up to 7 FPS during active tracking.
4. **Motion-Gated Inference:** Evaluate deep learning detectors only when MOG2 motion filters indicate significant object displacement.
5. **Shared Memory Sizing:** Set `shm_size: "256mb"` to `"512mb"` in Docker to avoid swap thrashing while providing ample buffer for raw frames.

---

## 7. Conclusion
DC VOLTAGE AI NVR enables enterprise-level surveillance intelligence on ordinary laptops and standard PCs without requiring high-cost specialized servers, democratizing AI surveillance for home, commercial, and enterprise users alike.
