## 画面レイヤー管理 リファクタリング計画書

最終更新: 2025/12/25

目的: プロジェクトの「Top Layer」方針（`<dialog>` / Popover API）へ段階的に移行し、`z-index` 依存と Portal 過度利用を解消する。

**1) 監査での主要所見（抜粋）**
- `src/components/primitives/dialog.tsx`, `alert-dialog.tsx` 等で Radix UI の Portal/Overlay（`z-50` 等の `z-index`）が使用されている。
- `src/components/primitives/command.tsx` は上記ダイアログを通して CommandPalette を実装している（Modal系の依存を持つ）。
- グローバルCSSに `z-index` の定義が複数存在（`src/index.css`: `z-index: 10/20/30/...`）。
- popover 関連の変数・スタイルは存在するが、ネイティブ Popover API へ置き換えられていない箇所がある。

**2) 目的化（ゴール）**
- 全てのモーダル／アラート／ポップオーバー類を可能な限りネイティブ `Top Layer` 実装へ移行する。
- `z-index` による重なり制御を廃止（例外はコンポーネント内装飾のみ）。
- アクセシビリティ（フォーカス管理、Esc閉じ）をネイティブ挙動へ寄せる。

**3) 優先度付け（高→低）**
1. `primitives/dialog.tsx` / `alert-dialog.tsx` をネイティブ実装に置き換え（高）
2. グローバル `z-index` 利用箇所の整理と代替スタイリング（中）
3. ポップオーバー（ドロップダウン / ツールチップ）の Popover API 化（中）
4. `createPortal` の使用箇所レビューと必要箇所の限定（低）

**4) 実装フェーズ（段階的）**

- フェーズ A: 基盤の用意（共通コンポーネント） — 期間目安: 1週
  - 作成: `NativeDialog` コンポーネント（`<dialog>` をラップ、`.showModal()` 管理、`::backdrop` スタイル対応、onCloseハンドラ、フォーカストラップ補助）
  - 作成: `NativePopover` ラッパー（Popover API を利用する簡易API、anchor属性のラッピング、フォールバック用の軽量配置）
  - 互換レイヤ: `components/primitives/*` にて一時的に Radix と Native の切り替えフラグを用意（トップレベルで切り替え可能にして段階移行を容易にする）

- フェーズ B: コアコンポーネントの置換（段階的） — 期間目安: 1–2週
  - `Dialog`, `AlertDialog`, `CommandDialog` の順で `NativeDialog` へ移行。最初は UI/見た目の互換性を保つ。
  - Backdrop スタイリングを `::backdrop` に移行し、`z-index` クラスを削除。
  - 各ページ（`ProblemCreatePage`, `ProblemViewEditPage`, `LoginRegisterPage`, `AdminModerationPage`, `MyPage`, `HomePage` 等）でモーダル起点の箇所を確認し、1ページずつ切替・検証を行う。

- フェーズ C: Popover/Tooltip の移行と最適化 — 期間目安: 1週
  - Popover API を導入できる箇所は置き換え。CSS Anchor Positioning を使って位置調整を行う。
  - どうしても複雑な位置計算が必要な箇所のみ `Floating UI` 等を併用し、結果を Top Layer 要素へ反映する。

- フェーズ D: 後処理（クリーンアップ） — 期間目安: 1週
  - 不要になった Portal / Radix 依存を削除（段階的）。
  - `z-index` ルールの削除、ドキュメント更新、PRテンプレートのチェックリスト反映。

**5) 技術詳細 / 実装方針**
- `NativeDialog` の API は現行 Radix wrapper と互換性を持たせる（`Dialog`, `DialogContent`, `DialogTrigger` 等のAPIを維持）ことで差し替えのコストを最小化する。
- `NativeDialog` 実装でのポイント:
  - DOM は必要時に `.showModal()` / `.close()` で制御する。
  - `onCancel` と `onClose` を正しくハンドリングし、React の state と同期させる。
  - `::backdrop` で背景と blur を実現し、アニメーションは `@starting-style` / `[open]` セレクタで制御する。
- Popover のポイント:
  - 可能なら `popovertarget` / `popover` 属性を使用する。属性サポートの無いブラウザでは小さなポリフィル／フォールバックを用意する。

**6) テスト・QA**
- 自動テスト: 各モーダルコンポーネントに対してアクセシビリティ（a11y）テストを追加（focus trap, Esc 応答, スクリーンリーダーの読み上げ）
- E2E: 主要ページ（Create, View, Login/Register, Admin）でモーダル開閉フローを Cypress / Playwright 等で回帰テスト
- 手動: ブラウザの互換性チェック（特に Popover APIサポートの有無）

**7) リスク・対応**
- リスク: 古いブラウザで Popover API 非サポート → 対応: フォールバックの軽量スクリプト
- リスク: 既存の Radix に依存した細かな機能差異（アニメーション、ステート）→ 対応: 互換ラッパーを作り段階移行

**8) 影響範囲（初期候補）**
- 直接影響: `src/components/primitives/*`（dialog, alert-dialog, tooltip/Popover系）
- 間接影響: `src/components/*` のダイアログ利用箇所、`src/pages/*` のページコード、グローバルCSS（`src/index.css`）

**9) 見積もり（ラフ）**
- フェーズ A: 1人週
- フェーズ B: 1–2人週（段階的にページを切り替えながら）
- フェーズ C: 1人週
- フェーズ D: 0.5–1人週

合計見積（初期）: 約 3.5–5人週

**10) PRチェックリスト（追加項目）**
- [ ] `z-index` を用いた新規スタイルが無い
- [ ] モーダルは `NativeDialog`（または `dialog`ベース）になっている
- [ ] Popover は可能な限り Popover API を利用している
- [ ] 既存の UX（フォーカス、Esc、スクリーンリーダー）を満たしている

---

**実装状況（進捗）**
- `NativeDialog` を `src/components/primitives/native-dialog.tsx` として追加（`<dialog>` ラッパー、`.showModal()` 管理）。
- `NativePopover` を `src/components/primitives/native-popover.tsx` として追加（Popover API を優先、Radix Popover にフォールバック）。
- `NativeSelect` を `src/components/primitives/native-select.tsx` として試作し、`AdvancedSearchPanel` 内の `Select` を段階的に置換しました（`src/components/page/HomePage/AdvancedSearchPanel.tsx`）。
- `NotificationPopover` をネイティブ Popover の利用に対応するよう修正。

**追加: レイヤー扱いの方針適用**
- トップバーの z-index を安易に上げるのではなく、ページ固有のブロック（ProblemCreate 等）に対して **`isolation:isolate` + `z-0`（局所的な stacking context）** を付与することで、トップバーを常に前面に維持する方法を採用しました。
- 上記はガイドラインの原則に従い、`z-index` の戦いを避けつつ実際的にレイヤー制御を行う手法です。
次の手順: この計画をベースに「ページ別影響一覧」を作成します（各ページで使われているダイアログ/ポップオーバー箇所を列挙）。よければ自動でページ別の影響抽出を進めます。
