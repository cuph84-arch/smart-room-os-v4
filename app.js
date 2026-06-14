console.log('Smart Room OS V4 Firebase Loaded');

/* =========================
   CONFIG
========================= */

const FIREBASE_STATE_URL =
  'https://smart-room-os-v3-default-rtdb.asia-southeast1.firebasedatabase.app/state.json';

// GANTI URL INI dengan URL Web App Apps Script kamu
const CONTROL_URL =
'https://script.google.com/macros/s/AKfycbwYUMIjajxgFPJzbx2Nz9UXBB-LdjkGcyenMnk3hWVTRqtuz9C1P3k9Zra-3P-mvCf1/exec';
/* =========================
   INIT
========================= */

loadFirebaseState();
setInterval(loadFirebaseState, 5000);

document.addEventListener('DOMContentLoaded', () => {
  bindControls();
});

/* =========================
   LOAD FIREBASE
========================= */

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

/* =========================
   MAP DATA
========================= */

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

    energy: {
      today: state.smartplug?.today_kwh ?? 0,
      week: state.smartplug?.week_kwh ?? 0,
      month: state.smartplug?.month_kwh ?? 0,

      todayCost: state.smartplug?.today_cost ?? 0,
      weekCost: state.smartplug?.week_cost ?? 0,
      monthCost: state.smartplug?.month_cost ?? 0,

      todayRuntime:
        state.smartplug?.today_runtime_text ?? '0j 0m',

      weekRuntime:
        state.smartplug?.week_runtime_text ?? '0j 0m',

      monthRuntime:
        state.smartplug?.month_runtime_text ?? '0j 0m',

      tariffText:
        state.smartplug?.tariff_text ??
        'Est. Rp605/kWh · B1 900VA'
    },

    lastAutomation: {
      scene: state.last_automation?.scene ?? 'Belum ada scene',
      timestamp: state.last_automation?.timestamp ?? '--'
    }
  };
}

/* =========================
   RENDER DASHBOARD
========================= */

function renderDashboard(data) {
  setText('roomTemp', data.climate.temp + '°C');
  setText('roomHumidity', data.climate.humidity + '%');

  setText('plugPower', data.smartplug.power + 'W');
  setText('plugVolt', data.smartplug.voltage + 'V');

  setText('acTemp', data.ac.temp + '°C');
  setText('acStatus', data.ac.power);
  setText('acMode', data.ac.mode);
  setText('acFan', data.ac.fan);

  renderACSlider(data.ac.temp);

  setText('lampStatus', data.lamp.power);
  setText('lampBrightness', data.lamp.brightness + '%');
  setText('lampMode', data.lamp.mode);

  renderLampSlider(data.lamp.power, data.lamp.brightness);

  setText('tvStatus', data.tv.status);

  setText('nestStatus', data.nest.status);
  setText('nestVolume', data.nest.volume);

  setText('cctvOnline', data.cctv.online);
  setText('cctvMotion', data.cctv.motion);
  setText('cctvRecording', data.cctv.recording);
  setText('cctvLastMotion', data.cctv.lastMotion);

  setText('summaryAC', data.ac.power);
  setText('summaryLamp', data.lamp.power);
  setText('summaryTV', data.tv.power);
  setText('summaryCCTV', data.cctv.online);

  setText(
    'summaryEnergy',
    formatKwh(data.energy.today) +
    ' · ' +
    formatRupiah(data.energy.todayCost)
  );

  setText('energyToday', formatKwh(data.energy.today));
  setText('energyWeek', formatKwh(data.energy.week));
  setText('energyMonth', formatKwh(data.energy.month));

  setText('energyTodayCost', formatRupiah(data.energy.todayCost));
  setText('energyWeekCost', formatRupiah(data.energy.weekCost));
  setText('energyMonthCost', formatRupiah(data.energy.monthCost));

  setText('energyRuntimeMonth', data.energy.monthRuntime);
  setText('energyTariff', data.energy.tariffText);

  setText('sceneName', data.lastAutomation.scene);
  setText('sceneDate', data.lastAutomation.timestamp);
  setText('sceneTime', '🕘');

  setBadge('acToggleBtn', isOn(data.ac.power));
  setBadge('lampToggleBtn', isOn(data.lamp.power));
  setBadge('tvPowerBadge', isOn(data.tv.power));
  setBadge('nestPowerBadge', data.nest.online);
}

/* =========================
   VISUAL SLIDERS
========================= */

function renderACSlider(tempValue) {
  const acSlider =
    document.getElementById('acSliderFill');

  if (!acSlider) return;

  const temp = Number(tempValue || 24);

  const percent =
    ((temp - 16) / 14) * 100 + 10;

  acSlider.style.width =
    Math.max(0, Math.min(100, percent)) + '%';
}

function renderLampSlider(power, brightness) {
  const lampBar =
    document.getElementById('lampBar');

  const lampInput =
    document.getElementById('lampBrightnessSlider');

  const value = Number(brightness || 0);

  if (lampBar) {
    if (String(power).toUpperCase() === 'OFF') {
      lampBar.style.width = '0%';
    } else {
      lampBar.style.width = value + '%';
    }
  }

  if (lampInput) {
    lampInput.value = value;
  }
}

/* =========================
   CONTROL BINDINGS
========================= */

function bindControls() {
  const acToggleBtn =
    document.getElementById('acToggleBtn');

  const acPlusBtn =
    document.getElementById('acPlusBtn');

  const acMinusBtn =
    document.getElementById('acMinusBtn');

  const lampToggleBtn =
    document.getElementById('lampToggleBtn');

  const lampSlider =
    document.getElementById('lampBrightnessSlider');

  const rerunSceneBtn =
    document.getElementById('rerunSceneBtn');

  if (acToggleBtn) {
    acToggleBtn.addEventListener('click', () => {
      const isActive =
        acToggleBtn.textContent.trim().toUpperCase() === 'ON';

      sendControl(isActive ? 'ac_off' : 'ac_on');
    });
  }

  if (acPlusBtn) {
    acPlusBtn.addEventListener('click', () => {
      sendControl('ac_temp_up');
    });
  }

  if (acMinusBtn) {
    acMinusBtn.addEventListener('click', () => {
      sendControl('ac_temp_down');
    });
  }

  if (lampToggleBtn) {
    lampToggleBtn.addEventListener('click', () => {
      const isActive =
        lampToggleBtn.textContent.trim().toUpperCase() === 'ON';

      sendControl(isActive ? 'lamp_off' : 'lamp_on');
    });
  }

  if (lampSlider) {
    lampSlider.addEventListener('change', () => {
      sendControl(
        'lamp_brightness',
        lampSlider.value
      );
    });
  }

  if (rerunSceneBtn) {
    rerunSceneBtn.addEventListener('click', () => {
      const scene =
        document.getElementById('sceneName')?.textContent || '';

      const action = sceneToAction(scene);

      if (action) {
        sendControl(action);
      }
    });
  }
}

/* =========================
   SEND CONTROL
========================= */

async function sendControl(action, value = '') {
  try {
    showToast('Mengirim perintah...');

    const url =
      CONTROL_URL +
      '?action=' +
      encodeURIComponent(action) +
      '&value=' +
      encodeURIComponent(value) +
      '&t=' +
      Date.now();

    const res = await fetch(url);
    const text = await res.text();

    console.log('Control response:', text);

    showToast('Perintah terkirim');

    setTimeout(loadFirebaseState, 1200);

  } catch (err) {
    console.error('Control error:', err);
    showToast('Gagal kirim perintah');
  }
}

/* =========================
   SCENE ACTION MAP
========================= */

function sceneToAction(sceneName) {
  const scene =
    String(sceneName || '').toLowerCase();

  if (scene.includes('movie')) return 'scene_movie';
  if (scene.includes('gaming')) return 'scene_gaming';
  if (scene.includes('sleep')) return 'scene_sleep';
  if (scene.includes('away')) return 'scene_away';
  if (scene.includes('siapkan')) return 'scene_siapan_kamar';

  return '';
}

/* =========================
   HELPERS
========================= */

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

function formatKwh(value) {
  return Number(value || 0).toFixed(2) + ' kWh';
}

function formatRupiah(value) {
  return 'Rp ' +
    Number(value || 0).toLocaleString('id-ID');
}

function getTvDisplayStatus(tv) {
  if (!tv) return 'Standby';

  const power =
    String(tv.power || '').toUpperCase();

  const screen =
    String(tv.screen || '').trim();

  const status =
    String(tv.status || '').toUpperCase();

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

function showToast(message) {
  let toast =
    document.getElementById('smartToast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'smartToast';
    toast.style.position = 'fixed';
    toast.style.left = '50%';
    toast.style.bottom = '90px';
    toast.style.transform = 'translateX(-50%)';
    toast.style.padding = '12px 18px';
    toast.style.borderRadius = '999px';
    toast.style.background = 'rgba(0,0,0,.65)';
    toast.style.color = '#fff';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '9999';
    toast.style.backdropFilter = 'blur(18px)';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';

  clearTimeout(window.smartToastTimer);

  window.smartToastTimer =
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 1800);
}
