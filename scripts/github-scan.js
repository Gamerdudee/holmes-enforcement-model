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
