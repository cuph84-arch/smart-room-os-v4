console.log('Smart Room OS V4 Firebase Loaded');

/* =========================
   CONFIG
========================= */

const FIREBASE_STATE_URL =
  'https://smart-room-os-v3-default-rtdb.asia-southeast1.firebasedatabase.app/state.json';

const CONTROL_URL =
  'https://script.google.com/macros/s/AKfycbwYUMIjajxgFPJzbx2Nz9UXBB-LdjkGcyenMnk3hWVTRqtuz9C1P3k9Zra-3P-mvCf1/exec';

/* =========================
   INIT
========================= */

document.addEventListener('DOMContentLoaded', () => {
  bindControls();
  updateHeaderDateTime();
  loadFirebaseState();

  setInterval(loadFirebaseState, 5000);
  setInterval(updateHeaderDateTime, 60000);
});

/* =========================
   LOAD FIREBASE
========================= */

async function loadFirebaseState() {
  try {
    const response = await fetch(FIREBASE_STATE_URL + '?t=' + Date.now());

    if (!response.ok) {
      throw new Error('Firebase response not OK: ' + response.status);
    }

    const state = await response.json();
    const data = mapFirebaseState(state || {});

    renderDashboard(data);
  } catch (error) {
    console.error('Firebase load error:', error);
    showToast('Gagal memuat data');
  }
}

/* =========================
   MAP FIREBASE STATE
========================= */

function mapFirebaseState(state) {
  const smartplug = state.smartplug || {};
  const ac = state.ac || {};
  const lamp = state.lamp || {};
  const tv = state.tv || {};
  const nest = state.nest || {};
  const cctv = state.cctv || {};
  const energy = state.energy || {};
  const climate = state.climate || {};
  const lastAutomation = state.last_automation || {};

  return {
    climate: {
      temp: climate.temperature ?? '--',
      humidity: climate.humidity ?? '--'
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
  setText('roomTemp', formatValue(data.climate.temp, '°C'));
  setText('roomHumidity', formatValue(data.climate.humidity, '%'));

  setText('plugPower', formatValue(data.smartplug.power, 'W'));
  setText('plugVolt', formatValue(data.smartplug.voltage, 'V'));

  setText('acTemp', formatValue(data.ac.temp, '°C'));
  setText('acStatus', data.ac.power);
  setText('acMode', data.ac.mode);
  setText('acFan', data.ac.fan);

  renderACSlider(data.ac.temp);
  applyDeviceControlState('.ac-card', data.ac.power);

  setText('lampStatus', data.lamp.power);
  setText('lampBrightness', formatValue(data.lamp.brightness, '%'));
  setText('lampMode', data.lamp.mode);

  renderLampSlider(data.lamp.power, data.lamp.brightness);
  applyDeviceControlState('.lamp-card', data.lamp.power);

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

  renderHeroCardMeta(data);
}

/* =========================
   HERO CARD META POLISH
========================= */

function renderHeroCardMeta(data) {
  renderACMeta(data);
  renderLampMeta(data);
}

function renderACMeta(data) {
  const modeElement = document.getElementById('acMode');
  const fanElement = document.getElementById('acFan');

  if (modeElement) {
    modeElement.textContent = formatACModeLabel(data.ac.mode);
  }

  if (fanElement) {
    fanElement.textContent = formatFanLabel(data.ac.fan);
  }
}

function renderLampMeta(data) {
  const lampCard = document.querySelector('.lamp-card');
  const lampModeElement = document.getElementById('lampMode');

  if (!lampCard) return;

  const metaSpans = lampCard.querySelectorAll('.target-sub-info span');

  if (metaSpans[0]) {
    metaSpans[0].textContent = isOn(data.lamp.power) ? 'Active' : 'Standby';
  }

  if (lampModeElement) {
    lampModeElement.textContent = formatLampModeLabel(data.lamp.mode);
  }
}

function formatACModeLabel(value) {
  const mode = String(value || '--').trim().toLowerCase();

  if (mode === '--' || mode === '') return '--';
  if (mode.includes('cool')) return 'Cooling';
  if (mode.includes('heat')) return 'Heating';
  if (mode.includes('dry')) return 'Dry';
  if (mode.includes('fan')) return 'Fan';
  if (mode.includes('auto')) return 'Auto';

  return toTitleCase(mode);
}

function formatFanLabel(value) {
  const fan = String(value || '--').trim().toLowerCase();

  if (fan === '--' || fan === '') return '--';
  if (fan.includes('auto')) return 'Auto';
  if (fan.includes('low')) return 'Low';
  if (fan.includes('mid')) return 'Medium';
  if (fan.includes('medium')) return 'Medium';
  if (fan.includes('high')) return 'High';
  if (fan.includes('turbo')) return 'Turbo';
  if (fan.includes('sleep')) return 'Sleep';

  return toTitleCase(fan);
}

function formatLampModeLabel(value) {
  const mode = String(value || '--').trim().toLowerCase();

  if (mode === '--' || mode === '') return '--';
  if (mode.includes('white')) return 'White';
  if (mode.includes('colour')) return 'Color';
  if (mode.includes('color')) return 'Color';
  if (mode.includes('scene')) return 'Scene';
  if (mode.includes('music')) return 'Music';
  if (mode.includes('night')) return 'Night';

  return toTitleCase(mode);
}

function toTitleCase(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\b\w/g, character => character.toUpperCase());
}

/* =========================
   VISUAL SLIDERS
========================= */

function renderACSlider(tempValue) {
  const temp = Number(tempValue || 24);
  const percent = ((temp - 16) / 14) * 100;
  const safePercent = clampNumber(percent, 0, 100);

  updateSliderVisual(
    '.ac-card .target-fake-slider',
    '#acSliderFill',
    '--ac-pos',
    safePercent
  );
}

function renderLampSlider(power, brightness) {
  const lampInput = document.getElementById('lampBrightnessSlider');
  const value = Number(brightness || 0);
  const safeValue = clampNumber(value, 0, 100);

  updateSliderVisual(
    '.lamp-card .lamp-bar',
    '#lampBar',
    '--lamp-pos',
    safeValue
  );

  if (lampInput && document.activeElement !== lampInput) {
    lampInput.value = safeValue;
  }
}

function updateSliderVisual(trackSelector, thumbSelector, cssVariableName, percent) {
  const track = document.querySelector(trackSelector);
  const thumb = document.querySelector(thumbSelector);

  if (!track || !thumb) return;

  const safePercent = clampNumber(percent, 0, 100);

  track.style.setProperty(cssVariableName, safePercent + '%');
  thumb.style.left = safePercent + '%';
  thumb.style.transform = 'translate3d(-50%, -50%, 0)';
}

/* =========================
   DEVICE STATE
========================= */

function normalizeDeviceState(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function isDeviceOn(value) {
  const state = normalizeDeviceState(value);

  return (
    state === 'on' ||
    state === 'online' ||
    state === 'true' ||
    state === '1' ||
    state.includes(' on') ||
    state.includes('on')
  );
}

function applyDeviceControlState(cardSelector, statusValue) {
  const card = document.querySelector(cardSelector);

  if (!card) return;

  const active = isDeviceOn(statusValue);

  card.classList.toggle('disabled', !active);
  card.setAttribute('aria-disabled', String(!active));
}

/* =========================
   CONTROL BINDINGS
========================= */

function bindControls() {
  const acToggleButton = document.getElementById('acToggleBtn');
  const acPlusButton = document.getElementById('acPlusBtn');
  const acMinusButton = document.getElementById('acMinusBtn');
  const lampToggleButton = document.getElementById('lampToggleBtn');
  const lampSlider = document.getElementById('lampBrightnessSlider');
  const rerunSceneButton = document.getElementById('rerunSceneBtn');

  if (acToggleButton) {
    acToggleButton.addEventListener('click', () => {
      const active = acToggleButton.classList.contains('on');
      sendControl(active ? 'ac_off' : 'ac_on');
    });
  }

  if (acPlusButton) {
    acPlusButton.addEventListener('click', () => {
      sendControl('ac_temp_up');
    });
  }

  if (acMinusButton) {
    acMinusButton.addEventListener('click', () => {
      sendControl('ac_temp_down');
    });
  }

  if (lampToggleButton) {
    lampToggleButton.addEventListener('click', () => {
      const active = lampToggleButton.classList.contains('on');
      sendControl(active ? 'lamp_off' : 'lamp_on');
    });
  }

  if (lampSlider) {
    lampSlider.addEventListener('input', () => {
      const lampBrightnessElement = document.getElementById('lampBrightness');
      const value = clampNumber(Number(lampSlider.value || 0), 0, 100);

      updateSliderVisual(
        '.lamp-card .lamp-bar',
        '#lampBar',
        '--lamp-pos',
        value
      );

      if (lampBrightnessElement) {
        lampBrightnessElement.textContent = value + ' %';
      }
    });

    lampSlider.addEventListener('change', () => {
      sendControl('lamp_brightness', lampSlider.value);
    });
  }

  if (rerunSceneButton) {
    rerunSceneButton.addEventListener('click', () => {
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

    const response = await fetch(url);
    const text = await response.text();

    console.log('Control response:', text);

    showToast('Perintah terkirim');

    setTimeout(loadFirebaseState, 1200);
  } catch (error) {
    console.error('Control error:', error);
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
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function setBadge(id, active) {
  const element = document.getElementById(id);

  if (!element) return;

  const isHeroToggle =
    id === 'acToggleBtn' ||
    id === 'lampToggleBtn';

  element.className = isHeroToggle
    ? 'badge target-toggle ' + (active ? 'on' : 'off')
    : 'badge ' + (active ? 'on' : 'off');

  if (isHeroToggle) {
    element.textContent = '';
    element.setAttribute('aria-pressed', active ? 'true' : 'false');
    element.setAttribute('title', active ? 'ON' : 'OFF');
  } else {
    element.textContent = active ? 'ON' : 'OFF';
  }
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

function clampNumber(value, min, max) {
  const number = Number(value);

  if (Number.isNaN(number)) return min;

  return Math.max(min, Math.min(max, number));
}

function formatValue(value, suffix) {
  if (
    value === '--' ||
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '--';
  }

  if (suffix === '°C' || suffix === '%') {
    return value + ' ' + suffix;
  }

  return value + suffix;
}

function formatKwh(value) {
  return Number(value || 0).toFixed(2) + ' kWh';
}

function formatRupiah(value) {
  return 'Rp ' + Number(value || 0).toLocaleString('id-ID');
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

function updateHeaderDateTime() {
  const element = document.getElementById('lastUpdated');

  if (!element) return;

  const now = new Date();

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ];

  const date = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  element.textContent = `${date} ${month} ${year} • ${hours}:${minutes}`;
}
