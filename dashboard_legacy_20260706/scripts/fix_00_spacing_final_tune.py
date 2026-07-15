from pathlib import Path
import re

p = Path("style.css")
s = p.read_text()

s = re.sub(
    r"/\* =========================\n   00_SPACING_FINAL_TUNE[\s\S]*?(?=/\* =========================|\Z)",
    "",
    s
)

fix = """
/* =========================
   00_SPACING_FINAL_TUNE
   Final spacing tuning before lock
========================= */

:root {
  /* base gap antar parent card */
  --vr-card-stack: clamp(0.32rem, 0.9vh, 0.52rem);

  /* top page ke Welcome: dibuat setara visual tinggi pill */
  --vr-page-top: clamp(1.55rem, 5.8vw, 2.15rem);

  /* Welcome/date ke pill */
  --vr-header-tabs: clamp(0.48rem, 1.25vh, 0.72rem);

  /* Pill ke Summary = 2x gap Summary ke AC/Lamp */
  --vr-tabs-summary: calc(var(--vr-card-stack) * 2);

  /* grid dua kolom compact */
  --vr-grid-gap: clamp(0.38rem, 1.65vw, 0.62rem);

  /* isi card compact */
  --vr-inner-gap: clamp(0.3rem, 1.2vw, 0.48rem);

  /* padding card tetap lebih besar dari inner gap */
  --vr-card-pad: clamp(0.68rem, 2.85vw, 0.95rem);
}

/* top page */
.header {
  padding-top: var(--vr-page-top) !important;
}

/* header ke pill */
.header .top-tabs {
  margin-top: var(--vr-header-tabs) !important;
}

/* dashboard tidak pakai gap lama */
.dashboard {
  gap: 0 !important;
}

/* reset outer margin lama */
.dashboard > .summary-card,
.dashboard > .target-device-grid,
.dashboard > .entertainment-card,
.dashboard > .climate-power-card,
.dashboard > .split-grid,
.dashboard > .scene-card {
  margin-top: 0 !important;
}

/* pill ke summary = 2x */
.dashboard > .summary-card:first-child {
  margin-top: var(--vr-tabs-summary) !important;
}

/* summary ke AC/Lamp dan seterusnya = 1x */
.dashboard > .summary-card + .target-device-grid,
.dashboard > .target-device-grid + .entertainment-card,
.dashboard > .entertainment-card + .climate-power-card,
.dashboard > .climate-power-card + .split-grid,
.dashboard > .split-grid + .scene-card {
  margin-top: var(--vr-card-stack) !important;
}

/* horizontal grid compact */
.target-device-grid,
.entertainment-grid,
.split-grid {
  gap: var(--vr-grid-gap) !important;
}

/* parent card padding compact */
.summary-card,
.entertainment-card,
.climate-power-card,
.scene-card,
.split-grid .cctv-card,
.split-grid .energy-card,
.ac-card,
.lamp-card,
.mini-device {
  padding: var(--vr-card-pad) !important;
}

/* inner spacing */
.summary-grid,
.metrics-grid,
.climate-grid,
.energy-compact,
.security-layout,
.security-info,
.ac-card,
.lamp-card,
.mini-device {
  gap: var(--vr-inner-gap) !important;
}
"""

s = s.rstrip() + "\n\n" + fix.strip() + "\n"
p.write_text(s)

print("00_SPACING_FINAL_TUNE DONE")
