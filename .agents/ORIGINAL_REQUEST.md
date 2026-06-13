# Original User Request

## Initial Request — 2026-06-12T16:48:28Z

Enhance all mock exam designs under C:\Users\gagan\Downloads\Mocks\pundits to improve color contrast, user experience, layout, and implement high-quality light and dark theme toggling.

Working directory: C:\Users\gagan\Downloads\Mocks\pundits
Integrity mode: development

## Requirements

### R1. Dynamic Light and Dark Theme Toggling
Inject a theme toggle button (`#themeToggle`) into the header controls/timer section and link it to a self-invoking theme handler script that toggles the `light-theme` class on the `body` and persists the selection in `localStorage` under `portal-theme` (defaulting to 'dark').

### R2. High-Contrast Option Labels and MathML Formulas
Ensure that all mock styles (including CBTExam, Daily Quiz, Mocks Wallah, and Topic-Concept Tests) have option labels (`.option-label`, `.option`, `.opt`, etc.) and MathJax/MathML formulas that render with appropriate contrast (dark backgrounds in dark mode, light backgrounds in light mode) without white-on-white or black-on-black text overlaps.

### R3. Question Navigator Circle styling
Make sure the question navigator sidebar grids and question circle blocks (`.q-box`, `.q-num`, `.nav-question`, etc.) match the active theme, displaying clearly readable question numbers and distinct backgrounds for active, answered, flagged, and unvisited states.

### R4. Bottom Navigation on Desktop
Ensure that previous and next bottom navigation buttons are visible on desktop (large screens) by adjusting css display selectors and placing them appropriately to avoid overlapping with fixed sidebars.

### R5. Results Modal Accessibility
Ensure that the results modal contents are completely hidden from screen readers when the modal is closed (e.g., using `visibility: hidden;`).

## Verification Plan

### Automated/Programmatic Checks
- Run a Node.js script to compile/validate syntax on 100% of the modified HTML files to ensure 0 JavaScript compile or parse errors are introduced.

### Audit Check
- Use a browser agent to audit a sample file from each of the 4 mock styles under both light and dark mode themes, verifying that option texts, MathML math equations, navigator circles, and button controls are visible and readable.

## Acceptance Criteria

### Technical & Quality Guardrails
- **Zero Syntax Errors**: [Objective] Syntax validator script reports 0 compile/parse errors across all patched mock HTML files.
- **Coverage**: [Objective] All mock files under the target subdirectories have had the theme toggle injected and dynamic variables integrated.
- **Readability**: [Objective] Browser agent audits confirm that unselected option labels, formula text, and navigator circles have no white-on-white text in both modes.
- **Persistence**: [Objective] Theme toggle persists `portal-theme` theme preference in `localStorage`.
- **Desktop Navigation**: [Objective] Prev/Next bottom navigation buttons display properly on desktop without overlapping the fixed sidebar.
- **Screen Reader accessibility**: [Objective] The results modal uses `visibility: hidden` when closed.
