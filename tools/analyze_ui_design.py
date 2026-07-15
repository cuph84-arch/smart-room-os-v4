from pathlib import Path
import re


ROOT = Path(".")

HTML_FILE = ROOT / "index.html"
CSS_FILE = ROOT / "style.css"


def read_file(path):
    if not path.exists():
        return "[DATA TIDAK DITEMUKAN]"

    return path.read_text(
        encoding="utf-8",
        errors="ignore"
    )


html = read_file(HTML_FILE)
css = read_file(CSS_FILE)


print("=" * 60)
print("SMART ROOM OS V4 UI DESIGN ANALYZER")
print("=" * 60)


# HTML CLASS EXTRACTION

print("\n[HTML COMPONENT CLASS]")

classes = sorted(
    set(
        re.findall(
            r'class=["\']([^"\']+)',
            html
        )
    )
)

for item in classes:
    print("-", item)


# ID EXTRACTION

print("\n[HTML ID]")

ids = sorted(
    set(
        re.findall(
            r'id=["\']([^"\']+)',
            html
        )
    )
)

for item in ids:
    print("-", item)



# CSS VARIABLES

print("\n[CSS VARIABLES]")

variables = re.findall(
    r'(--[\w-]+)\s*:\s*([^;]+)',
    css
)

for name,value in variables:
    print(
        name,
        "=",
        value.strip()
    )



# COLORS

print("\n[COLORS]")

colors = sorted(
    set(
        re.findall(
            r'#[0-9a-fA-F]{3,8}',
            css
        )
    )
)

for c in colors:
    print("-", c)



# FONT

print("\n[FONTS]")

fonts = sorted(
    set(
        re.findall(
            r'font-family\s*:\s*([^;]+)',
            css
        )
    )
)

for f in fonts:
    print("-", f)



# SIZE UNITS

print("\n[SIZE USAGE]")

units = {
    "px": len(re.findall(r'\d+px', css)),
    "%": len(re.findall(r'\d+%', css)),
    "vw": len(re.findall(r'\d+vw', css)),
    "vh": len(re.findall(r'\d+vh', css)),
    "rem": len(re.findall(r'\d+rem', css)),
    "em": len(re.findall(r'\d+em', css)),
}

for k,v in units.items():
    print(
        k,
        ":",
        v
    )


# RESPONSIVE

print("\n[MEDIA QUERY]")

media = re.findall(
    r'@media[^{]+',
    css
)

for m in media:
    print("-",m.strip())


print("\nANALYSIS COMPLETE")
