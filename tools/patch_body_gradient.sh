#!/data/data/com.termux/files/usr/bin/bash

set -e

FILE="style.css"
cp "$FILE" "$FILE.bak"

python3 <<'PY'
from pathlib import Path
import re
import sys

p = Path("style.css")
css = p.read_text(encoding="utf-8")

old = re.compile(
    r'background:\s*linear-gradient\(\s*'
    r'to\s+top,\s*'
    r'#3e447c,\s*'
    r'#3b5087\s*'
    r'\);',
    re.S
)

new = """background: linear-gradient(
    180deg,
    #3b5087 0%,
    #3b5087 45%,
    #3e447c 100%
  );"""

css2, n = old.subn(new, css, count=1)

if n != 1:
    print("[ERROR] Block gradient saat ini tidak ditemukan.")
    sys.exit(1)

p.write_text(css2, encoding="utf-8")
print("[OK] Gradient berhasil diperbarui.")
PY

echo
grep -A8 "^body {" style.css
