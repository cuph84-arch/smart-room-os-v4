from pathlib import Path
import re

p = Path("style.css")
s = p.read_text()

s = re.sub(
    r"/\* =========================\n   BATCH2_CARD_GEOMETRY_CLEANUP[\s\S]*?(?=/\* =========================|\Z)",
    "",
    s
)

fix = r"""
/* =========================
   BATCH2_CARD_GEOMETRY_CLEANUP
   Single geometry owner for parent cards
   Goal:
   - restore collapsed Summary / Entertainment / Climate
   - keep Root Layout Lock active
   - do NOT touch JS bindings
========================= */

:root {
  --card-rail-x: var(--rail-x);
  --card-stack-y: var(--stack-gap);
  --card-gap-x: var(--grid-gap-final);
  --card-pad-y: clamp(0.9rem, 3.6vw, 1.2rem);
  --card-pad-x: clamp(0.9rem, 3.8vw, 1.25rem);
  --card-radius-final: clamp(1.35rem, 5.8vw, 2rem);
}

/* Universal parent card rail */
.summary-card,
.target-device-grid,
.entertainment-card,
.climate-power-card,
.split-grid,
.scene-card {
  width: calc(100vw - (var(--card-rail-x) * 2)) !important;
  margin-left: var(--card-rail-x) !important;
  margin-right: var(--card-rail-x) !important;
  box-sizing: border-box !important;
}

/* Restore parent card body */
.summary-card,
.entertainment-card,
.climate-power-card,
.scene-card,
.split-grid .cctv-card,
.split-grid .energy-card {
  padding: var(--card-pad-y) var(--card-pad-x) !important;
  border-radius: var(--card-radius-final) !important;
  min-height: auto !important;
  height: auto !important;
  overflow: hidden !important;
}

/* Summary: force full internal layout visible */
.summary-card {
  display: block !important;
}

.summary-card .section-head,
.entertainment-card .section-head,
.climate-power-card .section-head {
  margin: 0 0 clamp(0.65rem, 2.4vw, 0.9rem) 0 !important;
}

.summary-grid {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: clamp(0.5rem, 2vw, 0.75rem) !important;
  width: 100% !important;
}

.summary-item {
  aspect-ratio: 1 / 1 !important;
  min-height: 0 !important;
}

/* Summary energy row */
.summary-energy {
  margin-top: clamp(0.6rem, 2.4vw, 0.9rem) !important;
}

/* Hero device grid */
.target-device-grid {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: var(--card-gap-x) !important;
}

.ac-card,
.lamp-card {
  aspect-ratio: 1 / 1 !important;
  width: 100% !important;
  min-width: 0 !important;
}

/* Entertainment: restore TV/Nest grid */
.entertainment-card {
  display: block !important;
}

.entertainment-grid {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: var(--card-gap-x) !important;
  width: 100% !important;
}

.mini-device {
  aspect-ratio: 1 / 1 !important;
  min-width: 0 !important;
  height: auto !important;
}

/* Climate: restore metric grid */
.climate-power-card {
  display: block !important;
}

.metric-grid,
.metrics-grid,
.climate-grid {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: clamp(0.45rem, 1.8vw, 0.7rem) !important;
  width: 100% !important;
}

.metric-item,
.climate-item {
  aspect-ratio: 1 / 1.25 !important;
  min-height: 0 !important;
}

/* CCTV + Energy equal columns */
.split-grid {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: var(--card-gap-x) !important;
  align-items: stretch !important;
}

.split-grid .cctv-card,
.split-grid .energy-card {
  width: 100% !important;
  min-width: 0 !important;
  height: 100% !important;
  margin: 0 !important;
  display: flex !important;
  flex-direction: column !important;
}

/* Scene compact */
.scene-card {
  min-height: clamp(4.6rem, 14vh, 6.4rem) !important;
}
"""

s = s.rstrip() + "\n\n" + fix.strip() + "\n"
p.write_text(s)

print("BATCH2_CARD_GEOMETRY_CLEANUP DONE")
