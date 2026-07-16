import {
  listenToSmartRoomState,
  sendControlRequest,
  sendTvControl,
} from "./connector.js";

console.log("Hybrid Smart Room OS V2 - Driver Status Fix Loaded");

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
    // Mempertahankan pemetaan state Firebase dengan aman
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
      volume: tv.volume ?? 45,
      updatedAt: tv.updated_at ?? "--",
    },
    cctv: {
      online: cctv.online ?? "--",
      motion: cctv.motion ?? "--",
      recording: cctv.recording ?? "--",
      lastMotion: cctv.last_motion ?? "--",
    },
    energy: {
      today: smartplug.today_kwh ?? energy.today_kwh ?? 0,
      monthCost: smartplug.month_cost ?? energy.month_cost ?? 0,
    }
  };
}

/* =========================
   RENDER DASHBOARD (SINKRONISASI UTUH)
========================= */

function renderDashboard(data) {
  // --- Smart Room Overview Utama ---
  setText("lblWeather", data.climate.temp !== "--" ? data.climate.temp + "°C" : "--°C");
  setText("txtMainTemp", data.climate.temp);
  setText("txtMainHumid", data.climate.humidity + "%");
  setText("txtMiniPower", data.smartplug.power);
  setText("txtMiniCost", data.energy.monthCost);

  // --- Summary Quick Access Device Status ---
  const acOn = isOn(data.ac.power);
  setText("statSummaryAC", acOn ? "ON" : "OFF");
  applyActiveOvState("#btnSummaryAC", acOn);
  
  const lampOn = isOn(data.lamp.power);
  setText("statSummaryLamp", lampOn ? "ON" : "OFF");
  applyActiveOvState("#btnSummaryLamp", lampOn);
  
  const tvOn = isOn(data.tv.power);
  setText("statSummaryTV", tvOn ? "ON" : "OFF");
  applyActiveOvState("#btnSummaryTV", tvOn);
  
  const cctvOn = isOn(data.cctv.online);
  setText("statSummaryCCTV", cctvOn ? "ONLINE" : "OFFLINE");
  applyActiveOvState("#btnSummaryCCTV", cctvOn);

  // --- AC Control Card ---
  applyDeviceActiveState("#cardACControl", data.ac.power);
  setText("txtACTemp", data.ac.temp);
  setText("btnToggleAC", acOn ? "ON" : "OFF");

  // --- Lamp Control Card ---
  applyDeviceActiveState("#cardLampControl", data.lamp.power);
  setText("txtLampBrightness", data.lamp.brightness + "%");
  setText("btnToggleLamp", lampOn ? "ON" : "OFF");
  syncLampSlider(data.lamp.power, data.lamp.brightness);

  // --- Climate & Sensor Stat (Grid Bawah) ---
  setText("sensorTemp", data.climate.temp);
  setText("sensorHumid", data.climate.humidity);
  setText("sensorPower", data.smartplug.power);
  setText("sensorVoltage", data.smartplug.voltage);

  // --- CCTV Data ---
  setText("lblCCTVStatus", cctvOn ? "ONLINE" : "OFFLINE");
  setText("txtCCTVMotion", data.cctv.motion);
  setText("txtCCTVRecord", data.cctv.recording);
  setText("txtCCTVLastTime", data.cctv.lastMotion);

  // --- Energy Chart Stat ---
  setText("txtEnergyTotal", "• " + data.energy.today + " ");
  setText("txtEnergyTotalCost", data.energy.monthCost);
}

/* =========================
   VISUAL STATE HELPERS (DIOPTIMALKAN)
========================= */

function isOn(value) {
  if (value === 1 || value === '1' || value === true) return true;
  const text = String(value || "").toUpperCase();
  return text.includes("ON") || text === "TRUE" || text === "ONLINE";
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function applyActiveOvState(cardSelector, isDeviceActive) {
  const card = document.querySelector(cardSelector);
  if (!card) return;
  
  card.classList.toggle("active", isDeviceActive);
  
  // Intervensi inline style jika CSS Class gagal mengubah visual
  if (isDeviceActive) {
    card.style.opacity = "1";
    card.style.background = ""; // kembalikan ke CSS default
  } else {
    card.style.opacity = "0.6";
    card.style.background = "#f1f5f9"; // berikan warna abu-abu redup
  }
}

function applyDeviceActiveState(cardSelector, statusValue) {
  const card = document.querySelector(cardSelector);
  if (!card) return;
  
  const active = isOn(statusValue);
  card.classList.toggle("active", active);
  
  // Memanipulasi visual container secara langsung agar presisi
  if (active) {
    card.style.opacity = "1";
    card.style.filter = "none";
  } else {
    card.style.opacity = "0.75";
    card.style.filter = "grayscale(20%)"; // sedikit memudarkan warna kartu kontrol
  }
  
  // Sinkronisasi warna komponen badge status di pojok kanan kartu
  const badge = card.querySelector(".badge-status-on");
  if (badge) {
    if (active) {
      badge.style.background = "#22c55e";
      badge.style.color = "#ffffff";
    } else {
      badge.style.background = "#64748b";
      badge.style.color = "#ffffff";
    }
  }
}

/* =========================
   LAMP SLIDER SYNC
========================= */

function syncLampSlider(power, brightness) {
  const lampInput = document.getElementById("brightnessInput");
  const fillBar = document.getElementById("lampBarFilled");
  if (!lampInput || !fillBar) return;

  const value = isOn(power) ? brightness : 0;

  if (document.activeElement !== lampInput) {
    lampInput.value = value;
  }
  fillBar.style.width = value + "%";
}

/* =========================
   CONTROL BINDINGS
========================= */

function bindControls() {
  // Toggle Card AC
  const acBadge = document.getElementById("btnToggleAC");
  if (acBadge) {
    acBadge.addEventListener("click", () => {
      const card = document.getElementById("cardACControl");
      const active = card && card.classList.contains("active");
      sendAcControl(active ? "ac_off" : "ac_on");
    });
  }

  // Kontrol Suhu AC
  const sendTempControl = (nextTemp) => {
    const safeTemp = Math.max(16, Math.min(30, nextTemp));
    sendAcControl("cool_" + safeTemp + "_auto");
  };

  document.getElementById("btnTempUp")?.addEventListener("click", () => {
    const currentTemp = parseInt(document.getElementById("txtACTemp").textContent) || 24;
    sendTempControl(currentTemp + 1);
  });

  document.getElementById("btnTempDown")?.addEventListener("click", () => {
    const currentTemp = parseInt(document.getElementById("txtACTemp").textContent) || 24;
    sendTempControl(currentTemp - 1);
  });

  // Toggle Card Lampu
  const lampBadge = document.getElementById("btnToggleLamp");
  if (lampBadge) {
    lampBadge.addEventListener("click", () => {
      const card = document.getElementById("cardLampControl");
      const active = card && card.classList.contains("active");
      sendControl(active ? "lamp_off" : "lamp_on");
    });
  }

  // Slider Kecerahan Lampu
  const lampSlider = document.getElementById("brightnessInput");
  if (lampSlider) {
    lampSlider.addEventListener("input", () => {
      const value = lampSlider.value;
      const fillBar = document.getElementById("lampBarFilled");
      if (fillBar) fillBar.style.width = value + "%";
      
      const textDisplay = document.getElementById("txtLampBrightness");
      if (textDisplay) textDisplay.textContent = value + "%";
    });

    lampSlider.addEventListener("change", () => {
      sendControl("lamp_brightness", lampSlider.value);
    });
  }
}

/* =========================
   CONTROL SENDERS
========================= */

async function sendAcControl(command) {
  try {
    showToast("Mengirim perintah AC...");
    await sendControlRequest(command);
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
    showToast("Perintah terkirim");
  } catch (error) {
    console.error("Control error:", error);
    showToast("Gagal kirim perintah");
  }
}

/* =========================
   HEADER DATE TIME
========================= */

function updateHeaderDateTime() {
  const element = document.getElementById("lastUpdated");
  if (!element) return;
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  element.textContent = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} • ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/* =========================
   TOAST NOTIFICATION
========================= */

function showToast(message) {
  let toast = document.getElementById("smartToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "smartToast";
    toast.style.position = "fixed";
    toast.style.left = "50%", toast.style.bottom = "80px";
    toast.style.transform = "translateX(-50%)";
    toast.style.padding = "10px 16px";
    toast.style.borderRadius = "30px";
    toast.style.background = "rgba(0,0,0,.75)";
    toast.style.color = "#fff";
    toast.style.fontSize = "12px";
    toast.style.zIndex = "9999";
    toast.style.transition = "opacity .25s, transform .25s";
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
