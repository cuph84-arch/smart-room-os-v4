from pathlib import Path
import re


CSS_FILE = Path("style.css")


def read_css(path):
    if not path.exists():
        return "[DATA TIDAK DITEMUKAN]"

    return path.read_text(
        encoding="utf-8",
        errors="ignore"
    )


css = read_css(CSS_FILE)


print("=" * 60)
print("SMART ROOM OS V4 BACKGROUND CSS ANALYZER")
print("=" * 60)


selectors = [
    ":root",
    "html",
    "body",
    ".app",
    ".phone-container"
]


for selector in selectors:

    print("\n" + "-" * 60)
    print("SELECTOR:", selector)

    pattern = (
        re.escape(selector)
        +
        r"\s*\{([^}]*)\}"
    )

    result = re.findall(
        pattern,
        css,
        re.MULTILINE
    )


    if not result:
        print("[DATA TIDAK DITEMUKAN]")
        continue


    for block in result:

        properties = [
            "background",
            "background-color",
            "background-image",
            "background-attachment",
            "background-size",
            "background-repeat",
            "height",
            "min-height",
            "overflow"
        ]

        found = False

        for prop in properties:

            match = re.findall(
                prop + r"\s*:\s*([^;]+)",
                block
            )

            for value in match:
                print(
                    prop,
                    "=",
                    value.strip()
                )
                found = True


        if not found:
            print("[Tidak ada properti target]")


print("\n" + "=" * 60)
print("ANALYSIS COMPLETE")
print("=" * 60)
