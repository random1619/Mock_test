# Mock Exam E2E Testing Strategy Analysis

This report documents the E2E testing strategy designed to verify the compliance of static mock exam files under `C:\Users\gagan\Downloads\Mocks\pundits` across 4 mock styles and 5 core requirements.

---

## 1. Directory Structure and Styles Mapping

The codebase contains exactly **3,617 mock HTML files** mapped to 4 distinct mock styles:

| Mock Style | Directory Associations | Representative File | Core Layout & Engine Characteristics |
| :--- | :--- | :--- | :--- |
| **CBTExam** | `Aman Sir/`, `oliveboard/`, `Other Brands/`, `Pundits/`, `RBE/`, `Testbook/`, `The Solvers/`, and `English Madhyam/` (excluding topic-concept & daily tests) | `Aman Sir/Advance Ancient History 360 Pro Level M (Hindi).html` | Includes `.welcome-screen` overlay (with `#startBtn`), a `.exam-container` layout, a split-pane layout with `.question-card` (left) and `.navigator-sidebar` (right), and uses the `CBTExamApp` JS engine. |
| **Daily Quiz** | `English Madhyam/Daily Quizzes & Editorial Tests/` | `English Madhyam/Daily Quizzes & Editorial Tests/Daily Quiz 01 (Hindi).html` | Layout and engine are identical to CBTExam but configured for shorter duration (daily editorial quizzes). |
| **Mocks Wallah** | `Mocks Wallah/` (excluding topic-concept tests) | `Mocks Wallah/Full Tests/Governor , State & Judiciary (English).html` | Fixed top `.header` with section selectors, language toggles (`.en`/`.hi`), a central question card `.q-card`, and sidebar `.question-nav`. Employs a complex metadata object `const test = { ... }` with explicit marking schemes. |
| **Topic-Concept Tests** | `Mocks Wallah/Topic-Concept Tests/`, `English Madhyam/Topic-Concept Tests/`, `Testbook/Topic-Concept Tests/` | `English Madhyam/Topic-Concept Tests/English/7430b24 (English).html` | Lightweight, single-page quizzes without a welcome overlay. Directly initializes on `window.onload` with `ini()`. Questions are rendered from `const qs = [...]`. Contains a bottom navigator `.nav` and results modal `.modal`. |

---

## 2. Requirement Audits (R1 to R5)

### R1: Theme Toggle & Persistence
*   **Elements & Selectors**: Theme toggle button `#themeToggle` (with icon `<i>` child). Body class `.light-theme`. LocalStorage key `portal-theme` (`'light' | 'dark'`, default `'dark'`).
*   **Behavioral Flow**:
    1.  **FOUC Prevention**: A lightweight script must run in the `<head>` *before* the body is parsed. It reads `portal-theme` from `localStorage` and applies `.light-theme` to `body` if the value is `'light'`.
    2.  **Toggle Action**: Clicking `#themeToggle` toggles `.light-theme` on `body`, updates `localStorage` (`portal-theme`), and updates the icon classes between `fa-moon` and `fa-sun`.
*   **Testing Approach**:
    *   Initialize a mock window (e.g. via `JSDOM`) or a headless browser (e.g. `Playwright`).
    *   Verify the presence of `#themeToggle`.
    *   Set `localStorage.setItem('portal-theme', 'light')` and verify the body contains class `.light-theme` upon load.
    *   Trigger click on `#themeToggle` and assert class is removed and `localStorage` updates to `'dark'`.

### R2: Option Labels & Formula Contrast
*   **Elements & Selectors**:
    *   *Option Labels*: `.option` (CBTExam/Daily Quiz), `.option-label` (Mocks Wallah), and `.opt` (Topic-Concept Tests).
    *   *Formula Components*: MathML tags (`<math>`, `<mfrac>`, `<mn>`, `<msqrt>`), MathJax wrapper classes (`mjx-container`, `.mathjax`, `[class*="mathjax"]`, `[id*="MathJax"]`), KaTeX elements (`.katex`, `.katex *`), and math images (`img` under option/question cards).
*   **Current Styling**:
    *   *Dark Mode*: Injected style block `<!-- START: Unified Premium Dark Mode Overrides -->` forces text color `#f3f4f6 !important` or `#e5e7eb !important` and applies `filter: invert(1) brightness(1.5) contrast(1.1) !important` to invert monochrome math images.
    *   *Light Mode*: Class `.light-theme` active on body. Reverts variables (`--bg: #f5f6fa; --card: #ffffff; --text: #2d3436;`).
*   **Testing Approach**:
    *   Load pages in both dark and light modes.
    *   Compute styles of option labels and math containers.
    *   Assert text contrast ratio against their computed background color matches WCAG AA criteria ($\ge 4.5:1$).
    *   Assert that option elements do not have hardcoded white text on white backgrounds or black text on black backgrounds.
    *   Assert image filter properties in both modes.

### R3: Question Navigator States
*   **Elements & Selectors**: `.nav-question` (CBTExam, Daily Quiz, Mocks Wallah) and `.q-box`/`.q-num` (Topic-Concept Tests).
*   **States & Associated Classes**:
    *   *Unvisited / Unattempted*: Default state (gray border/text, muted background).
    *   *Active / Current Question*: `.current` or `.active` class (highlighted with brand's primary border color).
    *   *Answered / Submitted*: `.answered` or `.correct` class (success color, green background).
    *   *Flagged / Marked for Review*: `.review` or `.marked` class (warning color, orange/yellow background).
    *   *Incorrect / Wrong* (in review mode): `.wrong` or `.incorrect` class (danger color, red background).
*   **Testing Approach**:
    *   Programmatically navigate questions and select options.
    *   Verify the addition of classes to the corresponding navigator block.
    *   Verify computed background and text colors of navigator blocks in both themes to ensure legibility and correct color coding.

### R4: Bottom Navigation & Sidebar Layouts
*   **Elements & Selectors**:
    *   *Bottom Nav*: `.btn-prev`, `.btn-next`, `.btn-submit`, `.btn-review` (CBTExam/Daily Quiz/Mocks Wallah), and `.nb.prv`, `.nb.nxt` (Topic-Concept Tests).
    *   *Sidebar*: `.navigator-sidebar` or `#question-boxes`.
*   **Responsive Styling**:
    *   *Desktop (Large Screen)*: Fixed/sticky right-aligned `.navigator-sidebar` and horizontal `.navigation-bar` centered at the bottom of the content container.
    *   *Mobile (Small Screen)*: Sidebar collapses into a sliding drawer. Bottom navigation bar uses `flex-wrap: wrap !important` where the "Review" button takes 100% width on a top row, and Prev/Next buttons fit side-by-side to avoid squishing.
*   **Testing Approach**:
    *   Resize viewport to desktop (e.g. 1200px wide) and assert sidebar is visible (`display` is not `none`) and positioned on the right.
    *   Resize viewport to mobile (e.g. 375px wide) and assert sidebar is hidden or toggles via drawer controls.
    *   Assert that Prev/Next buttons do not overlap and have clickable dimensions ($\ge 44px \times 44px$).

### R5: Results Modal Toggling
*   **Elements & Selectors**: `.result-modal` / `#resultModal` (CBTExam/Daily Quiz) and `.modal` / `#modal` (Topic-Concept Tests).
*   **Toggling Mechanics**:
    *   *Closed*: Styles must enforce `display: none;` or `visibility: hidden;`.
    *   *Opened*: Triggered by test submission, styled with `display: flex;` or `visibility: visible;` (often via `.show` or `.active` classes).
    *   *Close triggers*: Clicking the modal background or `.close` / `.btn-close` button must revert display to `none`.
*   **Testing Approach**:
    *   Verify modal is not visible on initial load.
    *   Click Submit, confirm modal is displayed.
    *   Click Close button or press Escape key, verify modal is hidden.

---

## 3. Node.js E2E Testing Harness Recommendation

We propose a programmatic Node.js test runner using **Node 18+'s native `node:test` runner** combined with **JSDOM** (for fast, memory-based behavior checks) and **Playwright** (for visual, layout, and responsive checks).

### The E2E Testing Harness Architecture
```
[Node E2E Runner] 
   ├── JSDOM Engine (Unit & Functional)
   │     ├── Theme Toggle & LocalStorage tests
   │     ├── Modal Toggle state tests
   │     └── Event listeners & navigation tests
   │
   └── Playwright Engine (Layout & Visual)
         ├── Viewport responsive tests (Desktop vs Mobile)
         ├── Contrast & computed color tests (WCAG AA check)
         └── Element collision/overlap tests
```

### Proposed Test Runner Code Skeleton (`e2e-runner.js`)

Below is the proposed implementation design for the Node-based E2E runner:

```javascript
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const playwright = require('playwright');

const BASE_DIR = path.resolve(__dirname, '../../');
const SAMPLE_FILES = {
  CBTExam: path.join(BASE_DIR, 'Aman Sir/Advance Ancient History 360 Pro Level M (Hindi).html'),
  DailyQuiz: path.join(BASE_DIR, 'English Madhyam/Daily Quizzes & Editorial Tests/Daily Quiz 01 (Hindi).html'),
  MocksWallah: path.join(BASE_DIR, 'Mocks Wallah/Full Tests/Governor , State & Judiciary (English).html'),
  TopicConcept: path.join(BASE_DIR, 'English Madhyam/Topic-Concept Tests/English/7430b24 (English).html')
};

// --- Part 1: JSDOM Behavioral Check ---
test('R1: Theme toggle behaves correctly in JSDOM', async (t) => {
  const htmlContent = fs.readFileSync(SAMPLE_FILES.CBTExam, 'utf8');
  
  // Custom mock for localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString(); },
      clear: () => { store = {}; }
    };
  })();

  const dom = new JSDOM(htmlContent, {
    runScripts: 'dangerously',
    resources: 'usable',
    beforeParse(window) {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    }
  });

  const { window } = dom;
  const { document } = window;

  // Simulate localStorage loaded as 'light' before parsing/load
  localStorageMock.setItem('portal-theme', 'light');
  
  // Trigger DOMContentLoaded
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

  // Assert R1.1.4: Pre-loaded theme checks
  assert.ok(document.body.classList.contains('light-theme'), 'Body should have light-theme class');

  const themeBtn = document.getElementById('themeToggle');
  assert.ok(themeBtn, '#themeToggle button should exist');

  // Trigger toggle click
  themeBtn.click();
  
  // Assert R1.1.2 & R1.1.3: Toggle off light-theme
  assert.ok(!document.body.classList.contains('light-theme'), 'Body should not have light-theme class after toggle');
  assert.strictEqual(localStorageMock.getItem('portal-theme'), 'dark', 'LocalStorage portal-theme should now be dark');
});

// --- Part 2: Playwright Layout & Styling Check ---
test('R4 & R2: Playwright Layout and Color Contrast Tests', async (t) => {
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Load a sample file via file:// protocol
  const fileUrl = `file://${SAMPLE_FILES.CBTExam}`;
  await page.goto(fileUrl);

  // Test R4: Desktop layout check
  await page.setViewportSize({ width: 1200, height: 800 });
  const sidebar = page.locator('.navigator-sidebar');
  await assert.doesNotReject(sidebar.waitFor({ state: 'visible' }), 'Sidebar should be visible on desktop');

  // Verify no overlap on bottom navigation
  const prevBtn = page.locator('.btn-prev');
  const nextBtn = page.locator('.btn-next');
  const prevBox = await prevBtn.boundingBox();
  const nextBox = await nextBtn.boundingBox();
  
  assert.ok(prevBox.x + prevBox.width <= nextBox.x, 'Prev button should not overlap Next button');

  // Test R4: Mobile layout wrap check
  await page.setViewportSize({ width: 375, height: 812 });
  const reviewBtn = page.locator('.btn-review');
  const reviewBox = await reviewBtn.boundingBox();
  
  // Confirm wrap of review button (it should take full width or be positioned above others)
  assert.ok(reviewBox.width > 300, 'Review button should wrap to full width on mobile viewports');

  await browser.close();
});
```

---

## 4. E2E Test Cases Proposal

We propose a set of **60 test cases** structured across 4 Tiers.

### Tier 1: Core functionality (25 Cases - 5 per requirement)

#### R1: Theme Toggle
*   **T1.1.1 (Element Existence)**: Verify that the theme toggle button with selector `#themeToggle` exists in the header section.
*   **T1.1.2 (Class Toggle)**: Verify that clicking `#themeToggle` alternates the class `.light-theme` on the `body` element.
*   **T1.1.3 (Storage Write)**: Verify that clicking `#themeToggle` updates the `localStorage` key `portal-theme` between `'light'` and `'dark'`.
*   **T1.1.4 (Storage Read)**: Verify that if `localStorage` has `portal-theme = 'light'` on page load, the body has `.light-theme` class applied instantly.
*   **T1.1.5 (Icon State)**: Verify that the font-awesome icon inside `#themeToggle` updates classes between `fa-sun` and `fa-moon` during theme changes.

#### R2: Option Labels & Formulas
*   **T1.2.1 (Option Selectability)**: Verify that option elements (`.option`, `.option-label`, or `.opt`) are present in the DOM and respond to click events.
*   **T1.2.2 (Formula Presence)**: Verify that MathML nodes (`<math>`) or MathJax containers exist in math-heavy questions.
*   **T1.2.3 (Dark Mode Contrast)**: Verify that in dark mode (default), the computed text color of options is high-contrast light (`#f3f4f6` or similar) against dark backgrounds.
*   **T1.2.4 (Light Mode Contrast)**: Verify that in light mode, the computed text color of options changes to dark (`#2d3436` or similar) against light backgrounds.
*   **T1.2.5 (Math Image Filter)**: Verify that in dark mode, math images (`img`) have the CSS `invert(1)` filter applied, and in light mode the filter is `none` or `invert(0)`.

#### R3: Question Navigator
*   **T1.3.1 (Navigator Count)**: Verify that the navigator grid contains exactly the number of elements matching the test question count.
*   **T1.3.2 (Active Highlight)**: Verify that the current active question block gets styled with the current state selector (e.g. `.current` or `.active`).
*   **T1.3.3 (Answered State)**: Verify that selecting an option and clicking Next adds class `.answered` to the navigator block, changing its background to green.
*   **T1.3.4 (Review State)**: Verify that clicking "Mark for Review" adds class `.review` or `.marked` to the navigator block, changing its background to orange/yellow.
*   **T1.3.5 (Navigator Click)**: Verify that clicking navigator block $k$ switches the active question card to question $k$.

#### R4: Bottom Navigation & Layouts
*   **T1.4.1 (Button Visibility)**: Verify that bottom navigation buttons (`.btn-prev` and `.btn-next`) are visible in the layout viewport.
*   **T1.4.2 (Navigation Step)**: Verify that clicking `.btn-next` advances the active question card, and clicking `.btn-prev` goes back.
*   **T1.4.3 (Fixed Sidebar)**: Verify that in desktop viewports, the `.navigator-sidebar` has a fixed or sticky position on the right of the screen.
*   **T1.4.4 (Bottom Nav Alignment)**: Verify that in desktop viewports, the bottom navigation bar is centered under the question card without overlap.
*   **T1.4.5 (Prev Disabled)**: Verify that on question 1, the `.btn-prev` button is disabled (or has a class/attribute indicating disabled state).

#### R5: Results Modal
*   **T1.5.1 (Modal Presence)**: Verify that the results modal (wrapper selector `.modal` or `.result-modal`) exists in the document.
*   **T1.5.2 (Initial Hidden)**: Verify that the results modal has computed style `display: none` or `visibility: hidden` before test submission.
*   **T1.5.3 (Submit Open)**: Verify that clicking the Submit test button displays the results modal (`display` changes to `flex`/`block` or has class `.show`/`.active`).
*   **T1.5.4 (Modal Stats)**: Verify that the modal displays text elements corresponding to solved, correct, incorrect, and marks.
*   **T1.5.5 (Modal Close)**: Verify that clicking the close button (`.btn-close` or `.close`) hides the modal.

---

### Tier 2: Boundary & Edge Cases (25 Cases - 5 per requirement)

#### R1: Theme Toggle
*   **T2.1.1 (Storage Corruption)**: Verify that if `localStorage` has a corrupted value (e.g. `'portal-theme' = 'xyz'`), the application defaults to dark mode safely.
*   **T2.1.2 (Rapid Toggle)**: Verify that clicking the `#themeToggle` rapidly 5 times in succession toggles the state exactly 5 times without crashing.
*   **T2.1.3 (Blocked Storage)**: Verify that if `localStorage` access throws an exception (e.g. "Access Denied" mock), the theme toggle still updates the DOM in-memory.
*   **T2.1.4 (Reload Persistence)**: Verify that theme choice persists across mock reloads by recreating JSDOM instances with matching localStorage settings.
*   **T2.1.5 (FOUC Timing)**: Verify that the script in `<head>` applies `.light-theme` class *prior* to `body` element rendering (asserting head script executes before body tags parser).

#### R2: Option Labels & Formulas
*   **T2.2.1 (Long Option Label)**: Verify that options with extremely long text (500+ characters) wrap properly without breaking the option card border or overlapping nearby elements.
*   **T2.2.2 (Empty/Nested MathML)**: Verify that empty MathML nodes (`<math></math>`) or formulas inside tables do not throw rendering exceptions.
*   **T2.2.3 (Colored Diagrams)**: Verify that colored question images (diagrams) do not get inverted in light mode (retains normal color fidelity).
*   **T2.2.4 (Selection Readable)**: Verify that selected option cards retain legible text contrast in both dark and light modes.
*   **T2.2.5 (Disabled Option Legibility)**: Verify that disabled option text (in solution/review mode) is still readable ($\ge 3.0:1$ contrast ratio).

#### R3: Question Navigator
*   **T2.3.1 (High Question Count)**: Verify that if a test contains 100+ questions, the navigator sidebar wraps blocks into rows and remains scrollable without expanding the page width.
*   **T2.3.2 (Single Question Test)**: Verify that the navigator renders correctly and behaves safely in tests containing only 1 question.
*   **T2.3.3 (State Toggle Cycle)**: Verify that answering a question, then clearing response, then marking for review correctly cycles navigator states (unvisited -> answered -> unvisited -> review).
*   **T2.3.4 (Contrast in All States)**: Verify that every navigator block state (`.answered`, `.review`, `.wrong`) satisfies text contrast rules in both dark and light themes.
*   **T2.3.5 (Keyboard Navigation updates Navigator)**: Verify that using Arrow keys to change questions updates the highlighted active navigator block correctly.

#### R4: Bottom Navigation & Layouts
*   **T2.4.1 (Extremely Narrow Viewport)**: Verify bottom navigation layout on viewports as narrow as 320px (no button clipping or overlapping).
*   **T2.4.2 (Mobile Wrap Verification)**: Verify that on mobile width (375px), the `.btn-review` button wraps to a full-width block, while Prev/Next remain row-adjacent.
*   **T2.4.3 (Last Question Action)**: Verify that on the very last question, the Next button changes text to "Submit" or is replaced by a "Submit" button.
*   **T2.4.4 (Sidebar Toggle Drawer)**: Verify that the drawer toggle button functions on mobile to slide the navigator drawer in and out of the viewport.
*   **T2.4.5 (Footer Pinning)**: Verify that on extremely tall screens (e.g. iPad Pro portrait), the navigation bar stays pinned at the bottom rather than floating in the middle.

#### R5: Results Modal
*   **T2.5.1 (Negative Marks Formatting)**: Verify that the results modal displays negative numbers correctly (e.g. `-2.5 Marks`) with red color-coding when negative marks are accumulated.
*   **T2.5.2 (Escape Key Dismissal)**: Verify that pressing the keyboard `Escape` key dismisses the results modal.
*   **T2.5.3 (Backdrop Click Dismissal)**: Verify that clicking the translucent backdrop surrounding the modal container closes the modal.
*   **T2.5.4 (Zero Score Calculations)**: Verify that submitting a completely blank test calculates score stats as 0 marks / 0% without outputting `NaN` or crashing.
*   **T2.5.5 (Touch Target Compliance)**: Verify that the modal's Close button has a clickable touch target size of at least $44 \times 44$ pixels.

---

### Tier 3: Cross-Feature Interactions (5 Cases)

*   **T3.1 (Dynamic Modal Theme Sync)**: Verify that toggling the theme (Light/Dark) while the Results Modal is open immediately updates the modal's background, card shadows, text colors, and score gradient elements without reloading.
*   **T3.2 (Language Switch x Option Labels)**: Verify that switching the test language (e.g., from Hindi to English) does not corrupt the layout or contrast of option labels in either light or dark mode.
*   **T3.3 (Navigator Color Transition)**: Verify that when the theme is toggled, all navigator blocks in the sidebar instantly adjust their colors (e.g. green answered cards, yellow review cards) to remain WCAG AA compliant.
*   **T3.4 (Drawer Open x Navigation Buttons)**: Verify that when the mobile navigator drawer is pulled out, the bottom navigation bar is either hidden or overlaid in a way that prevents accidental taps on underneath buttons.
*   **T3.5 (BeforeUnload Release on Submit)**: Verify that clicking the test Submit button and displaying the Results Modal automatically releases the `beforeunload` window handler, letting the user exit or reload without a warning dialog.

---

### Tier 4: Real-World Workflows / User Scenarios (5 Cases)

*   **T4.1 (Standard Exam Session Workflow)**:
    1.  Load CBTExam page -> Confirm Welcome instructions are displayed.
    2.  Click "Start Test" -> Verify welcome overlay disappears, exam container is initialized, and timer starts ticking.
    3.  Select option A on Question 1 -> Click Next (block 1 in sidebar turns green).
    4.  Navigate to Question 2 -> Click "Mark for Review" without selecting an option -> Click Next (block 2 in sidebar turns yellow).
    5.  Navigate to Question 3 -> Click "Submit" -> Confirm confirmation prompt opens.
    6.  Confirm submit -> Verify Results Modal displays correct statistics (1 Solved, 0 Correct, 0 Marks).
    7.  Click Close modal -> Verify modal is hidden.
*   **T4.2 (Persistent Theme Preference Workflow)**:
    1.  Load CBTExam -> Verify default dark mode.
    2.  Click `#themeToggle` -> Verify page turns to light theme.
    3.  Select option B on Question 1 -> Verify option selected state is legible in light mode.
    4.  Reload the page -> Verify page loads in light mode immediately (no dark flash).
    5.  Start test -> Verify exam dashboard rendering is fully in light mode.
    6.  Click `#themeToggle` -> Verify page instantly reverts to dark mode.
*   **T4.3 (Topic-Concept Test Quick Session)**:
    1.  Load Topic-Concept Test page -> Confirm the quiz view renders directly (no welcome overlay).
    2.  Step through all questions and select answers.
    3.  Click the submit button in the top header -> Verify Results Modal opens.
    4.  Verify correct answers statistics count.
    5.  Click "View Solutions" -> Confirm modal closes, solution boxes (`.sol` or `.solution-box`) are displayed with correct explanations, and all options are color-coded (green for correct, red for wrong, gray for unattempted) and locked (pointer-events disabled).
*   **T4.4 (Mobile Phone Session Workflow)**:
    1.  Set viewport to mobile (375px wide).
    2.  Load Daily Quiz -> Click "Start Test".
    3.  Confirm navigator sidebar is hidden, and the drawer icon is visible.
    4.  Click the drawer icon -> Confirm navigator drawer slides open.
    5.  Click question 5 in the drawer grid -> Drawer slides closed and loads question 5.
    6.  Verify that the bottom navigation buttons wrap appropriately without overlapping or truncating text.
    7.  Click Submit -> Verify results modal is responsive.
*   **T4.5 (Adversarial Contrast & Navigation Audit)**:
    1.  Start an exam session.
    2.  Navigate through questions containing complex MathML equations and monochrome math images.
    3.  Toggle themes back and forth multiple times.
    4.  Verify that equations and diagrams do not become invisible or overlap on any question card.
    5.  Submit test -> Navigate solutions -> Verify explanations are legible under both dark and light modes.
