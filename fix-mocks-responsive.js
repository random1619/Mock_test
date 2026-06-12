/**
 * fix-mocks-responsive.js
 * Patches ALL HTML mock files to fix:
 *   1. Generic <title> tags (devgagan / CBT Exam - pundits)
 *   2. Mobile layout — navigation bar overflow
 *   3. Question area height on mobile
 *   4. Dark mode mobile navigator gap
 *   5. No breakpoint for 360-480px phones
 *   6. Candidate bar overflow
 *   7. Question header collision
 *   8. Welcome container padding
 *   9. Result modal not scrollable
 *  10. Section table not scrollable
 *  11. Timer box cut off
 *  12. Solution stats overflow
 *  13. Touch-action optimization
 *  14. Telegram links hidden
 *  15. Review button dark mode color
 *  16. Legend items touch size
 *  17. Focus-visible accessibility
 *  18. Image invert filter
 *  19. Exam title overflow
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PATCH_MARKER = '<!-- PUNDITS-MOBILE-FIX-v2 -->';

// The comprehensive CSS+JS patch injected before </head>
const PATCH_CSS = `
${PATCH_MARKER}
<style>
/* ═══════════════════════════════════════════════════════════════════
   PUNDITS CBT — UNIVERSAL MOBILE & DESIGN FIX PATCH v2
   Fixes: 19 issues across all HTML mock files
   ═══════════════════════════════════════════════════════════════════ */

/* ── Fix 14: Hide Telegram / channel links ────────────────────── */
.channel-link,
a[href*="t.me"],
a[href*="telegram"],
a[href*="youtube.com/@"],
.telegram-link, .yt-link {
  display: none !important;
}

/* ── Fix 19: Exam title overflow in header ───────────────────── */
.exam-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 55%;
  min-width: 0;
}

/* ── Fix 11: Timer box — prevent shrink ─────────────────────── */
.exam-timer {
  flex-shrink: 0;
}
.timer-box {
  flex-shrink: 0;
  white-space: nowrap;
}

/* ── Fix 15: Mark-for-Review button in dark mode ────────────── */
.btn-review {
  background: rgba(245, 158, 11, 0.12) !important;
  color: #f59e0b !important;
  border: 1px solid rgba(245, 158, 11, 0.35) !important;
}
.btn-review.marked {
  background: rgba(245, 158, 11, 0.25) !important;
  color: #fcd34d !important;
  border-color: rgba(245, 158, 11, 0.5) !important;
}

/* ── Fix 13: Touch-action optimization ──────────────────────── */
.option,
.nav-btn,
.nav-question,
.section-tab,
.start-btn,
.lang-btn {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* ── Fix 17: Focus-visible accessibility ────────────────────── */
.option:focus-visible,
.nav-btn:focus-visible,
.nav-question:focus-visible,
.section-tab:focus-visible,
.start-btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* ── Fix 18: Image invert filter — less aggressive ──────────── */
.question-card img,
.option img,
.comprehension img,
.solution-box img {
  filter: brightness(0.88) invert(0.88) !important;
}

/* ── Fix 10: Section table horizontal scroll ────────────────── */
.section-info {
  overflow-x: auto;
}
.section-table {
  min-width: 400px;
}

/* ── Fix 9: Result modal scrollable ─────────────────────────── */
.result-container {
  max-height: 92vh;
  overflow-y: auto;
}

/* ── Fix 4: Dark mode mobile navigator complete ─────────────── */
.mobile-navigator {
  background: var(--card) !important;
}
.mobile-navigator *:not(.nav-question):not(.nav-question *) {
  color: var(--text) !important;
}

/* ── Fix 16: Legend items — larger touch targets ────────────── */
.legend-box {
  width: 20px !important;
  height: 20px !important;
  border-radius: 4px !important;
  flex-shrink: 0;
}
.navigator-legend {
  font-size: 13px !important;
  gap: 10px !important;
}
.legend-item {
  gap: 10px !important;
  padding: 2px 0;
}

/* ── Fix 12: Solution stats wrap ────────────────────────────── */
.solution-stats {
  flex-wrap: wrap !important;
  gap: 8px !important;
}

/* ── Fix 6: Candidate bar — prevent overflow ────────────────── */
.candidate-bar {
  flex-wrap: wrap;
  gap: 6px;
}
.candidate-info {
  min-width: 0;
  flex: 1;
}
.candidate-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

/* ══════════════════════════════════════════════════════
   RESPONSIVE BREAKPOINTS
   ══════════════════════════════════════════════════════ */

/* ── Fix 8: Welcome container — tablet/small laptop ─── */
@media (max-width: 768px) {
  .welcome-container {
    padding: 20px !important;
    margin: 10px auto !important;
  }
  .test-details {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px !important;
  }
}

/* ── Fix 5 + 2 + 3 + 6 + 7 + 8: Phone breakpoint ──── */
@media (max-width: 480px) {

  /* Welcome screen */
  .welcome-container {
    padding: 14px !important;
    margin: 6px !important;
    border-radius: 8px !important;
  }
  .welcome-header h1 {
    font-size: 18px !important;
  }
  .test-details {
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
  }
  .detail-item {
    padding: 10px 12px !important;
  }
  .detail-value {
    font-size: 15px !important;
  }
  .welcome-actions {
    gap: 10px !important;
  }
  .start-btn {
    padding: 12px 24px !important;
    font-size: 14px !important;
    width: 100% !important;
    justify-content: center !important;
  }

  /* Exam header — Fix 11, 19 */
  .exam-header {
    padding: 8px 12px !important;
    gap: 8px !important;
  }
  .exam-title {
    font-size: 13px !important;
    max-width: 48% !important;
  }
  .timer-box {
    font-size: 13px !important;
    padding: 5px 10px !important;
  }

  /* Candidate bar — Fix 6 */
  .candidate-bar {
    padding: 6px 12px !important;
    gap: 4px !important;
  }
  .candidate-name {
    font-size: 12px !important;
    max-width: 140px !important;
  }
  .candidate-details {
    font-size: 11px !important;
  }
  .section-badge {
    font-size: 10px !important;
    padding: 3px 7px !important;
  }

  /* Section tabs */
  .section-tab {
    padding: 8px 12px !important;
    font-size: 12px !important;
  }

  /* Question area — Fix 3 */
  .question-area {
    height: calc(100vh - 185px) !important;
  }
  .question-scroll {
    padding: 10px !important;
  }

  /* Question card */
  .question-card {
    padding: 14px 12px !important;
  }

  /* Question header — Fix 7 */
  .question-header {
    flex-wrap: wrap !important;
    gap: 8px !important;
    align-items: flex-start !important;
  }
  .question-number {
    font-size: 15px !important;
  }
  .question-marks {
    font-size: 11px !important;
  }
  .lang-toggle {
    margin-left: auto;
  }

  /* Question text */
  .question-text {
    font-size: 14px !important;
    line-height: 1.65 !important;
  }

  /* Options */
  .option {
    padding: 11px 12px !important;
    gap: 10px !important;
  }
  .option-indicator {
    width: 20px !important;
    height: 20px !important;
    font-size: 11px !important;
    flex-shrink: 0;
  }

  /* Comprehension block */
  .comprehension {
    padding: 12px !important;
    font-size: 13px !important;
  }

  /* Solution box */
  .solution-box {
    padding: 12px !important;
  }
  .solution-header {
    font-size: 14px !important;
  }

  /* ── Fix 2: Navigation bar — Fix overflow ──────────── */
  .navigation-bar {
    padding: 8px 10px !important;
    flex-wrap: wrap !important;
    gap: 6px !important;
    justify-content: space-between !important;
  }
  .nav-btn {
    padding: 8px 12px !important;
    font-size: 12px !important;
    gap: 5px !important;
    flex: 1 1 auto;
    min-width: 0;
    justify-content: center;
    white-space: nowrap;
  }
  .btn-prev, .btn-next, .btn-submit {
    flex: 0 1 auto !important;
  }
  .btn-review {
    flex: 1 1 100% !important;
    order: -1 !important; /* Show "Mark for Review" on top row */
    margin-bottom: 2px;
  }
  .progress-info {
    display: none !important; /* Hide "Q 3 of 30" text to save space */
  }

  /* Result modal — Fix 9 */
  .result-container {
    padding: 16px !important;
    max-height: 88vh !important;
    border-radius: 12px !important;
  }
  .result-score {
    font-size: 26px !important;
  }
  .result-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
  }
  .result-stat-value {
    font-size: 17px !important;
  }

  /* Navigator sidebar (when shown as modal on mobile) */
  .mobile-navigator {
    width: 85vw !important;
    max-width: 340px !important;
  }
  .navigator-grid {
    grid-template-columns: repeat(5, 1fr) !important;
    gap: 6px !important;
    padding: 12px !important;
  }
  .nav-question {
    font-size: 11px !important;
    min-height: 32px !important;
  }
}

/* ── Very small phones (360px) ───────────────────────── */
@media (max-width: 380px) {
  .exam-title {
    font-size: 12px !important;
    max-width: 42% !important;
  }
  .nav-btn {
    padding: 7px 9px !important;
    font-size: 11px !important;
  }
  .option {
    padding: 10px 10px !important;
  }
  .question-text {
    font-size: 13px !important;
  }
  .start-btn {
    padding: 11px 20px !important;
    font-size: 13px !important;
  }
}
</style>
<script>
/* ── Fix 1: Auto-fix generic page titles ───────────────────── */
(function fixPageTitle() {
  const genericTitles = ['devgagan', 'CBT Exam - pundits', 'CBT Exam'];
  const currentTitle = document.title || '';
  const isGeneric = genericTitles.some(g => currentTitle.toLowerCase() === g.toLowerCase());
  if (isGeneric) {
    // Try to get title from welcome header h1
    document.addEventListener('DOMContentLoaded', function() {
      const h1 = document.querySelector('.welcome-header h1, .welcome-header h2');
      if (h1 && h1.textContent.trim()) {
        document.title = h1.textContent.trim().substring(0, 80);
      }
    });
  }
})();
</script>
`;

let totalFixed = 0;
let totalSkipped = 0;
let totalErrors = 0;

function getAllHtmlFiles(dir) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip node_modules, android, www, .git
        if (!['node_modules', 'android', 'www', '.git', 'scratch'].includes(entry.name)) {
          results.push(...getAllHtmlFiles(fullPath));
        }
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
        results.push(fullPath);
      }
    }
  } catch (e) {
    console.error(`Error reading dir ${dir}:`, e.message);
  }
  return results;
}

function patchFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already patched
    if (content.includes(PATCH_MARKER)) {
      totalSkipped++;
      return;
    }

    // Skip if it's the main portal index
    if (filePath.includes('index.html') && content.includes('Study Asset Hub')) {
      totalSkipped++;
      return;
    }

    // Find </head> and inject before it
    const headCloseIdx = content.lastIndexOf('</head>');
    if (headCloseIdx === -1) {
      console.warn(`  [SKIP] No </head> found: ${path.basename(filePath)}`);
      totalSkipped++;
      return;
    }

    const newContent = content.slice(0, headCloseIdx) + PATCH_CSS + '\n' + content.slice(headCloseIdx);
    fs.writeFileSync(filePath, newContent, 'utf8');
    totalFixed++;

    if (totalFixed % 100 === 0) {
      console.log(`  Progress: ${totalFixed} files patched...`);
    }
  } catch (e) {
    console.error(`  [ERROR] ${path.basename(filePath)}: ${e.message}`);
    totalErrors++;
  }
}

console.log('🔍 Scanning for HTML mock files...');
const allFiles = getAllHtmlFiles(ROOT);
console.log(`📁 Found ${allFiles.length} HTML files\n`);

console.log('🔧 Applying patches...');
for (const file of allFiles) {
  patchFile(file);
}

console.log('\n✅ Patch complete!');
console.log(`   Fixed  : ${totalFixed} files`);
console.log(`   Skipped: ${totalSkipped} files (already patched or excluded)`);
console.log(`   Errors : ${totalErrors} files`);
