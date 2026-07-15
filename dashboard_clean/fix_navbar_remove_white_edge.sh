#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_navbar_remove_white_edge_$(date +%Y%m%d_%H%M%S).css"

cp "$CSS" "$BACKUP"

python - <<'PY'
from pathlib import Path
import re

p = Path("style.css")
css = p.read_text()

css = re.sub(
r"  border: 0\.05em solid rgba\(255, 255, 255, 0\.10\);",
"  border: 0.05em solid rgba(0, 0, 0, 0.18);",
css,
count=1
)

css = re.sub(
r"""  box-shadow:
    0 -0\.65rem 1\.8rem rgba\(0, 0, 0, 0\.40\),
    0 1\.1rem 2\.6rem rgba\(0, 0, 0, 0\.40\),
    inset 0 0\.05em 0 rgba\(255, 255, 255, 0\.06\);""",
"""  box-shadow:
    0 -0.65rem 1.8rem rgba(0, 0, 0, 0.40),
    0 1.1rem 2.6rem rgba(0, 0, 0, 0.40);""",
css,
count=1
)

p.write_text(css)
PY

echo "DONE: Navbar white edge removed."
echo "Backup: $BACKUP"
grep -n -A32 "^\.bottom-nav," "$CSS" | head -n 40

pkill -f "python -m http.server 8081" 2>/dev/null || true
python -m http.server 8081 --bind 0.0.0.0
