// SPDX-License-Identifier: Declaratory-Royalty
// 🧠 SPDX Read-only Scanner
// 📁 Repository: https://github.com/Gamerdudee/holmes-enforcement-model

const fs = require('fs');
const path = require('path');

const scannedExtensions = [
  '.js', '.ts', '.md', '.yml', '.yaml', '.html', '.css',
  '.py', '.json', '.txt', '.env'
];
const skipDirs = ['node_modules', 'mnt/data', '.git', '.github/workflows'];

let scanned = 0;
let passed = 0;
let failedFiles = [];

/**
 * Check if the file contains an SPDX license identifier
 */
function checkForSPDX(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.includes('SPDX-License-Identifier');
}

/**
 * Recursively scan directories for matching file types
 */
function scanDirectory(dir = '.') {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const relativePath = path.relative('.', fullPath);
      if (!skipDirs.some(skip => relativePath.startsWith(skip))) {
        scanDirectory(fullPath);
      }
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

// Run the scan
scanDirectory();

const now = new Date().toISOString();

const result = `# SPDX Scorecard – Holmes Enforcement Model (HEM)

**📅 Scan Date:** ${now}  
**📂 Total Files Scanned:** ${scanned}  
**✅ Compliant Files:** ${passed}  
**❌ Non-Compliant Files:** ${failedFiles.length}

---

${failedFiles.length > 0 ? '🚫 **Files missing SPDX headers:**' : '✅ All scanned files are SPDX-compliant.'}

${failedFiles.map(file => `- ${file}`).join('\n')}
`;

fs.writeFileSync('scorecard.md', result);
console.log('\n' + result);
