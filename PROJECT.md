# Project: Mock Exam Enhancements

## Architecture
- **Static Portal Pages**: Scraped mock exam HTML templates served by a local Express server (`server.js`) and wrapped by a Capacitor shell (`www/index.html`).
- **Dynamic Variable System & Style Overrides**: Global and brand-specific CSS custom properties injected dynamically into all HTML pages, matching both light-theme and dark-theme requirements.
- **Dynamic Theme Control**: A central theme toggler script that manages `#themeToggle` and class toggles on `body`.
- **E2E Testing Harness**: A programmatic Node.js validator that verifies syntax, theme toggle injection, visibility/accessibility requirements, and contrast across all HTML pages.

## Code Layout
- `.agents/`: Coordination files and subagent directories.
- `Aman Sir/`, `English Madhyam/`, `Mocks Wallah/`, `Other Brands/`, `Pundits/`, `RBE/`, `Testbook/`, `The Solvers/`, `oliveboard/`: Mock exam subdirectories containing HTML files.
- `www/`: Capacitor app native shell, splash screen, and iframe dashboard layout.
- `scratch/`: Diagnostic, metadata-regeneration, and patch utility scripts.
- `server.js`: Local Express server.
- `PROJECT.md`: Project-wide milestone and architectural configuration.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | E2E Test Suite | Create test infrastructure, write Tier 1-4 tests, and output `TEST_READY.md`. | None | IN_PROGRESS (e7df1789-0ae5-4784-aed4-0c2f79ab6188) |
| 2 | Core Theme Toggle Script | Design/implement theme toggle handler, toggle button injection logic, and verify CBTExam/Daily Quiz files. | M1 | IN_PROGRESS (dd8a84fd-a4c0-44c8-b8b8-ffbd5a575691) |
| 3 | Style and Layout Refinements | Apply option contrasts, MathJax overrides, navigator circle colors, and bottom desktop navigation to Mocks Wallah and Topic-Concept Tests. | M2 | PLANNED |
| 4 | Final Verification & Hardening | Ensure 100% E2E test pass, run Tier 5 adversarial checks, execute Forensic Audit, and report. | M3 | PLANNED |

## Interface Contracts
### Theme Toggle Button ↔ LocalStorage
- Selector: `#themeToggle` button injected in the control/timer section of the document header.
- LocalStorage key: `portal-theme` (string, values: `'dark' \| 'light'`). Default: `'dark'`.
- Body Class: toggles `.light-theme` on the `body` tag if theme is light. If theme is dark, no class or `.dark-mode` is applied (body theme default is dark).

### Question Navigator Circle Classes
- Target selectors: `.q-box`, `.q-num`, `.nav-question`.
- Target states: active, answered, flagged, and unvisited, dynamically styled based on the body's theme class.

### Results Modal Accessibility
- Selector: `.modal` or `.results-modal` wrapper.
- Interaction: must have `visibility: hidden;` or `display: none;` style properties when closed.
