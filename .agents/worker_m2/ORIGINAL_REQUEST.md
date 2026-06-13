## 2026-06-13T00:19:20Z

You are the Worker for Milestone 2.
Your working directory is: C:\Users\gagan\Downloads\Mocks\pundits\.agents\worker_m2
Identity: teamwork_preview_worker

Objective:
1. Create a NodeJS patcher script `scratch/patch-theme-toggle.js` that recursively processes all 909 CBTExam and 27 Daily Quiz mock exam files (excluding `index.html` and main dashboard files) and implements:
   - ID normalization: Replaces `id="theme-toggle"` and `id="themeBtn"` with `id="themeToggle"`.
   - Button injection: For files missing `#themeToggle`, injects:
     `<button class="theme-toggle" id="themeToggle" title="Toggle Theme"><i class="fas fa-moon"></i></button>`
     - If the container (`class="exam-timer"`, `class="header-controls"`, or `class="timer-bar"`) has `#pauseBtn`, inject the button after `#pauseBtn`'s closing tag (`</button>`).
     - Otherwise, inject after `#timer`'s closing tag (`</div>`).
   - Head Script Injection: Injects an inline script right after the opening `<head>` tag.
     The script must:
     - Wrap localStorage reads/writes in try-catch blocks to prevent crashes.
     - Prevent FOUC: Read `portal-theme` from `localStorage` (default 'dark'). If it is 'light', immediately add class 'light-theme' to `document.documentElement`, and set up a `MutationObserver` on `document.documentElement` to add the class 'light-theme' to `document.body` the instant it is created.
     - Resolve legacy listener conflicts: On `DOMContentLoaded`, look for `#themeToggle`, clone it using `cloneNode(true)`, replace the original with the clone to strip legacy listeners, synchronize initial icon state (sun for light, moon for dark), and add a clean event listener that toggles 'light-theme' on both `<html>` and `<body>` tags, stores the value in `localStorage` under `portal-theme`, and updates the icon.
   - Light Theme Stylesheet Overrides: Append custom light-theme overrides inside the CSS stylesheet block (`<!-- START: Unified Premium Dark Mode Overrides -->` style block or similar head style tag) to configure the style of `#themeToggle` and ensure readable text/contrasts in light theme:
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
     body.light-theme {
         --bg: #f3f4f6 !important;
         --card: #ffffff !important;
         --text: #1f2937 !important;
         --text-light: #6b7280 !important;
         --border: #d1d5db !important;
     }
     /* Additional override helpers to fix light-theme text colors and avoid white-on-white text */
     body.light-theme .exam-header {
         background: #ffffff !important;
         border-bottom: 1px solid var(--border) !important;
     }
     body.light-theme .exam-title, body.light-theme .exam-timer, body.light-theme .candidate-name {
         color: var(--text) !important;
     }
     body.light-theme .section-table th, body.light-theme table.section-table th {
         background: rgba(0, 0, 0, 0.05) !important;
         color: var(--text) !important;
     }
     /* Reset math images filter in light theme so they don't invert */
     body.light-theme .question-card img, 
     body.light-theme .option img, 
     body.light-theme .comprehension img, 
     body.light-theme .solution-box img {
         filter: none !important;
     }
     ```
2. Execute the patcher script `scratch/patch-theme-toggle.js` on the codebase to patch all 936 target files.
3. Validate HTML syntax of a sample of patched files. Run syntax or compilation checks if applicable.
4. Write a comprehensive report `handoff.md` summarizing the changes, number of files modified, validation checks run, and instructions for review.
