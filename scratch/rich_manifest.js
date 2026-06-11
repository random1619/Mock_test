const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits';

// Manifest collection and rich metadata parsing logic
function walkAndCollect(dir, baseDir) {
  const files = fs.readdirSync(dir);
  let list = [];
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (file !== '.git' && file !== 'scratch') {
        list = list.concat(walkAndCollect(fullPath, baseDir));
      }
    } else if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.html' || ext === '.pdf') {
        if (file !== 'index.html' && file !== 'index.bak.html' && file !== 'index.old.html') {
          const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
          list.push({
            path: relativePath,
            fullPath: fullPath,
            ext: ext.slice(1)
          });
        }
      }
    }
  }
  return list;
}

console.log('Collecting files and extracting rich metadata...');
const collectedFiles = walkAndCollect(rootDir, rootDir);

const filesArray = [];
const metadataMap = {};

for (const item of collectedFiles) {
  filesArray.push(item.path);
  
  if (item.ext === 'html') {
    try {
      const content = fs.readFileSync(item.fullPath, 'utf8');
      let q = 0;
      let time = 0;
      let marks = 0;
      
      // Try to parse layout with "const test ="
      if (content.includes('const test =')) {
        const qMatch = content.match(/questions:\s*(\d+)/);
        if (qMatch) q = parseInt(qMatch[1]);
        
        const tMatch = content.match(/timer:\s*(\d+)/);
        if (tMatch) time = Math.round(parseInt(tMatch[1]) / 60);
        
        const mMatch = content.match(/marks:\s*(\d+)/);
        if (mMatch) marks = parseInt(mMatch[1]);
      } else {
        // Try parsing layout with "const questions = [...]"
        const qArrMatch = content.match(/const questions = \[\s*([\s\S]*?)\s*\];/);
        if (qArrMatch && qArrMatch[1]) {
          const matches = qArrMatch[1].match(/correct_option_id/g);
          q = matches ? matches.length : 0;
        }
        
        const durationMatch = content.match(/totalDuration\s*=\s*(\d+)/);
        if (durationMatch) {
          time = parseInt(durationMatch[1]);
        }
        
        const marksPerQMatch = content.match(/marksPerQ\s*=\s*([\d.]+)/);
        if (marksPerQMatch && q) {
          marks = Math.round(q * parseFloat(marksPerQMatch[1]));
        }
      }
      
      if (q > 0 || time > 0 || marks > 0) {
        metadataMap[item.path] = { q, time, marks };
      }
    } catch (err) {
      console.warn(`Could not parse metadata for ${item.path}:`, err.message);
    }
  }
}

// Write mocks-manifest.js
const manifestJsContent = `window.MOCKS_MANIFEST = {
  "generatedAt": "${new Date().toISOString()}",
  "files": ${JSON.stringify(filesArray, null, 2)},
  "metadata": ${JSON.stringify(metadataMap, null, 2)}
};`;

fs.writeFileSync(path.join(rootDir, 'mocks-manifest.js'), manifestJsContent, 'utf8');
console.log('mocks-manifest.js regenerated with rich metadata successfully!');

// Write mocks-manifest.json
const manifestJsonContent = JSON.stringify({
  "generatedAt": new Date().toISOString(),
  "files": filesArray,
  "metadata": metadataMap
}, null, 2);

fs.writeFileSync(path.join(rootDir, 'mocks-manifest.json'), manifestJsonContent, 'utf8');
console.log('mocks-manifest.json regenerated with rich metadata successfully!');
