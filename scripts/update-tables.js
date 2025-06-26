import fs from 'fs';

const file = 'enforcement-log.md';
const content = fs.readFileSync(file, 'utf8');

// 🧠 Parse enforcement log entries
const regex = /📅 ([\dT:-]+).*?\[([^\]]+)\]\([^)]+\).*?Clause (CU[^\n]+)/g;
const violations = {};
let match;
while ((match = regex.exec(content)) !== null) {
  const [, timestamp, entity, clause] = match;
  if (!violations[entity]) violations[entity] = {};
  const clauses = clause.split(/[,/–]+/).map(c => c.trim());
  clauses.forEach(c => {
    if (!violations[entity][c]) violations[entity][c] = 0;
    violations[entity][c]++;
  });
}

// 🧩 Build Royalty Enforcement Summary Table
let summaryTable = `📊 Royalty Enforcement Summary Table:
Entity\tViolation Summary\tTriggered Clauses\tLiability / Status\n`;

for (const [entity, clauses] of Object.entries(violations)) {
  const clauseList = Object.entries(clauses)
    .map(([c, count]) => `${c} (${count})`)
    .join(', ');
  summaryTable += `${entity}\tPattern-based reuse.\t${clauseList}\t🔁 Auto-updated – review\n`;
}

// 🧩 Build Clause Trigger Timeline
let timelineTable = `⏱ Clause Activation & Trigger Timeline:
Entity\tTrigger Date\tClauses Violated\tAmount / Status\n`;

for (const [entity, clauses] of Object.entries(violations)) {
  const clauseList = Object.entries(clauses)
    .map(([c, count]) => `${c} (${count})`)
    .join(', ');
  timelineTable += `${entity}\t[auto]\t${clauseList}\t[update]\n`;
}

// 🧼 Replace table blocks in enforcement-log.md
const updated = content
  .replace(/📊 Royalty Enforcement Summary Table:[\s\S]*?⏱ Clause Activation & Trigger Timeline:/, summaryTable + '\n\n⏱ Clause Activation & Trigger Timeline:')
  .replace(/⏱ Clause Activation & Trigger Timeline:[\s\S]*$/, timelineTable);

fs.writeFileSync(file, updated);
console.log('✅ Enforcement tables updated.');

