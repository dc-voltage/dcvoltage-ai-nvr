#!/usr/bin/env bash
# ==============================================================================
# DC VOLTAGE AI NVR — ZERO-DOWNTIME UPDATE & MIGRATION ENGINE
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

NON_INTERACTIVE=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        -y|--non-interactive)
            NON_INTERACTIVE=true
            shift
            ;;
        -h|--help)
            echo "Usage: ./update.sh [OPTIONS]"
            echo "Options:"
            echo "  -y, --non-interactive  Run update without interactive confirmations"
            echo "  -h, --help             Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${BOLD}${CYAN}====================================================================${NC}"
echo -e "${BOLD}${CYAN}      DC VOLTAGE AI NVR — UPDATE & SERVICE MIGRATION UTILITY        ${NC}"
echo -e "${BOLD}      Developer: DC VOLTAGE NETWORK                                 ${NC}"
echo -e "${BOLD}      Tagline: Intelligent Surveillance. Zero Blind Spots.          ${NC}"
echo -e "${BOLD}${CYAN}====================================================================${NC}\n"

COMPOSE_CMD="docker compose"
if ! docker info >/dev/null 2>&1 && sudo docker info >/dev/null 2>&1; then
    COMPOSE_CMD="sudo docker compose"
fi

# 1. Pre-Update Backup
echo -e "${BOLD}[1/4] Performing Pre-Update Safety Backup...${NC}"
chmod +x ./backup.sh ./restore.sh ./healthcheck.sh ./hardware-detect.sh

LATEST_BACKUP_ARCHIVE=""
if ./backup.sh; then
    LATEST_BACKUP_ARCHIVE=$(ls -t backups/dcv_nvr_backup_*.tar.gz 2>/dev/null | head -1 || true)
    echo -e "${GREEN}✓ Safety backup created: ${LATEST_BACKUP_ARCHIVE}${NC}\n"
else
    echo -e "${RED}[ERROR] Backup failed. Aborting update to protect data integrity.${NC}"
    exit 1
fi

# 2. Check for Updates
echo -e "${BOLD}[2/4] Checking for Image & Code Updates...${NC}"

# If git repo is present, fetch latest tags
if [ -d .git ]; then
    echo "Checking git branch status..."
    git fetch --all --tags || true
fi

# Pull latest container images
echo "Pulling latest DC VOLTAGE container images..."
$COMPOSE_CMD pull || {
    echo -e "${YELLOW}Notice: Local image build or offline registry active. Proceeding...${NC}"
}

# 3. Reload Profiles & Apply Container Updates
echo -e "\n${BOLD}[3/4] Gracefully Restarting DC VOLTAGE AI NVR Stack...${NC}"

CURRENT_PROFILE="B"
if [ -f .env ]; then
    CURRENT_PROFILE=$(grep "^DCV_PROFILE=" .env | cut -d= -f2 || echo "B")
fi

PROFILE_COMPOSE=""
case "$CURRENT_PROFILE" in
    A) PROFILE_COMPOSE="-f docker-compose.yml -f docker-compose.profile-a.yml" ;;
    B) PROFILE_COMPOSE="-f docker-compose.yml -f docker-compose.profile-b.yml" ;;
    C) PROFILE_COMPOSE="-f docker-compose.yml -f docker-compose.profile-c.yml" ;;
    D) PROFILE_COMPOSE="-f docker-compose.yml -f docker-compose.profile-d.yml" ;;
esac

echo -e "Re-applying ${BOLD}${PROFILE_COMPOSE:-docker-compose.yml}${NC}..."
# shellcheck disable=SC2086
$COMPOSE_CMD $PROFILE_COMPOSE up -d --remove-orphans

# 4. Post-Update Health Verification
echo -e "\n${BOLD}[4/4] Verifying System Health & Endpoints...${NC}"
echo "Waiting 6 seconds for container startup..."
sleep 6

if ./healthcheck.sh; then
    echo -e "\n${BOLD}${GREEN}====================================================================${NC}"
    echo -e "${BOLD}${GREEN}      DC VOLTAGE AI NVR HAS BEEN UPDATED SUCCESSFULLY!              ${NC}"
    echo -e "${BOLD}${GREEN}====================================================================${NC}"
    echo -e "  • Active Profile:     Profile ${CURRENT_PROFILE}"
    echo -e "  • Health Status:      ALL SUBSYSTEMS OPERATIONAL"
    echo -e "  • Safety Backup:      ${LATEST_BACKUP_ARCHIVE}"
    echo -e "${BOLD}${GREEN}====================================================================${NC}\n"
else
    echo -e "\n${BOLD}${RED}====================================================================${NC}"
    echo -e "${BOLD}${RED}  [WARNING] Healthcheck failed after update!                        ${NC}"
    echo -e "${BOLD}${RED}====================================================================${NC}"
    echo -e "To rollback to the pre-update state, run:"
    echo -e "  ${BOLD}./restore.sh --archive ${LATEST_BACKUP_ARCHIVE}${NC}\n"
    exit 1
fi
