#!/data/data/com.termux/files/usr/bin/bash
set -e

SRC="/storage/emulated/0/Download/Github_original_file"
DST="$HOME/smart-room-os-v4/offline_dev/dashboard_clean"

echo "=== OFFLINE DASHBOARD CLEAN SETUP ==="
echo "Source: $SRC"
echo "Target: $DST"

mkdir -p "$DST"

if [ ! -f "$SRC/index.html" ]; then
  echo "ERROR: index.html tidak ditemukan di $SRC"
  exit 1
fi

if [ ! -f "$SRC/cleanstyle.css" ]; then
  echo "ERROR: cleanstyle.css tidak ditemukan di $SRC"
  exit 1
fi

cp "$SRC/index.html" "$DST/index.html"
cp "$SRC/cleanstyle.css" "$DST/style.css"

cat > "$DST/README_OFFLINE.txt" <<'EOF'
OFFLINE DASHBOARD CLEAN

Source:
- index.html dari /Download/Github_original_file
- style.css dari cleanstyle.css
- HTML LOCKED
- CSS ONLY
EOF

echo "DONE"
echo "Run:"
echo "cd $DST && python -m http.server 8081 --bind 127.0.0.1"
