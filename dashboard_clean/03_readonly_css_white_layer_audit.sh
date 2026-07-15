#!/data/data/com.termux/files/usr/bin/bash
set -e

OUT="audit_navbar_case/final_white_layer_audit_$(date +%Y%m%d_%H%M%S).txt"
mkdir -p audit_navbar_case

{
echo "=== WHITE LAYER FINAL READ-ONLY AUDIT ==="
echo
echo "=== NAVBAR OWNER ==="
grep -n "BOTTOM NAVBAR SSOT\|bottom-nav,\|nav-bar\|backdrop-filter\|contain:\|isolation:\|overflow:\|transform:\|background: rgba(0, 0, 0" style.css

echo
echo "=== GLOBAL LAYERS ==="
grep -n "html {\|body {\|.app,\|.phone-container\|.app::before\|.app::after\|.phone-container::before\|.phone-container::after\|position:\|z-index:\|background:\|overflow" style.css

echo
echo "=== ALL WHITE / LIGHT RGBA LAYERS ==="
grep -n "255, 255, 255\|#fff\|#ffffff\|white" style.css

echo
echo "=== BACKDROP FILTER OWNERS ==="
grep -n "backdrop-filter\|-webkit-backdrop-filter" style.css

echo
echo "=== LAST 180 LINES ==="
tail -n 180 style.css
} > "$OUT"

cat "$OUT"
echo
echo "AUDIT FILE:"
echo "$OUT"
