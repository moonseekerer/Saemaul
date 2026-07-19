import fs from 'fs';
import path from 'path';

const desktopDir = 'C:\\Users\\PARK\\Desktop';
console.log("Desktop directory exists:", fs.existsSync(desktopDir));
if (fs.existsSync(desktopDir)) {
  const files = fs.readdirSync(desktopDir);
  console.log("Total files on Desktop:", files.length);
  files.forEach(f => {
    console.log(`- ${f}`);
  });
}
