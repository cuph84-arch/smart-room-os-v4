from pathlib import Path
import re

html = Path("index.html")
css = Path("style.css")
js = Path("app.js")

index = html.read_text()
style = css.read_text()
app = js.read_text()

# =========================
# 01_HEADER HTML CONTRACT
# =========================

header_pattern = re.compile(
    r"<header class=\"header\">.*?</header>",
    re.S
)

new_header = """<header class="header">
      <div class="header-top">
        <div class="header-text">
          <h1>Welcome Home</h1>
          <div id="lastUpdated">--</div>
        </div>

        <button class="notification-btn" aria-label="Notification" type="button">
          <span aria-hidden="true">🔔</span>
        </button>
      </div>

      <nav class="top-tabs">
        <button class="active" type="button">
          <span class="tab-icon tab-home" aria-hidden="true"></span>
          <span>Home</span>
        </button>

        <button type="button">
          <span class="tab-icon tab-room" aria-hidden="true"></span>
          <span>Kamar</span>
        </button>

        <button type="button">
          <span class="tab-icon tab-living" aria-hidden="true"></span>
          <span>Ruang Tamu</span>
        </button>

        <button type="button">
          <span class="tab-icon tab-terrace" aria-hidden="true"></span>
          <span>Teras</span>
        </button>

        <button type="button">
          <span class="tab-icon tab-garage" aria-hidden="true"></span>
          <span>Garasi</span>
        </button>
      </nav>
    </header>"""

if header_pattern.search(index):
    index = header_pattern.sub(new_header, index, count=1)
else:
    raise SystemExit("ERROR: header block not found")

# =========================
# 01_HEADER CSS CONTRACT
# =========================

header_css = """
/* =========================
   01_HEADER MODULE
========================= */

.header {
  padding: calc(env(safe-area-inset-top) + 18px) 18px 10px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.header-text h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: rgba(255, 255, 255, 0.96);
}

#lastUpdated {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
}

.notification-btn {
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  display: grid;
  place-items: center;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
"""

style = re.sub(
    r"/\* =========================\n   01_HEADER MODULE\n========================= \*/.*?(?=/\* =========================|\Z)",
    "",
    style,
    flags=re.S
)

style = style.rstrip() + "\n\n" + header_css.strip() + "\n"

# =========================
# 01_HEADER JS CONTRACT
# =========================

if "updateHeaderDateTime();" not in app:
    app = app.replace(
        "bindControls();",
        "bindControls();\n  updateHeaderDateTime();",
        1
    )

if "setInterval(updateHeaderDateTime, 60000);" not in app:
    app = app.replace(
        "startRealtimeListener();",
        "startRealtimeListener();\n\n  setInterval(updateHeaderDateTime, 60000);",
        1
    )

html.write_text(index)
css.write_text(style)
js.write_text(app)

print("01_HEADER FIX DONE")
print("- index.html header normalized")
print("- style.css 01_HEADER module appended")
print("- app.js header datetime guard checked")
