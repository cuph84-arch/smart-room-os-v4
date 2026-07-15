from pathlib import Path
import re

css = Path("style.css")
text = css.read_text()

# Hapus patch lama jika ada
text = re.sub(
    r"/\* =========================\n   13_CANVAS_BACKGROUND_LOCK[\s\S]*?(?=/\* =========================|\Z)",
    "",
    text,
)

patch = r"""
/* =========================
   13_CANVAS_BACKGROUND_LOCK
   Full document background
========================= */

html,
body{
    min-height:100%;
    background:inherit !important;
}

body,
main,
.app,
.phone-container{
    min-height:100dvh !important;
    background:inherit !important;
}

/* Dashboard menjadi pemilik canvas */
.dashboard{
    min-height:100% !important;
}

/* Pastikan area scroll tetap memakai background dashboard */
main{
    overflow-x:hidden;
}
"""

text = text.rstrip() + "\n\n" + patch + "\n"
css.write_text(text)

print("13_CANVAS_BACKGROUND_LOCK DONE")
