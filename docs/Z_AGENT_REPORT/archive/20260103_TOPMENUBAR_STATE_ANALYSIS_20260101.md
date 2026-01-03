# TopMenuBar の保存ボタン・閲覧・編集ボタン - 状態と機能詳細レポート

**作成日**: 2026年1月1日  
**ステータス**: 実装確認レポート

---

## 📋 現在の TopMenuBar 実装状態

### 1. 状態管理の詳細

TopMenuBar は **AppBarActionContext** を通じて次の状態を管理しています：

| 状態名 | 型 | デフォルト | 説明 |
|--------|-----|----------|------|
| `enableAppBarActions` | `boolean` | `false` | 編集・保存ボタン機能の有効化フラグ |
| `isEditMode` | `boolean` | `false` | 編集モード（true）/ 閲覧モード（false） |
| `hasUnsavedChanges` | `boolean` | `false` | 未保存の変更が存在するかどうか |
| `onSave` | `(() => Promise<void>) \| null` | `null` | 保存処理のコールバック関数 |
| `isSaving` | `boolean` | `false` | 保存処理中かどうか |
| `onNavigateWithCheck` | `((path: string) => void) \| null` | `null` | ページ遷移時の警告処理 |

---

## 🎛️ ボタンの状態制御

### SAVE ボタン

```typescript
// TopMenuBar.tsx より
const isSaveDisabled = isSaving || !hasUnsavedChanges;
```

| 条件 | SAVE ボタン状態 |
|------|--------------|
| `hasUnsavedChanges === false` | ❌ **無効（disabled）** |
| `hasUnsavedChanges === true && isSaving === false` | ✅ **有効** |
| `hasUnsavedChanges === true && isSaving === true` | ❌ **無効（保存中表示）** |

**表示テキスト**:
- `isSaving === false`: "保存" (`t('common.save')`)
- `isSaving === true`: "保存中..." (`t('common.saving')`)

### Preview/Edit 切り替えボタン

```typescript
// ToggleButtonGroup で管理
value={isEditMode ? 'edit' : 'view'}
```

| 状態 | 表示 | 動作 |
|------|-----|------|
| `isEditMode === false` | "閲覧" が選択状態 | `setIsEditMode(false)` |
| `isEditMode === true` | "編集" が選択状態 | `setIsEditMode(true)` |

---

## 🔄 現在の要件充足度の確認

### ✅ 要件 1: mode 状態（現在の実装）

**要件**: `mode: 'view' | 'edit'` の文字列で管理

**実装状態**:
```typescript
// 現在の実装（boolean型）
isEditMode: boolean  // true = 'edit', false = 'view'

// TopMenuBar での使用
value={isEditMode ? 'edit' : 'view'}
```

**結論**: ⚠️ **部分的に充足**
- 内部では `boolean` で管理（`true` = edit, `false` = view）
- UI表示では `ToggleButtonGroup` で 'view' | 'edit' の文字列値を使用
- **要件との整合**: 文字列ベースから boolean ベースへの変更が必要な場合、調整可能

---

### ✅ 要件 2: isChange/hasUnsavedChanges 状態（現在の実装）

**要件**: `isChange: boolean` で管理

**実装状態**:
```typescript
// 現在の実装（名前が異なるが機能は同じ）
hasUnsavedChanges: boolean  // true = 変更あり, false = 変更なし

// ボタン制御
const isSaveDisabled = isSaving || !hasUnsavedChanges;
// hasUnsavedChanges === false → SAVE ボタン無効化 ✅
// hasUnsavedChanges === true → SAVE ボタン有効化 ✅
```

**結論**: ✅ **完全に充足**
- 名称は `isChange` → `hasUnsavedChanges` に変更されているが機能は同じ
- `false` で SAVE ボタン無効化 ✅
- `true` で SAVE ボタン有効化 ✅

---

### ⚠️ 要件 3: ページ遷移時の警告トースト（現在の実装）

**要件**: 
- `isChange === true` でページ遷移検出時
- トースト警告を表示
- SAVE / UNSAVE / CANCEL ボタンを表示

**実装状態**:

```typescript
// TopMenuBar.tsx
const [showWarningSnackbar, setShowWarningSnackbar] = useState(false);

// ナビゲーション処理
const handleNavigation = (path: string) => {
  if (onNavigateWithCheck) {
    onNavigateWithCheck(path);  // ページ層で処理
  } else {
    navigate(path);
  }
};
```

**現在の仕組み**:
1. TopMenuBar の各ナビゲーションボタンクリック時に `handleNavigation(path)` を呼び出す
2. `onNavigateWithCheck` コールバックが存在する場合、そちらに処理を委譲
3. **ページ層（ProblemViewEditPage など）** が警告ダイアログを表示する

**Snackbar 状態**:
```typescript
const [showWarningSnackbar, setShowWarningSnackbar] = useState(false);
```
- 宣言されているが、ほぼ使用されていない
- 実装機会がある

**結論**: ⚠️ **部分的に実装**

**現状**:
- ✅ `onNavigateWithCheck` で警告処理の枠組みあり
- ✅ ページ層で `window.confirm()` ベースの警告実装済み
- ❌ **トースト UI の実装が不完全**
  - Snackbar は宣言されているが、SAVE/UNSAVE/CANCEL ボタンが実装されていない
  - 単なる confirm ダイアログで代替されている

**改善が必要な点**:
```typescript
// 現在（window.confirm）
const handleNavigateWithCheckRef = useRef<((path: string) => void) | undefined>(undefined);
handleNavigateWithCheckRef.current = (path: string) => {
  if (hasChanges) {
    if (window.confirm('未保存の変更があります。移動しますか？')) {
      navigate(path);
    }
  } else {
    navigate(path);
  }
};

// 要件に合わせた改善内容
// → トースト + SAVE / UNSAVE / CANCEL ボタンへの変更
```

---

## 📝 使用方法と呼び出し方法

### ページ層での使用例（ProblemViewEditPage）

```typescript
import { useAppBarAction } from '@/contexts/AppBarActionContext';

export default function ProblemViewEditPage() {
  const {
    setEnableAppBarActions,
    setIsEditMode,
    setHasUnsavedChanges,
    setOnSave,
    setIsSaving,
    setOnNavigateWithCheck,
  } = useAppBarAction();

  // Step 1: 編集・保存機能を有効化（作成者のみ）
  useEffect(() => {
    const isAuthor = user && exam && user.id === exam.userId;
    setEnableAppBarActions(isAuthor);
  }, [isAuthor]);

  // Step 2: 保存コールバックを登録
  useEffect(() => {
    setOnSave(async () => {
      setIsSaving(true);
      try {
        await sectionRef.current?.save();
      } catch (e) {
        console.error('Save failed', e);
      } finally {
        setIsSaving(false);
      }
    });
    return () => setOnSave(null);
  }, [setOnSave]);

  // Step 3: 未保存状態を監視
  useEffect(() => {
    setHasUnsavedChanges(hasChanges);
  }, [hasChanges, setHasUnsavedChanges]);

  // Step 4: 編集モードの切り替え
  useEffect(() => {
    setIsEditMode(isEditModeLocal);
  }, [isEditModeLocal, setIsEditMode]);

  // Step 5: ページ遷移時の警告処理を登録
  useEffect(() => {
    if (isEditModeLocal && hasChanges) {
      setOnNavigateWithCheck((path: string) => {
        if (window.confirm('未保存の変更があります。移動しますか？')) {
          navigate(path);
        }
      });
    } else {
      setOnNavigateWithCheck(null);
    }
  }, [isEditModeLocal, hasChanges]);
}
```

---

## 🔍 TopMenuBar の制御フロー図

```
┌─────────────────────────────────────────────────────────────┐
│ AppBarActionContext（状態管理）                             │
│  ├─ enableAppBarActions: boolean                            │
│  ├─ isEditMode: boolean                                    │
│  ├─ hasUnsavedChanges: boolean                             │
│  ├─ onSave: (() => Promise<void>) | null                   │
│  ├─ isSaving: boolean                                      │
│  └─ onNavigateWithCheck: ((path: string) => void) | null  │
└──────────────┬──────────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────────┐
│ TopMenuBar（UI制御）                                        │
│                                                             │
│ [SAVE ボタン]                                               │
│  disabled = isSaving || !hasUnsavedChanges                 │
│  onClick → onSave() 実行                                    │
│                                                             │
│ [View] [Edit] 切り替え                                      │
│  value = isEditMode ? 'edit' : 'view'                      │
│  onChange → setIsEditMode()                                │
│                                                             │
│ [ナビゲーション] ← 遷移前に警告検出                         │
│  onClick → handleNavigation(path)                          │
│           → onNavigateWithCheck(path) 実行                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 現在の実装と要件のギャップ分析

### 完全に充足している要件

✅ **mode 状態管理**
- 内部: boolean型（true/false）
- UI: 文字列型（'edit'/'view'）
- **状態**: 機能的には要件を満たしている

✅ **isChange フラグ管理**
- 名称: `hasUnsavedChanges` （`isChange` より明確）
- 動作: SAVE ボタンの有効/無効を正しく制御

### 実装が不完全な要件

⚠️ **ページ遷移時のトースト警告**

**現在の実装**:
```typescript
// window.confirm で代替
if (window.confirm('未保存の変更があります。移動しますか？')) {
  navigate(path);
}
```

**要件**:
```typescript
// トースト UI + SAVE / UNSAVE / CANCEL ボタン
<Snackbar open={showWarningSnackbar}>
  <SnackbarContent
    message="未保存の変更があります。保存しますか？"
    action={[
      <Button key="save" onClick={handleSaveAndNavigate}>SAVE</Button>,
      <Button key="unsave" onClick={handleNavigateWithoutSave}>UNSAVE</Button>,
      <Button key="cancel" onClick={handleCancel}>CANCEL</Button>,
    ]}
  />
</Snackbar>
```

---

## 🔧 推奨される改善事項

### 優先度 1: トースト警告 UI の完全実装

**推奨理由**: UX が大幅に改善される

**実装内容**:
1. Snackbar に SAVE / UNSAVE / CANCEL ボタンを追加
2. ProblemViewEditPage の警告処理を TopMenuBar に統合
3. ナビゲーション先を状態として保持

**コード例**:
```typescript
const [pendingPath, setPendingPath] = useState<string | null>(null);

const handleNavigationWithWarning = (path: string) => {
  if (hasUnsavedChanges) {
    setPendingPath(path);
    setShowWarningSnackbar(true);
  } else {
    navigate(path);
  }
};

const handleSaveAndNavigate = async () => {
  await onSave?.();
  setShowWarningSnackbar(false);
  navigate(pendingPath || '/');
};

const handleNavigateWithoutSave = () => {
  setShowWarningSnackbar(false);
  navigate(pendingPath || '/');
};
```

### 優先度 2: 状態命名の標準化（オプション）

**現在**: `hasUnsavedChanges`  
**要件**: `isChange`  
**検討**: 現在の命名（`hasUnsavedChanges`）がより意図が明確なため、そのまま維持推奨

---

## 📚 関連ファイル

- [TopMenuBar.tsx](../src/components/common/TopMenuBar.tsx) - UI実装
- [AppBarActionContext.tsx](../src/contexts/AppBarActionContext.tsx) - 状態管理
- [ProblemViewEditPage.tsx](../src/pages/ProblemViewEditPage.tsx) - 使用例

---

## ✅ チェックリスト

- [x] TopMenuBar 現状確認
- [x] AppBarActionContext の状態管理確認
- [x] 要件との整合性確認
- [x] ボタン制御ロジック確認
- [x] 改善点の特定

**結論**: 
- ✅ 基本的な状態管理と SAVE ボタンの有効/無効制御は完全に実装
- ⚠️ ページ遷移時のトースト警告 UI は部分的実装（confirm で代替中）
- 📝 トースト UI の完全実装は後続フェーズで実施可能

