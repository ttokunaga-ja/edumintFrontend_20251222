# ページ別：レイヤー（Top Layer）影響一覧

最終更新: 2025/12/25

この一覧は、各ページが利用しているコンポーネント群の中で「ダイアログ／ポップオーバー／セレクト等の Top Layer（Portal, z-index を使う）挙動に影響を受ける可能性がある箇所」を抽出したものです。優先的に置換・確認が必要な箇所を示します。

注意: 本監査はソースの静的参照に基づく推定です。実装の詳細（動的ロードやラッパー経由の利用など）によっては影響範囲が変わるため、各箇所のコンポーネント内部実装を順次精査してください。

---

## 検出方針
- ページファイルに直接インポートされるコンポーネント名を抽出
- 該当コンポーネント、または同ディレクトリ内のコンポーネントが `primitives`（`select`/`popover`/`dialog`等）を利用しているかを確認
- `primitives/*` 側で `Portal` / `z-50`／`@radix` を利用している場合、Top Layer 方針の影響対象と判定

---

## 影響サマリ（ページ単位）

- **HomePage**: [src/pages/HomePage.tsx](src/pages/HomePage.tsx)
  - 直接参照: `AdvancedSearchPanel` ([src/components/page/HomePage/AdvancedSearchPanel.tsx](src/components/page/HomePage/AdvancedSearchPanel.tsx)), `Card`, `Badge`
  - 影響: 高。`AdvancedSearchPanel` は `Select` 系を利用しています（`src/components/primitives/select.tsx` が `Portal` / `z-50` を使用）。Top Layer 方針により `Select` の挙動（ポップアウト位置・重なり）をネイティブ Popover へ移行可能か検討が必要。
  - 要確認ファイル: [src/components/page/HomePage/AdvancedSearchPanel.tsx](src/components/page/HomePage/AdvancedSearchPanel.tsx), [src/components/primitives/select.tsx](src/components/primitives/select.tsx)

- **MyPage**: [src/pages/MyPage.tsx](src/pages/MyPage.tsx)
  - 直接参照: `ProfileEditForm`, `Accordion`（`@/components/primitives/accordion` を使用）
  - 影響: 中。`Accordion` 自体は通常 Portal を使わないが、`ProfileEditForm`／子コンポーネントが `Tooltip` や `Select` を参照する可能性あり。
  - 要確認ファイル: [src/pages/MyPage.tsx](src/pages/MyPage.tsx), [src/components/primitives/accordion.tsx](src/components/primitives/accordion.tsx)

- **ProblemViewEditPage**: [src/pages/ProblemViewEditPage.tsx](src/pages/ProblemViewEditPage.tsx)
  - 直接参照: `PreviewEditToggle`, `ProblemMetaBlock`, `QuestionSectionView`, `ActionBar`, `ProblemEditor` 等
  - 影響: 低。現状の主要コンポーネントは `Card` / `Button` / `Badge` 等を使用し、Portal系（Dialog/Popover/Select）を直接使っている箇所は少ない。ただし `ProblemEditor` が動的にロードする `problemTypes/*` の編集コンポーネントに依存するため個別確認が必要。
  - 要確認ファイル: [src/components/page/ProblemViewEditPage/ProblemMetaBlock.tsx](src/components/page/ProblemViewEditPage/ProblemMetaBlock.tsx)

- **ProblemCreatePage**: [src/pages/ProblemCreatePage.tsx](src/pages/ProblemCreatePage.tsx) (コントローラ/ビュー分離)
  - 直接参照: `ProblemCreateController`, `ProblemCreateView`, 各フェーズコンポーネント
  - 影響: 低〜中。フォームや進捗表示が中心だが、ステップ内で `Select` や `Modal` を使う可能性があるためフェーズ別に精査推奨。
  - 要確認ファイル: [src/components/page/ProblemCreatePage/ProblemCreateView.tsx](src/components/page/ProblemCreatePage/ProblemCreateView.tsx)

- **LoginRegisterPage**: [src/pages/LoginRegisterPage.tsx](src/pages/LoginRegisterPage.tsx)
  - 直接参照: `AuthLayout`, `AuthProviderButtons`, `LoginForm`, `RegisterForm`
  - 影響: 低。主にフォーム要素。`AuthProviderButtons` がポップアップ認証を呼ぶ実装（OAuthフロー）で独自ポップオーバーを持つかは要確認。

- **AdminModerationPage**: [src/pages/AdminModerationPage.tsx](src/pages/AdminModerationPage.tsx)
  - 影響: 低（プレースホルダ実装）。将来的にモーダルや詳細ビューを追加する場合は再評価。

- **StructureConfirmPage / ProfileSetupPage**
  - 影響: 低。現在の実装はフォームとボタン中心でモーダル依存は見られません。

---

## グローバル／共通で影響する箇所

- `src/App.tsx` 内で通知ポップオーバーを直接 DOM 操作している箇所が見つかりました（`notifications-popover` のID参照）。
  - ファイル: [src/App.tsx](src/App.tsx#L100-L120)
  - 影響: 高。アプリ全体の通知 UI は Top Layer 方針の重要対象です。`NotificationPopover`（[src/components/common/NotificationPopover.tsx](src/components/common/NotificationPopover.tsx)）の置換を優先してください。

- `src/components/primitives/*` 一覧（Top Layer 挙動を行う主要ラッパー）:
  - `dialog.tsx`, `alert-dialog.tsx`, `popover.tsx`, `tooltip.tsx`, `select.tsx`, `dropdown-menu.tsx`, `sheet.tsx`, `drawer.tsx`, `menubar.tsx`, `hover-card.tsx`, `context-menu.tsx`, `command.tsx` など。
  - これらは Radix 等の Portal を利用しており、既存では `z-50` 等の `z-index` を CSS クラスで与えています。該当するプリミティブを `NativeDialog` / `NativePopover` に段階的に置換する計画を進めてください。
  - 参考: [src/components/primitives/dialog.tsx](src/components/primitives/dialog.tsx), [src/components/primitives/popover.tsx](src/components/primitives/popover.tsx), [src/components/primitives/select.tsx](src/components/primitives/select.tsx)

---

## 推奨次アクション（短期）
1. 優先度高: `NotificationPopover` と `AdvancedSearchPanel`（Select）を最初の置換候補に登録する。
2. 各ページごとに「影響あり」と判定したコンポーネント内で `primitives/*` の使用箇所を一覧化する（自動化スクリプトで巡回可能）。
3. `primitives` 側で互換ラッパー（`NativeDialog` / `NativePopover`）を作成し、段階的に切り替えられるフラグを実装する。

---

必要であれば、このファイルをベースに「ページ→コンポーネント→primitives 使用箇所」の完全トレース（自動）を実行してCSV/Markdownで出力します。実行しますか？
