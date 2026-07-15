from pathlib import Path

css = Path("style.css").read_text(
    encoding="utf-8",
    errors="ignore"
)

lines = css.splitlines()

for i, line in enumerate(lines, 1):
    if line.strip().startswith("body"):
        print("BODY FOUND LINE:", i)
        for n in range(i, min(i+20, len(lines)+1)):
            print(f"{n}: {lines[n-1]}")
