from pathlib import Path
import re

p = Path("style.css")
s = p.read_text()

fix = """
/* =========================
   UI_GEOMETRY_FIX_V1
   Senior PWA layout lock
   Geometry first, content later
========================= */

:root {
  --rail-x: clamp(1rem, 5.2vw, 1.35rem);
  --rail-gap: clamp(0.72rem, 3vw, 1rem);
  --section-gap-y: clamp(0.85rem, 3.6vw, 1.2rem);
  --card-radius: clamp(1.35rem, 5.8vw, 2rem);
}

/* App canvas */
html,
body {
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
}

.app,
.dashboard,
.main,
main {
  width: 100vw !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Master rail: all big blocks */
.header,
.top-tabs,
.summary-card,
.entertainment-card,
.climate-power-card,
.split-grid,
.scene-card {
  width: calc(100vw - (var(--rail-x) * 2)) !important;
  margin-left: var(--rail-x) !important;
  margin-right: var(--rail-x) !important;
  box-sizing: border-box !important;
}

/* Header */
.header {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* Room tabs: same rail, scroll content inside */
.top-tabs {
  display: flex !important;
  align-items: center !important;
  gap: clamp(0.65rem, 3vw, 1rem) !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  white-space: nowrap !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  scrollbar-width: none !important;
  -webkit-overflow-scrolling: touch !important;
}

.top-tabs::-webkit-scrollbar {
  display: none !important;
}

.top-tabs button {
  flex: 0 0 auto !important;
}

/* Large card geometry */
.summary-card,
.entertainment-card,
.climate-power-card,
.scene-card {
  border-radius: var(--card-radius) !important;
  box-sizing: border-box !important;
}

/* AC + Lamp geometry */
.target-device-grid {
  width: calc(100vw - (var(--rail-x) * 2)) !important;
  margin-left: var(--rail-x) !important;
  margin-right: var(--rail-x) !important;
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: var(--rail-gap) !important;
  box-sizing: border-box !important;
}

.ac-card,
.lamp-card {
  width: 100% !important;
  min-width: 0 !important;
  aspect-ratio: 1 / 1 !important;
  box-sizing: border-box !important;
}

/* CCTV + Energy geometry */
.split-grid {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: var(--rail-gap) !important;
}

.split-grid .cctv-card,
.split-grid .energy-card {
  width: 100% !important;
  margin: 0 !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
}

/* Bottom nav follows same rail */
.bottom-nav,
.nav-bar {
  width: calc(100vw - (var(--rail-x) * 2)) !important;
  max-width: none !important;
  left: var(--rail-x) !important;
  right: var(--rail-x) !important;
  transform: none !important;
  margin: 0 !important;
  box-sizing: border-box !important;
}

/* Vertical rhythm only */
.summary-card,
.target-device-grid,
.entertainment-card,
.climate-power-card,
.split-grid,
.scene-card {
  margin-top: var(--section-gap-y) !important;
}

/* PWA safe bottom breathing room */
body {
  padding-bottom: calc(5rem + env(safe-area-inset-bottom)) !important;
}
"""

s = re.sub(
    r"/\* =========================\n   UI_GEOMETRY_FIX_V1[\s\S]*?(?=/\* =========================|\Z)",
    "",
    s
)

s = s.rstrip() + "\n\n" + fix.strip() + "\n"
p.write_text(s)

print("UI_GEOMETRY_FIX_V1 DONE")
