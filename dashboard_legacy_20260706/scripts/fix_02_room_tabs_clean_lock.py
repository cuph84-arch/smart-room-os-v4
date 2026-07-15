from pathlib import Path
import re

p = Path("style.css")
s = p.read_text()

# Hapus semua rule CSS yang selector-nya mengandung .top-tabs
s = re.sub(r'[^{}]*\.top-tabs[^{}]*\{[^{}]*\}', '', s, flags=re.S)

fix = """
/* =========================
   02_ROOM_TABS_CLEAN_LOCK
   Single source of truth
========================= */

.top-tabs {
  width: calc(100vw - (var(--rail-x) * 2)) !important;
  margin-left: var(--rail-x) !important;
  margin-right: var(--rail-x) !important;
  margin-top: clamp(1.15rem, 4.6vw, 1.55rem) !important;

  padding: 0 !important;
  box-sizing: border-box !important;

  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: clamp(0.75rem, 3.4vw, 1.05rem) !important;

  overflow-x: auto !important;
  overflow-y: hidden !important;
  white-space: nowrap !important;
  scroll-padding-left: 0 !important;
  scrollbar-width: none !important;
  -webkit-overflow-scrolling: touch !important;

  transform: none !important;
}

.top-tabs::-webkit-scrollbar {
  display: none !important;
}

.top-tabs button {
  flex: 0 0 auto !important;
  margin: 0 !important;

  height: clamp(2.65rem, 10.8vw, 3.05rem) !important;
  min-width: max-content !important;
  padding-inline: clamp(1rem, 4.4vw, 1.35rem) !important;

  border: 0 !important;
  border-radius: 999px !important;
  background: transparent !important;

  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: clamp(0.45rem, 2vw, 0.65rem) !important;

  color: rgba(255, 255, 255, 0.72) !important;
  font-size: clamp(0.9rem, 3.8vw, 1.08rem) !important;
  font-weight: 700 !important;
  line-height: 1 !important;
  white-space: nowrap !important;

  transform: none !important;
}

.top-tabs button:first-child {
  margin-left: 0 !important;
}

.top-tabs button.active {
  background: rgba(255, 255, 255, 0.18) !important;
  color: rgba(255, 255, 255, 0.96) !important;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.10),
    0 0.8rem 1.8rem rgba(0, 0, 0, 0.16) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
}

.top-tabs .tab-icon {
  width: 1.05em !important;
  height: 1.05em !important;
  flex: 0 0 1.05em !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  opacity: 0.86 !important;
}
"""

s = s.rstrip() + "\n\n" + fix.strip() + "\n"
p.write_text(s)

print("02_ROOM_TABS_CLEAN_LOCK DONE")
