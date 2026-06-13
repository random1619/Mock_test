const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits';
const featuresPath = path.join(rootDir, '.agents', 'explorer_init_2', 'extracted_features.json');

if (!fs.existsSync(featuresPath)) {
    console.error('extracted_features.json not found!');
    process.exit(1);
}

const features = JSON.parse(fs.readFileSync(featuresPath, 'utf8'));

// Classification logic same as summarize_features.js
const targetFiles = features.filter(item => {
    const p = item.path.toLowerCase();
    const n = path.basename(item.path).toLowerCase();
    
    // Topic-Concept Tests
    if (p.includes('topic-concept tests') || n.includes('concept test') || p.includes('sectional tests/maths & reasoning')) {
        return false;
    }
    // Daily Quiz
    if (p.includes('daily quiz') || n.includes('daily quiz')) {
        return true;
    }
    // Mocks Wallah
    if (p.startsWith('mocks wallah/') || n.includes('mocks wallah')) {
        return false;
    }
    // CBTExam
    return true;
});

console.log(`Total target files (CBTExam + Daily Quiz): ${targetFiles.length}`);

let stats = {
    total: targetFiles.length,
    hasThemeToggle: 0,
    hasThemeBtn: 0,
    hasNoThemeButton: 0,
    hasSetupThemeToggle: 0,
    hasToggleTheme: 0,
    hasHeadTag: 0,
    hasBodyTag: 0,
    themeToggleLocations: {},
    byFolder: {}
};

targetFiles.forEach(item => {
    const fullPath = path.join(rootDir, item.path);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    const folder = item.path.split('/')[0];
    if (!stats.byFolder[folder]) {
        stats.byFolder[folder] = { total: 0, hasThemeToggle: 0, hasThemeBtn: 0, hasNoThemeButton: 0 };
    }
    stats.byFolder[folder].total++;

    const hasToggle = content.includes('id="themeToggle"') || content.includes("id='themeToggle'");
    const hasBtn = content.includes('id="themeBtn"') || content.includes("id='themeBtn'");
    
    if (hasToggle) {
        stats.hasThemeToggle++;
        stats.byFolder[folder].hasThemeToggle++;
    } else if (hasBtn) {
        stats.hasThemeBtn++;
        stats.byFolder[folder].hasThemeBtn++;
    } else {
        stats.hasNoThemeButton++;
        stats.byFolder[folder].hasNoThemeButton++;
    }

    if (content.includes('setupThemeToggle')) stats.hasSetupThemeToggle++;
    if (content.includes('toggleTheme')) stats.hasToggleTheme++;
    if (content.includes('<head>')) stats.hasHeadTag++;
    if (content.includes('<body>')) stats.hasBodyTag++;

    // Let's find context around themeToggle
    if (hasToggle) {
        const lines = content.split('\n');
        const toggleLineIdx = lines.findIndex(l => l.includes('id="themeToggle"') || l.includes("id='themeToggle'"));
        if (toggleLineIdx !== -1) {
            const context = lines.slice(Math.max(0, toggleLineIdx - 2), toggleLineIdx + 3).map(l => l.trim()).join(' | ');
            if (!stats.themeToggleLocations[context]) {
                stats.themeToggleLocations[context] = 0;
            }
            stats.themeToggleLocations[context]++;
        }
    }
});

console.log(JSON.stringify(stats, null, 2));
