# AppBarActionContext 使用ガイド - TopMenuBar 統合

**作成日**: 2026年1月1日  
**ステータス**: 実装ガイド

---

## 📚 概要

`AppBarActionContext` は、TopMenuBar の保存・閲覧・編集ボタンを制御するためのグローバルなコンテキストです。このドキュメントは、各ページ層でTopMenuBar の機能を正しく利用するための必須ガイドです。

---

## 🎯 状態管理の全体像

```
AppBarActionContext（グローバル状態）
  ↓ （ページ層で設定）
  ├─ enableAppBarActions: boolean      → 編集・保存機能の有効化
  ├─ isEditMode: boolean               → 編集モード（true）/ 閲覧モード（false）
  ├─ hasUnsavedChanges: boolean        → 未保存変更フラグ
  ├─ onSave: Function | null           → 保存処理コールバック
  ├─ isSaving: boolean                 → 保存中フラグ
  └─ onNavigateWithCheck: Function | null → ナビゲーション警告処理
  
  ↓ （TopMenuBar で読み込み）
TopMenuBar UI
  ├─ [SAVE] ボタン（disabled制御）
  ├─ [View] [Edit] 切り替え
  ├─ ナビゲーション（警告トースト付き）
  └─ 未保存警告トースト（SAVE/UNSAVE/CANCEL）
```

---

## 📋 必須の設定フロー

### Step 1: useAppBarAction フックを取得

```typescript
import { useAppBarAction } from '@/contexts/AppBarActionContext';

export default function ProblemViewEditPage() {
  const {
    setEnableAppBarActions,      // ✅ 編集・保存機能を有効化
    setIsEditMode,               // ✅ 編集モードを設定
    setHasUnsavedChanges,        // ✅ 未保存フラグを設定
    setOnSave,                   // ✅ 保存コールバックを登録
    setIsSaving,                 // ✅ 保存中フラグを更新
    setOnNavigateWithCheck,      // ⚠️ 非推奨（TopMenuBar が内部で処理）
  } = useAppBarAction();
```

### Step 2: 機能の有効化（初期化）

**タイミング**: コンポーネント マウント時に一度だけ実行

```typescript
useEffect(() => {
  // 作成者（所有者）のみが編集・保存機能を利用可能
  const isAuthor = user && exam && user.id === exam.userId;
  setEnableAppBarActions(isAuthor);
  
  // クリーンアップ: アンマウント時に機能を無効化
  return () => {
    setEnableAppBarActions(false);
    setOnSave(null);
  };
}, [user?.id, exam?.userId]);
```

### Step 3: 保存処理を登録

**タイミング**: 保存メソッドが利用可能になった時点（ref が確保されたら）

```typescript
const sectionRef = useRef<SubQuestionSectionHandle>(null);

useEffect(() => {
  const saveCallback = async () => {
    // TopMenuBar の [SAVE] ボタンがクリックされたときに呼ばれる
    
    // Step 1: isSaving フラグを設定（TopMenuBar が表示を変更）
    setIsSaving(true);
    
    try {
      // Step 2: 実際の保存処理を実行
      await sectionRef.current?.save();
      
      // Step 3: 編集モードを終了
      setIsEditMode(false);
    } catch (error) {
      console.error('Save failed:', error);
      // エラーは SubQuestionSection の Alert で表示される
    } finally {
      // Step 4: isSaving を reset（何が起きてもここで実行）
      setIsSaving(false);
    }
  };
  
  setOnSave(saveCallback);
  
  // クリーンアップ
  return () => {
    setOnSave(null);
  };
}, [setOnSave, setIsSaving, setIsEditMode]);
```

### Step 4: 未保存フラグを監視

**タイミング**: ユーザーがデータを編集する度に更新

```typescript
// データの変更状態を監視
const hasChanges = useMemo(() => {
  if (!exam || !editedExam) return false;
  return JSON.stringify(editedExam) !== JSON.stringify(exam);
}, [exam, editedExam]);

// 変更状態を AppBarActionContext に反映
useEffect(() => {
  setHasUnsavedChanges(hasChanges);
}, [hasChanges, setHasUnsavedChanges]);
```

### Step 5: 編集モードの切り替え

**タイミング**: ユーザーが「編集」ボタンをクリックしたときに TopMenuBar がこれを呼び出す

```typescript
// TopMenuBar が setIsEditMode を呼び出すと、ページ層で受け取る
const [isEditModeLocal, setIsEditModeLocal] = useState(false);

// AppBarActionContext の isEditMode 変更を検知
useEffect(() => {
  // ✅ TopMenuBar の切り替えボタンで isEditMode が変更されたら
  // ページ層の isEditModeLocal も同期
  // （AppBarActionContext が変更を通知）
}, []);
```

---

## 🔄 完全な実装例

```typescript
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAppBarAction } from '@/contexts/AppBarActionContext';

export default function ProblemViewEditPage() {
  const { user, exam } = useAuth();
  const { setEnableAppBarActions, setIsEditMode, setHasUnsavedChanges, setOnSave, setIsSaving } = useAppBarAction();
  
  const [isEditModeLocal, setIsEditModeLocal] = useState(false);
  const [editedExam, setEditedExam] = useState<any>(null);
  const sectionRef = useRef<SubQuestionSectionHandle>(null);

  // ========== Step 1: 機能の有効化 ==========
  useEffect(() => {
    const isAuthor = user && exam && user.id === exam.userId;
    setEnableAppBarActions(isAuthor);
    return () => {
      setEnableAppBarActions(false);
      setOnSave(null);
    };
  }, [user?.id, exam?.userId, setEnableAppBarActions, setOnSave]);

  // ========== Step 2: 保存処理を登録 ==========
  useEffect(() => {
    const saveCallback = async () => {
      setIsSaving(true);
      try {
        // SubQuestionSection の save() を呼び出す
        await sectionRef.current?.save();
        setIsEditModeLocal(false);
      } catch (error) {
        console.error('Save failed:', error);
      } finally {
        setIsSaving(false);
      }
    };
    
    setOnSave(saveCallback);
    return () => setOnSave(null);
  }, [setOnSave, setIsSaving]);

  // ========== Step 3: 未保存フラグを監視 ==========
  const hasChanges = useMemo(() => {
    if (!exam || !editedExam) return false;
    return JSON.stringify(editedExam) !== JSON.stringify(exam);
  }, [exam, editedExam]);

  useEffect(() => {
    setHasUnsavedChanges(hasChanges);
  }, [hasChanges, setHasUnsavedChanges]);

  // ========== Step 4: 編集モードを管理 ==========
  useEffect(() => {
    // TopMenuBar の切り替えボタンで isEditMode が変更されると
    // ページ層の isEditModeLocal も同期される
    // (この例では isEditModeLocal を直接管理)
  }, [setIsEditMode]);

  return (
    <div>
      {/* SubQuestionBlock に ref を渡す */}
      <SubQuestionBlock ref={sectionRef} {...props} />
    </div>
  );
}
```

---

## ⚙️ 各ボタンの動作仕様

### [SAVE] ボタン

| 状態 | UI | 動作 |
|------|-----|------|
| `hasUnsavedChanges === false` | ❌ グレーアウト（disabled） | クリック不可 |
| `hasUnsavedChanges === true && isSaving === false` | ✅ 青色（有効） | `onSave()` を実行 |
| `isSaving === true` | ⏳ グレーアウト（disabled） | "保存中..." と表示、クリック不可 |

**テキスト表示**:
```typescript
// TopMenuBar より
{isSaving ? t('common.saving') : t('common.save')}
// → isSaving = false: "保存"
// → isSaving = true:  "保存中..."
```

### [View] / [Edit] 切り替えボタン

| 状態 | 表示 | 動作 |
|------|-----|------|
| `isEditMode === false` | "View" が選択状態 | `setIsEditMode(false)` |
| `isEditMode === true` | "Edit" が選択状態 | `setIsEditMode(true)` |

### ナビゲーション（警告トースト付き）

**ナビゲーション対象**:
- ハンバーガーメニューの各項目
- ロゴクリック
- ユーザーアバタークリック
- 問題作成ボタン（＋）

**警告トースト表示条件**:
```typescript
if (hasUnsavedChanges && isEditMode) {
  // → トースト表示（SAVE / UNSAVE / CANCEL）
}
```

**トースト UI**:
```
┌─────────────────────────────────────────────┐
│ 未保存の変更があります。保存して移動しますか？ │
│ [SAVE] [UNSAVE] [CANCEL]                    │
└─────────────────────────────────────────────┘
```

**各ボタンの動作**:
- **SAVE**: 保存実行 → 移動
- **UNSAVE**: 変更を破棄して移動
- **CANCEL**: 移動キャンセル（トースト閉じる）

---

## 🚫 注意事項

### ❌ 非推奨: onNavigateWithCheck の使用

```typescript
// ❌ 古い方法（非推奨）
setOnNavigateWithCheck((path: string) => {
  if (hasChanges) {
    if (window.confirm('移動しますか？')) {
      navigate(path);
    }
  } else {
    navigate(path);
  }
});
```

**理由**: TopMenuBar の内部で警告処理を完全に管理するため、ページ層での実装は不要

### ✅ 推奨: TopMenuBar に委譲

```typescript
// ✅ 推奨方法（Phase 7 以降）
// hasUnsavedChanges と isEditMode を設定するだけで
// TopMenuBar がトースト警告を自動的に表示
setHasUnsavedChanges(hasChanges);
setIsEditMode(isEditMode);
```

---

## 📝 チェックリスト（ページ層の実装時）

新しいページで TopMenuBar を統合するときの確認事項：

- [ ] `useAppBarAction()` をインポート
- [ ] `setEnableAppBarActions(true)` を実行（作成者のみ）
- [ ] `setOnSave(async () => { ... })` で保存コールバックを登録
- [ ] `setHasUnsavedChanges(hasChanges)` で未保存フラグを更新
- [ ] `setIsSaving(true/false)` で保存状態を管理
- [ ] ref 経由で SubQuestionSection.save() を呼び出し
- [ ] finally ブロックで `setIsSaving(false)` を実行
- [ ] クリーンアップで `setOnSave(null)` を実行
- [ ] TypeScript errors: 0 を確認

---

## 🔗 関連ドキュメント

- [AppBarActionContext.tsx](../src/contexts/AppBarActionContext.tsx) - コンテキスト定義
- [TopMenuBar.tsx](../src/components/common/TopMenuBar.tsx) - UI実装
- [TOPMENUBAR_STATE_ANALYSIS_20260101.md](./TOPMENUBAR_STATE_ANALYSIS_20260101.md) - 状態分析レポート
- [PHASE_6_APPBAR_INTEGRATION_REPORT.md](./PHASE_6_APPBAR_INTEGRATION_REPORT.md) - Phase 6 統合レポート

---

## 📞 FAQ

**Q: `onNavigateWithCheck` は何に使用されますか？**
A: Phase 7 以前の古い警告処理です。Phase 7 以降は TopMenuBar が内部で警告トースト UI を表示するため、ページ層での実装は不要です。

**Q: 複数のコンポーネントから同時に TopMenuBar を制御できますか？**
A: いいえ。複数のコンポーネントで `setOnSave` を同時に登録すると、最後の登録が有効になります。1ページ内に複数の保存対象がある場合、親コンポーネントで一括管理してください。

**Q: 保存中に編集モードを切り替えられますか？**
A: いいえ。`isSaving === true` の時は [SAVE] ボタンが disabled になります。また、ページ遷移も警告トースト表示時のみ可能です。

**Q: エラーメッセージはどこに表示されますか？**
A: SubQuestionSection の内部の Alert コンポーネントで表示されます。TopMenuBar は表示しません。

---

**ドキュメント作成日**: 2026-01-01  
**最終更新**: Phase 7 トースト警告 UI 完全実装後  
**対象フェーズ**: Phase 6 / Phase 7 以降

