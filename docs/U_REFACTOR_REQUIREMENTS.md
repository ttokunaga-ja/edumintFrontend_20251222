# リファクタリング要件定義書（アーキテクチャ準拠チェック & 移行計画） ✅

## 概要
本ドキュメントは、現行リポジトリのディレクトリ構造と挙動を、プロジェクト標準（React + TypeScript アーキテクチャ原則）に照らして評価し、差分（逸脱点）・修正要件・優先度付き移行計画・受け入れ基準を定義します。

---

## 現状サマリ（発見内容） 🔎
- 主要構成は以下のとおり（抜粋）:
  - Pages: `src/pages/*`（例: `HomePage.tsx`, `ProblemViewEditPage.tsx`, `ProblemCreatePage.tsx`）
  - Page専用 Components: `src/components/page/<PageName>/*`（多くが適切に分離済み）
  - CommonComponents: `src/components/common/*`（Header や Notification など）
  - Primitives: `src/components/primitives/*`（Radix wrapper 等）
  - Domain/Feature 層: `src/features/*`（`hooks` / `api` / `repository` 等）
  - Generic Hooks: `src/hooks/*`
  - Types: `src/types/*`

- 既にアーキテクチャへ準拠している点
  - `components/page` と `components/common` による責務分離が進んでいる
  - Domain hook（`src/features/*/hooks`）が存在し、ドメインロジックは概ねそこに集約されている
  - `primitives` による低レイヤー UI 抽象が整備されている

---

## 主要な逸脱点（差分） 🚨
1. **Page ファイル配置 / 命名規則が統一されていない**
   - 例: `src/pages/HomePage.tsx`（単一ファイル）→ 規約では `src/pages/HomeSearch/HomeSearchPage.tsx` のようにページ単位フォルダ配下に `*Page.tsx` を置く。現状、ページがルート直下に分散している。\
   - 影響: 可搬性・検索性・自動生成/スキャフォールドとの親和性が低下。

2. **一部 Page がロジック／データ取得を内包している（責務分離違反）**
   - 例: `src/pages/HomePage.tsx` が `useEffect` で API を直接呼び、状態管理（`problems`, `isLoading` 等）を持つ。
   - 規約では Page は「何を使うか（composition）」だけ持ち、通信・手続きは Page 専用 Hook（`src/pages/<PageName>/hooks/use<PageName>Controller.ts`）や Domain Hook に委譲するべき。

3. **Page 命名規約と Hook/Controller 命名に一貫性がない箇所がある**
   - いくつかの Page はすでにコントローラを持つ（`src/pages/ProblemCreatePage/hooks/useProblemCreateController.ts`）が、他ページは未整備。均一化が必要。

4. **`src/api` のトップレベル存在がない（API 層命名の差）**
   - 実装は `src/features/<domain>/api.ts` や `repository.ts` に分散している。機能的には問題ないが、リポジトリ内の API 層の位置付け（命名）を規約として明示する必要あり。

5. **一部 `primitives`（Portal/Popover/Select）に Top Layer（z-index）動作が集中している**
   - 既存の Top Layer 方針（native popover/dialog に移行等）と整合を取りながら移行する必要がある（互換性検証が必要）。

6. **ドキュメント内の参照（`src/src`）と実コード（`src/`）の参照不一致**
   - ドキュメント群に旧パス表記が残っている箇所があり、ドキュメントの正規化が必要。

---

## 優先度付き修正要件（Must / Should / Nice-to-have） 🛠️
### Must（必須）
- M1: **ページ配置と命名の標準化**
  - 各 Page を `src/pages/<PageName>/<PageName>Page.tsx` に移動・リネームする（例: `src/pages/HomePage/HomePagePage.tsx` または `HomePage/HomePagePage.tsx`、推奨: `HomeSearch/HomeSearchPage.tsx` のように業務名で統一）。
  - 既存ルーティングの import を更新し、動作確認を行う。

- M2: **Page からビジネス/通信ロジックを切り出す**
  - `src/pages/HomePage.tsx` の `fetchProblems` 等を `src/pages/HomePage/hooks/useHomePageController.ts` に抽出し、Page はコントローラを使用するのみとする。
  - 同様に、ロジックを含む Page をすべて洗い出し、Page Controller を作成して置換。

- M3: **依存方向と境界ルールを自動検出する静的チェック**
  - ESLint ルール（`eslint-plugin-boundaries` / `import/no-restricted-paths` 等）を導入して、以下違反を CI でブロックする:
    - `components/page/<PageA>` を他ページから import するケース
    - `features/*` が UI へ依存するケース
    - Page が `api` を直接参照するケース（許容しない）

- M4: **ドキュメント整備**
  - 本リファクタリング方針を README + `docs/` に明記（命名規則、ディレクトリ権限、例）し、開発者が参照できるようにする。

### Should（推奨）
- S1: **`src/api/` の採用または features 側での命名規則明確化**（どちらかに統一）
- S2: **Page 作成テンプレート（CLI / dev:generate）を用意し、命名・フォルダ構成を enforce**
- S3: **移行用 Codemod / スクリプトを用意する（ファイル移動・import 更新を自動化）**

### Nice-to-have
- N1: **アーキテクチャチェック用のドキュメント自動 Diff レポート（PR 向け）を整備**
- N2: **コンポーネント Border Diagram（依存図）を生成・可視化**

---

## 移行プラン（段階・タスク） 🧭
目的: リスクを小さく段階的に移行し、CI/テストで安全性を担保する。

1. 準備フェーズ（短期間: 1-2 日）
   - ルール決定（Page 命名規則・Controller 命名・API 層の位置）
   - ESLint プラグインの導入案作成（設定ファイル）
   - 影響範囲のスキャン（Pages でロジックを内包しているファイル一覧）

2. コントローラ抽出（段階移行: ページ毎に PR）
   - プライオリティ: `HomePage` → `ProblemCreatePage` → `ProblemViewEditPage` → 残り
   - タスク（Per-Page）:
     1. `src/pages/<PageName>/hooks/use<PageName>Controller.ts` を作成
     2. ビジネスロジック / API 呼出し / state を移動
     3. テスト（Unit: controller）を追加
     4. Page を短く保ち、UI は既存 `components/page` を使用
     5. PR を作りレビュー・マージ

3. ファイル構造の正規化
   - 各 Page をフォルダに移動し `*Page.tsx` にリネーム
   - 既存 import の path を Codemod または手動で更新
   - ルーティング（router.tsx / App.tsx）を更新

4. 静的チェック導入
   - ESLint ルールを有効化し、CI に組込む（段階的に error → warning → error に昇格）

5. レガシー解除 & クリーンアップ
   - 参照されなくなった legacy コンポーネントを削除
   - docs 内の `src/src` 等古い参照を正規化

6. 仕上げ・監査
   - 全ページ単位で差分レビュー
   - パフォーマンステスト・UX スモークテスト

---

## PR レベルでのチェックリスト（必須） ✅
- [ ] Page の移動・リネームは router の変更を含む
- [ ] Page にロジックが残っていないこと（入出力は controller から）
- [ ] 新規 controller に Unit テストがあること
- [ ] ESLint/TypeScript エラーが 0 のこと
- [ ] 既存の Storybook/Visual Regression が壊れていないこと（必要に応じて更新）
- [ ] `docs/U_REFACTOR_REQUIREMENTS.md` に対象 Page を追加し、移行ステータスを更新

---

## 受け入れ基準（Definition of Done） 🎯
- 全ページが `src/pages/<PageName>/<PageName>Page.tsx` 構成に移行済み（もしくは移行計画が PR ベースで進行中）
- 各 Page は `use<PageName>Controller`（あるいは該当する Page Hook）を使用している
- ESLint のアーキテクチャルールが CI で有効化され、違反はブロックされる
- docs が更新され、`docs/U_REFACTOR_REQUIREMENTS.md` が現状を反映している

---

## 見積り（ラフ）と優先度
- 低リスク整備（ドキュメント + ESLint 設定）: 0.5〜1.0 人日
- HomePage の controller 抽出 + テスト: 0.5〜1 人日
- 主要ページ（3〜5 ページ）の移行（個別 PR）: 3〜7 人日（レビュー含む）
- Legacy 削除と最終監査: 1〜2 人日

---

## 注意事項 / リスク ⚠️
- 大規模なファイル移動は import path の壊れ・CI 停止を招くため、段階的に小さな PR（1 ページずつ）で進めること。Codemod を用いると人的ミスが減る。
- `primitives` の Top Layer ポリシー変更は UI レンダリングや z-index の振る舞いに影響するため、包括的な QA が必要。

---

## 次のアクション（短期） ➤
1. 方針を確定してこのドキュメントをコアチームで承認する（本ドキュメントを `docs/` に追加済み）。
2. ESLint のアーキテクチャルール（提案設定ファイル）を作成して、少なくとも `warning` として CI に導入する。
3. `HomePage` の controller 抽出 PR を作成し、方針のテンプレートを示す。

---

もしよければ、直ちに `HomePage` の controller 抽出 PR を作成するテンプレート（コード例 + テスト）を作って PR の雛形まで用意します。希望する場合は "続けて HomePage を実装して" と指示してください。 ✨
