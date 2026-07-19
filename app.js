import {
  listenToSmartRoomState,
  sendControlRequest,
  sendTvControl,
  sendAcControl
} from "./connector.js";

console.log("Hybrid Smart Room OS V2 - Driver Status Fix Loaded (Phase 2 & 3)");

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
   MAP FIREBASE STATE (DISELARASKAN DENGAN JSON FIREBASE V3)
========================= */

function mapFirebaseState(state) {
  // Mengekstrak node utama sesuai hierarki objek Firebase Anda
  const ac = state.ac || {};
  const lamp = state.lamp || {};
  const tv = state.tv || {};
  const cctv = state.cctv || {};
  const climate = state.climate || {};
  const energy = state.energy || {};
  const speaker = state.speaker || {};
  const nest = state.nest || {};
  
  // Mengakses nested state dari smartplug: state.smartplug.state
  const smartplugRoot = state.smartplug || {};
  const smartplugState = smartplugRoot.state || {};

  return {
    climate: {
      temp: climate.temperature ?? "--",
      humidity: climate.humidity ?? "--",
    },
    smartplug: {
      // Mengambil dari state.smartplug.state.watt dan voltage
      power: smartplugState.watt ?? "--",
      voltage: smartplugState.voltage ?? "--",
    },
    ac: {
      power: ac.power ?? false,
      temp: ac.temp ?? 24,
    },
    lamp: {
      power: lamp.power ?? false,
      brightness: lamp.brightness ?? 0,
    },
    tv: {
      // Fallback jika TV belum didefinisikan secara eksplisit di JSON state Anda
      power: tv.power ?? false,
    },
    cctv: {
      online: cctv.online ?? false,
      motion: cctv.motion === true ? "Motion Detected" : "No Motion",
      recording: cctv.recording === true ? "Recording" : "Standby",
      lastMotion: cctv.last_motion ?? "--",
    },
    speaker: {
      // Menyatukan data Nest dan Speaker untuk indikator ikon online
      power: (speaker.online || nest.online) ?? false
    },
    therm: {
      // Ikon ke-6 bisa difallback atau dialokasikan untuk status sinkronisasi sistem
      power: (state.system?.status === "CONNECTED") ?? false
    },
    energy: {
      today: energy.today_kwh ?? 0,
      monthCost: state.stats?.month_cost ?? 0, // Mengambil data biaya dari node stats
    }
  };
}

/* =========================
   RENDER DASHBOARD (SINKRONISASI UTUH)
========================= */

function renderDashboard(data) {
  // --- Smart Room Overview Utama ---
  setText("txtMainTemp", data.climate.temp);
  setText("txtMainHumid", data.climate.humidity + "%");
  
  // Menampilkan Watt di Mini Power Overview
  setText("txtMiniPower", data.smartplug.power + " W");
  setText("txtMiniCost", data.energy.monthCost.toLocaleString("id-ID"));

  // --- Kalkulasi Status Perangkat ---
  const acOn = isOn(data.ac.power);
  const lampOn = isOn(data.lamp.power);
  const tvOn = isOn(data.tv.power);
  const cctvOn = isOn(data.cctv.online);
  const speakerOn = isOn(data.speaker.power);
  const thermOn = isOn(data.therm.power);

  // --- Update Jumlah Device Online ---
  let onlineCount = 0;
  if (acOn) onlineCount++;
  if (lampOn) onlineCount++;
  if (tvOn) onlineCount++;
  if (cctvOn) onlineCount++;
  if (speakerOn) onlineCount++;
  if (thermOn) onlineCount++;
  setText("lblDeviceOnlineCount", `${onlineCount} Device Online`);

  // --- LOGIKA FILTER IKON MINI (ONLINE ONLY & TETAP BERWARNA) ---
  toggleMiniIcon("minIconAC", acOn);
  toggleMiniIcon("minIconLamp", lampOn);
  toggleMiniIcon("minIconTV", tvOn);
  toggleMiniIcon("minIconCCTV", cctvOn);
  toggleMiniIcon("minIconSpeaker", speakerOn);
  toggleMiniIcon("minIconTherm", thermOn);

  // --- Summary Quick Access Device Status ---
  setText("statSummaryAC", acOn ? "ON" : "OFF");
  applyActiveOvState("#btnSummaryAC", acOn);
  
  setText("statSummaryLamp", lampOn ? "ON" : "OFF");
  applyActiveOvState("#btnSummaryLamp", lampOn);
  
  setText("statSummaryTV", tvOn ? "ON" : "OFF");
  applyActiveOvState("#btnSummaryTV", tvOn);
  
  setText("statSummaryCCTV", cctvOn ? "ONLINE" : "OFFLINE");
  applyActiveOvState("#btnSummaryCCTV", cctvOn);

  // --- AC Control Card ---
  applyDeviceActiveState("#cardACControl", data.ac.power);
  setText("txtACTemp", data.ac.temp);
  setText("btnToggleAC", acOn ? "ON" : "OFF");
  syncAcSlider(data.ac.power, data.ac.temp);

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
  setText("txtEnergyTotalCost", data.energy.monthCost.toLocaleString("id-ID"));
}

/* =========================
   VISUAL STATE HELPERS 
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

function toggleMiniIcon(id, isOnline) {
  const element = document.getElementById(id);
  if (element) {
    element.style.display = isOnline ? "inline-flex" : "none";
  }
}

function applyActiveOvState(cardSelector, isDeviceActive) {
  const card = document.querySelector(cardSelector);
  if (!card) return;
  card.classList.toggle("active", isDeviceActive);
  
  if (isDeviceActive) {
    card.style.opacity = "1";
    card.style.background = ""; 
  } else {
    card.style.opacity = "0.6";
    card.style.background = "#f1f5f9"; 
  }
}

function applyDeviceActiveState(cardSelector, statusValue) {
  const card = document.querySelector(cardSelector);
  if (!card) return;
  
  const active = isOn(statusValue);
  card.classList.toggle("active", active);
  
  if (active) {
    card.style.opacity = "1";
    card.style.filter = "none";
  } else {
    card.style.opacity = "0.75";
    card.style.filter = "grayscale(20%)";
  }
  
  const badge = card.querySelector(".badge-status-on");
  if (badge) {
    badge.style.background = active ? "#22c55e" : "#64748b";
    badge.style.color = "#ffffff";
  }
}

/* =========================
   SLIDER SYNC
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

function syncAcSlider(power, temp) {
  const trackFilled = document.getElementById("acTrackFilled");
  const thumb = document.getElementById("acThumbSlider");
  if (!trackFilled || !thumb) return;

  if (isOn(power)) {
    const minTemp = 16;
    const maxTemp = 30;
    const currentTemp = parseInt(temp) || 24;
    const safeTemp = Math.max(minTemp, Math.min(maxTemp, currentTemp));
    
    const percentage = ((safeTemp - minTemp) / (maxTemp - minTemp)) * 100;
    
    trackFilled.style.width = percentage + "%";
    thumb.style.left = percentage + "%";
  } else {
    trackFilled.style.width = "0%";
    thumb.style.left = "0%";
  }
}

/* =========================
   CONTROL BINDINGS
========================= */

function bindControls() {
  const acBadge = document.getElementById("btnToggleAC");
  if (acBadge) {
    acBadge.addEventListener("click", () => {
      const card = document.getElementById("cardACControl");
      const active = card && card.classList.contains("active");
      sendCustomAcControl(active ? "ac_off" : "ac_on");
    });
  }

  const sendTempControl = (nextTemp) => {
    const safeTemp = Math.max(16, Math.min(30, nextTemp));
    sendCustomAcControl("cool_" + safeTemp + "_auto");
  };

  document.getElementById("btnTempUp")?.addEventListener("click", () => {
    const currentTemp = parseInt(document.getElementById("txtACTemp").textContent) || 24;
    sendTempControl(currentTemp + 1);
  });

  document.getElementById("btnTempDown")?.addEventListener("click", () => {
    const currentTemp = parseInt(document.getElementById("txtACTemp").textContent) || 24;
    sendTempControl(currentTemp - 1);
  });

  const lampBadge = document.getElementById("btnToggleLamp");
  if (lampBadge) {
    lampBadge.addEventListener("click", () => {
      const card = document.getElementById("cardLampControl");
      const active = card && card.classList.contains("active");
      sendGeneralControl(active ? "lamp_off" : "lamp_on");
    });
  }

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
      sendGeneralControl("lamp_brightness", lampSlider.value);
    });
  }
}

/* =========================
   CONTROL SENDERS
========================= */

async function sendCustomAcControl(command) {
  try {
    showToast("Mengirim perintah AC...");
    await sendAcControl(command);
    showToast("Perintah AC terkirim");
  } catch (error) {
    console.error("AC control error:", error);
    showToast("Gagal kirim perintah AC");
  }
}

async function sendGeneralControl(action, value = "") {
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
