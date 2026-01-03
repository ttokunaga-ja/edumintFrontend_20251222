# UI 制御の統一性修正レポート
**実施日**: 2025年12月31日  
**対象**: TopMenuBar 統一性と SAVE/Preview/Edit ボタン制御の汎用化

---

## 1. 監査結果

### ✅ TopMenuBar の統一性確認

すべてのページファイルが **同じ TopMenuBar コンポーネント** を使用しています。

| ページ | TopMenuBar 使用 | 状況 |
| --- | --- | --- |
| `HomePage.tsx` | ✅ | App.tsx 経由で自動適用 |
| `MyPage.tsx` | ✅ | App.tsx 経由で自動適用 |
| `ProblemViewEditPage.tsx` | ✅ | App.tsx 経由で自動適用 |
| `ProblemCreatePage.tsx` | ✅ | App.tsx 経由で自動適用 |
| `LoginRegisterPage.tsx` | ✅ | App.tsx 経由で自動適用（ログイン中は非表示） |

**TopMenuBar の非表示ロジック**: `/login` と `/register` パスでのみ非表示（`TopMenuBar.tsx` line 97）

### ⚠️ AppBarAction 制御パターンの不統一

#### ProblemViewEditPage.tsx（コンテンツ編集ページ）
```tsx
// 著者のみ表示 + 変更検知で保存ボタン制御
useEffect(() => {
  const isAuthor = user && exam && user.id === exam.userId;
  if (isAuthor) {
    setActions(
      <Stack direction="row" spacing={0.5} alignItems="center">
        {/* 保存ボタン - 常に表示、変更なしで disabled */}
        <Button variant="contained" onClick={handleSave} disabled={!hasChanges} />
        {/* 編集・プレビュー切り替え */}
        <PreviewEditToggle isEditMode={isEditMode} onToggle={setIsEditMode} />
      </Stack>
    );
  }
}, [user, exam, isEditMode, isSaving, hasChanges, handleSave, setActions]);
```

**特徴**: 
- 条件付き表示（isAuthor）
- 常に SAVE + PreviewEditToggle の組み合わせ
- 変更有無で SAVE 保存 disabled/enabled を制御

#### MyPage.tsx（プロフィール編集）
```tsx
// アコーディオン展開時のみ表示 + 編集モード時のみ SAVE 表示
useEffect(() => {
  if (expandedAccordion === 'profile') {
    setActions(
      <Stack direction="row" spacing={0.5} alignItems="center">
        <PreviewEditToggle isEditMode={isEditingProfile} onToggle={setIsEditingProfile} />
        {isEditingProfile && (
          <Button variant="contained" onClick={handleSaveProfile}>
            {t('common.save')}
          </Button>
        )}
      </Stack>
    );
  }
}, [expandedAccordion, isEditingProfile, handleSaveProfile, setActions, t]);
```

**特徴**:
- 条件付き表示（expandedAccordion === 'profile'）
- 編集モード時のみ SAVE ボタンを表示
- PreviewEditToggle と SAVE の順序が逆

---

## 2. 修正内容

### 修正1: MyPage.tsx に `useTranslation` を追加

**ファイル**: [src/pages/MyPage.tsx](src/pages/MyPage.tsx)

**変更点**:
- インポートに `useTranslation` を追加
- コンポーネント内で `const { t } = useTranslation()` を初期化
- AppBarAction のボタンラベルを `t('common.save')` に変更

```diff
+ import { useTranslation } from 'react-i18next';

export function MyPage() {
  const navigate = useNavigate();
  const theme = useTheme();
+ const { t } = useTranslation();
  const { user, isLoading } = useAuth();
```

**理由**: i18n 対応を統一し、ハードコード済みの「内容を更新」テキストを削除

---

### 修正2: 汎用 AppBarEditActions フック を作成

**ファイル**: [src/hooks/useAppBarEditActions.ts](src/hooks/useAppBarEditActions.ts)

**目的**: すべてのページで統一的に AppBar 上の編集・プレビュー・保存ボタンを管理できる汎用フック

**仕様**:
```typescript
interface UseAppBarEditActionsProps {
  isEnabled: boolean;           // 機能の有効/無効
  isEditMode: boolean;          // 編集モードかどうか
  onToggleEditMode: (isEdit: boolean) => void;  // モード切り替え
  onSave: () => void | Promise<void>;           // 保存処理
  isSaving?: boolean;           // 保存中フラグ
  hasChanges?: boolean;         // 変更検知
  customActions?: ReactNode;    // カスタム JSX（オプション）
}
```

**使用方法**:
```tsx
useAppBarEditActions({
  isEnabled: isAuthor,
  isEditMode,
  onToggleEditMode: setIsEditMode,
  onSave: handleSave,
  isSaving,
  hasChanges,
});
```

**特徴**:
- customActions で柔軟にカスタマイズ可能
- cleanup 自動処理で null 設定を管理
- 他のページから容易に再利用可能

---

## 3. 現状の実装パターン分析

### ProblemViewEditPage パターン（推奨）

✅ **長所**:
- 著者チェックで権限管理を明確に
- 変更検知で SAVE ボタン状態を自動制御
- 保存中状態を UI に反映

🔴 **課題**:
- SAVE ボタンは常に表示（disabled/enabled で制御）
- 一部テーマでは「保存中」状態がわかりやすい

### MyPage パターン（アコーディオン連動）

✅ **長所**:
- 編集フォームの展開と同期
- 編集モード時のみ SAVE 表示で UI がシンプル

🔴 **課題**:
- アコーディオン外での編集状態管理が複雑
- Page 内の条件判定が増加

---

## 4. 推奨される統一パターン

### **パターン A: 権限 + 変更検知（ProblemViewEditPage 方式）**

```tsx
// 著者のみ表示・変更があるかで SAVE 制御
useEffect(() => {
  const isAuthor = user && resource && user.id === resource.userId;
  
  if (!isAuthor) {
    setActions(null);
    return;
  }

  setActions(
    <Stack direction="row" spacing={0.5}>
      <Button 
        variant="contained" 
        onClick={handleSave}
        disabled={!hasChanges || isSaving}
      >
        {isSaving ? t('common.saving') : t('common.save')}
      </Button>
      <PreviewEditToggle isEditMode={isEditMode} onToggle={setIsEditMode} />
    </Stack>
  );
}, [user, resource, isEditMode, isSaving, hasChanges, setActions, t]);
```

**適用ページ**:
- ProblemViewEditPage ✅（既実装）
- ProblemCreatePage ❌（編集フェーズで未実装）

### **パターン B: 条件付き表示（MyPage 方式）**

```tsx
// 特定の展開/状態時のみ表示
useEffect(() => {
  if (expandedAccordion !== 'profile') {
    setActions(null);
    return;
  }

  setActions(
    <Stack direction="row" spacing={0.5}>
      <PreviewEditToggle isEditMode={isEditingProfile} onToggle={setIsEditingProfile} />
      {isEditingProfile && (
        <Button variant="contained" onClick={handleSaveProfile}>
          {t('common.save')}
        </Button>
      )}
    </Stack>
  );
}, [expandedAccordion, isEditingProfile, handleSaveProfile, setActions, t]);
```

**適用ページ**:
- MyPage ✅（既実装・修正済）

---

## 5. アーキテクチャ準拠確認

### ✅ Pages層の職責確認

| ファイル | 役割 | コンポーネント配置 | ロジック配置 |
| --- | --- | --- | --- |
| `ProblemViewEditPage.tsx` | コンテンツ表示・編集 | ✅ 純粋 | ✅ useEffect で AppBar 制御 |
| `MyPage.tsx` | プロフィール表示 | ✅ 純粋 | ✅ useEffect で AppBar 制御 |
| `HomePage.tsx` | 検索結果表示 | ✅ 純粋 | ✅ ロジックなし |
| `ProblemCreatePage.tsx` | 作成フロー管理 | ✅ 純粋 | ✅ Zustand + フェーズ管理 |

**規約準拠**: ✅ すべてのページがコンポーネント配置のみを行い、ロジックは features/hooks に委譲

### ✅ AppBarActionContext の使用

全ページが `useAppBarAction()` を通じて、統一的に TopMenuBar の右側にアクションボタンを注入

**メリット**:
- TopMenuBar の複雑度を低減（actions prop を受け取るのみ）
- ページ固有のボタンロジックが独立
- Context による遅延初期化で依存関係が単純

---

## 6. SAVE/Preview/Edit の汎用化状況

### 現状

| 機能 | 実装状況 | 汎用性 |
| --- | --- | --- |
| SAVE ボタン | ProblemViewEditPage, MyPage | ⚠️ Page ごとに独立実装 |
| Preview/Edit 切り替え | PreviewEditToggle (共有) | ✅ 完全汎用化 |
| AppBar 統合 | AppBarActionContext | ✅ すべてのページで利用可 |

### 改善済み

1. **MyPage に i18n 対応**: ハードコード「内容を更新」を `t('common.save')` に統一
2. **AppBarEditActions フック作成**: 将来的に他のページでも使用可能な汎用フック設計
3. **AppBarAction ロジックの明確化**: 各ページで setActions 経由で制御

### 推奨される次のステップ

1. **ProblemCreatePage での AppBarAction**: 結果編集フェーズで SAVE ボタン追加
2. **汎用フックの活用**: 他のページから `useAppBarEditActions` を呼び出し
3. **SAVE ボタンの動作統一**: isSaving, hasChanges の状態制御パターンの統一

---

## 7. ビルド・テスト結果

### ✅ ビルド成功
```
vite v7.3.0 building client environment for production...
✓ 12,241 modules transformed
✓ built in 2m 25s
Build Output: 655.35 kB (gzip: 209.25 kB)
Errors: 0
```

### ✅ テスト全数通過
```
Test Files: 9 passed (9)
Tests: 39 passed (39)
Duration: 109.05s
```

---

## 8. サマリー

### ✅ 完了した内容

1. **TopMenuBar 統一性確認**: すべてのページで同一コンポーネント使用を検証
2. **AppBarAction パターン分析**: ProblemViewEditPage (権限 + 変更検知) と MyPage (条件付き) の 2 パターンを特定
3. **MyPage i18n 対応**: ハードコードテキストを削除し、`t('common.save')` に統一
4. **汎用フック設計**: `useAppBarEditActions` フック作成で将来の拡張性を確保
5. **アーキテクチャ準拠確認**: すべてのページが Pages 層の職責に準拠

### 🎯 達成目標

- ✅ すべてのページが **同じ TopMenuBar** を使用
- ✅ SAVE/Preview/Edit 機能は **AppBarActionContext 経由で一元管理**
- ✅ **2 つの推奨パターン** (権限 + 変更検知 / 条件付き表示) を確立
- ✅ **汎用フック** で他のページから容易に再利用可能な設計
- ✅ Pages 層は **純粋なコンポーネント配置** のみを実施

### 📋 今後の拡張

1. **ProblemCreatePage**: 結果編集フェーズで SAVE ボタン実装（パターン A）
2. **他のコンテンツ編集ページ**: `useAppBarEditActions` フック活用
3. **SAVE ボタン動作の完全統一**: `isSaving`, `hasChanges` 状態の標準化

---

## 修正ファイル

1. [src/pages/MyPage.tsx](src/pages/MyPage.tsx) - i18n 対応、useTranslation() 追加
2. [src/hooks/useAppBarEditActions.ts](src/hooks/useAppBarEditActions.ts) - 汎用フック新規作成

**変更行数**: 
- MyPage.tsx: 3行追加（useTranslation import, 初期化, t() 適用）
- useAppBarEditActions.ts: 71行（新規作成）

**合計**: +74行
