import fs from 'fs';

const file = 'enforcement-log.md';
const content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');
const violations = {};

let currentEntity = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const entityMatch = line.match(/^###\s+(.*)/);
  if (entityMatch) {
    currentEntity = entityMatch[1].trim();
    continue;
  }

  if (currentEntity) {
    const clauseMatch = line.match(/\*\*Violated Clauses:\*\*\s*(.*)/i);
    if (clauseMatch) {
      const clauses = clauseMatch[1]
        .split(/[,/–]+/)
        .map(c => c.trim())
        .filter(Boolean);

      if (!violations[currentEntity]) violations[currentEntity] = {};
      clauses.forEach(clause => {
        if (!violations[currentEntity][clause]) violations[currentEntity][clause] = 0;
        violations[currentEntity][clause]++;
      });

      currentEntity = null; // Reset once clauses are processed
    }
  }
}

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

const startMarker = '<!-- START: AutoTables -->';
const endMarker = '<!-- END: AutoTables -->';

const newBlock = `${startMarker}\n\n${summaryTable}\n${timelineTable}\n\n${endMarker}`;
const updated = content.replace(
  new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`),
  newBlock
);

fs.writeFileSync(file, updated);
console.log('✅ Enforcement tables updated and written to enforcement-log.md');
