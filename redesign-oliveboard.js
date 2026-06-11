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
        
        /* High-Readability Contrast & Font Sizes */
        .question-text {
            font-size: 16.5px !important;
            line-height: 1.65 !important;
            letter-spacing: 0.1px !important;
        }
        .option {
            font-size: 15.5px !important;
            line-height: 1.5 !important;
            transition: all 0.15s ease !important;
        }
        
        /* Force color readability for nested content (overrides raw inline styling) */
        .question-text, .question-text *, 
        .option:not(.correct):not(.wrong):not(.selected), .option:not(.correct):not(.wrong):not(.selected) *,
        .comprehension, .comprehension *,
        .solution-box, .solution-box * {
            color: #e5e7eb !important;
        }
        
        .option:hover:not(.submitted):not(.correct):not(.wrong):not(.selected) {
            border-color: var(--primary) !important;
            background: rgba(22, 163, 74, 0.04) !important;
        }
        .option.selected {
            border-color: var(--primary) !important;
            background: rgba(22, 163, 74, 0.08) !important;
        }
        .option.selected, .option.selected * {
            color: #ffffff !important;
        }
        .option.correct, .option.correct * {
            color: #10b981 !important;
        }
        .option.wrong, .option.wrong * {
            color: #ef4444 !important;
        }
        
        /* Math expressions formatting */
        .math-exp, .math-num, .math-line {
            color: inherit !important;
        }
        
        /* Tables layout & readability */
        table, tr, td, th {
            border-color: rgba(255, 255, 255, 0.12) !important;
            color: #e5e7eb !important;
        }
        th {
            background: rgba(255, 255, 255, 0.05) !important;
            color: #ffffff !important;
            font-weight: 600 !important;
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

        /* Creative Section Navigator Pills */
        .section-tabs {
            counter-reset: section-counter;
            display: flex !important;
            gap: 8px !important;
            background: rgba(0, 0, 0, 0.2) !important;
            border: 1px solid var(--border) !important;
            padding: 6px 12px !important;
            border-radius: 30px !important;
            margin: 12px auto !important;
            width: fit-content !important;
            max-width: calc(100% - 40px) !important;
            overflow-x: auto !important;
            scrollbar-width: none !important;
        }
        .section-tabs::-webkit-scrollbar {
            display: none !important;
        }
        .section-tab {
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            padding: 8px 16px !important;
            border: 1px solid transparent !important;
            background: transparent !important;
            color: var(--text-light) !important;
            font-weight: 600 !important;
            font-size: 13px !important;
            border-radius: 20px !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            cursor: pointer !important;
            border-bottom: none !important;
            white-space: nowrap !important;
        }
        .section-tab::before {
            counter-increment: section-counter;
            content: "0" counter(section-counter);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.08);
            color: var(--text-light);
            border-radius: 50%;
            font-size: 10px;
            font-weight: 700;
            transition: all 0.2s ease;
        }
        .section-tab:hover {
            color: var(--text) !important;
            background: rgba(255, 255, 255, 0.03) !important;
        }
        .section-tab.active {
            background: var(--primary) !important;
            color: #ffffff !important;
            border-color: var(--primary) !important;
            box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25) !important;
        }
        .section-tab.active::before {
            background: rgba(255, 255, 255, 0.2) !important;
            color: #ffffff !important;
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
    
    // Always replace to apply latest high readability CSS overrides
    const blocks = [
        { start: '<!-- START: Oliveboard Professional Style Overrides -->', end: '<!-- END: Oliveboard Professional Style Overrides -->' },
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
    console.log(`Successfully redesigned ${count} Oliveboard HTML mock files with high readability overrides!`);
} else {
    console.error(`Error: Oliveboard directory not found at ${targetDir}`);
}
