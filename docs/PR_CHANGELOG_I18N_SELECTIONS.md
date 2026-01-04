# PR Changelog: i18n migration for selection/checkbox options

Summary
- Centralized static selection/checkbox options (difficulty, problem formats, durations, periods, languages, exam types, custom search options) into `src/features/ui/selectionOptions.ts`.
- Replaced hard-coded labels in components with i18n keys and constants. Components updated include:
  - `StartPhase` (ProblemCreatePage)
  - `ResultEditor` (ProblemCreatePage)
  - `AdvancedSearchPanel` (HomePage)
  - `SelectFilterField` (common)
  - `CheckboxGroupField` used across searches
  - `DifficultySelect` (common select)
  - `MyPage` sections (titles)
  - `GenerationTimeline`

Translation keys added (ja/en)
- problemCreate.startPhase.* (mode labels, UI strings, options, labels, start button)
- enum.difficulty.* (auto, basic, standard, advanced, expert)
- enum.format.* (single_choice, multiple_choice, true_false, matching, ordering, free_text, proof, code, translation, numeric)
- enum.duration.*, enum.period.*, enum.lang.*, enum.exam.*
- filters.* (labels and placeholders used by `AdvancedSearchPanel`)
- problemCreate.resultEditor.* (result/editor strings)
- generation.timeline.* (timeline stage labels)

Notes for localization team
- New keys are defined in:
  - `src/locales/ja/translation.json`
  - `src/locales/en/translation.json`

- Please confirm translations for the following keys and provide additional locale files if needed:
  - `enum.format.*` (mapping to canonical format names),
  - `problemCreate.startPhase.*` (UI copy),
  - `filters.*` (for advanced search labels and custom search options),
  - `generation.timeline.*` (three stage names)

Testing & QA
- Unit tests updated to use i18n-based lookups where appropriate.
- Entire test suite passes locally (`pnpm test`): 67 tests passed.

Notes about screenshots / smoke checks
- I started the Vite dev server locally, but installing Playwright's browsers failed on this environment (OS not officially supported).
- Options to proceed with screenshots:
  1. Allow me to run a browser inside a Docker container (Playwright + Chromium image) and capture screenshots there (I will need Docker available).
  2. You can run `npx playwright install` locally to install required browsers and I can provide a small script to capture screenshots.
  3. Skip screenshots for now and review the UI changes via the dev server at `http://localhost:5173` (I confirmed the server is running).

Suggested PR description (copy-and-paste)
- Title: "Migrate static selection/checkbox text to i18n and centralize options"
- Body: Summary of files changed, list of new i18n keys, testing notes (all unit tests pass), and a note about the missing Playwright browsers in CI/local environment + instructions for how to capture screenshots.

If you want, I can prepare the PR branch and a draft PR message next. Let me know whether you want me to use Docker to capture screenshots or only produce the PR artifacts.
