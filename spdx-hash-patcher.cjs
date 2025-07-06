Hash:
`sha256:df75e0bb7de3e54b793dc2a4b0f8e6e541f9141bb9c2bac749d10f88b6caf351`

Hash:
`sha256:08773ad3ac331c4a3b1664d7c614d2dda1c2c5b606cc3d80bb9cb7efcfcca48a`

Hash:
`sha256:66e70c11e00c1840975c01224b89eecda17ce5fe930292bc804dec7821e3cee6`

// SPDX-License-Identifier: Declaratory-Royalty
// Hash: sha256:055d8bea70b8d3188df37b19c3e52ac1d2129159ac9d4d88ebf58026f32363a8


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
  let files = [];

  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.includes(entry.name)) {
        files = files.concat(scanDir(fullPath));
      }
    } else {
      const ext = path.extname(entry.name);
      if (!skipExtensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  });

  return files;
}

function patchHash(filePath, hash) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const SPDX_INDEX = lines.findIndex(l => l.includes('SPDX-License-Identifier'));
  const HASH_LINE_REGEX = /^\s*\/\/\s*Hash:\s*sha256:/;

  // Remove old hash lines anywhere in the file
  const cleanedLines = lines.filter(line => !HASH_LINE_REGEX.test(line));

  // Insert hash one line *after* SPDX if SPDX is present
  if (SPDX_INDEX !== -1) {
    cleanedLines.splice(SPDX_INDEX + 1, 0, `// Hash: sha256:${hash}`);
  } else {
    // Otherwise insert at top
    cleanedLines.unshift(`// Hash: sha256:${hash}`);
  }

  fs.writeFileSync(filePath, cleanedLines.join('\n'), 'utf8');
  console.log(`✅ Patched: ${filePath}`);
}

console.log('🔍 Scanning project...');

const files = scanDir();
const summary = [];

files.forEach(file => {
  try {
    const hash = computeHash(file);
    patchHash(file, hash);
    summary.push(`${file}: ${hash}`);
  } catch (err) {
    console.warn(`⚠️ Could not patch ${file}: ${err.message}`);
  }
});

fs.writeFileSync('HEM-hash-summary.txt', summary.join('\n'), 'utf8');
console.log('\n📄 Summary saved to: HEM-hash-summary.txt');
