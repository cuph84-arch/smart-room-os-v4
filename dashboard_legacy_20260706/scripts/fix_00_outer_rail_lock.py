from pathlib import Path
import re

p = Path("style.css")
s = p.read_text()

css = """
/* =========================
   00_OUTER_RAIL_LOCK
   Outer geometry only
========================= */

:root {
  --master-rail-x: clamp(1rem, 5.2vw, 1.35rem);
  --master-gap: clamp(0.72rem, 3vw, 1rem);
  --master-section-y: clamp(0.85rem, 3.6vw, 1.2rem);
}

/* master large cards */
.summary-card,
.entertainment-card,
.climate-power-card,
.scene-card {
  width: calc(100vw - (var(--master-rail-x) * 2)) !important;
  margin-left: var(--master-rail-x) !important;
  margin-right: var(--master-rail-x) !important;
  box-sizing: border-box !important;
}

/* header + room tabs ikut rail */
.header,
.top-tabs {
  width: calc(100vw - (var(--master-rail-x) * 2)) !important;
  margin-left: var(--master-rail-x) !important;
  margin-right: var(--master-rail-x) !important;
  box-sizing: border-box !important;
}

.top-tabs {
  overflow-x: auto !important;
  overflow-y: hidden !important;
  white-space: nowrap !important;
  scrollbar-width: none !important;
}

.top-tabs::-webkit-scrollbar {
  display: none !important;
}

/* AC + Lamp grid */
.target-device-grid {
  width: calc(100vw - (var(--master-rail-x) * 2)) !important;
  margin-left: var(--master-rail-x) !important;
  margin-right: var(--master-rail-x) !important;
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: var(--master-gap) !important;
  box-sizing: border-box !important;
}

.ac-card,
.lamp-card {
  width: 100% !important;
  aspect-ratio: 1 / 1 !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
}

/* CCTV + Energy pakai wrapper asli */
.split-grid {
  width: calc(100vw - (var(--master-rail-x) * 2)) !important;
  margin-left: var(--master-rail-x) !important;
  margin-right: var(--master-rail-x) !important;
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: var(--master-gap) !important;
  box-sizing: border-box !important;
}

.split-grid .cctv-card,
.split-grid .energy-card {
  width: 100% !important;
  margin: 0 !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
}

/* nav ikut rail, bukan melebar liar */
.bottom-nav,
.nav-bar {
  width: calc(100vw - (var(--master-rail-x) * 2)) !important;
  max-width: none !important;
  left: var(--master-rail-x) !important;
  right: var(--master-rail-x) !important;
  transform: none !important;
  margin: 0 !important;
  box-sizing: border-box !important;
}

/* vertical rhythm outer only */
.summary-card,
.target-device-grid,
.entertainment-card,
.climate-power-card,
.split-grid,
.scene-card {
  margin-top: var(--master-section-y) !important;
}
"""

s = re.sub(
    r"/\* =========================\n   00_OUTER_RAIL_LOCK[\s\S]*?(?=/\* =========================|\Z)",
    "",
    s
)

s = s.rstrip() + "\n\n" + css.strip() + "\n"
p.write_text(s)

print("00_OUTER_RAIL_LOCK DONE")
