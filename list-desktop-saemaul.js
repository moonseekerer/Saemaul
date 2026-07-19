import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else {
        results.push(fullPath);
      }
    });
  } catch (e) {}
  return results;
}

const folders = [
  'C:\\Users\\PARK\\Desktop\\0.새마을',
  'C:\\Users\\PARK\\Desktop\\0.새마l'
];

folders.forEach(folder => {
  console.log(`\n=== Folder: ${folder} ===`);
  if (fs.existsSync(folder)) {
    const files = walk(folder);
    files.forEach(f => {
      console.log(`- ${path.relative(folder, f)} (${fs.statSync(f).size} bytes)`);
    });
  } else {
    console.log("Folder does not exist.");
  }
});
