const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits\\Mocks Wallah\\Topic-Concept Tests';
const planPath = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits\\scratch\\rename_plan.json';

if (!fs.existsSync(planPath)) {
  console.error('Error: rename_plan.json does not exist. Run rename_topic_concept.js first.');
  process.exit(1);
}

const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
let renameCount = 0;
let failCount = 0;

console.log('Renaming files on disk in Mocks Wallah/Topic-Concept Tests...');

for (const item of plan) {
  const originalPath = path.join(dir, item.original);
  const proposedPath = path.join(dir, item.proposed);
  
  if (!fs.existsSync(originalPath)) {
    // Already renamed or does not exist
    continue;
  }
  
  if (originalPath === proposedPath) {
    continue;
  }
  
  // Resolve collision if target exists but it is not the original file
  let finalPath = proposedPath;
  if (fs.existsSync(proposedPath)) {
    let baseName = path.basename(item.proposed, '.html');
    let counter = 1;
    while (fs.existsSync(path.join(dir, `${baseName} (${counter}).html`))) {
      counter++;
    }
    finalPath = path.join(dir, `${baseName} (${counter}).html`);
  }
  
  try {
    fs.renameSync(originalPath, finalPath);
    renameCount++;
  } catch (err) {
    console.error(`Error renaming "${item.original}" -> "${path.basename(finalPath)}":`, err.message);
    failCount++;
  }
}

console.log(`Successfully renamed ${renameCount} files. Fails: ${failCount}`);

// Generate new manifest lists
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
          // Get relative path with forward slashes
          const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
          list.push(relativePath);
        }
      }
    }
  }
  return list;
}

const rootDir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits';
console.log('Collecting files for manifest...');
const allFiles = walkAndCollect(rootDir, rootDir);

// Write mocks-manifest.js
const manifestJsContent = `window.MOCKS_MANIFEST = {
  "generatedAt": "${new Date().toISOString()}",
  "files": ${JSON.stringify(allFiles, null, 2)}
};`;

fs.writeFileSync(path.join(rootDir, 'mocks-manifest.js'), manifestJsContent, 'utf8');
console.log('mocks-manifest.js regenerated successfully!');

// Write mocks-manifest.json
const manifestJsonContent = JSON.stringify({
  "generatedAt": new Date().toISOString(),
  "files": allFiles
}, null, 2);

fs.writeFileSync(path.join(rootDir, 'mocks-manifest.json'), manifestJsonContent, 'utf8');
console.log('mocks-manifest.json regenerated successfully!');
