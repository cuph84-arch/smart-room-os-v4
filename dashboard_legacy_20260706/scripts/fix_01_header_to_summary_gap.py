from pathlib import Path
import re

p = Path("style.css")
s = p.read_text()

s = re.sub(
    r"/\* =========================\n   01_HEADER_TO_SUMMARY_GAP_FIX[\s\S]*?(?=/\* =========================|\Z)",
    "",
    s
)

fix = """
/* =========================
   01_HEADER_TO_SUMMARY_GAP_FIX
   Source facts:
   - .top-tabs is inside .header
   - .summary-card is first child of .dashboard
   - summary margin is active, but visual gap is also affected by header bottom flow
========================= */

:root {
  /* gap dasar summary → AC/Lamp */
  --vr-card-stack: clamp(0.32rem, 0.9vh, 0.52rem);

  /* pill → summary = 2x card-stack */
  --vr-tabs-summary: calc(var(--vr-card-stack) * 2);
}

/* header jangan menyisakan padding/margin bawah tersembunyi */
.header {
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}

/* tabs menjadi elemen terakhir header tanpa extra bottom */
.header .top-tabs {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

/* dashboard mulai tepat setelah header; summary sendiri yang memberi gap */
.dashboard {
  padding-top: 0 !important;
  margin-top: 0 !important;
  gap: 0 !important;
}

/* reset semua margin awal dashboard */
.dashboard > .summary-card,
.dashboard > .target-device-grid,
.dashboard > .entertainment-card,
.dashboard > .climate-power-card,
.dashboard > .split-grid,
.dashboard > .scene-card {
  margin-top: 0 !important;
}

/* satu-satunya jarak pill → summary */
.dashboard > .summary-card:first-child {
  margin-top: var(--vr-tabs-summary) !important;
}

/* jarak summary → AC/Lamp dan parent berikutnya */
.dashboard > .summary-card + .target-device-grid,
.dashboard > .target-device-grid + .entertainment-card,
.dashboard > .entertainment-card + .climate-power-card,
.dashboard > .climate-power-card + .split-grid,
.dashboard > .split-grid + .scene-card {
  margin-top: var(--vr-card-stack) !important;
}
"""

s = s.rstrip() + "\n\n" + fix.strip() + "\n"
p.write_text(s)

print("01_HEADER_TO_SUMMARY_GAP_FIX DONE")
