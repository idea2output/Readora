import fs from 'fs';
import path from 'path';

function cleanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      cleanDir(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("export const runtime = 'edge'") || content.includes('export const runtime = "edge"')) {
        content = content.replace(/export const runtime = ['"]edge['"];?\r?\n?/g, '');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Cleaned edge runtime from:', fullPath);
      }
    }
  }
}

cleanDir('src/app/api');
