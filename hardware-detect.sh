#!/usr/bin/env bash
# ==============================================================================
# DC VOLTAGE AI NVR — HARDWARE DETECTION & PROFILE RECOMMENDER
# Developer: DC VOLTAGE NETWORK
# Product: DC VOLTAGE AI NVR
# Tagline: Intelligent Surveillance. Zero Blind Spots.
# ==============================================================================

set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}====================================================================${NC}"
echo -e "${BOLD}${BLUE}     DC VOLTAGE AI NVR — HARDWARE PROFILER & DIAGNOSTIC UTILITY     ${NC}"
echo -e "${BOLD}     Developer: DC VOLTAGE NETWORK                                  ${NC}"
echo -e "${BOLD}     Tagline: Intelligent Surveillance. Zero Blind Spots.           ${NC}"
echo -e "${BOLD}${BLUE}====================================================================${NC}\n"

# 1. CPU Detection
CPU_MODEL=$(grep -m1 "model name" /proc/cpuinfo | cut -d: -f2 | sed 's/^[ \t]*//')
CPU_CORES=$(nproc)
echo -e "${BOLD}CPU Architecture:${NC} $(uname -m)"
echo -e "${BOLD}CPU Model:${NC} ${CPU_MODEL}"
echo -e "${BOLD}CPU Cores/Threads:${NC} ${CPU_CORES}"

# 2. RAM Detection
TOTAL_RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
TOTAL_RAM_GB=$(awk "BEGIN {printf \"%.1f\", ${TOTAL_RAM_KB}/1048576}")
echo -e "${BOLD}Total Physical RAM:${NC} ${TOTAL_RAM_GB} GB"

# 3. GPU / Hardware Acceleration Detection
INTEL_GPU=false
AMD_GPU=false
NVIDIA_GPU=false
CORAL_TPU=false

if command -v lspci >/dev/null 2>&1; then
    if lspci | grep -i "vga\|3d\|display" | grep -i "intel" >/dev/null 2>&1; then
        INTEL_GPU=true
    fi
    if lspci | grep -i "vga\|3d\|display" | grep -i -E "amd|ati|radeon" >/dev/null 2>&1; then
        AMD_GPU=true
    fi
    if lspci | grep -i "vga\|3d\|display" | grep -i "nvidia" >/dev/null 2>&1; then
        NVIDIA_GPU=true
    fi
fi

if command -v lsusb >/dev/null 2>&1; then
    if lsusb | grep -i "1a6e:089a\|0960:0058\|Google" >/dev/null 2>&1; then
        CORAL_TPU=true
    fi
fi

echo -e "\n${BOLD}Hardware Accelerators Detected:${NC}"
echo -e "  • Intel iGPU / QuickSync: $([ "$INTEL_GPU" = true ] && echo -e "${GREEN}YES${NC}" || echo "NO")"
echo -e "  • AMD Radeon / APU:       $([ "$AMD_GPU" = true ] && echo -e "${GREEN}YES${NC}" || echo "NO")"
echo -e "  • NVIDIA CUDA / TensorRT: $([ "$NVIDIA_GPU" = true ] && echo -e "${GREEN}YES${NC}" || echo "NO")"
echo -e "  • Google Coral Edge TPU:  $([ "$CORAL_TPU" = true ] && echo -e "${GREEN}YES${NC}" || echo "NO")"

# 4. Storage Detection
DISK_FREE_GB=$(df -BG /home 2>/dev/null | tail -1 | awk '{print $4}' | tr -d 'G')
echo -e "${BOLD}Available Storage Disk:${NC} ${DISK_FREE_GB} GB free"

# 5. Profile Determination Algorithm
RECOMMENDED_PROFILE="B"
REASON=""

if [ "$NVIDIA_GPU" = true ] && (( $(echo "$TOTAL_RAM_GB >= 30.0" | bc -l 2>/dev/null || echo 0) )); then
    RECOMMENDED_PROFILE="D"
    REASON="High-performance system with NVIDIA GPU and 32GB+ RAM. Ideal for multi-model concurrent AI and high camera counts."
elif [ "$NVIDIA_GPU" = true ]; then
    RECOMMENDED_PROFILE="C"
    REASON="Dedicated NVIDIA GPU detected with TensorRT acceleration support. Recommended for 8-16 cameras."
elif (( $(echo "$TOTAL_RAM_GB <= 7.5" | bc -l 2>/dev/null || echo 0) )) && [ "$INTEL_GPU" = false ] && [ "$AMD_GPU" = false ]; then
    RECOMMENDED_PROFILE="A"
    REASON="Older PC/Laptop with limited RAM and CPU-only decoding. Configured for lightweight 3-5 FPS detection and low memory usage."
else
    RECOMMENDED_PROFILE="B"
    REASON="Standard Desktop/Laptop PC with adequate RAM (${TOTAL_RAM_GB} GB) and hardware acceleration. Recommended for 4-8 cameras."
fi

echo -e "\n${BOLD}${GREEN}====================================================================${NC}"
echo -e "${BOLD}${GREEN}RECOMMENDED HARDWARE PROFILE: PROFILE ${RECOMMENDED_PROFILE}${NC}"
echo -e "${REASON}"
echo -e "${BOLD}${GREEN}====================================================================${NC}\n"

# Export profile recommendation
echo "DCV_PROFILE=${RECOMMENDED_PROFILE}" > .env.detected
echo -e "Profile saved to ${BOLD}.env.detected${NC}. Use this when launching Docker Compose.\n"
