// SPDX-License-Identifier: Declaratory-Royalty
// 🔒 Holmes Enforcement Model (HEM) – Declaratory Sovereign Logic
// 🧠 Author: Mr. Holmes
// 📜 License: Declaratory Royalty License (see LICENSE-HEM.md)
// 📁 Repository: https://github.com/Gamerdudee/holmes-enforcement-model

const fs = require('fs');
const path = require('path');

const HEADER_COMMENT_JS = `// SPDX-License-Identifier: Declaratory-Royalty`;
const HEADER_COMMENT_MD = `<!--\nSPDX-License-Identifier: Declaratory-Royalty  \n\uD83D\uDD12 Holmes Enforcement Model (HEM) – Declaratory Sovereign Logic  \n\uD83E\uDDE0 Author: Mr. Holmes  \n\uD83D\uDCDC License: Declaratory Royalty License (see LICENSE-HEM.md)  \n\uD83D\uDCC1 Repository: https://github.com/Gamerdudee/holmes-enforcement-model  \n-->\n\n`;
const HEADER_COMMENT_YML = `# SPDX-License-Identifier: Declaratory-Royalty`;
const HEADER_COMMENT_HTML = `<!-- SPDX-License-Identifier: Declaratory-Royalty -->`;

const trackedExtensions = {
  '.js': HEADER_COMMENT_JS,
  '.ts': HEADER_COMMENT_JS,
  '.md': HEADER_COMMENT_MD,
  '.yml': HEADER_COMMENT_YML,
  '.yaml': HEADER_COMMENT_YML,
  '.html': HEADER_COMMENT_HTML,
  '.css': HEADER_COMMENT_JS,
  '.py': '# SPDX-License-Identifier: Declaratory-Royalty'
};

// You can keep these to skip top-level common dirs if you want
const skipDirs = ['node_modules', 'mnt/data', '.git'];

function insertHeaderIfMissing(filePath, header) {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes('SPDX-License-Identifier')) {
    console.log(`🛠️ Inserting SPDX header into: ${filePath}`);
    fs.writeFileSync(filePath, `${header}\n${content}`);
  }
}

function scanAndPatch(dir = '.') {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);

    // **This skips any path that includes .github/workflows anywhere in the path**
    if (fullPath.includes('.github' + path.sep + 'workflows')) {
      // Skip entire workflows directory and files inside it
      return;
    }

    if (entry.isDirectory()) {
      if (!skipDirs.includes(entry.name)) {
        scanAndPatch(fullPath);
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

scanAndPatch();

console.log('\n✅ SPDX header patching complete.');
