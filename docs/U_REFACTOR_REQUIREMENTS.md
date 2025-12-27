# MUI（Material UI）移行 - リファクタリング要件定義書 ✅

## 背景
- 現状: `src/components/primitives` に多数の自作 UI コンポーネント（Button, Input, Select, Card, Modal, Table など）が存在。スタイリングは主に Tailwind を利用。  
- 目的: 保守性、アクセシビリティ、開発効率の向上を目的に、デザインシステムに成熟した UI ライブラリ（MUI v5）へ段階的に移行する。

---

## 目標（ゴール）🎯
- **共通 UI の一貫性向上**: 全画面で一貫したテーマとアクセシビリティ基準を適用する。  
- **保守性の向上**: UI の実装を少数のメンテナンス対象（MUI + thin wrapper）に集約する。  
- **開発速度の改善**: MUI のコンポーネント・ユーティリティ利用により実装コストを低減する。  
- **段階的導入**: 既存のページを壊さない段階的移行を採用（ラッパーで既存 API を維持）

## スコープ補足（重要）❗
- 本移行では、**既存 Tailwind ユーティリティの全面撤廃を目標**とします。レガシー資産に拘らず、MUI + Emotion を中心としたベストプラクティスでの実装を優先してください。デザイン・トークンをソースオブトゥルースにし、Tailwind に依存するアドホックなクラスは段階的に置換します。

---

## 影響調査（簡易サマリ）🔎
- 置換対象: `src/components/primitives/*` が主要変更対象（Button, Input, Select, Checkbox, Radio, Switch, Modal/Dialog, Tooltip, Table, Tabs, Badge, Avatar 等）  
- 依存箇所: 多数のページ・コンポーネントが primitives を利用しているため、置換は横断的。  
- スタイリング: **既存 Tailwind の全面撤廃**を前提とし、スタイルは **MUI + Emotion + Design Tokens** に統一します。CSS-in-JS（Emotion）を標準として採用し、スタイルは MUI Theme / CSS 変数 / Design Tokens で一元管理します。  
- 見た目差分: MUI と既存カスタム実装のデフォルトスタイル差分をテーマで調整する作業が発生します。

---

## API マッピング（主要例）🔁
- `Button` → `@mui/material` の `Button` をベースに `src/components/primitives/button` をラップ
- `Input` / `Textarea` → `TextField` / `Input` / `TextareaAutosize` 等をラップ
- `Select` → `Select` + `MenuItem` をラップ
- `Checkbox` / `Radio` / `Switch` → MUI 対応コンポーネントをラップ
- `Dialog` / `Popover` / `Tooltip` → MUI の `Dialog` / `Popover` / `Tooltip`
- `Table` → MUI `Table` 系をラップ（仮想化対応は別検討）

> 方針: 各 primitives は**互換 API を維持した薄いラッパー**として実装し、移行期間中は内部実装のみ差し替える。

---

## 移行方針（推奨）🛠️
1. **ベストプラクティス優先（推奨）**: レガシー資産に縛られず、MUI の標準 API/パターンに合わせた **直接差し替え** を基本戦略とします。必要に応じて互換性ラッパーを作ることは許容しますが、不要な互換層は作らない方針です。  
2. **段階的ページ移行**: 重要度の低い画面から置換して、回帰テストとアクセシビリティ確認を行う。  
3. **テーマ（Design Tokens）を作成**: 色、フォント、スペーシングなどを MUI テーマに集約し、Tailwind のユーティリティは全面的に Design Tokens に置換します。  
4. **アクセシビリティ（A11y）基準を整備**: keyboard navigation, aria, color-contrast の検証プロセスを組込む。

---

## 技術選定（簡易）⚖️
- Framework: **React 19** + Vite 5
- UI: `@mui/material` (v5) + `@mui/system`（Design Tokens）
- アイコン: `@mui/icons-material` を基本、必要なら lucide を限定的に使用
- Styling engine: **Emotion（@emotion/react / @emotion/styled）を標準**とし、スタイルは MUI Theme / Design Tokens / CSS 変数で管理
- Tailwind: **全面撤廃**（新規導入・継続使用は禁止）。既存 Tailwind は段階的に置換・削除します。

---

## 品質・テスト要件 ✅
- ユニット/コンポーネントテスト: Vitest + React Testing Library で既存コンポーネントの振る舞いを担保。  
- Storybook: 影響を受ける primitives は Story を更新して visual regression を取る。  
- E2E: 主要ユーザーフロー（作成・編集・削除など）を Playwright/現行 e2e によりカバレッジを維持。  
- A11y: axe 等を用いた自動チェックとマニュアルキーボード検証

---

## リスクと緩和策 ⚠️
- 見た目の微妙な差分 → テーマ調整（カラーパレット、コンポーネントスタイル）で対応  
- バンドルサイズ増加 → MUI の tree-shaking と必要なパッケージに限定（アイコンなどは必要時追加）  
- Tailwind と CSS-in-JS の複雑化 → 明確なルールをドキュメント化（いつ Tailwind を残すか、いつ MUI style を利用するか）

---

## 受け入れ基準（完了条件）✅
- 既存の主要ユーザーフローにおいて UI レイアウト崩れがない（主要ブラウザ）  
- Storybook の差分が審査を通過（視覚的に許容される差分のみ）  
- A11y 自動チェックエラーが重大項目で 0 であること  
- 必要なパフォーマンス（LCP/CLS）に悪影響がない

---

## タイムライン（ラフ見積）⏱️
- Discovery + PoC（2週間）: Button/Input/Theme の PoC を 1 コンポーネントで実施  
- Core primitives 置換（4–6 週）: Button, Input, Select, Checkbox, Radio, Switch, Dialog  
- ページ逐次移行 & QA（6–10 週）: ページ単位で移行、E2E/アクセシビリティ検証  
- 調整・残作業（2–4 週）: Theme 微調整、バンドル最適化、Docs更新

---

## ロールアウト方針（プレリリース前提）
- 本プロダクトはまだ正式リリース前のため、**公開互換性や feature-flag による段階的リリース、厳密なロールバック運用は必須ではありません**。より迅速な移行を優先し、必要に応じて API の変更や直接置換（ラッパーを介さない差し替え）を行って構いません。  
- ただし、変更は必ず Storybook, Unit, E2E, A11y テストで検証し、重大な回帰がないことを確認してからマージしてください。  
- 重大な問題が発生した場合は個別 hotfix（または修正 PR）での対処を行います。緊急対応はケースバイケースで行い、事後に振り返りを実施します。

---

## アクション（当面）
1. PoC 作成: `primitives/button` を MUI ボタンに置換する PoC を作る。  
2. Theme 設計: デザイントークンの初版を作成。  
3. テストカバレッジ: 既存 primitives の Storybook/Unit テストを整備しておく。

---

> 補足: 実際の移行では「ラッパーで API を維持」する戦略が最も安全で効率的です。まず PoC と theme を固め、そこからコア primitives を段階的に差し替えましょう。
