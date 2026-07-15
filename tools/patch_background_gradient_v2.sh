#!/data/data/com.termux/files/usr/bin/bash

set -e

FILE="style.css"
BACKUP="style.css.backup_before_gradient_v2"

echo "=== SMART ROOM OS V4 BACKGROUND PATCH V2 ==="

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


# ==========================
# BODY PATCH
# ==========================

body_match = re.search(
    r"(body\s*\{)(.*?)(\})",
    css,
    re.S
)


if body_match:

    body = body_match.group(2)

    # gradient
    body = re.sub(
        r"background\s*:\s*linear-gradient\([^;]+\);",
        """background: linear-gradient(
    to top,
    #3e447c,
    #3b5087
  );""",
        body,
        flags=re.S
    )


    # min-height
    body = re.sub(
        r"min-height:\s*100vh;",
        "min-height: 100dvh;\n  min-height: 100vh;",
        body,
        count=1
    )


    css = (
        css[:body_match.start(2)]
        + body
        + css[body_match.end(2):]
    )

    print("[OK] body updated")

else:
    print("[WARNING] body tidak ditemukan")


# ==========================
# PHONE CONTAINER PATCH
# ==========================

phone_match = re.search(
    r"(\.app\.phone-container\s*\{)(.*?)(\})",
    css,
    re.S
)


if phone_match:

    block = phone_match.group(2)


    block = re.sub(
        r"height:\s*100vh;",
        "height: 100dvh;\n  height: 100vh;",
        block,
        count=1
    )


    block = re.sub(
        r"min-height:\s*100vh;",
        "min-height: 100dvh;\n  min-height: 100vh;",
        block,
        count=1
    )


    css = (
        css[:phone_match.start(2)]
        + block
        + css[phone_match.end(2):]
    )

    print("[OK] phone-container updated")

else:
    print("[WARNING] .app.phone-container tidak ditemukan")


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
echo "=== VERIFY PHONE ==="
grep -A10 ".app.phone-container {" "$FILE"

echo
echo "=== COMPLETE ==="
