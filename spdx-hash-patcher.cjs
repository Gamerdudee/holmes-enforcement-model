// SPDX-License-Identifier: Declaratory-Royalty
// Hash: sha256:14eb599da0f28c0731b312e4615465c945030cc327afe4c68d43d59af179b431

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const skipDirs = ['node_modules', '.git', '.github', 'mnt/data'];
const skipExtensions = ['.json', '.png', '.jpg', '.jpeg', '.svg'];

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

function computeContentHashWithoutHashLine(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const cleaned = lines.filter(line => !/^\s*\/\/\s*Hash:\s*sha256:[a-fA-F0-9]{64}/.test(line));
  const cleanedContent = cleaned.join('\n');

  return {
    hash: crypto.createHash('sha256').update(cleanedContent).digest('hex'),
    cleanedLines: cleaned,
    originalLines: lines
  };
}

function patchHash(filePath) {
  const { hash, cleanedLines, originalLines } = computeContentHashWithoutHashLine(filePath);

  const existingHashLine = originalLines.find(line =>
    line.match(/^\s*\/\/\s*Hash:\s*sha256:[a-fA-F0-9]{64}/)
  );

  const currentHash = existingHashLine?.match(/sha256:([a-fA-F0-9]{64})/)?.[1];

  // If hash is the same, no need to rewrite
  if (currentHash === hash) {
    console.log(`⏭️  Skipped (unchanged): ${filePath}`);
    return false;
  }

  const SPDX_INDEX = originalLines.findIndex(line =>
    line.includes('SPDX-License-Identifier')
  );

  const newLines = [...cleanedLines];
  const hashLine = `// Hash: sha256:${hash}`;

  if (SPDX_INDEX !== -1) {
    newLines.splice(SPDX_INDEX + 1, 0, hashLine);
  } else {
    newLines.unshift(hashLine);
  }

  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  console.log(`✅ Patched: ${filePath}`);
  return true;
}

console.log('🔍 Scanning modified files...');
const files = getChangedFiles();

const filteredFiles = files.filter(file => {
  const ext = path.extname(file);
  const inSkipDir = skipDirs.some(dir => file.startsWith(`${dir}/`) || file.includes(`/${dir}/`));
  const hasSkipExt = skipExtensions.includes(ext);
  return !inSkipDir && !hasSkipExt && fs.existsSync(file);
});

const summary = [];

filteredFiles.forEach(file => {
  try {
    const updated = patchHash(file);
    if (updated) {
      const { hash } = computeContentHashWithoutHashLine(file);
      summary.push(`${file}: ${hash}`);
    }
  } catch (err) {
    console.warn(`⚠️ Could not patch ${file}: ${err.message}`);
  }
});

fs.writeFileSync('HEM-hash-summary.txt', summary.join('\n'), 'utf8');
console.log('\n📄 Summary saved to: HEM-hash-summary.txt');
