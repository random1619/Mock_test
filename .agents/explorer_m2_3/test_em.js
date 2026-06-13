const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits';
const jsonPath = path.join(rootDir, '.agents', 'explorer_init_2', 'extracted_features.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const punditsNoBtn = data.filter(x => {
    if (!x.path.startsWith('Pundits/')) return false;
    const p = x.path.toLowerCase();
    const n = path.basename(x.path).toLowerCase();
    if (p.includes('topic-concept tests') || n.includes('concept test') || p.includes('sectional tests/maths & reasoning')) {
        return false;
    }
    const full = path.join(rootDir, x.path);
    const content = fs.readFileSync(full, 'utf8');
    return !content.includes('id="themeToggle"') && !content.includes('id="theme-toggle"') && !content.includes('id="themeBtn"');
});

console.log('Pundits files with no button (Total:', punditsNoBtn.length, '):');
punditsNoBtn.slice(0, 3).forEach(x => console.log(x.path));
