#!/data/data/com.termux/files/usr/bin/bash

set -e

PROJECT="$HOME/smart-room-os-v4/offline_dev"

cd "$PROJECT" || {
  echo "Project tidak ditemukan."
  exit 1
}

echo "======================================="
echo " SMART ROOM OS V4"
echo " MIGRATION TO V2"
echo "======================================="

STAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p backup/migration_$STAMP

echo
echo "[1/5] Backup file lama..."

for f in index.html style.css app.js connector.js
do
    if [ -f "$f" ]; then
        cp "$f" "backup/migration_$STAMP/$f"
        echo "Backup $f"
    fi
done

echo
echo "[2/5] Verifikasi source..."

FILES=(
index_v2.html
style_v2.css
app_v2.js
connector.js
)

for f in "${FILES[@]}"
do
    if [ ! -f "$f" ]; then
        echo "ERROR : $f tidak ditemukan"
        exit 1
    fi
done

echo
echo "[3/5] Migrasi..."

cp index_v2.html index.html
cp style_v2.css style.css
cp app_v2.js app.js

echo
echo "[4/5] Verifikasi hasil..."

echo "- index.html"
grep -n "<title>" index.html | head

echo
echo "- stylesheet"
grep -n "<link" index.html

echo
echo "- script"
grep -n "<script" index.html

echo
echo "- connector import"
grep -n "connector" app.js || true

echo
echo "[5/5] Selesai"

echo
echo "Backup disimpan di:"
echo "backup/migration_$STAMP"

echo
echo "======================================="
echo " MIGRATION SUCCESS"
echo "======================================="
