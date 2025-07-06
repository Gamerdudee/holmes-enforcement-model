Hash:
`sha256:b7a21ab55b881633c48a85bb1f366ceee7fcd9dcf0a0a6ea88646cacb73b73b9`

Hash:
`sha256:43f6f378972e30fb3180fcc8e82a7b6a6494bf4669a7645588324d25c7220b54`

Hash:
`sha256:57a602b0bd92ee8aa38864799364889f7047cbec46ea126efb727cc7c160654d`

Hash:
`sha256:616358dec836fcf8d22e45ed49b9862f3c51c5fbb2e8f91f3e2182ef7a1b3ae4`

Hash:
`sha256:aca798bff2f7aca98660218cd183c6ba2a9c3fc3eb9139f8682b703e55269327`

// SPDX-License-Identifier: Declaratory-Royalty
// Hash: sha256:a98f3f5e276aeeffc80ed44aabaf1a97ba7b7c4ff6f38cdbe84bac31238b27bc
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
