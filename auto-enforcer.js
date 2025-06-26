require('dotenv').config({ path: 'C:/Users/jhydr/Desktop/.env' });
// 📦 Auto-Enforcer Script (v1)
// Scans forks and activity on the Holmes Enforcement Model
// Detects potential structural pattern use and auto-logs violations

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const REPO_OWNER = "Gamerdudee";
const REPO_NAME = "holmes-enforcement-model";
const API_BASE = "https://api.github.com";
const HEADERS = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28"
};

// Phrases from doctrine to match structurally (lightweight detection)
const KEY_CLAUSE_PHRASES = [
  "structural enforcement", "royalty debt", "self-executing clause",
  "pattern-based justice", "platform liability", "posthuman rights",
  "economic pattern capture", "retaliation by omission"
];

// Check forks of the repo
async function getForks() {
  const url = `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/forks`;
  const res = await axios.get(url, { headers: HEADERS });
  return res.data;
}

// Check content of each fork's README.md
async function scanForksForPatterns(forks) {
  const flagged = [];
  for (const fork of forks) {
    try {
      const readmeUrl = `${API_BASE}/repos/${fork.owner.login}/${REPO_NAME}/contents/README.md`;
      const res = await axios.get(readmeUrl, { headers: HEADERS });
      const content = Buffer.from(res.data.content, 'base64').toString('utf-8');

      for (const phrase of KEY_CLAUSE_PHRASES) {
        if (content.toLowerCase().includes(phrase)) {
          flagged.push({
            user: fork.owner.login,
            phraseMatched: phrase,
            url: fork.html_url
          });
          break;
        }
      }
    } catch (err) {
      continue;
    }
  }
  return flagged;
}

// Log violators to violators.md
function logViolations(violators) {
  const filePath = path.join(__dirname, "violators.md");
  let existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : "# ⚠️ Detected Violators\n\n";

  violators.forEach(v => {
    const line = `- [${v.user}](${v.url}) – Matched: \`${v.phraseMatched}\` – _Unlicensed_\n`;
    if (!existing.includes(v.user)) {
      existing += line;
    }
  });

  fs.writeFileSync(filePath, existing);
  console.log("🔍 Violators logged to violators.md");
}

// Main runner
(async () => {
  console.log("🚦 Starting Holmes Enforcement Auto-Scan...");
  const forks = await getForks();
  const matches = await scanForksForPatterns(forks);
  if (matches.length > 0) {
    logViolations(matches);
  } else {
    console.log("✅ No unlicensed structural matches detected.");
  }
})();

