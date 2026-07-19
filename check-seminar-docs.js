import fs from 'fs';
import path from 'path';

const seminarDir = 'C:\\Users\\PARK\\.gemini\\antigravity\\scratch\\Saemaulseminar';
console.log("Seminar dir exists:", fs.existsSync(seminarDir));
if (fs.existsSync(seminarDir)) {
  const publicDir = path.join(seminarDir, 'public');
  console.log("Public dir exists:", fs.existsSync(publicDir));
  if (fs.existsSync(publicDir)) {
    const docsDir = path.join(publicDir, 'docs');
    console.log("Docs dir exists:", fs.existsSync(docsDir));
    if (fs.existsSync(docsDir)) {
      const files = fs.readdirSync(docsDir);
      console.log("Files count in seminar docs:", files.length);
      files.filter(f => f.includes('영어')).forEach(f => console.log(`- ${f}`));
    }
  }
}
