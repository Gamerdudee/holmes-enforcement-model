Hash:
`sha256:bad281e2cd98fcdfa4a8015af62714b3cf5799e40612beb806e892248b99039a`

Hash:
`sha256:ec179883e80aff5bf2ab1376f22bbf2975ca30f7bd0bbe94c376df6cf89a08c2`

Hash:
`sha256:0230068e94df0aa2c99d46ad6fc386b2a0c31d0351a09789b8d5b8909a507c8a`

Hash:
`sha256:20fb268c7b4b4dce734dd4645c0f2613d5fbbd52d54e818c1d100e67b25a7b04`

Hash:
`sha256:8de097cbed37c55fb648f4d2c6d20556b0a9859af656a507127858700b327aab`

// SPDX-License-Identifier: Declaratory-Royalty
// Hash: sha256:64a65d3399be4f188ab66644cb5ccc0cc1a0040b3d942d2b7ead62c340d2939e
/**
 * 🧠 HEM Auto-Enforcement Engine — update-tables.js
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

import fs from 'fs';

const file = 'enforcement-log.md';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const violations = {};
const clauseCounts = {};
let lastEntity = null;
let currentDate = '[auto]';
let collectingClauses = false;
let clauseBuffer = [];

const clauseHeaderRegex = /[*_]{2}Clauses (Activated|Violated|Triggered|Violations|Triggers)[*_]*[:：]?\s*$/i;
const clauseInlineRegex = /[*_]{2}Clauses (Activated|Violated|Triggered|Violations|Triggers)[*_]*[:：]?\s*(.+)/i;
const entityRegex = /[*_]{2}Entity[:：][*_]*\s*(.+)/i;
const platformRegex = /Platform[:：]\s*(.+)/i;
const eventRegex = /Event[:：].*?by\s+([A-Za-z0-9 _().\-\/]+)/i;
const dateRegex = /[*_]{2}Date[:：][*_]*\s*(.+)/i;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Date detection
  const dateMatch = line.match(dateRegex);
  if (dateMatch) {
    currentDate = dateMatch[1].trim();
    continue;
  }

  // Entity detection
  if (entityRegex.test(line)) {
    lastEntity = line.match(entityRegex)[1].trim();
    continue;
  } else if (platformRegex.test(line)) {
    lastEntity = line.match(platformRegex)[1].trim();
    continue;
  } else if (eventRegex.test(line)) {
    lastEntity = line.match(eventRegex)[1].trim();
    continue;
  }

  // Clause block START
  if (clauseHeaderRegex.test(line)) {
    collectingClauses = true;
    clauseBuffer = [];
    continue;
  }

  // Inline clause parsing
  const inlineMatch = line.match(clauseInlineRegex);
  if (inlineMatch && lastEntity && inlineMatch[2]) {
    const inlineClauses = inlineMatch[2]
      .split(/[,/–]+/)
      .map(c => c.trim().replace(/[*_]+/g, ''))
      .filter(Boolean);

    if (!violations[lastEntity]) violations[lastEntity] = { clauses: {}, date: currentDate };
    inlineClauses.forEach(clause => {
      violations[lastEntity].clauses[clause] = (violations[lastEntity].clauses[clause] || 0) + 1;
      clauseCounts[clause] = (clauseCounts[clause] || 0) + 1;
    });

    lastEntity = null;
    currentDate = '[auto]';
    continue;
  }

  // Clause block continuation
  if (collectingClauses) {
    if (/^\s*[-•]/.test(line)) {
      const clause = line.replace(/^[-•]\s*/, '').trim().replace(/[*_]+/g, '');
      if (clause) clauseBuffer.push(clause);
    } else {
      // End of block
      collectingClauses = false;
      if (lastEntity && clauseBuffer.length > 0) {
        if (!violations[lastEntity]) violations[lastEntity] = { clauses: {}, date: currentDate };
        clauseBuffer.forEach(clause => {
          violations[lastEntity].clauses[clause] = (violations[lastEntity].clauses[clause] || 0) + 1;
          clauseCounts[clause] = (clauseCounts[clause] || 0) + 1;
        });
        lastEntity = null;
        currentDate = '[auto]';
        clauseBuffer = [];
      }
    }
  }
}

// 🎯 Summary Table
let monthHeader = `## 📅 ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} — This Month's Summary\n\n`;

let summaryTable = `## 🤖 Auto Summary Table\n\n| Entity | Violation Summary | Triggered Clauses | Status |\n|--------|-------------------|-------------------|--------|\n`;
for (const [entity, data] of Object.entries(violations)) {
  const clauseList = Object.entries(data.clauses)
    .map(([c, count]) => `${c} (${count})`)
    .join(', ');
  summaryTable += `| ${entity} | Patterned usage | ${clauseList || 'None'} | Auto-logged |\n`;
}

let timelineTable = `\n## ⏱ Auto Trigger Timeline\n\n| Entity | Clauses | Last Seen |\n|--------|---------|-----------|\n`;
for (const [entity, data] of Object.entries(violations)) {
  const clauseList = Object.keys(data.clauses).join(', ') || 'None';
  timelineTable += `| ${entity} | ${clauseList} | ${data.date} |\n`;
}

// 📊 Clause Frequency Table
let clauseFreqTable = `\n## 📈 Clause Usage Summary\n\n| Clause | Count |\n|--------|-------|\n`;
Object.entries(clauseCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([clause, count]) => {
    clauseFreqTable += `| ${clause} | ${count} |\n`;
  });

// 🔁 Replace AutoTables block
const startMarker = '<!-- START: AutoTables -->';
const endMarker = '<!-- END: AutoTables -->';

const newBlock = `${startMarker}\n\n${monthHeader}${summaryTable}${timelineTable}${clauseFreqTable}\n\n${endMarker}`;
const updated = content.replace(
  new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`),
  newBlock
);

fs.writeFileSync(file, updated);
console.log('✅ Enforcement tables updated and written to enforcement-log.md');
