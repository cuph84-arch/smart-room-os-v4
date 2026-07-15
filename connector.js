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

const STATE_REF = ref(database, "state");

export function listenToSmartRoomState(callback) {
  return onValue(
    STATE_REF,
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
export async function sendControlRequest(action, value = "") {
  const command = value ? `${action}:${value}` : action;
  return sendAcControl(command);
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
