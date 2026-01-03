# ProblemEditor データ管理不具合 - 修正完了レポート

**日付**: 2026年1月2日
**対象**: ProblemViewEditPage - ProblemEditor コンポーネント

## 📋 報告された不具合 (4件)

| ID | 不具合 | 原因 | 修正状況 |
|:---|:---|:---|:---|
| 1 | 大門追加が失敗 | DB スキーマ準拠データ構造の不足 | ✅ 修正完了 |
| 2 | 小門追加が失敗 | 形式ID (sub_question_type_id) の初期値誤り | ✅ 修正完了 |
| 3 | 小門問題形式変更がUI反映されない | 再レンダリングトリガーの欠落 | ✅ 修正完了 |
| 4 | 大門キーワード追加が失敗 | コールバック関数の未実装 | ✅ 修正完了 |

---

## 1️⃣ 大門追加失敗 - 修正内容

### 問題
- `handleAddQuestion()` でDB スキーマに準拠したデータ構造が生成されていなかった
- `question_id` フィールドが存在しない

### 修正内容
```typescript
// 修正前
const newQuestion = {
  id: crypto.randomUUID(),
  question_number: ...,
  question_content: '',
  // 不足: question_id がない
};

// 修正後
const newQuestion = {
  id: crypto.randomUUID(),
  question_id: crypto.randomUUID(), // DB スキーマ対応
  question_number: ...,
  question_content: '',
  // Legacy aliases for compatibility
  questionNumber: ...,
  questionContent: '',
  questionFormat: 0,
  subQuestions: [],
};
```

### DB スキーマ準拠
**テーブル**: `questions`
| カラム | 型 | 説明 |
|:---|:---|:---|
| `id` / `question_id` | BIGINT, UUID | 大問ID |
| `question_number` | INT | 採番番号 |
| `question_content` | TEXT | 問題文 |
| `question_format` | INT | 形式 (0: MD, 1: LaTeX) |
| `difficulty` | INT | 難易度ID |
| `keywords` | JSON | キーワード配列 |
| `sub_questions` | JSON | 小問配列 |

---

## 2️⃣ 小門追加失敗 - 修正内容

### 問題
- `question_type_id` が誤った初期値 (1) で初期化されていた
- DB スキーマの新規形式ID (1-5, 10-14) の理解不足
- ID 1 は「単一選択」だが、デフォルトは記述式 (ID 10) すべき

### 修正内容
```typescript
// 修正前
const newSubQuestion = {
  id: crypto.randomUUID(),
  sub_question_number: ...,
  question_type_id: 1, // ❌ 誤り: ID 1 は「単一選択」
};

// 修正後
const newSubQuestion = {
  id: crypto.randomUUID(),
  sub_question_id: crypto.randomUUID(), // DB スキーマ対応
  question_id: question.id, // 親の大問ID
  sub_question_number: ...,
  sub_question_type_id: 10, // ✅ ID 10: 記述式 (デフォルト)
  question_content: '',
  question_format: 0,
  answer_explanation: '',
  answer_format: 0,
  keywords: [],
  // Legacy aliases
  subQuestionNumber: ...,
  questionTypeId: 10,
  questionContent: '',
  questionFormat: 0,
  answerContent: '',
  answerFormat: 0,
};
```

### 新規問題形式スキーマ
**パターンA: 選択系 (ID 1-5)**
| ID | 形式名 | 説明 |
|:---|:---|:---|
| 1 | 単一選択 | ラジオボタン |
| 2 | 複数選択 | チェックボックス |
| 3 | 正誤判定 | True/False |
| 4 | 組み合わせ | ペアリング |
| 5 | 順序並べ替え | シーケンス |

**パターンB: 記述系 (ID 10-14)**
| ID | 形式名 | 説明 |
|:---|:---|:---|
| 10 | 記述式 | 自由記述 |
| 11 | 証明問題 | 数学証明 |
| 12 | コード記述 | プログラミング |
| 13 | 翻訳 | 言語翻訳 |
| 14 | 数値計算 | 計算問題 |

---

## 3️⃣ 小門問題形式変更がUI反映されない - 修正内容

### 問題
- `SubQuestionBlockContent` で `questionTypeId` 変更時に再レンダリングが発生していない
- ProblemTypeRegistry から取得するコンポーネント（View）が変わらない
- 記述式 (ID 10) → 選択式 (ID 1) 変更時、UI は記述エディタのままになっていた

### 修正内容
```typescript
// 修正前
export const SubQuestionBlockContent: React.FC<...> = ({
  questionTypeId,
  // ...
}) => {
  // questionTypeId 変更検知なし ❌
  
  return (
    <Box>
      {/* ProblemTypeRegistry から取得したコンポーネント使用 */}
      {(() => {
        const ViewComponent = ProblemTypeRegistry.getProblemTypeView?.(questionTypeId);
        // questionTypeId が変わっても再レンダリングされない
      })()}
    </Box>
  );
};

// 修正後
export const SubQuestionBlockContent: React.FC<...> = ({
  questionTypeId,
  // ...
}) => {
  const [renderKey, setRenderKey] = useState(0);
  
  // questionTypeId 変更時に renderKey を更新 ✅
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [questionTypeId]);
  
  return (
    <Box key={`subquestion-content-${renderKey}`}>
      {/* ProblemTypeRegistry から取得したコンポーネント使用 */}
      {(() => {
        const ViewComponent = ProblemTypeRegistry.getProblemTypeView?.(questionTypeId);
        return (
          <Box key={`viewer-${questionTypeId}-${renderKey}`}>
            {React.createElement(ViewComponent, viewProps)}
          </Box>
        );
      })()}
    </Box>
  );
};
```

### 技術詳細
- **useEffect依存配列**: `[questionTypeId]` を追加
- **renderKey**: 状態値を増加させることで、React に強制的に再マウントを指示
- **キー戦略**: `key={renderKey}` により、コンポーネント全体が再マウントされ、内部状態もリセット

---

## 4️⃣ 大門キーワード追加失敗 - 修正内容

### 問題
- `ProblemEditor` で `QuestionBlock` に `onKeywordAdd` / `onKeywordRemove` コールバックを渡していない
- 同様に `SubQuestionBlock` でもキーワード管理コールバックが欠落

### 修正内容
```typescript
// 修正前
<QuestionBlock
  {...props}
  onDifficultyChange={...}
  onDelete={...}
  // ❌ onKeywordAdd, onKeywordRemove が欠落
/>

// 修正後
<QuestionBlock
  {...props}
  onDifficultyChange={...}
  onKeywordAdd={(keyword) => {
    // 大門キーワード追加
    const newKeyword = { id: `kw-${Date.now()}`, keyword };
    handleQuestionChange(qIndex, {
      keywords: [...(question.keywords || []), newKeyword],
    });
  }}
  onKeywordRemove={(keywordId) => {
    // 大門キーワード削除
    const filtered = question.keywords?.filter((kw) => kw.id !== keywordId) || [];
    handleQuestionChange(qIndex, { keywords: filtered });
  }}
  onDelete={...}
/>

// 同様に SubQuestionBlock でも実装
<SubQuestionBlock
  {...props}
  onKeywordAdd={(keyword) => {
    const newKeyword = { id: `kw-${Date.now()}`, keyword };
    handleSubQuestionChange(qIndex, sqIndex, {
      keywords: [...(subQ.keywords || []), newKeyword],
    });
  }}
  onKeywordRemove={(keywordId) => {
    const filtered = subQ.keywords?.filter((kw) => kw.id !== keywordId) || [];
    handleSubQuestionChange(qIndex, sqIndex, { keywords: filtered });
  }}
  {...otherProps}
/>
```

### データフロー
```
キーワード入力 (KeywordManager)
  ↓
BlockMeta.onAdd() 呼び出し
  ↓
QuestionBlock.onKeywordAdd() / SubQuestionBlock.onKeywordAdd()
  ↓
ProblemEditor.handleQuestionChange() / handleSubQuestionChange()
  ↓
onChange() → ProblemViewEditPage で editedExam 更新
  ↓
hasChanges = true → SAVE ボタン有効化
```

---

## 📐 データ形式正規化 - schemaMappers.ts

新規作成ファイル: `/src/features/content/utils/schemaMappers.ts`

### 目的
- Backend DB スキーマ（snake_case）
- Frontend 内部形式（snake_case 統一）
- Legacy 互換性（camelCase エイリアス）

### 主要関数
```typescript
// DB → Frontend
fromBackendQuestion(backendQuestion): LocalQuestion
fromBackendSubQuestion(backendSubQuestion): LocalSubQuestion

// Frontend → DB (API送信用)
toBackendQuestion(localQuestion): APIPayload
toBackendSubQuestion(localSubQuestion): APIPayload

// Frontend → Legacy互換
toLegacyQuestion(localQuestion): LegacyLocalQuestion
toLegacySubQuestion(localSubQuestion): LegacyLocalSubQuestion

// Legacy → Frontend
fromLegacyQuestion(legacyQuestion): LocalQuestion
fromLegacySubQuestion(legacySubQuestion): LocalSubQuestion

// エディタ形式への変換
toEditorFormat(data): EditorData
```

### データ構造例
```typescript
// Local形式（統一）
{
  id: 'q1',
  question_number: 1,
  question_content: '...',
  question_format: 0,
  difficulty: 1,
  keywords: [{ id: 'kw1', keyword: '...' }],
  sub_questions: [...]
}

// Legacy形式（互換性）
{
  id: 'q1',
  question_number: 1,
  questionNumber: 1, // alias
  question_content: '...',
  questionContent: '...', // alias
  ...
}
```

---

## 🧪 テストケース

新規作成ファイル: `/tests/unit/ProblemEditor.test.tsx`

### テスト対象
1. **大門追加機能**
   - 新規大問のデータ構造検証
   - 採番番号の正確性
   - UUID の一意性

2. **小問追加機能**
   - 新規小問のデータ構造検証
   - 親question_idの継承
   - sub_question_type_id の初期値 (ID 10)

3. **小問形式変更UI反映**
   - 記述式 → 選択式への変更時UI更新
   - 問題形式オプション表示

4. **キーワード管理**
   - 大門キーワード追加・削除
   - 小問キーワード追加・削除
   - キーワード配列の正確性

5. **データ形式互換性**
   - snake_case / camelCase 同期
   - Legacy エイリアスの保持

### 実行方法
```bash
# 全テスト実行
npm run test

# 特定テストファイル実行
npm run test tests/unit/ProblemEditor.test.tsx

# watch モード
npm run test -- --watch
```

---

## 📊 修正前後の動作比較

| 操作 | 修正前 | 修正後 |
|:---|:---|:---|
| **大問追加** | ❌ 失敗（スキーマ不足） | ✅ 成功（完全なデータ構造） |
| **小問追加** | ❌ 失敗（形式ID誤り） | ✅ 成功（正しい初期値） |
| **形式変更UI** | ❌ UI反映されない | ✅ 即座に反映 |
| **キーワード追加** | ❌ コールバック欠落 | ✅ 正常に動作 |
| **データ同期** | ⚠️ 部分的 | ✅ 完全同期 |

---

## 🔄 実装の流れ (Step by Step)

### Step 1: データ構造の準備
```
DB スキーマ確認 (Q_DATABASE.md)
  ↓
LocalQuestion / LocalSubQuestion 定義
  ↓
LegacyQuestion / LegacySubQuestion 定義
```

### Step 2: ProblemEditor 修正
```
handleAddQuestion() 修正
  ↓
handleAddSubQuestion() 修正
  ↓
キーワードコールバック追加
```

### Step 3: UI 反応性向上
```
SubQuestionBlockContent に useEffect 追加
  ↓
renderKey 状態管理実装
  ↓
強制再レンダリング実装
```

### Step 4: テスト実装
```
テストケース設計
  ↓
Vitest + RTL テスト実装
  ↓
テスト実行・検証
```

---

## ✅ チェックリスト

- [x] DB スキーマ（Q_DATABASE.md）確認
- [x] ProblemEditor.tsx 大門追加修正
- [x] ProblemEditor.tsx 小門追加修正
- [x] ProblemEditor.tsx キーワード管理コールバック追加
- [x] SubQuestionBlockContent.tsx useEffect 追加
- [x] schemaMappers.ts 作成
- [x] ProblemEditor.test.tsx 作成
- [x] データ形式互換性確保
- [x] コールバックチェーン検証

---

## 📝 今後の改善案

### 短期 (次Sprint)
1. **type安全性の向上**
   - LocalQuestion, LocalSubQuestion に型定義厳格化
   - schemaMappers の完全な型安全実装

2. **テストカバレッジ拡大**
   - UI コンポーネント層テスト
   - E2E テスト (Playwright)

3. **エラーハンドリング**
   - バリデーション強化
   - ユーザーフィードバック (Toast/Alert)

### 中期 (2-3 Sprint後)
1. **パフォーマンス最適化**
   - 大規模問題データセット対応
   - メモリ効率改善

2. **UX 改善**
   - ドラッグ＆ドロップによる並び替え
   - リアルタイム自動保存

3. **バックエンドAPI準備**
   - `/api/exams/{id}` の完全実装
   - `/api/questions` CRUD 確認
   - `/api/sub-questions` CRUD 確認

---

## 🚀 デプロイ前チェック

```bash
# 1. ビルド確認
npm run build

# 2. リント確認
npm run lint

# 3. 型チェック
npm run typecheck

# 4. テスト実行
npm run test

# 5. E2E テスト（オプション）
npm run test:e2e
```

---

## 📞 トラブルシューティング

### Q: キーワード追加時に「コールバック not a function」エラー
**A**: `onKeywordAdd` が undefined になっていないか確認
```tsx
// BlockMeta 経由で渡すこと
<BlockMeta
  onKeywordAdd={onKeywordAdd} // ✓ 必須
  onKeywordRemove={onKeywordRemove}
  ...
/>
```

### Q: 小問形式変更後も UI が変わらない
**A**: SubQuestionBlockContent の renderKey が更新されているか確認
```tsx
// logs を追加して検診
useEffect(() => {
  console.log('questionTypeId changed:', questionTypeId);
  setRenderKey(prev => prev + 1);
}, [questionTypeId]);
```

### Q: データが ProblemViewEditPage に反映されない
**A**: ProblemEditor の onChange コールバックが正しく呼ばれているか確認
```tsx
const handleChange = (exam: any) => {
  console.log('exam updated:', exam);
  onChange(exam); // ProblemViewEditPage へ
};
```

---

## 📚 参考資料

- [DB スキーマ設計書](../Q_DATABASE.md)
- [ProblemViewEditPage 要件](../C_Page_REQUIREMENTS/C_3_ProblemViewEditPage_REQUIREMENTS.md)
- [クライアント状態管理パターン](../CLIENT_STATE_MANAGEMENT_PATTERN.md)
- [Repository 層実装](../REPOSITORY_LAYER_IMPLEMENTATION_COMPLETE_20260101.md)

---

**作成者**: AI Agent  
**最終更新**: 2026年1月2日  
**版**: 1.0
