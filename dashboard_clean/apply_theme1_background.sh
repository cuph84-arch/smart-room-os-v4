#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_theme1.css"

cp "$CSS" "$BACKUP"

python - <<'PY'
from pathlib import Path
import re

p = Path("style.css")
css = p.read_text()

css = css.replace(
'  --bg-image: url("https://raw.githubusercontent.com/cuph84-arch/smart-room-os-v4/main/assets/bg/smartroom-bg.png");\n',
''
)

css = css.replace(
'  --font-main: "Poppins", "Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;\n',
'''  --font-main: "Poppins", "Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  --theme-1-start: #FDBB2D;
  --theme-1-end: #22C1C3;
  --theme-1-deep: #06101c;
  --theme-bg-portrait:
    radial-gradient(circle at 12% 14%, rgba(255, 255, 255, 0.10), transparent 24%),
    radial-gradient(circle at 80% 8%, rgba(34, 193, 195, 0.34), transparent 34%),
    linear-gradient(90deg, var(--theme-1-start) 0%, var(--theme-1-end) 100%);
  --theme-bg-landscape:
    radial-gradient(circle at 12% 12%, rgba(255, 255, 255, 0.10), transparent 24%),
    radial-gradient(circle at 88% 20%, rgba(34, 193, 195, 0.34), transparent 34%),
    linear-gradient(180deg, var(--theme-1-start) 0%, var(--theme-1-end) 100%);
'''
)

css = re.sub(
r'html\s*\{[^{}]*?background:\s*.*?;\n\}',
'''html {
  min-height: 100%;
  scroll-behavior: smooth;
  background: var(--theme-bg-portrait);
  background-attachment: fixed;
}''',
css,
flags=re.S
)

css = re.sub(
r'body\s*\{.*?\}',
'''body {
  margin: 0;
  min-height: 100dvh;
  color: var(--text-main);
  font-family: var(--font-main);
  background: transparent;
  overscroll-behavior-y: none;
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
}''',
css,
flags=re.S
)

css = re.sub(
r'\.phone-container,\n\.app\s*\{.*?\n\}',
'''.phone-container,
.app {
  position: relative;
  isolation: isolate;
  width: 100%;
  max-width: 26.875rem;
  min-height: 100dvh;
  margin: 0 auto;
  padding: max(1.75rem, env(safe-area-inset-top)) 1.68rem max(6rem, env(safe-area-inset-bottom));
  overflow-x: hidden;
  background: var(--theme-bg-portrait);
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
}''',
css,
flags=re.S
)

css = re.sub(
r'\.app::before,\n\.phone-container::before\s*\{.*?\n\}',
'''.app::before,
.phone-container::before {
  z-index: -2;
  background:
    radial-gradient(circle at 18% 12%, rgba(255, 255, 255, 0.10), transparent 28%),
    radial-gradient(circle at 80% 70%, rgba(0, 0, 0, 0.16), transparent 42%);
}''',
css,
flags=re.S
)

css = re.sub(
r'\.app::after,\n\.phone-container::after\s*\{.*?\n\}',
'''.app::after,
.phone-container::after {
  z-index: -1;
  background: rgba(0, 0, 0, 0.10);
}''',
css,
flags=re.S
)

extra = '''
/* =========================
   THEME 1 RESPONSIVE SHELL
   CSS only — HTML/app.js locked
========================= */

@media screen and (orientation: landscape) {
  html,
  .phone-container,
  .app {
    background: var(--theme-bg-landscape);
    background-attachment: fixed;
  }
}

@media screen and (min-width: 48rem) {
  .phone-container,
  .app {
    max-width: 46rem;
    padding-inline: 5vmin;
  }
}

@media screen and (min-width: 64rem) {
  .phone-container,
  .app {
    max-width: 58rem;
  }
}
'''

if "THEME 1 RESPONSIVE SHELL" not in css:
    css = css.rstrip() + "\n\n" + extra

p.write_text(css)
PY

echo "DONE: Theme 1 CSS background applied."
echo "Backup: $BACKUP"
echo
echo "Check:"
grep -n "theme-1-start\|theme-bg-portrait\|THEME 1 RESPONSIVE SHELL\|bg-image\|smartroom-bg" style.css || true
echo
echo "Run preview:"
echo "python -m http.server 8081 --bind 0.0.0.0"
