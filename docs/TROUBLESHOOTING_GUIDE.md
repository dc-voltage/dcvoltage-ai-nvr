# DC VOLTAGE AI NVR — TROUBLESHOOTING & RECOVERY GUIDE
**Developer:** DC VOLTAGE NETWORK  
**Product:** DC VOLTAGE AI NVR  
**Tagline:** *Intelligent Surveillance. Zero Blind Spots.*  

---

## 1. Camera Connection & RTSP Stream Failures

### 1.1 Symptoms
- Camera status displays "Offline" or "Reconnecting".
- Green/grey corrupted frames or FFmpeg timeout errors in logs.
- RTSP probe test returns "Connection refused" or "401 Unauthorized".

### 1.2 Vendor-Specific RTSP Stream URL Reference

| Brand | Main Stream (Recording) | Substream (AI Detection) |
|---|---|---|
| **Hikvision** | `rtsp://admin:pass@<IP>:554/Streaming/Channels/101` | `rtsp://admin:pass@<IP>:554/Streaming/Channels/102` |
| **Dahua / Amcrest** | `rtsp://admin:pass@<IP>:554/cam/realmonitor?channel=1&subtype=0` | `rtsp://admin:pass@<IP>:554/cam/realmonitor?channel=1&subtype=1` |
| **CP Plus** | `rtsp://admin:pass@<IP>:554/cam/realmonitor?channel=1&subtype=0` | `rtsp://admin:pass@<IP>:554/cam/realmonitor?channel=1&subtype=1` |
| **TP-Link Tapo** | `rtsp://admin:pass@<IP>:554/stream1` | `rtsp://admin:pass@<IP>:554/stream2` |
| **Reolink** | `rtsp://admin:pass@<IP>:554/h264Preview_01_main` | `rtsp://admin:pass@<IP>:554/h264Preview_01_sub` |
| **Imou / EZVIZ** | `rtsp://admin:pass@<IP>:554/live/ch0` | `rtsp://admin:pass@<IP>:554/live/ch1` |
| **Axis** | `rtsp://root:pass@<IP>:554/axis-media/media.amp` | `rtsp://root:pass@<IP>:554/axis-media/media.amp?videokeyframeinterval=30` |
| **Uniview** | `rtsp://admin:pass@<IP>:554/unicast/c1/s0/live` | `rtsp://admin:pass@<IP>:554/unicast/c1/s1/live` |

### 1.3 Remediation Steps
1. **Always Use Substreams for AI Detection:**
   Never point your AI `detect` input to a 4K 30FPS main stream on low-end hardware. Configure the substream (640x360 or 720x480 at 5 FPS) for detection, and the main stream solely for recording.
2. **Special Characters in Passwords:**
   If your camera password contains `@`, `:`, `/`, or `#`, URL-encode them in the RTSP path (e.g. `@` becomes `%40`).
3. **ONVIF Discovery Timeout:**
   Ensure UDP multicast traffic is permitted across your network switch or VLAN. If cameras are on a separate surveillance VLAN, add a secondary IP/interface to the host machine or use direct IP configuration.
4. **Test Stream via CLI:**
   ```bash
   ffprobe -rtsp_transport tcp -i "rtsp://admin:pass@<IP>:554/Streaming/Channels/102"
   ```

---

## 2. Hardware Acceleration & Detector Diagnostics

### 2.1 Intel / AMD VAAPI (`/dev/dri`)
If FFmpeg reports `Cannot open device /dev/dri/renderD128`:
1. Check device existence on host:
   ```bash
   ls -la /dev/dri
   ```
2. Check user permissions. Add the current user and docker service to the `render` and `video` groups:
   ```bash
   sudo usermod -aG video,render $USER
   sudo chmod 666 /dev/dri/renderD128
   ```
3. Test VAAPI decoding capability:
   ```bash
   vainfo --display drm --device /dev/dri/renderD128
   ```

### 2.2 Google Coral Edge TPU
If the detector fails to load or Coral TPU is not detected:
1. Verify USB device recognition:
   ```bash
   lsusb | grep -E "1a6e:089a|0960:0058|Google"
   ```
2. Verify udev rules exist (`/etc/udev/rules.d/99-edgetpu-accelerator.rules`):
   ```text
   SUBSYSTEM=="usb", ATTR{idVendor}=="1a6e", MODE="0666"
   SUBSYSTEM=="usb", ATTR{idVendor}=="0960", MODE="0666"
   ```
3. Reload udev rules:
   ```bash
   sudo udevadm control --reload-rules && sudo udevadm trigger
   ```
4. Ensure Coral is plugged into a native USB 3.0 (blue) port directly on the motherboard, not via unpowered hubs.

### 2.3 NVIDIA CUDA / TensorRT
If TensorRT detector fails with `CUDA driver version is insufficient`:
1. Verify NVIDIA Container Toolkit is installed on the host:
   ```bash
   nvidia-smi
   dpkg -l | grep -i nvidia-container-toolkit
   ```
2. Verify Docker GPU access:
   ```bash
   docker run --rm --gpus all nvidia/cuda:12.2.0-base-ubuntu22.04 nvidia-smi
   ```

---

## 3. Low-End PC & Laptop Optimization (Profile A)

When running on older laptops (e.g. Dual-Core, 4GB RAM):

### 3.1 Shared Memory (`/dev/shm`) Exhaustion
If you encounter `Bus error (core dumped)` or `Can't allocate shared memory`:
1. Check host shared memory size:
   ```bash
   df -h /dev/shm
   ```
2. In `docker-compose.profile-a.yml`, ensure `shm_size: 256mb` (or up to 35% of total RAM).
3. Reduce `detect: fps` in `config.yml` from default to `3` or `4` FPS.

### 3.2 High CPU Utilization
- **Disable Semantic Search on Low-RAM Devices:** In `config.yml`, set `semantic_search: enabled: false` if system RAM is below 6 GB.
- **Limit Detection Resolution:** Keep detection bounding box resolution at `640x360`.
- **CPU Governor:** Switch Linux CPU governor from powersave to performance:
  ```bash
  sudo cpupower frequency-set -g performance
  ```

---

## 4. Intelligent AI Assistant & LLM Connectivity

### 4.1 Local Ollama Unreachable
If the assistant queries return `Ollama service unavailable at http://127.0.0.1:11434`:
1. Verify Ollama service status:
   ```bash
   systemctl status ollama || curl http://127.0.0.1:11434/api/tags
   ```
2. If running Docker on Linux with `network_mode: host`, `http://127.0.0.1:11434` connects directly. If in bridge mode, use `http://host.docker.internal:11434`.

### 4.2 Google Gemini API Key Rate Limits
If Gemini responses fail:
1. Verify the key in `config/config.yml` or `.env` under `GEMINI_API_KEY`.
2. Ensure outgoing HTTPS (port 443) to `generativelanguage.googleapis.com` is not blocked by a corporate firewall or proxy.
3. The built-in deterministic fallback engine will automatically answer surveillance queries without interrupting operations.

---

## 5. Telegram Bot Notification Diagnostics

### 5.1 No Messages Received
1. Send `/start` to your bot in Telegram first. Telegram prevents bots from initiating unsolicited conversations with users.
2. If sending to a Telegram Group, ensure the bot has been added to the group and granted Admin or Send Messages permissions.
3. Chat ID for supergroups always begins with `-100` (e.g. `-1001987654321`). Ensure the minus sign is included.
4. Execute test notification:
   ```bash
   curl -X POST http://127.0.0.1:5000/dcv/telegram/test
   ```

---

## 6. Database Health & Lock Recovery

### 6.1 Database Locked (`sqlite3.OperationalError: database is locked`)
1. Frigate uses SQLite with WAL (Write-Ahead Logging). Stale lock files may occur after an abrupt system power loss.
2. Remove any orphaned lock files:
   ```bash
   cd /home/dc/Documents/nvr/config
   rm -f *.lock .runtime_state.json.lock
   ```
3. Run SQLite integrity check:
   ```bash
   sqlite3 config/frigate.db "PRAGMA integrity_check;"
   ```
4. If corruption is found, restore from the latest automated safety backup:
   ```bash
   ./restore.sh --archive backups/$(ls -t backups/*.tar.gz | head -1)
   ```

---
*DC VOLTAGE NETWORK — Intelligent Surveillance. Zero Blind Spots.*
