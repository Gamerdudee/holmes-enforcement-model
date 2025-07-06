Hash:
`sha256:66d39aea1177176468da1f1eac47bf55a2780e86efdd2fef407d216931acb505`


// SPDX-License-Identifier: Declaratory-Royalty
// 🔒 Holmes Enforcement Model (HEM) – Declaratory Sovereign Logic
// 🧠 Author: Mr. Holmes
// 📜 License: Declaratory Royalty License (see LICENSE-HEM.md)
// 📁 Repository: https://github.com/Gamerdudee/holmes-enforcement-model

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const skipDirs = ['node_modules', 'mnt/data', '.git', '.github'];
const HASH_LABEL = 'Hash:';

const trackedExtensions = {
  '.js': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.ts': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.jsx': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.tsx': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.mjs': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.cjs': '// SPDX-License-Identifier: Declaratory-Royalty',

  '.py': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.sh': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.rb': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.pl': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.go': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.rs': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.java': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.kt': '// SPDX-License-Identifier: Declaratory-Royalty',

  '.cpp': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.cc': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.c': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.h': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.hpp': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.cs': '// SPDX-License-Identifier: Declaratory-Royalty',

  '.html': '<!-- SPDX-License-Identifier: Declaratory-Royalty -->',
  '.htm': '<!-- SPDX-License-Identifier: Declaratory-Royalty -->',
  '.xml': '<!-- SPDX-License-Identifier: Declaratory-Royalty -->',

  '.md': `<!--
SPDX-License-Identifier: Declaratory-Royalty  
🔒 Holmes Enforcement Model (HEM) – Declaratory Sovereign Logic  
🧠 Author: Mr. Holmes  
📜 License: Declaratory Royalty License (see LICENSE-HEM.md)  
📁 Repository: https://github.com/Gamerdudee/holmes-enforcement-model  
-->`,

  '.css': '/* SPDX-License-Identifier: Declaratory-Royalty */',
  '.scss': '/* SPDX-License-Identifier: Declaratory-Royalty */',
  '.less': '/* SPDX-License-Identifier: Declaratory-Royalty */',

  '.yml': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.yaml': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.toml': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.ini': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.env': '# SPDX-License-Identifier: Declaratory-Royalty',
};

function computeSHA256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function patchFile(fullPath, ext) {
  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;

  // Insert SPDX header if missing
  const spdxHeader = trackedExtensions[ext];
  if (!content.includes('SPDX-License-Identifier')) {
    console.log(`🛠️ Inserting SPDX header: ${fullPath}`);
    content = `${spdxHeader}\n\n${content}`;
  }

  // Generate SHA
  const hash = computeSHA256(content);
  const hashBlock = `${HASH_LABEL}\n\`sha256:${hash}\``;
  const hashRegex = new RegExp(`\\*\\*🧾 Hash Reference.*?\\n\`sha256:.*?\``, 'i');

  if (hashRegex.test(content)) {
    content = content.replace(hashRegex, hashBlock);
  } else {
    content = `${hashBlock}\n\n${content}`;
  }

  // Only write if changed
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Patched SPDX + SHA: ${fullPath}`);
  }
}

function scanDir(dir = '.') {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!skipDirs.includes(entry.name)) scanDir(fullPath);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (trackedExtensions[ext]) {
        try {
          patchFile(fullPath, ext);
        } catch (err) {
          console.warn(`⚠️ Skipped ${fullPath}: ${err.message}`);
        }
      }
    }
  });
}

scanDir();
console.log('\n✅ SPDX + SHA patching complete.');
