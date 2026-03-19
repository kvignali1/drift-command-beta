#!/bin/bash
set -euo pipefail

URL="${1:-http://127.0.0.1:5000}"

until curl -sSf "${URL}" >/dev/null; do
  sleep 1
done

export DISPLAY=:0
export XAUTHORITY=/home/pi/.Xauthority

/usr/bin/chromium-browser \
  --kiosk \
  --incognito \
  --disable-infobars \
  --noerrdialogs \
  --disable-session-crashed-bubble \
  --overscroll-history-navigation=0 \
  "${URL}"
