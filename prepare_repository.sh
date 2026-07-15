#!/data/data/com.termux/files/usr/bin/bash

set -e

ROOT="$HOME/smart-room-os-v4/offline_dev"

echo "========================================="
echo " SMART ROOM OS V4"
echo " Repository Preparation"
echo "========================================="

cd "$ROOT"

mkdir -p archive
mkdir -p tools

echo
echo "[1/4] Moving Python utility scripts..."

for f in \
analyze_background_css.py \
analyze_ui_design.py \
audit_background_css.py \
inspect_body_css.py \
inspect_layout.py \
verify_body_css.py
do
    [ -f "$f" ] && mv "$f" tools/
done

echo
echo "[2/4] Moving patch / rollback scripts..."

for f in \
patch_background_gradient.sh \
patch_background_gradient_v2.sh \
patch_background_gradient_v3.sh \
patch_background_gradient_v4.sh \
patch_body_gradient.sh \
patch_body_gradient_simple.sh \
patch_gradient_color_only.sh \
rollback_bg_gradient_only.sh
do
    [ -f "$f" ] && mv "$f" tools/
done

echo
echo "[3/4] Preserving active project files..."

ACTIVE=(
index.html
style.css
app.js
connector.js
manifest.json
service-worker.js
offline_state_provider.js
)

for f in "${ACTIVE[@]}"; do
    if [ -f "$f" ]; then
        echo "  KEEP  $f"
    else
        echo "  MISS  $f"
    fi
done

echo
echo "[4/4] Repository summary"

echo
echo "Root:"
find . -maxdepth 1 | sort

echo
echo "Preparation complete."
echo
echo "No source code was modified."
echo "No files were deleted."
echo
