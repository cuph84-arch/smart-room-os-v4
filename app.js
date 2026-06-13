console.log('Smart Room OS V4 Firebase Loaded');

const FIREBASE_STATE_URL =
  'https://smart-room-os-v3-default-rtdb.asia-southeast1.firebasedatabase.app/state.json';

loadFirebaseState();
setInterval(loadFirebaseState, 5000);

async function loadFirebaseState() {
  try {
    const res = await fetch(FIREBASE_STATE_URL + '?t=' + Date.now());
    const state = await res.json();

    const data = mapFirebaseState(state || {});
    renderDashboard(data);

  } catch (err) {
    console.error('Firebase load error:', err);
  }
}

function mapFirebaseState(state) {
  return {
    climate: {
      temp: state.climate?.temperature ?? '--',
      humidity: state.climate?.humidity ?? '--'
    },

    smartplug: {
      power: state.smartplug?.power ?? '--',
      voltage: state.smartplug?.voltage ?? '--'
    },

    ac: {
      power: state.ac?.power ?? state.smartplug?.ac_status ?? '--',
      temp: state.ac?.temperature ?? '--',
      mode: state.ac?.mode ?? '--',
      fan: state.ac?.fan ?? '--'
    },

    lamp: {
      power: state.lamp?.power ?? '--',
      brightness: state.lamp?.brightness ?? 0,
      mode: state.lamp?.mode ?? '--'
    },

    tv: {
  power: state.tv?.power ?? '--',
  status: getTvDisplayStatus(state.tv)
},

    nest: {
      online: state.nest?.online ?? false,
      status: state.nest?.status ?? 'IDLE',
      volume: state.nest?.volume ?? '--'
    },

    cctv: {
  online: state.cctv?.online ?? '--',
  motion: state.cctv?.motion ?? '--',
  recording: state.cctv?.recording ?? '--',
  lastMotion: state.cctv?.last_motion ?? '--'
},

    lastAutomation: {
      scene: state.last_automation?.scene ?? 'Belum ada scene',
      timestamp: state.last_automation?.timestamp ?? '--'
    }
  };
}

function renderDashboard(data) {

  setText('roomTemp', data.climate.temp + '°C');
  setText('roomHumidity', data.climate.humidity + '%');

  setText('plugPower', data.smartplug.power + 'W');
  setText('plugVolt', data.smartplug.voltage + 'V');

  setText('acTemp', data.ac.temp + '°C');
  setText('acStatus', data.ac.power);
  setText('acMode', data.ac.mode);
  setText('acFan', data.ac.fan);

  setText('lampStatus', data.lamp.power);
  setText('lampBrightness', data.lamp.brightness + '%');
  setText('lampMode', data.lamp.mode);

  const lampBar = document.getElementById('lampBar');
  if (lampBar) lampBar.style.width = data.lamp.brightness + '%';

  setText('tvStatus', data.tv.status);

  setText('nestStatus', data.nest.status);
  setText('nestVolume', data.nest.volume);

  setText('cctvOnline', data.cctv.online);
  setText('cctvMotion', data.cctv.motion);
  setText('cctvRecording', data.cctv.recording);
  setText('cctvLastMotion', data.cctv.lastMotion);

  setText('sceneName', data.lastAutomation.scene);
  setText('sceneDate', data.lastAutomation.timestamp);
  setText('sceneTime', '🕒');

  setBadge('acPowerBadge', isOn(data.ac.power));
  setBadge('lampPowerBadge', isOn(data.lamp.power));
  setBadge('tvPowerBadge', isOn(data.tv.power));
  setBadge('nestPowerBadge', data.nest.online);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setBadge(id, active) {
  const el = document.getElementById(id);
  if (!el) return;

  el.className = active ? 'badge on' : 'badge off';
  el.textContent = active ? 'ON' : 'OFF';
}

function isOn(value) {
  return String(value).toUpperCase().includes('ON') ||
         String(value).toUpperCase() === 'TRUE';
}

function getTvDisplayStatus(tv) {
  if (!tv) return 'Standby';

  const power = String(tv.power || '').toUpperCase();
  const screen = String(tv.screen || '').trim();
  const status = String(tv.status || '').toUpperCase();

  if (power !== 'ON') return 'Standby';

  if (
    screen === '' ||
    screen.toLowerCase() === 'no app'
  ) {
    if (status === 'PLAYING') return 'Screen Saver';
    return 'Home Screen';
  }

  return screen;
}