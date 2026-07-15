from pathlib import Path

src = Path("style.css")
s = src.read_text()

out = Path("css_modules")
out.mkdir(exist_ok=True)

root_marker = "/* =========================\n   ROOT_LAYOUT_LOCK_001"

idx = s.find(root_marker)
if idx == -1:
    raise SystemExit("ERROR: ROOT_LAYOUT_LOCK_001 marker not found")

legacy = s[:idx].rstrip()
root_lock = s[idx:].rstrip()

(out / "00_legacy_core_before_root_lock.css").write_text(legacy + "\n")
(out / "01_root_layout_lock.css").write_text(root_lock + "\n")

modular = """/* =========================
   STYLE MODULAR V1
   Generated safely from current style.css
========================= */

@import url("./css_modules/00_legacy_core_before_root_lock.css");
@import url("./css_modules/01_root_layout_lock.css");
"""

Path("style.modular.css").write_text(modular)

print("CSS_MODULARIZATION_V1 DONE")
print("- css_modules/00_legacy_core_before_root_lock.css")
print("- css_modules/01_root_layout_lock.css")
print("- style.modular.css")
print("")
print("NEXT: do not replace style.css yet. Test modular file manually after link switch.")
