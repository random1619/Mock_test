# Test Infrastructure Specification (TEST_INFRA.md)

This document outlines the testing infrastructure, requirements coverage, and opaque-box test strategy designed for validating mock exam enhancements under `C:\Users\gagan\Downloads\Mocks\pundits`.

---

## 1. Mission & Objectives

The primary objective of the E2E testing infrastructure is to programmatically verify that all mock exam HTML files conform to the accessibility, layout, style, and functional requirements. 
Given the offline, restricted environment, the test runner avoids heavy external dependencies (such as JSDOM, Playwright, or Puppeteer) and instead employs a native Node.js parser to inspect mock directories, files, stylesheets, and script bindings.

---

## 2. Directory Structure and Style Classifications

The runner scans the workspace and classifies files into four mock style groups based on their paths:

| Mock Style | Directory Associations | Representative File |
| :--- | :--- | :--- |
| **CBTExam** | `Aman Sir/`, `oliveboard/`, `Other Brands/`, `Pundits/`, `RBE/`, `Testbook/`, `The Solvers/`, and general directories of `English Madhyam/` (excluding topic-concept & daily quizzes) | `Aman Sir/Advance Ancient History 360 Pro Level M (Hindi).html` |
| **Daily Quiz** | `English Madhyam/Daily Quizzes & Editorial Tests/` | `English Madhyam/Daily Quizzes & Editorial Tests/Daily Quiz 01 (Hindi).html` |
| **Mocks Wallah** | `Mocks Wallah/` (excluding topic-concept tests) | `Mocks Wallah/Full Tests/Governor , State & Judiciary (English).html` |
| **Topic-Concept Tests** | `Mocks Wallah/Topic-Concept Tests/`, `English Madhyam/Topic-Concept Tests/`, `Testbook/Topic-Concept Tests/` | `English Madhyam/Topic-Concept Tests/English/7430b24 (English).html` |

---

## 3. Core Requirements Mapping

The testing suite guarantees coverage for 5 core requirements across all mock styles:

*   **R1. Dynamic Light and Dark Theme Toggling**: Toggling theme class `.light-theme` on `body` via `#themeToggle`, persisting state in `localStorage` under `portal-theme` (default `'dark'`), and preventing Flash of Unstyled Content (FOUC).
*   **R2. High-Contrast Option Labels and Formulas**: Option labels (`.option`, `.option-label`, `.opt`) and math formulas (MathML `<math>`, MathJax, KaTeX, and monochrome diagrams) must render with clear contrast ($\ge 4.5:1$ ratio) without text overlaps.
*   **R3. Question Navigator States**: Navigator boxes (`.q-box`, `.q-num`, `.nav-question`) must dynamically update colors for active, answered, flagged, and incorrect states.
*   **R4. Bottom Navigation & Responsive Layout**: Horizontal navigation bars (`.btn-prev`, `.btn-next`, `.nb.prv`, `.nb.nxt`) must display properly on desktop without overlapping sidebar, and wrap cleanly on narrow screens (e.g. mobile width).
*   **R5. Results Modal Accessibility**: Modal containers (`.result-modal`, `.modal`) must have `visibility: hidden` or `display: none` when closed to ensure screen readers ignore contents.

---

## 4. Complete Test Cases List (60 Cases)

### Tier 1: Core Functionality (25 Cases - 5 per Requirement)

#### R1: Theme Toggle & Persistence
*   **T1.1.1 (Element Existence)**: Verify that the theme toggle button with selector `#themeToggle` exists in the header controls or timer section.
*   **T1.1.2 (Class Toggle)**: Verify that clicking `#themeToggle` alternates the class `.light-theme` on the `body` element.
*   **T1.1.3 (Storage Write)**: Verify that clicking `#themeToggle` updates the `localStorage` key `portal-theme` between `'light'` and `'dark'`.
*   **T1.1.4 (Storage Read)**: Verify that if `localStorage` has `portal-theme = 'light'` on page load, the body has `.light-theme` class applied instantly.
*   **T1.1.5 (Icon State)**: Verify that the font-awesome icon inside `#themeToggle` updates classes between `fa-sun` and `fa-moon` during theme changes.

#### R2: Option Labels & Formulas
*   **T1.2.1 (Option Selectability)**: Verify that option elements (`.option`, `.option-label`, or `.opt`) are present in the DOM and respond to click events.
*   **T1.2.2 (Formula Presence)**: Verify that MathML nodes (`<math>`) or MathJax containers exist in math-heavy questions.
*   **T1.2.3 (Dark Mode Contrast)**: Verify that in dark mode, the computed text color of options is high-contrast light (`#f3f4f6` or similar) against dark backgrounds.
*   **T1.2.4 (Light Mode Contrast)**: Verify that in light mode, the computed text color of options changes to dark (`#2d3436` or similar) against light backgrounds.
*   **T1.2.5 (Math Image Filter)**: Verify that in dark mode, math images (`img`) have the CSS `invert` or filter applied, and in light theme it is reverted.

#### R3: Question Navigator
*   **T1.3.1 (Navigator Count)**: Verify that the navigator grid contains exactly the number of elements matching the test question count.
*   **T1.3.2 (Active Highlight)**: Verify that the current active question block gets styled with the current state selector (e.g., `.current` or `.active`).
*   **T1.3.3 (Answered State)**: Verify that selecting an option and clicking Next adds class `.answered` (or `.correct`) to the navigator block.
*   **T1.3.4 (Review State)**: Verify that clicking "Mark for Review" adds class `.review` (or `.marked`) to the navigator block.
*   **T1.3.5 (Navigator Click)**: Verify that clicking navigator block $k$ switches the active question card to question $k$.

#### R4: Bottom Navigation & Layouts
*   **T1.4.1 (Button Visibility)**: Verify that bottom navigation buttons (`.btn-prev` and `.btn-next` or equivalent) are present and visible.
*   **T1.4.2 (Navigation Step)**: Verify that clicking next button advances the active question card, and clicking prev goes back.
*   **T1.4.3 (Fixed Sidebar)**: Verify that in desktop viewports, the navigator sidebar has a fixed or sticky position on the right of the screen.
*   **T1.4.4 (Bottom Nav Alignment)**: Verify that in desktop viewports, the bottom navigation bar is centered under the question card without overlapping the sidebar.
*   **T1.4.5 (Prev Disabled)**: Verify that on question 1, the prev navigation button is disabled.

#### R5: Results Modal
*   **T1.5.1 (Modal Presence)**: Verify that the results modal (wrapper selector `.modal` or `.result-modal`) exists in the document.
*   **T1.5.2 (Initial Hidden)**: Verify that the results modal has CSS `display: none` or `visibility: hidden` before test submission.
*   **T1.5.3 (Submit Open)**: Verify that clicking the Submit test button displays the results modal.
*   **T1.5.4 (Modal Stats)**: Verify that the modal displays text elements corresponding to solved, correct, incorrect, and marks.
*   **T1.5.5 (Modal Close)**: Verify that clicking the close button (`.btn-close` or `.close`) hides the modal.

---

### Tier 2: Boundary & Edge Cases (25 Cases - 5 per Requirement)

#### R1: Theme Toggle
*   **T2.1.1 (Storage Corruption)**: Verify that if `localStorage` has a corrupted value (e.g. `'portal-theme' = 'xyz'`), the application defaults to dark mode safely.
*   **T2.1.2 (Rapid Toggle)**: Verify that clicking the `#themeToggle` rapidly 5 times in succession toggles the state exactly 5 times without crashing.
*   **T2.1.3 (Blocked Storage)**: Verify that if `localStorage` access throws an exception, the theme toggle still updates the DOM in-memory.
*   **T2.1.4 (Reload Persistence)**: Verify that theme choice persists across mock reloads.
*   **T2.1.5 (FOUC Timing)**: Verify that the script in `<head>` applies `.light-theme` class prior to body element parsing.

#### R2: Option Labels & Formulas
*   **T2.2.1 (Long Option Label)**: Verify that options with extremely long text wrap properly without breaking the option card border.
*   **T2.2.2 (Empty/Nested MathML)**: Verify that empty MathML nodes (`<math></math>`) or formulas inside tables do not throw exceptions.
*   **T2.2.3 (Colored Diagrams)**: Verify that colored question images (diagrams) do not get inverted in light mode.
*   **T2.2.4 (Selection Readable)**: Verify that selected option cards retain legible text contrast in both dark and light modes.
*   **T2.2.5 (Disabled Option Legibility)**: Verify that disabled option text (in solution/review mode) is still readable ($\ge 3.0:1$ contrast ratio).

#### R3: Question Navigator
*   **T2.3.1 (High Question Count)**: Verify that if a test contains 100+ questions, the navigator sidebar wraps blocks into rows.
*   **T2.3.2 (Single Question Test)**: Verify that the navigator renders correctly and behaves safely in tests containing only 1 question.
*   **T2.3.3 (State Toggle Cycle)**: Verify that answering a question, then clearing response, then marking for review correctly cycles navigator states.
*   **T2.3.4 (Contrast in All States)**: Verify that every navigator block state satisfies text contrast rules in both dark and light themes.
*   **T2.3.5 (Keyboard Navigation updates Navigator)**: Verify that keyboard arrows update the navigator block selection.

#### R4: Bottom Navigation & Layouts
*   **T2.4.1 (Extremely Narrow Viewport)**: Verify bottom navigation layout on viewports as narrow as 320px (no button clipping or overlapping).
*   **T2.4.2 (Mobile Wrap Verification)**: Verify that on mobile width, the review button wraps to a full-width block, while Prev/Next remain row-adjacent.
*   **T2.4.3 (Last Question Action)**: Verify that on the very last question, the Next button changes text to "Submit" or is replaced by a "Submit" button.
*   **T2.4.4 (Sidebar Toggle Drawer)**: Verify that the drawer toggle button functions on mobile to slide the navigator drawer in and out of the viewport.
*   **T2.4.5 (Footer Pinning)**: Verify that on extremely tall screens, the navigation bar stays pinned at the bottom rather than floating.

#### R5: Results Modal
*   **T2.5.1 (Negative Marks Formatting)**: Verify that the results modal displays negative numbers correctly (e.g. `-2.5 Marks`) with appropriate red coloring.
*   **T2.5.2 (Escape Key Dismissal)**: Verify that pressing the keyboard `Escape` key dismisses the results modal.
*   **T2.5.3 (Backdrop Click Dismissal)**: Verify that clicking the translucent backdrop surrounding the modal container closes the modal.
*   **T2.5.4 (Zero Score Calculations)**: Verify that submitting a completely blank test calculates score stats as 0 marks / 0% without outputting `NaN`.
*   **T2.5.5 (Touch Target Compliance)**: Verify that the modal's Close button has a clickable touch target size of at least $44 \times 44$ pixels.

---

### Tier 3: Cross-Feature Interactions (5 Cases)

*   **T3.1 (Dynamic Modal Theme Sync)**: Verify that toggling the theme (Light/Dark) while the Results Modal is open immediately updates the modal's background, card shadows, text colors, and score gradient elements without reloading.
*   **T3.2 (Language Switch x Option Labels)**: Verify that switching the test language (e.g., from Hindi to English) does not corrupt the layout or contrast of option labels in either light or dark mode.
*   **T3.3 (Navigator Color Transition)**: Verify that when the theme is toggled, all navigator blocks in the sidebar instantly adjust their colors to remain WCAG AA compliant.
*   **T3.4 (Drawer Open x Navigation Buttons)**: Verify that when the mobile navigator drawer is pulled out, the bottom navigation bar is either hidden or overlaid to prevent accidental taps.
*   **T3.5 (BeforeUnload Release on Submit)**: Verify that clicking the test Submit button and displaying the Results Modal automatically releases the `beforeunload` window handler.

---

### Tier 4: Real-World Workflows / User Scenarios (5 Cases)

*   **T4.1 (Standard Exam Session Workflow)**: Start test -> answer Q1 -> mark Q2 -> submit -> check modal -> close.
*   **T4.2 (Persistent Theme Preference Workflow)**: Default -> toggle light -> reload persistence -> toggle dark.
*   **T4.3 (Topic-Concept Test Quick Session)**: Load -> step/select -> submit -> solution explanation view.
*   **T4.4 (Mobile Phone Session Workflow)**: Set viewport -> hide sidebar -> open drawer -> click Q5 -> close drawer -> submit.
*   **T4.5 (Adversarial Contrast & Navigation Audit)**: Math formulas check, multiple theme toggles, explanation contrast check.

---

## 5. Automated Test Runner Environment & Execution

Because the environment is offline and restricted, the runner uses Node's native `fs` and path processing to inspect the files programmatically. 

### How to Run Tests
The test runner script is located at `e2e-test-runner.js`. Execute it with:
```bash
node e2e-test-runner.js
```
The test runner output is written to `.agents/e2e_testing_orch/initial_run_results.txt`.
