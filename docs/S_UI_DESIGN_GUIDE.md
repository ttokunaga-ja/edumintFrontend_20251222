# UI / Visual / Figma 実装ガイド（集約）

Figma・画面設計・ビジュアルガイドの要点を、Frontend 実装者（/AI）向けに A-Z 形式へ圧縮したもの。

## レイアウト原則（共通骨格）
- 基本構造: `TopMenuBar` → `ServiceHealthBar`(条件) → `main(max-w-7xl)` → `PageHeader` → `ContextHealthAlert`(条件) → コンテンツ
- 幅の目安: narrow(max-w-2xl)/standard(max-w-4xl)/wide(max-w-6xl)/full(max-w-7xl)
- グリッド: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` を基本に、カード一覧で使用

## レスポンシブ（ブレークポイント）
- `md: 768px` を境に「ハンバーガー/検索配置」を切替
- タッチターゲット: 最小 44x44（ボタン間隔は >=8px）

## タイポ/カラー/スペーシング（要点）
- 原則: `styles/globals.css` のデフォルト（h1/h2/h3/p）を優先し、`text-*` の上書きは例外に限定
- spacing: Tailwind のデフォルトスケール（`p-4`, `gap-6`, `mb-8` など）を基準に揃える
- semantic colors: success/warning/error/info を `ContextHealthAlert` 等の状態表現に利用

## Figma → Code の進め方（運用）
1. デザインレビュー → コンポーネント分割（共通/機能/ページ専用）
2. React + Tailwind で実装（`cn()` パターン）
3. Storybook でバリアント/状態を可視化
4. QA & デザインレビュー → 実アプリ統合（`src/src/pages/*`）

## 命名規則（抜粋）
- Component: `PascalCase` / File: `PascalCase.tsx`
- Props: `camelCase`
- 「状態」は `isXxx`, 「イベント」は `onXxx`

## Sources
- `../implementation/visual/layout-guide.md`
- `../implementation/figma/README.md`
