# 技術スタック・ライブラリ制約書（Frontend）

```yaml
Language:
  - TypeScript: ">=5.3"
  - Style: eslint + prettier (no semi, double quotes)
Framework:
  - React 19 + Vite 5
Styling:
  - **Tailwind の全面撤廃を採用**します。Tailwind の新規導入・継続使用は禁止し、既存 Tailwind クラスは段階的に削除して MUI Theme / Design Tokens に統一します。
  - **MUI (v5) + Emotion** をスタンダードなスタイリング基盤とします（`@emotion/react` / `@emotion/styled`）。
  - ガイドライン: Design Tokens（色、タイポグラフィ、間隔）をソースオブトゥルースとしてコードと Figma に同期し、アドホックなクラスやグローバル CSS の乱用を避ける。
  - 不要なユーティリティ依存（例: `tailwind-merge`）は置換し削除することを推奨します。
UI:
  - **MUI v5 を公式に採用する**。既存の Radix / shadcn は低レベル primitives や非標準コンポーネントに限定して併用可。
  - Icons: MUI コンポーネント群では `@mui/icons-material` へ統一することを推奨。lucide-react 等の利用は継続可だが、同一 UI 上での混在は避ける。

# MUI 導入時の運用・制約（追記）
- Styling engine: Emotion を使用する（`@emotion/react` / `@emotion/styled`）。プロジェクトポリシーに "CSS-in-JS を新規導入してはいけない" というルールがある場合は、MUI 移行 = 例外として扱う。明確な理由書とレビューを必須とする。
- Tailwind との共存:
  - 短中期は併用を許可するが、最終的な目標はデザイントークンへ収束させる。
  - Tailwind のユーティリティクラスは UI レイアウトやユーティリティ用途で残すことを許容するが、コンポーネント固有のスタイルは MUI テーマへ移行する。
- パフォーマンス: MUI を導入する場合は bundle サイズ・Lighthouse 計測を入れること。不要なアイコンや locale をバンドルしない運用を徹底する。
- SSR / ビルド: Vite 環境で Emotion の SSR/スタイル注入に問題が起きないことを確認する（現行のビルドツール設定を検証する）。
- アクセシビリティ: MUI のアクセシビリティ機能を利用しつつ、既存のアクセシビリティ要件（keyboard / aria / color contrast）を満たすこと。

# 代替案（短評）
- Chakra UI: 開発速度は高いがデザイン要件・カスタム性の点で MUI の方が強力。  
- Radix + shadcn: 低レベル制御が高く保守性は良いが、豊富な既製コンポーネントによる効率性で MUI に劣る（チームの熟練度次第）。

# 結論
- **MUI v5（Emotion）を採用**し移行を進める。なお、本プロダクトはまだ正式リリース前のため、公開互換性や feature flag による段階的リリース・厳密なロールバック運用を必須とはしません。PoC を実施して仕様を固めた後、必要に応じて直接的な置換（API の変更やラッパーを介さない差し替え）を行うことを許容します。  
- ただし、各変更は Storybook / Unit / E2E / A11y による十分な検証を必須とし、リスクの高い差分はレビューで合意の上で進めてください。
- **ベストプラクティス優先**: 既存資産に囚われず、可能な限り MUI の標準 API / パターンおよび Design Tokens に合わせた実装を推奨します。
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
