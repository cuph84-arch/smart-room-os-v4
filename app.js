/* Smart Room OS V4 - app.js */

const DATA_ENDPOINT = "https://YOUR-ENDPOINT-HERE.com/smart-room-data.json";
const CONTROL_ENDPOINT = "https://YOUR-CONTROL-ENDPOINT-HERE.com/control";

const REFRESH_INTERVAL = 5000;

const $ = (id) => document.getElementById(id);

const state = {
  acTemp: 28,
  lampBrightness: 1,
  lastSceneName: "Movie Mode"
};

function setText(id, value, fallback = "-") {
  const el = $(id);
  if (!el) return;
  el.textContent = value ?? fallback;
}

function formatRupiah(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function updateCurrentDateTime() {
  const now = new Date();

  setText(
    "currentDateTime",
    now.toLocaleString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  );
}

function normalizeStatus(value) {
  if (!value) return "OFF";

  const text = String(value).toUpperCase();

  if (text.includes("ON") || text.includes("ONLINE") || text.includes("ACTIVE")) {
    return text.includes("ONLINE") ? "ONLINE" : "ON";
  }

  return text;
}

function updateStatusClass(id, status) {
  const el = $(id);
  if (!el) return;

  const s = normalizeStatus(status);

  el.classList.remove(
    "bg-emerald-400",
    "bg-red-400",
    "bg-white/15",
    "text-emerald-300",
    "text-red-300"
  );

  if (s === "ON" || s === "ONLINE") {
    el.classList.add("bg-emerald-400");
  } else {
    el.classList.add("bg-white/15");
  }
}

function updateSliderFill(sliderId, colorStart, colorEnd) {
  const slider = $(sliderId);
  if (!slider) return;

  const min = Number(slider.min || 0);
  const max = Number(slider.max || 100);
  const value = Number(slider.value || 0);
  const percent = ((value - min) / (max - min)) * 100;

  slider.style.background = `
    linear-gradient(
      90deg,
      ${colorStart} 0%,
      ${colorEnd} ${percent}%,
      rgba(255,255,255,0.18) ${percent}%,
      rgba(255,255,255,0.18) 100%
    )
  `;
}

async function fetchDashboardData() {
  try {
    const response = await fetch(DATA_ENDPOINT, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data dashboard");
    }

    const data = await response.json();
    renderDashboard(data);
  } catch (error) {
    console.warn("Fetch dashboard error:", error.message);
  }
}

function renderDashboard(data) {
  const ac = data.ac || {};
  const lamp = data.lamp || {};
  const tv = data.tv || {};
  const nest = data.nest || {};
  const climate = data.climate || {};
  const power = data.power || {};
  const cctv = data.cctv || {};
  const energy = data.energy || {};
  const scene = data.scene || {};

  state.acTemp = Number(ac.temperature ?? state.acTemp);
  state.lampBrightness = Number(lamp.brightness ?? state.lampBrightness);
  state.lastSceneName = scene.name || state.lastSceneName;

  setText("summaryAcStatus", normalizeStatus(ac.status));
  setText("summaryLampStatus", normalizeStatus(lamp.status));
  setText("summaryTvStatus", normalizeStatus(tv.status));
  setText("summaryCctvStatus", normalizeStatus(cctv.status));
  setText("summaryKwhToday", `${energy.todayKwh ?? "0.00"} kWh`);
  setText("summaryCostToday", formatRupiah(energy.todayCost));

  setText("acStatus", normalizeStatus(ac.status));
  setText("acTemp", state.acTemp);
  setText("acMode", ac.mode || "COOL");
  setText("acFan", ac.fan || "AUTO");

  setText("lampStatus", normalizeStatus(lamp.status));
  setText("lampBrightness", state.lampBrightness);
  setText("lampMode", lamp.mode || "White");

  setText("tvStatus", normalizeStatus(tv.status));
  setText("tvScreen", tv.screen || tv.app || "-");

  setText("nestStatus", normalizeStatus(nest.status));
  setText("nestVolume", `${nest.volume ?? 0}%`);

  setText("roomTemp", `${climate.temperature ?? "-"}°C`);
  setText("roomHumidity", `${climate.humidity ?? "-"}%`);
  setText("powerWatt", `${power.watt ?? "-"}W`);
  setText("powerVoltage", `${power.voltage ?? "-"}V`);

  setText("cctvStatus", normalizeStatus(cctv.status));
  setText("cctvMotion", normalizeStatus(cctv.motion));
  setText("cctvLastMotion", cctv.lastMotionTime || "-");
  setText("cctvLastUpdate", formatDateTime(cctv.lastUpdate));

  setText("energyTodayKwh", `${energy.todayKwh ?? "0.00"} kWh`);
  setText("energyTodayCost", formatRupiah(energy.todayCost));
  setText("energyWeekKwh", `${energy.weekKwh ?? "0.00"} kWh`);
  setText("energyWeekCost", formatRupiah(energy.weekCost));
  setText("energyMonthKwh", `${energy.monthKwh ?? "0.00"} kWh`);
  setText("energyMonthCost", formatRupiah(energy.monthCost));
  setText("energyMonthTotalCost", formatRupiah(energy.monthTotalCost));

  setText("lastSceneName", state.lastSceneName);
  setText("lastSceneTime", formatDateTime(scene.time));

  const acSlider = $("acSlider");
  if (acSlider) acSlider.value = state.acTemp;

  const lampSlider = $("lampSlider");
  if (lampSlider) lampSlider.value = state.lampBrightness;

  const nestSlider = $("nestVolumeSlider");
  if (nestSlider) nestSlider.value = nest.volume ?? 0;

  updateStatusClass("acStatus", ac.status);
  updateStatusClass("lampStatus", lamp.status);
  updateStatusClass("tvStatus", tv.status);
  updateStatusClass("nestStatus", nest.status);
  updateStatusClass("cctvStatus", cctv.status);

  updateSliderFill("acSlider", "#38bdf8", "#22c55e");
  updateSliderFill("lampSlider", "#ffffff", "#a78bfa");
  updateSliderFill("nestVolumeSlider", "#60a5fa", "#93c5fd");
}

async function sendControl(action, payload = {}) {
  try {
    await fetch(CONTROL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action,
        payload,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.warn("Control error:", error.message);
  }
}

function setupAcControls() {
  const minusBtn = $("acMinusBtn");
  const plusBtn = $("acPlusBtn");
  const slider = $("acSlider");

  if (minusBtn) {
    minusBtn.addEventListener("click", () => {
      state.acTemp = Math.max(16, state.acTemp - 1);
      setText("acTemp", state.acTemp);
      if (slider) slider.value = state.acTemp;
      updateSliderFill("acSlider", "#38bdf8", "#22c55e");
      sendControl("AC_SET_TEMP", { temperature: state.acTemp });
    });
  }

  if (plusBtn) {
    plusBtn.addEventListener("click", () => {
      state.acTemp = Math.min(30, state.acTemp + 1);
      setText("acTemp", state.acTemp);
      if (slider) slider.value = state.acTemp;
      updateSliderFill("acSlider", "#38bdf8", "#22c55e");
      sendControl("AC_SET_TEMP", { temperature: state.acTemp });
    });
  }

  if (slider) {
    slider.addEventListener("input", () => {
      state.acTemp = Number(slider.value);
      setText("acTemp", state.acTemp);
      updateSliderFill("acSlider", "#38bdf8", "#22c55e");
    });

    slider.addEventListener("change", () => {
      sendControl("AC_SET_TEMP", { temperature: state.acTemp });
    });
  }
}

function setupLampControls() {
  const slider = $("lampSlider");

  if (!slider) return;

  slider.addEventListener("input", () => {
    state.lampBrightness = Number(slider.value);
    setText("lampBrightness", state.lampBrightness);
    updateSliderFill("lampSlider", "#ffffff", "#a78bfa");
  });

  slider.addEventListener("change", () => {
    sendControl("LAMP_SET_BRIGHTNESS", {
      brightness: state.lampBrightness
    });
  });
}

function setupNestControls() {
  const slider = $("nestVolumeSlider");

  if (!slider) return;

  slider.addEventListener("input", () => {
    setText("nestVolume", `${slider.value}%`);
    updateSliderFill("nestVolumeSlider", "#60a5fa", "#93c5fd");
  });

  slider.addEventListener("change", () => {
    sendControl("NEST_SET_VOLUME", {
      volume: Number(slider.value)
    });
  });
}

function setupSceneControl() {
  const btn = $("runLastSceneBtn");

  if (!btn) return;

  btn.addEventListener("click", () => {
    btn.textContent = "Menjalankan...";
    sendControl("RUN_LAST_SCENE", {
      scene: state.lastSceneName
    });

    setTimeout(() => {
      btn.textContent = "▶ Jalankan Lagi";
    }, 1200);
  });
}

function setupControls() {
  setupAcControls();
  setupLampControls();
  setupNestControls();
  setupSceneControl();
}

function initDemoData() {
  renderDashboard({
    ac: {
      status: "ON",
      temperature: 28,
      mode: "COOL",
      fan: "AUTO"
    },
    lamp: {
      status: "OFF",
      brightness: 1,
      mode: "White"
    },
    tv: {
      status: "ON",
      screen: "🌙 Screen Saver"
    },
    nest: {
      status: "ON",
      volume: 45
    },
    climate: {
      temperature: 27.8,
      humidity: 66
    },
    power: {
      watt: 15.4,
      voltage: 218
    },
    cctv: {
      status: "ONLINE",
      motion: "ON",
      lastMotionTime: "00:22:35",
      lastUpdate: new Date().toISOString()
    },
    energy: {
      todayKwh: "0.01",
      todayCost: 5,
      weekKwh: "10.10",
      weekCost: 6111,
      monthKwh: "20.30",
      monthCost: 12279,
      monthTotalCost: 12279
    },
    scene: {
      name: "Movie Mode",
      time: new Date().toISOString()
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCurrentDateTime();
  setInterval(updateCurrentDateTime, 60000);

  setupControls();
  initDemoData();

  fetchDashboardData();
  setInterval(fetchDashboardData, REFRESH_INTERVAL);
});
