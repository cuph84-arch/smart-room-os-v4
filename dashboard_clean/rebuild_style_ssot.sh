#!/data/data/com.termux/files/usr/bin/bash
set -e

BACKUP="style.before_rebuild_ssot_$(date +%Y%m%d_%H%M%S).css"
[ -f style.css ] && cp style.css "$BACKUP"

cat > style.css <<'EOF'
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap");

/* =========================
   ROOT
========================= */

:root {
  --theme-bg-portrait: linear-gradient(90deg, #FDBB2D 0%, #22C1C3 100%);
  --theme-bg-landscape: linear-gradient(180deg, #FDBB2D 0%, #22C1C3 100%);

  --font-main: "Poppins", "Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

  --text-main: #ffffff;
  --text-soft: rgba(255, 255, 255, 0.86);
  --text-muted: rgba(255, 255, 255, 0.66);
  --text-faint: rgba(255, 255, 255, 0.46);

  --green: #00e676;
  --cyan: #00e5ff;
  --blue: #168cff;
  --yellow: #ffd54a;
  --orange: #ffb74d;
  --purple: #8c63ff;
  --red: #ff4d57;

  --glass-bg: rgba(0, 0, 0, 0.30);
  --glass-bg-deep: rgba(0, 0, 0, 0.42);
  --glass-bg-soft: rgba(0, 0, 0, 0.12);

  --radius-xl: 1.6rem;
  --radius-lg: 1.25rem;
  --radius-md: 1rem;
  --radius-pill: 999rem;

  --gap-main: 1rem;
  --pad-page-x: clamp(1.25rem, 5vw, 2rem);
  --blur-main: 1.25vh;
}

/* =========================
   GLOBAL LAYOUT
========================= */

*,
*::before,
*::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html {
  min-height: 100%;
  background-color: #0b1016;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100dvh;
  color: var(--text-main);
  font-family: var(--font-main);
  background-color: #0b1016;
  overscroll-behavior-y: none;
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
}

body,
button,
input {
  font: inherit;
}

button {
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
}

h1,
h2,
h3,
p {
  margin: 0;
}

input {
  color: inherit;
}

.logic-hidden,
.hidden-energy-cost,
.nav-label {
  position: absolute;
  width: 0.0625rem;
  height: 0.0625rem;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.app,
.phone-container {
  position: relative;
  isolation: isolate;
  width: 100%;
  max-width: 26.875rem;
  min-height: 100dvh;
  margin: 0 auto;
  padding:
    max(1.75rem, env(safe-area-inset-top))
    var(--pad-page-x)
    max(6.5rem, env(safe-area-inset-bottom));
  overflow-x: hidden;
  background: transparent;
}

.app::before,
.phone-container::before {
  content: "";
  position: fixed;
  inset: -15vh 0;
  z-index: -2;
  pointer-events: none;
  background: var(--theme-bg-portrait);
  background-size: cover;
  background-position: center;
}

.app::after,
.phone-container::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.18);
}

.dashboard {
  display: grid;
  gap: var(--gap-main);
}

/* =========================
   HEADER + TOP TABS
========================= */

.header {
  display: grid;
  gap: 1.2rem;
  margin-bottom: 1.1rem;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-text h1 {
  font-size: clamp(2.2rem, 10vw, 3rem);
  line-height: 0.95;
  font-weight: 800;
  letter-spacing: -0.07em;
}

#lastUpdated {
  margin-top: 0.45rem;
  color: var(--text-soft);
  font-size: 0.8rem;
  font-weight: 600;
}

.notification-btn {
  width: 3.25rem;
  aspect-ratio: 1;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.20);
  backdrop-filter: blur(1vh) saturate(130%);
  -webkit-backdrop-filter: blur(1vh) saturate(130%);
  box-shadow: 0 0.65rem 1.4rem rgba(0, 0, 0, 0.20);
}

.top-tabs {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  scrollbar-width: none;
}

.top-tabs::-webkit-scrollbar {
  display: none;
}

.top-tabs button {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 2.75rem;
  padding: 0 1.15rem;
  border-radius: var(--radius-pill);
  color: rgba(255, 255, 255, 0.62);
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 0.86rem;
  font-weight: 700;
  white-space: nowrap;
}

.top-tabs button.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.tab-icon {
  width: 1rem;
  aspect-ratio: 1;
  display: inline-block;
  opacity: 0.88;
}

.tab-home::before { content: "⌂"; }
.tab-room::before { content: "▱"; }
.tab-living::before { content: "▭"; }
.tab-terrace::before { content: "⌒"; }
.tab-garage::before { content: "▤"; }

/* =========================
   CARD SYSTEM
========================= */

.wide-card,
.card {
  position: relative;
  border-radius: var(--radius-xl);
  background: var(--glass-bg);
  border: 0;
  box-shadow: 0 1.2rem 2.8rem rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(var(--blur-main)) saturate(132%);
  -webkit-backdrop-filter: blur(var(--blur-main)) saturate(132%);
}

.wide-card {
  padding: 1.25rem;
}

.card {
  padding: 1.05rem;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.section-head h2 {
  color: var(--text-main);
  font-size: 1.1rem;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.045em;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.card-icon,
.emoji-icon,
.metric-emoji,
.mini-emoji {
  display: inline-grid;
  place-items: center;
  filter: grayscale(1) brightness(0) invert(1) opacity(0.82);
  -webkit-filter: grayscale(1) brightness(0) invert(1) opacity(0.82);
}

.badge,
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.65rem;
  height: 1.45rem;
  padding: 0 0.55rem;
  border-radius: var(--radius-pill);
  color: var(--text-soft);
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.badge.on,
.status-pill.on {
  color: var(--green);
}

.badge.off,
.status-pill.off {
  color: var(--red);
}

/* =========================
   SUMMARY
========================= */

.summary-card {
  display: grid;
  gap: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.summary-item {
  min-height: 5.2rem;
  border-radius: var(--radius-lg);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.32rem;
  background: var(--glass-bg-soft);
  border: 0;
  box-shadow: none;
}

.summary-item .emoji-icon {
  font-size: 1rem;
}

.summary-item span {
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 600;
}

.summary-item strong {
  color: var(--green);
  font-size: 0.72rem;
  font-weight: 800;
}

.summary-energy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.summary-energy span {
  color: rgba(255, 213, 74, 0.82);
  font-size: 0.76rem;
  font-weight: 800;
}

.summary-energy strong {
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 800;
  white-space: nowrap;
}

/* =========================
   HERO DEVICE CARDS
========================= */

.hero-grid,
.target-device-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.target-device-card {
  aspect-ratio: 1 / 1.05;
  display: grid;
  grid-template-rows: auto auto 1fr auto auto;
  gap: 0.45rem;
  overflow: hidden;
}

.target-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.emoji-card {
  font-size: 1rem;
}

.target-toggle {
  position: relative;
  width: 2rem;
  min-width: 2rem;
  aspect-ratio: 1;
  height: auto;
  padding: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.34);
  box-shadow: 0 0.22rem 0.55rem rgba(0, 0, 0, 0.32);
}

.target-toggle::before {
  content: "⏻";
  color: var(--red);
  font-size: 1.3rem;
  line-height: 1;
}

.target-toggle.on::before {
  color: var(--green);
}

.target-card-title {
  align-self: end;
  text-align: center;
  font-size: 1rem;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.045em;
}

.target-main-value {
  display: grid;
  place-items: center;
  text-align: center;
}

.target-main-value strong {
  font-size: clamp(1.9rem, 8vw, 2.35rem);
  line-height: 1;
  font-weight: 500;
  letter-spacing: -0.06em;
}

.target-sub-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 600;
}

.target-slider-row {
  display: grid;
  grid-template-columns: 1.4rem minmax(0, 1fr) 1.4rem;
  align-items: center;
  gap: 0.55rem;
}

.control-btn {
  width: 1.4rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  color: #ffffff;
  font-size: 1.25rem;
  line-height: 1;
}

.ac-slider,
.lamp-bar {
  position: relative;
  height: 0.25rem;
  border-radius: var(--radius-pill);
  overflow: visible;
  background: rgba(255, 255, 255, 0.16);
}

.ac-slider {
  background:
    linear-gradient(
      90deg,
      var(--cyan) 0%,
      var(--cyan) var(--ac-pos, 50%),
      rgba(255,255,255,.16) var(--ac-pos, 50%),
      rgba(255,255,255,.16) 100%
    );
}

.ac-slider::after,
.lamp-bar::after {
  content: "";
  position: absolute;
  top: 50%;
  left: var(--ac-pos, 50%);
  width: 0.75rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #ffffff;
  transform: translate(-50%, -50%);
  box-shadow: 0 0.18rem 0.55rem rgba(0, 0, 0, 0.28);
}

.lamp-bar::after {
  left: var(--lamp-pos, 1%);
}

.target-range-wrap {
  position: relative;
  display: grid;
  align-items: center;
}

.brightness-slider {
  position: absolute;
  inset: -0.7rem 0;
  width: 100%;
  opacity: 0;
}

/* =========================
   ENTERTAINMENT
========================= */

.entertainment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.mini-device {
  min-height: 10rem;
  border-radius: var(--radius-lg);
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  gap: 0.55rem;
  padding: 0.9rem;
  background: var(--glass-bg-soft);
  border: 0;
}

.mini-device-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
}

.mini-device h3 {
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: -0.045em;
}

.dynamic-icon-tv::before {
  content: "▭";
  font-size: 2.2rem;
}

.dynamic-icon-nest::before {
  content: "◎";
  font-size: 2.4rem;
}

.tv-info,
.nest-info {
  display: grid;
  gap: 0.12rem;
  color: var(--text-muted);
  font-size: 0.72rem;
  line-height: 1.2;
  font-weight: 600;
}

.tv-volume-control,
.nest-volume-control {
  display: grid;
  align-items: center;
  min-height: 0.55rem;
}

.vision-slider-range,
.nest-volume-track {
  width: 100%;
  height: 0.25rem;
  border-radius: var(--radius-pill);
  background: linear-gradient(90deg, rgba(255,255,255,.80) 0 45%, rgba(255,255,255,.18) 45% 100%);
}

.vision-slider-range {
  appearance: none;
  -webkit-appearance: none;
  outline: none;
}

.vision-slider-range::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 0;
  height: 0;
  border: 0;
}

.nest-volume-track > div {
  height: 100%;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.84);
}

/* =========================
   CLIMATE + POWER
========================= */

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.metric-item {
  min-height: 5.8rem;
  border-radius: var(--radius-lg);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.4rem;
  background: var(--glass-bg-soft);
  border: 0;
  text-align: center;
}

.metric-item strong {
  font-size: 1rem;
  line-height: 1;
  font-weight: 800;
}

.metric-item span:last-child {
  color: var(--text-faint);
  font-size: 0.58rem;
  line-height: 1;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.08em;
}

/* =========================
   CCTV + ENERGY + SCENE
========================= */

.split-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.cctv-card,
.energy-card {
  min-height: 14rem;
}

.compact-head {
  margin-bottom: 0.85rem;
}

.compact-head h2 {
  display: grid;
  gap: 0.05rem;
}

.compact-head h2 span {
  font-size: 0.9rem;
  font-weight: 600;
}

.security-info,
.energy-compact {
  display: grid;
  gap: 0.8rem;
}

.security-line,
.energy-row,
.scene-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.security-line {
  padding-bottom: 0.55rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.security-line span,
.energy-row span {
  color: var(--text-soft);
  font-size: 0.78rem;
  font-weight: 700;
}

.security-line strong,
.energy-row strong {
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 800;
}

.last-motion-split {
  display: grid;
  text-align: right;
}

.cctv-mode-pill,
.energy-total-box {
  margin-top: 0.8rem;
  min-height: 3.1rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.75rem 0.9rem;
  background: var(--glass-bg-soft);
  border: 0;
}

.cctv-mode-pill strong,
.energy-total-box span {
  color: var(--text-main);
  font-size: 0.78rem;
  font-weight: 800;
}

.cctv-mode-pill span,
.energy-tariff-compact {
  color: var(--text-muted);
  font-size: 0.64rem;
  font-weight: 600;
}

.energy-total-box {
  color: var(--green);
}

.energy-total-box span,
.energy-total-box strong {
  color: var(--green);
}

.energy-tariff-compact {
  display: block;
  margin-top: 0.65rem;
}

.scene-card .section-head {
  margin-bottom: 0.6rem;
}

.scene-action {
  min-height: 2.4rem;
  padding: 0 1.05rem;
  border-radius: var(--radius-pill);
  color: #ffffff;
  background: rgba(140, 99, 255, 0.78);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.22);
  font-size: 0.72rem;
  font-weight: 800;
}

.scene-row {
  color: var(--text-muted);
  font-size: 0.72rem;
}

/* =========================
   BOTTOM NAVBAR
========================= */

.bottom-nav,
.nav-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: max(0.62rem, env(safe-area-inset-bottom));
  z-index: 50;
  display: grid;
  grid-template-columns: 1fr 1fr 3.25rem 1fr 1fr;
  align-items: center;
  gap: 0.35rem;
  width: min(24.5rem, calc(100% - 2.35rem));
  margin: 0 auto;
  padding: 0.55rem 0.6rem 0.68rem;
  border-radius: 1.45rem;
  background: rgba(0, 0, 0, 0.48);
  background-clip: padding-box;
  -webkit-background-clip: padding-box;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(1.2vh) saturate(130%);
  -webkit-backdrop-filter: blur(1.2vh) saturate(130%);
  overflow: hidden;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  touch-action: manipulation;
}

.bottom-nav button,
.nav-bar button {
  width: 2.55rem;
  aspect-ratio: 1;
  min-height: 2.55rem;
  justify-self: center;
  display: grid;
  place-items: center;
  border-radius: var(--radius-pill);
  color: rgba(255, 255, 255, 0.36);
  background: transparent;
  box-shadow: none;
  outline: none;
}

.bottom-nav button.active,
.nav-bar button.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.nav-icon {
  font-size: 1.35rem;
  line-height: 1;
  filter: grayscale(1) brightness(0) invert(1) opacity(0.38);
  -webkit-filter: grayscale(1) brightness(0) invert(1) opacity(0.38);
}

.bottom-nav button.active .nav-icon,
.nav-bar button.active .nav-icon {
  filter: grayscale(1) brightness(0) invert(1) opacity(1);
  -webkit-filter: grayscale(1) brightness(0) invert(1) opacity(1);
}

.center-action {
  width: 2.85rem;
  aspect-ratio: 1;
  min-height: 2.85rem;
  border-radius: 50%;
  transform: translateY(-0.32rem);
  color: rgba(255,255,255,.86);
  font-size: 1.45rem;
  background: rgba(0, 0, 0, 0.24);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

/* =========================
   RESPONSIVE
========================= */

@media screen and (orientation: landscape) {
  .app::before,
  .phone-container::before {
    background: var(--theme-bg-landscape);
  }
}

@media screen and (max-width: 22rem) {
  .app,
  .phone-container {
    --pad-page-x: 1rem;
  }

  .summary-grid,
  .metric-grid {
    gap: 0.55rem;
  }

  .wide-card {
    padding: 1rem;
  }

  .target-device-card {
    padding: 0.9rem;
  }
}

@media screen and (min-width: 48rem) {
  .app,
  .phone-container {
    max-width: 46rem;
    padding-inline: 5vmin;
  }

  .dashboard {
    gap: 1.25rem;
  }
}

@media screen and (min-width: 64rem) {
  .app,
  .phone-container {
    max-width: 58rem;
  }
}
EOF

if [ ! -d "$HOME/storage/downloads" ]; then
  echo "Storage belum aktif. Jalankan: termux-setup-storage"
  exit 1
fi

cp -f style.css "$HOME/storage/downloads/style_ssot_rebuild.css"

echo "========================================="
echo "SUCCESS: style.css rebuild SSOT dibuat"
echo "========================================="
echo "Backup lama : ${BACKUP:-none}"
echo "Export     : /sdcard/Download/style_ssot_rebuild.css"
echo
cmp -s style.css "$HOME/storage/downloads/style_ssot_rebuild.css" \
  && echo "PASS: Export identik 100%." \
  || echo "FAIL: Export berbeda."
echo
sha256sum style.css "$HOME/storage/downloads/style_ssot_rebuild.css"
echo "========================================="
