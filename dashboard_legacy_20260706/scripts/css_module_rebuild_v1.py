from pathlib import Path
import re

style = Path("style.css")
index = Path("index.html")
mods = Path("css_modules")
mods.mkdir(exist_ok=True)

css = style.read_text()
html = index.read_text()

root_marker = "/* =========================\n   ROOT_LAYOUT_LOCK_001"
root_pos = css.find(root_marker)

if root_pos == -1:
    raise SystemExit("ERROR: ROOT_LAYOUT_LOCK_001 not found")

legacy = css[:root_pos].rstrip()

# legacy tetap dipakai sebagai safety, final module akan override setelahnya
(mods / "98_legacy_core.css").write_text(legacy + "\n")

modules = {
"00_variables.css": r"""
:root {
  --rail-x: clamp(1rem, 5.2vw, 1.35rem);
  --stack-gap: clamp(0.32rem, 0.9vh, 0.52rem);
  --grid-gap-final: clamp(0.38rem, 1.65vw, 0.62rem);
  --card-pad-final: clamp(0.68rem, 2.85vw, 0.95rem);

  --nav-height: clamp(4.1rem, 10.8vh, 5rem);
  --nav-safe-bottom: max(0.7rem, env(safe-area-inset-bottom));
}
""",

"01_root.css": r"""
html,
body {
  width: 100%;
  height: 100dvh;
  min-height: 100dvh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 8%, rgba(255, 55, 85, 0.36), transparent 32%),
    radial-gradient(circle at 86% 12%, rgba(0, 230, 118, 0.22), transparent 34%),
    radial-gradient(circle at 50% 78%, rgba(0, 118, 255, 0.28), transparent 42%),
    linear-gradient(180deg, #06101b 0%, #07121f 52%, #050913 100%);
}

main,
.app {
  width: 100vw;
  height: 100dvh;
  min-height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.dashboard {
  flex: 1 1 auto;
  min-height: 0;
  height: auto;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: calc(var(--nav-height) + var(--nav-safe-bottom) + var(--stack-gap));
  background: transparent;
}
""",

"02_header.css": r"""
.header {
  flex: 0 0 auto;
  width: calc(100vw - (var(--rail-x) * 2));
  margin-left: var(--rail-x);
  margin-right: var(--rail-x);
  padding-left: 0;
  padding-right: 0;
  padding-top: clamp(1.55rem, 5.8vw, 2.15rem);
  padding-bottom: 0;
  box-sizing: border-box;
}
""",

"03_tabs.css": r"""
.header .top-tabs {
  width: 100%;
  margin-left: 0;
  margin-right: 0;
  margin-top: clamp(0.48rem, 1.25vh, 0.72rem);
  margin-bottom: 0;
  padding: 0;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  scrollbar-width: none;
}

.header .top-tabs::-webkit-scrollbar {
  display: none;
}
""",

"04_parent_geometry.css": r"""
.summary-card,
.target-device-grid,
.entertainment-card,
.climate-power-card,
.split-grid,
.scene-card {
  width: calc(100vw - (var(--rail-x) * 2));
  margin-left: var(--rail-x);
  margin-right: var(--rail-x);
  box-sizing: border-box;
}

.dashboard > .summary-card {
  margin-top: calc(var(--stack-gap) * 2);
}

.dashboard > .summary-card + .target-device-grid,
.dashboard > .target-device-grid + .entertainment-card,
.dashboard > .entertainment-card + .climate-power-card,
.dashboard > .climate-power-card + .split-grid,
.dashboard > .split-grid + .scene-card {
  margin-top: var(--stack-gap);
}

.summary-card,
.entertainment-card,
.climate-power-card,
.scene-card,
.ac-card,
.lamp-card,
.mini-device,
.split-grid .cctv-card,
.split-grid .energy-card {
  padding: var(--card-pad-final);
}
""",

"05_grid_system.css": r"""
.target-device-grid,
.entertainment-grid,
.split-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--grid-gap-final);
}

.ac-card,
.lamp-card,
.mini-device {
  aspect-ratio: 1 / 1;
}

.split-grid {
  align-items: stretch;
}

.split-grid .cctv-card,
.split-grid .energy-card {
  height: 100%;
  margin: 0;
}
""",

"11_bottom_nav.css": r"""
.bottom-nav,
.nav-bar {
  position: fixed;
  z-index: 80;
  left: var(--rail-x);
  right: var(--rail-x);
  bottom: var(--nav-safe-bottom);
  width: auto;
  height: var(--nav-height);
  min-height: var(--nav-height);
  margin: 0;
  padding: clamp(0.35rem, 1.35vh, 0.55rem) clamp(0.42rem, 1.8vw, 0.7rem);
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0,1fr) minmax(0,1fr) minmax(3.05rem,0.74fr) minmax(0,1fr) minmax(0,1fr);
  align-items: center;
  justify-items: center;
  column-gap: clamp(0.1rem, 0.7vw, 0.28rem);
  overflow: visible;
  transform: none;
  border-radius: clamp(1.25rem, 5vw, 1.9rem);
}

.bottom-nav button,
.nav-bar button {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.58rem, 2.45vw, 0.76rem);
  line-height: 1.05;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.nav-label {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.center-action {
  width: clamp(3.05rem, 12.4vw, 3.75rem) !important;
  height: clamp(3.05rem, 12.4vw, 3.75rem) !important;
  min-width: clamp(3.05rem, 12.4vw, 3.75rem) !important;
  min-height: clamp(3.05rem, 12.4vw, 3.75rem) !important;
  border-radius: 50% !important;
  transform: translateY(-20%) !important;
}
""",

"99_utilities.css": r"""
* {
  box-sizing: border-box;
}
"""
}

for name, content in modules.items():
    (mods / name).write_text(content.strip() + "\n")

imports = [
"98_legacy_core.css",
"00_variables.css",
"01_root.css",
"02_header.css",
"03_tabs.css",
"04_parent_geometry.css",
"05_grid_system.css",
"11_bottom_nav.css",
"99_utilities.css",
]

Path("style.modular.css").write_text(
    "/* STYLE MODULAR V1 */\n" +
    "\n".join([f'@import url("./css_modules/{x}");' for x in imports]) +
    "\n"
)

# switch index to modular css
html2 = re.sub(r'href=["\']style\.css["\']', 'href="style.modular.css"', html)
index.write_text(html2)

print("CSS_MODULE_REBUILD_V1 DONE")
print("- Generated css_modules/")
print("- Generated style.modular.css")
print("- index.html switched to style.modular.css")
