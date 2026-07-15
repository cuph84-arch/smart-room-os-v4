from pathlib import Path
import re

p = Path("style.css")
s = p.read_text()

s = re.sub(
    r"/\* =========================\n   12_BOTTOM_SCROLL_STOP_FIX[\s\S]*?(?=/\* =========================|\Z)",
    "",
    s
)

fix = """
/* =========================
   12_BOTTOM_SCROLL_STOP_FIX
   Remove double bottom buffer
========================= */

/* body tidak boleh menambah area scroll besar */
body {
  padding-bottom: 0 !important;
}

/* buffer cukup untuk konten terakhir berhenti di atas fixed navbar */
.dashboard {
  padding-bottom: calc(var(--nav-height) + var(--nav-safe-bottom) + var(--vr-card-stack)) !important;
}

/* main juga jangan menambah extra scroll area */
main,
.app,
.phone-container {
  padding-bottom: 0 !important;
}
"""

s = s.rstrip() + "\\n\\n" + fix.strip() + "\\n"
p.write_text(s)

print("12_BOTTOM_SCROLL_STOP_FIX DONE")
