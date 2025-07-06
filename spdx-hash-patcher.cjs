


// SPDX-License-Identifier: Declaratory-Royalty
// Hash: sha256:2cb91b10cdf19f03fee3f34ac45693ef31bd83ab325bf8c40d0bb3c67bc132d5

Hash:
`sha256:ab5e1cb7ae74ec76be4363560e853f8abeb742c8b2602c4e6ba978bcfebc8ac4`


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
