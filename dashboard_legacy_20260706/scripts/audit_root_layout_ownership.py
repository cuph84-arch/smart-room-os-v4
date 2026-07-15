from pathlib import Path
import re
from datetime import datetime

BASE = Path(".")
CSS = BASE / "style.css"
HTML = BASE / "index.html"

OUT_DIR = Path("/storage/emulated/0/Download/SmartRoom-Audit/frontend")
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT = OUT_DIR / "ROOT_LAYOUT_OWNERSHIP_AUDIT.txt"

css = CSS.read_text()
html = HTML.read_text()

selectors = [
    "html",
    "body",
    "main",
    ".app",
    ".phone-container",
    ".dashboard",
    ".bottom-nav",
    ".nav-bar",
]

props = [
    "height",
    "min-height",
    "max-height",
    "overflow",
    "overflow-x",
    "overflow-y",
    "position",
    "bottom",
    "padding-bottom",
    "margin-bottom",
    "background",
    "background-color",
    "display",
    "flex",
    "flex-direction",
]

patch_markers = [
    "00_VERTICAL_RHYTHM_CLEAN_LOCK",
    "00_VERTICAL_RHYTHM_SYSTEM_V2",
    "00_SPACING_FINAL_TUNE",
    "01_HEADER_TO_SUMMARY_GAP_FIX",
    "12_BOTTOM_NAV_REFLOW_LOCK",
    "12_BOTTOM_SCROLL_STOP_FIX",
    "13_CANVAS_BACKGROUND_LOCK",
    "CSS_PATCH_ARCHIVE_001",
]

def line_no(pos):
    return css.count("\\n", 0, pos) + 1

def collect_blocks_for_selector(selector):
    results = []
    pattern = re.compile(r"(^|\\n)([^{}]*" + re.escape(selector) + r"[^{}]*)\\{([^{}]*)\\}", re.S)
    for m in pattern.finditer(css):
        sel = " ".join(m.group(2).strip().split())
        body = m.group(3)
        if selector in sel:
            results.append((line_no(m.start()), sel, body.strip()))
    return results

def extract_props(body):
    found = []
    for raw in body.split(";"):
        if ":" not in raw:
            continue
        k, v = raw.split(":", 1)
        k = k.strip()
        v = v.strip()
        if k in props or k.startswith("--"):
            found.append((k, v))
    return found

def grep_lines(pattern):
    rx = re.compile(pattern)
    out = []
    for i, line in enumerate(css.splitlines(), 1):
        if rx.search(line):
            out.append((i, line.rstrip()))
    return out

report = []
report.append("ROOT LAYOUT OWNERSHIP AUDIT")
report.append("=" * 70)
report.append(f"Timestamp: {datetime.now().isoformat(timespec='seconds')}")
report.append(f"CSS bytes: {CSS.stat().st_size}")
report.append(f"HTML bytes: {HTML.stat().st_size}")
report.append("")

report.append("DOM ROOT / END CHECK")
report.append("-" * 70)
for tag in ["<body", "<main", "class=\"app", "class=\"dashboard", "bottom-nav", "</main>", "</body>"]:
    idx = html.find(tag)
    report.append(f"{tag:20s} : {'FOUND' if idx != -1 else 'NOT FOUND'}")
report.append("")

report.append("PATCH TIMELINE")
report.append("-" * 70)
for marker in patch_markers:
    idx = css.find(marker)
    report.append(f"{marker:34s} : line {line_no(idx) if idx != -1 else 'NOT FOUND'}")
report.append("")

report.append("OWNERSHIP MAP BY SELECTOR")
report.append("=" * 70)

for selector in selectors:
    report.append("")
    report.append(f"[{selector}]")
    report.append("-" * 70)
    blocks = collect_blocks_for_selector(selector)
    if not blocks:
        report.append("NO CSS BLOCK FOUND")
        continue

    for ln, sel, body in blocks:
        relevant = extract_props(body)
        if not relevant:
            continue
        report.append(f"line {ln}: {sel}")
        for k, v in relevant:
            report.append(f"  {k}: {v}")
        report.append("")

report.append("")
report.append("CONFLICT LINES: HEIGHT / MIN-HEIGHT / VIEWPORT / OVERFLOW")
report.append("=" * 70)
for ln, line in grep_lines(r"height:|min-height:|100vh|100dvh|overflow:|overflow-y:|overflow-x:"):
    report.append(f"{ln}: {line}")

report.append("")
report.append("BOTTOM / SAFE AREA / PADDING CONFLICTS")
report.append("=" * 70)
for ln, line in grep_lines(r"padding-bottom|margin-bottom|safe-area-inset-bottom|bottom:"):
    report.append(f"{ln}: {line}")

report.append("")
report.append("BACKGROUND OWNERS")
report.append("=" * 70)
for ln, line in grep_lines(r"background:|background-color:"):
    report.append(f"{ln}: {line}")

report.append("")
report.append("IMPORTANT OVERRIDES")
report.append("=" * 70)
for ln, line in grep_lines(r"!important"):
    if any(x in line for x in ["height", "min-height", "overflow", "padding-bottom", "bottom", "background", "display", "position"]):
        report.append(f"{ln}: {line}")

report.append("")
report.append("INITIAL RECOMMENDATION")
report.append("=" * 70)
report.append("1. Tentukan satu Height Owner: html/body.")
report.append("2. Tentukan satu Scroll Owner: .dashboard atau main, bukan keduanya.")
report.append("3. Tentukan satu Background Owner: html/body atau .app, bukan card-only.")
report.append("4. Hindari patch baru sebelum ownership conflict di atas dibaca.")
report.append("5. Setelah hasil ini divalidasi, buat ROOT_LAYOUT_LOCK_001 final.")

OUT.write_text("\\n".join(report))

print("ROOT_LAYOUT_OWNERSHIP_AUDIT DONE")
print(OUT)
