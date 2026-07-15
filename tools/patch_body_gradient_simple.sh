#!/data/data/com.termux/files/usr/bin/bash

set -e

FILE="style.css"
BACKUP="style.css.backup_before_simple_gradient"

echo "======================================"
echo " SMART ROOM OS V4"
echo " SIMPLE BODY GRADIENT PATCH"
echo "======================================"

[ -f "$FILE" ] || { echo "[ERROR] style.css tidak ditemukan"; exit 1; }

cp "$FILE" "$BACKUP"
echo "[OK] Backup : $BACKUP"

python3 <<'PY'
from pathlib import Path
import re
import sys

file = Path("style.css")
css = file.read_text(encoding="utf-8", errors="ignore")

pattern = re.compile(
    r'(body\s*\{.*?background\s*:\s*)linear-gradient\([^;]*\)(\s*;)',
    re.S
)

if not pattern.search(css):
    print("[ERROR] Background body tidak ditemukan. Tidak ada perubahan.")
    sys.exit(1)

css = pattern.sub(
    r'''\1linear-gradient(
    to top,
    #3e447c,
    #3b5087
  )\2''',
    css,
    count=1
)

file.write_text(css, encoding="utf-8")
print("[OK] Gradient body berhasil diganti.")
PY

echo
echo "=== VERIFY ==="
grep -A8 "^body {" "$FILE"

echo
echo "[OK] Selesai."
