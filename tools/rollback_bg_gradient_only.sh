#!/data/data/com.termux/files/usr/bin/bash

set -e

FILE="style.css"
SOURCE="style.css.backup_before_gradient"
BACKUP="style.css.before_gradient_only_patch"

echo "=== SMART ROOM OS V4 ROLLBACK + BG ONLY PATCH ==="

if [ ! -f "$SOURCE" ]; then
    echo "[ERROR] Backup sumber tidak ditemukan:"
    echo "$SOURCE"
    exit 1
fi

cp "$FILE" "$BACKUP"
echo "[OK] Backup current:"
echo "$BACKUP"

cp "$SOURCE" "$FILE"
echo "[OK] Struktur CSS dikembalikan dari:"
echo "$SOURCE"

python - <<'PY'
from pathlib import Path

file = Path("style.css")

css = file.read_text(
    encoding="utf-8",
    errors="ignore"
)

old = "background: linear-gradient(180deg, #ffdb6e 0%, #ff9a6e 45%, #ff6a88 100%);"

new = """background: linear-gradient(
    to top,
    #3e447c,
    #3b5087
  );"""

count = css.count(old)

if count != 1:
    print("[ERROR] Background body tidak ditemukan atau jumlahnya tidak sesuai.")
    raise SystemExit(1)

css = css.replace(old, new, 1)

file.write_text(
    css,
    encoding="utf-8"
)

print("[OK] Hanya background body yang diubah.")
PY

echo
echo "=== VERIFY BODY ==="
grep -A12 "^body {" "$FILE"

echo
echo "=== COMPLETE ==="
