#!/usr/bin/env bash
# ==============================================================================
# DC VOLTAGE AI NVR — RESTORE & DISASTER RECOVERY UTILITY
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
NC='\033[0m'

ARCHIVE_PATH="${1:-}"
TARGET_CONFIG_DIR="${2:-./config}"

echo -e "${BOLD}${BLUE}====================================================================${NC}"
echo -e "${BOLD}${BLUE}          DC VOLTAGE AI NVR — RESTORATION UTILITY                   ${NC}"
echo -e "${BOLD}          Developer: DC VOLTAGE NETWORK                             ${NC}"
echo -e "${BOLD}          Tagline: Intelligent Surveillance. Zero Blind Spots.      ${NC}"
echo -e "${BOLD}${BLUE}====================================================================${NC}\n"

if [ -z "$ARCHIVE_PATH" ]; then
    # Look for most recent backup in ./backups
    if [ -d "./backups" ]; then
        ARCHIVE_PATH=$(ls -t ./backups/dcv_backup_*.tar.gz 2>/dev/null | head -n1 || echo "")
    fi
fi

if [ -z "$ARCHIVE_PATH" ] || [ ! -f "$ARCHIVE_PATH" ]; then
    echo -e "${RED}Error: Backup archive not found. Usage: ./restore.sh <path_to_backup.tar.gz>${NC}"
    exit 1
fi

echo -e "Target Archive: ${BOLD}${ARCHIVE_PATH}${NC}"
echo -e "Restore Target: ${BOLD}${TARGET_CONFIG_DIR}${NC}"

# Check for SHA-256 hash file and verify integrity
HASH_FILE="${ARCHIVE_PATH}.sha256"
if [ -f "$HASH_FILE" ]; then
    echo -n "Verifying cryptographic SHA-256 integrity hash... "
    ARCHIVE_DIR=$(dirname "$ARCHIVE_PATH")
    ARCHIVE_FILE=$(basename "$ARCHIVE_PATH")
    if (cd "$ARCHIVE_DIR" && sha256sum -c "${ARCHIVE_FILE}.sha256" >/dev/null 2>&1); then
        echo -e "${GREEN}${BOLD}PASSED (Cryptographically Verified)${NC}"
    else
        echo -e "${RED}${BOLD}FAILED! Archive corrupted or tampered!${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Warning: No .sha256 hash file found. Proceeding without checksum verification.${NC}"
fi

# Create target dir if needed
mkdir -p "$TARGET_CONFIG_DIR"

echo -e "Extracting archive into ${TARGET_CONFIG_DIR}..."
tar -xzf "$ARCHIVE_PATH" -C "$TARGET_CONFIG_DIR"

echo -e "\n${BOLD}${GREEN}====================================================================${NC}"
echo -e "${BOLD}${GREEN}RESTORATION COMPLETED SUCCESSFULLY${NC}"
echo -e "Restart the container with ${BOLD}docker compose restart${NC} to apply."
echo -e "${BOLD}${GREEN}====================================================================${NC}\n"
