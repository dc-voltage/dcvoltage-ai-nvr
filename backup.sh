#!/usr/bin/env bash
# ==============================================================================
# DC VOLTAGE AI NVR — BACKUP & DISASTER RECOVERY UTILITY
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

BACKUP_DIR="${1:-./backups}"
CONFIG_DIR="${2:-./config}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="dcv_backup_${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

echo -e "${BOLD}${BLUE}====================================================================${NC}"
echo -e "${BOLD}${BLUE}          DC VOLTAGE AI NVR — SECURE BACKUP CREATOR                 ${NC}"
echo -e "${BOLD}          Developer: DC VOLTAGE NETWORK                             ${NC}"
echo -e "${BOLD}          Tagline: Intelligent Surveillance. Zero Blind Spots.      ${NC}"
echo -e "${BOLD}${BLUE}====================================================================${NC}\n"

if [ ! -d "$CONFIG_DIR" ]; then
    echo -e "${RED}Error: Configuration directory '$CONFIG_DIR' not found.${NC}"
    exit 1
fi

echo -e "Backing up configuration, database, and DCV settings from ${BOLD}$CONFIG_DIR${NC}..."

# Safe SQLite snapshot if sqlite3 is installed and db exists
if command -v sqlite3 >/dev/null 2>&1 && [ -f "$CONFIG_DIR/frigate.db" ]; then
    echo "Creating safe atomic SQLite backup of frigate.db..."
    sqlite3 "$CONFIG_DIR/frigate.db" ".backup '$CONFIG_DIR/backup.db'"
fi

# Create tar.gz archive excluding volatile lock files and sockets
tar -czf "${BACKUP_DIR}/${ARCHIVE_NAME}" \
    --exclude="*.lock" \
    --exclude="*.sock" \
    --exclude="model_cache" \
    -C "$CONFIG_DIR" .

# Generate SHA-256 integrity hash
cd "$BACKUP_DIR"
sha256sum "${ARCHIVE_NAME}" > "${ARCHIVE_NAME}.sha256"
cd - >/dev/null

ARCHIVE_SIZE=$(du -h "${BACKUP_DIR}/${ARCHIVE_NAME}" | awk '{print $1}')
HASH=$(cat "${BACKUP_DIR}/${ARCHIVE_NAME}.sha256" | awk '{print $1}')

echo -e "\n${BOLD}${GREEN}====================================================================${NC}"
echo -e "${BOLD}${GREEN}BACKUP COMPLETED SUCCESSFULLY${NC}"
echo -e "Archive:      ${BOLD}${BACKUP_DIR}/${ARCHIVE_NAME}${NC} (${ARCHIVE_SIZE})"
echo -e "SHA-256 Hash: ${BOLD}${HASH}${NC}"
echo -e "${BOLD}${GREEN}====================================================================${NC}\n"
