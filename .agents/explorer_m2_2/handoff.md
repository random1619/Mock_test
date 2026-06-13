# Milestone 2 — Core Theme Toggle Script and Injection Handoff Report

This report presents the findings, architectural recommendations, and automation structure for injecting the core theme toggle script and DOM button into the target `CBTExam` (909 files) and `Daily Quiz` (27 files) mock exams.

---

## 1. Observation

A detailed, read-only inspection of the codebase has revealed the following:
- **Pre-existing Theme Toggle Button & Layouts**:
  - **Aman Sir / English Madhyam (CBTExam & Daily Quiz)**:
    - Path: `Aman Sir/Advance Ancient History 360 Pro Level M (Hindi).html` (Line 2075):
      ```html
      <button class="theme-toggle" id="themeToggle"><i class="fas fa-moon"></i></button>
      ```
    - Path: `English Madhyam/Daily Quizzes & Editorial Tests/Daily Quiz 01 (Hindi).html` (Line 2075):
      ```html
      <button class="theme-toggle" id="themeToggle"><i class="fas fa-moon"></i></button>
      ```
  - **Other Brands (CBTExam)**:
    - Path: `Other Brands/Practice Sets/Mock - Part 1 (Hindi).html` (Line 2517):
      ```html
      <button class="theme-toggle" id="theme-toggle">
      ```
      Uses kebab-case `id="theme-toggle"`, which does not conform to the camelCase contract.
  - **Oliveboard (CBTExam)**:
    - Path: `oliveboard/Oliveboard_Mocks/Cgl1 Responsive Exam Interface - Part 1 (English).html` (Lines 1665-1670):
      ```html
      <div class="timer-bar">
          <div id="qInfo">Q1/100</div>
          <div>cgl1</div>
          <div class="timer" id="timer">60:00</div>
          <button class="btn" id="pauseBtn" onclick="togglePause()" title="Pause Test" style="background:transparent;border:none;color:inherit;font-size:18px;cursor:pointer;">⏸</button>
      </div>
      ```
      There is **no** theme toggle button present in the header.
- **Pre-existing Click Listeners**:
  - Over **3,000 files** contain a hardcoded `setupThemeToggle()` method (e.g. `Aman Sir/Advance Ancient History 360 Pro Level M (Hindi).html` line 2990):
    ```javascript
    setupThemeToggle() {
        const btn = document.getElementById('themeToggle');
        btn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }
    ```
    This old code listens to click events, toggles the non-conforming class `.dark-mode`, and conflicts directly with the new `.light-theme` contract.

---

## 2. Logic Chain

1. **FOUC Prevention Heuristic**:
   - The unified dark mode overrides apply dark styles to `:root` with `!important` inside `<head>`.
   - To render the light theme without flash (FOUC), the `.light-theme` class must be active prior to rendering.
   - Adding `.light-theme` to `document.documentElement` (the `<html>` tag) inside `<head>` makes it available immediately (Observation 1).
   - Because the contract requires `.light-theme` to be on `<body>` (which is null during `<head>` parsing), a `MutationObserver` must be initialized inside `<head>` to append `.light-theme` to `<body>` the moment the `<body>` element is created in the DOM, prior to painting.

2. **Event Handler Conflict Resolution**:
   - Because `setupThemeToggle()` is hardcoded in the body scripts of 3000+ files (Observation 2), binding a new event listener directly to `#themeToggle` results in multiple click handlers executing simultaneously.
   - Replacing anonymous event listeners programmatically in Javascript is not possible without rewriting body script blocks.
   - However, cloning the `#themeToggle` DOM element (`cloneNode(true)`) and replacing the original in-place effectively discards all previously attached event listeners.
   - We can then bind a single, clean event handler to the clone, satisfying the `portal-theme` localStorage contract.

3. **DOM Injection Points**:
   - Normalizing `#theme-toggle` (kebab-case) to `#themeToggle` (camelCase) handles the `Other Brands` mock layout.
   - For Oliveboard mocks (which lack the theme toggle element), searching for the container `.timer-bar` and injecting the button right after `#pauseBtn` provides a seamless visual fit.

---

## 3. Caveats

- **Topic-Concept and Mocks Wallah Exclusion**: This injection strategy is scoped specifically to `CBTExam` and `Daily Quiz` templates as requested. Topic-Concept Tests and Mocks Wallah use completely different CSS layouts and are handled in subsequent milestones (Milestone 3).

---

## 4. Conclusion

- **Script Recommendation**: Insert a self-contained inline script block right after `<head>` using a `MutationObserver` for FOUC prevention and DOM node cloning for event listener reset.
- **Button Normalization**: Standardize the ID of `#theme-toggle` elements to `#themeToggle` and inject `<button class="theme-toggle" id="themeToggle" title="Toggle Theme"><i class="fas fa-moon"></i></button>` into layouts lacking it.
- **Automation Plan**: Execute the Node.js script structure defined in `analysis.md` to recursively apply these adjustments to all 909 CBTExams and 27 Daily Quizzes.

---

## 5. Verification Method

- **Locate Reports**: Inspect the analysis and handoff documents at:
  - `C:\Users\gagan\Downloads\Mocks\pundits\.agents\explorer_m2_2\analysis.md`
  - `C:\Users\gagan\Downloads\Mocks\pundits\.agents\explorer_m2_2\handoff.md`
- **Manual Verification of Reset**: 
  - Open a patched page in a web browser.
  - Open the console and trigger a click: `document.getElementById('themeToggle').click()`.
  - Check the class list: `document.body.classList`. It must toggle `.light-theme`.
- **Invalidation Condition**: If `document.body.classList` contains `.dark-mode` after clicking the button, it indicates that the cloneNode event listener reset was bypassed or the old event handler is still active.
