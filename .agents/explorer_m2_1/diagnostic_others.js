const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits';
const extractedFeaturesPath = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits\\.agents\\explorer_init_2\\extracted_features.json';
const features = JSON.parse(fs.readFileSync(extractedFeaturesPath, 'utf8'));
const others = [];

for (const item of features) {
    const p = item.path.toLowerCase();
    const n = path.basename(item.path).toLowerCase();
    
    let style = 'CBTExam';
    if (p.includes('topic-concept tests') || n.includes('concept test') || p.includes('sectional tests/maths & reasoning')) {
        style = 'Topic-Concept Tests';
    } else if (p.includes('daily quiz') || n.includes('daily quiz')) {
        style = 'Daily Quiz';
    } else if (p.startsWith('mocks wallah/') || n.includes('mocks wallah')) {
        style = 'Mocks Wallah';
    }
    
    if ((style === 'CBTExam' || style === 'Daily Quiz') && !item.path.startsWith('English Madhyam/')) {
        const content = fs.readFileSync(path.join(rootDir, item.path), 'utf8');
        if (!content.includes('id="themeToggle"') && !content.includes("id='themeToggle'")) {
            others.push(item.path);
        }
    }
}

console.log('Non-English Madhyam files without toggle count:', others.length);
if (others.length > 0) {
    console.log('Sample files:', others.slice(0, 10));
}
