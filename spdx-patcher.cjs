// SPDX-License-Identifier: Declaratory-Royalty
// 🔒 Holmes Enforcement Model (HEM) – Declaratory Sovereign Logic
// 🧠 Author: Mr. Holmes
// 📜 License: Declaratory Royalty License (see LICENSE-HEM.md)
// 📁 Repository: https://github.com/Gamerdudee/holmes-enforcement-model

const fs = require('fs');
const path = require('path');

const headers = {
  '.js': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.ts': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.py': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.css': '/* SPDX-License-Identifier: Declaratory-Royalty */',
  '.html': '<!-- SPDX-License-Identifier: Declaratory-Royalty -->',
  '.yml': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.yaml': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.md': `<!--
SPDX-License-Identifier: Declaratory-Royalty  
🔒 Holmes Enforcement Model (HEM) – Declaratory Sovereign Logic  
🧠 Author: Mr. Holmes  
📜 License: Declaratory Royalty License (see LICENSE-HEM.md)  
📁 Repository: https://github.com/Gamerdudee/holmes-enforcement-model  
-->`,
  '.env': '# SPDX-License-Identifier: Declaratory-Royalty',
  '.json': '// SPDX-License-Identifier: Declaratory-Royalty',
  '.txt': '# SPDX-License-Identifier: Declaratory-Royalty'
};

const skipDirs = ['node_modules', '.git', '.github/workflows', 'mnt/data'];

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
      const header = headers[ext];
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

scanAndPatch();

console.log('\n✅ SPDX header patching complete.');
