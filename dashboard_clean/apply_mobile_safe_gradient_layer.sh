#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_mobile_safe_gradient_$(date +%Y%m%d_%H%M%S).css"

cp "$CSS" "$BACKUP"

python - <<'PY'
from pathlib import Path
import re

p = Path("style.css")
css = p.read_text()

css = re.sub(r"\n?\s*background-attachment:\s*fixed;\n?", "\n", css)

css = re.sub(
r"html\s*\{[\s\S]*?\n\}",
"""html {
  min-height: 100%;
  scroll-behavior: smooth;
  background-color: #0b1016;
}""",
css,
count=1
)

css = re.sub(
r"body\s*\{[\s\S]*?\n\}",
"""body {
  margin: 0;
  min-height: 100dvh;
  color: var(--text-main);
  font-family: var(--font-main);
  background-color: #0b1016;
  overscroll-behavior-y: none;
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
}""",
css,
count=1
)

css = re.sub(
r"\.phone-container,\n\.app\s*\{[\s\S]*?\n\}",
""".phone-container,
.app {
  position: relative;
  isolation: isolate;
  width: 100%;
  max-width: 26.875rem;
  min-height: 100dvh;
  margin: 0 auto;
  padding: max(1.75rem, env(safe-area-inset-top)) 1.68rem max(6rem, env(safe-area-inset-bottom));
  overflow-x: hidden;
  background: transparent;
}""",
css,
count=1
)

css = re.sub(
r"\.app::before,\n\.phone-container::before\s*\{[\s\S]*?\n\}",
""".app::before,
.phone-container::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background: var(--theme-bg-portrait);
  background-size: cover;
  background-position: center;
}""",
css
)

css = re.sub(
r"\.app::after,\n\.phone-container::after\s*\{[\s\S]*?\n\}",
""".app::after,
.phone-container::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.20);
}""",
css
)

css = re.sub(
r"@media screen and \(orientation: landscape\)\s*\{[\s\S]*?\n\}",
"""@media screen and (orientation: landscape) {
  .app::before,
  .phone-container::before {
    background: var(--theme-bg-landscape);
    background-size: cover;
    background-position: center;
  }
}""",
css,
count=1
)

p.write_text(css)
PY

echo "DONE: Mobile-safe pseudo-layer gradient applied."
echo "Backup: $BACKUP"
grep -n "background-attachment\|background-color: #0b1016\|app::before\|theme-bg-landscape" "$CSS" || true

pkill -f "python -m http.server 8081" 2>/dev/null || true
python -m http.server 8081 --bind 0.0.0.0
