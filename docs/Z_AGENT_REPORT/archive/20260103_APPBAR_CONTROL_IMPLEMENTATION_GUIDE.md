# AppBar 編集制御の実装ガイド

**対象**: ページコンポーネントで SAVE/Preview/Edit ボタンを TopMenuBar の AppBar に表示したい場合  
**作成日**: 2025年12月31日

---

## 目次

1. [概要](#概要)
2. [パターン A: 権限 + 変更検知（推奨）](#パターン-a-権限--変更検知推奨)
3. [パターン B: 条件付き表示](#パターン-b-条件付き表示)
4. [汎用フック: useAppBarEditActions](#汎用フックuseappbareditactions)
5. [チェックリスト](#チェックリスト)
6. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### アーキテクチャ

Eduanima では、**TopMenuBar** の右側にページ固有のアクションボタンを動的に表示します。

```
┌──────────────────────────────────────────────────────┐
│  TopMenuBar (sticky header)                          │
│  ┌───────────────────────────────────────────────┐   │
│  │ [Menu] Logo [Search] [+] [🔔] [Avatar] [Save] │   │
│  │                              ↑ ← AppBar に注入│   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### 制御フロー

```
Page Component (ProblemViewEditPage, MyPage, etc.)
    │
    ├─ useAppBarAction() を import
    │
    ├─ useEffect で setActions() を呼び出し
    │  ├─ SAVE ボタン JSX
    │  └─ PreviewEditToggle コンポーネント
    │
    └─ AppBar に JSX が render される
```

### Context

- **[AppBarActionContext.tsx](src/contexts/AppBarActionContext.tsx)**: actions と setActions を管理
- **[TopMenuBar.tsx](src/components/common/TopMenuBar.tsx)**: actions を表示（右側メニューグループ）

---

## パターン A: 権限 + 変更検知（推奨）

### 用途

- **所有者/著者のみ編集可能** な場合
- **変更を検知** して SAVE ボタンを制御したい場合
- **リアルタイムで保存状態** を UI に反映したい場合

### 実装例

**ファイル**: `src/pages/ProblemViewEditPage.tsx`

```tsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack } from '@mui/material';
import { useAppBarAction } from '@/contexts/AppBarActionContext';
import { PreviewEditToggle } from '@/components/common/PreviewEditToggle';

export default function ProblemViewEditPage() {
  const { t } = useTranslation();
  const { setActions } = useAppBarAction();
  
  // 状態管理
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // データ取得・所有者確認
  const { user } = useAuth();
  const { data: exam } = useExamDetail(id);
  const isAuthor = user && exam && user.id === exam.userId;

  // 保存処理
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateExam(id, editedExam);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  // AppBar ボタン制御
  useEffect(() => {
    if (!isAuthor) {
      setActions(null);
      return;
    }

    setActions(
      <Stack direction="row" spacing={0.5} alignItems="center">
        {/* SAVE ボタン */}
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          size="small"
          sx={{
            backgroundColor: !hasChanges ? 'action.disabledBackground' : 'primary.main',
            color: !hasChanges ? 'action.disabled' : '#ffffff',
            '&:hover': {
              backgroundColor: !hasChanges ? 'action.disabledBackground' : 'primary.dark',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isSaving ? t('common.saving') : t('common.save')}
        </Button>
        
        {/* Preview/Edit 切り替え */}
        <PreviewEditToggle isEditMode={isEditMode} onToggle={setIsEditMode} />
      </Stack>
    );

    return () => setActions(null);
  }, [isAuthor, isEditMode, isSaving, hasChanges, handleSave, setActions, t]);

  // ... rest of component
}
```

### ポイント

| 項目 | 説明 |
| --- | --- |
| **条件分岐** | `if (!isAuthor) setActions(null)` で権限確認 |
| **SAVE disabled** | `!hasChanges && !isSaving` で制御 |
| **ローディング表示** | isSaving 時にボタンラベルを変更 |
| **順序** | SAVE → PreviewEditToggle |
| **Cleanup** | `return () => setActions(null)` で削除 |

---

## パターン B: 条件付き表示

### 用途

- **特定の UI 状態** (アコーディオン展開等) で表示したい場合
- **常にすべてのボタンを表示しない** 場合
- **編集フォーム展開時のみ** SAVE を表示したい場合

### 実装例

**ファイル**: `src/pages/MyPage.tsx`

```tsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useAppBarAction } from '@/contexts/AppBarActionContext';
import { PreviewEditToggle } from '@/components/common/PreviewEditToggle';

export function MyPage() {
  const { t } = useTranslation();
  const { setActions } = useAppBarAction();
  
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({...});

  const handleSaveProfile = () => {
    console.log('Saving:', editForm);
    setIsEditingProfile(false);
  };

  // AppBar ボタン制御 - アコーディオン展開時のみ
  useEffect(() => {
    if (expandedAccordion !== 'profile') {
      setActions(null);
      return;
    }

    setActions(
      <Stack direction="row" spacing={0.5} alignItems="center">
        {/* Preview/Edit 切り替え */}
        <PreviewEditToggle isEditMode={isEditingProfile} onToggle={setIsEditingProfile} />
        
        {/* SAVE ボタン - 編集モード時のみ表示 */}
        {isEditingProfile && (
          <Button
            variant="contained"
            onClick={handleSaveProfile}
            size="small"
            sx={{
              backgroundColor: 'primary.main',
              '&:hover': { backgroundColor: 'primary.dark' },
            }}
          >
            {t('common.save')}
          </Button>
        )}
      </Stack>
    );

    return () => setActions(null);
  }, [expandedAccordion, isEditingProfile, handleSaveProfile, setActions, t]);

  return (
    <Container>
      {/* ... */}
      <Accordion 
        expanded={expandedAccordion === 'profile'} 
        onChange={(_, isExpanded) => setExpandedAccordion(isExpanded ? 'profile' : false)}
      >
        <AccordionSummary>プロフィール編集</AccordionSummary>
        <AccordionDetails>
          {/* 編集フォーム */}
        </AccordionDetails>
      </Accordion>
    </Container>
  );
}
```

### ポイント

| 項目 | 説明 |
| --- | --- |
| **条件分岐** | `if (expandedAccordion !== 'profile') setActions(null)` |
| **条件付き SAVE** | `{isEditingProfile && <Button>}` で編集モード時のみ表示 |
| **順序** | PreviewEditToggle → SAVE |
| **Cleanup** | return 関数で自動削除 |

---

## 汎用フック: useAppBarEditActions

### 概要

将来的に複数のページで統一的にボタンを管理するための汎用フック

**ファイル**: [src/hooks/useAppBarEditActions.ts](src/hooks/useAppBarEditActions.ts)

### 使用方法（案）

```tsx
import { useAppBarEditActions } from '@/hooks/useAppBarEditActions';

export function SomeEditPage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 汎用フック呼び出し
  useAppBarEditActions({
    isEnabled: true,  // 常に有効
    isEditMode,
    onToggleEditMode: setIsEditMode,
    onSave: handleSave,
    isSaving,
    hasChanges,
  });

  // ... component logic
}
```

### フック内部実装（参考）

```typescript
export function useAppBarEditActions(props: UseAppBarEditActionsProps) {
  const { isEnabled, customActions, ... } = props;
  const { setActions } = useAppBarAction();

  useEffect(() => {
    if (!isEnabled) {
      setActions(null);
      return;
    }

    if (customActions) {
      setActions(customActions);
      return;
    }

    return () => setActions(null);
  }, [isEnabled, customActions, setActions]);
}
```

---

## チェックリスト

ページで AppBarAction を実装する際の確認事項:

- [ ] **1. Context をインポート**
  ```tsx
  import { useAppBarAction } from '@/contexts/AppBarActionContext';
  ```

- [ ] **2. useTranslation をインポート**
  ```tsx
  import { useTranslation } from 'react-i18next';
  const { t } = useTranslation();
  ```

- [ ] **3. PreviewEditToggle をインポート**
  ```tsx
  import { PreviewEditToggle } from '@/components/common/PreviewEditToggle';
  ```

- [ ] **4. useEffect で setActions を設定**
  ```tsx
  useEffect(() => {
    const shouldShow = /* 条件 */;
    if (!shouldShow) {
      setActions(null);
      return;
    }
    
    setActions(
      <Stack direction="row" spacing={0.5}>
        {/* ボタンJSX */}
      </Stack>
    );

    return () => setActions(null);
  }, [/* 依存配列 */]);
  ```

- [ ] **5. ボタンラベルは i18n で管理**
  ```tsx
  {t('common.save')}  // ❌ '保存' (hardcoded)
  ```

- [ ] **6. 依存配列に setActions を含める**
  ```tsx
  }, [..., setActions, t]);
  ```

- [ ] **7. SAVE ボタン disabled 状態を定義**
  ```tsx
  disabled={isSaving || !hasChanges}
  ```

---

## トラブルシューティング

### Q1: AppBar にボタンが表示されない

**原因**: useEffect が実行されていない、または setActions(null) で削除されている

**対処**:
```tsx
// 1. 依存配列を確認
useEffect(() => {...}, [isAuthor, setActions, t]);  // ← setActions と t を含める

// 2. 条件分岐を確認
if (!condition) {
  setActions(null);
  return;  // ← return を忘れずに
}

// 3. console.log で確認
useEffect(() => {
  console.log('isAuthor:', isAuthor, 'Actions:', condition ? 'show' : 'hide');
  // ...
}, [...]);
```

### Q2: AppBar にボタンが複数表示される

**原因**: cleanup 関数（return 内の setActions(null)）がない

**対処**:
```tsx
useEffect(() => {
  // 処理
  setActions(jsx);

  // cleanup 関数を追加
  return () => setActions(null);
}, [...]);
```

### Q3: i18n の翻訳キーが見つからない

**原因**: 翻訳ファイル (`src/locales/ja/translation.json`) に キー が定義されていない

**対処**:
```json
{
  "common": {
    "save": "保存",
    "saving": "保存中...",
    "cancel": "キャンセル"
  }
}
```

### Q4: PreviewEditToggle が表示されない

**原因**: PreviewEditToggle が isEditMode と onToggle props を受け取っていない

**対処**:
```tsx
<PreviewEditToggle 
  isEditMode={isEditMode}        // ← 必須
  onToggle={setIsEditMode}       // ← 必須
/>
```

### Q5: ボタンが disabled のまま

**原因**: hasChanges の初期値が false のまま

**対処**:
```tsx
// フォーム入力時に hasChanges を更新
const handleInputChange = (newData) => {
  setEditForm(newData);
  setHasChanges(JSON.stringify(newData) !== JSON.stringify(originalData));
};

// または useForm + watch で自動検知
const { watch } = useForm({ defaultValues: data });
const edited = watch();
const hasChanges = JSON.stringify(edited) !== JSON.stringify(data);
```

---

## まとめ

### パターン選択フロー

```
編集権限チェックが必要？
├─ YES → パターン A (権限 + 変更検知)
│        例: ProblemViewEditPage, 他のコンテンツ編集ページ
│
└─ NO → 特定の UI 状態(アコーディオン等)で表示？
        ├─ YES → パターン B (条件付き表示)
        │        例: MyPage (プロフィール展開時)
        │
        └─ NO → その他の条件で制御
                 useAppBarEditActions フックで柔軟に実装
```

### ベストプラクティス

1. **常に cleanup を書く**: `return () => setActions(null)`
2. **i18n キーを使用**: ハードコードテキストは避ける
3. **disabled 状態を明確に**: isSaving, hasChanges で制御
4. **依存配列に setActions を含める**: 無限ループ防止
5. **PreviewEditToggle + SAVE の順序**: 保存が優先される位置に配置

---

**参考ファイル**:
- [ProblemViewEditPage.tsx](src/pages/ProblemViewEditPage.tsx) - パターン A 実装例
- [MyPage.tsx](src/pages/MyPage.tsx) - パターン B 実装例
- [TopMenuBar.tsx](src/components/common/TopMenuBar.tsx) - AppBar 統合
- [AppBarActionContext.tsx](src/contexts/AppBarActionContext.tsx) - Context 定義
- [PreviewEditToggle.tsx](src/components/common/PreviewEditToggle.tsx) - Toggle コンポーネント
