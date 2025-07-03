// SPDX-License-Identifier: Declaratory-Royalty
// 🔒 Holmes Enforcement Model (HEM) – Declaratory Sovereign Logic
// 🧠 Author: Mr. Holmes
// 📜 License: Declaratory Royalty License (see LICENSE-HEM.md)
// 📁 Repository: https://github.com/Gamerdudee/holmes-enforcement-model

const fs = require('fs');
const path = require('path');

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
-->

`,

  '.css': '/* SPDX-License-Identifier: Declaratory-Royalty */',
  '.scss': '/* SPDX-License-Identifier: Declaratory-Royalty */',
  '.less': '/* SPDX-License-Identifier: Declaratory-Royalty */',

  '.yml': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.yaml': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.json': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.toml': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.ini': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.env': '# SPDX-License-Identifier: Declaratory-Royalty',
};

function insertHeaderIfMissing(filePath, header) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Avoid injecting into binary or already-compliant files
  if (content.includes('SPDX-License-Identifier')) return;

  console.log(`🛠️ Inserting SPDX header into: ${filePath}`);
  fs.writeFileSync(filePath, `${header}\n${content}`);
}

function scanDir(dir = '.') {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!skipDirs.includes(entry.name)) {
        scanDir(fullPath);
      }
    } else {
      const ext = path.extname(entry.name);
      const header = trackedExtensions[ext];
      if (header) {
        try {
          insertHeaderIfMissing(fullPath, header);
        } catch (err) {
          console.warn(`⚠️ Skipped ${fullPath}: ${err.message}`);
        }
      }
    }
  });
}

scanDir();
console.log('\n✅ SPDX header patching complete.');

