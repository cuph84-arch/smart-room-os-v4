#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_bottom_nav_ios_$(date +%Y%m%d_%H%M%S).css"

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
  min-height: 3.75rem;
  padding: 0.44rem 0.56rem;
  border-radius: 1.44rem;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.72);
  border: 0.05em solid rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 0.05em 0 rgba(255, 255, 255, 0.08), 0 1.4rem 3.4rem rgba(0, 0, 0, 0.48);
  backdrop-filter: blur(1.8vh) saturate(145%);
  -webkit-backdrop-filter: blur(1.8vh) saturate(145%);
}""",
css
)

css = re.sub(
r"\.bottom-nav button,\n\.nav-bar button\s*\{[\s\S]*?\n\}",
""".bottom-nav button,
.nav-bar button {
  width: 2.65rem;
  aspect-ratio: 1;
  min-height: 2.65rem;
  justify-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rem;
  color: rgba(255, 255, 255, 0.35);
  background: transparent;
  font-size: 1.22rem;
  font-weight: 500;
  line-height: 1;
  opacity: 1;
  transition: background 0.28s ease, color 0.28s ease, filter 0.28s ease, transform 0.28s ease;
}""",
css
)

css = re.sub(
r"\.bottom-nav button\.active,\n\.nav-bar button\.active\s*\{[\s\S]*?\n\}",
""".bottom-nav button.active,
.nav-bar button.active {
  color: rgba(0, 0, 0, 1);
  background: rgba(255, 255, 255, 1);
  border-radius: 999rem;
  box-shadow: 0 0.5rem 1.2rem rgba(0, 0, 0, 0.28), inset 0 0.05em 0 rgba(255, 255, 255, 0.8);
  filter: none;
  transform: translateY(-0.08rem);
}""",
css
)

nav_icon = """.nav-icon {
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
}"""

if ".nav-icon {" in css:
    css = re.sub(r"\.nav-icon\s*\{[\s\S]*?\n\}", nav_icon, css)
else:
    css = css.replace(".nav-label {\n  display: none;\n}", ".nav-label {\n  display: none;\n}\n\n" + nav_icon)

css = re.sub(
r"\.center-action\s*\{[\s\S]*?\n\}",
""".center-action {
  width: 3rem;
  aspect-ratio: 1;
  min-height: 3rem;
  justify-self: center;
  transform: translateY(-0.5rem);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.92);
  font-size: 1.38rem;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.72);
  border: 0.08em solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 0.75rem 1.75rem rgba(0, 0, 0, 0.38), inset 0 0.05em 0 rgba(255, 255, 255, 0.08);
}""",
css
)

css = re.sub(
r"\.center-action:active\s*\{[\s\S]*?\n\}",
""".center-action:active {
  transform: translateY(-0.5rem) scale(0.96);
}""",
css
)

p.write_text(css)
PY

echo "DONE: High-Contrast Dark Glass Bottom Nav applied."
echo "Backup: $BACKUP"

pkill -f "python -m http.server 8081" 2>/dev/null || true
python -m http.server 8081 --bind 0.0.0.0
