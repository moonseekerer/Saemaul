import fs from 'fs';
import path from 'path';

function searchKeyword(dir, keyword) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.git' && file !== '.firebase' && file !== 'dist') {
          results = results.concat(searchKeyword(fullPath, keyword));
        }
      } else {
        if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.html')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes(keyword)) {
            results.push({
              file: fullPath,
              lineCount: content.split('\n').filter(l => l.includes(keyword)).length
            });
          }
        }
      }
    });
  } catch (e) {}
  return results;
}

const rootDir = 'C:\\Users\\PARK\\.gemini\\antigravity\\scratch';
console.log(`Searching in ${rootDir}...`);
const res1 = searchKeyword(rootDir, 'reader');
const res2 = searchKeyword(rootDir, '10years');

console.log("\n=== Found 'reader' ===");
res1.forEach(r => console.log(`- ${r.file} (${r.lineCount} occurrences)`));

console.log("\n=== Found '10years' ===");
res2.forEach(r => console.log(`- ${r.file} (${r.lineCount} occurrences)`));
