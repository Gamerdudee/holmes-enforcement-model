import fs from 'fs';

const file = 'enforcement-log.md';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const violations = {};
let lastEntity = null;

const clauseRegex = /[*_]{2}Clauses (Activated|Violated|Triggered)[*_]*[:：]\s*([^\n]+)/i;
const entityRegex = /[*_]{2}Entity[:：][*_]*\s*(.+)/i;
const platformRegex = /Platform[:：]\s*(.+)/i;
const eventRegex = /Event[:：].*?by\s+([A-Za-z0-9 _().\-\/]+)/i;

// Collect clause violations per entity
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Match entity using various patterns
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

  // Look for clause activation/violation/trigger line
  const clauseMatch = line.match(clauseRegex);
  if (clauseMatch && lastEntity) {
    const rawClauses = clauseMatch[2]
      .split(/[,/–]+/)
      .map(c => c.trim().replace(/[\*\*_]+/g, '')) // Remove stray asterisks or formatting
      .filter(Boolean);

    if (rawClauses.length === 0) continue;

    if (!violations[lastEntity]) violations[lastEntity] = {};
    rawClauses.forEach(clause => {
      if (!violations[lastEntity][clause]) violations[lastEntity][clause] = 0;
      violations[lastEntity][clause]++;
    });

    lastEntity = null; // reset after clause is logged
  }
}

// 🛠️ Build summary table
let summaryTable = `## 📅 ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} — This Month's Summary\n\n`;

summaryTable += `## 🤖 Auto Summary Table\n\n| Entity | Violation Summary | Triggered Clauses | Status |\n|--------|-------------------|-------------------|--------|\n`;

for (const [entity, clauses] of Object.entries(violations)) {
  const clauseList = Object.entries(clauses)
    .map(([c, count]) => `${c} (${count})`)
    .join(', ');
  summaryTable += `| ${entity} | Patterned usage | ${clauseList || 'None'} | Auto-logged |\n`;
}

// 🕒 Timeline Table
let timelineTable = `\n## ⏱ Auto Trigger Timeline\n\n| Entity | Clauses | Last Seen |\n|--------|---------|-----------|\n`;
for (const [entity, clauses] of Object.entries(violations)) {
  const clauseList = Object.keys(clauses).join(', ') || 'None';
  timelineTable += `| ${entity} | ${clauseList} | [auto] |\n`;
}

// 🧽 Replace marker block
const startMarker = '<!-- START: AutoTables -->';
const endMarker = '<!-- END: AutoTables -->';

const newBlock = `${startMarker}\n\n${summaryTable}\n${timelineTable}\n\n${endMarker}`;
const updated = content.replace(
  new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`),
  newBlock
);

fs.writeFileSync(file, updated);
console.log('✅ Enforcement tables updated and written to enforcement-log.md');

