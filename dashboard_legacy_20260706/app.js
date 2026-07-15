import {
  listenToSmartRoomState,
  sendControlRequest,
  sendTvControl,
} from "./connector.js";

console.log("Smart Room OS V4 Firebase Realtime Loaded");


/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  bindControls();
  updateHeaderDateTime();
  startRealtimeListener();

  setInterval(updateHeaderDateTime, 60000);
});

/* =========================
   REALTIME FIREBASE
========================= */

function startRealtimeListener() {
  listenToSmartRoomState((state) => {
    const data = mapFirebaseState(state || {});
    renderDashboard(data);
  });
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
  const speaker = state.speaker || {};
  const cctv = state.cctv || {};
  const energy = state.energy || {};
  const climate = state.climate || {};
  const lastAutomation = state.last_automation || {};

  return {
    climate: {
      temp: climate.temperature ?? "--",
      humidity: climate.humidity ?? "--",
      updatedAt: climate.updated_at ?? "--"
    },

    smartplug: {
      power: smartplug.watt ?? smartplug.power ?? "--",
      voltage: smartplug.voltage ?? smartplug.volt ?? "--",
      current: smartplug.current ?? "--",
      totalKwh: smartplug.total_kwh ?? "--",
      acStatus: smartplug.ac_status ?? "--",
      updatedAt: smartplug.updated_at ?? "--"
    },

    ac: {
      power: ac.power ?? smartplug.ac_status ?? "--",
      temp: ac.temp ?? ac.temperature ?? "--",
      mode: ac.mode ?? "--",
      fan: ac.fan ?? "--",
      updatedAt: ac.updated_at ?? "--"
    },

    lamp: {
      power: lamp.power ?? "--",
      brightness: lamp.brightness ?? 0,
      mode: lamp.mode ?? "--",
      colorTemp: lamp.color_temp ?? "--",
      updatedAt: lamp.updated_at ?? "--"
    },

    tv: {
      device: tv.device ?? "TCL Google TV",
      power: tv.power ?? "--",
      app: tv.app ?? tv.screen ?? "",
      screen: tv.screen ?? "",
      mediaState: tv.media_state ?? tv.status ?? "--",
      title: tv.title ?? "",
      volume: clampNumber(tv.volume ?? 45, 0, 100),
      updatedAt: tv.updated_at ?? "--",
      displayStatus: getTvDisplayStatus(tv)
    },

    nest: {
      online: nest.online ?? speaker.online ?? false,
      status: nest.status ?? speaker.status ?? "IDLE",
      volume: clampNumber(nest.volume ?? speaker.volume ?? 45, 0, 100),
      device: nest.device ?? speaker.device ?? "Nest Mini",
      updatedAt: nest.updated_at ?? speaker.updated_at ?? "--"
    },

    cctv: {
      online: cctv.online ?? "--",
      motion: cctv.motion ?? "--",
      recording: cctv.recording ?? "--",
      recordMode: cctv.record_mode ?? "--",
      nightVision: cctv.night_vision ?? "--",
      sdStatus: cctv.sd_status ?? "--",
      sdStorage: cctv.sd_storage ?? "--",
      lastMotion: cctv.last_motion ?? "--",
      updatedAt: cctv.updated_at ?? "--"
    },

    energy: {
      today: smartplug.today_kwh ?? energy.today_kwh ?? 0,
      week: smartplug.week_kwh ?? energy.week_kwh ?? 0,
      month: smartplug.month_kwh ?? energy.month_kwh ?? 0,

      todayCost: smartplug.today_cost ?? energy.today_cost ?? 0,
      weekCost: smartplug.week_cost ?? energy.week_cost ?? 0,
      monthCost: smartplug.month_cost ?? energy.month_cost ?? 0,

      todayRuntime:
        smartplug.today_runtime_text ??
        energy.today_runtime_text ??
        "0j 0m",

      weekRuntime:
        smartplug.week_runtime_text ??
        energy.week_runtime_text ??
        "0j 0m",

      monthRuntime:
        smartplug.month_runtime_text ??
        energy.month_runtime_text ??
        "0j 0m",

      tariffText:
        smartplug.tariff_text ??
        energy.tariff_text ??
        "Est. Rp605/kWh · B1 900VA",

      updatedAt:
        smartplug.updated_at ??
        energy.updated_at ??
        "--"
    },

    lastAutomation: {
      scene: lastAutomation.scene ?? "Belum ada scene",
      timestamp:
        lastAutomation.timestamp ??
        lastAutomation.updated_at ??
        "--"
    }
  };
}

/* =========================
   RENDER DASHBOARD
========================= */

function renderDashboard(data) {
  setText("roomTemp", formatValue(data.climate.temp, "°C"));
  setText("roomHumidity", formatValue(data.climate.humidity, "%"));

  setText("plugPower", formatValue(data.smartplug.power, "W"));
  setText("plugVolt", formatValue(data.smartplug.voltage, "V"));

  setText("acTemp", getACDisplayValue(data.ac));
  setText("acStatus", data.ac.power);
  setText("acMode", data.ac.mode);
  setText("acFan", data.ac.fan);

  renderACSlider(data.ac.temp);
  applyDeviceControlState(".ac-card", data.ac.power);

  setText("lampStatus", data.lamp.power);
  setText("lampBrightness", formatValue(data.lamp.brightness, "%"));
  setText("lampMode", data.lamp.mode);

  renderLampSlider(data.lamp.power, data.lamp.brightness);
  applyDeviceControlState(".lamp-card", data.lamp.power);

  renderTV(data.tv);

  setText("nestStatus", data.nest.status);
  setText("nestVolume", data.nest.volume);
  setBadge("nestPowerBadge", data.nest.online === true || isOn(data.nest.online));
  renderNestVolumeBar(data.nest.volume);

  setText("cctvOnline", data.cctv.online);
  const cctvBadge = document.getElementById("cctvOnline");

if (cctvBadge) {
  const online =
    String(data.cctv.online || "").toUpperCase() === "ONLINE";

  cctvBadge.classList.toggle("online", online);
  cctvBadge.classList.toggle("offline", !online);
}
  setText("cctvMotion", data.cctv.motion);
  setText("cctvRecording", data.cctv.recording);
  const lastMotionText = data?.cctv?.lastMotion ?? "--";
const lastMotionParts = String(lastMotionText).trim().split(/\s+/);

setText("cctvLastDate", lastMotionParts[0] ?? "--");
setText("cctvLastTime", lastMotionParts[1] ?? "--");
  
  setText("cctvRecordMode", data?.cctv?.recordMode ?? "--");
  setText("summaryAC", data.ac.power);
  setText("summaryLamp", data.lamp.power);
  setText("summaryTV", data.tv.power);
  setText("summaryCCTV", data.cctv.online);

  setText(
    "summaryEnergy",
    formatKwh(data.energy.today) + " · " + formatRupiah(data.energy.todayCost)
  );

  setText("energyToday", formatKwh(data.energy.today));
  setText("energyWeek", formatKwh(data.energy.week));
  setText("energyMonth", formatKwh(data.energy.month));

  setText("energyTodayCost", formatRupiah(data.energy.todayCost));
  setText("energyWeekCost", formatRupiah(data.energy.weekCost));
  setText("energyMonthCost", formatRupiah(data.energy.monthCost));

  setText("energyRuntimeMonth", data.energy.monthRuntime);
  setText("energyTariff", data.energy.tariffText);

  setText("sceneName", data.lastAutomation.scene);
  setText("sceneDate", data.lastAutomation.timestamp);
  setText("sceneTime", "🕘");

  setBadge("acToggleBtn", isOn(data.ac.power));
  setBadge("lampToggleBtn", isOn(data.lamp.power));

  renderHeroCardMeta(data);
}

/* =========================
   TV RENDER
========================= */

function renderTV(tv) {
  const powerOn = isOn(tv.power);
  const volume = clampNumber(tv.volume ?? 45, 0, 100);
  const displayStatus =
  tv.status ||
  tv.displayStatus ||
  (powerOn ? "online" : "offline");

  setText("tvStatus", displayStatus);
  setText("tvVolume", volume);

  setBadge("tvPowerBadge", powerOn);

  const tvPowerToggle = document.getElementById("tvPowerToggle");
  if (tvPowerToggle && tvPowerToggle.checked !== powerOn) {
    tvPowerToggle.checked = powerOn;
  }

  const tvVolumeSlider = document.getElementById("tvVolumeSlider");
  if (tvVolumeSlider && document.activeElement !== tvVolumeSlider) {
    tvVolumeSlider.value = volume;
    updateRangeBackground(tvVolumeSlider, volume);
  }

  const tvCard = document.querySelector(".tv-card");
  if (tvCard) {
    tvCard.classList.toggle("disabled", !powerOn);
    tvCard.setAttribute("aria-disabled", String(!powerOn));
    tvCard.style.setProperty("--tv-volume", volume + "%");
  }
}

/* =========================
   HERO CARD META POLISH
========================= */

function renderHeroCardMeta(data) {
  renderACMeta(data);
  renderLampMeta(data);
}

function getACDisplayValue(ac) {
  const power = isOn(ac.power);
  const mode = String(ac.mode || "").trim().toUpperCase();
  const status = String(ac.ac_status || "").trim().toUpperCase();
  const temp = Number(ac.temp || 0);

  if (!power || status === "OFF" || mode === "OFF") {
    return "Off";
  }

  if (mode.includes("FAN") || status.includes("FAN")) {
    return "Fan";
  }

  if (mode.includes("DRY") || status.includes("DRY")) {
    return "Dry";
  }

  if (mode.includes("HEAT") || status.includes("HEAT")) {
    return "Heat";
  }

  if (temp >= 16 && temp <= 30) {
    return temp + " °C";
  }

  if (mode.includes("COOL") || status.includes("COOL")) {
    return "Cool";
  }

  return "--";
}

function renderACMeta(data) {
  const modeElement = document.getElementById("acMode");
  const fanElement = document.getElementById("acFan");

  if (modeElement) {
    modeElement.textContent = formatACModeLabel(data.ac.mode);
  }

  if (fanElement) {
    fanElement.textContent = formatFanLabel(data.ac.fan);
  }
}

function renderLampMeta(data) {
  const lampCard = document.querySelector(".lamp-card");
  const lampModeElement = document.getElementById("lampMode");

  if (!lampCard) return;

  const metaSpans = lampCard.querySelectorAll(".target-sub-info span");

  if (metaSpans[0]) {
    metaSpans[0].textContent = isOn(data.lamp.power) ? "Active" : "Standby";
  }

  if (lampModeElement) {
    lampModeElement.textContent = formatLampModeLabel(data.lamp.mode);
  }
}

/* =========================
   VISUAL SLIDERS
========================= */

function renderACSlider(tempValue) {
  const temp = Number(tempValue || 24);
  const percent = ((temp - 16) / 14) * 100;
  const safePercent = clampNumber(percent, 0, 100);

  updateSliderVisual(
    ".ac-card .target-fake-slider",
    "#acSliderFill",
    "--ac-pos",
    safePercent
  );
}

function renderLampSlider(power, brightness) {
  const lampInput = document.getElementById("lampBrightnessSlider");
  const value = Number(brightness || 0);
  const safeValue = clampNumber(value, 0, 100);

  updateSliderVisual(
    ".lamp-card .lamp-bar",
    "#lampBar",
    "--lamp-pos",
    safeValue
  );

  if (lampInput && document.activeElement !== lampInput) {
    lampInput.value = safeValue;
    updateRangeBackground(lampInput, safeValue);
  }
}

function renderNestVolumeBar(volume) {
  const bar = document.querySelector(".nest-volume-bar div");
  const safeVolume = clampNumber(volume ?? 45, 0, 100);

  if (bar) {
    bar.style.width = safeVolume + "%";
  }
}

function updateSliderVisual(trackSelector, thumbSelector, cssVariableName, percent) {
  const track = document.querySelector(trackSelector);
  const thumb = document.querySelector(thumbSelector);

  if (!track || !thumb) return;

  const safePercent = clampNumber(percent, 0, 100);

  track.style.setProperty(cssVariableName, safePercent + "%");
  thumb.style.left = safePercent + "%";
  thumb.style.transform = "translate3d(-50%, -50%, 0)";
}

function updateRangeBackground(input, value) {
  if (!input) return;

  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const numberValue = clampNumber(value, min, max);
  const percent = ((numberValue - min) / (max - min)) * 100;

  input.style.background =
    "linear-gradient(90deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.78) " +
    percent +
    "%, rgba(255,255,255,0.16) " +
    percent +
    "%, rgba(255,255,255,0.16) 100%)";
}

/* =========================
   CONTROL BINDINGS
========================= */

function isACControlEnabled() {
  const button = document.getElementById("acToggleBtn");
  return button && button.classList.contains("on");
}

function bindControls() {
  const acToggleButton = document.getElementById("acToggleBtn");
  const acPlusButton = document.getElementById("acPlusBtn");
  const acMinusButton = document.getElementById("acMinusBtn");

  const lampToggleButton = document.getElementById("lampToggleBtn");
  const lampSlider = document.getElementById("lampBrightnessSlider");

  const tvPowerToggle = document.getElementById("tvPowerToggle");
  const tvVolumeSlider = document.getElementById("tvVolumeSlider");

  const rerunSceneButton = document.getElementById("rerunSceneBtn");

  if (acToggleButton) {
    acToggleButton.addEventListener("click", () => {
      const active = acToggleButton.classList.contains("on");
      sendAcControl(active ? "ac_off" : "ac_on");
    });
  }

  if (acPlusButton) {
    acPlusButton.addEventListener("click", () => {
      if (!isACControlEnabled()) return;

      const currentTemp = getCurrentACTemp();
      const nextTemp = clampNumber(currentTemp + 1, 16, 30);
      sendAcControl("cool_" + nextTemp + "_auto");
    });
  }

  if (acMinusButton) {
    acMinusButton.addEventListener("click", () => {
      if (!isACControlEnabled()) return;

      const currentTemp = getCurrentACTemp();
      const nextTemp = clampNumber(currentTemp - 1, 16, 30);
      sendAcControl("cool_" + nextTemp + "_auto");
    });
  }

  if (lampToggleButton) {
    lampToggleButton.addEventListener("click", () => {
      const active = lampToggleButton.classList.contains("on");
      sendControl(active ? "lamp_off" : "lamp_on");
    });
  }

  if (lampSlider) {
    lampSlider.addEventListener("input", () => {
      const lampBrightnessElement = document.getElementById("lampBrightness");
      const value = clampNumber(Number(lampSlider.value || 0), 0, 100);

      updateSliderVisual(".lamp-card .lamp-bar", "#lampBar", "--lamp-pos", value);
      updateRangeBackground(lampSlider, value);

      if (lampBrightnessElement) {
        lampBrightnessElement.textContent = value + " %";
      }
    });

    lampSlider.addEventListener("change", () => {
      sendControl("lamp_brightness", lampSlider.value);
    });
  }

if (tvPowerToggle) {
  tvPowerToggle.addEventListener("change", () => {
    sendTvControl("tv_power").catch((error) => {
      console.error("TV power control error:", error);
      showToast("Gagal mengirim perintah TV");
    });
  });
}

  if (tvVolumeSlider) {
    tvVolumeSlider.addEventListener("input", () => {
      const value = clampNumber(Number(tvVolumeSlider.value || 45), 0, 100);

      updateRangeBackground(tvVolumeSlider, value);
      setText("tvVolume", value);

      const tvCard = document.querySelector(".tv-card");
      if (tvCard) {
        tvCard.style.setProperty("--tv-volume", value + "%");
      }
    });

    tvVolumeSlider.addEventListener("change", () => {
      const value = clampNumber(Number(tvVolumeSlider.value || 45), 0, 100);

console.log("TV volume slider local only:", value);
    });
  }

  if (rerunSceneButton) {
    rerunSceneButton.addEventListener("click", () => {
      const scene = document.getElementById("sceneName")?.textContent || "";
      const action = sceneToAction(scene);

      if (action) {
        sendControl(action);
      } else {
        showToast("Scene belum tersedia");
      }
    });
  }
}

/* =========================
   SEND CONTROL
========================= */

function getCurrentACTemp() {
  const value = document.getElementById("acTemp")?.textContent || "24";
  const match = String(value).match(/\d+/);
  return clampNumber(Number(match ? match[0] : 24), 16, 30);
}

async function sendAcControl(command) {
  try {
    showToast("Mengirim perintah AC...");

await sendControlRequest(command);

    console.log("AC control request:", command);
    showToast("Perintah AC terkirim");
  } catch (error) {
    console.error("AC control error:", error);
    showToast("Gagal kirim perintah AC");
  }
}

async function sendControl(action, value = "") {
  try {
    showToast("Mengirim perintah...");

    await sendControlRequest(action, value);

    console.log("Control request:", action, value);
    showToast("Perintah terkirim");
  } catch (error) {
    console.error("Control error:", error);
    showToast("Gagal kirim perintah");
  }
}

/* =========================
   FORMATTERS
========================= */

function getTvDisplayStatus(tv) {
  if (!tv) return "Standby";

  const power = String(tv.power || "").toUpperCase();
  const app = String(tv.app || tv.screen || "").trim();
  const status = String(tv.status || tv.media_state || "").toUpperCase();
  const title = String(tv.title || "").trim();

  if (power !== "ON") return "Standby";

  if (title) return title;

  if (app === "" || app.toLowerCase() === "no app") {
    if (status === "PLAYING") return "Screen Saver";
    return "Home Screen";
  }

  if (status && status !== "--") {
    return app + " · " + status;
  }

  return app || "Active";
}

function formatACModeLabel(value) {
  const mode = String(value || "--").trim().toLowerCase();

  if (mode === "--" || mode === "") return "--";
  if (mode.includes("cool")) return "Cooling";
  if (mode.includes("heat")) return "Heating";
  if (mode.includes("dry")) return "Dry";
  if (mode.includes("fan")) return "Fan";
  if (mode.includes("auto")) return "Auto";

  return toTitleCase(mode);
}

function formatFanLabel(value) {
  const fan = String(value || "--").trim().toLowerCase();

  if (fan === "--" || fan === "") return "--";
  if (fan.includes("auto")) return "Auto";
  if (fan.includes("low")) return "Low";
  if (fan.includes("mid")) return "Medium";
  if (fan.includes("medium")) return "Medium";
  if (fan.includes("high")) return "High";
  if (fan.includes("turbo")) return "Turbo";
  if (fan.includes("sleep")) return "Sleep";

  return toTitleCase(fan);
}

function formatLampModeLabel(value) {
  const mode = String(value || "--").trim().toLowerCase();

  if (mode === "--" || mode === "") return "--";
  if (mode.includes("white")) return "White";
  if (mode.includes("colour")) return "Color";
  if (mode.includes("color")) return "Color";
  if (mode.includes("scene")) return "Scene";
  if (mode.includes("music")) return "Music";
  if (mode.includes("night")) return "Night";

  return toTitleCase(mode);
}

function toTitleCase(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, character => character.toUpperCase());
}

function formatValue(value, suffix) {
  if (value === "--" || value === null || value === undefined || value === "") {
    return "--";
  }

  if (suffix === "°C" || suffix === "%") {
    return value + " " + suffix;
  }

  return value + suffix;
}

function formatKwh(value) {
  return Number(value || 0).toFixed(2) + " kWh";
}

function formatRupiah(value) {
  return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

/* =========================
   STATE HELPERS
========================= */

function normalizeDeviceState(value) {
  return String(value || "").trim().toLowerCase();
}

function isDeviceOn(value) {
  const state = normalizeDeviceState(value);

  return (
    state === "on" ||
    state === "online" ||
    state === "true" ||
    state === "1" ||
    state.includes(" on") ||
    state.includes("on")
  );
}

function isOn(value) {
  const text = String(value || "").toUpperCase();

  return (
    text.includes("ON") ||
    text === "TRUE" ||
    text === "ONLINE" ||
    text === "1"
  );
}

function applyDeviceControlState(cardSelector, statusValue) {
  const card = document.querySelector(cardSelector);

  if (!card) return;

  const active = isDeviceOn(statusValue);

  card.classList.toggle("disabled", !active);
  card.setAttribute("aria-disabled", String(!active));
}

function clampNumber(value, min, max) {
  const number = Number(value);

  if (Number.isNaN(number)) return min;

  return Math.max(min, Math.min(max, number));
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function setBadge(id, active) {
  const element = document.getElementById(id);

  if (!element) return;

  const isHeroToggle = id === "acToggleBtn" || id === "lampToggleBtn";

  element.className = isHeroToggle
    ? "badge target-toggle " + (active ? "on" : "off")
    : "badge " + (active ? "on" : "off");

  if (isHeroToggle) {
    element.textContent = "";
    element.setAttribute("aria-pressed", active ? "true" : "false");
    element.setAttribute("title", active ? "ON" : "OFF");
  } else {
    element.textContent = active ? "ON" : "OFF";
  }
}

/* =========================
   SCENE ACTION MAP
========================= */

function sceneToAction(sceneName) {
  const scene = String(sceneName || "").toLowerCase();

  if (scene.includes("movie")) return "scene_movie";
  if (scene.includes("gaming")) return "scene_gaming";
  if (scene.includes("sleep")) return "scene_sleep";
  if (scene.includes("away")) return "scene_away";
  if (scene.includes("siapkan")) return "scene_siapan_kamar";
  if (scene.includes("kamar")) return "scene_siapan_kamar";

  return "";
}

/* =========================
   TOAST
========================= */

function showToast(message) {
  let toast = document.getElementById("smartToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "smartToast";
    toast.style.position = "fixed";
    toast.style.left = "50%";
    toast.style.bottom = "92px";
    toast.style.transform = "translateX(-50%)";
    toast.style.padding = "12px 18px";
    toast.style.borderRadius = "999px";
    toast.style.background = "rgba(0,0,0,.65)";
    toast.style.color = "#fff";
    toast.style.fontSize = "14px";
    toast.style.zIndex = "9999";
    toast.style.backdropFilter = "blur(18px)";
    toast.style.webkitBackdropFilter = "blur(18px)";
    toast.style.transition = "opacity .25s ease, transform .25s ease";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = "1";
  toast.style.transform = "translateX(-50%) translateY(0)";

  clearTimeout(window.smartToastTimer);

  window.smartToastTimer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(8px)";
  }, 1800);
}

/* =========================
   HEADER DATE TIME
========================= */

function updateHeaderDateTime() {
  const element = document.getElementById("lastUpdated");

  if (!element) return;

  const now = new Date();

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
  ];

  const date = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  element.textContent = `${date} ${month} ${year} • ${hours}:${minutes}`;
}



/* ============================================================
 * SMART ROOM OS V4
 * OS-DASHBOARD-002B DASHBOARD STATUS CONTRACT ADAPTER
 *
 * Purpose:
 * - Consume dynamic_v2/dashboard/status contract.
 * - Preserve all existing binding IDs.
 * - Do not execute device command.
 * - Do not control Smart Plug.
 * - Do not replace existing UI logic; only provide contract-based rendering.
 * ============================================================ */
(function () {
  "use strict";

  if (window.SmartRoomDashboardStatusAdapter) {
    return;
  }

  const DASHBOARD_STATUS_FIREBASE_PATH = "dynamic_v2/dashboard/status";
  const LOCAL_DASHBOARD_STATUS_PATHS = [
    "runtime/dashboard_status.json",
    "./runtime/dashboard_status.json",
    "dashboard_status.json"
  ];

  const BINDING_MAP = {
    summaryAC: "summary.summaryAC",
    summaryLamp: "summary.summaryLamp",
    summaryTV: "summary.summaryTV",
    summaryCCTV: "summary.summaryCCTV",
    summaryEnergy: "summary.summaryEnergy",
    acTemp: "cards.ac.temperature_text",
    acStatus: "cards.ac.status",
    acMode: "cards.ac.mode",
    acFan: "cards.ac.fan",
    acSliderFill: "cards.ac.temperature",
    lampStatus: "cards.lamp.status",
    lampBrightness: "cards.lamp.brightness_text",
    lampMode: "cards.lamp.mode",
    lampBar: "cards.lamp.brightness",
    lampBrightnessSlider: "cards.lamp.brightness",
    tvPowerBadge: "cards.tv.power",
    tvStatus: "cards.tv.status",
    tvVolume: "cards.tv.volume",
    tvVolumeSlider: "cards.tv.volume",
    nestPowerBadge: "cards.nest.bindings.nestPowerBadge",
    nestStatus: "cards.nest.bindings.nestStatus",
    nestVolume: "cards.nest.bindings.nestVolume",
    nestVolumeBarFill: "cards.nest.bindings.nestVolumeBarFill",
    roomTemp: "cards.climate_power.bindings.roomTemp",
    roomHumidity: "cards.climate_power.bindings.roomHumidity",
    plugPower: "cards.climate_power.bindings.plugPower",
    plugVolt: "cards.climate_power.bindings.plugVolt",
    cctvOnline: "cards.cctv.bindings.cctvOnline",
    cctvMotion: "cards.cctv.bindings.cctvMotion",
    cctvRecording: "cards.cctv.bindings.cctvRecording",
    cctvLastMotion: "cards.cctv.bindings.cctvLastMotion",
    energyToday: "cards.energy.bindings.energyToday",
    energyWeek: "cards.energy.bindings.energyWeek",
    energyMonth: "cards.energy.bindings.energyMonth",
    energyMonthCost: "cards.energy.bindings.energyMonthCost",
    energyTodayCost: "cards.energy.bindings.energyTodayCost",
    energyWeekCost: "cards.energy.bindings.energyWeekCost",
    energyRuntimeMonth: "cards.energy.bindings.energyRuntimeMonth",
    energyTariff: "cards.energy.bindings.energyTariff"
  };

  function getByPath(obj, dottedPath) {
    if (!obj || !dottedPath) return undefined;
    return dottedPath.split(".").reduce(function (acc, key) {
      if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
        return acc[key];
      }
      return undefined;
    }, obj);
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return false;

    if (typeof value === "boolean") {
      el.textContent = value ? "ON" : "OFF";
    } else if (value === null || value === undefined || value === "") {
      el.textContent = "-";
    } else {
      el.textContent = String(value);
    }

    return true;
  }

  function setRangeOrFill(id, value) {
    const el = document.getElementById(id);
    if (!el) return false;

    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) {
      if (el.tagName === "INPUT" && el.type === "range") {
        el.value = String(numberValue);
        if (typeof window.updateRangeBackground === "function") {
          window.updateRangeBackground(el);
        }
        return true;
      }

      if (el.style) {
        el.style.width = Math.max(0, Math.min(100, numberValue)) + "%";
      }
    }

    return setText(id, value);
  }

  function setBadge(id, value) {
    const el = document.getElementById(id);
    if (!el) return false;

    const isOn = value === true || String(value).toLowerCase() === "on" || String(value).toLowerCase() === "true";
    el.textContent = isOn ? "ON" : "OFF";
    el.classList.toggle("is-on", isOn);
    el.classList.toggle("is-off", !isOn);
    return true;
  }

  function applyContract(data) {
    if (!data || typeof data !== "object") {
      return {
        success: false,
        reason: "invalid_dashboard_status_payload"
      };
    }

    const applied = [];
    const missing = [];

    Object.keys(BINDING_MAP).forEach(function (id) {
      const path = BINDING_MAP[id];
      const value = getByPath(data, path);

      if (value === undefined) {
        missing.push({ id: id, path: path, reason: "missing_contract_path" });
        return;
      }

      let ok = false;

      if (id.endsWith("Badge")) {
        ok = setBadge(id, value);
      } else if (id.toLowerCase().includes("slider") || id.toLowerCase().includes("bar") || id.endsWith("Fill")) {
        ok = setRangeOrFill(id, value);
      } else {
        ok = setText(id, value);
      }

      if (ok) {
        applied.push({ id: id, path: path });
      } else {
        missing.push({ id: id, path: path, reason: "missing_frontend_element" });
      }
    });

    document.documentElement.setAttribute("data-dashboard-contract", "dashboard_status_v1");
    window.__SMART_ROOM_LAST_DASHBOARD_STATUS__ = data;

    return {
      success: missing.length === 0,
      applied: applied,
      missing: missing,
      source_engine: data.engine || null,
      checkpoint: data.checkpoint || null,
      timestamp: data.timestamp || null
    };
  }

  async function fetchLocalDashboardStatus() {
    for (const path of LOCAL_DASHBOARD_STATUS_PATHS) {
      try {
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) continue;
        const payload = await response.json();
        return {
          success: true,
          source: path,
          payload: payload
        };
      } catch (error) {
        // Try next local path.
      }
    }

    return {
      success: false,
      source: null,
      payload: null
    };
  }

  function startFirebaseDashboardStatusListener() {
    try {
      if (!window.firebase || !window.firebase.database) {
        return false;
      }

      const db = window.firebase.database();
      db.ref(DASHBOARD_STATUS_FIREBASE_PATH).on("value", function (snapshot) {
        const payload = snapshot.val();
        if (payload) {
          applyContract(payload);
        }
      });

      return true;
    } catch (error) {
      console.warn("Dashboard status Firebase listener failed:", error);
      return false;
    }
  }

  async function start() {

    if (window.IS_OFFLINE_DEV && window.OFFLINE_STATE) {
      console.log("OS-OFFLINE-001C Offline Mode");
      applyContract(window.OFFLINE_STATE);
      return;
    }

    const firebaseStarted = startFirebaseDashboardStatusListener();

    if (!firebaseStarted) {
      const local = await fetchLocalDashboardStatus();
      if (local.success) {
        applyContract(local.payload);
      }
    }
  }

  window.SmartRoomDashboardStatusAdapter = {
    checkpoint: "OS-DASHBOARD-002B",
    contract: "dashboard_status.json",
    firebasePath: DASHBOARD_STATUS_FIREBASE_PATH,
    bindingMap: BINDING_MAP,
    apply: applyContract,
    start: start,
    rules: {
      localFirst: true,
      dashboardBindingChanged: false,
      deviceCommandExecuted: false,
      cloudApiCalled: false,
      smartPlugProtected: true
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();



/* 01_HEADER datetime init fallback */

document.addEventListener("DOMContentLoaded", () => {
  updateHeaderDateTime();
  setInterval(updateHeaderDateTime, 60000);
});
