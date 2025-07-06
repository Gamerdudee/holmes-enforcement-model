// SPDX-License-Identifier: Declaratory-Royalty
// Hash: sha256:5005aa5e8375a37e24c2900527a0102adfa9e79e930f454c4589701f798462d8
// SPDX-License-Identifier: Declaratory-Royalty
// Hash: sha256:<initial_hash_placeholder>

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
    try {
      const modified = execSync('git ls-files -m', { encoding: 'utf8' }).trim();
      if (modified) return modified.split('\n');
    } catch {
      // fallback empty list
    }
  }
  return [];
}

// Normalize content: LF endings, trim trailing whitespace on each line
function normalizeContent(text) {
  return text
    .replace(/\r\n/g, '\n')         // Convert CRLF to LF
    .split('\n')
    .map(line => line.replace(/\s+$/g, '')) // Trim trailing spaces
    .join('\n');
}

function computeContentHashWithoutHashLine(filePath) {
  const contentRaw = fs.readFileSync(filePath, 'utf8');

  // Normalize line endings and trailing whitespace BEFORE removing hash line
  const contentNormalized = normalizeContent(contentRaw);

  const lines = contentNormalized.split('\n');

  // Remove existing hash line(s)
  const filteredLines = lines.filter(line => !/^\s*\/\/\s*Hash:\s*sha256:[a-fA-F0-9]{64}/.test(line));

  const cleanedContent = filteredLines.join('\n');

  const hash = crypto.createHash('sha256').update(cleanedContent).digest('hex');

  return {
    hash,
    cleanedLines: filteredLines,
    originalLines: lines,
    originalContentRaw: contentRaw,
    contentNormalized,
  };
}

function patchHash(filePath) {
  const {
    hash: newHash,
    cleanedLines,
    originalLines,
    originalContentRaw,
    contentNormalized
  } = computeContentHashWithoutHashLine(filePath);

  // Find existing hash line
  const existingHashLine = originalLines.find(line =>
    line.match(/^\s*\/\/\s*Hash:\s*sha256:[a-fA-F0-9]{64}/)
  );

  const currentHash = existingHashLine?.match(/sha256:([a-fA-F0-9]{64})/)?.[1];

  if (currentHash === newHash) {
    console.log(`⏭️  Skipped (hash matches): ${filePath}`);
    return false;
  }

  // Detect SPDX-License line index
  const SPDX_INDEX = originalLines.findIndex(line =>
    line.includes('SPDX-License-Identifier')
  );

  // Insert hash line after SPDX line or at top if not found
  const newLines = [...cleanedLines];
  const hashLine = `// Hash: sha256:${newHash}`;

  if (SPDX_INDEX !== -1) {
    newLines.splice(SPDX_INDEX + 1, 0, hashLine);
  } else {
    newLines.unshift(hashLine);
  }

  // Prepare final content with normalized LF endings and no trailing spaces
  const finalContent = newLines.join('\n') + '\n';  // Add trailing newline for POSIX compliance

  // Compare current file content (normalized) to final content
  const normalizedFinalContent = normalizeContent(finalContent);

  if (contentNormalized === normalizedFinalContent) {
    console.log(`⏭️  Skipped (content identical after normalization): ${filePath}`);
    return false;
  }

  // Debug logging for diffs (optional)
  // You can install 'diff' npm package for better diffs, or just print lengths for now
  console.log(`📝 Updating hash line in: ${filePath}`);
  console.log(` - Old hash: ${currentHash}`);
  console.log(` - New hash: ${newHash}`);

  fs.writeFileSync(filePath, finalContent, 'utf8');
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

