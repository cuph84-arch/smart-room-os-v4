from pathlib import Path
import re

p = Path("style.css")
s = p.read_text()

s = re.sub(
    r"/\* =========================\n   12_BOTTOM_NAV_REFLOW_LOCK[\s\S]*?(?=/\* =========================|\Z)",
    "",
    s
)

fix = """
/* =========================
   12_BOTTOM_NAV_REFLOW_LOCK
   Single source of truth for Bottom Navigation
   Source facts:
   - HTML: .bottom-nav.nav-bar contains 5 buttons
   - Center + button is inside the same nav flow
   - Previous CSS used fixed center column and transform, causing Settings overflow
========================= */

:root {
  --nav-rail-x: var(--rail-x);
  --nav-height: clamp(4.1rem, 10.8vh, 5rem);
  --nav-pad-x: clamp(0.42rem, 1.8vw, 0.7rem);
  --nav-pad-y: clamp(0.35rem, 1.35vh, 0.55rem);
  --nav-gap: clamp(0.1rem, 0.7vw, 0.28rem);

  --nav-label-size: clamp(0.58rem, 2.45vw, 0.76rem);
  --nav-icon-size: clamp(1rem, 4.2vw, 1.35rem);

  --nav-fab-size: clamp(3.05rem, 12.4vw, 3.75rem);
  --nav-fab-lift: calc(var(--nav-fab-size) * -0.2);

  --nav-safe-bottom: max(0.7rem, env(safe-area-inset-bottom));
  --nav-content-buffer: calc(var(--nav-height) + var(--nav-fab-size) + var(--nav-safe-bottom));
}

/* Floating nav shell */
.bottom-nav,
.nav-bar {
  position: fixed !important;
  z-index: 80 !important;

  left: var(--nav-rail-x) !important;
  right: var(--nav-rail-x) !important;
  bottom: var(--nav-safe-bottom) !important;

  width: auto !important;
  max-width: none !important;
  height: var(--nav-height) !important;
  min-height: var(--nav-height) !important;

  margin: 0 !important;
  padding: var(--nav-pad-y) var(--nav-pad-x) !important;
  box-sizing: border-box !important;

  display: grid !important;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(0, 1fr)
    minmax(var(--nav-fab-size), 0.74fr)
    minmax(0, 1fr)
    minmax(0, 1fr) !important;

  align-items: center !important;
  justify-items: center !important;
  column-gap: var(--nav-gap) !important;

  transform: none !important;
  overflow: visible !important;

  border-radius: clamp(1.25rem, 5vw, 1.9rem) !important;
  background: rgba(10, 16, 32, 0.62) !important;
  border: 0.0625rem solid rgba(255, 255, 255, 0.09) !important;
  box-shadow:
    inset 0 0.0625rem 0 rgba(255, 255, 255, 0.08),
    0 1.15rem 2.6rem rgba(0, 0, 0, 0.34) !important;
  backdrop-filter: blur(1.25rem) saturate(160%) !important;
  -webkit-backdrop-filter: blur(1.25rem) saturate(160%) !important;
}

/* Equal-width nav items */
.bottom-nav button,
.nav-bar button {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;

  min-height: 0 !important;
  height: 100% !important;

  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;

  border: 0 !important;
  background: transparent !important;

  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;

  overflow: hidden !important;

  color: rgba(255, 255, 255, 0.72) !important;
  font-size: var(--nav-label-size) !important;
  font-weight: 650 !important;
  line-height: 1.05 !important;
  text-align: center !important;
  border-radius: clamp(0.85rem, 3.6vw, 1.25rem) !important;

  transform: none !important;
}

/* Icon + label rhythm */
.bottom-nav .nav-icon,
.nav-bar .nav-icon {
  display: block !important;
  width: var(--nav-icon-size) !important;
  height: var(--nav-icon-size) !important;
  line-height: 1 !important;
  font-size: var(--nav-icon-size) !important;
  margin: 0 0 0.16em !important;
  flex: 0 0 auto !important;
}

.bottom-nav .nav-label,
.nav-bar .nav-label {
  display: block !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;

  overflow: hidden !important;
  white-space: nowrap !important;
  text-overflow: ellipsis !important;

  font-size: var(--nav-label-size) !important;
  line-height: 1.05 !important;
}

/* Active item */
.bottom-nav button.active,
.nav-bar button.active {
  color: var(--green) !important;
  font-weight: 780 !important;
}

/* Center FAB remains in grid flow but visually floats */
.bottom-nav .center-action,
.nav-bar .center-action {
  width: var(--nav-fab-size) !important;
  height: var(--nav-fab-size) !important;
  min-width: var(--nav-fab-size) !important;
  min-height: var(--nav-fab-size) !important;
  max-width: var(--nav-fab-size) !important;
  max-height: var(--nav-fab-size) !important;

  padding: 0 !important;
  border-radius: 50% !important;

  display: grid !important;
  place-items: center !important;

  color: #fff !important;
  font-size: calc(var(--nav-fab-size) * 0.5) !important;
  font-weight: 420 !important;
  line-height: 1 !important;

  overflow: visible !important;
  transform: translateY(var(--nav-fab-lift)) !important;

  background: linear-gradient(180deg, #2f8cff, #1672ff) !important;
  border: 0.18rem solid rgba(8, 15, 31, 0.92) !important;
  box-shadow:
    0 0.8rem 1.7rem rgba(22, 114, 255, 0.38),
    0 0 0 0.0625rem rgba(255, 255, 255, 0.20) !important;
}

/* Active state without breaking layout */
.bottom-nav button:active,
.nav-bar button:active,
.bottom-nav .center-action:active,
.nav-bar .center-action:active {
  transform: scale(0.96) !important;
}

.bottom-nav .center-action:active,
.nav-bar .center-action:active {
  transform: translateY(var(--nav-fab-lift)) scale(0.96) !important;
}

/* Scroll safety: content can clear fixed navbar */
body {
  padding-bottom: var(--nav-content-buffer) !important;
}

.dashboard {
  padding-bottom: calc(var(--nav-content-buffer) * 0.45) !important;
}
"""

s = s.rstrip() + "\n\n" + fix.strip() + "\n"
p.write_text(s)

print("12_BOTTOM_NAV_REFLOW_LOCK DONE")
