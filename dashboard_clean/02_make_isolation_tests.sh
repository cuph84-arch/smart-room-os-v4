#!/data/data/com.termux/files/usr/bin/bash
set -e

mkdir -p audit_navbar_case/tests
BASE="audit_navbar_case/style.audit_base.css"

cp "$BASE" audit_navbar_case/tests/style_test_1_overlay_after_off.css
cp "$BASE" audit_navbar_case/tests/style_test_2_overlay_before_off.css
cp "$BASE" audit_navbar_case/tests/style_test_3_navbar_blur_off.css
cp "$BASE" audit_navbar_case/tests/style_test_4_card_blur_off.css

cat >> audit_navbar_case/tests/style_test_1_overlay_after_off.css <<'EOF'
.app::after,
.phone-container::after {
  background: transparent;
}
EOF

cat >> audit_navbar_case/tests/style_test_2_overlay_before_off.css <<'EOF'
.app::before,
.phone-container::before {
  background: transparent;
}
EOF

cat >> audit_navbar_case/tests/style_test_3_navbar_blur_off.css <<'EOF'
.bottom-nav,
.nav-bar {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
EOF

cat >> audit_navbar_case/tests/style_test_4_card_blur_off.css <<'EOF'
.card,
.wide-card,
.summary-card,
.ac-card,
.lamp-card,
.entertainment-card,
.climate-power-card,
.cctv-card,
.energy-card,
.scene-card {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
EOF

echo "DONE: isolation CSS files created."
ls -1 audit_navbar_case/tests
