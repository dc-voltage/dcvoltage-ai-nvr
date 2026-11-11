#!/usr/bin/env bash
# ==============================================================================
# DC VOLTAGE AI NVR — TURNKEY INSTALLATION & PROVISIONING ENGINE
# Developer: DC VOLTAGE NETWORK
# Product: DC VOLTAGE AI NVR
# Tagline: Intelligent Surveillance. Zero Blind Spots.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default parameters
PROFILE_OVERRIDE=""
NON_INTERACTIVE=false
INSTALL_SYSTEMD=false
STORAGE_DIR_PARAM=""
SKIP_START=false

print_banner() {
    echo -e "${BOLD}${CYAN}====================================================================${NC}"
    echo -e "${BOLD}${CYAN}        DC VOLTAGE AI NVR — TURNKEY INSTALLER & PROVISIONER         ${NC}"
    echo -e "${BOLD}        Developer: DC VOLTAGE NETWORK                               ${NC}"
    echo -e "${BOLD}        Tagline: Intelligent Surveillance. Zero Blind Spots.        ${NC}"
    echo -e "${BOLD}${CYAN}====================================================================${NC}\n"
}

# Parse command line flags
while [[ $# -gt 0 ]]; do
    case "$1" in
        --profile|-p)
            PROFILE_OVERRIDE="${2:-}"
            shift 2
            ;;
        --non-interactive|-y)
            NON_INTERACTIVE=true
            shift
            ;;
        --systemd)
            INSTALL_SYSTEMD=true
            shift
            ;;
        --storage|-s)
            STORAGE_DIR_PARAM="${2:-}"
            shift 2
            ;;
        --skip-start)
            SKIP_START=true
            shift
            ;;
        --help|-h)
            echo "Usage: ./install.sh [OPTIONS]"
            echo "Options:"
            echo "  -p, --profile <A|B|C|D>  Specify hardware profile (skips prompt)"
            echo "  -y, --non-interactive    Run non-interactively with auto-detected defaults"
            echo "  -s, --storage <path>     Custom storage directory (default: ./storage)"
            echo "  --systemd                Install and enable systemd auto-start service"
            echo "  --skip-start             Configure environment without starting containers"
            echo "  -h, --help               Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown argument: $1${NC}"
            exit 1
            ;;
    esac
done

print_banner

# 1. Dependency Checks
echo -e "${BOLD}[1/6] Checking System Dependencies...${NC}"

if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}[ERROR] Docker is not installed. Please install Docker Engine first:${NC}"
    echo "  curl -fsSL https://get.docker.com | sh"
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    echo -e "${RED}[ERROR] Docker Compose plugin is missing. Please install docker-compose-plugin.${NC}"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo -e "${YELLOW}[WARNING] Docker daemon is not running or current user does not have permission.${NC}"
    echo -e "Attempting to check sudo docker access..."
    if ! sudo docker info >/dev/null 2>&1; then
        echo -e "${RED}[ERROR] Cannot connect to Docker daemon. Please ensure Docker is running.${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Docker & Docker Compose verified.${NC}\n"

# 2. Hardware Detection
echo -e "${BOLD}[2/6] Running Hardware Diagnostics & Profiler...${NC}"
chmod +x ./hardware-detect.sh
./hardware-detect.sh

DETECTED_PROFILE="B"
if [ -f .env.detected ]; then
    # shellcheck disable=SC1091
    source .env.detected
    DETECTED_PROFILE="${DCV_PROFILE:-B}"
fi

SELECTED_PROFILE="${PROFILE_OVERRIDE:-$DETECTED_PROFILE}"

if [ "$NON_INTERACTIVE" = false ] && [ -z "$PROFILE_OVERRIDE" ]; then
    echo -e "Detected Profile: ${BOLD}${GREEN}Profile ${DETECTED_PROFILE}${NC}"
    read -rp "Select Profile [A = Low-RAM CPU, B = Standard VAAPI/Coral, C = NVIDIA GPU, D = Enterprise Cluster] (Default: ${DETECTED_PROFILE}): " USER_CHOICE
    if [[ "$USER_CHOICE" =~ ^[AaBbCcDd]$ ]]; then
        SELECTED_PROFILE="${USER_CHOICE^^}"
    fi
fi
echo -e "${GREEN}✓ Selected Hardware Profile: Profile ${SELECTED_PROFILE}${NC}\n"

# 3. Directory Layout Preparation
echo -e "${BOLD}[3/6] Preparing Storage & Configuration Directories...${NC}"

STORAGE_BASE="${STORAGE_DIR_PARAM:-$SCRIPT_DIR/storage}"
mkdir -p "$SCRIPT_DIR/config"
mkdir -p "$STORAGE_BASE/recordings"
mkdir -p "$STORAGE_BASE/snapshots"
mkdir -p "$STORAGE_BASE/vault"
mkdir -p "$STORAGE_BASE/database"
mkdir -p "$STORAGE_BASE/cache"

echo -e "  • Config dir:   $SCRIPT_DIR/config"
echo -e "  • Storage dir:  $STORAGE_BASE"
echo -e "${GREEN}✓ Directory structure verified.${NC}\n"

# 4. Environment & Secrets Generation
echo -e "${BOLD}[4/6] Generating Secure Environment (.env)...${NC}"

DETECTOR_TYPE="cpu"
SHM_VAL="512mb"
case "$SELECTED_PROFILE" in
    A)
        SHM_VAL="256mb"
        DETECTOR_TYPE="cpu"
        ;;
    B)
        SHM_VAL="512mb"
        DETECTOR_TYPE="coral"
        ;;
    C)
        SHM_VAL="1024mb"
        DETECTOR_TYPE="tensorrt"
        ;;
    D)
        SHM_VAL="2048mb"
        DETECTOR_TYPE="tensorrt"
        ;;
esac

TZ_DETECTED="Asia/Kolkata"
if [ -f /etc/timezone ]; then
    TZ_DETECTED=$(cat /etc/timezone)
elif command -v timedatectl >/dev/null 2>&1; then
    TZ_DETECTED=$(timedatectl show -p Timezone --value 2>/dev/null || echo "Asia/Kolkata")
fi

DCV_SECRET=$(openssl rand -hex 24 2>/dev/null || head -c 24 /dev/urandom | tr -dc 'a-zA-Z0-9' || echo "dcv_secret_default_key_2026")

cat <<EOF > .env
# ==============================================================================
# DC VOLTAGE AI NVR — RUNTIME ENVIRONMENT CONFIGURATION
# Generated automatically by install.sh on $(date -u +"%Y-%m-%d %H:%M:%S UTC")
# ==============================================================================
DCV_PROFILE=${SELECTED_PROFILE}
SHM_SIZE=${SHM_VAL}
DETECTOR=${DETECTOR_TYPE}
TZ=${TZ_DETECTED}

CONFIG_DIR=${SCRIPT_DIR}/config
STORAGE_DIR=${STORAGE_BASE}

FRIGATE_RTSP_PASSWORD=$(openssl rand -hex 8 2>/dev/null || echo "dcv_rtsp_pass")
DCV_SECURITY_SECRET=${DCV_SECRET}

# Logging & Telemetry
DCV_LOG_LEVEL=INFO
DEFAULT_LANGUAGE=en
EOF

echo -e "${GREEN}✓ Configured .env with Profile ${SELECTED_PROFILE} (SHM: ${SHM_VAL}, Detector: ${DETECTOR_TYPE}, TZ: ${TZ_DETECTED}).${NC}\n"

# 5. Systemd Auto-Start Service (Optional)
echo -e "${BOLD}[5/6] Systemd Service Configuration...${NC}"
if [ "$INSTALL_SYSTEMD" = true ] || ([ "$NON_INTERACTIVE" = false ] && { read -rp "Install systemd service for automatic startup on boot? [y/N]: " SYS_RESP; [[ "$SYS_RESP" =~ ^[Yy]$ ]]; }); then
    SERVICE_FILE="/etc/systemd/system/dcv-nvr.service"
    TMP_SERVICE="/tmp/dcv-nvr.service"
    
    cat <<EOF > "$TMP_SERVICE"
[Unit]
Description=DC VOLTAGE AI NVR - Intelligent Universal Surveillance Platform
After=docker.service network-online.target
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${SCRIPT_DIR}
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    if [ -w /etc/systemd/system ]; then
        mv "$TMP_SERVICE" "$SERVICE_FILE"
        systemctl daemon-reload
        systemctl enable dcv-nvr.service
        echo -e "${GREEN}✓ Installed and enabled dcv-nvr.service.${NC}"
    elif command -v sudo >/dev/null 2>&1; then
        sudo mv "$TMP_SERVICE" "$SERVICE_FILE"
        sudo systemctl daemon-reload
        sudo systemctl enable dcv-nvr.service
        echo -e "${GREEN}✓ Installed and enabled dcv-nvr.service (via sudo).${NC}"
    else
        echo -e "${YELLOW}Cannot write to /etc/systemd/system without root/sudo. Service skipped.${NC}"
    fi
else
    echo -e "Systemd service installation skipped."
fi
echo ""

# 6. Service Startup & Verification
echo -e "${BOLD}[6/6] Launching DC VOLTAGE AI NVR Stack...${NC}"
chmod +x ./healthcheck.sh ./backup.sh ./restore.sh

if [ "$SKIP_START" = true ]; then
    echo -e "${YELLOW}Stack startup skipped (--skip-start specified).${NC}"
else
    COMPOSE_CMD="docker compose"
    if ! docker info >/dev/null 2>&1 && sudo docker info >/dev/null 2>&1; then
        COMPOSE_CMD="sudo docker compose"
    fi

    # Ensure local image exists or tag from upstream
    if ! docker image inspect dcvoltage/ai-nvr:latest >/dev/null 2>&1; then
        echo -e "Preparing base container image for DC VOLTAGE AI NVR..."
        docker pull ghcr.io/blakeblackshear/frigate:0.18.2
        docker tag ghcr.io/blakeblackshear/frigate:0.18.2 dcvoltage/ai-nvr:latest
    fi

    # Select profile override compose file if appropriate
    PROFILE_COMPOSE=""
    case "$SELECTED_PROFILE" in
        A) PROFILE_COMPOSE="-f docker-compose.yml -f docker-compose.profile-a.yml" ;;
        B) PROFILE_COMPOSE="-f docker-compose.yml -f docker-compose.profile-b.yml" ;;
        C) PROFILE_COMPOSE="-f docker-compose.yml -f docker-compose.profile-c.yml" ;;
        D) PROFILE_COMPOSE="-f docker-compose.yml -f docker-compose.profile-d.yml" ;;
    esac

    echo -e "Starting containers with ${BOLD}${PROFILE_COMPOSE:-docker-compose.yml}${NC}..."
    # shellcheck disable=SC2086
    $COMPOSE_CMD $PROFILE_COMPOSE up -d || {
        echo -e "${YELLOW}Retrying with base compose file...${NC}"
        $COMPOSE_CMD up -d
    }

    echo -e "\nWaiting 8 seconds for service initialization..."
    sleep 8
    ./healthcheck.sh || true
fi

# Detect host IP
HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo -e "\n${BOLD}${GREEN}====================================================================${NC}"
echo -e "${BOLD}${GREEN}     DC VOLTAGE AI NVR HAS BEEN INSTALLED SUCCESSFULLY!             ${NC}"
echo -e "${BOLD}${GREEN}====================================================================${NC}"
echo -e "  • Web Dashboard:       ${CYAN}http://${HOST_IP}:5000${NC}"
echo -e "  • Guided Setup Wizard: ${CYAN}http://${HOST_IP}:5000/setup${NC}"
echo -e "  • RTSP Stream Relay:   ${CYAN}rtsp://${HOST_IP}:8554${NC}"
echo -e "  • WebRTC Live Port:    ${CYAN}http://${HOST_IP}:8555${NC}"
echo -e "  • Active Profile:      ${BOLD}Profile ${SELECTED_PROFILE}${NC}"
echo -e "  • Brand:               DC VOLTAGE NETWORK"
echo -e "  • Tagline:             Intelligent Surveillance. Zero Blind Spots."
echo -e "${BOLD}${GREEN}====================================================================${NC}\n"
