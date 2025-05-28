
// scripts/github-scan.js

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SEARCH_TERMS = ['Holmes Enforcement Model', 'Royalty Debt Token', 'HEM Clause CU-1']; // Add more as needed

const headers = {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
};

async function searchCode(query) {
  const url = `https://api.github.com/search/code?q=${encodeURIComponent(query)}+in:file`;
  try {
    const response = await axios.get(url, { headers });
    return response.data.items;
  } catch (error) {
    console.error(`Error searching for "${query}":`, error.response.data);
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

  fs.appendFileSync('enforcement-log.md', logEntry);
  console.log(`Logged violation in ${repoName}/${filePath}`);
}

async function main() {
  for (const term of SEARCH_TERMS) {
    const results = await searchCode(term);
    for (const item of results) {
      await logViolation(item, term);
    }
  }
}

main();
