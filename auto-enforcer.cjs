
// SPDX-License-Identifier: Declaratory-Royalty
// Hash: sha256:9c09adeb36bc51259d10245130f28fcc7822827a74bc1bf17992a44d093bf8e2
/**
 * 🧠 HEM Auto-Enforcement Engine — auto-enforcer.cjs
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


require('dotenv').config({ path: 'C:/Users/jhydr/Desktop/.env' });
// 📦 HEM Auto-Enforcer v1.1
// Fork scanner for clause-based IP reuse and declaratory violations

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

const KEY_CLAUSE_PHRASES = [
  "structural enforcement", "royalty debt", "self-executing clause",
  "pattern-based justice", "platform liability", "posthuman rights",
  "economic pattern capture", "retaliation by omission"
];

async function getForks() {
  const url = `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/forks`;
  const res = await axios.get(url, { headers: HEADERS });
  return res.data;
}

async function scanForksForPatterns(forks) {
  const flagged = [];
  for (const fork of forks) {
    try {
      const readmeUrl = `${API_BASE}/repos/${fork.owner.login}/${REPO_NAME}/contents/README.md`;
      const res = await axios.get(readmeUrl, { headers: HEADERS });
      const content = Buffer.from(res.data.content, 'base64').toString('utf-8');

      for (const phrase of KEY_CLAUSE_PHRASES) {
        if (content.toLowerCase().includes(phrase.toLowerCase())) {
          flagged.push({
            user: fork.owner.login,
            phraseMatched: phrase,
            url: fork.html_url
          });
          break;
        }
      }
    } catch (err) {
      continue; // skip forks with missing README
    }
  }
  return flagged;
}

function logViolations(violators) {
  const filePath = path.join(__dirname, "enforcement-log.md");
  let existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : "# 🧾 HEM Enforcement Log\n\n";

  violators.forEach(v => {
    const line = `📅 ${new Date().toISOString()} – Detected unlicensed fork by [${v.user}](${v.url}) | Phrase matched: \`${v.phraseMatched}\` | ⚠️ Clause CU‑2.3\n`;
    if (!existing.includes(v.user)) {
      existing += line;
    }
  });

  fs.writeFileSync(filePath, existing);
  console.log("🔍 Violations logged to enforcement-log.md");
}

(async () => {
  console.log("🚦 Starting HEM Auto-Scan...");
  try {
    const forks = await getForks();
    const matches = await scanForksForPatterns(forks);
    if (matches.length > 0) {
      logViolations(matches);
    } else {
      console.log("✅ No unlicensed clause reuse detected.");
    }
  } catch (err) {
    console.error("❌ Scan failed:", err.message);
  }
})();
