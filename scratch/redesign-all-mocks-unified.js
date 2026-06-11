const fs = require('fs');
const path = require('path');

function getBrandColor(filePath) {
    const p = filePath.toLowerCase();
    if (p.includes('oliveboard')) {
        return { color: '#16a34a', hover: '#15803d' };
    }
    if (p.includes('testbook')) {
        return { color: '#0ea5e9', hover: '#0284c7' };
    }
    if (p.includes('pundits')) {
        return { color: '#f59e0b', hover: '#d97706' };
    }
    if (p.includes('english')) {
        return { color: '#10b981', hover: '#059669' };
    }
    if (p.includes('aman')) {
        return { color: '#8b5cf6', hover: '#7c3aed' };
    }
    if (p.includes('wallah')) {
        return { color: '#ec4899', hover: '#db2777' };
    }
    return { color: '#6366f1', hover: '#4f46e5' };
}

function generateCSS(brandColor, brandColorHover) {
    return `<!-- START: Unified Premium Dark Mode Overrides -->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        :root {
            --primary: ${brandColor} !important;
            --primary-hover: ${brandColorHover} !important;
            --success: #10b981 !important;
            --danger: #ef4444 !important;
            --warning: #f59e0b !important;
            --bg: #090d16 !important;
            --card: #111827 !important;
            --text: #f3f4f6 !important;
            --text-light: #9ca3af !important;
            --border: rgba(255, 255, 255, 0.08) !important;
            --font-sans: 'Plus Jakarta Sans', sans-serif !important;
            --radius: 10px !important;
        }

        body {
            background: var(--bg) !important;
            color: var(--text) !important;
            font-family: var(--font-sans) !important;
        }

        /* Container & Card Backgrounds */
        .welcome-screen, .exam-container, .question-area, .navigator-sidebar, .mobile-navigator {
            background: var(--bg) !important;
        }
        
        .welcome-container, .question-card, .option, .navigator-sidebar, .exam-header, 
        .navigation-bar, .footer, .candidate-bar, .footer-bar, .action-bar, .navigator-header, .navigator-legend {
            background: var(--card) !important;
            border-color: var(--border) !important;
            color: var(--text) !important;
        }

        .welcome-container, .question-card, .option, .navigator-sidebar {
            border: 1px solid var(--border) !important;
            border-radius: var(--radius) !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1) !important;
        }

        /* Welcome Screen Details & Tables */
        .detail-item {
            background: rgba(255, 255, 255, 0.03) !important;
            border-left: 3px solid var(--primary) !important;
            border-top: 1px solid var(--border) !important;
            border-right: 1px solid var(--border) !important;
            border-bottom: 1px solid var(--border) !important;
            border-radius: 6px !important;
        }
        .detail-label {
            color: var(--text-light) !important;
        }
        .detail-value {
            color: var(--primary) !important;
            font-weight: 700 !important;
        }
        .section-table, table.section-table {
            background: var(--card) !important;
            border: 1px solid var(--border) !important;
        }
        .section-table th, .section-table td, table.section-table th, table.section-table td {
            border: 1px solid var(--border) !important;
            background: transparent !important;
        }
        .section-table th, table.section-table th {
            background: rgba(255, 255, 255, 0.05) !important;
            color: #ffffff !important;
        }
        .section-table td, table.section-table td {
            color: var(--text) !important;
        }
        .subsec-row {
            color: var(--text-light) !important;
        }

        /* Top Exam Header */
        .exam-header {
            background: #151d30 !important; /* Sleek dark blue-gray */
            border-bottom: 1px solid var(--border) !important;
        }
        .exam-title, .exam-timer {
            color: #ffffff !important;
        }

        /* Candidate Info Bar - Sleek Dark Design */
        .candidate-bar {
            background: var(--card) !important;
            border-bottom: 1px solid var(--border) !important;
        }
        .candidate-name {
            color: #ffffff !important;
            font-weight: 600 !important;
        }
        .candidate-id, .candidate-details, .candidate-details * {
            color: var(--text-light) !important;
        }
        .candidate-photo {
            background: rgba(255, 255, 255, 0.03) !important;
            border: 1px solid var(--border) !important;
            color: var(--text-light) !important;
        }

        /* Section Tabs in Header */
        .section-badge {
            background: var(--primary) !important;
            color: #ffffff !important;
        }

        /* Language Toggle Buttons */
        .lang-toggle {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid var(--border) !important;
        }
        .lang-btn {
            color: var(--text-light) !important;
        }
        .lang-btn.active {
            background: var(--primary) !important;
            color: #ffffff !important;
        }

        /* High-Readability Contrast & Text Overrides */
        .question-text, .question-text *,
        .option, .option *,
        .comprehension, .comprehension *,
        .solution-box, .solution-box *,
        .candidate-bar *,
        .exam-title, .exam-title *,
        .timer-box, .timer-box *,
        .nav-question,
        table, tr, td, th {
            color: #e5e7eb !important;
        }

        /* Comprehension & Solution Box Cards */
        .comprehension {
            background: rgba(255, 255, 255, 0.02) !important;
            border-left: 4px solid var(--primary) !important;
            border-top: 1px solid var(--border) !important;
            border-right: 1px solid var(--border) !important;
            border-bottom: 1px solid var(--border) !important;
            border-radius: var(--radius) !important;
        }
        .comprehension h4 {
            color: var(--primary) !important;
            font-weight: 600 !important;
        }

        .solution-box {
            background: rgba(16, 185, 129, 0.08) !important;
            border-left: 4px solid var(--success) !important;
            border-top: 1px solid var(--border) !important;
            border-right: 1px solid var(--border) !important;
            border-bottom: 1px solid var(--border) !important;
            border-radius: var(--radius) !important;
        }
        .solution-header {
            color: var(--success) !important;
        }

        /* Formulas & Math Layout legibility */
        mjx-container, math, .mathjax, [class*="mathjax"], [id*="MathJax"], .katex, .katex * {
            color: #f3f4f6 !important;
            fill: #f3f4f6 !important;
        }
        
        mjx-container svg *, math svg *, .katex svg * {
            fill: currentColor !important;
            stroke: currentColor !important;
        }
        
        .math-exp, .math-num, .math-line {
            color: inherit !important;
        }

        /* Auto-invert monochrome math images/gifs for dark mode readability */
        .question-card img, .option img, .comprehension img, .solution-box img {
            filter: invert(1) brightness(1.5) contrast(1.1) !important;
        }

        /* Tables layout & readability */
        table, tr, td, th {
            border-color: rgba(255, 255, 255, 0.12) !important;
        }
        th {
            background: rgba(255, 255, 255, 0.05) !important;
            color: #ffffff !important;
            font-weight: 600 !important;
        }

        /* Option Box States */
        .option {
            background: rgba(255, 255, 255, 0.01) !important;
            border: 1.5px solid var(--border) !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .option:hover:not(.submitted):not(.correct):not(.wrong):not(.selected) {
            border-color: var(--primary) !important;
            background: rgba(255, 255, 255, 0.03) !important;
        }
        .option.selected {
            border-color: var(--primary) !important;
            background: rgba(255, 255, 255, 0.06) !important;
        }
        .option.selected, .option.selected * {
            color: #ffffff !important;
        }
        .option.correct, .option.correct * {
            color: #10b981 !important;
            background: rgba(16, 185, 129, 0.1) !important;
            border-color: var(--success) !important;
        }
        .option.wrong, .option.wrong * {
            color: #ef4444 !important;
            background: rgba(239, 68, 68, 0.1) !important;
            border-color: var(--danger) !important;
        }

        .option-indicator {
            border-color: rgba(255, 255, 255, 0.3) !important;
            background: transparent !important;
        }
        .option.selected .option-indicator {
            border-color: var(--primary) !important;
            background: var(--primary) !important;
        }
        .option.correct .option-indicator {
            border-color: var(--success) !important;
            background: var(--success) !important;
        }
        .option.wrong .option-indicator {
            border-color: var(--danger) !important;
            background: var(--danger) !important;
        }

        /* Buttons & Actions */
        .start-btn, .btn-next {
            background: var(--primary) !important;
            color: white !important;
            font-weight: 600 !important;
            border: none !important;
            border-radius: var(--radius) !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2) !important;
        }
        .start-btn:hover, .btn-next:hover {
            background: var(--primary-hover) !important;
            box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35) !important;
        }
        
        .btn-prev {
            background: rgba(255, 255, 255, 0.06) !important;
            color: #f3f4f6 !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: var(--radius) !important;
            transition: all 0.2s ease !important;
        }
        .btn-prev:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.1) !important;
        }

        .timer-box {
            background: rgba(245, 158, 11, 0.08) !important;
            color: var(--warning) !important;
            border: 1px solid rgba(245, 158, 11, 0.2) !important;
            border-radius: 6px !important;
        }

        /* Question Sidebar & Navigator Grid */
        .nav-question {
            background: rgba(255, 255, 255, 0.02) !important;
            border-color: var(--border) !important;
            border-radius: 6px !important;
            color: var(--text-light) !important;
            transition: all 0.15s ease !important;
        }
        .nav-question:hover {
            background: rgba(255, 255, 255, 0.08) !important;
            color: var(--text) !important;
        }
        .nav-question.current {
            border-color: var(--primary) !important;
            color: var(--primary) !important;
            background: rgba(255, 255, 255, 0.08) !important;
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

        /* Welcome Instructions Panel */
        .welcome-instructions {
            background: rgba(245, 158, 11, 0.08) !important;
            border: 1px solid rgba(245, 158, 11, 0.2) !important;
            color: #fef08a !important;
            border-radius: var(--radius) !important;
        }
        .welcome-instructions h3 {
            color: #fbbf24 !important;
        }
        .welcome-instructions ul, .welcome-instructions li {
            color: #fef08a !important;
        }

        /* Section Tabs styling */
        .section-tabs {
            counter-reset: section-counter;
            display: flex !important;
            gap: 8px !important;
            background: rgba(0, 0, 0, 0.3) !important;
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
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
        }
        .section-tab.active::before {
            background: rgba(255, 255, 255, 0.2) !important;
            color: #ffffff !important;
        }

        /* Webkit custom scrollbars */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.12); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--primary); }

        /* Option Hover Premium Shimmer */
        .option {
            position: relative;
            overflow: hidden;
        }
        .option::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02), transparent);
            transform: translateX(-100%);
            transition: transform 0.6s ease;
        }
        .option:hover::after {
            transform: translateX(100%);
        }

        /* Active Section badge glow */
        .section-badge {
            background: var(--primary) !important;
            color: #ffffff !important;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15), 0 0 1px var(--primary) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            font-weight: 700 !important;
        }

        /* Result Screen & Statistics Modal */
        .result-modal {
            background: rgba(9, 13, 22, 0.85) !important;
            backdrop-filter: blur(8px) !important;
        }
        .result-container {
            background: var(--card) !important;
            border: 1px solid var(--border) !important;
            border-radius: var(--radius) !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4) !important;
            color: var(--text) !important;
        }
        .result-header h2 {
            color: #ffffff !important;
        }
        .result-score {
            font-size: 42px !important;
            font-weight: 800 !important;
            background: linear-gradient(135deg, var(--primary), #a78bfa) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            margin: 10px 0 !important;
        }
        .result-stat {
            background: rgba(255, 255, 255, 0.02) !important;
            border: 1px solid var(--border) !important;
            border-radius: 8px !important;
        }
        .result-stat-value {
            color: #ffffff !important;
            font-weight: 700 !important;
        }
        .result-stat-label {
            color: var(--text-light) !important;
        }
        .result-stat.correct .result-stat-value {
            color: var(--success) !important;
        }
        .result-stat.incorrect .result-stat-value {
            color: var(--danger) !important;
        }
        
        .section-results h3 {
            color: #ffffff !important;
            margin-bottom: 12px !important;
        }
        .section-results-table, table.section-results-table {
            background: rgba(255, 255, 255, 0.01) !important;
            border: 1px solid var(--border) !important;
            width: 100% !important;
            border-collapse: collapse !important;
        }
        .section-results-table th, .section-results-table td {
            border: 1px solid var(--border) !important;
            color: var(--text) !important;
            padding: 10px !important;
        }
        .section-results-table th {
            background: rgba(255, 255, 255, 0.04) !important;
            color: #ffffff !important;
            font-weight: 600 !important;
        }
        
        .result-btn {
            padding: 10px 24px !important;
            border-radius: 6px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            font-size: 14px !important;
        }
        .result-btn.btn-close {
            background: rgba(255, 255, 255, 0.08) !important;
            color: #f3f4f6 !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .result-btn.btn-close:hover {
            background: rgba(255, 255, 255, 0.12) !important;
        }
        .result-btn.btn-review-ans {
            background: var(--primary) !important;
            color: white !important;
            border: none !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
        }
        .result-btn.btn-review-ans:hover {
            background: var(--primary-hover) !important;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3) !important;
        }
    </style>
    <!-- END: Unified Premium Dark Mode Overrides -->`;
}

function redesignFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const brand = getBrandColor(filePath);
    const unifiedCSS = generateCSS(brand.color, brand.hover);
    
    // Always replace to apply the latest high readability CSS overrides
    const blocks = [
        { start: '<!-- START: Oliveboard Professional Style Overrides -->', end: '<!-- END: Oliveboard Professional Style Overrides -->' },
        { start: '<!-- START: Oliveboard Premium Style Overrides -->', end: '<!-- END: Oliveboard Premium Style Overrides -->' },
        { start: '<!-- START: Modern Premium Style Overrides -->', end: '<!-- END: Modern Premium Style Overrides -->' },
        { start: '<!-- START: Unified Premium Dark Mode Overrides -->', end: '<!-- END: Unified Premium Dark Mode Overrides -->' }
    ];
    
    let replaced = false;
    for (const block of blocks) {
        if (content.includes(block.start) && content.includes(block.end)) {
            const startIndex = content.indexOf(block.start);
            const endIndex = content.indexOf(block.end) + block.end.length;
            content = content.substring(0, startIndex) + unifiedCSS + content.substring(endIndex);
            replaced = true;
            break;
        }
    }
    
    if (!replaced && content.includes('</head>')) {
        content = content.replace('</head>', `${unifiedCSS}\n</head>`);
        replaced = true;
    }
    
    if (replaced) {
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
const totalRedesigned = scanDir(path.join(__dirname, '..'));
console.log(`Successfully redesigned ${totalRedesigned} mock files with unified premium overrides!`);
