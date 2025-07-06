Hash:
`sha256:a29ab00da78b91b76b622dee00d99e28b4abee1af921935d494e1e1937b24e18`

Hash:
`sha256:5078fc2a99909e0156bd7d3673a0c88c9f95b9bcc0f67fe153345a18c586ccf1`

Hash:
`sha256:fe486afcc0a09d6cee0bd81ba6c63f89a4474045dde35d30a1677bb8bfdfb305`

Hash:
`sha256:9434fd08c5f6dfdee1eb6bef6afe4bf2a9d674df244655a81924cc56412a91fc`

Hash:
`sha256:66d39aea1177176468da1f1eac47bf55a2780e86efdd2fef407d216931acb505`


// SPDX-License-Identifier: Declaratory-Royalty
// Hash: sha256:40ec19aa31036c87ecdf9924776ab262f71003968faf4aad14609b17a4a9397b
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

  // Remove old Hash blocks
  content = content.replace(/(^|\n)Hash:\n`sha256:[a-f0-9]{64}`\n?/gi, '');

  const spdxHeader = trackedExtensions[ext];

  // Add SPDX block if missing
  if (!content.includes('SPDX-License-Identifier')) {
    console.log(`🛠️ Inserting SPDX header: ${fullPath}`);
    content = `${spdxHeader}\n\n${content}`;
  }

  // Compute new SHA hash
  const hash = computeSHA256(content);
  const hashBlock = `Hash:\n\`sha256:${hash}\``;

  // Insert Hash block AFTER SPDX block
  const spdxIndex = content.indexOf('SPDX-License-Identifier');
  const insertIndex = content.indexOf('\n', spdxIndex) + 1;
  content = `${content.slice(0, insertIndex)}\n${hashBlock}\n${content.slice(insertIndex)}`;

  // Only write if content changed
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
