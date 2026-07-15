from pathlib import Path
import re

css = Path("style.css")
s = css.read_text()

tabs_css = """
/* =========================
   02_ROOM_TABS MODULE
========================= */

.top-tabs {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 26px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 0 8px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.top-tabs::-webkit-scrollbar {
  display: none;
}

.top-tabs button {
  flex: 0 0 auto;
  height: 42px;
  min-width: max-content;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.62);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
}

.top-tabs button.active {
  background: rgba(255, 255, 255, 0.20);
  color: rgba(255, 255, 255, 0.96);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.10),
    0 10px 28px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.tab-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  flex: 0 0 18px;
  opacity: 0.9;
}

.tab-icon::before {
  display: block;
  font-size: 17px;
  line-height: 18px;
}

.tab-home::before {
  content: "⌂";
}

.tab-room::before {
  content: "▭";
}

.tab-living::before {
  content: "▱";
}

.tab-terrace::before {
  content: "◌";
}

.tab-garage::before {
  content: "▣";
}
"""

# hapus module 02 lama kalau ada
s = re.sub(
    r"/\* =========================\n   02_ROOM_TABS MODULE\n========================= \*/.*?(?=/\* =========================|\Z)",
    "",
    s,
    flags=re.S
)

s = s.rstrip() + "\n\n" + tabs_css.strip() + "\n"
css.write_text(s)

print("02_ROOM_TABS FIX DONE")
