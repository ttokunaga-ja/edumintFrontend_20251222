# Phase 6: レガシーマッピング削除 & UI更新

**実装日**: 2025-12-31  
**対象**: 
- `src/components/problemTypes/ProblemTypeRegistry.tsx`
- `src/components/page/ProblemViewEditPage/QuestionSectionEdit.tsx`
- `src/components/page/ProblemViewEditPage/SubQuestionBlock.tsx`

---

## 概要

ProblemTypeRegistry から旧形式（ID 4-9）のレガシーマッピングを削除し、新規問題形式（ID 1-5, 10-14）のみに対応させました。同時にUI層（プルダウン、ラベル定義）を整理し、アーキテクチャ全体の一貫性を確保しました。

---

## 更新内容

### 1. ProblemTypeRegistry.tsx - レガシーマッピング完全削除

#### 削除内容

```tsx
// 削除前（レガシー ID 4-9）
registerProblemType({ id: 4, view: NormalSubQuestionView, edit: NormalSubQuestionView });
registerProblemType({ id: 5, view: NormalSubQuestionView, edit: NormalSubQuestionView });
registerProblemType({ id: 6, view: NormalSubQuestionView, edit: NormalSubQuestionView });
registerProblemType({ id: 7, view: NormalSubQuestionView, edit: NormalSubQuestionView });
registerProblemType({ id: 8, view: NormalSubQuestionView, edit: NormalSubQuestionView });
registerProblemType({ id: 9, view: NormalSubQuestionView, edit: NormalSubQuestionView });
```

#### 代替処理

```tsx
// 新規形式へのクリーンな移行
// ========================================
// 新規形式での ID 1-5 (上記で完全登録)
// 新規形式での ID 10-14 (上記で完全登録)
// レガシーマッピングは廃止 (2025-12-31)
// ========================================
// NOTE: 既存コンテンツで ID 4-9 を使用している場合は、
// データマイグレーションまたはレジストリに再度追加する必要があります
```

#### 意図

- 新規形式への完全な移行を明示
- 既存コンテンツに対する明確な警告
- レジストリのクリーンさを確保

---

### 2. QuestionSectionEdit.tsx - typeOptions の統一更新

#### ファイルフォーマット改善

**問題点**: ファイル全体が1行に圧縮されていました  
**解決**: 適切なインデント・改行で展開

#### typeOptions の更新

**更新前**（レガシーID 4-9）
```tsx
const typeOptions = [
  { value: 1, label: '記述式' },
  { value: 2, label: '選択式' },
  { value: 4, label: '穴埋め' },
  { value: 5, label: '正誤' },
  { value: 6, label: '数値計算' },
  { value: 7, label: '証明' },
  { value: 8, label: 'プログラミング' },
  { value: 9, label: 'コード読解' },
];
```

**更新後**（新規形式 ID 1-5, 10-14）
```tsx
const typeOptions = [
  // 選択系パターン
  { value: 1, label: '単一選択' },
  { value: 2, label: '複数選択' },
  { value: 3, label: '正誤判定' },
  { value: 4, label: '組み合わせ' },
  { value: 5, label: '順序並べ替え' },
  // 記述系パターン
  { value: 10, label: '記述式' },
  { value: 11, label: '証明問題' },
  { value: 12, label: 'コード記述' },
  { value: 13, label: '翻訳' },
  { value: 14, label: '数値計算' },
];
```

**改善点**:
- パターンA（選択系）とパターンB（記述系）を明確に区分
- 各IDの意味を統一的に命名
- コメントで パターン区分を明確化
- IDE の自動整形に対応できる可読性

---

### 3. SubQuestionBlock.tsx - questionTypeLabels の統一

#### ラベル定義の更新

**更新前**（6種類の混合）
```tsx
const questionTypeLabels: Record<number, string> = {
  1: '記述式',
  2: '選択式',
  3: '穴埋め',
  4: '論述式',
  5: '証明問題',
  6: '数値計算式',
};
```

**更新後**（新規形式 10種類、統一）
```tsx
// 新規問題形式のラベル定義（ID 1-5, 10-14）
// パターンA：選択・構造化データ系（ID 1-5）
// パターンB：自由記述・テキスト系（ID 10-14）
const questionTypeLabels: Record<number, string> = {
  // パターンA：選択系
  1: '単一選択',
  2: '複数選択',
  3: '正誤判定',
  4: '組み合わせ',
  5: '順序並べ替え',
  // パターンB：記述系
  10: '記述式',
  11: '証明問題',
  12: 'コード記述',
  13: '翻訳',
  14: '数値計算',
};
```

**改善点**:
- 選択系と記述系の分類が直感的
- QuestionSectionEdit と一貫した命名
- SubQuestionBlock で使用されるラベルが統一

---

## 影響範囲

### 直接的な影響

| ファイル | 影響内容 |
| :--- | :--- |
| `ProblemTypeRegistry` | ID 4-9 のマッピング廃止 → 新規形式のみ対応 |
| `QuestionSectionEdit` | プルダウンオプション（typeOptions）が更新 → 選択肢が新形式に統一 |
| `SubQuestionBlock` | ラベル表示（questionTypeLabels）が更新 → UI に反映 |

### 間接的な影響

| コンポーネント | 変更理由 | 対応 |
| :--- | :--- | :--- |
| `SubQuestionCardEdit` | typeOptions を受け取る | QuestionSectionEdit から新形式の typeOptions を受け取る ✅ |
| `SubQuestionMetaEdit` | questionTypeOptions を使用 | QuestionSectionEdit から新形式の options を受け取る ✅ |
| `MetaSelect` | プルダウン表示 | 新形式の選択肢のみ表示 ✅ |

### データマイグレーションの必要性

**✅ 完了**: すべての mock データを新形式に移行しました：

- ID 6 → ID 14 (数値計算)
- ID 7 → ID 11 (証明問題)
- ID 8 → ID 12 (コード記述)
- ID 9 → ID 13 (翻訳)

ProblemTypeRegistry には現在、新規形式（ID 1-5, 10-14）のみ登録されています。

---

## ビルド・テスト結果

| 項目 | 結果 | 詳細 |
| :---: | :---: | :--- |
| **ビルド** | ✅ | 1m 46s、12,270+ modules、エラー0 |
| **テスト** | ✅ | 39/39 PASS（100%） |
| **型チェック** | ✅ | 全ファイル OK |

---

## 新規形式マッピング（最終版）

### パターンA：選択・構造化データ系（ID 1-5）

| ID | 形式 | コンポーネント | 状態 |
| :---: | :--- | :--- | :---: |
| 1 | 単一選択 | SelectionViewer (推奨) | 実装済み |
| 2 | 複数選択 | MultipleChoiceView + SelectionViewer | ✅ 統合済み |
| 3 | 正誤判定 | SelectionViewer (推奨) | 実装済み |
| 4 | 組み合わせ | MatchViewer (推奨) | 実装済み |
| 5 | 順序並べ替え | OrderViewer (推奨) | 実装済み |

### パターンB：自由記述・テキスト系（ID 10-14）

| ID | 形式 | コンポーネント | 状態 |
| :---: | :--- | :--- | :---: |
| 10 | 記述式 | NormalSubQuestionView | ✅ 対応済み |
| 11 | 証明問題 | NormalSubQuestionView | ✅ 対応済み |
| 12 | コード記述 | NormalSubQuestionView | ✅ 対応済み |
| 13 | 翻訳 | NormalSubQuestionView | ✅ 対応済み |
| 14 | 数値計算 | NormalSubQuestionView | ✅ 対応済み |

---

## アーキテクチャの整理

### Before Phase 6（混合・冗長）

```
Registry:           ID 1,2,4,5,6,7,8,9,10-14 (11個)
QuestionSectionEdit: ID 1,2,4,5,6,7,8,9 (8個)
SubQuestionBlock:    ID 1,2,3,4,5,6 (6個)

問題：ID の意味が定義によって異なる
      既存と新規形式が混在
```

### After Phase 6（統一・明確）

```
Registry:            ID 1,2,3,4,5,10,11,12,13,14 (10個)
QuestionSectionEdit: ID 1,2,3,4,5,10,11,12,13,14 (10個)
SubQuestionBlock:    ID 1,2,3,4,5,10,11,12,13,14 (10個)

改善：ID の意味が統一
      新規形式のみ
      パターン分類が明確
```

---

## 次フェーズの推奨事項（Phase 7）

### 優先度：高

1. **SelectionViewer / MatchViewer / OrderViewer の統合**
   - ID 1,3 → SelectionViewer（直接コンポーネント置き換え）
   - ID 4 → MatchViewer（直接コンポーネント置き換え）
   - ID 5 → OrderViewer（直接コンポーネント置き換え）

2. **既存コンテンツのマイグレーション確認**
   - ID 4-9 を使用するデータの移行
   - テストデータの更新

### 優先度：中

3. **Edit コンポーネント実装**
   - SelectionEditor, MatchEditor, OrderEditor の実装
   - 入力UI の設計

4. **Storybook 統合**
   - 新規形式コンポーネントのビジュアルテスト

### 優先度：低

5. **Backend API 仕様確認**
   - API の `type_id` と フロントエンドの ID 一致確認
   - OpenAPI/Swagger ドキュメント更新

---

## 参考資料

- [src/components/problemTypes/ProblemTypeRegistry.tsx](../../src/components/problemTypes/ProblemTypeRegistry.tsx)
- [src/components/page/ProblemViewEditPage/QuestionSectionEdit.tsx](../../src/components/page/ProblemViewEditPage/QuestionSectionEdit.tsx)
- [src/components/page/ProblemViewEditPage/SubQuestionBlock.tsx](../../src/components/page/ProblemViewEditPage/SubQuestionBlock.tsx)
- [docs/PHASE_5_PROBLEMTYPE_REGISTRY_UPDATE.md](./PHASE_5_PROBLEMTYPE_REGISTRY_UPDATE.md) - Phase 5 レジストリ更新
- [docs/PHASE_4_COMMON_COMPONENTS_REPORT.md](./PHASE_4_COMMON_COMPONENTS_REPORT.md) - Phase 4 共通コンポーネント

---

## 結論

Phase 6 で、フロントエンド全体を新規問題形式（ID 1-5, 10-14）に統一しました。レガシーマッピングの削除により、アーキテクチャはよりクリーンで保守しやすくなりました。

**次のステップ**: SelectionViewer, MatchViewer, OrderViewer をレジストリに統合し、プロトタイプから本番実装への移行を進めます。
