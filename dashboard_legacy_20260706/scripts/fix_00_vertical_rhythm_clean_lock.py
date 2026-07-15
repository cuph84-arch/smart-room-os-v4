from pathlib import Path
import re

p = Path("style.css")
s = p.read_text()

s = re.sub(
    r"/\* =========================\n   00_VERTICAL_RHYTHM_CLEAN_LOCK[\s\S]*?(?=/\* =========================|\Z)",
    "",
    s
)

fix = """
/* =========================
   00_VERTICAL_RHYTHM_CLEAN_LOCK
   Single source of truth for dashboard spacing
   Based on source audit: multiple section-gap / margin-top systems were active
========================= */

:root {
  /* antar parent card: compact, PWA-native feel */
  --stack-gap: clamp(0.42rem, 1.25vh, 0.72rem);

  /* gap grid dua kolom: AC/Lamp, TV/Nest, CCTV/Energy */
  --grid-gap-clean: clamp(0.45rem, 2vw, 0.72rem);

  /* gap isi dalam card */
  --inner-gap-clean: clamp(0.38rem, 1.5vw, 0.62rem);

  /* padding parent tetap lebih besar dari inner gap */
  --card-pad-clean: clamp(0.82rem, 3.3vw, 1.12rem);
}

/* Matikan gap flex lama agar tidak dobel dengan margin antar section */
.dashboard {
  gap: 0 !important;
}

/* Semua outer section tidak boleh membawa margin lama */
.summary-card,
.target-device-grid,
.entertainment-card,
.climate-power-card,
.split-grid,
.scene-card {
  margin-top: 0 !important;
}

/* Satu-satunya vertical rhythm antar card di dalam dashboard */
.dashboard > .summary-card + *,
.dashboard > .target-device-grid + *,
.dashboard > .entertainment-card + *,
.dashboard > .climate-power-card + *,
.dashboard > .split-grid + *,
.dashboard > .scene-card + * {
  margin-top: var(--stack-gap) !important;
}

/* Header ke tabs: compact tapi tetap bernapas */
.header .top-tabs {
  margin-top: clamp(0.72rem, 2.1vh, 1rem) !important;
}

/* Tabs ke dashboard: jarak ditentukan oleh dashboard first child */
.dashboard > .summary-card:first-child {
  margin-top: var(--stack-gap) !important;
}

/* Grid dua kolom compact */
.target-device-grid,
.entertainment-grid,
.split-grid {
  gap: var(--grid-gap-clean) !important;
}

/* Parent card padding compact */
.summary-card,
.entertainment-card,
.climate-power-card,
.scene-card,
.split-grid .cctv-card,
.split-grid .energy-card {
  padding: var(--card-pad-clean) !important;
}

/* Inner grid compact */
.summary-grid,
.metrics-grid,
.climate-grid {
  gap: var(--inner-gap-clean) !important;
}

/* Internal rhythm card */
.energy-compact,
.security-layout,
.security-info,
.entertainment-card .mini-device,
.ac-card,
.lamp-card {
  gap: var(--inner-gap-clean) !important;
}

/* CCTV/Energy tetap balance */
.split-grid {
  align-items: stretch !important;
}

.split-grid .cctv-card,
.split-grid .energy-card {
  height: 100% !important;
  margin: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
}
"""

s = s.rstrip() + "\n\n" + fix.strip() + "\n"
p.write_text(s)

print("00_VERTICAL_RHYTHM_CLEAN_LOCK DONE")
