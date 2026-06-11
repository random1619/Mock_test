const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits';

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function isHindi(content, filename) {
  if (/[\u0900-\u097F]/.test(content)) return true;
  if (filename.toLowerCase().includes(' hn ') || filename.toLowerCase().includes(' hn(') || filename.toLowerCase().includes('-hi')) return true;
  return false;
}

function cleanName(name) {
  name = decodeHtmlEntities(name);
  
  // Remove file extension
  let base = name.replace(/\.html$/i, '');
  
  // Remove emoji and special symbols
  base = base.replace(/[\u{1F300}-\u{1F9FF}]/gu, ''); // Emojis
  base = base.replace(/[🌻✨🌟💫⭐]/g, ''); // specific flowers/stars
  
  // Remove branding
  base = base.replace(/\bMocks\s+Wallah\b/gi, '');
  base = base.replace(/\bProMocks\b/gi, '');
  base = base.replace(/\bdevgagan\b/gi, '');
  base = base.replace(/\bTeam\s+SPY\b/gi, '');
  base = base.replace(/\bEnglish\s+Madhyam\b/gi, '');
  base = base.replace(/\bOliveboard\b/gi, '');
  base = base.replace(/\bPundits\b/gi, '');
  base = base.replace(/\bTestbook\b/gi, '');
  
  // Remove ugly random prefixes like "7515566250 11209 Hn" or "00sob Hn"
  base = base.replace(/^\s*[a-z0-9]+\s+[a-z0-9]+\s+(Hn|En)\b/i, '');
  base = base.replace(/^\s*[a-z0-9]+\s+(Hn|En)\b/i, '');
  
  // Remove leftover "Hn" or "En"
  base = base.replace(/\b(Hn|En)\b/gi, '');
  base = base.replace(/\(\d+\)/g, ''); // remove parentheses numbers
  
  // Clean up dashes, underscores, double spaces, and slashes
  base = base.replace(/_/g, ' ');
  base = base.replace(/-+/g, ' ');
  base = base.replace(/\//g, ' ');
  base = base.replace(/\s+/g, ' ').trim();
  
  // Standardize Tier representations
  base = base.replace(/tierii/i, 'Tier II');
  base = base.replace(/tier-2/i, 'Tier II');
  base = base.replace(/tier2/i, 'Tier II');
  base = base.replace(/tier\s*ii\b/i, 'Tier II');
  base = base.replace(/tier\s*i\b/i, 'Tier I');
  base = base.replace(/tier1/i, 'Tier I');

  // Title case capitalization
  base = base.split(' ').map(w => {
    if (!w) return '';
    if (/^(pre|post|vs|and|or|for|of|in|on|at|to|by|with)$/i.test(w)) return w.toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
  
  base = base.replace(/,\s*,/g, ',');
  base = base.replace(/\s+/g, ' ').trim();
  base = base.replace(/^[,\s-]+|[,\s-]+$/g, '');
  
  return base;
}

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

function classifyFile(filename) {
  const lowercase = filename.toLowerCase();
  let targetFolder = 'Misc';
  
  for (const [folder, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowercase.includes(keyword))) {
      targetFolder = folder;
      break;
    }
  }
  
  if (targetFolder === 'Misc') {
    if (lowercase.includes('cgl') || lowercase.includes('ssc')) {
      targetFolder = 'Full Length Mocks';
    }
  }
  return targetFolder;
}

// Find all "Topic-Concept Tests" directories recursively
function findTopicConceptDirs(dir) {
  const files = fs.readdirSync(dir);
  let dirs = [];
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (file === 'Topic-Concept Tests') {
        dirs.push(fullPath);
      } else if (file !== '.git' && file !== 'scratch') {
        dirs = dirs.concat(findTopicConceptDirs(fullPath));
      }
    }
  }
  return dirs;
}

const topicConceptDirs = findTopicConceptDirs(rootDir);
console.log('Found Topic-Concept Tests directories:', topicConceptDirs);

let totalRenamed = 0;
let totalMoved = 0;

topicConceptDirs.forEach(dir => {
  console.log(`Processing directory: ${dir}`);
  // Only process files in the ROOT of Topic-Concept Tests (ignore subdirectories already categorized)
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && fs.statSync(path.join(dir, f)).isFile());
  
  if (files.length === 0) {
    console.log(`No files to rename in root of ${dir}`);
    return;
  }
  
  console.log(`Found ${files.length} HTML files in root of ${dir} to process.`);
  
  const plan = [];
  let emptyCount = 1;
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    const hindi = isHindi(content, file);
    const langSuffix = hindi ? 'Hindi' : 'English';
    
    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : '';
    title = title
      .replace(/\bdevgagan\b/gi, '')
      .replace(/\bMocks\s+Wallah\b/gi, '')
      .replace(/\bEnglish\s+Madhyam\b/gi, '')
      .trim();
      
    if (title === 'CBT Portal' || title === 'Mock Test' || !title) {
      title = '';
    }
    
    let sectionName = '';
    const hasTest = content.includes('const test =');
    if (hasTest) {
      const secNameMatch = content.match(/"name":\s*"([^"]+)"/);
      if (secNameMatch) {
        sectionName = secNameMatch[1].trim();
      }
    }
    
    let isEmpty = false;
    if (content.includes('const questions = [];') && !hasTest) {
      isEmpty = true;
    }
    
    let proposedBase = '';
    if (isEmpty) {
      proposedBase = `Concept Test ${String(emptyCount++).padStart(2, '0')}`;
    } else {
      const cleanTitle = cleanName(title);
      const cleanSection = cleanName(sectionName);
      const cleanFile = cleanName(file);
      
      if (cleanTitle && cleanTitle.length > 5 && !/^(Quiz\s*\d+|Mock\s*\d+)$/i.test(cleanTitle)) {
        proposedBase = cleanTitle;
      } else if (cleanSection && cleanSection.length > 5 && !/^(General\s*Awareness|Quantitative\s*Aptitude|English\s*Language|Reasoning)$/i.test(cleanSection)) {
        proposedBase = cleanSection;
        if (cleanTitle && /Quiz\s*\d+/i.test(cleanTitle)) {
          proposedBase += ' ' + cleanTitle.match(/Quiz\s*\d+/i)[0];
        }
      } else if (cleanTitle) {
        proposedBase = cleanTitle;
      } else if (cleanSection) {
        proposedBase = cleanSection;
      } else {
        proposedBase = cleanFile;
      }
    }
    
    proposedBase = cleanName(proposedBase);
    if (!proposedBase) {
      proposedBase = 'Topic Test';
    }
    
    const finalProposedName = `${proposedBase} (${langSuffix}).html`;
    
    plan.push({
      original: file,
      proposed: finalProposedName,
      fullPath
    });
  });
  
  // Resolve conflicts within this folder
  const nameCounts = {};
  plan.forEach(p => {
    const name = p.proposed;
    if (!nameCounts[name]) nameCounts[name] = [];
    nameCounts[name].push(p);
  });
  
  for (const [name, list] of Object.entries(nameCounts)) {
    if (list.length > 1) {
      list.forEach((p, idx) => {
        const base = name.replace(/\.html$/i, '');
        const langMatch = base.match(/\s+\((Hindi|English)\)$/);
        if (langMatch) {
          const lang = langMatch[0];
          const baseWithoutLang = base.substring(0, base.length - lang.length);
          p.proposed = `${baseWithoutLang} - Part ${idx + 1}${lang}.html`;
        } else {
          p.proposed = `${base} - Part ${idx + 1}.html`;
        }
      });
    }
  }
  
  // Execute rename and classification moves
  plan.forEach(p => {
    const renamedPath = path.join(dir, p.proposed);
    try {
      fs.renameSync(p.fullPath, renamedPath);
      totalRenamed++;
      
      // Classify and move
      const categoryFolder = classifyFile(p.proposed);
      const categoryDir = path.join(dir, categoryFolder);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
      
      const finalDest = path.join(categoryDir, p.proposed);
      fs.renameSync(renamedPath, finalDest);
      totalMoved++;
    } catch (err) {
      console.error(`Error processing file ${p.original}:`, err.message);
    }
  });
});

console.log(`Successfully renamed ${totalRenamed} files and moved ${totalMoved} files into subject categories.`);
