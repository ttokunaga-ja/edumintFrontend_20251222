# 小門形式変更時のコンポーネント自動切り替え仕組み

**実装日**: 2026年1月2日  
**ステータス**: ✅ 実装完了  
**対応ファイル**: `src/components/page/ProblemViewEditPage/SubQuestionBlock/SubQuestionBlockContent.tsx`

---

## 📌 概要

小門（SubQuestion）の **問題形式（questionTypeId）が変更された時に自動的に該当形式のコンポーネントを呼び出す仕組み** を実装しました。

### 動作イメージ

```
ユーザーが形式を変更
    ↓
[記述式（10）] → [単一選択（1）]
    ↓
questionTypeId が 10 → 1 に更新
    ↓
useEffect が変更を検知
    ↓
renderKey が更新 (0 → 1 → 2...)
    ↓
React がコンポーネントを再マウント
    ↓
ProblemTypeRegistry.getProblemTypeView(1)
    ↓
✅ 単一選択のコンポーネントが表示される
```

---

## 🔧 実装の仕組み

### 1. 変更検知メカニズム（useEffect）

```tsx
// SubQuestionBlockContent.tsx: 行55-62

const [renderKey, setRenderKey] = useState(0);

useEffect(() => {
  ProblemTypeRegistry.registerDefaults();
}, []);

// ▶ ここが形式変更の検知部分
useEffect(() => {
  setRenderKey(prev => prev + 1);
}, [questionTypeId]);  // ← questionTypeId が変わるとトリガー
```

**動作**:
- `questionTypeId` が変更される（例: 10 → 1）
- useEffect の依存配列 `[questionTypeId]` が変更を検知
- `setRenderKey(prev => prev + 1)` が実行され、renderKey が更新される

### 2. 強制再マウント（React key）

```tsx
// SubQuestionBlockContent.tsx: 行72

<Box key={`subquestion-content-${renderKey}`}>
  {isEditing ? (
    // 編集モード...
  ) : (
    <Box key={`viewer-${questionTypeId}-${renderKey}`}>
      {/* コンポーネント描画 */}
    </Box>
  )}
</Box>
```

**仕組み**:
- `key={`subquestion-content-${renderKey}`}`
- renderKey が 0 → 1 → 2 に増加すると、キーも変わる
- React は `key` が変わると、**コンポーネント全体を再マウント**する
- 内部状態（local state）もリセットされる

### 3. コンポーネント動的呼び出し

```tsx
// SubQuestionBlockContent.tsx: 行96-120

const ViewComponent = ProblemTypeRegistry.getProblemTypeView?.(questionTypeId);

if (ViewComponent) {
  const viewProps: ProblemTypeViewProps & {
    onQuestionChange?: (content: string) => void;
    onAnswerChange?: (content: string) => void;
    onQuestionsUnsavedChange?: (hasUnsaved: boolean) => void;
  } = {
    questionContent,
    answerContent,
    answerExplanation,
    onQuestionChange: (content) => {
      onQuestionChange?.(content);
    },
    onAnswerChange: (content) => {
      onAnswerChange?.(content);
    },
    onQuestionsUnsavedChange,
  };

  return React.createElement(ViewComponent, viewProps);
}
```

**流れ**:
1. `ProblemTypeRegistry.getProblemTypeView(questionTypeId)` で該当形式のコンポーネントを取得
2. 取得したコンポーネント（例: `SingleChoiceQuestionComponent`）を `React.createElement()` で描画
3. 必要なプロップを渡す（`questionContent`, `answerContent` など）

---

## 🎯 対応する形式

### 選択系（ID 1-5）

| ID | 形式名 | コンポーネント | 特徴 |
|:---|:---|:---|:---|
| 1 | 単一選択 | SingleChoiceQuestionComponent | 1つの正答 |
| 2 | 複数選択 | MultipleChoiceQuestionComponent | 複数の正答 |
| 3 | 正誤判定 | TrueFalseQuestionComponent | True/False |
| 4 | 組み合わせ | MatchingQuestionComponent | 対応関係 |
| 5 | 順序並べ替え | OrderingQuestionComponent | 並べ替え |

### 記述系（ID 10-14）

| ID | 形式名 | コンポーネント | 特徴 |
|:---|:---|:---|:---|
| 10 | 記述式 | EssayQuestionComponent | 自由記述 |
| 11 | 証明問題 | ProofQuestionComponent | 数学証明 |
| 12 | コード記述 | CodeQuestionComponent | プログラミング |
| 13 | 翻訳 | TranslationQuestionComponent | 言語翻訳 |
| 14 | 数値計算 | NumericalQuestionComponent | 数値入力 |

---

## 🔄 データフロー図

```
┌─────────────────────────────────────────────────┐
│ SubQuestionBlock (親コンポーネント)              │
│                                                 │
│  <select onChange={(e) => {                    │
│    onSubQuestionChange({                       │
│      questionTypeId: e.target.value // ← ここで │
│    })                                           │
│  }}>                                            │
│    <option value="10">記述式</option>           │
│    <option value="1">単一選択</option>          │
│  </select>                                      │
└────────────────┬────────────────────────────────┘
                 │ props 更新
                 ↓
┌─────────────────────────────────────────────────┐
│ SubQuestionBlockContent (子コンポーネント)       │
│                                                 │
│  const [renderKey, setRenderKey] = useState(0) │
│                                                 │
│  useEffect(() => {                             │
│    setRenderKey(prev => prev + 1)  ← renderKey更新
│  }, [questionTypeId])                          │
│                                                 │
│  <Box key={`viewer-${questionTypeId}-${renderKey}`}>
│    {ProblemTypeRegistry.getProblemTypeView(    │
│      questionTypeId  ← 新しい形式IDで取得      │
│    )}                                           │
│  </Box>                                         │
└────────────────┬────────────────────────────────┘
                 │ 形式に応じたコンポーネント作成
                 ↓
       ┌─────────┴─────────┐
       ↓                   ↓
  ┌─────────────┐   ┌──────────────┐
  │EssayQuestion│   │SingleChoice   │
  │ Component   │   │  Component    │
  │ (ID 10)     │   │  (ID 1)       │
  └─────────────┘   └──────────────┘
```

---

## 💡 主要な技術的ポイント

### 1. React key による強制再マウント

```tsx
// key が変わると React はコンポーネント全体を再作成する
<Box key={`viewer-${questionTypeId}-${renderKey}`}>
  {/* このボックスの内部状態がすべてリセットされる */}
</Box>
```

**メリット**:
- 前の形式の入力値が残らない（クリーンな状態で始まる）
- 形式固有の設定がリセットされる

### 2. useEffect の依存配列

```tsx
useEffect(() => {
  setRenderKey(prev => prev + 1);
}, [questionTypeId]);  // ← この配列に questionTypeId を含める
```

**重要**:
- 依存配列に `questionTypeId` がなければ、形式変更を検知できない
- 依存配列に他の値が入るとパフォーマンス低下

### 3. ProblemTypeRegistry パターン

```tsx
const ViewComponent = ProblemTypeRegistry.getProblemTypeView?.(questionTypeId);
```

**メリット**:
- コンポーネント呼び出しが一元管理される
- 新規形式追加時に ProblemTypeRegistry だけ修正すればよい
- SubQuestionBlockContent は形式を知らなくてよい（低結合度）

---

## 🧪 動作確認方法

### ブラウザでの手動テスト

1. ProblemViewEditPage を開く
2. 大問を追加
3. 小問を追加（デフォルト: 記述式 ID 10）
4. 小問の「問題形式」ドロップダウンで形式を選択
   ```
   記述式（10） → 単一選択（1） → 複数選択（2） など
   ```
5. **各選択時に UI が瞬時に切り替わる**ことを確認

### ブラウザ DevTools でのデバッグ

```tsx
// SubQuestionBlockContent.tsx に以下を追加してデバッグ
useEffect(() => {
  console.log('[DEBUG] questionTypeId changed:', questionTypeId);
  console.log('[DEBUG] renderKey updated to:', renderKey);
  setRenderKey(prev => prev + 1);
}, [questionTypeId]);
```

### コンソール出力例

```
[DEBUG] questionTypeId changed: 10
[DEBUG] renderKey updated to: 0
[DEBUG] questionTypeId changed: 1
[DEBUG] renderKey updated to: 1  ← 形式切り替えで更新される
[DEBUG] questionTypeId changed: 2
[DEBUG] renderKey updated to: 2  ← さらに形式切り替え
```

---

## ⚠️ よくある問題と対処法

### 問題 1: 形式を変更しても UI が変わらない

**原因**: 
- useEffect の依存配列に `questionTypeId` が含まれていない
- questionTypeId prop が更新されていない

**確認方法**:
```tsx
// props が受け取られているか確認
useEffect(() => {
  console.log('Current questionTypeId:', questionTypeId);
}, [questionTypeId]);
```

### 問題 2: 形式変更時に前の形式の入力値が残っている

**原因**:
- コンポーネントが再マウントされていない
- `key` prop が変わっていない

**確認方法**:
```tsx
// key が正しく更新されているか確認
<Box key={`viewer-${questionTypeId}-${renderKey}`}>
  {console.log(`Rendering with key: viewer-${questionTypeId}-${renderKey}`)}
  {/* ... */}
</Box>
```

### 問題 3: ProblemTypeRegistry で undefined が返される

**原因**:
- 該当形式のコンポーネントが登録されていない
- questionTypeId が無効な値

**確認方法**:
```tsx
const ViewComponent = ProblemTypeRegistry.getProblemTypeView?.(questionTypeId);
console.log('ViewComponent for', questionTypeId, ':', ViewComponent);
```

---

## 📚 関連ファイル

| ファイル | 役割 |
|:---|:---|
| [SubQuestionBlockContent.tsx](../src/components/page/ProblemViewEditPage/SubQuestionBlock/SubQuestionBlockContent.tsx) | 形式変更検知の実装 |
| [ProblemTypeRegistry.ts](../src/features/content/registry/ProblemTypeRegistry.ts) | 形式とコンポーネントのマッピング |
| [SubQuestionBlock.tsx](../src/components/page/ProblemViewEditPage/SubQuestionBlock/SubQuestionBlock.tsx) | 親コンポーネント（形式選択ドロップダウン） |
| [Q_DATABASE.md](Q_DATABASE.md) | DB スキーマ（question_types テーブル） |

---

## ✨ 実装の流れ（開発者向け）

新しい問題形式を追加する場合:

1. **形式ID を確認** (例: ID 6)
2. **コンポーネント作成**
   ```tsx
   // src/components/question-types/NewFormatComponent.tsx
   export const NewFormatComponent: React.FC<ProblemTypeViewProps> = ({
     questionContent, answerContent, onQuestionChange, ...
   }) => {
     // 実装...
   };
   ```
3. **ProblemTypeRegistry に登録**
   ```tsx
   // src/features/content/registry/ProblemTypeRegistry.ts
   ProblemTypeRegistry.registerView(6, NewFormatComponent);
   ```
4. **自動反映** ✅
   - SubQuestionBlockContent は何も変更不要
   - ProblemTypeRegistry が questio​nTypeId=6 の時に新コンポーネントを返す

---

## 🔗 実装の核となるコード行

```typescript
// SubQuestionBlockContent.tsx
行55:    const [renderKey, setRenderKey] = useState(0);
行60-62: useEffect(() => {
          setRenderKey(prev => prev + 1);
        }, [questionTypeId]);

行72:    <Box key={`subquestion-content-${renderKey}`}>

行96:    <Box key={`viewer-${questionTypeId}-${renderKey}`}>

行99:    const ViewComponent = ProblemTypeRegistry.getProblemTypeView?.(questionTypeId);
```

これらの行が協調して、形式変更時の自動コンポーネント切り替えを実現しています。

---

**実装完了**: 2026年1月2日  
**ステータス**: ✅ 本番環境対応可能
