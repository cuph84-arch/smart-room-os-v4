#!/data/data/com.termux/files/usr/bin/bash
set -e

SRC="/storage/emulated/0/Download/Github_original_file"
DST="$HOME/smart-room-os-v4/offline_dev/dashboard_clean"

echo "=== APP.JS LOCKED SETUP ==="
echo "Source: $SRC/app.js"
echo "Target: $DST/app.js"

if [ ! -f "$SRC/app.js" ]; then
  echo "ERROR: app.js tidak ditemukan di $SRC"
  exit 1
fi

cp "$SRC/app.js" "$DST/app.js"

cat > "$DST/APP_JS_LOCKED.txt" <<'EOF'
APP.JS LOCKED

Rules:
- app.js hanya disalin sebagai dependency dashboard.
- app.js tidak boleh diedit.
- app.js hanya untuk render/binding/audit.
- Refactor berikutnya hanya CSS.
EOF

echo "DONE"
echo "app.js copied and locked."
echo
echo "Run:"
echo "cd $DST && python -m http.server 8081 --bind 127.0.0.1"
