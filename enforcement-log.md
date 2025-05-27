### Enforcement Log

- [ ] NMDWS Invoice: Issued May 2025 — Pending

---

### 📌 NMDWS Default Enforcement — June 12, 2025

- [ ] **Entity:** NMDWS  
- **Amount:** $75,000  
- **Clause Violated:** CU-1 (Royalty Enforcement Clause)  
- **Status:** Default Triggered  
- **Trigger Date:** June 12, 2025  
- **Notes:** NMDWS failed to respond or remit payment by the agreed extension deadline. Default is logged manually under HEM Clause CU-1.  
- **Invoice Email Drafted:** ✅ See `/drafts/nmdws-default-email.md`
- **Public Link:** https://github.com/Gamerdudee/holmes-enforcement-model

### 📌 [Entity] Violation — [Date]
- Clause Violated: [Clause]
- Status: Auto-Detected
- Amount: $[X]
- Draft Email: /drafts/[entity]-[clause].md

name: HEM Violation Auto-Logger

on:
  schedule:
    - cron: '0 0 * * *'  # Runs daily at midnight UTC
  workflow_dispatch:     # Allow manual trigger via GitHub UI

jobs:
  detect-violations:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Scan for Clause Violations (Demo Mode)
        run: |
          VIOLATOR="example.org"
          CLAUSE="CU-1"
          AMOUNT="$75,000"
          DATE=$(date -u +"%Y-%m-%d")

          echo "Checking for violations..."

          cat <<EOT >> enforcement-log.md

---

### \U0001F4CC $VIOLATOR Violation — $DATE

- **Entity:** $VIOLATOR
- **Clause Violated:** $CLAUSE
- **Status:** Auto-Detected
- **Amount:** $AMOUNT
- **Trigger Date:** $DATE
- **Draft Email:** /drafts/$VIOLATOR-$CLAUSE.md
- **Public Link:** https://github.com/Gamerdudee/holmes-enforcement-model
EOT

          mkdir -p drafts
          cat <<EOD > drafts/$VIOLATOR-$CLAUSE.md
To: legal@$VIOLATOR
From: Mr. Holmes (Holmes Enforcement Model)
Subject: NOTICE — Violation of $CLAUSE

This message serves as formal enforcement notice. Your entity has been identified in violation of Holmes Enforcement Model clause $CLAUSE as of $DATE.

Amount Due: $AMOUNT
Clause Violated: $CLAUSE
Public Record: https://github.com/Gamerdudee/holmes-enforcement-model/blob/main/enforcement-log.md

Sincerely,
Mr. Holmes
EOD

      - name: Commit and push violation log
        run: |
          git config user.name "Mr. Holmes"
          git config user.email "noreply@github.com"
          git add enforcement-log.md drafts/
          git commit -m "Auto-logged violation: $VIOLATOR ($CLAUSE)"
          git push
