const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits';
const extractedFeaturesPath = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits\\.agents\\explorer_init_2\\extracted_features.json';
const features = JSON.parse(fs.readFileSync(extractedFeaturesPath, 'utf8'));

let countWithPause = 0;
let countWithoutPause = 0;
const missingPauseFiles = [];

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
    
    const content = fs.readFileSync(path.join(rootDir, item.path), 'utf8');
    
    const hasToggle = content.includes('id="themeToggle"') || content.includes("id='themeToggle'") ||
                      content.includes('id="theme-toggle"') || content.includes("id='theme-toggle'") ||
                      content.includes('id="themeBtn"') || content.includes("id='themeBtn'");
                      
    if (!hasToggle) {
        if (content.includes('id="pauseBtn"') || content.includes("id='pauseBtn'")) {
            countWithPause++;
        } else {
            countWithoutPause++;
            missingPauseFiles.push(item.path);
        }
    }
}

console.log(`Missing toggle files: ${countWithPause + countWithoutPause}`);
console.log(`Of those, files WITH #pauseBtn: ${countWithPause}`);
console.log(`WITH OUT #pauseBtn: ${countWithoutPause}`);
if (missingPauseFiles.length > 0) {
    console.log('Sample files without #pauseBtn:', missingPauseFiles.slice(0, 10));
}
