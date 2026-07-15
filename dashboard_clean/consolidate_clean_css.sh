#!/data/data/com.termux/files/usr/bin/bash
set -e

CSS="style.css"
BACKUP="style.before_clean_consolidation_$(date +%Y%m%d_%H%M%S).css"
OUT="$HOME/storage/downloads/style_ssot_final.css"

cp "$CSS" "$BACKUP"

python - <<'PY'
from pathlib import Path
import re

p = Path("style.css")
css = p.read_text()

# 1. Buang blok patch append paling bawah jika ada.
css = re.sub(
    r"\n/\* ========================================================\n"
    r"\s*FIX FINAL MUTLAK:[\s\S]*?\n"
    r"\.bottom-nav button\.active,\n"
    r"\.nav-bar button\.active\{[\s\S]*?\n\}",
    "",
    css,
    count=1
)

# 2. Buang komentar/label patch lain yang jelas append-only, tanpa menghapus komponen inti.
css = re.sub(
    r"\n/\* =========================\n"
    r"\s*BOTTOM NAVBAR SSOT[\s\S]*?\n========================= \*/",
    "\n/* =========================\n   BOTTOM NAVBAR\n========================= */",
    css
)

# 3. Konsolidasi material glass global agar edge-glow antar-card lebih halus.
css = re.sub(
    r":root\s*\{[\s\S]*?\n\}",
""":root {
  --theme-bg-portrait:
    radial-gradient(circle at 12% 14%, rgba(255, 255, 255, 0.10), transparent 24%),
    linear-gradient(90deg, #FDBB2D 0%, #22C1C3 100%);
  --theme-bg-landscape:
    radial-gradient(circle at 12% 12%, rgba(255, 255, 255, 0.10), transparent 24%),
    linear-gradient(180deg, #FDBB2D 0%, #22C1C3 100%);

  --font-main: "Poppins", "Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

  --text-main: #ffffff;
  --text-soft: rgba(255, 255, 255, 0.88);
  --text-muted: rgba(255, 255, 255, 0.68);
  --text-faint: rgba(255, 255, 255, 0.52);

  --green: #00e676;
  --cyan: #00e5ff;
  --yellow: #ffd54a;
  --red: #ff4d57;
  --blue: #1388ff;
  --purple: #8c63ff;

  --glass-bg: rgba(0, 0, 0, 0.32);
  --glass-bg-soft: rgba(0, 0, 0, 0.12);
  --glass-bg-deep: rgba(0, 0, 0, 0.42);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-soft: rgba(255, 255, 255, 0.06);
  --glass-blur: 1.5vh;
}""",
    css,
    count=1
)

# 4. Konsolidasi owner card utama: hilangkan inset putih tajam.
card_pat = r"\.card,\n\.wide-card,\n\.summary-card,\n\.ac-card,\n\.lamp-card,\n\.entertainment-card,\n\.climate-power-card,\n\.cctv-card,\n\.energy-card,\n\.scene-card\s*\{[\s\S]*?\n\}"
card_new = """.card,
.wide-card,
.summary-card,
.ac-card,
.lamp-card,
.entertainment-card,
.climate-power-card,
.cctv-card,
.energy-card,
.scene-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: 0 1.4rem 3.2rem rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(var(--glass-blur)) saturate(135%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(135%);
}"""
css = re.sub(card_pat, card_new, css, count=1)

# 5. Konsolidasi sub-card material: tipis, tanpa blur sendiri, edge lembut.
sub_pat = r"\.summary-item,\n\.mini-device,\n\.metric-item,\n\.climate-item,\n\.cctv-mode-pill,\n\.energy-total-box\s*\{[\s\S]*?\n\}"
sub_new = """.summary-item,
.mini-device,
.metric-item,
.climate-item,
.cctv-mode-pill,
.energy-total-box {
  background: var(--glass-bg-soft);
  border: 1px solid var(--glass-border-soft);
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}"""
css = re.sub(sub_pat, sub_new, css, count=1)

# 6. Matikan highlight pseudo card yang sering menciptakan garis kaca tambahan.
css = re.sub(
    r"\.card::before,\n\.wide-card::before\s*\{[\s\S]*?\n\}",
""".card::before,
.wide-card::before {
  background: transparent;
}""",
    css,
    count=1
)

# 7. Konsolidasi navbar: satu owner bersih tanpa perimeter putih samping/bawah.
nav_pat = r"\.bottom-nav,\n\.nav-bar\s*\{[\s\S]*?\n\}"
nav_new = """.bottom-nav,
.nav-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: max(0.62rem, env(safe-area-inset-bottom));
  z-index: 50;
  display: grid;
  grid-template-columns: 1fr 1fr 3.25rem 1fr 1fr;
  align-items: center;
  gap: 0.32rem;
  width: min(24.4rem, calc(100% - 2.5rem));
  margin: 0 auto;
  padding-top: 0.65vh;
  padding-left: 0.56rem;
  padding-right: 0.56rem;
  padding-bottom: calc(0.65vh + 0.125rem);
  border-radius: 1.35rem;
  transform: none;
  background: rgba(0, 0, 0, 0.48);
  background-clip: padding-box;
  -webkit-background-clip: padding-box;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(1.2vh) saturate(130%);
  -webkit-backdrop-filter: blur(1.2vh) saturate(130%);
  overflow: hidden;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
  touch-action: manipulation;
  will-change: backdrop-filter;
}"""
css = re.sub(nav_pat, nav_new, css, count=1)

# 8. Konsolidasi active nav button ke px ornament.
active_pat = r"\.bottom-nav button\.active,\n\.nav-bar button\.active\s*\{[\s\S]*?\n\}"
active_new = """.bottom-nav button.active,
.nav-bar button.active {
  color: rgba(255, 255, 255, 1);
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
  filter: none;
  transform: none;
  outline: none;
}"""
css = re.sub(active_pat, active_new, css, count=1)

# 9. Hapus duplikasi blok navbar jika ada setelah owner pertama.
matches = list(re.finditer(nav_pat, css))
if len(matches) > 1:
    first_end = matches[0].end()
    before = css[:first_end]
    after = css[first_end:]
    after = re.sub(nav_pat, "", after)
    css = before + after

# 10. Bersihkan multiple blank lines.
css = re.sub(r"\n{4,}", "\n\n\n", css).strip() + "\n"

p.write_text(css)
PY

echo "=== CLEAN CONSOLIDATION DONE ==="
echo "Backup: $BACKUP"

echo
echo "=== PATCH MARKER CHECK ==="
grep -n "FIX FINAL MUTLAK\|Append only\|PATCH" "$CSS" || echo "PASS: Tidak ada marker patch eksplisit."

echo
echo "=== NAVBAR OWNER COUNT ==="
grep -n "^\.bottom-nav,$" "$CSS" | wc -l

echo
echo "=== EXPORT SSOT TO DOWNLOAD ==="
if [ ! -d "$HOME/storage/downloads" ]; then
  echo "Storage belum aktif. Jalankan: termux-setup-storage"
  exit 1
fi

cp -f "$CSS" "$OUT"

cmp -s "$CSS" "$OUT" \
  && echo "PASS: Download identik 100% dengan style.css aktif." \
  || echo "FAIL: Download berbeda."

echo
sha256sum "$CSS" "$OUT"

echo
echo "File final: /sdcard/Download/style_ssot_final.css"
