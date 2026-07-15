#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_navbar_depth_glitch_$(date +%Y%m%d_%H%M%S).css"

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
  left: 50%;
  bottom: max(0.62rem, env(safe-area-inset-bottom));
  z-index: 50;
  display: grid;
  grid-template-columns: 1fr 1fr 3.25rem 1fr 1fr;
  align-items: center;
  gap: 0.32rem;
  width: min(24.4rem, calc(100% - 2.5rem));
  padding: 0.65vh 0.56rem;
  border-radius: 1.35rem;
  transform: translate3d(-50%, 0, 0);
  background: rgba(0, 0, 0, 0.32);
  border: 0.05em solid rgba(255, 255, 255, 0.12);
  border-top: 0.06em solid rgba(255, 255, 255, 0.16);
  box-shadow:
    0 -0.45rem 1.4rem rgba(0, 0, 0, 0.25),
    0 1.1rem 2.6rem rgba(0, 0, 0, 0.32),
    inset 0 0.05em 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(1.5vh) saturate(135%);
  -webkit-backdrop-filter: blur(1.5vh) saturate(135%);
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  will-change: transform, backdrop-filter;
}""",
css
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
  transition: background 0.28s ease, color 0.28s ease, filter 0.28s ease, transform 0.28s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}""",
css
)

p.write_text(css)
PY

echo "DONE: Navbar depth + mobile scroll glitch fix applied."
echo "Backup: $BACKUP"

pkill -f "python -m http.server 8081" 2>/dev/null || true
python -m http.server 8081 --bind 0.0.0.0
