const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits';
const extractedFeaturesPath = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits\\.agents\\explorer_init_2\\extracted_features.json';
const features = JSON.parse(fs.readFileSync(extractedFeaturesPath, 'utf8'));

let cbtTotal = 0;
let cbtWithToggle = 0;
let cbtWithoutToggle = 0;

let dqTotal = 0;
let dqWithToggle = 0;
let dqWithoutToggle = 0;

const cbtNoToggleSamples = [];
const dqNoToggleSamples = [];

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
    
    if (style === 'CBTExam') {
        cbtTotal++;
        const content = fs.readFileSync(path.join(rootDir, item.path), 'utf8');
        if (content.includes('id="themeToggle"') || content.includes("id='themeToggle'")) {
            cbtWithToggle++;
        } else {
            cbtWithoutToggle++;
            if (cbtNoToggleSamples.length < 5) {
                cbtNoToggleSamples.push(item.path);
            }
        }
    } else if (style === 'Daily Quiz') {
        dqTotal++;
        const content = fs.readFileSync(path.join(rootDir, item.path), 'utf8');
        if (content.includes('id="themeToggle"') || content.includes("id='themeToggle'")) {
            dqWithToggle++;
        } else {
            dqWithoutToggle++;
            if (dqNoToggleSamples.length < 5) {
                dqNoToggleSamples.push(item.path);
            }
        }
    }
}

console.log('--- CBTExam Results ---');
console.log(`Total: ${cbtTotal}`);
console.log(`With #themeToggle: ${cbtWithToggle}`);
console.log(`Without #themeToggle: ${cbtWithoutToggle}`);
console.log('No toggle samples:', cbtNoToggleSamples);

console.log('\n--- Daily Quiz Results ---');
console.log(`Total: ${dqTotal}`);
console.log(`With #themeToggle: ${dqWithToggle}`);
console.log(`Without #themeToggle: ${dqWithoutToggle}`);
console.log('No toggle samples:', dqNoToggleSamples);
