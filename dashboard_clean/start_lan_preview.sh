#!/data/data/com.termux/files/usr/bin/bash
set -e

PORT=8081
DIR="$HOME/smart-room-os-v4/offline_dev/dashboard_clean"

cd "$DIR"

IP=$(ip -4 addr show wlan0 | grep -oE 'inet [0-9.]+' | awk '{print $2}' | head -n 1)

if [ -z "$IP" ]; then
  IP=$(ifconfig wlan0 2>/dev/null | grep -oE 'inet [0-9.]+' | awk '{print $2}' | head -n 1)
fi

if [ -z "$IP" ]; then
  echo "ERROR: IP Wi-Fi tidak ditemukan. Pastikan HP server terhubung Wi-Fi."
  exit 1
fi

pkill -f "python -m http.server $PORT" 2>/dev/null || true

echo "LAN Preview aktif."
echo "Buka di HP server:"
echo "http://127.0.0.1:$PORT"
echo
echo "Buka di HP kedua:"
echo "http://$IP:$PORT"
echo
echo "IP yang dimasukkan di HP kedua:"
echo "$IP"

python -m http.server "$PORT" --bind 0.0.0.0
