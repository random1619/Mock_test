# Scope: Milestone 2 — Core Theme Toggle Script and Injection

## Architecture
- **Theme Toggle Script**: Lightweight javascript inserted into the `<head>` of HTML templates. It runs immediately before the body parses to prevent a flash of incorrect theme (FOUC). It reads `'portal-theme'` from `localStorage` (defaulting to `'dark'`) and applies the class `'light-theme'` to the `<body>` element if the stored value is `'light'`. It also registers the event listener on the `#themeToggle` button to switch theme values and toggle classes.
- **Button Injection**: A DOM button with `id="themeToggle"` must be injected into the toolbar/control section (typically near the timer box `.timer-box` or header sections) of all `CBTExam` and `Daily Quiz` files.
- **Automated Patcher script**: A utility node script that automates the file modifications across the target set of 909 `CBTExam` files and 27 `Daily Quiz` files.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M2.1 | Exploration & Strategy | Recommending script content, insertion points, and patching automation logic. | None | DONE |
| M2.2 | Patcher Implementation | Implementing the patching script and injecting the theme toggle + button into 936 HTML files. | M2.1 | DONE |
| M2.3 | Verification & Auditing | Running E2E test runs, unit checks, CSS layout verification, and Forensic Audit. | M2.2 | IN_PROGRESS |

## Interface Contracts
### Theme Toggle ↔ LocalStorage
- **LocalStorage Key**: `portal-theme` (string, `'light' | 'dark'`). Default is `'dark'`.
- **Target CSS classes**: The stylesheet expects the body class to toggle `.light-theme`. Default state (dark mode) has no special theme class on the body, or uses standard styling.
- **Selector**: `#themeToggle` element (usually a button or list item). Clicking it toggles the theme state.

### Injector Script
- **Insertion Targets**: All CBTExam (909 files) and Daily Quiz (27 files) HTML files.
- **Injection Points**:
  - Script block: Injected inside `<head>` (ideally at the top or bottom of `<head>` block).
  - Button `#themeToggle`: Injected into the control bar or header area (adjacent to the timer).
