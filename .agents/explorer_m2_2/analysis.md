# Core Theme Toggle Script & Injection Analysis

This analysis report details the research, specifications, and layout integration strategy for injecting a core theme toggle mechanism into all **909 CBTExam** and **27 Daily Quiz** files under `C:\Users\gagan\Downloads\Mocks\pundits`.

---

## 1. Technical Specification: Core Theme Toggle Script

To satisfy the interface contracts, prevent Flash of Unstyled Content (FOUC), and avoid conflicts with pre-existing page-level event listeners, we recommend a two-phase inline Javascript block:

### A. FOUC Prevention (Run Immediately in Head)
The default state of mock pages is **dark mode** (applied via `:root` CSS variables with `!important` injected in the `<head>`). When the page loads, if the user's stored theme is `'light'`, the browser will default to rendering the dark mode layout before the DOM body finishes parsing, causing a flash.
- **Solution**: A blocking script in `<head>` reads `localStorage.getItem('portal-theme')`. If it is `'light'`, it immediately adds `.light-theme` to `document.documentElement` (the `<html>` tag).
- **Body Class MutationObserver**: Since the interface contract requires `.light-theme` to be toggled on the `<body>` tag, and the `<body>` is null when `<head>` is parsing, the script sets up a lightweight `MutationObserver`. The moment `document.body` is created, the observer appends the `.light-theme` class to it *before* the first render paint, ensuring FOUC is 100% prevented while adhering to the contract.

### B. Event Listener & Conflict Resolution (Run on DOMContentLoaded)
There are over **3,000 pre-existing `setupThemeToggle()` methods** hardcoded in the mock HTML files that toggle `.dark-mode` (non-conforming key) and do not write to `localStorage`.
- **Solution**: To bypass these old handlers without destructively regexing the inline body scripts, the handler clones the `#themeToggle` button at runtime, replaces the original button in the DOM with the clone (which discards all attached event listeners), and binds a clean event listener to the clone. This listener updates `localStorage.getItem('portal-theme')`, toggles `.light-theme` on both `<html>` and `<body>` tags, and updates the icon.

### C. Exact JS Code Recommendation
This block should be wrapped in unique HTML comments for idempotence:

```html
<!-- START: Theme Toggle Script -->
<script id="theme-toggle-handler">
(function() {
    // 1. Immediately apply light theme classes if stored in localStorage to prevent FOUC
    var savedTheme = localStorage.getItem('portal-theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
        // Synchronously watch for body creation and apply the light class before rendering
        var obs = new MutationObserver(function(mutations, observer) {
            if (document.body) {
                document.body.classList.add('light-theme');
                observer.disconnect();
            }
        });
        obs.observe(document.documentElement, { childList: true, subtree: true });
    }

    // 2. Safely wire the toggle button click event and synchronize initial icon state
    window.addEventListener('DOMContentLoaded', function() {
        var btn = document.getElementById('themeToggle');
        if (btn) {
            // Clone the button to discard any old/broken click listeners from the original scraped pages
            var newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Sync initial icon state
            var theme = localStorage.getItem('portal-theme') || 'dark';
            newBtn.innerHTML = theme === 'light' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            
            // Register clean event listener
            newBtn.addEventListener('click', function() {
                var currentTheme = localStorage.getItem('portal-theme') || 'dark';
                var nextTheme = currentTheme === 'light' ? 'dark' : 'light';
                localStorage.setItem('portal-theme', nextTheme);
                
                if (nextTheme === 'light') {
                    document.documentElement.classList.add('light-theme');
                    document.body.classList.add('light-theme');
                    newBtn.innerHTML = '<i class="fas fa-sun"></i>';
                } else {
                    document.documentElement.classList.remove('light-theme');
                    document.body.classList.remove('light-theme');
                    newBtn.innerHTML = '<i class="fas fa-moon"></i>';
                }
            });
        }
    });
})();
</script>
<!-- END: Theme Toggle Script -->
```

---

## 2. Insertion Point inside `<head>`

To ensure the FOUC prevention logic executes before any browser styling or layout rendering begins:
- **Optimal Point**: Immediately after the opening `<head>` tag, or right after the primary `<meta>` viewport tags (and before any `<link rel="stylesheet">` or inline `<style>` blocks).
- **Implementation Strategy**: In the Node.js patcher, search for the first occurrence of `<head>` and replace it with `<head>\n[Script Block]`.

---

## 3. DOM Layout & Selector Target Audits

A survey of `CBTExam` and `Daily Quiz` files revealed three primary header/timer layouts depending on the publisher and scrape source:

### Layout A: Standard CBT Header (Aman Sir, English Madhyam, Pundits, RBE, Testbook, The Solvers)
- **Container**: `<div class="exam-timer">` inside `<div class="exam-header">`
- **Pre-existing button**: A button with `id="themeToggle"` often exists.
- **Action**: Use the existing button, ensuring its ID is normalized to camelCase.

### Layout B: Custom Dashboard Header (Other Brands)
- **Container**: `<div class="header-controls">` inside `<div class="header">`
- **Pre-existing button**: Often has a button with `id="theme-toggle"` (kebab-case).
- **Action**: Normalize the ID to `#themeToggle`.

### Layout C: Split Timer Bar Header (Oliveboard)
- **Container**: `<div class="timer-bar">` inside `.center-panel`
- **Pre-existing button**: **None** (Missing).
- **Action**: Programmatically inject the `#themeToggle` button.

---

## 4. DOM Injection Strategy

For files lacking the toggle button, the injection point inside the target container follows these heuristics:
1. **Target Containers (Priority Order)**:
   - Search for `class="exam-timer"`
   - Search for `class="header-controls"`
   - Search for `class="timer-bar"`
2. **Best Injection Position**:
   - If `#pauseBtn` is present in the container: Inject the new `#themeToggle` button immediately after `</button>` of `#pauseBtn`.
   - If `#pauseBtn` is NOT present: Append the new button right after the opening tag of the target container.

### Exact HTML & Style Properties for `#themeToggle`
To fit the layout perfectly without layout shifts:
- **Injected HTML**:
  ```html
  <button class="theme-toggle" id="themeToggle" title="Toggle Theme"><i class="fas fa-moon"></i></button>
  ```
- **CSS Styles** (to be injected inside the unified CSS override stylesheet in `<head>`):
  ```css
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
  ```

---

## 5. NodeJS Automation Script Structure

This proposed script scans files recursively, filters for `CBTExam` and `Daily Quiz` styles based on path structure, and injects/overrides the theme toggle script and button elements. It uses only built-in Node.js modules for maximum portability:

```javascript
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = 'C:\\Users\\gagan\\Downloads\\Mocks\\pundits';

// Target CSS rules for the theme button and light theme variables
const lightThemeCSS = `
/* Light Theme CSS Variables & Button Overrides */
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
body.light-theme .exam-header {
    background: #ffffff !important;
    border-bottom: 1px solid var(--border) !important;
}
body.light-theme .exam-title, body.light-theme .exam-timer {
    color: var(--text) !important;
}
body.light-theme .candidate-name {
    color: var(--text) !important;
}
body.light-theme .section-table th, body.light-theme table.section-table th {
    background: rgba(0, 0, 0, 0.05) !important;
    color: var(--text) !important;
}
`;

// Core theme toggle script to inject in <head>
const themeScript = `<!-- START: Theme Toggle Script -->
<script id="theme-toggle-handler">
(function() {
    var savedTheme = localStorage.getItem('portal-theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
        var obs = new MutationObserver(function(mutations, observer) {
            if (document.body) {
                document.body.classList.add('light-theme');
                observer.disconnect();
            }
        });
        obs.observe(document.documentElement, { childList: true, subtree: true });
    }

    window.addEventListener('DOMContentLoaded', function() {
        var btn = document.getElementById('themeToggle');
        if (btn) {
            var newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            var theme = localStorage.getItem('portal-theme') || 'dark';
            newBtn.innerHTML = theme === 'light' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            
            newBtn.addEventListener('click', function() {
                var currentTheme = localStorage.getItem('portal-theme') || 'dark';
                var nextTheme = currentTheme === 'light' ? 'dark' : 'light';
                localStorage.setItem('portal-theme', nextTheme);
                if (nextTheme === 'light') {
                    document.documentElement.classList.add('light-theme');
                    document.body.classList.add('light-theme');
                    newBtn.innerHTML = '<i class="fas fa-sun"></i>';
                } else {
                    document.documentElement.classList.remove('light-theme');
                    document.body.classList.remove('light-theme');
                    newBtn.innerHTML = '<i class="fas fa-moon"></i>';
                }
            });
        }
    });
})();
</script>
<!-- END: Theme Toggle Script -->`;

function getMockStyle(relPath) {
    const p = relPath.toLowerCase();
    const n = path.basename(relPath).toLowerCase();
    
    if (p.includes('topic-concept tests') || n.includes('concept test') || p.includes('sectional tests/maths & reasoning')) {
        return 'Topic-Concept Tests';
    }
    if (p.includes('daily quiz') || n.includes('daily quiz')) {
        return 'Daily Quiz';
    }
    if (p.startsWith('mocks wallah/') || n.includes('mocks wallah')) {
        return 'Mocks Wallah';
    }
    return 'CBTExam';
}

function patchFile(filePath, relPath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Normalize any existing kebab-case id theme toggles
    if (content.includes('id="theme-toggle"')) {
        content = content.replace(/id="theme-toggle"/g, 'id="themeToggle"');
        modified = true;
    }
    if (content.includes("id='theme-toggle'")) {
        content = content.replace(/id='theme-toggle'/g, "id='themeToggle'");
        modified = true;
    }

    // 2. Inject or update the theme script in <head>
    const scriptRegex = /<!-- START: Theme Toggle Script -->[\s\S]*?<!-- END: Theme Toggle Script -->/g;
    if (scriptRegex.test(content)) {
        content = content.replace(scriptRegex, themeScript);
        modified = true;
    } else {
        const headMatch = content.match(/<head>/i);
        if (headMatch) {
            content = content.replace(/<head>/i, `<head>\n${themeScript}`);
            modified = true;
        }
    }

    // 3. Inject lightThemeCSS into the Unified overrides or <head>
    const cssRegex = /<!-- START: Unified Premium Dark Mode Overrides -->[\s\S]*?<\/style>/i;
    if (cssRegex.test(content)) {
        // Find style tag in the override block and append light theme styles
        const match = content.match(cssRegex)[0];
        if (!match.includes('/* Light Theme CSS Variables & Button Overrides */')) {
            const index = content.indexOf('</style>', content.indexOf('<!-- START: Unified Premium Dark Mode Overrides -->'));
            content = content.substring(0, index) + lightThemeCSS + content.substring(index);
            modified = true;
        }
    }

    // 4. Inject button if missing
    if (!content.includes('id="themeToggle"') && !content.includes("id='themeToggle'")) {
        // Find best container
        const containers = ['class="exam-timer"', 'class="header-controls"', 'class="timer-bar"', "class='exam-timer'", "class='header-controls'", "class='timer-bar'"];
        let foundContainer = false;
        
        for (const container of containers) {
            const containerIdx = content.indexOf(container);
            if (containerIdx !== -1) {
                // Look for pauseBtn inside container to place theme toggle adjacent to it
                const containerEndIdx = content.indexOf('</div>', containerIdx);
                const pauseBtnIdx = content.indexOf('id="pauseBtn"', containerIdx);
                
                if (pauseBtnIdx !== -1 && pauseBtnIdx < containerEndIdx) {
                    const closeButtonIdx = content.indexOf('</button>', pauseBtnIdx);
                    if (closeButtonIdx !== -1) {
                        const insertPos = closeButtonIdx + 9; // length of </button>
                        const buttonHTML = '\n                <button class="theme-toggle" id="themeToggle" title="Toggle Theme"><i class="fas fa-moon"></i></button>';
                        content = content.substring(0, insertPos) + buttonHTML + content.substring(insertPos);
                        modified = true;
                        foundContainer = true;
                        break;
                    }
                } else {
                    // No pause button: inject as first child of the container
                    const openTagEnd = content.indexOf('>', containerIdx) + 1;
                    const buttonHTML = '\n                <button class="theme-toggle" id="themeToggle" title="Toggle Theme"><i class="fas fa-moon"></i></button>';
                    content = content.substring(0, openTagEnd) + buttonHTML + content.substring(openTagEnd);
                    modified = true;
                    foundContainer = true;
                    break;
                }
            }
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

function processDirectory(dir, stats) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        if (['node_modules', '.git', 'scratch', 'www', 'android', '.agents'].includes(file)) {
            continue;
        }
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath, stats);
        } else if (file.endsWith('.html') && !['index.html', 'index.bak.html'].includes(file)) {
            const relPath = path.relative(PROJECT_ROOT, fullPath).replace(/\\/g, '/');
            const style = getMockStyle(relPath);
            
            if (style === 'CBTExam' || style === 'Daily Quiz') {
                stats.totalCount++;
                const isPatched = patchFile(fullPath, relPath);
                if (isPatched) {
                    stats.modifiedCount++;
                }
            }
        }
    }
}

const stats = { totalCount: 0, modifiedCount: 0 };
console.log('Beginning theme toggle injection...');
processDirectory(PROJECT_ROOT, stats);
console.log(`Processing complete. Scanned target files: ${stats.totalCount}. Patched/Updated: ${stats.modifiedCount}.`);
```
