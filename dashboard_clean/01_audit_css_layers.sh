#!/data/data/com.termux/files/usr/bin/bash
set -e

mkdir -p audit_navbar_case
cp style.css audit_navbar_case/style.audit_base.css

echo "=== CSS LAYER AUDIT ===" > audit_navbar_case/audit_report.txt
grep -n "html {\|body {\|.app,\|.phone-container\|.dashboard\|::before\|::after\|bottom-nav\|nav-bar\|backdrop-filter\|overflow\|position:\|z-index" style.css >> audit_navbar_case/audit_report.txt || true

echo "DONE: audit_navbar_case/audit_report.txt"
cat audit_navbar_case/audit_report.txt
