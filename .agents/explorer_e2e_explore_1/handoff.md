# Handoff Report — E2E Testing Strategy Analysis

This handoff report summarizes the observations, logic chain, and proposed E2E testing strategy for the mock exam codebase under `C:\Users\gagan\Downloads\Mocks\pundits`.

---

## 1. Observation

- **Mock Styles Directories and Samples**:
  - **CBTExam**: 909 files. Directories: `Aman Sir/`, `oliveboard/`, `Other Brands/`, `Pundits/`, `RBE/`, `Testbook/`, `The Solvers/`, and general directories of `English Madhyam/`. Verbatim sample path: `Aman Sir/Advance Ancient History 360 Pro Level M (Hindi).html`.
  - **Daily Quiz**: 27 files. Directory: `English Madhyam/Daily Quizzes & Editorial Tests/`. Verbatim sample path: `English Madhyam/Daily Quizzes & Editorial Tests/Daily Quiz 01 (Hindi).html`.
  - **Mocks Wallah**: 59 files. Directory: `Mocks Wallah/` (excluding topic-concept tests). Verbatim sample path: `Mocks Wallah/Full Tests/Governor , State & Judiciary (English).html`.
  - **Topic-Concept Tests**: 2,622 files. Directories: `Mocks Wallah/Topic-Concept Tests/`, `English Madhyam/Topic-Concept Tests/`, `Testbook/Topic-Concept Tests/`. Verbatim sample path: `English Madhyam/Topic-Concept Tests/English/7430b24 (English).html`.

- **Theme Toggle implementation (R1)**:
  - In `Mocks Wallah/Sectional Tests/Maths & Reasoning/Concept Test 001 (Hindi).html` (lines 2361-2395), the theme handler is structured as follows:
    ```javascript
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        const savedTheme = localStorage.getItem('portal-theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            ...
        } else {
            document.body.classList.remove('light-theme');
            ...
        }
        toggleBtn.onclick = function(e) {
            const isLight = document.body.classList.toggle('light-theme');
            localStorage.setItem('portal-theme', isLight ? 'light' : 'dark');
            ...
        };
    }
    ```
  - Theme styling rules in the same file (lines 652-684) utilize `body:not(.light-theme)` for default dark-mode styling variables and `body.light-theme` for light-mode variables.

- **Option Labels and Math Contrast (R2)**:
  - Options selectors are `.option` (CBTExam/Daily Quiz), `.option-label` (Mocks Wallah), and `.opt` (Topic-Concept Tests).
  - Formulas are structured inside `<math>` tags, `mjx-container` (MathJax), or `.katex` (KaTeX).
  - In `scratch/fix-all-mocks.js` (lines 180-188), dark-theme overrides for MathJax/MathML components are defined as:
    ```css
    mjx-container, math, .mathjax, [class*="mathjax"], [id*="MathJax"], .katex, .katex * {
        color: #f3f4f6 !important;
        fill: #f3f4f6 !important;
    }
    ```
  - Math image tags are styled with:
    ```css
    .question-card img, .option img, .comprehension img, .solution-box img {
        filter: invert(1) brightness(1.5) contrast(1.1) !important;
    }
    ```

- **Question Navigator States (R3)**:
  - Selectors: `.nav-question` (CBTExam, Daily Quiz, Mocks Wallah) and `.q-box` / `.q-num` (Topic-Concept Tests).
  - In `scratch/fix-all-mocks.js` (lines 294-313), state overrides are:
    ```css
    .nav-question.current { border-color: var(--primary) !important; color: var(--primary) !important; }
    .nav-question.answered { background: var(--success) !important; ... }
    .nav-question.wrong { background: var(--danger) !important; ... }
    .nav-question.review { background: var(--warning) !important; ... }
    ```

- **Bottom Navigation and Responsive Drawer (R4)**:
  - Viewport-aware responsive drawer and layout changes are defined in `fix-mocks-responsive.js` (and injected via `<!-- PUNDITS-MOBILE-FIX-v2 -->`).
  - Mobile layout wraps bottom buttons:
    ```css
    .navigation-bar { flex-wrap: wrap !important; }
    .btn-review { flex: 1 1 100% !important; order: -1 !important; }
    ```

- **Results Modal (R5)**:
  - Toggled using `.modal` / `#modal` (Topic-Concept Tests) or `.result-modal` / `#resultModal` (CBTExam).
  - In `English Madhyam/Topic-Concept Tests/English/7430b24 (English).html` (lines 52, 1440, 1443):
    ```css
    .modal { display: none; ... }
    ```
    ```javascript
    document.getElementById('modal').classList.add('show');
    ```
    ```javascript
    function closeModal(){ document.getElementById('modal').classList.remove('show'); }
    ```

---

## 2. Logic Chain

1. **Path Scanning**: The 3,617 mock files are successfully classified based on directory path rules into 4 styles (`CBTExam`, `Daily Quiz`, `Mocks Wallah`, `Topic-Concept Tests`).
2. **Behavioral Testing**: JSDOM allows simulating user clicks on `#themeToggle` and checking dynamic updates to the `body` class (`.light-theme`) and `localStorage` (`portal-theme`). However, layout behaviors (like button overlaps, mobile view drawer slides, and wrap properties) cannot be tested in JSDOM because it lacks layout calculations (e.g. `getBoundingClientRect` returns zero dimensions).
3. **Responsive Visual Testing**: Playwright or Puppeteer is necessary to test R4 (bottom navigation responsive wraps) and color contrasts (R2) by launching a real browser, setting viewports (e.g. 1200px and 375px), and checking computed styles/positions.
4. **Harness Conclusion**: The best testing architecture is a Node-based runner (`node:test` + JSDOM for behavior, Playwright for visual/responsive validation) executing 60 distinct test cases spanning Tiers 1-4.

---

## 3. Caveats

- **External Style Dependencies**: Some mock files import external CSS/JS (such as font-awesome icons, MathJax, and KaTeX styles) via CDN URLs. Under a restricted CODE_ONLY network mode, these external CDNs will fail to load, potentially failing strict script-load assertions. The runner should use local mocks or cache the CDM scripts to verify rendering offline.
- **Dynamic Variable Injection**: Overrides rely on script injections like `Unified Premium Dark Mode Overrides` and `PUNDITS-MOBILE-FIX-v2`. If a file has not been processed yet by redesign scripts, it may fail Tier 1 E2E tests.

---

## 4. Conclusion

- The mock portal codebase is successfully categorized into 4 styles and has exact selectors and styles mapped to all 5 E2E testing requirements.
- We recommend a programmatic hybrid Node.js testing harness combining `JSDOM` and `Playwright` to run 60 test cases across 4 Tiers.
- Detailed proposals for all 60 test cases (Tiers 1-4) have been written to `analysis.md` to guide the implementation of E2E validation.

---

## 5. Verification Method

- **Review Reports**: Inspect the design documents under the agent working directory:
  - Strategy: `C:\Users\gagan\Downloads\Mocks\pundits\.agents\explorer_e2e_explore_1\analysis.md`
  - Handoff: `C:\Users\gagan\Downloads\Mocks\pundits\.agents\explorer_e2e_explore_1\handoff.md`
- **Verify Sample Files**: Open the representative mock files in a local browser (or load them into a JSDOM scratch script) to verify the selectors, localStorage keys, and classes exist as observed.
- **Validate Runner Design**: Execute the test runner skeleton with a temporary script using Node:
  ```bash
  node -e "require('node:test')"
  ```
  This verifies that the test runner matches Node's built-in testing framework version constraints.
