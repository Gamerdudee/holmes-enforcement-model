Hash:
`sha256:4d82fd7b564989bbb39023cc826d83b44a7c287e683569db4140742c2218be3a`

Hash:
`sha256:d94fc34dddf3a7428d9358d6cab1036ac4e1a11d4c786820fbd3a8c8ae5f500f`

Hash:
`sha256:12c42eb556ad5b573c92abe18d33057501eba35002965233dc747692ad95e698`

Hash:
`sha256:68ac443af63d37d560a2813e78239331cd9754917db52e84c77a0e17de9f07c6`

// SPDX-License-Identifier: Declaratory-Royalty
// Hash: sha256:ee83b8613b7b69a5e497327d61b6536f8734be9438887210babf622bd0311368
// Copyright (c) Mr. Holmes
// Declaratory Sovereign – Holmes Enforcement Model
// scripts/github-scan.js

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// === CONFIGURATION ===
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OUTPUT_FILE = path.resolve(__dirname, '../enforcement-log.md');

const SEARCH_TERMS = [
  'Holmes Enforcement Model',
  'Royalty Debt Token',
  'HEM Clause CU-1',
  'Declaratory Sovereign Holmes',
  'Autonomous Structural Enforcement Doctrine',
]; // Expand as needed

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
};

// === CORE FUNCTIONS ===

async function searchCode(query) {
  const url = `https://api.github.com/search/code?q=${encodeURIComponent(query)}+in:file`;
  try {
    const response = await axios.get(url, { headers });
    return response.data.items || [];
  } catch (error) {
    console.error(`❌ Error searching for "${query}":`, error.response?.data?.message || error.message);
    return [];
  }
}

async function logViolation(item, term) {
  const repoName = item.repository.full_name;
  const filePath = item.path;
  const htmlUrl = item.html_url;
  const date = new Date().toISOString().split('T')[0];

  const logEntry = `
---

### 📌 Violation Detected — ${date}

- **Repository:** ${repoName}
- **File:** ${filePath}
- **Term Matched:** ${term}
- **URL:** ${htmlUrl}
`;

  fs.appendFileSync(OUTPUT_FILE, logEntry);
  console.log(`✅ Logged violation: ${repoName}/${filePath}`);
}

async function main() {
  console.log('🔍 Starting GitHub scan for HEM-related violations...\n');

  for (const term of SEARCH_TERMS) {
    console.log(`Searching for term: "${term}"`);
    const results = await searchCode(term);

    if (results.length === 0) {
      console.log(`➡️  No matches found for "${term}".`);
      continue;
    }

    for (const item of results) {
      await logViolation(item, term);
    }
  }

  console.log('\n✅ Scan complete. Results saved to enforcement-log.md.');
}

main();
