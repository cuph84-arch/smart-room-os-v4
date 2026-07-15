from pathlib import Path
import re

p = Path("style.css")
s = p.read_text()

# Hapus patch tabs/header child lama jika pernah ada
s = re.sub(
    r"/\* =========================\n   02_ROOM_TABS_HEADER_CHILD_FIX[\s\S]*?(?=/\* =========================|\Z)",
    "",
    s
)

fix = """
/* =========================
   02_ROOM_TABS_HEADER_CHILD_FIX
   Fact: .top-tabs is inside .header
========================= */

/* header = master rail */
.header {
  width: calc(100vw - (var(--rail-x) * 2)) !important;
  margin-left: var(--rail-x) !important;
  margin-right: var(--rail-x) !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  box-sizing: border-box !important;
}

/* header content uses header rail */
.header-top {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}

/* tabs are child of header, so no second rail margin */
.header .top-tabs {
  width: 100% !important;
  max-width: 100% !important;

  margin-left: 0 !important;
  margin-right: 0 !important;

  padding-left: 0 !important;
  padding-right: 0 !important;

  box-sizing: border-box !important;
  transform: none !important;

  display: flex !important;
  justify-content: flex-start !important;
  align-items: center !important;

  overflow-x: auto !important;
  overflow-y: hidden !important;
  white-space: nowrap !important;
  scrollbar-width: none !important;
  -webkit-overflow-scrolling: touch !important;
}

.header .top-tabs::-webkit-scrollbar {
  display: none !important;
}

.header .top-tabs button {
  flex: 0 0 auto !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.header .top-tabs button:first-child {
  margin-left: 0 !important;
}
"""

s = s.rstrip() + "\n\n" + fix.strip() + "\n"
p.write_text(s)

print("02_ROOM_TABS_HEADER_CHILD_FIX DONE")
