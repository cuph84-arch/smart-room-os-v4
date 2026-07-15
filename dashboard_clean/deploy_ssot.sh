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
