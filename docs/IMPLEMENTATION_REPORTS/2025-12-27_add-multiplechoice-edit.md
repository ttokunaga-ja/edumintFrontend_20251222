---
title: Add MultipleChoice Edit component
date: 2025-12-27
author: GitHub Copilot
---

## 1. Summary
- **What**: Added Storybook story, unit tests and snapshot tests for `MultipleChoiceEdit`.
- **Why**: To verify edit-side behavior (options addition/removal, marking correct choices, preview) and make it reviewable by PR.

## 2. Files Added
- `src/components/problemTypes/MultipleChoiceEdit.stories.tsx`
- `src/components/problemTypes/__tests__/MultipleChoiceEdit.test.tsx`

## 3. Verification
- Unit tests cover rendering, option lifecycle (add/remove), and toggling correct flags.
- Snapshot generated and committed.

## 4. Next Steps
- Ensure integration with `ProblemEditor` and E2E where needed.
- Add more edge-case tests for many options and correct/incorrect combinations.
