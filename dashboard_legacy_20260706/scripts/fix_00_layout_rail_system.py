from pathlib import Path
import re

p = Path("style.css")
s = p.read_text()

rail_css = """
/* =========================
   00_LAYOUT_RAIL_SYSTEM
========================= */

:root {
  --page-max: 31rem;
  --page-x: clamp(1rem, 6vw, 1.45rem);
  --section-gap: clamp(1rem, 4.2vw, 1.55rem);
  --grid-gap: clamp(0.8rem, 3.4vw, 1.15rem);
}

body {
  display: block;
}

.app,
.dashboard,
.main,
main {
  width: min(100%, var(--page-max));
  margin-inline: auto;
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
  width: calc(100% - (var(--page-x) * 2));
  margin-left: var(--page-x);
  margin-right: var(--page-x);
  box-sizing: border-box;
}

.header {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.top-tabs {
  margin-top: clamp(1.1rem, 4.8vw, 1.65rem);
}

.summary-card,
.target-device-grid,
.entertainment-section,
.climate-power-card,
.cctv-card,
.energy-card,
.scene-card,
.last-scene-card {
  margin-top: var(--section-gap);
}

.target-device-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--grid-gap);
}

.ac-card,
.lamp-card {
  aspect-ratio: 1 / 1;
  width: 100%;
  min-width: 0;
}

@media (max-width: 360px) {
  :root {
    --page-x: clamp(0.85rem, 5vw, 1rem);
    --grid-gap: clamp(0.65rem, 3vw, 0.9rem);
  }
}
"""

s = re.sub(
    r"/\* =========================\n   00_LAYOUT_RAIL_SYSTEM[\s\S]*?(?=/\* =========================|\Z)",
    "",
    s
)

s = s.rstrip() + "\n\n" + rail_css.strip() + "\n"
p.write_text(s)

print("00_LAYOUT_RAIL_SYSTEM DONE")
