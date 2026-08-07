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

// PERBAIKAN: Fungsi ini sekarang mandiri dan mengarahkan perintah ke jalurnya sendiri
export async function sendControlRequest(action, value = "") {
  const command = value ? `${action}:${value}` : action;
  const requestId = `dashboard-gen-${Date.now()}`;
  
  // Logika routing sederhana: jika ada kata "lamp", kirim ke database lampu
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
