#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_navbar_active_soft_$(date +%Y%m%d_%H%M%S).css"

cp "$CSS" "$BACKUP"

python - <<'PY'
from pathlib import Path
import re

p = Path("style.css")
css = p.read_text()

css = re.sub(r"\n  contain: layout style paint;", "", css)
css = re.sub(r"\n  isolation: isolate;", "", css)
css = re.sub(r"\n  overflow: hidden;", "", css)

css = re.sub(
r"\.bottom-nav button\.active,\n\.nav-bar button\.active\s*\{[\s\S]*?\n\}",
""".bottom-nav button.active,
.nav-bar button.active {
  color: rgba(255, 255, 255, 1);
  background: rgba(255, 255, 255, 0.18);
  border: 0.06em solid rgba(255, 255, 255, 0.28);
  border-radius: 999rem;
  box-shadow:
    inset 0 0.05em 0 rgba(255, 255, 255, 0.20),
    0 0.45rem 1rem rgba(0, 0, 0, 0.22);
  filter: none;
  transform: translateY(-0.05rem);
}""",
css
)

css = re.sub(
r"\.bottom-nav button\.active \.nav-icon,\n\.nav-bar button\.active \.nav-icon\s*\{[\s\S]*?\n\}",
""".bottom-nav button.active .nav-icon,
.nav-bar button.active .nav-icon {
  filter: brightness(0) invert(1) opacity(1);
}""",
css
)

p.write_text(css)
PY

echo "DONE: Navbar active soft glass fixed."
echo "Backup: $BACKUP"

pkill -f "python -m http.server 8081" 2>/dev/null || true
python -m http.server 8081 --bind 0.0.0.0
