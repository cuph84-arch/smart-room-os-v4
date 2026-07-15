#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_active_nav_px_$(date +%Y%m%d_%H%M%S).css"
OUT="$HOME/storage/downloads/style_ssot_final.css"

if [ ! -f "$CSS" ]; then
  echo "ERROR: File style.css tidak ditemukan di direktori aktif!"
  exit 1
fi

cp "$CSS" "$BACKUP"

python - <<'PY'
from pathlib import Path
import re

p = Path("style.css")
css = p.read_text()

css = re.sub(
r"\.bottom-nav button\.active,\n\.nav-bar button\.active\s*\{[\s\S]*?\n\}",
""".bottom-nav button.active,
.nav-bar button.active {
  color: rgba(255, 255, 255, 1);
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999rem;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.20),
    0 0.45rem 1rem rgba(0, 0, 0, 0.22);
  filter: none;
  transform: translateY(-0.05rem);
}""",
css,
count=1
)

p.write_text(css)
PY

cat << 'DEPLOY' > deploy_ssot.sh
#!/data/data/com.termux/files/usr/bin/bash
set -e

if [ ! -d "$HOME/storage/downloads" ]; then
  echo "Storage belum aktif. Jalankan dulu: termux-setup-storage"
  exit 1
fi

cp -f style.css "$HOME/storage/downloads/style_ssot_final.css"

echo "========================================="
echo " SUCCESS: SSOT CSS Berhasil Ditulis!"
echo "========================================="
echo "Lokasi File HP: /sdcard/Download/style_ssot_final.css"
echo ""
echo "Checksum Verifikasi SHA256:"
sha256sum style.css "$HOME/storage/downloads/style_ssot_final.css"
echo ""
cmp -s style.css "$HOME/storage/downloads/style_ssot_final.css" \
  && echo "PASS: File Download identik 100% dengan style.css aktif." \
  || echo "FAIL: File Download berbeda."
echo "========================================="
DEPLOY

chmod +x deploy_ssot.sh
./deploy_ssot.sh
