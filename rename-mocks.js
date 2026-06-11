const fs = require('fs');
const path = require('path');

// Cleaner filename engine
function cleanFileName(originalName) {
  let ext = path.extname(originalName);
  let base = path.basename(originalName, ext);
  
  // Clean underscores and leading symbol prefix
  base = base.replace(/_/g, ' ').replace(/^@/, '');
  
  // Remove branding prefixes case-insensitively
  base = base.replace(/^ob\s+ssc\s+cgl\s+\d*\s*/i, '');
  base = base.replace(/^ob\s+ssc\s+cgl\s+/i, '');
  base = base.replace(/^ob\s+cgl\s+/i, '');
  base = base.replace(/^ob\s+/i, '');
  base = base.replace(/^mocks\s+wallah\s+/i, '');
  base = base.replace(/^the\s+solvers\s+/i, '');
  base = base.replace(/^testbook\s+/i, '');
  base = base.replace(/^pundits\s+/i, '');
  base = base.replace(/^english\s+madhyam\s+/i, '');
  base = base.replace(/^aman\s+sir\s+/i, '');
  
  // Standardize Tier representations
  base = base.replace(/tierii/i, 'Tier II');
  base = base.replace(/tier2/i, 'Tier II');
  base = base.replace(/tier1/i, 'Tier I');
  base = base.replace(/tier\s*i\b/i, 'Tier I');
  base = base.replace(/tier\s*ii\b/i, 'Tier II');
  
  // Remove multiple whitespaces
  base = base.replace(/\s+/g, ' ').trim();
  
  // Capitalize properly
  base = base.split(' ').map(w => {
    if (/^(pre|post|vs|and|or|for|of|in|on|at|to|by|with)$/i.test(w)) return w.toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
  
  if (!base) {
    base = "Mock Test";
  }
  
  return base + ext;
}

// Keep track of renames
let renameCount = 0;
let failCount = 0;

function walkAndRename(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (file !== '.git' && file !== 'scratch') {
        walkAndRename(fullPath);
      }
    } else if (stat.isFile() && file.endsWith('.html')) {
      // Exclude main index files
      if (file !== 'index.html' && file !== 'index.bak.html' && file !== 'index.old.html') {
        const cleanedName = cleanFileName(file);
        if (file !== cleanedName) {
          const targetPath = path.join(dir, cleanedName);
          
          // Avoid overwriting existing files
          let finalPath = targetPath;
          if (fs.existsSync(targetPath)) {
            let baseName = path.basename(cleanedName, '.html');
            let counter = 1;
            while (fs.existsSync(path.join(dir, `${baseName} (${counter}).html`))) {
              counter++;
            }
            finalPath = path.join(dir, `${baseName} (${counter}).html`);
          }
          
          try {
            fs.renameSync(fullPath, finalPath);
            renameCount++;
          } catch (err) {
            console.warn(`Warning: Could not rename "${file}" to "${path.basename(finalPath)}" (resource busy/locked)`);
            failCount++;
          }
        }
      }
    }
  }
}

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

console.log('Renaming files on disk...');
walkAndRename(__dirname);
console.log(`Successfully renamed ${renameCount} mock HTML files! (${failCount} busy files skipped)`);

console.log('Collecting files for manifest...');
const allFiles = walkAndCollect(__dirname, __dirname);

// Write mocks-manifest.js
const manifestJsContent = `window.MOCKS_MANIFEST = {
  "generatedAt": "${new Date().toISOString()}",
  "files": ${JSON.stringify(allFiles, null, 2)}
};`;

fs.writeFileSync(path.join(__dirname, 'mocks-manifest.js'), manifestJsContent, 'utf8');
console.log('mocks-manifest.js regenerated successfully!');

// Write mocks-manifest.json
const manifestJsonContent = JSON.stringify({
  "generatedAt": new Date().toISOString(),
  "files": allFiles
}, null, 2);

fs.writeFileSync(path.join(__dirname, 'mocks-manifest.json'), manifestJsonContent, 'utf8');
console.log('mocks-manifest.json regenerated successfully!');
