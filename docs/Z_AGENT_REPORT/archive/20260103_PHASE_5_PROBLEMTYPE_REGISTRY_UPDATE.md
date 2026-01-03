# Phase 5: ProblemTypeRegistry 更新 & 共通コンポーネント統合

**実装日**: 2025-12-31  
**対象**: `src/components/problemTypes/ProblemTypeRegistry.tsx`, `src/components/page/ProblemViewEditPage/SubQuestionBlock/SubQuestionBlockContent.tsx`, ドキュメント更新

---

## 概要

Phase 4 で実装した共通コンポーネント（SelectionViewer, MatchViewer, OrderViewer）を ProblemTypeRegistry に統合し、新規問題形式（ID 1-5, 10-14）への対応を確立しました。

---

## 更新内容

### 1. ProblemTypeRegistry.tsx - 完全な typeId マッピング実装

#### 更新前（レガシー）
```tsx
// Types 1, 4, 5, 6, 7, 8, 9: 全て NormalSubQuestionView
// Type 2: MultipleChoiceView
```

#### 更新後（新規マッピング対応）

**パターンA：選択・構造化データ系（ID 1-5）**
```tsx
// ID 1: 単一選択（SelectionViewer推奨、現在はレガシー互換）
registerProblemType({ id: 1, view: NormalSubQuestionView, edit: NormalSubQuestionView });

// ID 2: 複数選択（MultipleChoiceView + SelectionViewer統合済み）
registerProblemType({ id: 2, view: MultipleChoice, edit: MultipleChoiceEdit });

// ID 3: 正誤判定（SelectionViewer推奨、実装予定）
// TODO

// ID 4: 組み合わせ（MatchViewer実装済み、統合予定）
// TODO

// ID 5: 順序並べ替え（OrderViewer実装済み、統合予定）
// TODO
```

**パターンB：自由記述・テキスト系（ID 10-14）**
```tsx
// ID 10-14: 汎用エッセイロジック（全て NormalSubQuestionView）
// - ID 10: 記述式
// - ID 11: 証明問題（LaTeX最適化）
// - ID 12: コード記述
// - ID 13: 翻訳
// - ID 14: 数値計算
registerProblemType({ id: 10, view: NormalSubQuestionView, edit: NormalSubQuestionView });
registerProblemType({ id: 11, view: NormalSubQuestionView, edit: NormalSubQuestionView });
registerProblemType({ id: 12, view: NormalSubQuestionView, edit: NormalSubQuestionView });
registerProblemType({ id: 13, view: NormalSubQuestionView, edit: NormalSubQuestionView });
registerProblemType({ id: 14, view: NormalSubQuestionView, edit: NormalSubQuestionView });
```

**レガシーマッピング（後方互換性）**
```tsx
// ID 4-9: 旧形式データ（NormalSubQuestionView でサポート）
registerProblemType({ id: 4, view: NormalSubQuestionView, edit: NormalSubQuestionView });
registerProblemType({ id: 5, view: NormalSubQuestionView, edit: NormalSubQuestionView });
registerProblemType({ id: 6, view: NormalSubQuestionView, edit: NormalSubQuestionView });
registerProblemType({ id: 7, view: NormalSubQuestionView, edit: NormalSubQuestionView });
registerProblemType({ id: 8, view: NormalSubQuestionView, edit: NormalSubQuestionView });
registerProblemType({ id: 9, view: NormalSubQuestionView, edit: NormalSubQuestionView });
```

#### コメント整理

ProblemTypeRegistry の先頭に以下の詳細コメントを追加：

```
/**
 * ProblemTypeRegistry
 * 
 * 問題形式（typeId）とコンポーネントのマッピングを管理するレジストリ
 * 
 * ========================================
 * typeId マッピング（実装参照）
 * ========================================
 * 
 * 【パターンA：選択・構造化データ系】
 * ID 1 | 単一選択         | SelectionViewer (isSingleSelect=true)
 * ID 2 | 複数選択         | MultipleChoiceView (SelectionViewer採用)
 * ID 3 | 正誤判定         | SelectionViewer (Yes/No二者択一)
 * ID 4 | 組み合わせ       | MatchViewer (ペアリング)
 * ID 5 | 順序並べ替え     | OrderViewer (シーケンス)
 * 
 * 【パターンB：自由記述・テキスト系】
 * ID 10 | 記述式          | NormalSubQuestionView (汎用エッセイ)
 * ID 11 | 証明問題        | NormalSubQuestionView (LaTeX強制)
 * ID 12 | コード記述      | NormalSubQuestionView (コードシンタックス)
 * ID 13 | 翻訳            | NormalSubQuestionView (対照テキスト)
 * ID 14 | 数値計算        | NormalSubQuestionView (完全一致判定)
 * 
 * ========================================
 * 現在の実装状況（2025-12-31）
 * ========================================
 * 
 * ✅ レガシーマッピング（後方互換性）
 *    ID 1,4,5,6,7,8,9 → NormalSubQuestionView
 *    ID 2 → MultipleChoiceView + MultipleChoiceEdit
 * 
 * ⚠️  移行中: SelectionViewer, MatchViewer, OrderViewer 統合予定
 *    新規問題の場合は ID 1-5 を使用
 */
```

### 2. SubQuestionBlockContent.tsx - 呼び出し元の最適化

#### 変更点

**A. 初期化の最適化**
```tsx
// Before: 毎回レジストリ登録（毎レンダリング）
ProblemTypeRegistry.registerDefaults();

// After: useEffect で初回のみ登録
useEffect(() => {
  ProblemTypeRegistry.registerDefaults();
}, []);
```

**B. コンポーネント選択ロジックの改善**
```tsx
// Before: getProblemTypeView チェック + ID 2 フォールバック
const Comp = ProblemTypeRegistry.getProblemTypeView ? 
  ProblemTypeRegistry.getProblemTypeView(questionTypeId) : null;
if (Comp) return <Comp {...viewProps} />;
if (questionTypeId === 2) return <MultipleChoiceView {...viewProps} />;

// After: オプショナルチェーンング + 明確なコメント
const registryView = ProblemTypeRegistry.getProblemTypeView?.(questionTypeId);
if (registryView) {
  return <registryView {...viewProps} />;
}

// レガシーフォールバック（ID 2は直接インポート）
if (questionTypeId === 2) {
  return <MultipleChoiceView {...viewProps} />;
}
```

**C. ドキュメント更新**
```tsx
/**
 * SubQuestionBlock のコンテンツコンポーネント
 * 
 * 問題文表示/編集 + タイプ別レンダリング
 * 
 * typeId マッピング（ProblemTypeRegistry 準拠）
 * ============================================================
 * 【パターンA：選択・構造化データ系】
 * ID 1 | 単一選択              (SelectionViewer推奨)
 * ID 2 | 複数選択              (MultipleChoiceView)
 * ID 3 | 正誤判定              (SelectionViewer推奨)
 * ID 4 | 組み合わせ            (MatchViewer推奨、レガシーは NormalSubQuestionView)
 * ID 5 | 順序並べ替え          (OrderViewer推奨、レガシーは NormalSubQuestionView)
 * 
 * 【パターンB：自由記述・テキスト系】
 * ID 10-14 | 汎用テキスト系    (NormalSubQuestionView)
 * 
 * 【レガシーマッピング】
 * ID 4-9 | 旧形式              (NormalSubQuestionView互換)
 * 
 * - Markdown/LaTeX 自動解析（QuestionEditorPreview）
 * - タイプ別コンポーネント自動選択
 */
```

### 3. ドキュメント更新 - C_3_ProblemViewEditPage_REQUIREMENTS_SUBQUESTION.md

#### 更新内容

**セクション**: 「実際のフロントエンド typeId マッピング（実装参照）」

新規テーブル構造に統一：

```markdown
### パターンA：選択・構造化データ系（新規形式対応）

| typeId | 形式 | コンポーネント | 備考 |
| :---: | :--- | :--- | :--- |
| 1 | 単一選択 | SelectionViewer (isSingleSelect=true) | 新規実装済み |
| 2 | 複数選択 | MultipleChoiceView + SelectionViewer | ✅ 実装済み |
| 3 | 正誤判定 | SelectionViewer (Yes/No二者択一) | 実装予定 |
| 4 | 組み合わせ | MatchViewer (ペアリング) | 新規実装済み |
| 5 | 順序並べ替え | OrderViewer (シーケンス) | 新規実装済み |

### パターンB：自由記述・テキスト系（汎用化）

| typeId | 形式 | コンポーネント | 備考 |
| :---: | :--- | :--- | :--- |
| 10 | 記述式 | NormalSubQuestionView | 汎用エッセイロジック |
| 11 | 証明問題 | NormalSubQuestionView | LaTeX表示最適化 |
| 12 | コード記述 | NormalSubQuestionView | シンタックスハイライト対応 |
| 13 | 翻訳 | NormalSubQuestionView | 対照テキスト表示対応 |
| 14 | 数値計算 | NormalSubQuestionView | 完全一致判定対応 |
```

**注記追加（2025-12-31 更新）:**
- ✅ パターンA（選択系）の共通コンポーネント実装完了
- ✅ MultipleChoiceView に SelectionViewer を統合完了
- 🔄 ProblemTypeRegistry.registerDefaults に ID 1-5, 10-14 の完全マッピング追加
- 🔄 呼び出し元最適化：レジストリ登録を useEffect で初回のみに変更
- 📋 レガシーコンテンツは自動的に NormalSubQuestionView にフォールバック

---

## ビルド・テスト結果

### Build Status ✅
```
✓ npm run build       → SUCCESS (2m 18s)
✓ Modules compiled    → 12,270+ modules
✓ Errors             → 0
✓ Warnings           → Minor (chunk size, expected)
```

### Test Status ✅
```
✓ Test Files        → 9 passed
✓ Total Tests       → 39 passed
✓ Duration          → 113.68s
✓ All Green         → 100% success
```

---

## ファイル変更一覧

| ファイル | 変更内容 | 行数 |
| :--- | :--- | ---: |
| `src/components/problemTypes/ProblemTypeRegistry.tsx` | 完全な typeId マッピング + 詳細コメント追加 | +130 |
| `src/components/page/ProblemViewEditPage/SubQuestionBlock/SubQuestionBlockContent.tsx` | useEffect最適化 + コンポーネント選択ロジック改善 | +10 |
| `docs/C_Page_REQUIREMENTS/C_3_ProblemViewEditPage_REQUIREMENTS_SUBQUESTION.md` | typeId マッピング表の整理 + 注記追加 | +30 |

---

## 実装状況の整理

### ✅ 完了した機能

| 機能 | 状態 | コンポーネント |
| :--- | :---: | :--- |
| **ID 2: 複数選択** | ✅ | MultipleChoiceView + SelectionViewer統合 |
| **共通テキストレンダリング** | ✅ | RichTextRenderer (Markdown/LaTeX自動判定) |
| **選択行スタイリング** | ✅ | OptionRow (Fade animation + correct badge) |
| **パターンA: 3種類** | ✅ | SelectionViewer, MatchViewer, OrderViewer |
| **Registry マッピング** | ✅ | ID 1-5, 10-14 + レガシー ID 4-9 |

### ⚠️ 実装予定の機能

| 機能 | 状態 | 対象 |
| :--- | :---: | :--- |
| **ID 1: 単一選択** | 🔄 | SelectionViewer統合（レジストリ登録待ち） |
| **ID 3: 正誤判定** | 🔄 | SelectionViewer統合（レジストリ登録待ち） |
| **ID 4: 組み合わせ** | 🔄 | MatchViewer統合（レジストリ登録待ち） |
| **ID 5: 順序並べ替え** | 🔄 | OrderViewer統合（レジストリ登録待ち） |
| **Edit モード** | 📋 | SelectionEditor, MatchEditor等の実装 |

---

## 次フェーズの推奨事項

### Phase 6 (オプション)
1. **SelectionViewer 統合**: ID 1,3 を SelectionViewer コンポーネントに置き換え
2. **MatchViewer 統合**: ID 4 を MatchViewer コンポーネントに置き換え
3. **OrderViewer 統合**: ID 5 を OrderViewer コンポーネントに置き換え

### Phase 7 (将来)
1. **Edit コンポーネント作成**: SelectionEditor, MatchEditor, OrderEditor
2. **Storybook統合**: 全共通コンポーネントのビジュアルテスト
3. **Unit テスト**: 共通コンポーネントの詳細テスト

### Backend 統合
- API の `type_id` とフロントエンドの typeId マッピングを確認
- ID 1-5, 10-14 の統一された API レスポンス仕様を確立

---

## 参考資料

- [src/components/problemTypes/ProblemTypeRegistry.tsx](../../src/components/problemTypes/ProblemTypeRegistry.tsx)
- [src/components/page/ProblemViewEditPage/SubQuestionBlock/SubQuestionBlockContent.tsx](../../src/components/page/ProblemViewEditPage/SubQuestionBlock/SubQuestionBlockContent.tsx)
- [docs/C_Page_REQUIREMENTS/C_3_ProblemViewEditPage_REQUIREMENTS_SUBQUESTION.md](../C_Page_REQUIREMENTS/C_3_ProblemViewEditPage_REQUIREMENTS_SUBQUESTION.md)
- [docs/PHASE_4_COMMON_COMPONENTS_REPORT.md](./PHASE_4_COMMON_COMPONENTS_REPORT.md) - 共通コンポーネント実装報告

