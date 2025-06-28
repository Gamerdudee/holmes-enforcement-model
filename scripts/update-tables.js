import fs from 'fs';

const file = 'enforcement-log.md';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const violations = {};
const seen = new Set(); // Deduplication

let lastEntity = null;

const clauseRegex = /[*_]{2}Clauses (Activated|Violated|Triggered)[*_]*[:：]\s*([^\n]+)/i;
const entityRegex = /[*_]{2}Entity[:：][*_]*\s*(.+)/i;
const platformRegex = /Platform[:：]\s*(.+)/i;
const eventRegex = /Event[:：].*?by\s+([A-Za-z0-9 _().\-\/]+)/i;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Match entity based on various headings
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

  // Match clause triggers
  const clauseMatch = line.match(clauseRegex);
  if (clauseMatch && lastEntity) {
    const clauses = clauseMatch[2]
      .split(/[,/–]+/)
      .map(c => c.trim())
      .filter(Boolean);

    if (!violations[lastEntity]) violations[lastEntity] = {};

    for (const clause of clauses) {
      const key = `${lastEntity}::${clause}`;
      if (seen.has(key)) continue;
      seen.add(key);

      if (!violations[lastEntity][clause]) violations[lastEntity][clause] = 0;
      violations[lastEntity][clause]++;
    }

    lastEntity = null;
  }
}

// 🗓️ Month banner
const now = new Date();
const monthName = now.toLocaleString('default', { month: 'long' });
const banner = `📅 ${monthName} ${now.getFullYear()} — This Month's Summary`;

// 📊 Summary Table
let summaryTable = `## 🤖 Auto Summary Table\n\n| Entity | Violation Summary | Triggered Clauses | Status |\n|--------|-------------------|-------------------|--------|\n`;
for (const [entity, clauses] of Object.entries(violations)) {
  const clauseList = Object.entries(clauses)
    .map(([c, count]) => `${c} (${count})`)
    .join(', ');
  summaryTable += `| ${entity} | Patterned usage | ${clauseList} | Auto-logged |\n`;
}

// ⏱️ Timeline Table
let timelineTable = `\n## ⏱ Auto Trigger Timeline\n\n| Entity | Clauses | Last Seen |\n|--------|---------|-----------|\n`;
for (const [entity, clauses] of Object.entries(violations)) {
  const clauseList = Object.keys(clauses).join(', ');
  timelineTable += `| ${entity} | ${clauseList} | [auto] |\n`;
}

// 🧠 Replacement logic
const startMarker = '<!-- START: AutoTables -->';
const endMarker = '<!-- END: AutoTables -->';
const newBlock = `${startMarker}\n\n## ${banner}\n\n${summaryTable}\n${timelineTable}\n\n${endMarker}`;

const updated = content.replace(
  new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`),
  newBlock
);

fs.writeFileSync(file, updated);
console.log('✅ Enforcement tables + banner written to enforcement-log.md');
