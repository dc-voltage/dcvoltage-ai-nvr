#!/usr/bin/env bash
# ==============================================================================
# DC VOLTAGE AI NVR — SYSTEM RUNTIME HEALTH CHECK & DIAGNOSTICS
# Developer: DC VOLTAGE NETWORK
# Product: DC VOLTAGE AI NVR
# Tagline: Intelligent Surveillance. Zero Blind Spots.
# ==============================================================================

set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

HOST="${1:-127.0.0.1}"
PORT="${2:-5000}"
BASE_URL="http://${HOST}:${PORT}"

echo -e "${BOLD}${BLUE}====================================================================${NC}"
echo -e "${BOLD}${BLUE}       DC VOLTAGE AI NVR — HEALTH MONITOR & SYSTEM DIAGNOSTIC       ${NC}"
echo -e "${BOLD}       Developer: DC VOLTAGE NETWORK                                ${NC}"
echo -e "${BOLD}       Tagline: Intelligent Surveillance. Zero Blind Spots.         ${NC}"
echo -e "${BOLD}${BLUE}====================================================================${NC}\n"

ERRORS=0

# 1. API Responsiveness
echo -n "Checking API Gateway (${BASE_URL}/api/version)... "
if curl --fail --silent --max-time 5 "${BASE_URL}/api/version" >/dev/null 2>&1; then
    VERSION=$(curl --silent --max-time 5 "${BASE_URL}/api/version" 2>/dev/null || echo "Unknown")
    echo -e "${GREEN}${BOLD}ONLINE${NC} (Version: ${VERSION})"
else
    echo -e "${YELLOW}API not responding on ${BASE_URL} (Container may still be booting or stopped)${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 2. DC VOLTAGE Subsystems
echo -n "Checking DC VOLTAGE Subsystems (${BASE_URL}/api/dcv/cameras/health)... "
if curl --fail --silent --max-time 5 "${BASE_URL}/api/dcv/cameras/health" >/dev/null 2>&1 || curl --fail --silent --max-time 5 "${BASE_URL}/dcv/cameras/health" >/dev/null 2>&1; then
    echo -e "${GREEN}${BOLD}OPERATIONAL${NC}"
else
    echo -e "${YELLOW}Subsystem endpoint pending${NC}"
fi

# 3. Docker Service Check
if command -v docker >/dev/null 2>&1; then
    echo -n "Checking Docker container status... "
    CONTAINER_NAME=$(docker ps --format "{{.Names}}" | grep -E "dcvoltage|frigate" | head -n1)
    if [ -n "$CONTAINER_NAME" ]; then
        STATUS=$(docker inspect --format='{{.State.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "Unknown")
        echo -e "${GREEN}${BOLD}${CONTAINER_NAME} is ${STATUS}${NC}"
    else
        echo -e "${YELLOW}No active container matching 'dcvoltage' or 'frigate' found${NC}"
    fi
fi

# 4. Storage & Shared Memory
echo -e "\n${BOLD}Filesystem & Memory Buffer Status:${NC}"
df -h /dev/shm | awk 'NR==1 || NR==2 {print "  • " $0}'
df -h . | awk 'NR==2 {print "  • Application Disk Usage: " $3 " used / " $2 " total (" $5 " full)"}'

# Summary
echo -e "\n${BOLD}====================================================================${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}${BOLD}STATUS: ALL SYSTEMS HEALTHY & OPERATIONAL.${NC}"
else
    echo -e "${YELLOW}${BOLD}STATUS: SYSTEM REQUIRES ATTENTION ($ERRORS WARNINGS).${NC}"
fi
echo -e "${BOLD}====================================================================${NC}\n"
