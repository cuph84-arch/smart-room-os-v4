#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_navbar_stable_glass_$(date +%Y%m%d_%H%M%S).css"

cp "$CSS" "$BACKUP"

python - <<'PY'
from pathlib import Path

p = Path("style.css")
css = p.read_text()

old = """  background: rgba(0, 0, 0, 0.32);
  border: 0.05em solid rgba(255, 255, 255, 0.12);
  border-top: 0.06em solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 -0.65rem 1.8rem rgba(0, 0, 0, 0.32),
    0 1.1rem 2.6rem rgba(0, 0, 0, 0.32),
    inset 0 0.05em 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(1.5vh) saturate(135%);
  -webkit-backdrop-filter: blur(1.5vh) saturate(135%);"""

new = """  background: rgba(0, 0, 0, 0.52);
  border: 0.05em solid rgba(255, 255, 255, 0.12);
  border-top: 0.06em solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 -0.65rem 1.8rem rgba(0, 0, 0, 0.32),
    0 1.1rem 2.6rem rgba(0, 0, 0, 0.32),
    inset 0 0.05em 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;"""

count = css.count(old)

if count != 1:
    raise SystemExit(
        f"ABORT: target navbar block ditemukan {count} kali, expected 1. CSS tidak diubah."
    )

css = css.replace(old, new, 1)
p.write_text(css)
PY

echo "=== VERIFY NAVBAR SSOT ==="
grep -n "BOTTOM NAVBAR SSOT\|background: rgba(0, 0, 0, 0.52)\|backdrop-filter: none" "$CSS"

echo
echo "DONE: Stable navbar test applied."
echo "Backup: $BACKUP"
echo
echo "Tes:"
echo "1. Refresh browser."
echo "2. Scroll cepat."
echo "3. Berhenti scroll dengan jari tetap menyentuh layar."
echo "4. Periksa apakah lapisan putih masih muncul."

pkill -f "python -m http.server 8081" 2>/dev/null || true
python -m http.server 8081 --bind 0.0.0.0
