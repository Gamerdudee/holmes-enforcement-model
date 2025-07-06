// SPDX-License-Identifier: Declaratory-Royalty
// Hash: sha256:a3f54b0f83a84d24a5450fbb34d736ce3a53cb94db9e755b2563ae394843561a

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
    const modified = execSync('git ls-files -m', { encoding: 'utf8' }).trim();
    if (modified) return modified.split('\n');
  }
  return [];
}

function patchHash(filePath, newHash) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const SPDX_INDEX = lines.findIndex(l => l.includes('SPDX-License-Identifier'));
  const HASH_LINE_REGEX = /^\s*\/\/\s*Hash:\s*sha256:([a-fA-F0-9]{64})/;

  // Check if file already has correct hash
  const currentHashLineIndex = lines.findIndex(line => HASH_LINE_REGEX.test(line));
  if (currentHashLineIndex !== -1) {
    const currentHashMatch = lines[currentHashLineIndex].match(HASH_LINE_REGEX);
    const currentHash = currentHashMatch?.[1];

    if (currentHash === newHash) {
      console.log(`⏭️  Skipped (unchanged): ${filePath}`);
      return false; // No change needed
    }
  }

  // Remove all previous hash lines
  const cleanedLines = lines.filter(line => !HASH_LINE_REGEX.test(line));

  const hashLine = `// Hash: sha256:${newHash}`;
  if (SPDX_INDEX !== -1) {
    cleanedLines.splice(SPDX_INDEX + 1, 0, hashLine);
  } else {
    cleanedLines.unshift(hashLine);
  }

  fs.writeFileSync(filePath, cleanedLines.join('\n'), 'utf8');
  console.log(`✅ Patched: ${filePath}`);
  return true;
}

console.log('🔍 Scanning modified files...');
const files = getChangedFiles();

const filteredFiles = files.filter(file => {
  const ext = path.extname(file);
  const inSkipDir = skipDirs.some(dir => file.startsWith(`${dir}/`) || file.includes(`/${dir}/`));
  const hasSkipExt = skipExtensions.includes(ext);
  return !inSkipDir && !hasSkipExt;
});

const summary = [];

filteredFiles.forEach(file => {
  try {
    const hash = computeHash(file);
    const updated = patchHash(file, hash);
    if (updated) {
      summary.push(`${file}: ${hash}`);
    }
  } catch (err) {
    console.warn(`⚠️ Could not patch ${file}: ${err.message}`);
  }
});

fs.writeFileSync('HEM-hash-summary.txt', summary.join('\n'), 'utf8');
console.log('\n📄 Summary saved to: HEM-hash-summary.txt');
