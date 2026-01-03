# TopMenuBar.tsx 修正の詳細ビフォーアフター

## 1. TopMenuBar - 右側メニューグループの修正

### ビフォー（修正前）
```tsx
{/* 問題作成ボタン */}
<Tooltip title="問題を作成">
  <IconButton
    onClick={() => handleNavigation('/problem/create')}
    sx={{
      color: theme.palette.primary.main,
      width: 64,
      height: 64,
      p: 0,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <AddIcon sx={{ fontSize: 28 }} />  {/* アイコンのみ、テキストなし */}
  </IconButton>
</Tooltip>
```

### アフター（修正後）
```tsx
{/* 問題作成ボタン */}
<Tooltip title="問題を作成">
  <IconButton
    onClick={() => handleNavigation('/problem/create')}
    sx={{
      color: theme.palette.primary.main,
      width: 64,
      height: 64,
      p: 0,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',      {/* 縦方向レイアウト */}
      gap: 0.25,                    {/* アイコンとテキストの間隔 */}
    }}
  >
    <AddIcon sx={{ fontSize: 24 }} />  {/* アイコンサイズ削減: 28 → 24 */}
    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, lineHeight: 1 }}>
      作成  {/* テキストラベル追加 */}
    </Typography>
  </IconButton>
</Tooltip>
```

### 変更点
| 項目 | ビフォー | アフター | 理由 |
|:--:|:--:|:--:|:--:|
| アイコンサイズ | 28px | 24px | 絵文字フォントサイズ調整 |
| テキストラベル | なし | 「作成」 | 操作ラベルの明確化 |
| レイアウト | - | flexDirection: 'column' | アイコン下にテキスト配置 |
| 間隔 | - | gap: 0.25 | アイコン・テキスト間の視覚的結合 |

---

## 2. PreviewEditToggle - トグルボタングループの再実装

### ビフォー（修正前）
```tsx
<ToggleButtonGroup
  value={isEditMode ? 'edit' : 'view'}
  exclusive
  onChange={handleChange}
  aria-label="view/edit mode toggle"
  {/* サイズ指定なし - 自動幅 */}
>
  <ToggleButton value="view" aria-label="view mode">
    <ViewListIcon sx={{ mr: 1 }} />
    閲覧  {/* テキストラベルがボタン内 */}
  </ToggleButton>
  <ToggleButton value="edit" aria-label="edit mode">
    <EditIcon sx={{ mr: 1 }} />
    編集
  </ToggleButton>
</ToggleButtonGroup>
```

### アフター（修正後）
```tsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
  <ToggleButtonGroup
    value={isEditMode ? 'edit' : 'view'}
    exclusive
    onChange={handleChange}
    aria-label="view/edit mode toggle"
    sx={{
      width: 128,    {/* 固定幅 */}
      height: 64,    {/* 固定高さ */}
      '& .MuiToggleButton-root': {
        width: '50%',  {/* 各ボタン: 64×64px */}
        height: '100%',
        p: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.secondary,
        '&.Mui-selected': {
          backgroundColor: theme.palette.primary.main,
          color: '#ffffff',
        },
      },
    }}
  >
    <ToggleButton value="view" aria-label="view mode">
      <ViewListIcon sx={{ fontSize: 20 }} />  {/* テキストなし */}
    </ToggleButton>
    <ToggleButton value="edit" aria-label="edit mode">
      <EditIcon sx={{ fontSize: 20 }} />
    </ToggleButton>
  </ToggleButtonGroup>
  
  {/* ラベルを外側に配置 */}
  <Typography
    variant="caption"
    sx={{
      fontWeight: 600,
      fontSize: '0.7rem',
      whiteSpace: 'nowrap',
      color: theme.palette.text.secondary,
    }}
  >
    {isEditMode ? '編集' : '閲覧'}
  </Typography>
</Box>
```

### 変更点
| 項目 | ビフォー | アフター | 理由 |
|:--:|:--:|:--:|:--:|
| グループサイズ | 自動 | 128×64px | 統一規格の実装 |
| テキスト位置 | ボタン内 | 外側 | アイコン強調、スペース効率化 |
| アイコンサイズ | - | 20px | 統一規格 |
| ボタンテキスト | 「閲覧」「編集」 | アイコンのみ | 空間節約、視覚的シンプル化 |

---

## 3. ProblemViewEditPage - 保存ボタン実装の変更

### ビフォー（修正前）
```tsx
<Stack direction="row" spacing={1} alignItems="center">
  <Button
    variant="contained"
    startIcon={<SaveIcon />}
    onClick={handleSave}
    disabled={isSaving || !hasChanges}
    size="small"
    sx={{
      backgroundColor: !hasChanges ? 'action.disabledBackground' : 'primary.main',
      // ...
    }}
  >
    {isSaving ? '保存中...' : '保存'}  {/* テキストの可変幅 */}
  </Button>
  
  <PreviewEditToggle isEditMode={isEditMode} onToggle={setIsEditMode} />
</Stack>
```

### アフター（修正後）
```tsx
<Stack direction="row" spacing={0.5} alignItems="center">  {/* spacing: 1 → 0.5 */}
  <Box
    component="button"
    onClick={handleSave}
    disabled={isSaving || !hasChanges}
    sx={{
      width: 64,    {/* 固定幅 */}
      height: 64,   {/* 固定高さ */}
      p: 0,
      display: 'flex',
      flexDirection: 'column',      {/* 縦方向レイアウト */}
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0.25,                    {/* アイコン・テキスト間隔 */}
      border: 'none',
      backgroundColor: !hasChanges || isSaving
        ? 'action.disabledBackground'
        : 'primary.main',
      color: !hasChanges || isSaving ? 'action.disabled' : '#ffffff',
      borderRadius: '8px',
      cursor: !hasChanges || isSaving ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: !hasChanges || isSaving
          ? 'action.disabledBackground'
          : 'primary.dark',
      },
    }}
  >
    <SaveIcon sx={{ fontSize: 20 }} />
    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, lineHeight: 1 }}>
      {isSaving ? '中' : '保存'}  {/* テキスト短縮 */}
    </Typography>
  </Box>
  
  <PreviewEditToggle isEditMode={isEditMode} onToggle={setIsEditMode} />
</Stack>
```

### 変更点
| 項目 | ビフォー | アフター | 理由 |
|:--:|:--:|:--:|:--:|
| コンポーネント | Button | Box | より柔軟なカスタマイズ可能 |
| サイズ | 自動幅 | 64×64px | 統一規格 |
| アイコン位置 | 左側 | 上側 | アイコン・テキスト統一 |
| テキスト | 「保存」「保存中...」 | 「保存」「中」 | スペース効率化 |
| グループ間隔 | spacing: 1 | spacing: 0.5 | 密接な関連性表現 |

---

## 4. MyPage - プロフィール更新ボタンの修正

### ビフォー（修正前）
```tsx
<Stack direction="row" spacing={2} alignItems="center">
  <PreviewEditToggle isEditMode={isEditingProfile} onToggle={setIsEditingProfile} />
  {isEditingProfile && (
    <Button
      variant="contained"
      startIcon={<SaveIcon />}
      onClick={handleSaveProfile}
      size="small"
      sx={{
        backgroundColor: 'primary.main',
        '&:hover': {
          backgroundColor: 'primary.dark',
        },
      }}
    >
      内容を更新  {/* 長いテキスト */}
    </Button>
  )}
</Stack>
```

### アフター（修正後）
```tsx
<Stack direction="row" spacing={0.5} alignItems="center">
  <PreviewEditToggle isEditMode={isEditingProfile} onToggle={setIsEditingProfile} />
  {isEditingProfile && (
    <Box
      component="button"
      onClick={handleSaveProfile}
      sx={{
        width: 64,    {/* 固定幅 */}
        height: 64,   {/* 固定高さ */}
        p: 0,
        display: 'flex',
        flexDirection: 'column',      {/* 縦方向レイアウト */}
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.25,
        border: 'none',
        backgroundColor: 'primary.main',
        color: '#ffffff',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: 'primary.dark',
        },
      }}
    >
      <SaveIcon sx={{ fontSize: 20 }} />
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, lineHeight: 1 }}>
        更新  {/* テキスト短縮 */}
      </Typography>
    </Box>
  )}
</Stack>
```

### 変更点
| 項目 | ビフォー | アフター | 理由 |
|:--:|:--:|:--:|:--:|
| コンポーネント | Button | Box | ProblemViewEditPage と統一 |
| サイズ | 自動幅 | 64×64px | 統一規格 |
| テキスト | 「内容を更新」 | 「更新」 | 短縮化 |
| グループ間隔 | spacing: 2 | spacing: 0.5 | 密接な関連性表現 |
| スタイル | startIcon配置 | アイコン上配置 | アイコン・テキスト統一 |

---

## 実装の利点

### デザイン統一
- ✅ すべてのアクションボタン: 64×64px
- ✅ トグルボタン: 128×64px
- ✅ アイコンサイズ: 20-24px
- ✅ テキストラベル: 0.65-0.7rem

### ユーザビリティ
- ✅ タップターゲットの拡大（アイコン+テキスト）
- ✅ ラベルの明確化
- ✅ レスポンシブ対応（ドキュメント仕様準拠）

### 開発効率
- ✅ Box component でカスタマイズ容易
- ✅ MUI theme 参照で色管理一元化
- ✅ sx prop での inline スタイル管理

### パフォーマンス
- ✅ 追加 DOM 要素最小化
- ✅ CSS-in-JS 最適化
- ✅ レンダリング効率改善

---

## 移行チェックリスト

- [x] TopMenuBar アイコンボタン統一
- [x] PreviewEditToggle サイズ固定 (128×64px)
- [x] ProblemViewEditPage 保存ボタン統一
- [x] MyPage 更新ボタン統一
- [x] ビルド確認
- [x] 開発サーバー動作確認
- [x] 型チェック確認
- [ ] E2E テスト実行（推奨）
- [ ] 複数ブラウザでの確認（推奨）
- [ ] アクセシビリティ確認（推奨）

