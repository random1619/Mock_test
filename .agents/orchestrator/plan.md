# Project Plan: Mock Exam Enhancements

## Phase 1: Exploration (Current)
- Spawn a new Explorer agent (`explorer_init_2`) to:
  - Locate all mock exam HTML files and categorize them under the 4 styles: CBTExam, Daily Quiz, Mocks Wallah, and Topic-Concept Tests.
  - Analyze the existing theme setup, options styling, MathJax/MathML components, question navigator classes, and bottom navigation.
  - Review helper scripts (e.g. `redesign-mocks.js`, `redesign-oliveboard.js`, etc.) to see how files are processed or structured.
  - Gather all findings in `explorer_init_2/handoff.md`.

## Phase 2: Design and Dual-Track Initiation
- Define the global `PROJECT.md` scope document.
- Spawn **E2E Testing Track Orchestrator** to:
  - Formulate `TEST_INFRA.md`.
  - Implement Tier 1-4 tests (opaque-box validation of theme persistence, readability, layout, results modal).
  - Prepare `TEST_READY.md`.
- Spawn **Implementation Track Orchestrator** (or handle milestone decomposition directly) to plan milestones:
  - Milestone 1: Dynamic Theme Toggle Script and Injection (R1).
  - Milestone 2: Style Fixes for CBTExam and Daily Quiz (R2, R3, R4, R5).
  - Milestone 3: Style Fixes for Mocks Wallah and Topic-Concept Tests (R2, R3, R4, R5).
  - Milestone 4: Global Integration and Verification.

## Phase 3: Implementation & Iterative Verification
- For each milestone:
  - Explorer suggests technical strategy.
  - Worker implements changes and executes build/syntax checks.
  - Reviewers and Challengers verify styles and behavior.
  - Forensic Auditor runs checks for cheating/facade implementations.
  - Gate validation before proceeding.

## Phase 4: Acceptance & Hardening
- Run the full E2E test suite (Tier 1-4).
- Run Challenger-led Adversarial Coverage Hardening (Tier 5) to stress test edge cases and contrast gaps.
- Final forensic audit sign-off.
- Orchestrator handoff and user notification of victory.
