# ==============================================================================
# DC VOLTAGE AI NVR — PRODUCTION CONTAINER DOCKERFILE
# Developer: DC VOLTAGE NETWORK
# Product: DC VOLTAGE AI NVR
# Tagline: Intelligent Surveillance. Zero Blind Spots.
# Baseline: Frigate 0.18.2
# ==============================================================================

FROM ghcr.io/blakeblackshear/frigate:0.18.2

LABEL maintainer="DC VOLTAGE NETWORK"
LABEL product="DC VOLTAGE AI NVR"
LABEL version="1.0.0"
LABEL description="Intelligent Universal AI Surveillance Platform. Zero Blind Spots."

# Install required runtime dependencies for DC VOLTAGE AI NVR
RUN pip3 install --no-cache-dir --break-system-packages \
    opencv-python-headless \
    py3nvml \
    unidecode \
    ws4py \
    joserfc \
    starlette-context \
    pathvalidate

# Overlay DC VOLTAGE enhanced backend and production frontend
COPY frigate-0.18.2/frigate /opt/frigate/frigate
COPY frigate-0.18.2/web/dist /opt/frigate/web

ENV DCV_PRODUCT="DC VOLTAGE AI NVR"
ENV DCV_BRAND="DC VOLTAGE NETWORK"
