from pathlib import Path
import re

p = Path("style.css")
s = p.read_text()

base_css = """
/* =========================
   00_DESIGN_SYSTEM_BASE
   Smart Room OS V4 PWA UI
========================= */

:root {
  --ui-pad: clamp(1rem, 4.4vw, 1.35rem);
  --ui-gap-xs: clamp(0.35rem, 1.4vw, 0.55rem);
  --ui-gap-sm: clamp(0.55rem, 2vw, 0.85rem);
  --ui-gap-md: clamp(0.8rem, 3vw, 1.15rem);
  --ui-gap-lg: clamp(1rem, 4vw, 1.6rem);

  --text-main: rgba(255, 255, 255, 0.96);
  --text-soft: rgba(255, 255, 255, 0.72);
  --text-muted: rgba(255, 255, 255, 0.52);

  --glass-bg: rgba(255, 255, 255, 0.105);
  --glass-bg-soft: rgba(255, 255, 255, 0.075);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-blur: blur(14px);

  --radius-sm: clamp(0.9rem, 3vw, 1.2rem);
  --radius-md: clamp(1.25rem, 4.6vw, 1.8rem);
  --radius-lg: clamp(1.55rem, 6vw, 2.2rem);

  --font-xs: clamp(0.68rem, 2.5vw, 0.78rem);
  --font-sm: clamp(0.78rem, 2.9vw, 0.92rem);
  --font-md: clamp(0.92rem, 3.4vw, 1.05rem);
  --font-lg: clamp(1.08rem, 4.2vw, 1.35rem);
  --font-xl: clamp(1.75rem, 8vw, 2.6rem);

  --icon-sm: clamp(0.9rem, 3.5vw, 1.1rem);
  --icon-md: clamp(1.15rem, 4.5vw, 1.45rem);
  --icon-lg: clamp(1.8rem, 8vw, 2.8rem);
}

html {
  min-height: 100%;
  font-size: 16px;
  background:
    radial-gradient(circle at 18% 14%, rgba(255, 82, 96, 0.72), transparent 36%),
    radial-gradient(circle at 82% 18%, rgba(18, 201, 112, 0.66), transparent 40%),
    radial-gradient(circle at 78% 78%, rgba(0, 92, 150, 0.72), transparent 42%),
    linear-gradient(145deg, #161225 0%, #071f2b 55%, #061826 100%);
}

body {
  min-height: 100svh;
  color: var(--text-main);
  background: transparent !important;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
}

body::before,
body::after {
  content: none !important;
}

img,
picture {
  max-width: 100%;
}

button,
input {
  font: inherit;
}

button {
  -webkit-tap-highlight-color: transparent;
}

.app,
.dashboard,
.main,
main {
  width: min(100%, 31rem);
  margin-inline: auto;
}

.card,
.summary-card,
.device-card,
.ac-card,
.lamp-card,
.entertainment-section,
.climate-power-card,
.cctv-card,
.energy-card,
.scene-card,
.mini-device {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: 0 1.2rem 3rem rgba(0, 0, 0, 0.16);
}

h1,
h2,
h3,
.main-value,
.value {
  color: var(--text-main);
}

p,
span,
.label,
.meta,
.status,
.subtext {
  color: var(--text-soft);
}

svg,
.icon,
.tab-icon,
.device-icon {
  color: currentColor;
  fill: none;
  stroke: currentColor;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
"""

s = re.sub(
    r"/\* =========================\n   00_DESIGN_SYSTEM_BASE[\s\S]*?(?=/\* =========================|\Z)",
    "",
    s
)

s = base_css.strip() + "\n\n" + s.strip() + "\n"
p.write_text(s)

print("00_DESIGN_SYSTEM_BASE DONE")
