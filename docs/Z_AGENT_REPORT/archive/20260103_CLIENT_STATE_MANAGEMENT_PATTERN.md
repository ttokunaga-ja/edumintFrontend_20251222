# クライアントサイド状態管理パターン（ProblemViewEditPage）

## 概要

ProblemViewEditPageでは、DBから読み込んだ初期データに対してクライアントサイドで変更を積み上げ、SAVEボタンが押されるまで保存しないという遅延保存パターンを採用しています。

## アーキテクチャ

### 1. 3層構造

```
┌─────────────────────────────────────┐
│ ProblemViewEditPage (ページコンポーネント)   │
│  ├─ exam (DB からの初期データ)
│  ├─ editedExam (クライアント側の編集中データ)
│  └─ hasChanges (変更検出用フラグ)
└─────────────────────────────────────┘
            ↓ (onChange)
┌─────────────────────────────────────┐
│ ProblemEditor (エディタコンポーネント)      │
│  ├─ handleQuestionChange()
│  ├─ handleAddQuestion()
│  ├─ handleDeleteQuestion()
│  └─ handleAddSubQuestion()
└─────────────────────────────────────┘
            ↓ (setEditedExam)
┌─────────────────────────────────────┐
│ SubQuestionSection (サブQ詳細エディタ)     │
│  ├─ clientKeywords (ローカル状態)
│  ├─ clientQuestionTypeId
│  ├─ clientOptions
│  └─ save() (SAVEボタン呼び出し時)
└─────────────────────────────────────┘
```

### 2. データフロー

```
[初期ロード]
  ↓
useExamDetail() → DB から exam を取得
  ↓
editedExam = exam（浅いコピー）
  ↓
[ユーザー入力]
  ↓
子コンポーネント で setState() → onChange() コールバック
  ↓
editedExam を更新（不変更新パターン）
  ↓
hasChanges = JSON.stringify(editedExam) !== JSON.stringify(exam)
  ↓
[SAVEボタン]
  ↓
SubQuestionSection.save() を全員呼び出し
  ↓
updateExam(id, editedExam) で一括送信
  ↓
[成功]
  ↓
exam = editedExam に同期
setIsEditModeLocal = false
```

## 主要な実装パターン

### 1. ProblemViewEditPage.tsx

**責務:**
- DB データ (`exam`) と編集データ (`editedExam`) の管理
- 変更検出 (`hasChanges`)
- Save / Cancel 処理の定義
- AppBarContext への通知

**主要な状態:**

```typescript
// DB から取得した初期データ
const { data: exam } = useExamDetail(id);

// クライアント側で編集中のデータ
const [editedExam, setEditedExam] = useState<any>(null);

// 変更があるか（JSON 比較）
const hasChanges = useMemo(() => {
  if (!exam || !editedExam || !isEditModeLocal) return false;
  return JSON.stringify(editedExam) !== JSON.stringify(exam);
}, [exam, editedExam, isEditModeLocal]);
```

**キーポイント:**
- `exam` は**絶対に変更しない**（DB状態の参照値として機能）
- `editedExam` のみを更新して `hasChanges` を検出
- `isEditModeLocal === false` の場合は `hasChanges = false`（View モード時は保存不可）

### 2. ProblemEditor.tsx

**責務:**
- 大問レベルの追加/削除/変更処理
- 小問レベルの追加/削除/変更処理
- 不変更新を保証

**パターン例:**

```typescript
// 大問の変更
const handleQuestionChange = (qIndex: number, updates: any) => {
  const newQuestions = [...safeExam.questions];  // 浅いコピー
  newQuestions[qIndex] = { ...newQuestions[qIndex], ...updates };  // 新規オブジェクト生成
  onChange({ ...safeExam, questions: newQuestions });  // 親に通知
};

// 大問の削除（採番の再設定も含む）
const handleDeleteQuestion = (qIndex: number) => {
  const newQuestions = safeExam.questions.filter((_: any, i: number) => i !== qIndex);
  // 採番の再設定
  const renumberedQuestions = newQuestions.map((q: any, idx: number) => ({
    ...q,
    question_number: idx + 1,  // 1-indexed
    questionNumber: idx + 1,     // camelCase 版
  }));
  onChange({ ...safeExam, questions: renumberedQuestions });
};
```

### 3. SubQuestionSection.tsx

**責務:**
- 小問の詳細編集（キーワード、問題形式、内容）
- クライアント側の状態管理（`clientKeywords`, `clientQuestionTypeId` など）
- SAVE 処理（SAVEボタン呼び出し時のみ）

**ローカル状態の管理:**

```typescript
// クライアント側ローカル状態（SAVE まで保持）
const [clientKeywords, setClientKeywords] = useState<Array<{ id: string; keyword: string }>>(
  subQuestion?.keywords || []
);
const [clientQuestionTypeId, setClientQuestionTypeId] = useState(
  subQuestion?.questionTypeId || 1
);
const [clientOptions, setClientOptions] = useState(
  subQuestion?.options || []
);

// キーワード追加（クライアント側のみ）
const handleKeywordAdd = (keyword: string) => {
  const exists = clientKeywords.some((kw) => kw.keyword === keyword);
  if (!exists) {
    setClientKeywords([...clientKeywords, { id: crypto.randomUUID(), keyword }]);
  }
};

// キーワード削除（クライアント側のみ）
const handleKeywordRemove = (keywordId: string) => {
  setClientKeywords(clientKeywords.filter((kw) => kw.id !== keywordId));
};
```

**SAVE 処理（親コンポーネントから呼び出し）:**

```typescript
const save = async () => {
  try {
    // Step 1: クライアント側のローカル状態を確定
    const updatePayload = {
      id: subQuestion.id,
      keywords: clientKeywords,  // 編集されたキーワード
      questionTypeId: clientQuestionTypeId,
      options: clientOptions,
      // その他の変更フィールド
    };
    
    // Step 2: API で保存
    await updateSubQuestion(updatePayload);
    
    // Step 3: 保存成功後、親コンポーネントに通知して editedExam を更新
    onSubQuestionSave?.(updatePayload);
  } catch (e) {
    console.error('Failed to save', e);
  }
};
```

**forwardRef による外部呼び出し:**

```typescript
export const SubQuestionSection = forwardRef<SubQuestionSectionHandle>(
  ({ ... }, ref) => {
    // ...
    useImperativeHandle(ref, () => ({
      save,  // 外部から呼び出し可能
    }));
    // ...
  }
);

// 親コンポーネント (ProblemViewEditPage) での使用
subQuestionRefsMapRef.current.forEach((handle) => {
  if (handle && handle.save) {
    savePromises.push(handle.save());
  }
});
```

## 変更の流れ（具体例）

### 例: 小問のキーワードを追加

```
[UI] ユーザーがキーワード入力フィールドに "重要な用語" と入力 → Enter キー
  ↓
[SubQuestionSection] handleKeywordAdd("重要な用語") 呼び出し
  ↓
clientKeywords に追加 (setClientKeywords)
  ↓
キーワードチップが表示される
  ↓
[ProblemViewEditPage] 検出: editedExam 未変更（キーワードはまだ SubQuestionSection のローカル状態）
  ↓
[ユーザー] SAVE ボタンを押す
  ↓
[ProblemViewEditPage] SubQuestionSection.save() を呼び出し
  ↓
[SubQuestionSection] updateSubQuestion() API を呼び出し
  ↓
[サーバー] DB に保存
  ↓
[SubQuestionSection] 成功 → onSubQuestionSave() で親に通知
  ↓
[ProblemViewEditPage] editedExam を更新
  ↓
hasChanges が再計算 → false
```

## キーポイント

### 1. 遅延保存戦略

- **クライアント側で変更を蓄積** → UI 更新がすぐに反映
- **SAVE ボタンで一括送信** → API 呼び出しの回数削減
- **各コンポーネントが独立したローカル状態** → コンポーネント間の結合度が低い

### 2. 不変更新の徹底

```typescript
// ❌ 悪い例（直接変更）
editedExam.questions[0].keywords.push(newKeyword);
onChange(editedExam);

// ✅ 良い例（新規オブジェクト生成）
const newQuestions = editedExam.questions.map((q, i) => 
  i === 0 ? { ...q, keywords: [...q.keywords, newKeyword] } : q
);
onChange({ ...editedExam, questions: newQuestions });
```

理由: React の差分検出が `===` 参照比較なため、不変更新でなければ変更検出できない

### 3. 採番の管理

削除時に採番を再設定することで、`question_number` と配列インデックスを同期

```typescript
const renumberedQuestions = newQuestions.map((q, idx) => ({
  ...q,
  question_number: idx + 1,  // 0-indexed → 1-indexed
  questionNumber: idx + 1,     // camelCase 対応
}));
```

### 4. DB 状態との同期

```typescript
// 初回ロード時のみ editedExam を初期化
useEffect(() => {
  if (exam && (!editedExam || editedExam.id !== exam.id)) {
    setEditedExam(exam);
  }
}, [exam, editedExam]);
```

毎回 `JSON.stringify()` で全体比較するため、初期化のタイミングが重要

## 既知の注意点

### 1. FieldName のゆれ

- DB: `question_number`, `question_content` (snake_case)
- API レスポンス: `questionNumber`, `questionContent` (camelCase)

→ 両方対応するためにマッピング処理が必要

### 2. 大規模データでの性能

- `JSON.stringify()` の全体比較は大規模データで遅くなる可能性
- 今後: Delta ベースの差分検出への移行を検討

### 3. ネストの深さ

- 大問 → 小問 → オプション/ペア という 3 階層のネスト
- コンポーネント間の状態パイプラインが複雑

## 今後の改善案

### 1. useProblemState フック の統合

現在は各コンポーネントで局所的に状態管理しているが、専用フックに統一することで、変更検出やロールバック処理が簡素化される

```typescript
const { state, updateQuestion, updateSubQuestion, save } = useProblemState(exam);
```

### 2. Redux/Zustand への移行

複雑な状態遷移を状態管理ライブラリで一元管理することで、デバッグやテストが容易になる

### 3. Immer.js の導入

不変更新を簡潔に書ける

```typescript
// before
const newQuestions = editedExam.questions.map((q, i) =>
  i === qIndex ? { ...q, ...updates } : q
);

// after (Immer)
const newExam = produce(editedExam, (draft) => {
  draft.questions[qIndex] = { ...draft.questions[qIndex], ...updates };
});
```

## まとめ

現在の実装は **遅延保存パターン** を採用しており：

| 層 | 責務 | 例 |
|---|---|---|
| ページ層 | 全体状態管理、Save 調整 | ProblemViewEditPage |
| エディタ層 | 階層的な追加/削除 | ProblemEditor |
| 詳細層 | フィールド編集、ローカル状態 | SubQuestionSection |

各層が **独立したローカル状態** を持ち、**SAVE 時に親に通知** する仕組みになっています。

