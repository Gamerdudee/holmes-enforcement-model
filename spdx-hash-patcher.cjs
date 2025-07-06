Hash:
`sha256:08773ad3ac331c4a3b1664d7c614d2dda1c2c5b606cc3d80bb9cb7efcfcca48a`

Hash:
`sha256:66e70c11e00c1840975c01224b89eecda17ce5fe930292bc804dec7821e3cee6`

// SPDX-License-Identifier: Declaratory-Royalty


const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const skipDirs = ['node_modules', '.git', '.github', 'mnt/data'];
const skipExtensions = ['.json', '.png', '.jpg', '.jpeg', '.svg'];

function computeHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

function scanDir(dir = '.') {
  const results = [];

  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.includes(entry.name)) results.push(...scanDir(fullPath));
    } else {
      const ext = path.extname(entry.name);
      if (!skipExtensions.includes(ext)) results.push(fullPath);
    }
  });

  return results;
}

function patchFileWithHash(filePath, hash) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const spdxIndex = lines.findIndex(line => line.includes('SPDX-License-Identifier'));
  const existingHashIndex = lines.findIndex(line => line.trim().startsWith('// Hash: sha256:'));

  const hashComment = `// Hash: sha256:${hash}`;

  if (existingHashIndex !== -1) {
    // Replace existing hash
    lines[existingHashIndex] = hashComment;
  } else if (spdxIndex !== -1) {
    // Insert hash below SPDX
    lines.splice(spdxIndex + 1, 0, hashComment);
  } else {
    // No SPDX, append at top
    lines.unshift(hashComment);
  }

  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`✅ Patched ${filePath}`);
}

// 🔁 Run process
console.log(`\n🔍 Scanning and patching...`);
const allFiles = scanDir();
const hashSummary = [];

allFiles.forEach(file => {
  try {
    const hash = computeHash(file);
    patchFileWithHash(file, hash);
    hashSummary.push(`${file}: ${hash}`);
  } catch (err) {
    console.warn(`⚠️ Failed: ${file} – ${err.message}`);
  }
});

// Write master summary
fs.writeFileSync('HEM-hash-summary.txt', hashSummary.join('\n'));
console.log(`\n📄 Summary saved to HEM-hash-summary.txt`);
