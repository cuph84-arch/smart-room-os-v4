#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_navbar_subpixel_final_$(date +%Y%m%d_%H%M%S).css"

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
  bottom: max(0.62rem, env(safe-area-inset-bottom));
  z-index: 50;
  display: grid;
  grid-template-columns: 1fr 1fr 3.25rem 1fr 1fr;
  align-items: center;
  gap: 0.32rem;
  width: min(24.4rem, calc(100% - 2.5rem));
  margin: 0 auto;
  padding: 0.65vh 0.56rem;
  border-radius: 1.35rem;
  transform: none;
  background: rgba(0, 0, 0, 0.48);
  background-clip: padding-box;
  border: 0.05em solid rgba(255, 255, 255, 0.10);
  border-top: 0.06em solid rgba(255, 255, 255, 0.16);
  box-shadow:
    0 -0.65rem 1.8rem rgba(0, 0, 0, 0.40),
    0 1.1rem 2.6rem rgba(0, 0, 0, 0.40),
    inset 0 0.05em 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(1.2vh) saturate(130%);
  -webkit-backdrop-filter: blur(1.2vh) saturate(130%);
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
  touch-action: manipulation;
  will-change: backdrop-filter;
}""",
css
)

p.write_text(css)
PY

echo "DONE: Navbar subpixel final tweak applied."
echo "Backup: $BACKUP"
grep -n "bottom-nav,\|left: 0;\|right: 0;\|margin: 0 auto;\|transform: none;\|background-clip: padding-box\|overflow: hidden" "$CSS"

pkill -f "python -m http.server 8081" 2>/dev/null || true
python -m http.server 8081 --bind 0.0.0.0
