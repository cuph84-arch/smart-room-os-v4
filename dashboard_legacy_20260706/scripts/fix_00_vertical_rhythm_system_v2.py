from pathlib import Path
import re

p = Path("style.css")
s = p.read_text()

s = re.sub(
    r"/\* =========================\n   00_VERTICAL_RHYTHM_SYSTEM_V2[\s\S]*?(?=/\* =========================|\Z)",
    "",
    s
)

fix = """
/* =========================
   00_VERTICAL_RHYTHM_SYSTEM_V2
   One spacing system only
   Source facts:
   - .top-tabs is inside .header
   - .summary-card is first child of .dashboard
   - old spacing systems are stacked, so this block becomes the final lock
========================= */

:root {
  /* Base rhythm: compact PWA unit */
  --vr-base: clamp(0.38rem, 1.05vh, 0.62rem);

  /* Top page → Welcome: same logic as pill height scale */
  --vr-page-top: clamp(2.15rem, 8.5vw, 2.9rem);

  /* Welcome/date → room pill */
  --vr-header-tabs: calc(var(--vr-base) * 1.35);

  /* Pill → Summary = 2 × card stack rhythm */
  --vr-tabs-summary: calc(var(--vr-base) * 2);

  /* Summary → AC/Lamp and all parent card rhythm */
  --vr-card-stack: var(--vr-base);

  /* Horizontal grid gap */
  --vr-grid-gap: clamp(0.42rem, 1.85vw, 0.7rem);

  /* Inner card gap */
  --vr-inner-gap: clamp(0.35rem, 1.45vw, 0.55rem);

  /* Parent card padding: larger than inner gap */
  --vr-card-pad: clamp(0.78rem, 3.15vw, 1.05rem);
}

/* Header top lock */
.header {
  padding-top: var(--vr-page-top) !important;
}

/* Header internal rhythm */
.header .top-tabs {
  margin-top: var(--vr-header-tabs) !important;
}

/* Disable dashboard flex gap as spacing source */
.dashboard {
  gap: 0 !important;
}

/* Reset old outer margin systems */
.dashboard > .summary-card,
.dashboard > .target-device-grid,
.dashboard > .entertainment-card,
.dashboard > .climate-power-card,
.dashboard > .split-grid,
.dashboard > .scene-card {
  margin-top: 0 !important;
}

/* Pill → Summary: explicit 2x rhythm */
.dashboard > .summary-card:first-child {
  margin-top: var(--vr-tabs-summary) !important;
}

/* Parent card rhythm after Summary */
.dashboard > .summary-card + .target-device-grid,
.dashboard > .target-device-grid + .entertainment-card,
.dashboard > .entertainment-card + .climate-power-card,
.dashboard > .climate-power-card + .split-grid,
.dashboard > .split-grid + .scene-card {
  margin-top: var(--vr-card-stack) !important;
}

/* Grid rhythm */
.target-device-grid,
.entertainment-grid,
.split-grid {
  gap: var(--vr-grid-gap) !important;
}

/* Card padding rhythm */
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

/* Inner rhythm */
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

/* Preserve CCTV/Energy height balance */
.split-grid {
  align-items: stretch !important;
}

.split-grid .cctv-card,
.split-grid .energy-card {
  height: 100% !important;
  margin: 0 !important;
}
"""

s = s.rstrip() + "\n\n" + fix.strip() + "\n"
p.write_text(s)

print("00_VERTICAL_RHYTHM_SYSTEM_V2 DONE")
