const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits';
const extractedFeaturesPath = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits\\.agents\\explorer_init_2\\extracted_features.json';
const features = JSON.parse(fs.readFileSync(extractedFeaturesPath, 'utf8'));

const results = {
    cbt: {
        themeToggle: 0,
        theme_toggle: 0,
        themeBtn: 0,
        missing: 0,
        other: []
    },
    dq: {
        themeToggle: 0,
        theme_toggle: 0,
        themeBtn: 0,
        missing: 0,
        other: []
    }
};

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
    
    if (style !== 'CBTExam' && style !== 'Daily Quiz') continue;
    
    const cat = style === 'CBTExam' ? results.cbt : results.dq;
    const content = fs.readFileSync(path.join(rootDir, item.path), 'utf8');
    
    if (content.includes('id="themeToggle"') || content.includes("id='themeToggle'")) {
        cat.themeToggle++;
    } else if (content.includes('id="theme-toggle"') || content.includes("id='theme-toggle'")) {
        cat.theme_toggle++;
    } else if (content.includes('id="themeBtn"') || content.includes("id='themeBtn'")) {
        cat.themeBtn++;
    } else {
        cat.missing++;
        if (cat.other.length < 5) {
            cat.other.push(item.path);
        }
    }
}

console.log('Classify Buttons Results:');
console.log(JSON.stringify(results, null, 2));
