// SPDX-License-Identifier: Declaratory-Royalty
// 🧠 SPDX Read-only Scanner
// 📁 Repository: https://github.com/Gamerdudee/holmes-enforcement-model

const fs = require('fs');
const path = require('path');

const scannedExtensions = ['.js', '.ts', '.md', '.yml', '.yaml', '.html', '.css', '.py', '.json', '.txt', '.env'];
const skipDirs = ['node_modules', 'mnt/data', '.git'];

let scanned = 0;
let passed = 0;
let failedFiles = [];

function checkForSPDX(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.includes('SPDX-License-Identifier');
}

function scanDirectory(dir = '.') {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !skipDirs.includes(entry.name)) {
      scanDirectory(fullPath);
    } else {
      const ext = path.extname(entry.name);
      if (scannedExtensions.includes(ext)) {
        scanned++;
        try {
          if (checkForSPDX(fullPath)) {
            passed++;
          } else {
            failedFiles.push(fullPath);
          }
        } catch (err) {
          console.warn(`⚠️ Failed to scan ${fullPath}: ${err.message}`);
        }
      }
    }
  });
}

scanDirectory();

const result = `# SPDX Scorecard – Holmes Enforcement Model (HEM)

**Scan Date:** ${new Date().toISOString()}
**Total Files Scanned:** ${scanned}
**Compliant Files:** ${passed}
**Non-Compliant Files:** ${failedFiles.length}

---

${failedFiles.length > 0 ? '🚫 Files missing SPDX headers:' : '✅ All scanned files are compliant.'}

${failedFiles.map(file => `- ${file}`).join('\n')}
`;

fs.writeFileSync('scorecard.md', result);
console.log(result);
