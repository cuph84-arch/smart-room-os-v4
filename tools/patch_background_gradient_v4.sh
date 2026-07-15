#!/data/data/com.termux/files/usr/bin/bash

set -e

FILE="style.css"
BACKUP="style.css.backup_before_gradient_v4"

echo "=== SMART ROOM OS V4 BACKGROUND PATCH V4 ==="


if [ ! -f "$FILE" ]; then
    echo "[ERROR] style.css tidak ditemukan"
    exit 1
fi


cp "$FILE" "$BACKUP"

echo "[OK] Backup:"
echo "$BACKUP"


python - <<'PY'
from pathlib import Path


file = Path("style.css")

lines = file.read_text(
    encoding="utf-8",
    errors="ignore"
).splitlines()


inside_body = False
body_found = False


for i, line in enumerate(lines):

    if line.strip() == "body {":
        inside_body = True
        body_found = True
        continue


    if inside_body and line.strip() == "}":
        inside_body = False
        continue


    if inside_body:

        if "min-height: 100vh;" in line:
            indent = line[:len(line)-len(line.lstrip())]

            lines[i] = (
                indent + "min-height: 100dvh;\n"
                + indent + "min-height: 100vh;"
            )


        if line.strip().startswith("background: linear-gradient"):

            indent = line[:len(line)-len(line.lstrip())]

            lines[i:i+1] = [
                indent + "background: linear-gradient(",
                indent + "  to top,",
                indent + "  #3e447c,",
                indent + "  #3b5087",
                indent + ");"
            ]


if not body_found:
    print("[ERROR] body tidak ditemukan")
else:
    file.write_text(
        "\n".join(lines) + "\n",
        encoding="utf-8"
    )

    print("[OK] body updated")


PY


echo
echo "=== VERIFY BODY ==="

grep -A12 "^body {" "$FILE"


echo
echo "=== COMPLETE ==="
