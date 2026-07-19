import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.firebase' && file !== 'dist') {
        results = results.concat(walk(fullPath));
      }
    } else {
      results.push({
        path: path.relative(process.cwd(), fullPath),
        size: stat.size
      });
    }
  });
  return results;
}

const files = walk(process.cwd());
console.log("=== 모든 파일 리스트 (UTF-8) ===");
files.forEach(f => {
  if (f.path.endsWith('.md') || f.path.endsWith('.txt') || f.path.endsWith('.json')) {
    console.log(`- ${f.path} (${f.size} bytes)`);
  }
});
