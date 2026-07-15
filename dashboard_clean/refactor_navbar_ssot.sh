#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_navbar_ssot_$(date +%Y%m%d_%H%M%S).css"

cp "$CSS" "$BACKUP"

python - <<'PY'
from pathlib import Path
import re

p = Path("style.css")
css = p.read_text()

patterns = [
    r"\.bottom-nav,\n\.nav-bar\s*\{[\s\S]*?\n\}",
    r"\.bottom-nav button,\n\.nav-bar button\s*\{[\s\S]*?\n\}",
    r"\.bottom-nav button\.active,\n\.nav-bar button\.active\s*\{[\s\S]*?\n\}",
    r"\.bottom-nav button\.active \.nav-icon,\n\.nav-bar button\.active \.nav-icon\s*\{[\s\S]*?\n\}",
    r"\.nav-icon\s*\{[\s\S]*?\n\}",
    r"\.center-action\s*\{[\s\S]*?\n\}",
    r"\.center-action:active\s*\{[\s\S]*?\n\}",
    r"\.bottom-nav button:active,\n\.nav-bar button:active\s*\{[\s\S]*?\n\}",
]

for pat in patterns:
    css = re.sub(pat, "", css)

navbar = r'''
/* =========================
   BOTTOM NAVBAR SSOT
   single owner — no duplicate override
========================= */

.bottom-nav,
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
  border-top: 0.06em solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 -0.65rem 1.8rem rgba(0, 0, 0, 0.32),
    0 1.1rem 2.6rem rgba(0, 0, 0, 0.32),
    inset 0 0.05em 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(1.5vh) saturate(135%);
  -webkit-backdrop-filter: blur(1.5vh) saturate(135%);
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  will-change: transform, backdrop-filter;
}

.bottom-nav button,
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
}

.bottom-nav button.active,
.nav-bar button.active {
  color: rgba(0, 0, 0, 1);
  background: rgba(255, 255, 255, 1);
  border-radius: 999rem;
  box-shadow: 0 0.45rem 1rem rgba(0, 0, 0, 0.24), inset 0 0.05em 0 rgba(255, 255, 255, 0.8);
  filter: none;
  transform: translateY(-0.05rem);
}

.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.28em;
  line-height: 1;
  filter: brightness(0) invert(1) opacity(0.35);
}

.bottom-nav button.active .nav-icon,
.nav-bar button.active .nav-icon {
  filter: brightness(0) invert(0) opacity(1);
}

.center-action {
  width: 2.75rem;
  aspect-ratio: 1;
  min-height: 2.75rem;
  justify-self: center;
  transform: translateY(-0.34rem);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.86);
  font-size: 1.28rem;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.32);
  border: 0.08em solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 0.65rem 1.35rem rgba(0, 0, 0, 0.30), inset 0 0.05em 0 rgba(255, 255, 255, 0.08);
}

.bottom-nav button:active,
.nav-bar button:active {
  transform: scale(0.96);
}

.center-action:active {
  transform: translateY(-0.34rem) scale(0.96);
}
'''

css = css.rstrip() + "\n\n" + navbar + "\n"
p.write_text(css)
PY

echo "DONE: Navbar refactored to single source of truth."
echo "Backup: $BACKUP"
echo
echo "VERIFY duplicate navbar owners:"
grep -n "BOTTOM NAVBAR SSOT\|bottom-nav,\|nav-bar\|center-action" "$CSS"

pkill -f "python -m http.server 8081" 2>/dev/null || true
python -m http.server 8081 --bind 0.0.0.0
