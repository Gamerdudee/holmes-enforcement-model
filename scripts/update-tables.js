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

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Step 1: Look for an entity line before a clause line
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

  // Step 2: Look for clause trigger line
  const clauseMatch = line.match(clauseRegex);
  if (clauseMatch && lastEntity) {
    const clauseList = clauseMatch[2]
      .split(/[,/–]+/)
      .map(c => c.trim())
      .filter(Boolean);

    if (!violations[lastEntity]) violations[lastEntity] = {};
    clauseList.forEach(clause => {
      if (!violations[lastEntity][clause]) violations[lastEntity][clause] = 0;
      violations[lastEntity][clause]++;
    });

    lastEntity = null; // reset after processing
  }
}

// Step 3: Build tables
let summaryTable = `## 🤖 Auto Summary Table\n\n| Entity | Violation Summary | Triggered Clauses | Status |\n|--------|-------------------|-------------------|--------|\n`;
for (const [entity, clauses] of Object.entries(violations)) {
  const clauseList = Object.entries(clauses)
    .map(([c, count]) => `${c} (${count})`)
    .join(', ');
  summaryTable += `| ${entity} | Patterned usage | ${clauseList} | Auto-logged |\n`;
}

let timelineTable = `\n## ⏱ Auto Trigger Timeline\n\n| Entity | Clauses | Last Seen |\n|--------|---------|-----------|\n`;
for (const [entity, clauses] of Object.entries(violations)) {
  const clauseList = Object.keys(clauses).join(', ');
  timelineTable += `| ${entity} | ${clauseList} | [auto] |\n`;
}

// Step 4: Replace old table block
const startMarker = '<!-- START: AutoTables -->';
const endMarker = '<!-- END: AutoTables -->';

const newBlock = `${startMarker}\n\n${summaryTable}\n${timelineTable}\n\n${endMarker}`;

const updated = content.replace(
  new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`),
  newBlock
);

fs.writeFileSync(file, updated);
console.log('✅ Enforcement tables updated and written to enforcement-log.md');

