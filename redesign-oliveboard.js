const fs = require('fs');
const path = require('path');

const OLIVEBOARD_OVERRIDE_CSS = `
    <!-- START: Oliveboard Professional Style Overrides -->
    <style>
        /* Oliveboard Professional Style Overrides */
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        :root {
            --primary: #16a34a !important; /* Professional Muted Green */
            --primary-hover: #15803d !important;
            --success: #10b981 !important;
            --danger: #ef4444 !important;
            --warning: #f59e0b !important;
            --bg: #090d16 !important; /* Sleek Dark Gray-Blue */
            --card: #111827 !important; /* Elegant Card Dark */
            --text: #f3f4f6 !important;
            --text-light: #9ca3af !important;
            --border: rgba(255, 255, 255, 0.08) !important;
            --font-sans: 'Plus Jakarta Sans', sans-serif !important;
            --radius: 8px !important;
        }
        body {
            background: var(--bg) !important;
            color: var(--text) !important;
            font-family: var(--font-sans) !important;
        }
        .welcome-screen {
            background: var(--bg) !important;
        }
        .welcome-container, .question-card, .option, .navigator-sidebar, .exam-header, .navigation-bar {
            background: var(--card) !important;
            border: 1px solid var(--border) !important;
            border-radius: var(--radius) !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
        .option {
            transition: all 0.15s ease !important;
        }
        .option:hover:not(.submitted) {
            border-color: var(--primary) !important;
            background: rgba(22, 163, 74, 0.04) !important;
        }
        .option.selected {
            border-color: var(--primary) !important;
            background: rgba(22, 163, 74, 0.08) !important;
        }
        .start-btn, .btn-next {
            background: var(--primary) !important;
            color: white !important;
            font-weight: 600 !important;
            border: none !important;
            border-radius: 6px !important;
            transition: background 0.15s ease !important;
            box-shadow: none !important;
        }
        .start-btn:hover, .btn-next:hover {
            background: var(--primary-hover) !important;
            transform: none !important;
        }
        .timer-box {
            background: rgba(245, 158, 11, 0.08) !important;
            color: var(--warning) !important;
            border: 1px solid rgba(245, 158, 11, 0.2) !important;
            border-radius: 6px !important;
            box-shadow: none !important;
        }
        .nav-question {
            border-radius: 6px !important;
            border-color: var(--border) !important;
            transition: all 0.15s ease !important;
        }
        .nav-question.current {
            border-color: var(--primary) !important;
            color: var(--primary) !important;
            background: rgba(22, 163, 74, 0.08) !important;
        }
        .nav-question.answered {
            background: var(--success) !important;
            border-color: var(--success) !important;
            color: white !important;
        }
        .nav-question.wrong {
            background: var(--danger) !important;
            border-color: var(--danger) !important;
            color: white !important;
        }
        .nav-question.review {
            background: var(--warning) !important;
            border-color: var(--warning) !important;
            color: white !important;
        }
        /* Custom scrollbar override */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--primary); }
    </style>
    <!-- END: Oliveboard Professional Style Overrides -->
`;

function redesignFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already styled with Oliveboard professional overrides
    if (content.includes('/* Oliveboard Professional Style Overrides */')) {
        return false;
    }
    
    // Check for target blocks to replace
    const blocks = [
        { start: '<!-- START: Oliveboard Premium Style Overrides -->', end: '<!-- END: Oliveboard Premium Style Overrides -->' },
        { start: '<!-- START: Modern Premium Style Overrides -->', end: '<!-- END: Modern Premium Style Overrides -->' }
    ];
    
    for (const block of blocks) {
        if (content.includes(block.start) && content.includes(block.end)) {
            const startIndex = content.indexOf(block.start);
            const endIndex = content.indexOf(block.end) + block.end.length;
            content = content.substring(0, startIndex) + OLIVEBOARD_OVERRIDE_CSS + content.substring(endIndex);
            fs.writeFileSync(filePath, content, 'utf8');
            return true;
        }
    }
    
    // Otherwise inject right before </head>
    if (content.includes('</head>')) {
        content = content.replace('</head>', `${OLIVEBOARD_OVERRIDE_CSS}\n</head>`);
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
            count += scanDir(fullPath);
        } else if (stat.isFile() && file.endsWith('.html')) {
            const redesigned = redesignFile(fullPath);
            if (redesigned) {
                count++;
            }
        }
    }
    return count;
}

const targetDir = path.join(__dirname, 'oliveboard');
console.log(`Scanning directory: ${targetDir} for Oliveboard HTML files...`);
if (fs.existsSync(targetDir)) {
    const count = scanDir(targetDir);
    console.log(`Successfully redesigned ${count} Oliveboard HTML mock files with professional styles!`);
} else {
    console.error(`Error: Oliveboard directory not found at ${targetDir}`);
}
