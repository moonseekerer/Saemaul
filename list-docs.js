import fs from 'fs';
import path from 'path';

const docsDir = path.join(process.cwd(), 'public', 'docs');
const files = fs.readdirSync(docsDir);

console.log("=== public/docs 폴더 내의 모든 파일 ===");
files.sort().forEach(f => {
  console.log(`- ${f}`);
});
