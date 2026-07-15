#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_navbar_glow_padding_$(date +%Y%m%d_%H%M%S).css"

cp "$CSS" "$BACKUP"

python - <<'PY'
from pathlib import Path
import re

p = Path("style.css")
css = p.read_text()

css = re.sub(
r"  padding: 0\.65vh 0\.56rem;",
"""  padding-top: 0.65vh;
  padding-left: 0.56rem;
  padding-right: 0.56rem;
  padding-bottom: calc(0.65vh + 0.125rem);""",
css,
count=1
)

css = re.sub(
r"\.bottom-nav button,\n\.nav-bar button\s*\{[\s\S]*?\n\}",
""".bottom-nav button,
.nav-bar button {
  width: 2.55rem;
  aspect-ratio: 1;
  min-height: 2.55rem;
  justify-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rem;
  color: rgba(255, 255, 255, 0.35);
  background: transparent;
  font-size: 1.18rem;
  font-weight: 500;
  line-height: 1;
  opacity: 1;
  box-shadow: none !important;
  outline: none !important;
  transition: background 0.28s ease, color 0.28s ease, filter 0.28s ease, transform 0.28s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}""",
css
)

css = re.sub(
r"\.bottom-nav button:active,\n\.nav-bar button:active\s*\{[\s\S]*?\n\}",
""".bottom-nav button:active,
.nav-bar button:active {
  transform: scale(0.96);
  box-shadow: none !important;
  outline: none !important;
}""",
css
)

p.write_text(css)
PY

echo "DONE: Navbar glow padding fix applied."
echo "Backup: $BACKUP"

pkill -f "python -m http.server 8081" 2>/dev/null || true
python -m http.server 8081 --bind 0.0.0.0
