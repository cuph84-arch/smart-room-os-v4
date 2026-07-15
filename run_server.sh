#!/data/data/com.termux/files/usr/bin/bash

cd ~/smart-room-os-v4/offline_dev || exit 1

echo "=================================="
echo " SMART ROOM OS V2"
echo " HTTP SERVER"
echo "=================================="

IP=$(ip addr show wlan0 | grep "inet " | awk '{print $2}' | cut -d/ -f1)

if [ -z "$IP" ]; then
    IP=$(ifconfig wlan0 2>/dev/null | grep "inet " | awk '{print $2}')
fi

echo
echo "Server akan berjalan di:"
echo "http://$IP:8000"
echo
echo "Buka dari HP lain menggunakan alamat di atas."
echo
echo "Tekan CTRL+C untuk menghentikan server."
echo

python3 -m http.server 8000 --bind 0.0.0.0
