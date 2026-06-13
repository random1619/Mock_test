/**
 * patch-theme-toggle.js
 * Recursively patches target CBTExam and Daily Quiz mock exam HTML files to normalize,
 * inject, and style the theme toggle components.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// Verbatim light-theme overrides requested by the user
const lightThemeCSS = `
/* START: Light Theme Stylesheet Overrides */
#themeToggle {
    background: transparent !important;
    border: none !important;
    color: var(--text-light) !important;
    font-size: 18px !important;
    cursor: pointer !important;
    padding: 4px 8px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: color 0.2s ease !important;
}
#themeToggle:hover {
    color: var(--primary) !important;
}
body.light-theme {
    --bg: #f3f4f6 !important;
    --card: #ffffff !important;
    --text: #1f2937 !important;
    --text-light: #6b7280 !important;
    --border: #d1d5db !important;
}
/* Additional override helpers to fix light-theme text colors and avoid white-on-white text */
body.light-theme .exam-header {
    background: #ffffff !important;
    border-bottom: 1px solid var(--border) !important;
}
body.light-theme .exam-title, body.light-theme .exam-timer, body.light-theme .candidate-name {
    color: var(--text) !important;
}
body.light-theme .section-table th, body.light-theme table.section-table th {
    background: rgba(0, 0, 0, 0.05) !important;
    color: var(--text) !important;
}
/* Reset math images filter in light theme so they don't invert */
body.light-theme .question-card img, 
body.light-theme .option img, 
body.light-theme .comprehension img, 
body.light-theme .solution-box img {
    filter: none !important;
}
/* END: Light Theme Stylesheet Overrides */
`;

const headScript = `<!-- START: Injected Theme Toggle Immediate -->
<script id="theme-toggle-handler">
(function() {
    var savedTheme = 'dark';
    try {
        savedTheme = localStorage.getItem('portal-theme') || 'dark';
    } catch (e) {}
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
        var observer = new MutationObserver(function(mutations, obs) {
            if (document.body) {
                document.body.classList.add('light-theme');
                obs.disconnect();
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    document.addEventListener('DOMContentLoaded', function() {
        var btn = document.getElementById('themeToggle');
        if (btn) {
            var newBtn = btn.cloneNode(true);
            newBtn.removeAttribute('onclick');
            btn.parentNode.replaceChild(newBtn, btn);
            
            var currentTheme = 'dark';
            try {
                currentTheme = localStorage.getItem('portal-theme') || 'dark';
            } catch (e) {}
            
            var icon = newBtn.querySelector('i');
            if (icon) {
                icon.className = currentTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
            }
            
            newBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                var isLight = document.body.classList.toggle('light-theme');
                document.documentElement.classList.toggle('light-theme', isLight);
                var nextTheme = isLight ? 'light' : 'dark';
                try {
                    localStorage.setItem('portal-theme', nextTheme);
                } catch (err) {}
                
                var currentIcon = newBtn.querySelector('i');
                if (currentIcon) {
                    currentIcon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
                }
            });
        }
    });
})();
</script>
<!-- END: Injected Theme Toggle Immediate -->
`;

const BUTTON_HTML = `\n                <button class="theme-toggle" id="themeToggle" title="Toggle Theme"><i class="fas fa-moon"></i></button>`;

const stats = {
    totalScanned: 0,
    cbtExamCount: 0,
    dailyQuizCount: 0,
    mocksWallahCount: 0,
    topicConceptCount: 0,
    unclassifiedCount: 0,
    processedCount: 0,
    normalizedCount: 0,
    injectedCount: 0,
    warnings: []
};

// Traverse directory to find target files
function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        if (['node_modules', '.git', 'scratch', 'android', 'www', '.agents'].includes(file)) continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            results = results.concat(walkDir(fullPath));
        } else if (file.endsWith('.html') && !['index.html', 'index.bak.html', 'index.old.html'].includes(file)) {
            results.push(fullPath);
        }
    }
    return results;
}

function classifyFile(filePath) {
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const p = relPath.toLowerCase();
    const n = path.basename(filePath).toLowerCase();

    // 1. Topic-Concept Tests:
    if (p.includes('topic-concept tests') || n.includes('concept test') || p.includes('sectional tests/maths & reasoning')) {
        return 'Topic-Concept Tests';
    }
    // 2. Daily Quiz:
    if (p.includes('daily quiz') || n.includes('daily quiz')) {
        return 'Daily Quiz';
    }
    // 3. Mocks Wallah:
    if (p.startsWith('mocks wallah/') || n.includes('mocks wallah')) {
        return 'Mocks Wallah';
    }
    // 4. CBTExam:
    return 'CBTExam';
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let modified = false;

    // A. Clean up previous injections to maintain idempotence
    content = content.replace(/\/\* START: Light Theme Stylesheet Overrides \*\/[\s\S]*?\/\* END: Light Theme Stylesheet Overrides \*\//g, '');
    content = content.replace(/<!-- START: Injected Theme Toggle Immediate -->[\s\S]*?<!-- END: Injected Theme Toggle Immediate -->\n?/g, '');
    
    // B. ID normalization: replaces theme-toggle and themeBtn with themeToggle
    let normalized = false;
    if (content.includes('id="theme-toggle"') || content.includes("id='theme-toggle'") ||
        content.includes('id="themeBtn"') || content.includes("id='themeBtn'")) {
        content = content.replace(/id=["'](theme-toggle|themeBtn)["']/g, 'id="themeToggle"');
        normalized = true;
        stats.normalizedCount++;
    }

    // C. Head Script Injection: right after opening <head> tag
    content = content.replace(/<head>/i, '<head>\n' + headScript);
    modified = true;

    // D. CSS Stylesheet overrides block injection
    let cssAppended = false;
    const startMarker = '<!-- START: Unified Premium Dark Mode Overrides -->';
    const startIndex = content.indexOf(startMarker);
    if (startIndex !== -1) {
        const closeStyleIndex = content.indexOf('</style>', startIndex);
        if (closeStyleIndex !== -1) {
            content = content.substring(0, closeStyleIndex) + lightThemeCSS + content.substring(closeStyleIndex);
            cssAppended = true;
        }
    }
    if (!cssAppended) {
        const headEndIndex = content.toLowerCase().indexOf('</head>');
        if (headEndIndex !== -1) {
            const headSection = content.substring(0, headEndIndex);
            const lastStyleClose = headSection.lastIndexOf('</style>');
            if (lastStyleClose !== -1) {
                content = content.substring(0, lastStyleClose) + lightThemeCSS + content.substring(lastStyleClose);
                cssAppended = true;
            } else {
                content = content.substring(0, headEndIndex) + `<style>\n${lightThemeCSS}\n</style>\n` + content.substring(headEndIndex);
                cssAppended = true;
            }
        }
    }

    // E. Button Injection if missing #themeToggle
    if (!content.includes('id="themeToggle"') && !content.includes("id='themeToggle'")) {
        let injected = false;
        
        // 1. Check if container class is present
        const containerMatch = content.match(/<[^>]*class=["'](?:exam-timer|header-controls|timer-bar)["'][^>]*>/i);
        if (containerMatch) {
            const containerStart = containerMatch.index;
            const containerWindow = content.substring(containerStart, containerStart + 1000);
            
            if (containerWindow.includes('id="pauseBtn"') || containerWindow.includes("id='pauseBtn'")) {
                const pauseBtnIdx = content.indexOf('id="pauseBtn"', containerStart);
                const altPauseBtnIdx = content.indexOf("id='pauseBtn'", containerStart);
                const actualPauseIdx = (pauseBtnIdx !== -1) ? pauseBtnIdx : altPauseBtnIdx;
                
                if (actualPauseIdx !== -1) {
                    const closeBtnIdx = content.indexOf('</button>', actualPauseIdx);
                    if (closeBtnIdx !== -1) {
                        const insertPos = closeBtnIdx + 9; // length of </button>
                        content = content.substring(0, insertPos) + BUTTON_HTML + content.substring(insertPos);
                        injected = true;
                        stats.injectedCount++;
                    }
                }
            }
        }

        // 2. Otherwise (if container doesn't have #pauseBtn, or container not found), inject after #timer's closing tag
        if (!injected) {
            const timerIdx = content.indexOf('id="timer"');
            const altTimerIdx = content.indexOf("id='timer'");
            const actualTimerIdx = (timerIdx !== -1) ? timerIdx : altTimerIdx;
            
            if (actualTimerIdx !== -1) {
                const closeDivIdx = content.indexOf('</div>', actualTimerIdx);
                if (closeDivIdx !== -1) {
                    const insertPos = closeDivIdx + 6; // length of </div>
                    content = content.substring(0, insertPos) + BUTTON_HTML + content.substring(insertPos);
                    injected = true;
                    stats.injectedCount++;
                }
            }
        }

        // Fallbacks for layout variations (such as Simple Hdr without class list or timer-box)
        if (!injected) {
            const pauseBtnIdx = content.indexOf('id="pauseBtn"');
            const altPauseBtnIdx = content.indexOf("id='pauseBtn'");
            const actualPauseIdx = (pauseBtnIdx !== -1) ? pauseBtnIdx : altPauseBtnIdx;
            
            if (actualPauseIdx !== -1) {
                const closeBtnIdx = content.indexOf('</button>', actualPauseIdx);
                if (closeBtnIdx !== -1) {
                    const insertPos = closeBtnIdx + 9;
                    content = content.substring(0, insertPos) + BUTTON_HTML + content.substring(insertPos);
                    injected = true;
                    stats.injectedCount++;
                }
            }
        }

        if (!injected) {
            const tmrIdx = content.indexOf('id="tmr"');
            const altTmrIdx = content.indexOf("id='tmr'");
            const actualTmrIdx = (tmrIdx !== -1) ? tmrIdx : altTmrIdx;
            
            if (actualTmrIdx !== -1) {
                const closeDivIdx = content.indexOf('</div>', actualTmrIdx);
                if (closeDivIdx !== -1) {
                    const insertPos = closeDivIdx + 6;
                    content = content.substring(0, insertPos) + BUTTON_HTML + content.substring(insertPos);
                    injected = true;
                    stats.injectedCount++;
                }
            }
        }

        if (!injected) {
            stats.warnings.push({
                file: path.relative(rootDir, filePath),
                issue: "Could not find pause button, timer div, or specified container to inject the #themeToggle button."
            });
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        stats.processedCount++;
    }
}

// Main Execution block
console.log(`Scanning directory: ${rootDir}...`);
const files = walkDir(rootDir);
console.log(`Found ${files.length} HTML files to classify.`);

const targets = [];
for (const file of files) {
    stats.totalScanned++;
    const style = classifyFile(file);
    switch (style) {
        case 'CBTExam':
            stats.cbtExamCount++;
            targets.push(file);
            break;
        case 'Daily Quiz':
            stats.dailyQuizCount++;
            targets.push(file);
            break;
        case 'Mocks Wallah':
            stats.mocksWallahCount++;
            break;
        case 'Topic-Concept Tests':
            stats.topicConceptCount++;
            break;
        default:
            stats.unclassifiedCount++;
            break;
    }
}

console.log(`Targets to process: ${targets.length} files (909 CBTExams + 27 Daily Quizzes).`);
console.log("Processing targets...");

for (const target of targets) {
    try {
        processFile(target);
    } catch (err) {
        console.error(`Error processing file ${target}:`, err);
        stats.warnings.push({
            file: path.relative(rootDir, target),
            issue: `Read/write error: ${err.message}`
        });
    }
}

console.log("\n--- PROCESSING SUMMARY ---");
console.log(`Total scanned HTML files: ${stats.totalScanned}`);
console.log(`Classified as CBTExam: ${stats.cbtExamCount}`);
console.log(`Classified as Daily Quiz: ${stats.dailyQuizCount}`);
console.log(`Excluded (Mocks Wallah): ${stats.mocksWallahCount}`);
console.log(`Excluded (Topic-Concept Tests): ${stats.topicConceptCount}`);
console.log(`Successfully processed / modified: ${stats.processedCount} files`);
console.log(`Normalized IDs count: ${stats.normalizedCount}`);
console.log(`Injected buttons count: ${stats.injectedCount}`);
console.log(`Warnings count: ${stats.warnings.length}`);

if (stats.warnings.length > 0) {
    console.log("\n--- WARNINGS ---");
    stats.warnings.forEach(w => {
        console.warn(`[WARNING] File: ${w.file} | Issue: ${w.issue}`);
    });
}

// Perform basic validation on a sample of patched files
console.log("\n--- VALIDATION ---");
const sampleSize = Math.min(targets.length, 5);
console.log(`Validating a random sample of ${sampleSize} patched files...`);
const sampleIndices = new Set();
while (sampleIndices.size < sampleSize) {
    sampleIndices.add(Math.floor(Math.random() * targets.length));
}

let allSampleValid = true;
for (const idx of sampleIndices) {
    const samplePath = targets[idx];
    const relPath = path.relative(rootDir, samplePath);
    const content = fs.readFileSync(samplePath, 'utf8');

    const hasHandler = content.includes('id="theme-toggle-handler"');
    const hasStyles = content.includes('START: Light Theme Stylesheet Overrides');
    const hasButton = content.includes('id="themeToggle"') || content.includes("id='themeToggle'");
    const hasHtmlOpen = content.includes('<html');
    const hasHtmlClose = content.includes('</html>');

    const isValid = hasHandler && hasStyles && hasButton && hasHtmlOpen && hasHtmlClose;
    console.log(`- ${relPath}: ${isValid ? "PASS" : "FAIL"}`);
    if (!isValid) {
        allSampleValid = false;
        console.log(`  Detail: handler=${hasHandler}, styles=${hasStyles}, button=${hasButton}, htmlOpen=${hasHtmlOpen}, htmlClose=${hasHtmlClose}`);
    }
}

console.log(`Validation results: ${allSampleValid ? "SUCCESS" : "FAILURE"}`);
