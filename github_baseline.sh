#!/data/data/com.termux/files/usr/bin/bash

set -e

ROOT="$HOME/smart-room-os-v4/offline_dev"

cd "$ROOT"

echo "==========================================="
echo " SMART ROOM OS V4"
echo " GitHub Baseline Preparation"
echo "==========================================="

echo
echo "[1/6] Creating archive..."

mkdir -p archive/css_backups

echo
echo "[2/6] Moving CSS backup files..."

find . -maxdepth 1 -type f \
\( \
-name "style.css.before*" -o \
-name "style.css.backup*" -o \
-name "style.css.bak*" \
\) \
-exec mv {} archive/css_backups/ \;

echo "Done."

echo
echo "[3/6] Creating .gitignore..."

cat > .gitignore <<'GITEOF'
# Backup
backup/
backups/
checkpoints/

# Runtime
runtime/*.log

# Archive
archive/css_backups/

# Python
__pycache__/
*.pyc

# Termux
.termux/

# Android
.DS_Store
Thumbs.db
GITEOF

echo
echo "[4/6] Creating README.md..."

cat > README.md <<'READEOF'
# Smart Room OS V4

Hybrid Smart Home Dashboard

## Status

Phase 7
GitHub Baseline

## Stack

- HTML
- CSS
- JavaScript
- Firebase (Next)
- ESP32
- MQTT
- Tuya Cloud API

## Branch

main

READEOF

echo
echo "[5/6] Initializing Git..."

if [ ! -d ".git" ]; then
    git init
fi

git add .

echo
echo "[6/6] Repository Status"

git status

echo
echo "==========================================="
echo "Baseline preparation completed."
echo
echo "Next:"
echo "  git commit"
echo "  git remote add origin <repository>"
echo "  git push -u origin main"
echo "==========================================="

