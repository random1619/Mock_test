const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits\\Mocks Wallah\\Topic-Concept Tests';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const records = [];

for (const file of files) {
  const fullPath = path.join(dir, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  const hasTest = content.includes('const test =');
  let sectionName = '';
  if (hasTest) {
    const secNameMatch = content.match(/"name":\s*"([^"]+)"/);
    if (secNameMatch) {
      sectionName = secNameMatch[1];
    }
  }

  // Detect language: does the filename contain ' Hn ' or '-hi' or does the content default isEnglish = false?
  let lang = '';
  if (file.toLowerCase().includes(' hn ') || file.toLowerCase().includes('-hi') || file.toLowerCase().includes(' hi.')) {
    lang = 'Hindi';
  } else if (file.toLowerCase().includes(' en ') || file.toLowerCase().includes('-en') || file.toLowerCase().includes(' en.')) {
    lang = 'English';
  }
  
  records.push({
    file,
    title,
    sectionName,
    hasTest,
    lang
  });
}

// Group by sectionName or title patterns to see what we have
const groups = {};
for (const r of records) {
  const key = r.sectionName || r.title || 'Empty/Other';
  if (!groups[key]) groups[key] = [];
  groups[key].push(r);
}

console.log('TOTAL FILES:', files.length);
console.log('UNIQUE GROUPS:', Object.keys(groups).length);

// Print the group keys and how many files are in each
const sortedGroups = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
console.log('TOP GROUPS BY COUNT:');
for (const [name, list] of sortedGroups.slice(0, 50)) {
  console.log(`- "${name}": ${list.length} files (e.g. "${list[0].file}")`);
}
