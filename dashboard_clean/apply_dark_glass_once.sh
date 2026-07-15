#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
STAMP="DARK GLASSMORPHISM OWNER"
BACKUP="style.before_dark_glass_$(date +%Y%m%d_%H%M%S).css"

cp "$CSS" "$BACKUP"

python - <<'PY'
from pathlib import Path
import re

p = Path("style.css")
css = p.read_text()

css = re.sub(
    r"/\* =========================\n   DARK GLASSMORPHISM OWNER[\s\S]*?\n\}\n?$",
    "",
    css.strip()
)

dark = r'''
/* =========================
   DARK GLASSMORPHISM OWNER
   CSS ONLY — HTML & app.js LOCKED
========================= */

:root {
  --glass-bg: rgba(0, 0, 0, 0.35);
  --glass-bg-soft: rgba(0, 0, 0, 0.30);
  --glass-bg-deep: rgba(0, 0, 0, 0.52);
  --glass-border: rgba(255, 255, 255, 0.16);
  --glass-border-soft: rgba(255, 255, 255, 0.11);
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
  box-shadow: inset 0 0.05em 0 rgba(255, 255, 255, 0.08), 0 1.6rem 3.6rem rgba(0, 0, 0, 0.36);
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
  border: 0.05em solid var(--glass-border-soft);
  box-shadow: inset 0 0.05em 0 rgba(255, 255, 255, 0.07), 0 0.9rem 2.2rem rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(calc(var(--glass-blur) * 0.82)) saturate(130%);
  -webkit-backdrop-filter: blur(calc(var(--glass-blur) * 0.82)) saturate(130%);
}

.card::before,
.wide-card::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 48%);
}

.bottom-nav,
.nav-bar {
  background: var(--glass-bg-deep);
  border: 0.05em solid rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 0.05em 0 rgba(255, 255, 255, 0.08), 0 1.4rem 3.4rem rgba(0, 0, 0, 0.44);
  backdrop-filter: blur(calc(var(--glass-blur) * 1.15)) saturate(145%);
  -webkit-backdrop-filter: blur(calc(var(--glass-blur) * 1.15)) saturate(145%);
}

.app::after,
.phone-container::after {
  background: rgba(0, 0, 0, 0.24);
}
'''

p.write_text(css.rstrip() + "\n\n" + dark + "\n")
PY

echo "DONE: dark glassmorphism appended at bottom."
echo "Backup: $BACKUP"
echo
echo "VERIFY:"
grep -n "DARK GLASSMORPHISM OWNER\|--glass-bg:\|background: var(--glass-bg)" "$CSS"
echo
echo "Restart preview:"
pkill -f "python -m http.server 8081" 2>/dev/null || true
python -m http.server 8081 --bind 0.0.0.0
