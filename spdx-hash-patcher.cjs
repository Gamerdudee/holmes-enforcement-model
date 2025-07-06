// SPDX-License-Identifier: Declaratory-Royalty
// Hash: sha256:53ee640d5acf28f07445b129a4ef88a7b540f39045d6dab25b842725f09df80c

// SPDX-License-Identifier: Declaratory-Royalty
// Hash: sha256:6d6b4f8e46a47bc21ae243a50fc80d9c35d2bc038d0e548c2eced6e839f9c0fc

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
  try {
    const diff = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' }).trim();
    if (diff) return diff.split('\n');
  } catch {
    // Fallback: get modified files in working tree (first commit or detached HEAD)
    const modified = execSync('git ls-files -m', { encoding: 'utf8' }).trim();
    if (modified) return modified.split('\n');
  }
  return [];
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

// Step 1: Get changed files from Git
const files = getChangedFiles();

// Step 2: Filter out skipped directories and extensions
const filteredFiles = files.filter(file => {
  const ext = path.extname(file);
  const inSkipDir = skipDirs.some(dir => file.startsWith(`${dir}/`) || file.includes(`/${dir}/`));
  const hasSkipExt = skipExtensions.includes(ext);
  return !inSkipDir && !hasSkipExt;
});

// Step 3: Apply hashing and patch
const summary = [];

filteredFiles.forEach(file => {
  try {
    const hash = computeHash(file);
    patchHash(file, hash);
    summary.push(`${file}: ${hash}`);
  } catch (err) {
    console.warn(`⚠️ Could not patch ${file}: ${err.message}`);
  }
});

// Step 4: Write hash summary
fs.writeFileSync('HEM-hash-summary.txt', summary.join('\n'), 'utf8');
console.log('\n📄 Summary saved to: HEM-hash-summary.txt');
