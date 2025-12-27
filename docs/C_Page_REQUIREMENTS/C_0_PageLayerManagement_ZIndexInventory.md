# z-index Usage Inventory & Remediation

Summary: Per the "Top Layer" guideline we removed all explicit `z-index` utility usages (`z-*`, `z-[...]`, inline `zIndex`) from the repository and replaced their behavior with:
- Native Top Layer primitives where appropriate (we already added `NativePopover` / `NativeDialog` prototypes). 
- Local stacking isolation (`isolation:isolate`) for page-level containers that must stay behind the top bar or create contained stacking contexts.

This file lists the occurrences found, the remediation applied, and any follow-ups.

---

## Inventory (before → after / action)

- `src/App.tsx`
  - Removed `z-[145]` on a relative container → now `relative` only.

- `src/components/common/TopMenuBar.tsx`
  - Removed `z-[899]` from nav → rely on DOM order + page-local isolation.
  - Updated tests to assert no `z-` classes are present.

- `src/components/common/Sidebar.tsx`
  - Removed `z-50` from sidebar container and a `z-20` on hover pseudo-element.

- `src/components/common/NotificationPopover.tsx`
  - Removed `z-50` from popover container class strings. (Popover attaches to native or fallback depending on support.)

- `src/components/common/MultilingualAutocomplete.tsx`
  - Removed `z-20` on suggestion list container.

- `src/components/common/JobStatusRibbon.tsx` (+ story)
  - Removed `z-40` from position class and updated story comment.

- `src/components/page/ProblemCreatePage/ProgressHeader.tsx`
  - Removed `z-[750]` from header.

- `src/components/primitives/*` (Radix wrapper primitives)
  - Removed `z-50` / `z-[1]` / other `z-*` occurrences from these primitives:
    - `tooltip.tsx` (tooltip content & arrow)
    - `select.tsx`
    - `popover.tsx`
    - `navigation-menu.tsx`
    - `menubar.tsx`
    - `hover-card.tsx`
    - `dropdown-menu.tsx`
    - `drawer.tsx`
    - `sheet.tsx`
    - `dialog.tsx` and `alert-dialog.tsx`
    - `context-menu.tsx`
    - `calendar.tsx` (removed focus-within:z-20)
    - `resizable.tsx` (removed z-10)
    - `input-otp.tsx` (removed data-active z-10)

- `src/pages/ProblemCreatePage/ProblemCreateView.tsx` and `GenerationPhase.tsx`
  - Removed `z-0` and kept `isolation:isolate` on containers (local stacking context approach).

- `src/index.css`
  - Removed `.z-10` .. `.z-50` utility block (deleted definitions) to prevent accidental reuse.

---

## Tests
- Updated `tests/component/TopMenuBar.test.tsx` to assert the nav does not contain z-index utilities.
- Re-ran full unit test suite: all tests pass.

---

## Follow-ups / Recommendations
- **Actions taken for updated L2/L1/L0 guidelines (2025/12/25)**:
  - Added `z-app-bar` to L1 components (`TopMenuBar`, `Sidebar`, `ProgressHeader`, `ActionBar`, `Drawer` content) and ensured `bg-white` is present to guarantee opaque system layer rendering.
  - Converted L2 primitive content backgrounds to `bg-white` (Popover/Select/Menubar/Dropdown/ContextMenu/HoverCard/Dialog) to comply with the requirement that Top Layer content be fully opaque.
  - Updated `JobStatusRibbon` to use `bg-white` with a left accent border to keep the ribbon opaque while preserving status color affordance.
  - Fixed a unit test timing flake in `tests/component/HomePage.health.test.tsx` by waiting for the empty state to render (keeps tests stable while preserving behavior).

- Continue migrating overlay primitives to the native Top Layer wrappers:
  - Replace Radix portal usages for Popovers/Selects/Tooltips with `NativePopover`/`NativeSelect` when possible.
  - Convert modals/drawers/sheets to `NativeDialog` or implementations that attach to a true top-layer where supported.
- Add E2E (Playwright) tests to assert top-layer behavior under scroll, stacking, and mobile viewports (especially for Notification, Select, and Drawer).
- Add a linter/CI check to prevent reintroduction of `z-` utilities and inline `zIndex` (e.g., a grep-based CI check or ESLint rule).

---

If you'd like, I can open a PR with these edits, add the CI check, and start converting high-impact primitives to the Native wrappers (Notification, Select, Tooltip) as the next phase.
