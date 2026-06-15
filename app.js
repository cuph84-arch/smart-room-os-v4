console.log('Smart Room OS V4 Firebase Loaded');

/* =========================
   CONFIG
========================= */

const FIREBASE_STATE_URL =
  'https://smart-room-os-v3-default-rtdb.asia-southeast1.firebasedatabase.app/state.json';

const CONTROL_URL =
  'https://script.google.com/macros/s/AKfycbwYUMIjajxgFPJzbx2Nz9UXBB-LdjkGcyenMnk3hWVTRqtuz9C1P3k9Zra-3P-mvCf1/exec';

let latestFirebaseUpdatedAt = null;

/* =========================
   INIT
========================= */

document.addEventListener('DOMContentLoaded', () => {
  bindControls();
  loadFirebaseState();
  setInterval(loadFirebaseState, 5000);
});

/* =========================
   LOAD FIREBASE
========================= */

async function loadFirebaseState() {
  try {
    const res = await fetch(FIREBASE_STATE_URL + '?t=' + Date.now());
    const state = await res.json();

latestFirebaseUpdatedAt = getLatestUpdatedAt(state || {});

const data = mapFirebaseState(state || {});
renderDashboard(data);
  } catch (err) {
    console.error('Firebase load error:', err);
    showToast('Gagal memuat data');
  }
}

/* =========================
   MAP DATA
========================= */

function mapFirebaseState(state) {
  const smartplug = state.smartplug || {};
  const ac = state.ac || {};
  const lamp = state.lamp || {};
  const tv = state.tv || {};
  const nest = state.nest || {};
  const cctv = state.cctv || {};
  const energy = state.energy || {};
  const lastAutomation = state.last_automation || {};

  return {
    climate: {
      temp: state.climate?.temperature ?? '--',
      humidity: state.climate?.humidity ?? '--'
    },

    smartplug: {
      power: smartplug.watt ?? smartplug.power ?? '--',
      voltage: smartplug.voltage ?? smartplug.volt ?? '--'
    },

    ac: {
      power: ac.power ?? smartplug.ac_status ?? '--',
      temp: ac.temp ?? ac.temperature ?? '--',
      mode: ac.mode ?? '--',
      fan: ac.fan ?? '--'
    },

    lamp: {
      power: lamp.power ?? '--',
      brightness: lamp.brightness ?? 0,
      mode: lamp.mode ?? '--'
    },

    tv: {
      power: tv.power ?? '--',
      app: tv.app ?? tv.screen ?? '',
      status: getTvDisplayStatus(tv)
    },

    nest: {
      online: nest.online ?? false,
      status: nest.status ?? 'IDLE',
      volume: nest.volume ?? '--'
    },

    cctv: {
      online: cctv.online ?? '--',
      motion: cctv.motion ?? '--',
      recording: cctv.recording ?? '--',
      lastMotion: cctv.last_motion ?? '--'
    },

    energy: {
  today:
    smartplug.today_kwh ??
    energy.today_kwh ??
    0,

  week:
    smartplug.week_kwh ??
    energy.week_kwh ??
    0,

  month:
    smartplug.month_kwh ??
    energy.month_kwh ??
    0,

  todayCost:
    smartplug.today_cost ??
    energy.today_cost ??
    0,

  weekCost:
    smartplug.week_cost ??
    energy.week_cost ??
    0,

  monthCost:
    smartplug.month_cost ??
    energy.month_cost ??
    0,

  monthRuntime:
    smartplug.month_runtime_text ??
    energy.month_runtime_text ??
    '0j 0m',

  tariffText:
    smartplug.tariff_text ??
    energy.tariff_text ??
    'Est. Rp605/kWh · B1 900VA'
},
    

    lastAutomation: {
      scene:
        lastAutomation.scene ??
        'Belum ada scene',

      timestamp:
        lastAutomation.timestamp ??
        lastAutomation.updated_at ??
        '--'
    }
  };
}

/* =========================
   RENDER DASHBOARD
========================= */

function renderDashboard(data) {
  setText(
  'headerDate',
  'Last Updated: ' + formatTimeOnly(latestFirebaseUpdatedAt)
);
   setText('roomTemp', formatValue(data.climate.temp, '°C'));
  setText('roomHumidity', formatValue(data.climate.humidity, '%'));

  setText('plugPower', formatValue(data.smartplug.power, 'W'));
  setText('plugVolt', formatValue(data.smartplug.voltage, 'V'));

  setText('acTemp', formatValue(data.ac.temp, '°C'));
  setText('acStatus', data.ac.power);
  setText('acMode', data.ac.mode);
  setText('acFan', data.ac.fan);

  renderACSlider(data.ac.temp);

  setText('lampStatus', data.lamp.power);
  setText('lampBrightness', formatValue(data.lamp.brightness, '%'));
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
    formatKwh(data.energy.today) + ' · ' + formatRupiah(data.energy.todayCost)
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
  setBadge('nestPowerBadge', data.nest.online === true || isOn(data.nest.online));
}

/* =========================
   VISUAL SLIDERS
========================= */

function renderACSlider(tempValue) {
  const acSlider = document.getElementById('acSliderFill');
  if (!acSlider) return;

  const temp = Number(tempValue || 24);
  const percent = ((temp - 16) / 14) * 100;

  acSlider.style.width =
    Math.max(8, Math.min(100, percent)) + '%';
}

function renderLampSlider(power, brightness) {
  const lampBar = document.getElementById('lampBar');
  const lampInput = document.getElementById('lampBrightnessSlider');
  const value = Number(brightness || 0);

  if (lampBar) {
    lampBar.style.width = isOn(power) ? value + '%' : '0%';
  }

  if (lampInput && document.activeElement !== lampInput) {
    lampInput.value = value;
  }
}

/* =========================
   CONTROL BINDINGS
========================= */

function bindControls() {
  const acToggleBtn = document.getElementById('acToggleBtn');
  const acPlusBtn = document.getElementById('acPlusBtn');
  const acMinusBtn = document.getElementById('acMinusBtn');
  const lampToggleBtn = document.getElementById('lampToggleBtn');
  const lampSlider = document.getElementById('lampBrightnessSlider');
  const rerunSceneBtn = document.getElementById('rerunSceneBtn');

  if (acToggleBtn) {
    acToggleBtn.addEventListener('click', () => {
      const active =
        acToggleBtn.textContent.trim().toUpperCase() === 'ON';

      sendControl(active ? 'ac_off' : 'ac_on');
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
      const active =
        lampToggleBtn.textContent.trim().toUpperCase() === 'ON';

      sendControl(active ? 'lamp_off' : 'lamp_on');
    });
  }

  if (lampSlider) {
    lampSlider.addEventListener('input', () => {
      const lampBar = document.getElementById('lampBar');
      const lampBrightness = document.getElementById('lampBrightness');

      if (lampBar) lampBar.style.width = lampSlider.value + '%';
      if (lampBrightness) lampBrightness.textContent = lampSlider.value + '%';
    });

    lampSlider.addEventListener('change', () => {
      sendControl('lamp_brightness', lampSlider.value);
    });
  }

  if (rerunSceneBtn) {
    rerunSceneBtn.addEventListener('click', () => {
      const scene =
        document.getElementById('sceneName')?.textContent || '';

      const action = sceneToAction(scene);

      if (action) {
        sendControl(action);
      } else {
        showToast('Scene belum tersedia');
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
  const scene = String(sceneName || '').toLowerCase();

  if (scene.includes('movie')) return 'scene_movie';
  if (scene.includes('gaming')) return 'scene_gaming';
  if (scene.includes('sleep')) return 'scene_sleep';
  if (scene.includes('away')) return 'scene_away';
  if (scene.includes('siapkan')) return 'scene_siapan_kamar';
  if (scene.includes('kamar')) return 'scene_siapan_kamar';

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
  const text = String(value || '').toUpperCase();

  return (
    text.includes('ON') ||
    text === 'TRUE' ||
    text === 'ONLINE' ||
    text === '1'
  );
}

function formatValue(value, suffix) {
  if (value === '--' || value === null || value === undefined || value === '') {
    return '--';
  }

  return value + suffix;
}

function formatKwh(value) {
  return Number(value || 0).toFixed(2) + ' kWh';
}

function formatRupiah(value) {
  return 'Rp ' + Number(value || 0).toLocaleString('id-ID');
}

function getLatestDeviceUpdatedTime(data) {
  const devices = [
    data?.ac,
    data?.cctv,
    data?.climate,
    data?.lamp,
    data?.nest,
    data?.smartplug,
    data?.speaker,
    data?.tv
  ];

   function getLatestUpdatedAt(state) {
  const devices = ['ac', 'cctv', 'climate', 'lamp', 'smartplug', 'nest', 'speaker', 'tv'];

  const timestamps = devices
    .map(name => state?.[name]?.updated_at)
    .filter(Boolean)
    .sort();

  return timestamps.length ? timestamps[timestamps.length - 1] : null;
}

function formatTimeOnly(value) {
  if (!value) return '--';

  const match = String(value).match(/(\d{2}):(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}:${match[3]}` : '--';
}
   
  const dates = devices
    .map(device => {
      if (!device) return null;

      return parseDeviceDate(
        device.updated_at ||
        device.updatedAt ||
        device.timestamp ||
        device.last_update ||
        device.lastUpdate
      );
    })
    .filter(Boolean);

  if (!dates.length) return '--';

  const latest = new Date(
    Math.max(...dates.map(date => date.getTime()))
  );

  return latest.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function parseDeviceDate(value) {
  if (!value) return null;

  if (typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === 'string') {
    const cleaned = value.trim();

    const normal = new Date(cleaned);
    if (!isNaN(normal.getTime())) return normal;

    const match = cleaned.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      return new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        Number(match[4]),
        Number(match[5]),
        Number(match[6])
      );
    }
  }

  return null;
}

function parseFirebaseDate(value) {
  if (!value) return null;

  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === 'string') {
    const cleaned = value.trim();

    const normalDate = new Date(cleaned);
    if (!isNaN(normalDate.getTime())) return normalDate;

    const match = cleaned.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    if (match) {
      const now = new Date();
      now.setHours(Number(match[1]), Number(match[2]), Number(match[3]), 0);
      return now;
    }
  }

  return null;
}

function getTvDisplayStatus(tv) {
  if (!tv) return 'Standby';

  const power = String(tv.power || '').toUpperCase();
  const app = String(tv.app || tv.screen || '').trim();
  const status = String(tv.status || tv.media_state || '').toUpperCase();
  const title = String(tv.title || '').trim();

  if (power !== 'ON') return 'Standby';

  if (title) return title;

  if (
    app === '' ||
    app.toLowerCase() === 'no app'
  ) {
    if (status === 'PLAYING') return 'Screen Saver';
    return 'Home Screen';
  }

  if (status && status !== '--') {
    return app + ' · ' + status;
  }

  return app;
}

function showToast(message) {
  let toast = document.getElementById('smartToast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'smartToast';
    toast.style.position = 'fixed';
    toast.style.left = '50%';
    toast.style.bottom = '92px';
    toast.style.transform = 'translateX(-50%)';
    toast.style.padding = '12px 18px';
    toast.style.borderRadius = '999px';
    toast.style.background = 'rgba(0,0,0,.65)';
    toast.style.color = '#fff';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '9999';
    toast.style.backdropFilter = 'blur(18px)';
    toast.style.webkitBackdropFilter = 'blur(18px)';
    toast.style.transition = 'opacity .25s ease, transform .25s ease';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  clearTimeout(window.smartToastTimer);

  window.smartToastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(8px)';
  }, 1800);
}
