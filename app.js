import {
  listenToSmartRoomState,
  sendControlRequest,
  sendTvControl,
  sendAcControl
} from "./connector.js";

console.log("Smart Room OS V3 - Canonical State Refactor Loaded");

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
   MAP FIREBASE STATE (DISELARASKAN DENGAN CANONICAL STATE)
========================= */

function mapFirebaseState(root) {
  const state = root.state || {};
  const runtime = root.runtime || {};
  // [FIX] node `stats` sudah TERBUKTI MISSING di skema aktual -> tidak lagi
  // dibaca sama sekali (dulu dipakai sebagai fallback energy).

  const ac = state.ac || {};
  const acVirtual = (runtime.ac && runtime.ac.virtual) || {};
  const lamp = state.lamp || {};
  const tv = state.tv || {};
  const cctv = state.cctv || {};
  const climate = state.climate || {};
  const energy = state.energy || {};
  const speaker = state.speaker || {};
  const nest = state.nest || {};

  const smartplugRoot = state.smartplug || {};
  const smartplugState = smartplugRoot.state || {};

  // [FIX] CCTV CRITICAL — hapus total field legacy single-camera
  // (state.cctv.online / motion / recording / last_motion). Diganti dengan
  // iterasi struktur multi-camera aktual: state.cctv.cameras.{garasi,kamar,teras,...}
  const camerasRaw = cctv.cameras || {};
  const camerasList = Object.keys(camerasRaw).map((camId) => {
    const cam = camerasRaw[camId] || {};
    return {
      id: camId,
      online: cam.online ?? false,
      rtsp: cam.RTSP ?? cam.rtsp ?? "--",
      port: cam.port ?? "--",
      // [NOTE] snapshot.path saat ini adalah path filesystem lokal (bukan
      // URL browser-accessible). Belum bisa dirender sebagai <img src>
      // sampai integrasi Firebase Storage selesai di sisi backend.
      path: cam.path ?? "--",
      snapshot: cam.snapshot ?? null,
      error: cam.error ?? null,
    };
  });
  const cameraCount = cctv.camera_count ?? camerasList.length;
  const onlineCameraCount = camerasList.filter((cam) => isOn(cam.online)).length;
  const errorCameraCount = camerasList.filter((cam) => !!cam.error).length;

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
      // [FIX] optional chaining aman: coba nesting baru state.tv.state.power
      // dulu, fallback ke state.tv.power lama, agar tidak error jika salah
      // satu level nesting tidak ada.
      power: tv?.state?.power ?? tv?.power ?? false,
    },
    cctv: {
      // [FIX] struktur baru multi-camera, tidak lagi single online/motion/recording
      cameras: camerasList,
      cameraCount,
      onlineCameraCount,
      errorCameraCount,
    },
    speaker: {
      // [FIX] optional chaining aman untuk speaker & nest; nest.online bisa
      // berupa string seperti "standby" (bukan boolean) -> dikonversi lewat
      // isOn() saat render, bukan di sini, supaya nilai mentah tetap terjaga.
      power: state.speaker?.online ?? state.nest?.online ?? false,
    },
    therm: {
      // [FIX] node state.system terindikasi MISSING pada sebagian snapshot;
      // optional chaining mencegah error, hasil default aman ke false.
      power: state.system?.status === "CONNECTED",
    },
    energy: {
      // [FIX] fallback ke `stats` DIHAPUS total (node stats terbukti missing).
      // Sekarang murni membaca dari state.energy.
      todayKwh: energy.today_kwh ?? 0,
      weekKwh: energy.week_kwh ?? 0,
      monthKwh: energy.month_kwh ?? 0,
      todayCost: energy.today_cost ?? 0,
      weekCost: energy.week_cost ?? 0,
      monthCost: energy.month_cost ?? 0,
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
  // [FIX] cctvOn sekarang dihitung dari agregat kamera online, bukan dari
  // field legacy state.cctv.online yang sudah tidak dipakai lagi.
  const cctvOn = data.cctv.onlineCameraCount > 0;
  const speakerOn = isOn(data.speaker.power);
  const thermOn = isOn(data.therm.power);

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
  // [FIX] mini icon speaker/therm sekarang mengikuti state Firebase aktual
  // (speakerOn / thermOn), sebelumnya hard-coded ke smartplugProtected/climateOn.
  toggleMiniIcon("minIconSpeaker", speakerOn);
  toggleMiniIcon("minIconTherm", thermOn);

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

  // [FIX] Panel detail CCTV dirombak total: tidak lagi menampilkan
  // motion/recording/last_motion (field tidak ada di skema), diganti dengan
  // ringkasan agregat multi-camera yang datanya benar-benar ada di Firebase.
  setText("lblCCTVStatus", `${data.cctv.onlineCameraCount}/${data.cctv.cameraCount} ONLINE`);
  setText("txtCCTVMotion", `${data.cctv.onlineCameraCount}/${data.cctv.cameraCount} Kamera Online`);
  setText("txtCCTVRecord", data.cctv.errorCameraCount > 0 ? `${data.cctv.errorCameraCount} Error` : "OK");
  // [NOTE] Tidak ada field timestamp pengganti last_motion di skema baru,
  // jadi tampilkan "--" (bukan fabrikasi) sesuai aturan: jangan membuat data fiktif.
  setText("txtCCTVLastTime", "--");

  // [FIX] Render kartu per-kamera secara dinamis (garasi, kamar, teras, dst).
  // Fungsi ini no-op aman jika container #cctvCameraList belum ada di HTML.
  renderCCTVCameras(data.cctv.cameras);

  setText("txtEnergyTodayCost", "Rp " + data.energy.todayCost.toLocaleString("id-ID"));
  setText("txtEnergyTodayKwh", Number(data.energy.todayKwh).toFixed(2) + " kWh");
  setText("txtEnergyWeekCost", "Rp " + data.energy.weekCost.toLocaleString("id-ID"));
  setText("txtEnergyWeekKwh", Number(data.energy.weekKwh).toFixed(2) + " kWh");
  setText("txtEnergyMonthCost", "Rp " + data.energy.monthCost.toLocaleString("id-ID"));
  setText("txtEnergyMonthKwh", Number(data.energy.monthKwh).toFixed(2) + " kWh");
  setText("txtEnergyFooterTotal", "Rp " + data.energy.monthCost.toLocaleString("id-ID"));
}

/* =========================
   CCTV MULTI-CAMERA RENDERER
========================= */

// [FIX] Baru — merender setiap kamera dari state.cctv.cameras.{id}.
// Menggunakan hanya field yang benar-benar ada: online, RTSP, port, path,
// snapshot, error. Tidak ada field yang difabrikasi.
function renderCCTVCameras(cameras) {
  const container = document.getElementById("cctvCameraList");
  if (!container) return; // container opsional, aman jika belum ada di HTML

  container.innerHTML = "";

  if (!cameras.length) {
    container.innerHTML = `<div class="cctv-camera-empty">Tidak ada kamera terdaftar</div>`;
    return;
  }

  cameras.forEach((cam) => {
    const online = isOn(cam.online);
    const card = document.createElement("div");
    card.className = "cctv-camera-card" + (online ? " online" : " offline");

    card.innerHTML = `
      <div class="cctv-camera-name">${escapeHtml(cam.id)}</div>
      <div class="cctv-camera-status">${online ? "ONLINE" : "OFFLINE"}</div>
      <div class="cctv-camera-meta">${escapeHtml(String(cam.rtsp))}:${escapeHtml(String(cam.port))}</div>
      ${cam.error ? `<div class="cctv-camera-error">${escapeHtml(String(cam.error))}</div>` : ""}
    `;
    container.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
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

      showToast("Tarif diubah: " + selectedTariff);

      // Opsional: bisa memanggil fungsi kirim data ke Firebase di sini jika diperlukan, contoh:
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