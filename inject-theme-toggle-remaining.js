/**
 * inject-theme-toggle-remaining.js
 * 
 * Injects a light/dark theme toggle into all HTML mock files that don't 
 * have one yet. Handles two main types of file structures:
 * 
 * Type A: Simple `.hdr` structure (English Madhyam style)
 * Type B: `.header` with `.header-controls` div (Mocks Wallah new style)
 * 
 * For each file, it:
 * 1. Adds the theme toggle button to the header
 * 2. Converts hard-coded dark CSS to conditional dark/light mode CSS
 * 3. Adds the theme toggle JS handler
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const SKIP_DIRS = ['.git', 'node_modules', 'www', 'android', 'scratch'];
const SKIP_FILES = ['index.html', 'index.bak.html'];

let processed = 0;
let skipped = 0;
let errors = 0;

// The CSS to add for light/dark mode support in Type A files (hdr-based)
const THEME_STYLE_TYPE_A = `
    <!-- START: Light/Dark Theme Toggle Support -->
    <style>
        /* Theme Toggle Button */
        .theme-toggle-btn-a {
            background: transparent;
            border: none;
            cursor: pointer;
            font-size: 18px;
            padding: 6px 8px;
            border-radius: 8px;
            color: var(--p, #4361ee);
            transition: transform 0.2s ease, color 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-left: 6px;
        }
        .theme-toggle-btn-a:hover {
            transform: scale(1.15);
            background: rgba(0,0,0,0.05);
        }
        
        /* Light theme variables */
        body.light-theme {
            background: #f5f7fa !important;
            color: #2d3436 !important;
        }
        body.light-theme .hdr {
            background: #ffffff !important;
            color: #2d3436 !important;
        }
        body.light-theme .qc {
            background: #ffffff !important;
            color: #2d3436 !important;
            box-shadow: 0 5px 20px rgba(0,0,0,.05) !important;
        }
        body.light-theme .qt,
        body.light-theme .qt *,
        body.light-theme .sol-content,
        body.light-theme .sol-content * {
            color: #212529 !important;
            background: transparent !important;
            background-color: transparent !important;
        }
        body.light-theme .opt {
            background: #ffffff !important;
            border-color: #e9ecef !important;
            color: #212529 !important;
        }
        body.light-theme .opt:hover {
            border-color: var(--p, #4361ee) !important;
            background: #f8f9fa !important;
        }
        body.light-theme .opt.sel {
            background: #edf2ff !important;
            border-color: var(--p, #4361ee) !important;
            color: var(--p, #4361ee) !important;
        }
        body.light-theme .opt.cor {
            background: #ebfbee !important;
            border-color: #2b8a3e !important;
            color: #2b8a3e !important;
        }
        body.light-theme .opt.inc {
            background: #fff5f5 !important;
            border-color: #c92a2a !important;
            color: #c92a2a !important;
        }
        body.light-theme .sol {
            background: #fff9f0 !important;
            border-left-color: #e67700 !important;
        }
        body.light-theme .sol h4 {
            color: #e67700 !important;
        }
        body.light-theme .nav {
            background: #ffffff !important;
            color: #2d3436 !important;
        }
        body.light-theme .ttl {
            color: var(--p, #4361ee) !important;
        }
        body.light-theme .tmr {
            background: linear-gradient(135deg, var(--p, #4361ee), var(--s, #3f37c9)) !important;
            color: #fff !important;
        }
        body.light-theme .modal-content,
        body.light-theme .modal-stats,
        body.light-theme .stat,
        body.light-theme .total-marks,
        body.light-theme .mark-breakdown {
            background: #ffffff !important;
            color: #2d3436 !important;
        }
        body.light-theme .stat h4 { color: #6c757d !important; }
        body.light-theme .stat p { color: #212529 !important; }
        body.light-theme .mark-value { color: #212529 !important; }
        body.light-theme .mark-label { color: #6c757d !important; }
        body.light-theme .total-marks h3 { color: #212529 !important; }
        body.light-theme [style*="color: #000"], 
        body.light-theme [style*="color:#000"],
        body.light-theme [style*="color: #111"],
        body.light-theme [style*="color:#111"],
        body.light-theme [style*="color: #333"],
        body.light-theme [style*="color:#333"],
        body.light-theme [style*="color: black"],
        body.light-theme [style*="color:black"] {
            color: #212529 !important;
        }
        body.light-theme .qt img,
        body.light-theme .opt img,
        body.light-theme .sol-content img {
            filter: none !important;
        }
        
        /* Dark theme - override the inline dark styles */
        body:not(.light-theme) {
            background: #0b0f19 !important;
            color: #f3f4f6 !important;
        }
        body:not(.light-theme) .hdr {
            background: #111827 !important;
        }
        body:not(.light-theme) .qc {
            background: #111827 !important;
            border-color: rgba(255,255,255,0.08) !important;
        }
        body:not(.light-theme) .opt {
            background: #111827 !important;
            border-color: rgba(255,255,255,0.08) !important;
            color: #f3f4f6 !important;
        }
        body:not(.light-theme) .nav {
            background: #111827 !important;
        }
        body:not(.light-theme) .sol {
            background: rgba(16,185,129,0.08) !important;
            border-left-color: #10b981 !important;
        }
        body:not(.light-theme) .sol h4 {
            color: #10b981 !important;
        }
        body:not(.light-theme) .theme-toggle-btn-a {
            color: #f3f4f6;
        }
        body.light-theme .theme-toggle-btn-a {
            color: var(--p, #4361ee);
        }
    </style>
    <!-- END: Light/Dark Theme Toggle Support -->
`;

// JS to add at end of body for Type A files
const THEME_JS_TYPE_A = `
<!-- START: Portal Dynamic Theme Handler -->
<script>
    (function() {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            const savedTheme = localStorage.getItem('portal-theme') || 'dark';
            if (savedTheme === 'light') {
                document.body.classList.add('light-theme');
                const icon = toggleBtn.querySelector('i, span.icon');
                if (icon) icon.textContent = '☀️';
            } else {
                document.body.classList.remove('light-theme');
                const icon = toggleBtn.querySelector('i, span.icon');
                if (icon) icon.textContent = '🌙';
            }
            toggleBtn.onclick = function(e) {
                e.stopPropagation();
                const isLight = document.body.classList.toggle('light-theme');
                localStorage.setItem('portal-theme', isLight ? 'light' : 'dark');
                const icon = toggleBtn.querySelector('i, span.icon');
                if (icon) icon.textContent = isLight ? '☀️' : '🌙';
            };
        }
    })();
</script>
<!-- END: Portal Dynamic Theme Handler -->
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
    
    // Skip if already has themeToggle
    if (content.includes('themeToggle')) {
        skipped++;
        return;
    }
    
    const fileName = path.basename(filePath);
    let modified = false;
    
    // Determine the file type
    const isTypeA = content.includes('class="hdr"') || content.includes("class='hdr'");
    const isTypeB = content.includes('class="header"') || content.includes("class='header'") || 
                    content.includes('class="header-controls"') || content.includes("header-controls");
    
    if (isTypeA) {
        // Type A: Simple .hdr-based layout (English Madhyam, etc.)
        // 1. Inject theme styles before </head>
        if (content.includes('</head>') && !content.includes('Light/Dark Theme Toggle Support')) {
            content = content.replace('</head>', THEME_STYLE_TYPE_A + '\n</head>');
        }
        
        // 2. Add theme toggle button inside .hdr - after the submit button or before it
        // Look for pattern: </div><button class="sub"
        // or the closing of .hdr-left div
        const hdrPattern1 = /<button class="sub"[^>]*>[^<]*<\/button>\s*<\/div>/;
        const hdrPattern2 = /(<div class="hdr"[^>]*>[\s\S]*?<\/div>\s*)<button class="sub"/;
        
        // Try to find the header div end and add button before </div> that closes .hdr
        // Simple approach: add toggle button right before the submit button
        if (content.includes('class="sub"')) {
            content = content.replace(
                /(<button class="sub")/,
                `<button class="theme-toggle-btn-a" id="themeToggle" title="Toggle Light/Dark Mode"><span class="icon">🌙</span></button> $1`
            );
            modified = true;
        } else if (content.includes("class='sub'")) {
            content = content.replace(
                /(<button class='sub')/,
                `<button class="theme-toggle-btn-a" id="themeToggle" title="Toggle Light/Dark Mode"><span class="icon">🌙</span></button> $1`
            );
            modified = true;
        }
        
        // 3. Add theme JS before </body>
        if (content.includes('</body>') || content.includes('</script></body>')) {
            // Insert before closing body
            content = content.replace(/<\/body>(\s*<\/html>)?$/, 
                THEME_JS_TYPE_A + '\n</body>\n</html>');
            if (!content.includes('</body>')) {
                content = content + THEME_JS_TYPE_A;
            }
        } else {
            content = content + THEME_JS_TYPE_A;
        }
        
        modified = true;
        
    } else if (isTypeB) {
        // Type B: .header with .header-controls (should already have toggle but just in case)
        // These should already be handled
        skipped++;
        return;
        
    } else {
        // Unknown structure - try generic approach
        // Look for any header-like div and add toggle
        // Find submit button and add toggle before it
        const submitPattern = /<button[^>]*(?:submit|sub-btn|submitBtn)[^>]*>/i;
        if (submitPattern.test(content)) {
            content = content.replace(submitPattern, (match) => {
                return `<button id="themeToggle" style="background:transparent;border:none;cursor:pointer;font-size:20px;padding:4px 8px;border-radius:6px;margin-right:8px;" title="Toggle Theme">🌙</button> ${match}`;
            });
            
            // Add JS before end
            content = content.replace(/<\/body>(\s*<\/html>)?$/,
                THEME_JS_TYPE_A + '\n</body>\n</html>');
            modified = true;
        } else {
            console.log(`  ? Unknown structure, skipping: ${fileName}`);
            skipped++;
            return;
        }
    }
    
    if (modified) {
        try {
            fs.writeFileSync(filePath, content, 'utf8');
            processed++;
            console.log(`  ✓ Updated: ${fileName}`);
        } catch (e) {
            console.error(`  ✗ Write error: ${filePath}: ${e.message}`);
            errors++;
        }
    }
}

async function main() {
    console.log('🚀 Starting theme toggle injection...');
    console.log(`📁 Root: ${ROOT}`);
    
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
            execSync(`git commit -m "style: Inject light/dark theme toggle into remaining mock files (${processed} files)"`, 
                { cwd: ROOT, stdio: 'inherit' });
            console.log('✅ Changes committed to git');
        } catch (e) {
            console.error('⚠️ Git commit failed:', e.message);
        }
    }
}

main().catch(console.error);
