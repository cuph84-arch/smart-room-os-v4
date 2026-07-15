from pathlib import Path
import re

css_file = Path("style.css")

if not css_file.exists():
    print("[ERROR] style.css tidak ditemukan")
    raise SystemExit(1)

css = css_file.read_text(
    encoding="utf-8",
    errors="ignore"
)

pattern = re.compile(r'([^{]+)\{([^}]*)\}', re.S)

print("=" * 60)
print("SMART ROOM OS V4 - BACKGROUND AUDIT")
print("=" * 60)

count = 0

for selector, block in pattern.findall(css):

    props = []

    for line in block.splitlines():
        s = line.strip()

        if s.startswith("background:") or s.startswith("background-color:"):
            props.append(s)

    if props:
        count += 1
        print()
        print("-" * 60)
        print("SELECTOR :", selector.strip())
        for p in props:
            print(p)

print()
print("=" * 60)
print("TOTAL SELECTOR :", count)
print("=" * 60)

