const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits\\Mocks Wallah\\Topic-Concept Tests';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

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
  
  // Remove ugly random prefixes like "7515566250 11209 Hn" or "00sob Hn"
  // E.g. "7515566250 11209 Hn Mocks Wallah (1)" -> "Mocks Wallah (1)" -> clean
  // We can strip any leading pattern of digits/letters plus "Hn" or "En"
  base = base.replace(/^\s*[a-z0-9]+\s+[a-z0-9]+\s+(Hn|En)\b/i, '');
  base = base.replace(/^\s*[a-z0-9]+\s+(Hn|En)\b/i, '');
  
  // Remove leftover "Hn" or "En" or "Hn Mocks Wallah (1)"
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
  
  // Clean up any double spaces, commas, or trailing special chars
  base = base.replace(/,\s*,/g, ',');
  base = base.replace(/\s+/g, ' ').trim();
  
  // Remove leading/trailing commas or dashes
  base = base.replace(/^[,\s-]+|[,\s-]+$/g, '');
  
  return base;
}

const plan = [];
let emptyCount = 1;

for (const file of files) {
  const fullPath = path.join(dir, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // 1. Detect language
  const hindi = isHindi(content, file);
  const langSuffix = hindi ? 'Hindi' : 'English';
  
  // 2. Extract internal title
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  let title = titleMatch ? titleMatch[1].trim() : '';
  title = title.replace(/\bdevgagan\b/gi, '').replace(/\bMocks\s+Wallah\b/gi, '').trim();
  if (title === 'CBT Portal' || title === 'Mock Test' || !title) {
    title = '';
  }
  
  // 3. Extract section name
  let sectionName = '';
  const hasTest = content.includes('const test =');
  if (hasTest) {
    const secNameMatch = content.match(/"name":\s*"([^"]+)"/);
    if (secNameMatch) {
      sectionName = secNameMatch[1].trim();
    }
  }
  
  // 4. Extract questions count
  const hasQuestions = content.includes('const questions =');
  let isEmpty = false;
  if (content.includes('const questions = [];') && !hasTest) {
    isEmpty = true;
  }
  
  // Determine proposed name base
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
  
  // Format proposed name
  proposedBase = cleanName(proposedBase);
  if (!proposedBase) {
    proposedBase = 'Topic Test';
  }
  
  // Add language suffix
  const finalProposedName = `${proposedBase} (${langSuffix}).html`;
  
  plan.push({
    original: file,
    proposed: finalProposedName,
    isEmpty,
    title,
    sectionName
  });
}

// Resolve duplicate proposed names
const nameCounts = {};
for (const p of plan) {
  let name = p.proposed;
  if (!nameCounts[name]) {
    nameCounts[name] = [];
  }
  nameCounts[name].push(p);
}

const conflicts = [];
for (const [name, list] of Object.entries(nameCounts)) {
  if (list.length > 1) {
    conflicts.push({ name, count: list.length });
    list.forEach((p, idx) => {
      const base = name.replace(/\.html$/i, '');
      const langMatch = base.match(/\s+\((Hindi|English)\)$/);
      if (langMatch) {
        const lang = langMatch[0]; // " (Hindi)"
        const baseWithoutLang = base.substring(0, base.length - lang.length);
        p.proposed = `${baseWithoutLang} - Part ${idx + 1}${lang}.html`;
      } else {
        p.proposed = `${base} - Part ${idx + 1}.html`;
      }
    });
  }
}

console.log('DRY RUN SAMPLES (First 50):');
plan.slice(0, 50).forEach(p => {
  console.log(`- "${p.original}" -> "${p.proposed}"`);
});

console.log('Total conflicts resolved:', conflicts.length);

fs.writeFileSync('C:\\Users\\gagan\\Downloads\\Mocks\\pundits\\scratch\\rename_plan.json', JSON.stringify(plan, null, 2), 'utf8');
console.log('Written plan to rename_plan.json. Total items:', plan.length);
