from pathlib import Path

p = Path("style.css")
s = p.read_text()

start_marker = "/* =========================\n   00_VERTICAL_RHYTHM_CLEAN_LOCK"
start = s.find(start_marker)

if start == -1:
    raise SystemExit("ERROR: start patch marker not found")

before = s[:start].rstrip()
archive = s[start:].strip()

archived = before + """

/* =========================================================
   CSS_PATCH_ARCHIVE_001
   Archived temporary override patches:
   - 00_VERTICAL_RHYTHM_CLEAN_LOCK
   - 00_VERTICAL_RHYTHM_SYSTEM_V2
   - 00_SPACING_FINAL_TUNE
   - 01_HEADER_TO_SUMMARY_GAP_FIX
   - 12_BOTTOM_NAV_REFLOW_LOCK
   - 12_BOTTOM_SCROLL_STOP_FIX
   - 13_CANVAS_BACKGROUND_LOCK

   Reason:
   Cleanup patch-on-patch before final layout lock.
========================================================= */

/*
""" + archive + """
*/

"""

p.write_text(archived)

print("CSS_PATCH_ARCHIVE_001 DONE")
print("Archived from 00_VERTICAL_RHYTHM_CLEAN_LOCK to EOF")
