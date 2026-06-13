const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits';
const jsonPath = path.join(rootDir, '.agents', 'explorer_init_2', 'extracted_features.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const targets = data.filter(x => {
    const p = x.path.toLowerCase();
    const n = path.basename(x.path).toLowerCase();
    if (p.includes('topic-concept tests') || n.includes('concept test') || p.includes('sectional tests/maths & reasoning')) {
        return false;
    }
    if (p.startsWith('mocks wallah/') || n.includes('mocks wallah')) {
        return false;
    }
    return true;
});

const folderGroups = {};
targets.forEach(x => {
    const folder = x.path.split('/')[0];
    if (!folderGroups[folder]) folderGroups[folder] = [];
    folderGroups[folder].push(x);
});

console.log('--- Brand-by-Brand Layout Analysis ---');
for (const [folder, files] of Object.entries(folderGroups)) {
    console.log(`\nFolder: ${folder} (Total: ${files.length})`);
    
    // Check template structures in this folder
    let hasExamHeader = 0;
    let hasHdrClass = 0;
    let hasMainLayout = 0;
    let hasHeaderClassOnly = 0;
    let hasOther = 0;
    
    let hasCamelToggle = 0;
    let hasDashToggle = 0;
    let hasBtn = 0;
    let hasNoBtn = 0;

    files.forEach(f => {
        const full = path.join(rootDir, f.path);
        const content = fs.readFileSync(full, 'utf8');
        
        if (content.includes('class="exam-header"') || content.includes("class='exam-header'")) {
            hasExamHeader++;
        } else if (content.includes('class="hdr"') || content.includes("class='hdr'")) {
            hasHdrClass++;
        } else if (content.includes('class="main-layout"') || content.includes("class='main-layout'")) {
            hasMainLayout++;
        } else if (content.includes('class="header"') || content.includes("class='header'")) {
            hasHeaderClassOnly++;
        } else {
            hasOther++;
        }

        if (content.includes('id="themeToggle"') || content.includes("id='themeToggle'")) {
            hasCamelToggle++;
        } else if (content.includes('id="theme-toggle"') || content.includes("id='theme-toggle'")) {
            hasDashToggle++;
        } else if (content.includes('id="themeBtn"') || content.includes("id='themeBtn'")) {
            hasBtn++;
        } else {
            hasNoBtn++;
        }
    });

    console.log(`  HTML Elements:`);
    console.log(`    class="exam-header": ${hasExamHeader}`);
    console.log(`    class="hdr": ${hasHdrClass}`);
    console.log(`    class="main-layout": ${hasMainLayout}`);
    console.log(`    class="header": ${hasHeaderClassOnly}`);
    console.log(`    Other structural elements: ${hasOther}`);
    console.log(`  Theme Buttons:`);
    console.log(`    id="themeToggle": ${hasCamelToggle}`);
    console.log(`    id="theme-toggle": ${hasDashToggle}`);
    console.log(`    id="themeBtn": ${hasBtn}`);
    console.log(`    No theme button: ${hasNoBtn}`);
}
