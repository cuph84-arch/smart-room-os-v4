import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  update,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
  databaseURL:
    "https://smart-room-os-v3-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

// [AUDIT-OK] Root listener dipertahankan di ref(database, "/").
// Frontend HANYA membaca UI rendering state dari root.state & root.runtime
// (dilakukan di app.js -> mapFirebaseState). Node ini TIDAK diarahkan ke
// /dashboard atau /dynamic_v2/control karena keduanya adalah node
// command/control, bukan node state untuk rendering UI.
const ROOT_REF = ref(database, "/");

export function listenToSmartRoomState(callback) {
  return onValue(
    ROOT_REF,
    (snapshot) => {
      callback(snapshot.val());
    },
    (error) => {
      console.error("Firebase state listener error:", error);
    }
  );
}

// [AUDIT-OK] Write-only command channel. Ini BUKAN read-listener UI,
// jadi tetap diperbolehkan menulis ke dynamic_v2/control/ac sesuai kontrak
// (larangan hanya berlaku untuk read-listener UI, bukan write command).
export async function sendAcControl(command) {
  const requestId = `dashboard-${Date.now()}`;

  await update(ref(database, "dynamic_v2/control/ac"), {
    request_id: requestId,
    action: command,
    command: command,
    status: "pending",
    source: "dashboard",
    created_at: new Date().toISOString(),
  });
}

export async function sendTvControl(command) {
  const requestId = `dashboard-tv-${Date.now()}`;

  await update(ref(database, "dynamic_v2/control/tv"), {
    request_id: requestId,
    device: "tv",
    action: command,
    command: command,
    status: "pending",
    source: "dashboard",
    created_at: new Date().toISOString(),
  });
}

// Fungsi generik untuk command lain (lamp, general, dll). Routing berdasarkan
// nama action ke node dynamic_v2/control/{device} — tetap write-only, sesuai kontrak.
export async function sendControlRequest(action, value = "") {
  const command = value ? `${action}:${value}` : action;
  const requestId = `dashboard-gen-${Date.now()}`;

  let targetDevice = "general";
  if (action.includes("lamp")) {
    targetDevice = "lamp";
  }

  await update(ref(database, `dynamic_v2/control/${targetDevice}`), {
    request_id: requestId,
    device: targetDevice,
    action: action,
    command: command,
    status: "pending",
    source: "dashboard",
    created_at: new Date().toISOString(),
  });
}