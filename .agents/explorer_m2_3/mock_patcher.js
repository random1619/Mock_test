const fs = require('fs');
const path = require('path');

const tempDir = path.join(__dirname, 'temp');

const filesToPatch = [
    'aman_sample.html',
    'em_sample.html',
    'rbe_sample.html',
    'olive_sample.html',
    'other_sample.html'
];

function patchFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // 1. Inject Head Initializer Script right after <head> opens
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

    // 2. Unify existing theme buttons (theme-toggle, themeBtn -> themeToggle)
    content = content.replace(/id=["']theme-toggle["']/g, 'id="themeToggle"');
    content = content.replace(/id=["']themeBtn["']/g, 'id="themeToggle"');

    // 3. Inject missing button based on layout
    const buttonHtml = '<button class="theme-toggle" id="themeToggle" title="Toggle Theme"><i class="fas fa-moon"></i></button>';

    if (!content.includes('id="themeToggle"')) {
        // Simple Hdr (like em_sample.html and rbe_sample.html) or Premium CBT (like pundits_sample)
        if (content.includes('id="pauseBtn"')) {
            // Inject after pauseBtn
            content = content.replace(/(<button[^>]*id=["']pauseBtn["'][^>]*>.*?<\/button>)/i, `$1\n                ${buttonHtml}`);
        } else if (content.includes('id="tmr"')) {
            // Simple Hdr: Inject after tmr element
            content = content.replace(/(<div[^>]*id=["']tmr["'][^>]*>.*?<\/div>)/i, `$1\n            ${buttonHtml}`);
        } else if (content.includes('id="timer"')) {
            // Simple Hdr: Inject after timer element
            content = content.replace(/(<div[^>]*id=["']timer["'][^>]*>.*?<\/div>)/i, `$1\n            ${buttonHtml}`);
        } else if (content.includes('class="exam-timer"')) {
            // Premium CBT: Inject inside exam-timer
            content = content.replace(/(<div[^>]*class=["']exam-timer["'][^>]*>)/i, `$1\n                ${buttonHtml}`);
        }
    }

    // 4. Inject theme-toggle CSS rule if not present
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
    }

    // 5. Inject Click Listener Script just before </body>
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
    </script>
    `;
    
    content = content.replace(/<\/body>/i, toggleScript + '\n</body>');

    // 6. Disable/Stub out existing conflicting theme toggle code
    content = content.replace(/setupThemeToggle\s*\(\s*\)\s*\{/g, 'setupThemeToggle() { return; // disabled');
    content = content.replace(/toggleTheme\s*\(\s*\)\s*\{/g, 'toggleTheme() { return; // disabled');

    fs.writeFileSync(filepath, content, 'utf8');
}

filesToPatch.forEach(file => {
    const full = path.join(tempDir, file);
    patchFile(full);
    console.log(`Patched ${file}`);
});
