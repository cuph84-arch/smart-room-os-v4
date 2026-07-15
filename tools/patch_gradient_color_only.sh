#!/data/data/com.termux/files/usr/bin/bash

set -e

FILE="style.css"
BACKUP="style.css.backup_before_color_only"

echo "======================================"
echo " SMART ROOM OS V4"
echo " PATCH COLOR ONLY"
echo "======================================"

[ -f "$FILE" ] || {
    echo "[ERROR] style.css tidak ditemukan"
    exit 1
}

cp "$FILE" "$BACKUP"
echo "[OK] Backup dibuat: $BACKUP"

python3 <<'PY'
from pathlib import Path
import re
import sys

file = Path("style.css")
css = file.read_text(encoding="utf-8", errors="ignore")

old = (
    "linear-gradient(180deg, "
    "#ffdb6e 0%, "
    "#ff9a6e 45%, "
    "#ff6a88 100%)"
)

new = (
    "linear-gradient(180deg, "
    "#3b5087 0%, "
    "#3b5087 45%, "
    "#3e447c 100%)"
)

if old not in css:
    print("[ERROR] Gradient asli tidak ditemukan. Patch dibatalkan.")
    sys.exit(1)

css = css.replace(old, new, 1)

file.write_text(css, encoding="utf-8")

print("[OK] Warna gradient berhasil diganti.")
PY

echo
echo "=== VERIFY ==="
grep -A8 "^body {" "$FILE"

echo
echo "[OK] Selesai."
