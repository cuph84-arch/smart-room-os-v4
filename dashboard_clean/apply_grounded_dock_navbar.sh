#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_grounded_dock_$(date +%Y%m%d_%H%M%S).css"

cp "$CSS" "$BACKUP"

python - <<'PY'
from pathlib import Path
import re

p = Path("style.css")
css = p.read_text()

css = re.sub(
r"\.bottom-nav,\n\.nav-bar\s*\{[\s\S]*?\n\}",
""".bottom-nav,
.nav-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: grid;
  grid-template-columns: 1fr 1fr 3.25rem 1fr 1fr;
  align-items: center;
  gap: 0.32rem;
  width: 100%;
  padding: 0.75vh 1.25rem max(0.75vh, env(safe-area-inset-bottom));
  border-radius: 1.35rem 1.35rem 0 0;
  transform: none;
  background: rgba(0, 0, 0, 0.48);
  border-top: 0.06em solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 -0.65rem 1.8rem rgba(0, 0, 0, 0.30),
    inset 0 0.05em 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(1.2vh) saturate(130%);
  -webkit-backdrop-filter: blur(1.2vh) saturate(130%);
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
  touch-action: manipulation;
  will-change: transform, backdrop-filter;
}""",
css
)

css = re.sub(
r"\.center-action\s*\{[\s\S]*?\n\}",
""".center-action {
  width: 2.75rem;
  aspect-ratio: 1;
  min-height: 2.75rem;
  justify-self: center;
  transform: translateY(-0.34rem);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.86);
  font-size: 1.28rem;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.38);
  border: 0.08em solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 0.65rem 1.35rem rgba(0, 0, 0, 0.30), inset 0 0.05em 0 rgba(255, 255, 255, 0.08);
}""",
css
)

css = re.sub(
r"\.center-action:active\s*\{[\s\S]*?\n\}",
""".center-action:active {
  transform: translateY(-0.34rem) scale(0.96);
}""",
css
)

p.write_text(css)
PY

echo "DONE: Grounded dock navbar applied."
echo "Backup: $BACKUP"
echo
grep -n "bottom-nav,\|nav-bar\|bottom: 0\|transform: none\|border-radius: 1.35rem 1.35rem 0 0" "$CSS"

pkill -f "python -m http.server 8081" 2>/dev/null || true
python -m http.server 8081 --bind 0.0.0.0
