import fs from 'fs';
import path from 'path';

function searchEnglish(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.git' && file !== '.firebase' && file !== 'dist') {
          results = results.concat(searchEnglish(fullPath));
        }
      } else {
        if (file.includes('영어') || file.toLowerCase().includes('english') || file.toLowerCase().includes('en_')) {
          results.push(fullPath);
        }
      }
    });
  } catch (e) {
    // Ignore errors
  }
  return results;
}

const rootDir = 'C:\\Users\\PARK\\.gemini\\antigravity\\scratch';
console.log(`Searching for English files in ${rootDir}...`);
const found = searchEnglish(rootDir);
console.log(`Found ${found.length} files:`);
found.forEach(f => console.log(`- ${f}`));
