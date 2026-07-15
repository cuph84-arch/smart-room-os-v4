#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_glass_cutout_$(date +%Y%m%d_%H%M%S).css"

cp "$CSS" "$BACKUP"

python - <<'PY'
from pathlib import Path
import re

p = Path("style.css")
css = p.read_text()

css = re.sub(
    r"/\* =========================\n   DARK GLASSMORPHISM OWNER[\s\S]*?$",
    "",
    css.strip()
)

block = r'''
/* =========================
   DARK GLASSMORPHISM OWNER
   SINGLE SOURCE OF TRUTH
========================= */

:root {
  --glass-bg: rgba(0, 0, 0, 0.32);
  --glass-bg-soft: rgba(0, 0, 0, 0.12);
  --glass-bg-deep: rgba(0, 0, 0, 0.42);
  --glass-border: rgba(255, 255, 255, 0.15);
  --glass-border-soft: rgba(255, 255, 255, 0.10);
  --glass-blur: 1.5vh;
}

.card,
.wide-card,
.summary-card,
.ac-card,
.lamp-card,
.entertainment-card,
.climate-power-card,
.cctv-card,
.energy-card,
.scene-card {
  background: var(--glass-bg);
  border: 0.05em solid var(--glass-border);
  box-shadow: inset 0 0.05em 0 rgba(255, 255, 255, 0.08), 0 1.4rem 3.2rem rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(var(--glass-blur)) saturate(135%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(135%);
}

.summary-item,
.mini-device,
.metric-item,
.climate-item,
.cctv-mode-pill,
.energy-total-box {
  background: var(--glass-bg-soft);
  border: 0.06em solid var(--glass-border-soft);
  box-shadow: inset 0 0.05em 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.card::before,
.wide-card::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.07), transparent 52%);
}

.bottom-nav,
.nav-bar {
  background: var(--glass-bg-deep);
  border: 0.05em solid rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 0.05em 0 rgba(255, 255, 255, 0.08), 0 1.4rem 3.4rem rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(calc(var(--glass-blur) * 1.15)) saturate(145%);
  -webkit-backdrop-filter: blur(calc(var(--glass-blur) * 1.15)) saturate(145%);
}

.app::after,
.phone-container::after {
  background: rgba(0, 0, 0, 0.20);
}
'''

p.write_text(css.rstrip() + "\n\n" + block + "\n")
PY

echo "DONE: Glass cut-out SSOT applied."
echo "Backup: $BACKUP"
echo
echo "VERIFY:"
grep -n "DARK GLASSMORPHISM OWNER\|--glass-bg:\|--glass-bg-soft:\|backdrop-filter: none" "$CSS"

echo
echo "Restart server..."
pkill -f "python -m http.server 8081" 2>/dev/null || true
python -m http.server 8081 --bind 0.0.0.0
