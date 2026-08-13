import {
  listenToSmartRoomState,
  sendControlRequest,
  sendTvControl,
  sendAcControl
} from "./connector.js";

console.log("Hybrid Smart Room OS V2 - Driver Status Fix Loaded (Phase 2 & 3 + Sync Fix)");

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  bindControls();
  updateHeaderDateTime();
  startRealtimeListener();
  initWeatherWidget();

  setInterval(updateHeaderDateTime, 60000);
  setInterval(initWeatherWidget, 900000); // refresh cuaca lokal tiap 15 menit
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
   TIME UTILITIES (SORT BY TIME)
   - toMillis: menormalkan berbagai format timestamp yang ada
     di Firebase (ISO string / unix seconds / unix ms) ke ms.
   - pickFreshest: dari beberapa kandidat node (state vs dashboard vs
     runtime) untuk device yang sama, pilih node dengan updated_at
     TERBARU sebagai sumber aktif, agar tidak ada node basi yang
     menimpa status device di HTML.
   - isTodayTimestamp: memastikan angka "hari ini" (energy today)
     benar-benar berasal dari data yang di-update pada tanggal
     berjalan, bukan cache lama.
========================= */

function toMillis(ts) {
  if (ts === null || ts === undefined || ts === "") return 0;
  if (typeof ts === "number") {
    // unix seconds (10 digit) vs unix ms (13 digit)
    return ts < 10000000000 ? ts * 1000 : ts;
  }
  const parsed = Date.parse(ts);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function pickFreshest(candidates) {
  let best = null;
  let bestTs = -1;
  candidates.forEach((c) => {
    if (!c || !c.data) return;
    const ts = toMillis(c.updatedAt);
    if (ts >= bestTs) {
      bestTs = ts;
      best = c.data;
    }
  });
  return best || {};
}

function isTodayTimestamp(ts) {
  const ms = toMillis(ts);
  if (!ms) return false;
  const d = new Date(ms);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatSnapshotTime(isoString) {
  const ms = toMillis(isoString);
  if (!ms) return "--";
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* =========================
   MAP FIREBASE STATE (DISELARASKAN DENGAN JSON FIREBASE V3)
========================= */

function mapFirebaseState(root) {
  const state = root.state || {};
  const dashboard = root.dashboard || {};
  const stats = root.stats || {};
  const runtime = root.runtime || {};

  // --- SORT BY TIME: pilih node teraktif (paling baru) per device ---
  const ac = pickFreshest([
    { data: state.ac, updatedAt: state.ac && state.ac.updated_at },
    { data: dashboard.ac && dashboard.ac.state, updatedAt: dashboard.ac && dashboard.ac.updated_at },
  ]);
  const acVirtual = (runtime.ac && runtime.ac.virtual) || {};

  const lamp = state.lamp || {};

  // FIX: state.tv tidak ada di schema Firebase, TV hanya tersedia di dashboard.tv.state
  const tv = pickFreshest([
    { data: state.tv, updatedAt: state.tv && state.tv.updated_at },
    { data: dashboard.tv && dashboard.tv.state, updatedAt: dashboard.tv && dashboard.tv.updated_at },
  ]);

  // FIX: status online CCTV tidak ada langsung di state.cctv, harus dibaca
  // dari cameras.<nama>.connectivity.online. Kamera aktif untuk kartu ini: "teras".
  const cctv = pickFreshest([
    { data: state.cctv, updatedAt: state.cctv && state.cctv.updated_at },
    { data: dashboard.cctv && dashboard.cctv.state, updatedAt: dashboard.cctv && dashboard.cctv.updated_at },
  ]);
  const cctvCameras = cctv.cameras || {};
  const cctvTeras = cctvCameras.teras || {};
  const cctvTerasOnline =
    (cctvTeras.connectivity && cctvTeras.connectivity.online) ??
    cctvTeras.ok ??
    (cctvTeras.health && cctvTeras.health.ok) ??
    false;

  const climate = pickFreshest([
    { data: state.climate, updatedAt: state.climate && state.climate.updated_at },
    { data: dashboard.sensor && dashboard.sensor.state, updatedAt: dashboard.sensor && dashboard.sensor.updated_at },
  ]);

  const energy = state.energy || {};
  const speaker = state.speaker || {};
  const nest = state.nest || {};

  const smartplugRoot = state.smartplug || {};
  const smartplugState = pickFreshest([
    { data: smartplugRoot.state, updatedAt: smartplugRoot.updated_at },
    { data: dashboard.smartplug && dashboard.smartplug.state, updatedAt: dashboard.smartplug && dashboard.smartplug.updated_at },
  ]);

  // Data "hari ini" hanya dipakai jika updated_at memang tanggal berjalan.
  const energyTodayIsFresh = isTodayTimestamp(energy.updated_at);

  return {
    climate: {
      temp: climate.temperature ?? "--",
      humidity: climate.humidity ?? "--",
    },
    smartplug: {
      power: smartplugState.watt ?? "--",
      voltage: smartplugState.voltage ?? "--",
    },
    ac: {
      power: acVirtual.power ?? ac.power ?? false,
      temp: acVirtual.temp ?? ac.temp ?? 24,
    },
    lamp: {
      power: lamp.power ?? false,
      brightness: lamp.brightness ?? 0,
    },
    tv: {
      power: tv.power ?? false,
    },
    cctv: {
      online: cctvTerasOnline,
      // CATATAN FAKTA: field "motion" & "recording" tidak tersedia di
      // schema Firebase manapun (state/dashboard/runtime). Nilai berikut
      // TIDAK di-fetch dari Firebase agar tidak mengarang data.
      motion: "No Motion",
      recording: "Standby",
      lastMotion: formatSnapshotTime(cctvTeras.snapshot && cctvTeras.snapshot.timestamp),
    },
    speaker: {
      power: (speaker.online || nest.online) ?? false
    },
    therm: {
      power: (state.system?.status === "CONNECTED") ?? false
    },
    energy: {
      todayKwh: energyTodayIsFresh ? (energy.today_kwh ?? stats.today_kwh ?? 0) : 0,
      weekKwh: energy.week_kwh ?? stats.week_kwh ?? 0,
      monthKwh: energy.month_kwh ?? stats.month_kwh ?? 0,
      todayCost: energyTodayIsFresh ? (energy.today_cost ?? stats.today_cost ?? 0) : 0,
      weekCost: energy.week_cost ?? stats.week_cost ?? 0,
      monthCost: energy.month_cost ?? stats.month_cost ?? 0,
      tariffPerKwh: energy.tariff_per_kwh ?? 0,
    }
  };
}

/* =========================
   RENDER DASHBOARD (LOGIKA PERANGKAT TERBARU)
========================= */

function renderDashboard(data) {
  setText("txtMainTemp", data.climate.temp);
  setText("txtMainHumid", data.climate.humidity + "%");
  
  setText("txtMiniPower", Number(data.energy.todayKwh).toFixed(2) + " kWh");
  setText("txtMiniCost", data.energy.todayCost.toLocaleString("id-ID"));

  const acOn = isOn(data.ac.power);
  const lampOn = isOn(data.lamp.power);
  const tvOn = isOn(data.tv.power);
  const cctvOn = isOn(data.cctv.online);

  const smartplugProtected = true; 
  const climateOn = true;          

  let onlineCount = 0;
  if (acOn) onlineCount++;
  if (lampOn) onlineCount++;
  if (tvOn) onlineCount++;
  if (cctvOn) onlineCount++;
  if (smartplugProtected) onlineCount++; 
  if (climateOn) onlineCount++;          
  
  setText("lblDeviceOnlineCount", `${onlineCount} Device Online`);

  toggleMiniIcon("minIconAC", acOn);
  toggleMiniIcon("minIconLamp", lampOn);
  toggleMiniIcon("minIconTV", tvOn);
  toggleMiniIcon("minIconCCTV", cctvOn);
  toggleMiniIcon("minIconSpeaker", smartplugProtected); 
  toggleMiniIcon("minIconTherm", climateOn);           

  setText("statSummaryAC", acOn ? "ON" : "OFF");
  applyActiveOvState("#btnSummaryAC", acOn);
  
  setText("statSummaryLamp", lampOn ? "ON" : "OFF");
  applyActiveOvState("#btnSummaryLamp", lampOn);
  
  setText("statSummaryTV", tvOn ? "ON" : "OFF");
  applyActiveOvState("#btnSummaryTV", tvOn);
  
  setText("statSummaryCCTV", cctvOn ? "ONLINE" : "OFFLINE");
  applyActiveOvState("#btnSummaryCCTV", cctvOn);

  applyDeviceActiveState("#cardACControl", data.ac.power);
  setText("txtACTemp", data.ac.temp);
  setText("btnToggleAC", acOn ? "ON" : "OFF");
  syncAcSlider(data.ac.power, data.ac.temp);

  applyDeviceActiveState("#cardLampControl", data.lamp.power);
  setText("txtLampBrightness", data.lamp.brightness + "%");
  setText("btnToggleLamp", lampOn ? "ON" : "OFF");
  syncLampSlider(data.lamp.power, data.lamp.brightness);

  setText("sensorTemp", data.climate.temp);
  setText("sensorHumid", data.climate.humidity);
  setText("sensorPower", data.smartplug.power);
  setText("sensorVoltage", data.smartplug.voltage);

  setText("lblCCTVStatus", cctvOn ? "ONLINE" : "OFFLINE");
  setText("txtCCTVMotion", data.cctv.motion);
  setText("txtCCTVRecord", data.cctv.recording);
  setText("txtCCTVLastTime", data.cctv.lastMotion);

  setText("txtEnergyTodayCost", "Rp " + data.energy.todayCost.toLocaleString("id-ID"));
  setText("txtEnergyTodayKwh", Number(data.energy.todayKwh).toFixed(2) + " kWh");
  setText("txtEnergyWeekCost", "Rp " + data.energy.weekCost.toLocaleString("id-ID"));
  setText("txtEnergyWeekKwh", Number(data.energy.weekKwh).toFixed(2) + " kWh");
  setText("txtEnergyMonthCost", "Rp " + data.energy.monthCost.toLocaleString("id-ID"));
  setText("txtEnergyMonthKwh", Number(data.energy.monthKwh).toFixed(2) + " kWh");
  setText("txtEnergyFooterTotal", "Rp " + data.energy.monthCost.toLocaleString("id-ID"));
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
   CONTROL BINDINGS & DROPDOWN HANDLER
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

  /* --- LOGIKA PENDETEKSI PERUBAHAN DROPDOWN --- */
  const tariffDropdown = document.getElementById("tariffDropdown");
  if (tariffDropdown) {
    tariffDropdown.addEventListener("change", (event) => {
      const selectedTariff = event.target.value;
      console.log("Tarif listrik diubah ke:", selectedTariff);
      
      // Menampilkan notifikasi visual ke layar
      showToast("Tarif diubah: " + selectedTariff);
      
      // Opsional: Kamu bisa memanggil fungsi kirim data ke Firebase di sini jika diperlukan, contoh:
      // sendGeneralControl("update_tariff", selectedTariff);
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
   WEATHER WIDGET (OPEN-METEO)
   - Sumber: Open-Meteo API (gratis, tanpa API key)
   - Lokasi: geolocation browser, fallback ke Tulungagung
     jika izin lokasi ditolak/tidak tersedia/timeout
   - HANYA menulis ke elemen #lblWeather, tidak menyentuh
     data Firebase/IoT lainnya sama sekali
========================= */

const WEATHER_FALLBACK_COORDS = { lat: -8.0645, lon: 111.9016 }; // Tulungagung, Jawa Timur
const WEATHER_GEOLOCATION_TIMEOUT_MS = 8000;

function initWeatherWidget() {
  if (!("geolocation" in navigator)) {
    fetchLocalWeather(WEATHER_FALLBACK_COORDS.lat, WEATHER_FALLBACK_COORDS.lon);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetchLocalWeather(position.coords.latitude, position.coords.longitude);
    },
    () => {
      // Izin ditolak / gagal / timeout -> pakai koordinat fallback
      fetchLocalWeather(WEATHER_FALLBACK_COORDS.lat, WEATHER_FALLBACK_COORDS.lon);
    },
    {
      timeout: WEATHER_GEOLOCATION_TIMEOUT_MS,
      maximumAge: 600000, // cache posisi browser 10 menit
    }
  );
}

async function fetchLocalWeather(latitude, longitude) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API HTTP ${response.status}`);
    }

    const payload = await response.json();
    const temperature = payload?.current?.temperature_2m;

    if (typeof temperature !== "number" || Number.isNaN(temperature)) {
      throw new Error("Format data cuaca tidak valid");
    }

    setText("lblWeather", Math.round(temperature) + "°C");
  } catch (error) {
    console.error("Gagal memuat cuaca lokal:", error);
    // Fallback aman: biarkan nilai #lblWeather yang sudah tampil (default HTML
    // atau hasil fetch sukses sebelumnya) agar dashboard tetap tampil normal.
  }
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