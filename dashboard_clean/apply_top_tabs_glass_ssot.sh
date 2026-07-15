#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_top_tabs_glass_$(date +%Y%m%d_%H%M%S).css"

cp "$CSS" "$BACKUP"

python - <<'PY'
from pathlib import Path
import re

p = Path("style.css")
css = p.read_text()

css = re.sub(
r'\.top-tabs button\s*\{[\s\S]*?\n\}',
'''.top-tabs button {
  flex: 0 0 auto;
  min-height: clamp(2.15rem, 9.2vw, 2.4rem);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 clamp(0.75rem, 3.8vw, 1rem);
  border-radius: 999rem;
  color: rgba(255, 255, 255, 0.60);
  font-size: clamp(0.63rem, 2.8vw, 0.72rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.12);
  border: 0.05em solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 0.05em 0 rgba(255, 255, 255, 0.05);
}''',
css
)

css = re.sub(
r'\.top-tabs button\.active\s*\{[\s\S]*?\n\}',
'''.top-tabs button.active {
  color: rgba(255, 255, 255, 1);
  font-weight: 700;
  background: rgba(255, 255, 255, 0.18);
  border: 0.06em solid rgba(255, 255, 255, 0.30);
  box-shadow: inset 0 0.05em 0 rgba(255, 255, 255, 0.18), 0 0.5rem 1.1rem rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(1.2vh) saturate(140%);
  -webkit-backdrop-filter: blur(1.2vh) saturate(140%);
}''',
css
)

css = re.sub(
r'\.tab-icon\s*\{[\s\S]*?\n\}',
'''.tab-icon {
  width: 0.95rem;
  aspect-ratio: 1;
  flex: 0 0 0.95rem;
  display: inline-block;
  opacity: 0.70;
  background: currentColor;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
}''',
css
)

css = re.sub(
r'\.top-tabs button\.active \.tab-icon\s*\{[\s\S]*?\n\}',
'''.top-tabs button.active .tab-icon {
  opacity: 1;
}''',
css
)

p.write_text(css)
PY

echo "DONE: Top tabs glass SSOT applied."
echo "Backup: $BACKUP"
echo
grep -n "top-tabs button" "$CSS" | head -n 10

pkill -f "python -m http.server 8081" 2>/dev/null || true
python -m http.server 8081 --bind 0.0.0.0
