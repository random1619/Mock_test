# Mock Exam Codebase Exploration Analysis

This report documents the findings from a detailed read-only investigation of the mock exam codebase under `C:\Users\gagan\Downloads\Mocks\pundits`. 

---

## 1. Overview and Style Categorization

A scanning and feature extraction audit identified a total of **3617 mock exam HTML files** in the workspace. These files are served statically by a local Express server and packaged into a mobile application using Capacitor. 

Based on directory structure, file names, internal titles, and JS engine structures, the mock HTML files are grouped into four distinct styles:

| Style | Total Files | Brand / Directory Associations | Core Structural / JS Feature |
| :--- | :--- | :--- | :--- |
| **CBTExam** | 909 | `Aman Sir`, `English Madhyam` (General/CGL), `oliveboard`, `Other Brands`, `Pundits`, `RBE`, `Testbook`, `The Solvers` | Full-length tests using the `CBTExamApp` or related question-array engines. Often includes a welcome instruction screen, sidebar navigator, and a timer. |
| **Daily Quiz** | 27 | `English Madhyam/Daily Quizzes & Editorial Tests/` | Titled and path-scoped as "Daily Quiz". Uses `CBTExamApp` or class-based engines but configured for short editorial/daily tests. |
| **Mocks Wallah** | 59 | `Mocks Wallah/` (excluding `Topic-Concept Tests`) | Full-length exam mocks. Uses the `test` object metadata structure (`Format A`) with `correct` and `marks` mappings instead of simple question lists. |
| **Topic-Concept Tests** | 2622 | `Mocks Wallah/Topic-Concept Tests`, `English Madhyam/Topic-Concept Tests`, `Testbook/Topic-Concept Tests` | Focuses on single concept/topic tests. Uses a mix of lightweight page templates with a simpler layout, often referencing `.q-box` navigation instead of `.nav-question`. |

---

## 2. File Structures and Component Analysis

### A. File Structures
*   **CBTExam & Daily Quiz:**
    *   **Start Screen Overlay:** Uses `.welcome-screen` and `.welcome-container` modal overlays. Upon clicking the "Start Test" button, the modal is hidden (`.hidden`), and the timer and question cards are initialized.
    *   **Header Bar:** Displays the exam title and a timer box (`.timer-box`).
    *   **Two-Pane Split Layout:** The left pane displays the `.question-card` (containing comprehension text, question body, and options); the right pane houses the `.navigator-sidebar`.
*   **Mocks Wallah:**
    *   **Header:** Fixed top header `.header` containing branding, section dropdowns, and a countdown timer.
    *   **Dual Language Toggles:** Option labels and question bodies contain nested `.en` and `.hi` language tags, dynamically shown/hidden via the `.lang-toggle` handler.
    *   **Data Models:** Employs a complex `test` metadata object:
        ```javascript
        const test = {
            questions: 25,
            marks: 50,
            timer: 600,
            answers: {},
            correct: { "question_id": correct_index, ... },
            marks: { "question_id": { "positive": 2, "negative": 0.5 }, ... },
            sections: { "0": { "name": "Polity", ... } }
        };
        ```
*   **Topic-Concept Tests:**
    *   Mostly lightweight pages without a welcome overlay. They load directly into the quiz view.
    *   Questions are either parsed into inline elements or dynamically rendered from an array.

### B. Stylesheets and Theme Controls
*   **Fonts:** Core templates traditionally import `Space Grotesk` (for headers) and `Share Tech Mono` (for timers). 
*   **Branding CSS Variable Injections:** Prior iterations injected custom styles before `</head>` to set specific primary theme colors depending on the filepath (e.g. green for Oliveboard, sky blue for Testbook, amber for Pundits, purple for Aman Sir, pink for Mocks Wallah).
*   **Theme Toggle:** A portal dynamic theme handler script in each file reads `portal-theme` from `localStorage` to toggle `.light-theme` or `.dark-mode` body classes.

### C. MathJax / MathML Integration
*   Math equations are written using standard MathML tags (`<math>`, `<mfrac>`, `<mn>`, `<msqrt>`) or MathJax delimiters (`\(...\)`, `\[...\]`).
*   **Dark Mode Contrast Overrides:** To prevent illegible black math equations in dark mode, stylesheets in all files have been patched with the following rules:
    ```css
    mjx-container, math, .mathjax, [class*="mathjax"], [id*="MathJax"], .katex, .katex * {
        color: #f3f4f6 !important;
        fill: #f3f4f6 !important;
    }
    mjx-container svg *, math svg *, .katex svg * {
        fill: currentColor !important;
        stroke: currentColor !important;
    }
    ```
*   **Math Image Inversion:** For older questions using monochrome math GIFs/PNGs, an invert filter changes dark formulas to light formulas:
    ```css
    .question-card img, .option img, .comprehension img, .solution-box img {
        filter: brightness(0.88) invert(0.88) !important;
    }
    ```

### D. Question Navigator Styling
*   **Desktop:** Rendered as a sidebar grid (`.navigator-grid` or `#question-boxes`). Question buttons (`.nav-question` or `.q-box`) are styled with statuses:
    *   *Unattempted:* Muted background, light gray text.
    *   *Current Question:* Highlighted with the brand's primary border color.
    *   *Answered (Correct / Submitted):* High-contrast green background (`--success`).
    *   *Incorrect/Wrong:* Red background (`--danger`).
    *   *Marked for Review:* Orange/yellow background (`--warning`).
*   **Mobile Navigation Drawer:** Media queries in `fix-mocks-responsive.js` overlay `.mobile-navigator` as a drawer sliding from the right (`width: 85vw`, max-width `340px`). The grid is formatted into 5 columns (`repeat(5, 1fr)`) with enlarged touch-friendly button padding.

### E. Bottom Navigation
*   Contains control buttons (`.btn-prev`, `.btn-next`, `.btn-submit`, and `.btn-review`).
*   **Mobile Overflow Solution:** Squishing of buttons on narrow screens is solved by applying `flex-wrap: wrap !important` to the `.navigation-bar` and enforcing `.btn-review` to take `flex: 1 1 100%` with order `-1`. This positions "Mark for Review" on a top row of its own, keeping the bottom row dedicated to "Prev", "Next", and "Submit".

---

## 3. Redesign and Processing Scripts

A key part of this project involves processing, cleaning, and redesigning downloaded/scraped mocks. The scripts in the root and `scratch/` directory act as the build and maintenance toolchain:

### Root Scripts
1.  **`redesign-mocks.js` & `redesign-oliveboard.js`:**
    *   Initial override injectors. They scanned the workspace for HTML files and appended customized CSS blocks right before `</head>` containing variables (`--primary`, `--bg`, `--card`, `--border`, etc.) to create custom styled dashboards.
2.  **`fix-mocks-responsive.js`:**
    *   The primary mobile optimizer. It injects a comprehensive stylesheet tagged with `<!-- PUNDITS-MOBILE-FIX-v2 -->` to fix 19 layout, responsiveness, and touch-target issues.
    *   It also contains an auto-fix script that replaces generic page titles (like "devgagan" or "CBT Exam") with the welcome screen H1 title on page load.
3.  **`rename-mocks.js`:**
    *   Disk renaming tool. It cleans up ugly filenames (stripping ob ssc cgl, pundits, other brand prefixes; standardizing Tier II names), renames files dynamically, and then regenerates the manifest.
4.  **`server.js`:**
    *   Express development backend. Serves the files statically on port 3000, dynamically scans files as a fallback to `mocks-manifest.json`, and records user progress (solved, starred, bookmarks, scores) to `progress-db.json`.

### Scratch Directory Scripts
*   **`fix-all-mocks.js` & `redesign-all-mocks-unified.js`:**
    *   Scans all HTML files to remove Telegram advertising links/text spam, replace local absolute paths (e.g. `file:///C:/Users/...`) with relative hashes, and inject `Unified Premium Dark Mode Overrides` with brand-specific color-schemes.
*   **`audit-all-mocks.js`:**
    *   Performs structural health checks, flags dark mode contrast failures (like hardcoded black text colors), and writes an audit log to `audit-report.json`.
*   **`regenerate-manifest.js` & `rich_manifest.js`:**
    *   Walks the mock exam files and extracts rich metadata (number of questions, time limits, and marks) from JS variables (`test`, `questions`, `qs`, `quizData`). Updates the central index `mocks-manifest.json` and `mocks-manifest.js`.
*   **`rename_topic_concept.js` & `execute_rename.js`:**
    *   Generates a naming plan for the `Topic-Concept Tests` folder and renames them to follow a clean, standardized format.
*   **`upgrade_mocks.py`:**
    *   A legacy compiler script that parses question datasets from older formats and reconstructs them into modern unified templates.

---

## 4. Capacitor Native Compilation Wrapper

The local folder `www/` contains a lightweight `index.html` file that serves as the entry point for the compiled Android application (`com.pundits.cbt` package).
*   It implements a native bridge (`capacitor.js`) and a smooth loading splash screen.
*   It embeds an `<iframe>` targeting `https://pundits-mocks.onrender.com` (with a fallback to `http://localhost:3000` for local development).
*   It implements native handlers:
    *   **Auto-Reconnect/Retry:** If the backend on Render fails to respond, it displays a retry interface.
    *   **Back Button Handler:** Maps the Android physical back button to `iframe.contentWindow.history.back()`, minimizing the app only if there are no back navigation states left.
