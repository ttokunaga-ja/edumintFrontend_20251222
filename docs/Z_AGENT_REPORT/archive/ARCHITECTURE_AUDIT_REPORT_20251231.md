# アーキテクチャ適合監査レポート
**監査実施日:** 2025年12月31日  
**監査範囲:** src/pages, src/components, src/locales  
**監査基準:** F_ARCHITECTURE.md, C_Page_REQUIREMENTS/* 

---

## 🎯 監査概要

4つの監査基準に基づいて、コードベースの現状を評価しました。以下に概要を示します。

| 観点 | 違反箇所数 | 重大度 |
|:---|:---|:---|
| **1. Pageファイル責務分離** | 0件 | ✅ 適合 |
| **2. 多言語対応（i18next）** | **12件** | 🔴 **高** |
| **3. MUI標準化** | 0件 | ✅ 適合 |
| **4. Z-Index設計** | **3件** | 🟠 **中** |

---

## 詳細監査レポート

### 1️⃣ Pageファイルの責務分離 (Separation of Concerns) ✅ 適合

**基準:** `src/pages/*.tsx` はルーティングのエントリーポイントおよびコンポジション（部品の配置）のみを実行。複雑なロジックやUIの直書きは禁止。

**監査結果:** **適合**

**判定根拠:**
- [HomePage.tsx](src/pages/HomePage.tsx) - 検索ロジックはカスタムフック `useSearch` へ正しく切り出されている。UIレイアウトのみ。
- [ProblemCreatePage.tsx](src/pages/ProblemCreatePage.tsx) - ステッパーおよび各フェーズコンポーネント（StartPhase, StructureConfirmation, ResultEditor）への組成のみ。
- [ProblemViewEditPage.tsx](src/pages/ProblemViewEditPage.tsx) - フォームロジック（useForm, watch）は適切に`useExamEditor`フックへ分離。
- 各ページはコンポーネントの呼び出しと基本的なレイアウトのみで、ビジネスロジックの直書きはなし。

✅ **修正不要**

---

### 2️⃣ 多言語対応（i18next 使用） 🔴 **違反 12件**

**基準:** ユーザーに表示されるテキストは全て `i18next` (`useTranslation`) を通し、`src/locales/{ja,en}/translation.json` で管理する。

**違反リスト:**

#### A. ボタンラベル・テキストのハードコード

| ファイル | 行番号 | ハードコード例 | 翻訳キー提案 |
|:---|:---:|:---|:---|
| [src/components/common/TopMenuBar.tsx](src/components/common/TopMenuBar.tsx#L392) | 392, 414, 479, 492 | `"ログイン"`, `"新規登録"` | `common.login`, `common.register` |
| [src/components/common/PreviewEditToggle.tsx](src/components/common/PreviewEditToggle.tsx#L53) | 53 | `"閲覧"`, `"編集"` | `common.view_mode`, `common.edit_mode` |
| [src/components/page/HomePage/AdvancedSearchPanel.tsx](src/components/page/HomePage/AdvancedSearchPanel.tsx#L342) | 342, 592, 650 | `"詳細検索"`, `"個別検索"`, `"検索"` | `search.advanced_search`, `search.custom_search`, `common.search` |
| [src/components/page/ProblemViewEditPage/SubQuestionBlock.tsx](src/components/page/ProblemViewEditPage/SubQuestionBlock.tsx#L165-L169) | 165-169, 229-233 | `"保存"`, `"キャンセル"` | `common.save`, `common.cancel` |
| [src/components/page/ProblemCreatePage/StartPhase.tsx](src/components/page/ProblemCreatePage/StartPhase.tsx#L252, #L329) | 252, 329 | `"削除"`, `"問題構造を確認..."` | `common.delete`, `problem.confirm_structure` |
| [src/components/page/ProblemCreatePage/ResultEditor.tsx](src/components/page/ProblemCreatePage/ResultEditor.tsx#L128, #L192, #L194) | 128, 192, 194 | `"削除"`, `"キャンセル"`, `"保存"` | `common.delete`, `common.cancel`, `common.save` |
| [src/pages/HomePage.tsx](src/pages/HomePage.tsx#L69-L74, #L89, #L104, #L109) | 69-74, 89, 104, 109 | `"最新"`, `"人気"`, `"閲覧数"`, `"おすすめ"`, `"検索中にエラー..."`, `"検索結果"` | `sort.newest`, `sort.popular`, `sort.views`, `sort.recommended`, `home.search_error`, `home.search_results` |
| [src/pages/ProblemViewEditPage.tsx](src/pages/ProblemViewEditPage.tsx#L145, #L255, #L263, #L277) | 145, 255, 263, 277 | `"保存中..."`, `"保存"`, `"変更が保存されていません..."`, `"保存して続行"`, `"キャンセル"` | `common.saving`, `common.save`, `problem.unsaved_changes`, `problem.save_and_continue`, `common.cancel` |

#### B. ErrorMessage & Alert テキスト

| ファイル | 行番号 | メッセージ | 翻訳キー提案 |
|:---|:---:|:---|:---|
| [src/components/common/LaTeXPreview.tsx](src/components/common/LaTeXPreview.tsx#L257) | 257 | `"一部の数式がレンダリングできません..."` | `latex.render_error` |
| [src/components/common/AdvancedEditorPreviewPanel.tsx](src/components/common/AdvancedEditorPreviewPanel.tsx#L192, #L210) | 192, 210 | `"保存中..."`, `"保存"` | `common.saving`, `common.save` |
| [src/components/common/NotificationPopover.tsx](src/components/common/NotificationPopover.tsx#L44) | 44 | `"報告の処理完了..."` | `notification.report_processed` |

#### C. Status & Label テキスト

| ファイル | 行番号 | テキスト | 翻訳キー提案 |
|:---|:---:|:---|:---|
| [src/components/generation/GenerationTimeline.tsx](src/components/generation/GenerationTimeline.tsx#L4) | 4 | `{ queued: '待機中', uploading: 'アップロード', analyzing: '解析', ... }` | `status.queued`, `status.uploading`, `status.analyzing` など |

**総違反数: 12件**

**修正手順:**
1. `src/locales/ja/translation.json` に不足キーを追加
2. 各コンポーネントで `useTranslation()` をインポートして `t('key')` に置換
3. 英語版 `src/locales/en/translation.json` も同時に作成

---

### 3️⃣ UIライブラリ統一（MUI v6 標準化） ✅ 適合

**基準:** スタイリングとコンポーネントは **MUI v6** (`@mui/material`) に統一。HTMLタグの直スタイリング禁止。

**監査結果:** **適合**

**判定根拠:**
- すべてのページコンポーネントで MUI コンポーネント（`Box`, `Button`, `TextField`, `Stack` など）が使用されている。
- `sx` prop による適切なスタイリング。
- Tailwind CSS の残骸や HTMLタグの直書きスタイリングなし。
- [src/theme](src/theme) で一元化された設定。

✅ **修正不要**

---

### 4️⃣ レイヤー・Z-Index設計の順守 🟠 **違反 3件**

**基準:** `docs/C_Page_REQUIREMENTS/C_0_PageLayerManagement_*.md` で定義された Z-Index ルール（Top Layer > App Shell > Content）を順守。マジックナンバー禁止。

**違反リスト:**

| ファイル | 行番号 | マジックナンバー | レイヤー分類 | 推奨対応 |
|:---|:---:|:---|:---|:---|
| [src/pages/ProblemCreatePage.tsx](src/pages/ProblemCreatePage.tsx#L36) | 36 | `zIndex: 99` | App Shell (L1) | `z-app-bar` 定数へ統一 |
| [src/components/common/NotificationCenter.tsx](src/components/common/NotificationCenter.tsx#L18) | 18 | `zIndex: 9999` | Top Layer (L2) | `z-modal` 定数へ統一 |
| [src/components/page/ProblemViewEditPage/ActionBar.tsx](src/components/page/ProblemViewEditPage/ActionBar.tsx#L32) | 32 | `zIndex: 1000` | App Shell (L1) | `z-app-bar` 定数へ統一 |

**総違反数: 3件**

**修正方針:**
1. `src/theme/zIndex.ts` にレイヤー定数を定義（例: `z-app-bar: 100`, `z-modal: 1000` 等）
2. マジックナンバーをシステム定数に置換
3. ガイドラインの Top Layer 方針（`<dialog>`, Popover API）への段階的移行

---

## 📋 修正計画（Phase 2実行内容）

### 優先度順序

| 優先度 | 観点 | ファイル数 | 目安時間 |
|:---|:---|:---:|:---|
| **P1（高）** | 多言語対応 | 8ファイル | 2.5時間 |
| **P2（中）** | Z-Index統一 | 3ファイル | 0.5時間 |

### P1: 多言語対応修正
1. **translation.json 拡張** - 不足キーを追加
2. **コンポーネント修正** - `useTranslation()` の導入と `t()` への置換
3. **テスト確認** - i18next の正常動作確認

### P2: Z-Index 統一修正
1. **定数定義** - `src/theme/zIndex.ts` 作成
2. **置換** - マジックナンバーを定数参照へ変更

---

## ⚠️ リスク & 補足

### リスク: 多言語対応の段階的実装
- **課題:** 既存の日本語テキストが多数あるため、一括置換で動作破壊の可能性。
- **対応:** テキストごとにコンポーネント単位でテストを実施。

### 補足: Top Layer 方針への段階的移行
- `NotificationCenter` の `zIndex: 9999` は、ドキュメントの Top Layer 方針に基づけば、ネイティブ Popover API や `<dialog>` への移行が推奨。
- ただし、本監査フェーズでは**現在のコードの定数化**を優先し、段階的移行は後続フェーズで実施。

---

## ✅ 監査完了

**適合状況:**
- ✅ Page責務分離: **完全適合**
- 🔴 多言語対応: **違反 12件 → 修正予定**
- ✅ MUI標準化: **完全適合**
- 🟠 Z-Index設計: **違反 3件 → 修正予定**

**全体評価:** 修正対象**15件**、実装難度**低〜中**、推定修正時間 **3時間**

---

## 次ステップ
**Phase 2: 修正実行** を開始します。
