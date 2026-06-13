# Core Theme Toggle Script & Injection Strategy Analysis

This report documents the research, findings, and concrete recommendations for injecting the theme toggler and `#themeToggle` button into all 909 CBTExams and 27 Daily Quizzes.

---

## 1. File Classification & Toggle Button Audits

An audit of all 936 target files (909 CBTExams and 27 Daily Quizzes) was performed to check the presence and naming conventions of theme toggling elements. 

### A. Summary Stats
The files fall into four categories based on the theme button element present in the HTML:

| File Style | Total Files | Has `id="themeToggle"` (camelCase) | Has `id="theme-toggle"` (hyphenated) | Has `id="themeBtn"` (Oliveboard) | Missing Theme Button |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **CBTExam** | 909 | 627 | 108 | 2 | 172 |
| **Daily Quiz** | 27 | 15 | 0 | 0 | 12 |
| **Combined** | **936** | **642** | **108** | **2** | **184** |

### B. Core Findings & Observations
1. **Brand Distribution of Missing Buttons**: All **184 files** lacking any theme button are under the **English Madhyam** brand (172 CBTExams in `SSC CGL Tier-1 Mocks` & `Previous Year Papers`, and 12 Daily Quizzes in `Daily Quizzes & Editorial Tests`).
2. **Normalization Needs**: 110 files contain theme toggle buttons with non-standard IDs (`theme-toggle` or `themeBtn`). These must be normalized to `themeToggle` to adhere to the Interface Contract.
3. **Timer / Header DOM Variations**:
   - **Type A (Standard CBT, 777 files)**: Features `.exam-header` with an inner `.exam-timer` containing a `#pauseBtn` and an existing `#themeToggle` or `#theme-toggle`.
   - **Type B (English Madhyam, 110 files)**: Features `.hdr` containing `.hdr-left` with `#pauseBtn` but no theme toggle button.
   - **Type C (RBE Arithmetic Booster, 49 files)**: Features `.hdr` with `.hdr-l` containing only `#timer` (no pause button and no theme button).

---

## 2. Preventing FOUC & Toggle Script Design

### A. FOUC Prevention Mechanism
Because the default portal state is dark, loading the page when the user has selected the light theme would cause a **Flash of Unstyled Content (FOUC)** if the class `.light-theme` is added only after DOM parsing (e.g., in a script at the bottom of the body or on `DOMContentLoaded`).

To prevent this:
1. An **Immediate Script** must be injected at the very top of `<head>`.
2. This script reads `portal-theme` from `localStorage` immediately.
3. If the theme is `'light'`, it adds `.light-theme` to `document.documentElement` (available instantly).
4. Simultaneously, it registers a `MutationObserver` to watch `document.documentElement`. The absolute instant `document.body` is inserted by the HTML parser, the script adds the class `.light-theme` to `<body>` *before the first rendering pass (first paint)*.

### B. The Exact JavaScript Code
The recommended implementation uses a dual-script architecture:

#### 1. Immediate Script (Injected in `<head>` top)
```html
<!-- START: Injected Theme Toggle Immediate -->
<script id="theme-toggle-immediate">
    (function() {
        let savedTheme = 'dark';
        try {
            savedTheme = localStorage.getItem('portal-theme') || 'dark';
        } catch (e) {
            console.warn('localStorage access failed:', e);
        }
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light-theme');
            // Fast observer to catch the body element the instant it is parsed
            const observer = new MutationObserver(function(mutations, obs) {
                if (document.body) {
                    document.body.classList.add('light-theme');
                    obs.disconnect();
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }
    })();
</script>
<!-- END: Injected Theme Toggle Immediate -->
```

#### 2. DOM Setup Script (Injected in `<head>` or before `</body>` - listens to DOMContentLoaded)
This script handles binding to the `#themeToggle` button. To be robust against files that already have local event listeners bound to `#themeToggle` (which toggle the incorrect `.dark-mode` class and do not persist settings), the script **clones the button node** to strip all existing listeners, clears any inline `onclick` attributes, and registers a clean toggle handler.

```html
<!-- START: Injected Theme Toggle Setup -->
<script id="theme-toggle-setup">
    document.addEventListener('DOMContentLoaded', function() {
        let savedTheme = 'dark';
        try {
            savedTheme = localStorage.getItem('portal-theme') || 'dark';
        } catch (e) {
            console.warn('localStorage access failed:', e);
        }
        
        // Match standard, hyphenated, or alternate button IDs
        const toggleBtn = document.getElementById('themeToggle') || 
                          document.getElementById('theme-toggle') || 
                          document.getElementById('themeBtn');
                          
        if (toggleBtn) {
            // Clone the button to strip any pre-existing listeners
            const newBtn = toggleBtn.cloneNode(true);
            newBtn.removeAttribute('onclick');
            newBtn.id = 'themeToggle'; // Ensure normalized ID
            toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);
            
            // Set initial icon class based on active theme
            const icon = newBtn.querySelector('i');
            if (icon) {
                icon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
            }
            
            newBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const isLight = document.body.classList.toggle('light-theme');
                if (isLight) {
                    document.documentElement.classList.add('light-theme');
                    try {
                        localStorage.setItem('portal-theme', 'light');
                    } catch (err) {}
                } else {
                    document.documentElement.classList.remove('light-theme');
                    try {
                        localStorage.setItem('portal-theme', 'dark');
                    } catch (err) {}
                }
                if (icon) {
                    icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
                }
            });
        }
    });
</script>
<!-- END: Injected Theme Toggle Setup -->
```

---

## 3. Light Theme CSS Style Recommendations

The codebase employs extensive dark mode style overrides (`Unified Premium Dark Mode Overrides`) with `!important` text colors. REDESIGNing a light theme requires an overriding stylesheet that resets text colors, custom cards, buttons, and formula filters when `body.light-theme` is active.

```html
<!-- START: Injected Theme Toggle Styles -->
<style id="theme-toggle-styles">
    /* Theme Toggle Button Styling */
    #themeToggle, .theme-toggle {
        background: transparent !important;
        border: none !important;
        color: var(--text-light) !important;
        font-size: 18px !important;
        cursor: pointer !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 8px !important;
        transition: color 0.2s ease !important;
        vertical-align: middle !important;
    }
    #themeToggle:hover, .theme-toggle:hover {
        color: var(--primary) !important;
    }
    
    /* Light Theme Variable Overrides (specificity beats :root overrides) */
    body.light-theme {
        --bg: #f3f4f6 !important;
        --card: #ffffff !important;
        --text: #1f2937 !important;
        --text-light: #6b7280 !important;
        --border: #d1d5db !important;
    }
    
    /* Text Color Resets */
    body.light-theme .question-text, body.light-theme .question-text *,
    body.light-theme .option, body.light-theme .option *,
    body.light-theme .comprehension, body.light-theme .comprehension *,
    body.light-theme .solution-box, body.light-theme .solution-box *,
    body.light-theme .explanation, body.light-theme .explanation *,
    body.light-theme .analysis-panel, body.light-theme .analysis-panel *,
    body.light-theme .candidate-bar *,
    body.light-theme .exam-title, body.light-theme .exam-title *,
    body.light-theme .timer-box, body.light-theme .timer-box *,
    body.light-theme .nav-question,
    body.light-theme table, body.light-theme tr, body.light-theme td, body.light-theme th {
        color: var(--text) !important;
    }
    
    /* Override hardcoded black inline styling in light mode */
    body.light-theme [style*="color: #000"], body.light-theme [style*="color:#000"], 
    body.light-theme [style*="color: #111"], body.light-theme [style*="color:#111"],
    body.light-theme [style*="color: #222"], body.light-theme [style*="color:#222"],
    body.light-theme [style*="color: black"], body.light-theme [style*="color:black"],
    body.light-theme [style*="color: #000000"], body.light-theme [style*="color:#000000"] {
        color: var(--text) !important;
    }
    
    /* Option States in Light Mode */
    body.light-theme .option {
        background: rgba(0, 0, 0, 0.01) !important;
    }
    body.light-theme .option:hover:not(.submitted):not(.correct):not(.wrong):not(.selected) {
        background: rgba(0, 0, 0, 0.03) !important;
    }
    body.light-theme .option.selected {
        background: rgba(0, 0, 0, 0.05) !important;
        border-color: var(--primary) !important;
    }
    body.light-theme .option.selected, body.light-theme .option.selected * {
        color: var(--primary) !important;
    }
    body.light-theme .option-indicator {
        border-color: rgba(0, 0, 0, 0.2) !important;
    }
    
    /* Previous Button Visibility Reset */
    body.light-theme .btn-prev {
        background: #f3f4f6 !important;
        color: #1f2937 !important;
        border: 1px solid #d1d5db !important;
    }
    body.light-theme .btn-prev:hover:not(:disabled) {
        background: #e5e7eb !important;
    }
    
    /* MathJax/MathML Reset (Dark text + Disable Image Inversion) */
    body.light-theme mjx-container, body.light-theme math, body.light-theme .mathjax, 
    body.light-theme [class*="mathjax"], body.light-theme [id*="MathJax"], body.light-theme .katex, body.light-theme .katex * {
        color: var(--text) !important;
        fill: var(--text) !important;
    }
    body.light-theme .question-card img, body.light-theme .option img, 
    body.light-theme .comprehension img, body.light-theme .solution-box img {
        filter: none !important;
    }
</style>
<!-- END: Injected Theme Toggle Styles -->
```

---

## 4. Automation Script Structure

A Node.js automation patcher script is structured below to safely apply these changes across all 936 target files. It is designed to be **idempotent** (safe to run repeatedly) by stripping prior injections before inserting updated versions.

```javascript
/**
 * Theme Toggle Script Injector
 * Path: scratch/inject-theme-toggle.js
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const manifestPath = path.join(rootDir, '.agents/explorer_init_2/extracted_features.json');

const STYLES_BLOCK = `<!-- START: Injected Theme Toggle Styles -->
<style id="theme-toggle-styles">
    #themeToggle, .theme-toggle {
        background: transparent !important;
        border: none !important;
        color: var(--text-light) !important;
        font-size: 18px !important;
        cursor: pointer !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 8px !important;
        transition: color 0.2s ease !important;
        vertical-align: middle !important;
    }
    #themeToggle:hover, .theme-toggle:hover {
        color: var(--primary) !important;
    }
    body.light-theme {
        --bg: #f3f4f6 !important;
        --card: #ffffff !important;
        --text: #1f2937 !important;
        --text-light: #6b7280 !important;
        --border: #d1d5db !important;
    }
    body.light-theme .question-text, body.light-theme .question-text *,
    body.light-theme .option, body.light-theme .option *,
    body.light-theme .comprehension, body.light-theme .comprehension *,
    body.light-theme .solution-box, body.light-theme .solution-box *,
    body.light-theme .explanation, body.light-theme .explanation *,
    body.light-theme .analysis-panel, body.light-theme .analysis-panel *,
    body.light-theme .candidate-bar *,
    body.light-theme .exam-title, body.light-theme .exam-title *,
    body.light-theme .timer-box, body.light-theme .timer-box *,
    body.light-theme .nav-question,
    body.light-theme table, body.light-theme tr, body.light-theme td, body.light-theme th {
        color: var(--text) !important;
    }
    body.light-theme [style*="color: #000"], body.light-theme [style*="color:#000"], 
    body.light-theme [style*="color: #111"], body.light-theme [style*="color:#111"],
    body.light-theme [style*="color: #222"], body.light-theme [style*="color:#222"],
    body.light-theme [style*="color: black"], body.light-theme [style*="color:black"],
    body.light-theme [style*="color: #000000"], body.light-theme [style*="color:#000000"] {
        color: var(--text) !important;
    }
    body.light-theme .option {
        background: rgba(0, 0, 0, 0.01) !important;
    }
    body.light-theme .option:hover:not(.submitted):not(.correct):not(.wrong):not(.selected) {
        background: rgba(0, 0, 0, 0.03) !important;
    }
    body.light-theme .option.selected {
        background: rgba(0, 0, 0, 0.05) !important;
        border-color: var(--primary) !important;
    }
    body.light-theme .option.selected, body.light-theme .option.selected * {
        color: var(--primary) !important;
    }
    body.light-theme .option-indicator {
        border-color: rgba(0, 0, 0, 0.2) !important;
    }
    body.light-theme .btn-prev {
        background: #f3f4f6 !important;
        color: #1f2937 !important;
        border: 1px solid #d1d5db !important;
    }
    body.light-theme .btn-prev:hover:not(:disabled) {
        background: #e5e7eb !important;
    }
    body.light-theme mjx-container, body.light-theme math, body.light-theme .mathjax, 
    body.light-theme [class*="mathjax"], body.light-theme [id*="MathJax"], body.light-theme .katex, body.light-theme .katex * {
        color: var(--text) !important;
        fill: var(--text) !important;
    }
    body.light-theme .question-card img, body.light-theme .option img, 
    body.light-theme .comprehension img, body.light-theme .solution-box img {
        filter: none !important;
    }
</style>
<!-- END: Injected Theme Toggle Styles -->`;

const IMMEDIATE_SCRIPT = `<!-- START: Injected Theme Toggle Immediate -->
<script id="theme-toggle-immediate">
    (function() {
        let savedTheme = 'dark';
        try {
            savedTheme = localStorage.getItem('portal-theme') || 'dark';
        } catch (e) {}
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light-theme');
            const observer = new MutationObserver(function(mutations, obs) {
                if (document.body) {
                    document.body.classList.add('light-theme');
                    obs.disconnect();
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }
    })();
</script>
<!-- END: Injected Theme Toggle Immediate -->`;

const SETUP_SCRIPT = `<!-- START: Injected Theme Toggle Setup -->
<script id="theme-toggle-setup">
    document.addEventListener('DOMContentLoaded', function() {
        let savedTheme = 'dark';
        try {
            savedTheme = localStorage.getItem('portal-theme') || 'dark';
        } catch (e) {}
        const toggleBtn = document.getElementById('themeToggle') || 
                          document.getElementById('theme-toggle') || 
                          document.getElementById('themeBtn');
        if (toggleBtn) {
            const newBtn = toggleBtn.cloneNode(true);
            newBtn.removeAttribute('onclick');
            newBtn.id = 'themeToggle';
            toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);
            const icon = newBtn.querySelector('i');
            if (icon) {
                icon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
            }
            newBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const isLight = document.body.classList.toggle('light-theme');
                if (isLight) {
                    document.documentElement.classList.add('light-theme');
                    try { localStorage.setItem('portal-theme', 'light'); } catch (err) {}
                } else {
                    document.documentElement.classList.remove('light-theme');
                    try { localStorage.setItem('portal-theme', 'dark'); } catch (err) {}
                }
                if (icon) {
                    icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
                }
            });
        }
    });
</script>
<!-- END: Injected Theme Toggle Setup -->`;

const BUTTON_HTML = `\n                <button class="theme-toggle" id="themeToggle" title="Toggle Theme"><i class="fas fa-moon"></i></button>`;

function processFile(filePath) {
    const absPath = path.join(rootDir, filePath);
    let content = fs.readFileSync(absPath, 'utf8');

    // 1. Remove previous theme toggle block injections (idempotency)
    content = content.replace(/<!-- START: Injected Theme Toggle Styles -->[\s\S]*?<!-- END: Injected Theme Toggle Styles -->\n?/g, '');
    content = content.replace(/<!-- START: Injected Theme Toggle Immediate -->[\s\S]*?<!-- END: Injected Theme Toggle Immediate -->\n?/g, '');
    content = content.replace(/<!-- START: Injected Theme Toggle Setup -->[\s\S]*?<!-- END: Injected Theme Toggle Setup -->\n?/g, '');

    // 2. Remove dynamically-inserted button if injected in previous script run
    const injectedButtonMarker = /\n\s*<button class="theme-toggle" id="themeToggle" title="Toggle Theme">[\s\S]*?<\/button>/g;
    content = content.replace(injectedButtonMarker, '');

    // 3. Inject Styles, Immediate Script, and Setup Script inside <head>
    const headInjection = `\n${IMMEDIATE_SCRIPT}\n${STYLES_BLOCK}\n${SETUP_SCRIPT}`;
    content = content.replace(/<head>/i, `<head>${headInjection}`);

    // 4. Normalize alternate button IDs to 'themeToggle'
    content = content.replace(/id=["']theme-toggle["']/g, 'id="themeToggle"');
    content = content.replace(/id=["']themeBtn["']/g, 'id="themeToggle"');

    // 5. Inject theme button if missing (after normalization check)
    if (!content.includes('id="themeToggle"') && !content.includes("id='themeToggle'")) {
        const pauseBtnRegex = /(<button[^>]+id=["']pauseBtn["'][^>]*>[\s\S]*?<\/button>)/i;
        const timerRegex = /(<div[^>]+id=["']timer["'][^>]*>[\s\S]*?<\/div>)/i;
        const mainTimerRegex = /(<div[^>]+id=["']mainTimer["'][^>]*>[\s\S]*?<\/div>)/i;
        const timerBoxRegex = /(<div[^>]+class=["']timer-box["'][^>]*>[\s\S]*?<\/div>)/i;
        const examHeaderRegex = /(<div[^>]+class=["']exam-header["'][^>]*>)/i;

        if (pauseBtnRegex.test(content)) {
            content = content.replace(pauseBtnRegex, `$1${BUTTON_HTML}`);
        } else if (timerRegex.test(content)) {
            content = content.replace(timerRegex, `$1${BUTTON_HTML}`);
        } else if (mainTimerRegex.test(content)) {
            content = content.replace(mainTimerRegex, `$1${BUTTON_HTML}`);
        } else if (timerBoxRegex.test(content)) {
            content = content.replace(timerBoxRegex, `$1${BUTTON_HTML}`);
        } else if (examHeaderRegex.test(content)) {
            content = content.replace(examHeaderRegex, `$1${BUTTON_HTML}`);
        } else {
            console.warn(`[WARNING] No header anchor found for: ${filePath}`);
        }
    }

    fs.writeFileSync(absPath, content, 'utf8');
}

// Read manifest and process all CBTExam and Daily Quiz files
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let patchCount = 0;

for (const item of manifest) {
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

    if (style === 'CBTExam' || style === 'Daily Quiz') {
        try {
            processFile(item.path);
            patchCount++;
        } catch (err) {
            console.error(`Error processing ${item.path}:`, err);
        }
    }
}

console.log(`Success! Successfully injected theme toggle code into ${patchCount} files.`);
```
