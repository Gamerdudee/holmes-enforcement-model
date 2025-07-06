Hash:
`sha256:08773ad3ac331c4a3b1664d7c614d2dda1c2c5b606cc3d80bb9cb7efcfcca48a`

Hash:
`sha256:66e70c11e00c1840975c01224b89eecda17ce5fe930292bc804dec7821e3cee6`

// SPDX-License-Identifier: Declaratory-Royalty


const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const hashFiles = [];
const hashMap = {};
const skipDirs = ['node_modules', '.git', '.github', 'mnt/data'];
const skipExtensions = ['.json'];

function computeHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

function scanDir(dir = '.') {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.includes(entry.name)) scanDir(fullPath);
    } else {
      const ext = path.extname(entry.name);
      if (!skipExtensions.includes(ext)) {
        try {
          const hash = computeHash(fullPath);
          hashFiles.push(fullPath);
          hashMap[fullPath] = hash;
        } catch (err) {
          console.warn(`⚠️ Skipped ${fullPath}: ${err.message}`);
        }
      }
    }
  });
}

// Run hash scan
scanDir();

// Output results
console.log(`\n🧾 SHA-256 Hashes:\n`);
Object.entries(hashMap).forEach(([file, hash]) => {
  console.log(`📁 ${file}: ${hash}`);
});

// Optional: write summary to file
const summaryPath = 'HEM-hash-summary.txt';
fs.writeFileSync(summaryPath, Object.entries(hashMap).map(([file, hash]) => `${file}: ${hash}`).join('\n'));
console.log(`\n✅ Hash summary saved to: ${summaryPath}`);
