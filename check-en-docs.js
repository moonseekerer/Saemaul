import fs from 'fs';
import path from 'path';

const docsDir = path.join(process.cwd(), 'public', 'docs');
if (fs.existsSync(docsDir)) {
  const files = fs.readdirSync(docsDir);
  console.log("Docs directory exists. Total files:", files.length);
  const englishFiles = files.filter(f => f.includes('영어') || f.includes('english') || f.includes('en'));
  console.log("English files found:", englishFiles.length);
  englishFiles.forEach(f => console.log(`- ${f}`));
} else {
  console.log("Docs directory does not exist:", docsDir);
}
