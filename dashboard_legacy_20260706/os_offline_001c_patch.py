from pathlib import Path

p = Path("app.js")
s = p.read_text()

old = """async function start() {
    const firebaseStarted = startFirebaseDashboardStatusListener();

    if (!firebaseStarted) {
      const local = await fetchLocalDashboardStatus();
      if (local.success) {
        applyContract(local.payload);
      }
    }
  }"""

new = """async function start() {

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
  }"""

if old not in s:
    print("ERROR: start() function not found.")
    raise SystemExit(1)

p.write_text(s.replace(old, new, 1))
print("OS-OFFLINE-001C PATCH SUCCESS")
