#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_final_ui_balance_$(date +%Y%m%d_%H%M%S).css"

cp "$CSS" "$BACKUP"

python - <<'PY'
from pathlib import Path
import re

p = Path("style.css")
css = p.read_text()

def replace_block(css, selector, body):
    pattern = re.escape(selector).replace("\\,", ",").replace("\\ ", " ")
    return re.sub(rf"{pattern}\s*\{{[\s\S]*?\n\}}", selector + " {\n" + body.strip() + "\n}", css)

css = replace_block(css, ".top-tabs button", """
  flex: 0 0 auto;
  min-height: clamp(2.15rem, 9.2vw, 2.4rem);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 clamp(0.75rem, 3.8vw, 1rem);
  border-radius: 999rem;
  color: rgba(255, 255, 255, 0.62);
  font-size: clamp(0.63rem, 2.8vw, 0.72rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.12);
  border: 0.05em solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 0.05em 0 rgba(255, 255, 255, 0.05);
""")

css = replace_block(css, ".top-tabs button.active", """
  color: rgba(255, 255, 255, 1);
  font-weight: 700;
  background: rgba(255, 255, 255, 0.18);
  border: 0.06em solid rgba(255, 255, 255, 0.45);
  box-shadow: inset 0 0.05em 0 rgba(255, 255, 255, 0.22), 0 0.5rem 1.1rem rgba(0, 0, 0, 0.10);
  backdrop-filter: blur(1.2vh) saturate(140%);
  -webkit-backdrop-filter: blur(1.2vh) saturate(140%);
""")

css = replace_block(css, ".top-tabs button.active .tab-icon", """
  opacity: 1;
""")

css = replace_block(css, ".summary-energy span", """
  color: rgba(255, 216, 77, 0.78);
  font-size: 0.62rem;
  font-weight: 650;
""")

css = replace_block(css, ".summary-energy strong", """
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.62rem;
  font-weight: 650;
  text-align: right;
""")

css = replace_block(css, ".target-sub-info", """
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.44rem;
  overflow: hidden;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.70);
  font-size: clamp(0.58rem, 2.6vw, 0.68rem);
  line-height: 1.15;
  font-weight: 500;
  opacity: 1;
  text-shadow: 0 0.18rem 0.56rem rgba(0, 0, 0, 0.18);
""")

css = re.sub(
r"\.tv-info p,\n\.tv-info small,\n\.tv-info span,\n\.nest-info p,\n\.nest-info small,\n\.nest-info span\s*\{[\s\S]*?\n\}",
""".tv-info p,
.tv-info small,
.tv-info span,
.nest-info p,
.nest-info small,
.nest-info span {
  color: rgba(255, 255, 255, 0.68);
  font-size: clamp(0.5rem, 2.3vw, 0.6rem);
  line-height: 1.22;
  font-weight: 480;
  letter-spacing: -0.015em;
  text-align: left;
}""",
css
)

css = re.sub(
r"\.energy-row span\s*\{[\s\S]*?\n\}",
""".energy-row span {
  color: rgba(255, 255, 255, 0.70);
  font-size: 0.68rem;
  font-weight: 520;
  letter-spacing: -0.02em;
}""",
css
)

css = re.sub(
r"\.energy-tariff-compact\s*\{[\s\S]*?\n\}",
""".energy-tariff-compact {
  display: block;
  margin-top: 0.38rem;
  color: rgba(255, 255, 255, 0.64);
  font-size: 0.52rem;
  font-weight: 450;
  letter-spacing: -0.01em;
}""",
css
)

css = re.sub(
r"\.scene-row small\s*\{[\s\S]*?\n\}",
""".scene-row small {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.53rem;
  font-weight: 600;
  font-style: italic;
}""",
css
)

css = re.sub(
r"\.bottom-nav button,\n\.nav-bar button\s*\{[\s\S]*?\n\}",
""".bottom-nav button,
.nav-bar button {
  min-height: 2.75rem;
  border-radius: 1.12rem;
  color: rgba(255, 255, 255, 0.55);
  background: transparent;
  font-size: 1.28rem;
  font-weight: 500;
  line-height: 1;
  opacity: 0.58;
}""",
css
)

css = re.sub(
r"\.bottom-nav button\.active,\n\.nav-bar button\.active\s*\{[\s\S]*?\n\}",
""".bottom-nav button.active,
.nav-bar button.active {
  color: rgba(255, 255, 255, 1);
  font-weight: 760;
  opacity: 1;
  filter: drop-shadow(0 0 0.45rem rgba(255, 255, 255, 0.28));
}""",
css
)

nav_icon_block = """
.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.32em;
  line-height: 1;
}
"""

if ".nav-icon {" not in css:
    css = css.replace(".nav-label {\n  display: none;\n}", ".nav-label {\n  display: none;\n}\n\n" + nav_icon_block.strip())
else:
    css = re.sub(r"\.nav-icon\s*\{[\s\S]*?\n\}", nav_icon_block.strip(), css)

p.write_text(css)
PY

echo "DONE: Final UI balance SSOT applied."
echo "Backup: $BACKUP"

pkill -f "python -m http.server 8081" 2>/dev/null || true
python -m http.server 8081 --bind 0.0.0.0
