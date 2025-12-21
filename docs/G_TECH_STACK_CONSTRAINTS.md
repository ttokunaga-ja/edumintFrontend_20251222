# 技術スタック・ライブラリ制約書（Frontend）

```yaml
Language:
  - TypeScript: ">=5.3"
  - Style: eslint + prettier (no semi, double quotes)
Framework:
  - React 18 + Vite 5
Styling:
  - Tailwind CSS 4 (utility), shadcn/ui components
  - 禁止: CSS-in-JS 新規導入 (emotion/styled-components) ※既存は触らない
UI:
  - Radix UI / shadcn/ui を優先（独自UIの作り込みは最小化）
  - Icons: lucide-react（混在を避ける）
Rendering:
  - Markdown: markdown-it（ブロック分割して再利用）
  - Math: KaTeX（LaTeX数式）
Animation:
  - motion/react（Framer Motion互換）。アニメーションは 200-300ms を基本
State/Data:
  - React hooks, context
  - 禁止: Redux 新規導入
API:
  - Fetch wrapper via `services/api/gateway.ts`
  - 必須: Response validation (Zod/TS) before render
  - 禁止: 画面から直接 `fetch` / `axios` を叩く（例外なし）
Validation:
  - Zod（APIレスポンス/フォーム）
File Upload:
  - react-dropzone（DnD + accept/maxFiles）
Testing:
  - Unit: Vitest + React Testing Library
  - Storybook: 7+ で UI 回帰
  - Coverage target: statements 80% / critical flows 100% (submit, search)
Observability:
  - Console log禁止（本番）。`logger` ユーティリティで level/trace_id を出力
  - エラーは Toast + Alert + Sentry hook（導入後）に送信
Build/Bundle:
  - npm (npm ci)
  - 禁止: Yarn/pnpm 追加
Internationalization:
  - i18n util 既存使用。新規文言は辞書化
Feature Flag:
  - `VITE_ENABLE_<FEATURE>` で制御。未設定はビルド失敗
Service Health:
  - `/health/<service>` 連携必須。CTA disable と Coming Soon への反映を徹底
Accessibility:
  - keyboard focus / aria-label / color contrast 4.5:1
```

## Sources
- `../overview/requirements.md`, `../overview/current_implementation.md`
- `../implementation/figma/README.md`, `../implementation/visual/layout-guide.md`
- `../implementation/features/file-upload.md`, `../implementation/features/hamburger-menu.md`
