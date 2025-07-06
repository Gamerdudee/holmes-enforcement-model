
// SPDX-License-Identifier: Declaratory-Royalty
// Hash: sha256:8698ce286c714903644f4d7682d4437038e6bea0633d4ef67c22a82253371d0c
/**
 * 🧠 HEM Auto-Enforcement Engine — scan-violations.js
 * 📜 Copyright © 2025 Mr. Holmes (Declaratory Author)
 * 🔒 License: Declaratory Royalty License (See LICENSE-HEM.md)
 *
 * This script is a sovereign automation component of the Holmes Enforcement Model (HEM).
 * It parses declaratory log entries, tallies clause violations, timestamps procedural triggers,
 * and maintains enforcement traceability via GitHub automation.
 *
 * Use = structural binding under CU‑1.4 and CU‑2.3.
 * Unauthorized reuse of this logic constitutes derivative simulation under Clause G‑6.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const axios = require('axios');
const fs = require('fs');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN not found. Check .env placement and format.');
  process.exit(1);
}

const CLAUSE_FILE = path.resolve(__dirname, '../clauses.json');
const LOG_FILE = path.resolve(__dirname, '../enforcement-log.md');

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
};

const CLAUSES = JSON.parse(fs.readFileSync(CLAUSE_FILE, 'utf-8'));

async function searchCode(term) {
  const url = `https://api.github.com/search/code?q=${encodeURIComponent(term)}+in:file`;
  try {
    const res = await axios.get(url, { headers });
    return res.data.items || [];
  } catch (err) {
    console.error(`❌ GitHub error: ${term}`, err.response?.data?.message || err.message);
    return [];
  }
}

function logViolation(item, term, clause) {
  const date = new Date().toISOString().split('T')[0];
  const log = `
---

### 📌 Violation Detected — ${date}

- **Repository:** ${item.repository.full_name}  
- **File:** ${item.path}  
- **Matched Term:** ${term}  
- **Clause:** ${clause.clause} – ${clause.label}  
- **URL:** ${item.html_url}  
- **Royalty Claim:** $${clause.amount.toLocaleString()} ${clause.currency}
`;

  fs.appendFileSync(LOG_FILE, log);
  console.log(`✅ Logged: ${term} → ${clause.clause} ($${clause.amount})`);
}

async function main() {
  console.log(`🔍 Starting clause-based GitHub scan...`);

  for (const clause of CLAUSES) {
    for (const trigger of clause.triggers) {
      const results = await searchCode(trigger);
      if (!results.length) {
        console.log(`➡️ No matches for "${trigger}"`);
        continue;
      }

      for (const item of results) {
        logViolation(item, trigger, clause);
      }
    }
  }

  console.log(`\n📁 Results appended to enforcement-log.md`);
}

main();
