# Milestone 2 — Theme Toggle & Injection Analysis Report

## Executive Summary
This report presents the analysis and recommendation for injecting a persistent theme toggle system into **936 target files** under the `pundits` repository (composed of 909 CBTExams and 27 Daily Quizzes). 

Through programmatic scanning and structural mapping, we have:
1. Identified **four distinct HTML layout templates** across the dataset.
2. Mapped the exact coordinates for the `#themeToggle` button for each template type.
3. Designed a dual-script system (Head Initializer + Body Click Handler) that guarantees **zero FOUC (Flash of Unstyled Content)** and full localStorage state synchronization.
4. Formulated a conflict resolution mechanism to stub out pre-existing theme toggle methods.
5. Successfully tested and verified the patching logic on representative layout samples in a local sandbox directory.

---

## 1. Corpus Analysis & Structural Layouts
Out of the 936 target files (excluding Topic-Concept Tests and Mocks Wallah), we found four HTML structural layout classes:

### Layout Classification Summary
| Template Type | Defining Element | File Count | Primary Brands | Pre-existing Button State |
| :--- | :--- | :--- | :--- | :--- |
| **Premium CBT** | `class="exam-header"` | **609** | Aman Sir, oliveboard, Pundits, The Solvers, Testbook | 592 have `id="themeToggle"`, 17 have no button |
| **Simple Hdr** | `class="hdr"` | **217** | English Madhyam (CBT), RBE, The Solvers | 50 have `id="themeToggle"`, 167 have no button |
| **Header** | `class="header"` | **108** | Other Brands, Pundits | 108 have `id="theme-toggle"` (dash casing) |
| **Oliveboard Layout** | `class="main-layout"` | **2** | oliveboard | 2 have `id="themeBtn"` (camelCase casing) |

### Theme Button Casing & Presence Breakdown
- **CamelCase (`id="themeToggle"`)**: 642 files (Already matching target contract).
- **Dash-casing (`id="theme-toggle"`)**: 108 files (Requires unification to `id="themeToggle"`).
- **Abbreviated (`id="themeBtn"`)**: 2 files (Requires unification to `id="themeToggle"`).
- **No button at all**: 184 files (Requires injection of the button).

---

## 2. Theme Toggle Script Specifications
To satisfy the interface contracts and ensure a smooth visual transition, the implementation uses two distinct scripts.

### 2.1. Head Theme Initializer Script (Anti-FOUC)
*   **Insertion Point**: Immediately after the opening `<head>` tag.
*   **Purpose**: Runs synchronously before any CSS stylesheets or body elements are parsed. Because `document.body` is null at this point, it uses a lightweight `MutationObserver` targeting `document.documentElement`. The observer fires the instant the `<body>` element is created, adding the `.light-theme` class to the body element prior to its first layout calculation or paint, eliminating FOUC.
*   **Exact JS Code**:
```html
<!-- Theme Initialization Script to prevent FOUC -->
<script id="theme-init">
    (function() {
        var theme = localStorage.getItem('portal-theme') || 'dark';
        if (theme === 'light') {
            if (document.body) {
                document.body.classList.add('light-theme');
            } else {
                var observer = new MutationObserver(function(mutations, obs) {
                    if (document.body) {
                        document.body.classList.add('light-theme');
                        obs.disconnect();
                    }
                });
                observer.observe(document.documentElement, { childList: true });
            }
        }
    })();
</script>
```

### 2.2. Body Theme Toggle Click Handler
*   **Insertion Point**: Immediately preceding the closing `</body>` tag.
*   **Purpose**: Synchronizes the state of the `#themeToggle` button (updating its child FontAwesome icon class between `fa-sun` and `fa-moon` based on active class) and attaches the click event listener. Toggling theme updates the `portal-theme` key in `localStorage` to `'light'` or `'dark'`.
*   **Exact JS Code**:
```html
<!-- Theme Toggle Event Listener Script -->
<script id="theme-toggle-script">
(function() {
    function initThemeToggle() {
        var themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        // Sync initial icon state
        var isLight = document.body.classList.contains('light-theme');
        var icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
        }

        // Toggle click handler
        themeToggle.addEventListener('click', function() {
            var currentIsLight = document.body.classList.toggle('light-theme');
            localStorage.setItem('portal-theme', currentIsLight ? 'light' : 'dark');
            var currentIcon = themeToggle.querySelector('i');
            if (currentIcon) {
                currentIcon.className = currentIsLight ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeToggle);
    } else {
        initThemeToggle();
    }
})();
</script>
```

---

## 3. DOM Injection Locations & Styling

### 3.1. Button Injection Locations
Depending on the classified layout template, the automated patcher script will inject the button or modify the ID according to the following rules:

1.  **Premium CBT (`class="exam-header"`)**:
    *   **Rule**: Look for the container `<div class="exam-timer">` inside the `.exam-header`.
    *   **Action**: If `#themeToggle` is missing, inject it right after the pause button `<button id="pauseBtn"...>` or the timer container `.timer-box`.
2.  **Simple Hdr (`class="hdr"`)**:
    *   **Rule**: Find `.hdr-left` (or `.hdr-l`) and inject the button inside it right after `#pauseBtn` or the timer element (`id="tmr"` or `id="timer"`).
    *   **Action**: This keeps the timer and theme controls grouped on the left side, matching other exam layouts.
3.  **Header (`class="header"`)**:
    *   **Rule**: Find the existing `<button ... id="theme-toggle">`.
    *   **Action**: Rename the ID to `id="themeToggle"` using regex.
4.  **Oliveboard (`class="main-layout"`)**:
    *   **Rule**: Find the existing `<button ... id="themeBtn">`.
    *   **Action**: Rename the ID to `id="themeToggle"`.

### 3.2. Styling for `#themeToggle`
To ensure that `#themeToggle` fits the target file layout across different brands without layout breaks, the patcher injects the following CSS rules at the end of the `<head>` (if not already present):

```html
<style id="theme-toggle-style">
    .theme-toggle {
        background: transparent;
        border: none;
        color: var(--text-light, #9ca3af);
        font-size: 18px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        outline: none;
        transition: color 0.2s ease;
        vertical-align: middle;
    }
    .theme-toggle:hover {
        color: var(--primary, #3b82f6);
    }
</style>
```

---

## 4. Conflict Resolution Strategy
Pre-existing javascript in many CBTExams contains legacy theme toggle functions. For example:
- **Aman Sir / Pundits / The Solvers**: `setupThemeToggle() { const btn = document.getElementById('themeToggle'); btn.addEventListener('click', ...); }`
- **oliveboard**: `toggleTheme() { document.body.classList.toggle('dark-mode', this.isDark); }`

Running these side-by-side with our script results in double event triggers and visual artifacts (like setting `dark-mode` instead of `light-theme`).
*   **Resolution**: The automated patcher will search for functions starting with `setupThemeToggle() {` or `toggleTheme() {` and prepend a `return;` line, effectively stubbing them out safely without breaking the class constructor or execution context of the main exam application.

---

## 5. NodeJS Automation Script Structure
The following structure represents the recommended Node.js automation patcher script for the implementer agent. It includes all regex-based replacements and directory traversals to cleanly and safely update all 936 target files:

```javascript
const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits';

// Traverses project to find target HTML files
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
            // Classify target files (CBTExam and Daily Quiz)
            const p = fullPath.toLowerCase();
            const n = file.toLowerCase();
            const isTopicOrMocksWallah = p.includes('topic-concept tests') || 
                                         n.includes('concept test') || 
                                         p.includes('sectional tests/maths & reasoning') || 
                                         p.includes('/mocks wallah/') || 
                                         n.includes('mocks wallah');
            if (!isTopicOrMocksWallah) {
                results.push(fullPath);
            }
        }
    }
    return results;
}

const targets = walkDir(rootDir);
console.log(`Found ${targets.length} target files to patch.`);

let patchCount = 0;

targets.forEach(filepath => {
    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;

    // 1. Inject Head Initializer Script
    if (!content.includes('id="theme-init"')) {
        const headScript = `
    <!-- Theme Initialization Script to prevent FOUC -->
    <script id="theme-init">
        (function() {
            var theme = localStorage.getItem('portal-theme') || 'dark';
            if (theme === 'light') {
                if (document.body) {
                    document.body.classList.add('light-theme');
                } else {
                    var observer = new MutationObserver(function(mutations, obs) {
                        if (document.body) {
                            document.body.classList.add('light-theme');
                            obs.disconnect();
                        }
                    });
                    observer.observe(document.documentElement, { childList: true });
                }
            }
        })();
    </script>`;
        content = content.replace(/<head>/i, '<head>' + headScript);
        modified = true;
    }

    // 2. Unify existing theme buttons (theme-toggle, themeBtn -> themeToggle)
    if (content.includes('id="theme-toggle"') || content.includes("id='theme-toggle'") ||
        content.includes('id="themeBtn"') || content.includes("id='themeBtn'")) {
        content = content.replace(/id=["']theme-toggle["']/g, 'id="themeToggle"');
        content = content.replace(/id=["']themeBtn["']/g, 'id="themeToggle"');
        modified = true;
    }

    // 3. Inject themeToggle button if missing
    if (!content.includes('id="themeToggle"')) {
        const buttonHtml = '<button class="theme-toggle" id="themeToggle" title="Toggle Theme"><i class="fas fa-moon"></i></button>';
        
        if (content.includes('id="pauseBtn"')) {
            content = content.replace(/(<button[^>]*id=["']pauseBtn["'][^>]*>.*?<\/button>)/i, `$1\n                ${buttonHtml}`);
            modified = true;
        } else if (content.includes('id="tmr"')) {
            content = content.replace(/(<div[^>]*id=["']tmr["'][^>]*>.*?<\/div>)/i, `$1\n            ${buttonHtml}`);
            modified = true;
        } else if (content.includes('id="timer"')) {
            content = content.replace(/(<div[^>]*id=["']timer["'][^>]*>.*?<\/div>)/i, `$1\n            ${buttonHtml}`);
            modified = true;
        } else if (content.includes('class="exam-timer"')) {
            content = content.replace(/(<div[^>]*class=["']exam-timer["'][^>]*>)/i, `$1\n                ${buttonHtml}`);
            modified = true;
        }
    }

    // 4. Inject theme-toggle CSS style if not present
    if (!content.includes('.theme-toggle {') && !content.includes('.theme-toggle{')) {
        const cssRule = `
    <style id="theme-toggle-style">
        .theme-toggle {
            background: transparent;
            border: none;
            color: var(--text-light, #9ca3af);
            font-size: 18px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            outline: none;
            transition: color 0.2s ease;
            vertical-align: middle;
        }
        .theme-toggle:hover {
            color: var(--primary, #3b82f6);
        }
    </style>`;
        content = content.replace(/<\/head>/i, cssRule + '\n</head>');
        modified = true;
    }

    // 5. Inject Theme Toggle Event Listener Script just before </body>
    if (!content.includes('id="theme-toggle-script"')) {
        const toggleScript = `
    <!-- Theme Toggle Event Listener Script -->
    <script id="theme-toggle-script">
    (function() {
        function initThemeToggle() {
            var themeToggle = document.getElementById('themeToggle');
            if (!themeToggle) return;

            // Sync initial icon state
            var isLight = document.body.classList.contains('light-theme');
            var icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
            }

            // Toggle click handler
            themeToggle.addEventListener('click', function() {
                var currentIsLight = document.body.classList.toggle('light-theme');
                localStorage.setItem('portal-theme', currentIsLight ? 'light' : 'dark');
                var currentIcon = themeToggle.querySelector('i');
                if (currentIcon) {
                    currentIcon.className = currentIsLight ? 'fas fa-sun' : 'fas fa-moon';
                }
            });
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initThemeToggle);
        } else {
            initThemeToggle();
        }
    })();
    </script>`;
        content = content.replace(/<\/body>/i, toggleScript + '\n</body>');
        modified = true;
    }

    // 6. Disable/Stub conflicting existing functions
    if (content.includes('setupThemeToggle') || content.includes('toggleTheme')) {
        content = content.replace(/setupThemeToggle\s*\(\s*\)\s*\{/g, 'setupThemeToggle() { return; // disabled');
        content = content.replace(/toggleTheme\s*\(\s*\)\s*\{/g, 'toggleTheme() { return; // disabled');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filepath, content, 'utf8');
        patchCount++;
    }
});

console.log(`Successfully patched ${patchCount} target HTML files.`);
```

---

## 6. Verification and Diagnostic Run
A validation dry run was executed against copies of representative layout templates in `C:\Users\gagan\Downloads\Mocks\pundits\.agents\explorer_m2_3\temp`:
- **Aman Sir Layout (`aman_sample.html`)**: Head initializer injected, `#themeToggle` remains unique, `setupThemeToggle()` successfully stubbed out.
- **English Madhyam Layout (`em_sample.html`)**: Head initializer injected, style block injected, `#themeToggle` inserted right next to `#pauseBtn`, click listener injected.
- **RBE Layout (`rbe_sample.html`)**: Head initializer injected, style block injected, `#themeToggle` successfully placed inside `.hdr-l` next to the timer element, click listener injected.
- **Oliveboard Layout (`olive_sample.html`)**: `#themeBtn` unified to `#themeToggle`, `toggleTheme()` successfully stubbed out, click listener injected.
- **Other Brands Layout (`other_sample.html`)**: `#theme-toggle` successfully renamed to `#themeToggle`, click listener injected.

All patched files were parsed and validated to ensure syntax completeness, layout preservation, and selector alignment with interface contracts.
