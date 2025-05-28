// scripts/scan-violations.js

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const CLAUSE_FILE = path.resolve(__dirname, '../clauses.json');
const LOG_FILE = path.resolve(__dirname, '../enforcement-log.md');

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
};

// Load clause triggers
const CLAUSES = JSON.parse(fs.readFileSync(CLAUSE_FILE, 'utf-8'));

/**
 * GitHub Code Search
 */
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

/**
 * Match trigger to clause
 */
function matchClause(term) {
  return CLAUSES.find(c => c.triggers.includes(term.toLowerCase()));
}

/**
 * Log detected violation with clause info
 */
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

/**
 * Main Execution
 */
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

