# TopMenuBar.tsx 修正実装レポート
**日時:** 2024年12月22日  
**対象:** TopMenuBar, PreviewEditToggle コンポーネント、ProblemViewEditPage, MyPage  
**ステータス:** ✅ 完了

## 概要
TopMenuBar.tsx をドキュメント要件に基づいて修正し、以下の統一されたデザイン仕様を実装しました：

- **アイコンサイズ**: すべて 64×64px に統一
- **保存ボタン**: 64×64px （テキストラベル付き）
- **トグルボタン**: 128×64px （閲覧/編集アイコン）
- **絵文字**: 全廃止、アイコンとテキストラベルのみ使用

---

## 修正対象ファイル

### 1. [src/components/common/TopMenuBar.tsx](src/components/common/TopMenuBar.tsx)

#### 修正内容

**右側メニューグループの再実装:**

| 項目 | サイズ | スタイル | テキストラベル |
|:--:|:--:|:--:|:--:|
| 問題作成ボタン（＋） | 64×64px | アイコン + テキスト | 「作成」 |
| 通知アイコン | 64×64px | アイコン + テキスト | 「通知」 |
| ユーザーアバター | 64×64px | アバター + テキスト | ユーザー名（頭文字） |
| ログイン/新規登録 | 64×64px | テキストボタン | 「ログイン」「新規登録」 |

**レスポンシブ表示ルール:** ドキュメント C_0_Page_REQUIREMENTS.md に従い、編集ボタン有無で分岐

```tsx
// レスポンシブ表示パターン（編集ボタンなし）
- 640px+: ＋ / 通知 / アバター 表示
- 576-640px: 通知 / アバター 表示
- 512-576px: アバター のみ表示
- 448-512px: 非表示

// レスポンシブ表示パターン（編集ボタンあり）
- 832px+: ＋ / 通知 / アバター 表示
- 768-832px: 通知 / アバター 表示
- 704-768px: アバター のみ表示
- 448-704px: 非表示
```

**主要な修正:**
- 全アイコンボタン: 64×64px に統一
- アイコン: fontSize 24 または 20 に削減（絵文字サイズ対応）
- テキストラベル: 各ボタンに 0.65rem フォントサイズで追加
- 矢印方向: flexDirection: 'column' で縦方向配置
- スペーシング: gap: 0.25 で密接なアイコン・テキスト関係を形成

---

### 2. [src/components/common/PreviewEditToggle.tsx](src/components/common/PreviewEditToggle.tsx)

#### 修正内容

**トグルボタングループの完全再実装:**

```tsx
// 新仕様
- 幅: 128px
- 高さ: 64px
- ボタン数: 2個（閲覧 / 編集）
- 各ボタン: 64×64px
- アイコン: 20px （テキストなし）
- ラベル: 右側に「編集」「閲覧」を表示
```

**主要な修正:**
- ToggleButtonGroup: width 128, height 64 に固定
- 各 ToggleButton: width 50%, height 100%, p: 0 で内部スペース削除
- アイコンのみ表示: 絵文字なし、テキストラベルは外側に配置
- 右側ラベル: Typography で「編集」「閲覧」を表示
- ホバー状態: backgroundColor, color を明示的に設定

---

### 3. [src/pages/ProblemViewEditPage.tsx](src/pages/ProblemViewEditPage.tsx)

#### 修正内容

**保存ボタンの再実装:**

- 従来: MUI Button コンポーネント（可変幅）
- **新規**: カスタム Box コンポーネント（64×64px固定）

```tsx
<Box
  component="button"
  onClick={handleSave}
  disabled={isSaving || !hasChanges}
  sx={{
    width: 64,
    height: 64,
    p: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.25,
    // ... スタイル
  }}
>
  <SaveIcon sx={{ fontSize: 20 }} />
  <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
    {isSaving ? '中' : '保存'}
  </Typography>
</Box>
```

**主要な修正:**
- Button → Box component に変更（より柔軟なカスタマイズ）
- サイズ: 64×64px に固定
- インポート追加: Typography を MUI material から追加
- ボタンテキスト: 「保存」「保存中...」→ 「保存」「中」に短縮

---

### 4. [src/pages/MyPage.tsx](src/pages/MyPage.tsx)

#### 修正内容

**プロフィール編集の「内容を更新」ボタンの再実装:**

```tsx
<Box
  component="button"
  onClick={handleSaveProfile}
  sx={{
    width: 64,
    height: 64,
    // ... スタイル（ProblemViewEditPage と同じ）
  }}
>
  <SaveIcon sx={{ fontSize: 20 }} />
  <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
    更新
  </Typography>
</Box>
```

**主要な修正:**
- Button → Box component に変更
- サイズ: 64×64px に統一
- テキスト: 「内容を更新」→ 「更新」に短縮
- スタイル: ProblemViewEditPage の保存ボタンと同じ仕様

---

## デザイン仕様の統一

### アイコンサイズ規格
| 要素 | サイズ | 用途 |
|:--:|:--:|:--:|
| ハンバーガーメニュー | 64×64px | ナビゲーション |
| ロゴ | 196px | 左側スペース確保 |
| 検索ボックス | 196px以上 | 中央メインコンテンツ |
| アクションボタン群 | 64×64px | 保存、問題作成、通知 |
| トグルボタン | 128×64px | 編集/閲覧切替 |

### テキストラベルルール
```
- フォントサイズ: 0.65rem（アイコンボタン）、0.7rem（トグルボタン）
- フォントウェイト: 600（bold）
- 配置: アイコン下部（flexDirection: 'column'）
- カラー: theme.palette.text.secondary
```

### レスポンシブブレークポイント（編集ボタン有無で分岐）
```
No Edit Actions:          With Edit Actions:
640px+: ＋/通/ア            832px+: ＋/通/ア
576-640px: 通/ア           768-832px: 通/ア
512-576px: ア              704-768px: ア
<512px: なし               <704px: なし
```

---

## テスト検証

### ビルド確認
```
✓ build/index.html
✓ 全 12,240 modules transformed
✓ ビルド時間: 2m 49s
✓ エラーなし（MyPage の既存型エラーのみ）
```

### 開発サーバー動作確認
```
✓ npm run dev 起動成功
✓ http://localhost:5173 でアクセス可能
```

### ファイルの型チェック
```
✓ TopMenuBar.tsx - エラーなし
✓ PreviewEditToggle.tsx - エラーなし
✓ ProblemViewEditPage.tsx - エラーなし
✓ MyPage.tsx - 既存の型エラーのみ（修正対象外）
```

---

## 変更サマリー

### 新規追加
- アイコンボタンへの統一テキストラベル表示
- 128×64px トグルボタングループ
- 64×64px カスタム保存ボタン

### 削除・変更
- 絵文字フォントサイズ（28px → 20-24px）
- ボタングループの間隔（spacing: 1 → spacing: 0.5）
- Button → Box component への移行（保存ボタン）

### 互換性
- ✅ 既存のプロップインターフェース変更なし
- ✅ AppBarActionContext との統合継続
- ✅ レスポンシブ表示ルールの遵守
- ✅ MUI v6 コンポーネント仕様に完全準拠

---

## 関連ドキュメント参照

- [C_0_Page_REQUIREMENTS.md](docs/C_Page_REQUIREMENTS/C_0_Page_REQUIREMENTS.md) - トップメニュー仕様
- [C_3_ProblemViewEditPage_REQUIREMENTS.md](docs/C_Page_REQUIREMENTS/C_3_ProblemViewEditPage_REQUIREMENTS.md) - 問題編集ページ仕様
- [S_UI_DESIGN_GUIDE.md](docs/S_UI_DESIGN_GUIDE.md) - UI デザインガイド

---

## 次ステップ（推奨）

1. **E2E テスト**: Playwright でレスポンシブ表示確認
2. **UI テスト**: Vitest でコンポーネント動作確認
3. **スナップショットテスト**: 複数ブレークポイントでの表示確認
4. **アクセシビリティテスト**: キーボード操作、スクリーンリーダー対応確認

---

## 実装者記録

- **実装日時**: 2024-12-22
- **修正ファイル数**: 4
- **修正行数**: 約 100 行
- **ビルド状態**: ✅ 成功

