const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits\\Mocks Wallah\\Topic-Concept Tests';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && fs.statSync(path.join(dir, f)).isFile());

console.log(`Found ${files.length} files to classify and move.`);

const categories = {
  'Quant': [
    'geometry', 'algebra', 'math', 'number system', 'arithmetic', 'trigonometry', 'solvers',
    'percentage', 'profit', 'loss', 'discount', 'interest', 'si ', 'ci ', 'ratio',
    'proportion', 'partnership', 'mixture', 'alligation', 'average', 'time & work', 'time, work', 'pipe',
    'cistern', 'speed', 'distance', 'train', 'boat', 'stream', 'hcf', 'lcm',
    'simplification', 'square practice', 'cube practice'
  ],
  'Reasoning': [
    'reasoning', 'analogy', 'coding', 'decoding', 'missing number', 'series', 'odd one out', 'direction',
    'blood relation', 'sitting', 'seating', 'arrangement', 'ranking', 'order', 'syllogism', 'venn',
    'dice', 'clock', 'calendar', 'matrix', 'paper folding', 'mirror image', 'water image',
    'embedded figure', 'pattern completion', 'mathematical operation', 'word formation', 'word arrangement'
  ],
  'English': [
    'english', 'editorial', 'comprehension', 'vocabulary', 'passive', 'verb', 'noun', 'pronoun',
    'preposition', 'conjunction', 'tense', 'grammar', 'adjective', 'adverb', 'synonym', 'antonym',
    'one word', 'idiom', 'phrase', 'spelling', 'cloze', 'jumbled', 'para', 'spelt'
  ],
  'General Awareness': [
    'polity', 'history', 'geography', 'economics', 'biology', 'chemistry', 'physics', 'articles',
    'constitution', 'empire', 'criminal law', 'sultanate', 'literature', 'dynasty', 'revolt',
    'reform', 'congress', 'optics', 'mechanics', 'gravitation', 'thermodynamics', 'sound', 'waves',
    'electricity', 'discoveries', 'general awareness', 'slogans', 'nicknames', 'newspapers', 'c&ag',
    'citizenship', 'preamble', 'mughals', 'famous', 'national symbols', 'ancient', 'medieval', 'modern'
  ],
  'Concept Tests': [
    'concept test'
  ]
};

let moveCount = 0;

for (const file of files) {
  const lowercase = file.toLowerCase();
  let targetFolder = 'Misc';
  
  // Determine folder based on keywords
  for (const [folder, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowercase.includes(keyword))) {
      targetFolder = folder;
      break;
    }
  }
  
  // If target folder is still Misc, check if it's one of the SSC CGL mock tests
  if (targetFolder === 'Misc') {
    if (lowercase.includes('cgl') || lowercase.includes('ssc')) {
      targetFolder = 'Full Length Mocks';
    }
  }
  
  const targetDir = path.join(dir, targetFolder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const sourcePath = path.join(dir, file);
  const destPath = path.join(targetDir, file);
  
  try {
    fs.renameSync(sourcePath, destPath);
    moveCount++;
  } catch (err) {
    console.error(`Failed to move "${file}" to "${targetFolder}":`, err.message);
  }
}

console.log(`Moved ${moveCount} files successfully into subdirectories!`);

// Manifest regeneration logic
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
