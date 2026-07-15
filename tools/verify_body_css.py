from pathlib import Path
import re

css = Path("style.css").read_text(encoding="utf-8", errors="ignore")

m = re.search(r'body\s*\{(.*?)\}', css, re.S)

if not m:
    print("[ERROR] body tidak ditemukan")
    raise SystemExit

print("="*60)
print("BODY CSS")
print("="*60)

print(m.group(1).strip())

print("\n" + "="*60)
print("LINEAR GRADIENT FOUND")
print("="*60)

g = re.search(r'background\s*:\s*linear-gradient\((.*?)\);', m.group(1), re.S)

if g:
    print(g.group(1).strip())
else:
    print("[DATA TIDAK DITEMUKAN]")
