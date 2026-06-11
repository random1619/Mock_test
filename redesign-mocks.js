const fs = require('fs');
const path = require('path');

const OVERRIDE_CSS = `
    <!-- START: Modern Premium Style Overrides -->
    <style>
        /* Modern Premium Style Overrides */
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        :root {
            --primary: #6366f1 !important;
            --primary-hover: #4f46e5 !important;
            --success: #10b981 !important;
            --danger: #ef4444 !important;
            --warning: #f59e0b !important;
            --bg: #0b0f19 !important;
            --card: #111827 !important;
            --text: #f3f4f6 !important;
            --text-light: #9ca3af !important;
            --border: rgba(255, 255, 255, 0.08) !important;
            --font-sans: 'Plus Jakarta Sans', sans-serif !important;
            --radius: 12px !important;
        }
        body {
            background: var(--bg) !important;
            color: var(--text) !important;
        }
        .welcome-screen {
            background: var(--bg) !important;
        }
        .welcome-container, .question-card, .option, .navigator-sidebar, .exam-header, .navigation-bar {
            background: var(--card) !important;
            border-color: var(--border) !important;
            border-radius: var(--radius) !important;
        }
        .option:hover:not(.submitted) {
            border-color: var(--primary) !important;
            background: rgba(99, 102, 241, 0.04) !important;
        }
        .option.selected {
            border-color: var(--primary) !important;
            background: rgba(99, 102, 241, 0.08) !important;
        }
        .start-btn, .btn-next {
            background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
            color: white !important;
            border: none !important;
            box-shadow: 0 4px 14px rgba(99,102,241,0.35) !important;
            border-radius: 8px !important;
            transition: all 0.2s !important;
        }
        .start-btn:hover, .btn-next:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 6px 18px rgba(99,102,241,0.5) !important;
        }
        .timer-box {
            background: rgba(245, 158, 11, 0.1) !important;
            color: var(--warning) !important;
            border: 1px solid rgba(245, 158, 11, 0.2) !important;
            border-radius: var(--radius) !important;
        }
        .nav-question {
            border-radius: 8px !important;
            border-color: var(--border) !important;
        }
        .nav-question.current {
            border-color: var(--primary) !important;
            color: #818cf8 !important;
            background: rgba(99, 102, 241, 0.1) !important;
        }
        /* Custom scrollbar override */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--primary); }
    </style>
    <!-- END: Modern Premium Style Overrides -->
`;

function redesignFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already styled
    if (content.includes('/* Modern Premium Style Overrides */')) {
        return false;
    }
    
    // Inject override stylesheet right before </head>
    if (content.includes('</head>')) {
        content = content.replace('</head>', `${OVERRIDE_CSS}\n</head>`);
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    let count = 0;
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (file !== '.git' && file !== 'scratch') {
                count += scanDir(fullPath);
            }
        } else if (stat.isFile() && file.endsWith('.html')) {
            // Ignore index.html, index.bak.html
            if (file !== 'index.html' && file !== 'index.bak.html') {
                const redesigned = redesignFile(fullPath);
                if (redesigned) {
                    count++;
                }
            }
        }
    }
    return count;
}

console.log('Scanning workspace for HTML mock tests...');
const count = scanDir(__dirname);
console.log(`Successfully redesigned ${count} HTML mock files with premium styles!`);
