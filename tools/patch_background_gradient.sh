#!/data/data/com.termux/files/usr/bin/bash

set -e

FILE="style.css"
BACKUP="style.css.backup_before_gradient"

echo "=== SMART ROOM OS V4 BACKGROUND PATCH ==="

if [ ! -f "$FILE" ]; then
    echo "[ERROR] style.css tidak ditemukan"
    exit 1
fi

cp "$FILE" "$BACKUP"

echo "[OK] Backup dibuat:"
echo "$BACKUP"


python - <<'PY'
from pathlib import Path
import re

file = Path("style.css")

css = file.read_text(
    encoding="utf-8",
    errors="ignore"
)


# Update body block
body_pattern = r"(body\s*\{)(.*?)(\})"

def update_body(match):
    start = match.group(1)
    block = match.group(2)
    end = match.group(3)

    block = re.sub(
        r"background\s*:\s*linear-gradient\([^;]+\);",
        """background:
        linear-gradient(
            to top,
            #3e447c,
            #3b5087
        );""",
        block,
        flags=re.S
    )

    if "min-height: 100dvh" not in block:
        block = block.replace(
            "min-height: 100vh;",
            "min-height: 100dvh;\n    min-height: 100vh;"
        )

    return start + block + end


css, body_count = re.subn(
    body_pattern,
    update_body,
    css,
    count=1,
    flags=re.S
)


# Update phone-container height
phone_pattern = r"(\.phone-container\s*\{)(.*?)(\})"


def update_phone(match):
    start = match.group(1)
    block = match.group(2)
    end = match.group(3)

    if "height: 100vh;" in block:
        block = block.replace(
            "height: 100vh;",
            "height: 100dvh;\n    height: 100vh;"
        )

    if "min-height: 100dvh;" not in block:
        block = block.replace(
            "min-height: 100vh;",
            "min-height: 100dvh;\n    min-height: 100vh;"
        )

    return start + block + end


css, phone_count = re.subn(
    phone_pattern,
    update_phone,
    css,
    count=1,
    flags=re.S
)


if body_count == 0:
    print("[WARNING] body selector tidak ditemukan")

if phone_count == 0:
    print("[WARNING] phone-container selector tidak ditemukan")


file.write_text(
    css,
    encoding="utf-8"
)

print("[OK] Patch selesai")

PY


echo
echo "=== VERIFY ==="

grep -A12 "body {" style.css | head -20

echo

grep -A8 ".phone-container {" style.css | head -15

echo
echo "=== DONE ==="
