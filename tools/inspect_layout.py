from pathlib import Path
import re

html = Path("index.html").read_text(
    encoding="utf-8",
    errors="ignore"
)

css = Path("style.css").read_text(
    encoding="utf-8",
    errors="ignore"
)

print("=" * 60)
print("SMART ROOM OS V4 LAYOUT AUDIT")
print("=" * 60)

print("\n[HTML STRUCTURE]")

for line in html.splitlines():
    s = line.strip()
    if s.startswith("<html") or s.startswith("<body"):
        print(s)
    elif "phone-container" in s:
        print(s)
    elif 'class="dashboard"' in s or " dashboard" in s:
        print(s)

print("\n" + "=" * 60)
print("[CSS SELECTOR]")
print("=" * 60)

selectors = [
    "html",
    "body",
    ".app.phone-container",
    ".dashboard"
]

for selector in selectors:

    print("\n--------------------------------------------------")
    print(selector)

    m = re.search(
        rf"{re.escape(selector)}\s*\{{(.*?)\}}",
        css,
        re.S
    )

    if not m:
        print("[DATA TIDAK DITEMUKAN]")
        continue

    for line in m.group(1).splitlines():

        s = line.strip()

        if any(k in s for k in [
            "height",
            "min-height",
            "display",
            "overflow",
            "position",
            "padding",
            "margin",
            "background"
        ]):
            print(s)

print("\n============================================================")
print("AUDIT COMPLETE")
print("============================================================")

