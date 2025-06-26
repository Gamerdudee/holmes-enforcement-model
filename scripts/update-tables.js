import fs from 'fs';

const file = 'enforcement-log.md';
const content = fs.readFileSync(file, 'utf8');

const entityRegex = /^###\s+(.*?)$/gm;
const clauseRegex = /\*\*Violated Clauses:\*\*\s*([^\n]+)/i;

const violations = {};
let entityMatch;

while ((entityMatch = entityRegex.exec(content)) !== null) {
  const entity = entityMatch[1].trim();
  const startIndex = entityMatch.index;
  const nextEntityMatch = entityRegex.exec(content);
  const endIndex = nextEntityMatch ? nextEntityMatch.index : content.length;
  const section = content.slice(startIndex, endIndex);

  const clauseLine = clauseRegex.exec(section);
  if (!clauseLine) continue;

  const clauses = clauseLine[1]
    .split(/[,/–]+/)
    .map(c => c.trim())
    .filter(Boolean);

  if (!violations[entity]) violations[entity] = {};
  clauses.forEach(clause => {
    if (!violations[entity][clause]) violations[entity][clause] = 0;
    violations[entity][clause]++;
  });
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
console.log('✅ Enforcement tables updated.');
console.log("✅ Auto summary tables updated and written to enforcement-log.md");
