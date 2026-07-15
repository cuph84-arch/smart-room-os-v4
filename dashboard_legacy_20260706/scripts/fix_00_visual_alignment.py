from pathlib import Path
import re

p = Path("style.css")
s = p.read_text()

css = """
/* =========================
   00_VISUAL_ALIGNMENT_SYSTEM
========================= */

:root {
  --page-max: 31rem;
  --page-x: clamp(1.15rem, 6.4vw, 1.65rem);
  --section-gap: clamp(1rem, 4.4vw, 1.55rem);
  --grid-gap: clamp(0.9rem, 3.6vw, 1.15rem);

  --section-pad-x: clamp(1rem, 4.6vw, 1.45rem);
  --section-pad-y: clamp(1rem, 4.8vw, 1.5rem);

  --baseline-title: clamp(1.1rem, 4.4vw, 1.35rem);
  --baseline-value: clamp(2.2rem, 9vw, 3rem);
  --baseline-status: clamp(1rem, 3.8vw, 1.25rem);
}

.header,
.top-tabs,
.summary-card,
.target-device-grid,
.entertainment-section,
.climate-power-card,
.cctv-card,
.energy-card,
.scene-card,
.last-scene-card {
  width: calc(100% - (var(--page-x) * 2)) !important;
  margin-left: var(--page-x) !important;
  margin-right: var(--page-x) !important;
  box-sizing: border-box;
}

.header {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.header-top {
  width: 100%;
}

.top-tabs {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.summary-card,
.entertainment-section,
.climate-power-card {
  padding: var(--section-pad-y) var(--section-pad-x) !important;
}

.target-device-grid {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: var(--grid-gap) !important;
}

.ac-card,
.lamp-card {
  aspect-ratio: 1 / 1 !important;
  width: 100% !important;
  min-width: 0 !important;
  display: grid !important;
  grid-template-rows:
    var(--baseline-title)
    var(--baseline-value)
    var(--baseline-status)
    1fr !important;
  align-items: center !important;
  padding: clamp(0.85rem, 4vw, 1.15rem) !important;
}

.ac-card h3,
.lamp-card h3,
.ac-card .device-title,
.lamp-card .device-title {
  align-self: start !important;
  text-align: center !important;
  margin: 0 !important;
}

.ac-card .main-value,
.lamp-card .main-value,
#acTemp,
#lampBrightness {
  align-self: center !important;
  text-align: center !important;
}

.ac-card .status-row,
.lamp-card .status-row,
.ac-card .device-meta,
.lamp-card .device-meta {
  align-self: center !important;
  text-align: center !important;
}

.ac-card .slider-row,
.lamp-card .slider-row {
  align-self: end !important;
  width: 100% !important;
}

.entertainment-section,
.climate-power-card {
  margin-top: var(--section-gap) !important;
}

.mini-device {
  aspect-ratio: 1 / 1 !important;
  min-width: 0 !important;
}

.cctv-card,
.energy-card {
  width: calc((100% - (var(--page-x) * 2) - var(--grid-gap)) / 2) !important;
  box-sizing: border-box;
}

@media (max-width: 360px) {
  :root {
    --page-x: clamp(0.95rem, 5.4vw, 1.15rem);
    --grid-gap: clamp(0.7rem, 3.2vw, 0.9rem);
  }
}
"""

s = re.sub(
    r"/\* =========================\n   00_VISUAL_ALIGNMENT_SYSTEM[\s\S]*?(?=/\* =========================|\Z)",
    "",
    s
)

s = s.rstrip() + "\n\n" + css.strip() + "\n"
p.write_text(s)

print("00_VISUAL_ALIGNMENT_SYSTEM DONE")
