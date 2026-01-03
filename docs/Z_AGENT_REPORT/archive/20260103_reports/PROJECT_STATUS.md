# Project Status: Refactor Complete / Ready for Development

All refactoring phases are complete. The repository now follows the standardized architecture and a single-root toolchain.

## Quick Start for New Contributors
- `npm install`
- `npm run dev` — start Vite dev server
- `npm run test` — run Vitest (jsdom, MSW setup)
- `npm run typecheck` — TypeScript correctness
- `npm run build` / `npm run preview` — production build and preview

## Architecture Snapshot
- Alias: `@/*` → `src/`
- Components: `src/components/{primitives,common,page/<PageName>}`
- Pages: `src/pages/<PageName>/` with page-level hooks in `src/pages/<PageName>/hooks/`
- Domain hooks: `src/features/<Domain>/hooks/`
- Generic hooks: `src/hooks/`
- Services/API: `src/services/api/{httpClient.ts,gateway/*}`
- Mocks: `src/mocks/{browser.ts,server.ts,handlers/*,mockData/*}`

## Notes
- Legacy structures (`src/src`, `@app` alias, duplicate configs under src/) are removed.
- MSW is the single mock mechanism; internal mock toggles are suppressed via `httpClient`.
- Keep UI inside `components/*`; features hold domain logic only.
