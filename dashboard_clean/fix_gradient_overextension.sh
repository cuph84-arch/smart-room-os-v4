#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_gradient_overextension_$(date +%Y%m%d_%H%M%S).css"

cp "$CSS" "$BACKUP"

python - <<'PY'
from pathlib import Path

p = Path("style.css")
css = p.read_text()

old = """.app::before,
.phone-container::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background: var(--theme-bg-portrait);
  background-size: cover;
  background-position: center;
}"""

new = """.app::before,
.phone-container::before {
  content: "";
  position: fixed;
  inset: -15vh 0;
  z-index: -2;
  pointer-events: none;
  background: var(--theme-bg-portrait);
  background-size: cover;
  background-position: center;
}"""

if old not in css:
    raise SystemExit(
        "ABORT: Blok pseudo-layer target tidak cocok dengan source aktif. "
        "style.css tidak diubah."
    )

css = css.replace(old, new, 1)
p.write_text(css)

print("PATCH OK")
PY

echo
echo "=== VERIFICATION ==="
grep -n -A10 "^\.app::before," "$CSS" | head -n 12

echo
echo "DONE: Gradient over-extension applied."
echo "Backup: $BACKUP"

pkill -f "python -m http.server 8081" 2>/dev/null || true
python -m http.server 8081 --bind 0.0.0.0
