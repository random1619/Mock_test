/**
 * fix-theme-toggle-persistence.js
 * 
 * Adds localStorage persistence to "data-theme" based theme toggles.
 * These files use `toggleTheme()` function and `data-theme` attribute
 * but don't save/load from localStorage.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const SKIP_DIRS = ['.git', 'node_modules', 'www', 'android', 'scratch', '.agents'];
const SKIP_FILES = ['index.html', 'index.bak.html'];

let processed = 0;
let skipped = 0;
let errors = 0;

// Updated toggleTheme that saves to localStorage
const IMPROVED_TOGGLE_THEME = `
// Toggle theme (with localStorage persistence)
function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('portal-theme', newTheme);
    
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        const icon = btn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-moon', newTheme === 'light');
            icon.classList.toggle('fa-sun', newTheme === 'dark');
        }
    }
}`;

// localStorage initialization to add to the init function or DOMContentLoaded
const THEME_INIT_CODE = `
// Restore theme from localStorage on load
(function() {
    const saved = localStorage.getItem('portal-theme') || 'dark';
    document.body.setAttribute('data-theme', saved);
    // Update icon once DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-moon', 'fa-sun');
                icon.classList.add(saved === 'dark' ? 'fa-sun' : 'fa-moon');
            }
        }
    });
})();
`;

function findAllHtmlFiles(dir) {
    const results = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
        if (SKIP_DIRS.includes(item)) continue;
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            results.push(...findAllHtmlFiles(fullPath));
        } else if (item.endsWith('.html') && !SKIP_FILES.includes(item)) {
            results.push(fullPath);
        }
    }
    return results;
}

function processFile(filePath) {
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
        console.error(`  ✗ Read error: ${filePath}: ${e.message}`);
        errors++;
        return;
    }
    
    // Only process files with data-theme pattern but NOT themeToggle (our new pattern)
    const hasDataTheme = content.includes('[data-theme=dark]') || content.includes('[data-theme="dark"]');
    const hasThemeToggleId = content.includes('id="theme-toggle"') || content.includes("id='theme-toggle'");
    const hasToggleThemeFunc = content.includes('function toggleTheme()');
    const alreadyFixed = content.includes('localStorage.getItem(\'portal-theme\')') || 
                         content.includes('localStorage.getItem("portal-theme")');
    
    if (!hasDataTheme || !hasThemeToggleId || !hasToggleThemeFunc) {
        skipped++;
        return;
    }
    
    if (alreadyFixed) {
        skipped++;
        return;
    }
    
    const fileName = path.basename(filePath);
    
    // Replace the toggleTheme function with an improved version that saves to localStorage
    const oldToggleThemeRegex = /\/\/ Toggle theme\s*\nfunction toggleTheme\(\) \{[\s\S]*?\}/;
    
    let modified = false;
    if (oldToggleThemeRegex.test(content)) {
        content = content.replace(oldToggleThemeRegex, IMPROVED_TOGGLE_THEME.trim());
        modified = true;
    }
    
    // Add localStorage initialization before </head>
    if (!content.includes('portal-theme') && content.includes('</head>')) {
        content = content.replace('</head>', `<script>${THEME_INIT_CODE}</script>\n</head>`);
        modified = true;
    } else if (content.includes('portal-theme')) {
        // Already has it
    } else {
        // Add init at start of body
        content = content.replace('<body>', `<body>\n<script>${THEME_INIT_CODE}</script>`);
        modified = true;
    }
    
    if (modified) {
        try {
            fs.writeFileSync(filePath, content, 'utf8');
            processed++;
            console.log(`  ✓ Fixed persistence: ${fileName}`);
        } catch (e) {
            console.error(`  ✗ Write error: ${filePath}: ${e.message}`);
            errors++;
        }
    } else {
        skipped++;
    }
}

async function main() {
    console.log('🚀 Fixing theme persistence in data-theme files...');
    
    const files = findAllHtmlFiles(ROOT);
    console.log(`📄 Found ${files.length} HTML files to check\n`);
    
    for (const file of files) {
        processFile(file);
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Done!`);
    console.log(`   Modified : ${processed}`);
    console.log(`   Skipped  : ${skipped}`);
    console.log(`   Errors   : ${errors}`);
    console.log('═'.repeat(60));
    
    if (processed > 0) {
        console.log('\n📝 Committing changes...');
        try {
            execSync('git add -A', { cwd: ROOT, stdio: 'inherit' });
            execSync(`git commit -m "fix: Add localStorage theme persistence to data-theme based toggle files (${processed} files)"`, 
                { cwd: ROOT, stdio: 'inherit' });
            console.log('✅ Changes committed to git');
        } catch (e) {
            console.error('⚠️ Git commit failed:', e.message);
        }
    }
}

main().catch(console.error);
