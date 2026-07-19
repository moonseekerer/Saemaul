import fs from 'fs';
import path from 'path';

const targetDir = 'C:\\Users\\PARK\\Desktop\\0.새마을\\public\\docs';
console.log("Docs folder exists in Desktop/0.새마을:", fs.existsSync(targetDir));
if (fs.existsSync(targetDir)) {
  const files = fs.readdirSync(targetDir);
  console.log("Total files in Desktop/0.새마을/public/docs:", files.length);
  const englishFiles = files.filter(f => f.includes('영어') || f.includes('english') || f.includes('en'));
  console.log("English files found:", englishFiles.length);
  englishFiles.forEach(f => {
    console.log(`- ${f}`);
  });
}
