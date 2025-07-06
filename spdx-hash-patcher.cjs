// SPDX-License-Identifier: Declaratory-Royalty
// Hash: sha256:b4c0277af85141de3af933649d00cc75a494626b39b79d463bf64f772d5473ca

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const skipDirs = ['node_modules', '.git', '.github', 'mnt/data'];
const skipExtensions = ['.json', '.png', '.jpg', '.jpeg', '.svg'];

function computeHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

function getChangedFiles() {
  const output = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });
  return output
    .split('\n')
    .filter(file => file.trim() !== '')
    .filter(file => fs.existsSync(file))
    .filter(file => {
      const ext = path.extname(file);
      return !skipExtensions.includes(ext) && !skipDirs.some(dir => file.startsWith(dir + '/'));
    });
}

function patchHash(filePath, hash) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const SPDX_INDEX = lines.findIndex(l => l.includes('SPDX-License-Identifier'));
  const HASH_LINE_REGEX = /^\s*\/\/\s*Hash:\s*sha256:/;

  // Remove all previous Hash lines
  const cleanedLines = lines.filter(line => !HASH_LINE_REGEX.test(line));

  const hashLine = `// Hash: sha256:${hash}`;
  if (SPDX_INDEX !== -1) {
    cleanedLines.splice(SPDX_INDEX + 1, 0, hashLine);
  } else {
    cleanedLines.unshift(hashLine);
  }

  fs.writeFileSync(filePath, cleanedLines.join('\n'), 'utf8');
  console.log(`✅ Patched: ${filePath}`);
}

console.log('🔍 Scanning modified files...');

const files = getChangedFiles();
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
