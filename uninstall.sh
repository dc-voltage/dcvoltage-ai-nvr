#!/usr/bin/env bash
# ==============================================================================
# DC VOLTAGE AI NVR — CLEAN UNINSTALLATION & PURGE UTILITY
# Developer: DC VOLTAGE NETWORK
# Product: DC VOLTAGE AI NVR
# Tagline: Intelligent Surveillance. Zero Blind Spots.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BOLD='\033[1m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PURGE_DATA=false
PURGE_CONFIG=false
NON_INTERACTIVE=false

echo -e "${BOLD}${RED}====================================================================${NC}"
echo -e "${BOLD}${RED}           DC VOLTAGE AI NVR — UNINSTALLATION UTILITY               ${NC}"
echo -e "${BOLD}           Developer: DC VOLTAGE NETWORK                            ${NC}"
echo -e "${BOLD}           Tagline: Intelligent Surveillance. Zero Blind Spots.     ${NC}"
echo -e "${BOLD}${RED}====================================================================${NC}\n"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --purge-all)
            PURGE_DATA=true
            PURGE_CONFIG=true
            NON_INTERACTIVE=true
            shift
            ;;
        --keep-data)
            PURGE_DATA=false
            PURGE_CONFIG=false
            NON_INTERACTIVE=true
            shift
            ;;
        --purge-data)
            PURGE_DATA=true
            shift
            ;;
        --non-interactive|-y)
            NON_INTERACTIVE=true
            shift
            ;;
        --help|-h)
            echo "Usage: ./uninstall.sh [OPTIONS]"
            echo "Options:"
            echo "  --purge-all         Remove containers, configs, and all recording footage"
            echo "  --keep-data         Remove containers and services but preserve configs and recordings"
            echo "  --purge-data        Purge storage recordings and snapshots"
            echo "  -y, --non-interactive Skip interactive prompts"
            echo "  -h, --help          Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

if [ "$NON_INTERACTIVE" = false ]; then
    echo -e "${YELLOW}Warning: This will stop and remove all DC VOLTAGE AI NVR containers.${NC}"
    read -rp "Are you sure you want to proceed with uninstallation? [y/N]: " CONFIRM
    if ! [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
        echo "Uninstallation cancelled."
        exit 0
    fi

    read -rp "Purge video recordings, snapshots, and evidence vault? [y/N] (Default: N): " PURGE_DATA_RESP
    if [[ "$PURGE_DATA_RESP" =~ ^[Yy]$ ]]; then
        PURGE_DATA=true
    fi

    read -rp "Purge configuration files and credentials? [y/N] (Default: N): " PURGE_CFG_RESP
    if [[ "$PURGE_CFG_RESP" =~ ^[Yy]$ ]]; then
        PURGE_CONFIG=true
    fi
fi

# 1. Stop Systemd Service
echo -e "\n${BOLD}[1/4] Stopping and removing systemd auto-start service...${NC}"
if systemctl list-unit-files 2>/dev/null | grep -q "dcv-nvr.service"; then
    if [ -w /etc/systemd/system/dcv-nvr.service ]; then
        systemctl stop dcv-nvr.service || true
        systemctl disable dcv-nvr.service || true
        rm -f /etc/systemd/system/dcv-nvr.service
        systemctl daemon-reload
        echo -e "${GREEN}✓ Removed dcv-nvr.service.${NC}"
    elif command -v sudo >/dev/null 2>&1; then
        sudo systemctl stop dcv-nvr.service || true
        sudo systemctl disable dcv-nvr.service || true
        sudo rm -f /etc/systemd/system/dcv-nvr.service
        sudo systemctl daemon-reload
        echo -e "${GREEN}✓ Removed dcv-nvr.service (via sudo).${NC}"
    fi
else
    echo "No systemd service found."
fi

# 2. Stop Docker Containers
echo -e "\n${BOLD}[2/4] Stopping and removing Docker containers and networks...${NC}"
COMPOSE_CMD="docker compose"
if ! docker info >/dev/null 2>&1 && sudo docker info >/dev/null 2>&1; then
    COMPOSE_CMD="sudo docker compose"
fi

$COMPOSE_CMD down --volumes --remove-orphans || true
echo -e "${GREEN}✓ Docker containers stopped and removed.${NC}"

# 3. Clean Storage / Retention Data if requested
echo -e "\n${BOLD}[3/4] Processing Storage & Recordings Data...${NC}"
STORAGE_PATH="$SCRIPT_DIR/storage"
if [ -f .env ]; then
    ENV_STORAGE=$(grep "^STORAGE_DIR=" .env | cut -d= -f2 || true)
    if [ -n "$ENV_STORAGE" ] && [ -d "$ENV_STORAGE" ]; then
        STORAGE_PATH="$ENV_STORAGE"
    fi
fi

if [ "$PURGE_DATA" = true ]; then
    echo -e "${RED}Purging storage directory: ${STORAGE_PATH}...${NC}"
    rm -rf "$STORAGE_PATH"
    echo -e "${GREEN}✓ Storage data purged.${NC}"
else
    echo -e "${GREEN}✓ Video recordings and evidence vault preserved at: ${STORAGE_PATH}${NC}"
fi

# 4. Clean Configuration if requested
echo -e "\n${BOLD}[4/4] Processing Configuration & Environment...${NC}"
if [ "$PURGE_CONFIG" = true ]; then
    echo -e "${RED}Purging configuration directory...${NC}"
    rm -rf "$SCRIPT_DIR/config"
    rm -f "$SCRIPT_DIR/.env"
    rm -f "$SCRIPT_DIR/.env.detected"
    echo -e "${GREEN}✓ Configuration files purged.${NC}"
else
    echo -e "${GREEN}✓ Configuration files preserved at: $SCRIPT_DIR/config${NC}"
fi

echo -e "\n${BOLD}${GREEN}====================================================================${NC}"
echo -e "${BOLD}${GREEN}     DC VOLTAGE AI NVR HAS BEEN SUCCESSFULLY UNINSTALLED!          ${NC}"
echo -e "${BOLD}${GREEN}====================================================================${NC}\n"
