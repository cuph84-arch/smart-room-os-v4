#!/data/data/com.termux/files/usr/bin/bash

set -e

FILE="style.css"
BACKUP="style.css.backup_before_gradient_v3"

echo "=== SMART ROOM OS V4 BACKGROUND PATCH V3 ==="

if [ ! -f "$FILE" ]; then
    echo "[ERROR] style.css tidak ditemukan"
    exit 1
fi

cp "$FILE" "$BACKUP"

echo "[OK] Backup:"
echo "$BACKUP"


python - <<'PY'
from pathlib import Path
import re


file = Path("style.css")

css = file.read_text(
    encoding="utf-8",
    errors="ignore"
)


pattern = r"(body\s*\{)(.*?)(\})"


def patch_body(match):

    start = match.group(1)
    block = match.group(2)
    end = match.group(3)


    # Replace any existing background declaration
    block, count = re.subn(
        r"background\s*:[^;]+;",
        """background: linear-gradient(
    to top,
    #3e447c,
    #3b5087
  );""",
        block,
        count=1
    )


    if count == 0:
        block += """
  background: linear-gradient(
    to top,
    #3e447c,
    #3b5087
  );
"""


    # Add dvh fallback
    if "min-height: 100dvh;" not in block:

        block = re.sub(
            r"min-height:\s*100vh;",
            """min-height: 100dvh;
  min-height: 100vh;""",
            block,
            count=1
        )


    return start + block + end



css, count = re.subn(
    pattern,
    patch_body,
    css,
    count=1,
    flags=re.S
)


if count == 0:
    print("[ERROR] body tidak ditemukan")
else:
    print("[OK] body patched")


file.write_text(
    css,
    encoding="utf-8"
)


print("[OK] FILE SAVED")

PY


echo
echo "=== VERIFY BODY ==="
grep -A12 "^body {" "$FILE"

echo
echo "=== COMPLETE ==="
