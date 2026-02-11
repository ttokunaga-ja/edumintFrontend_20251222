# Phase 8: 統合テスト実行ガイド

## 準備

### 1. 開発環境の確認
```bash
# ターミナルで開発サーバーが起動しているか確認
# http://localhost:5173 にアクセス可能か確認
```

### 2. ブラウザの準備
```
1. Chrome または Edge を開く
2. F12 を押して Developer Tools を開く
3. Console タブを選択
4. ログが見やすいように整理
```

### 3. テストアカウントの準備
- ログイン済みの状態で、ProblemViewEditPage（問題編集ページ）に遷移
- URL例：`http://localhost:5173/problem/[問題ID]/edit`

---

## テスト実行手順

### テスト 1: Edit モード切り替え

**目的**: Edit ボタン押下時に UI が即座に切り替わることを確認

**手順**:
```
1. ProblemViewEditPage に遷移
2. TopMenuBar を確認
   ├─ 現在のボタン：「View」（グレー）
   └─ 状態：SAVE ボタンは disabled
3. 「Edit」ボタンをクリック
4. コンソールで以下を確認：
   └─ "[ProblemViewEditPage] isEditMode changed: true"
5. UI を確認：
   ├─ 「Edit」ボタンが「Preview」に切り替わる（青/アクティブ）
   ├─ 質問ブロックに編集フォームが表示される
   └─ テキストエディタが表示される
```

**期待結果**:
```
✅ ボタンが即座に切り替わる（遅延なし）
✅ 編集フォームが表示される
✅ コンソールログが出力される
```

---

### テスト 2: 変更検出と SAVE ボタン有効化

**目的**: 変更を加えたときに SAVE ボタンが有効化されることを確認

**手順**:
```
1. Edit モードであることを確認
2. 質問のコンテンツ（エディタ）を編集
   └─ 例：文字を 1 文字追加
3. コンソールで以下を確認：
   └─ "[ProblemViewEditPage] hasChanges: true, isEditModeLocal: true"
4. TopMenuBar の SAVE ボタンを確認：
   └─ 現在：enabled（色が濃い/クリック可能）
5. テキストを Ctrl+Z で元に戻す
6. コンソールで以下を確認：
   └─ "[ProblemViewEditPage] hasChanges: false, isEditModeLocal: true"
7. TopMenuBar の SAVE ボタンを確認：
   └─ 現在：disabled（グレー）
```

**期待結果**:
```
✅ 変更あり → SAVE enabled
✅ 変更なし → SAVE disabled
✅ コンソールログが反応している
```

**デバッグ情報**:
- もし SAVE ボタンが enabled にならない場合：
  ```
  コンソールで console.log('[Debug]', { hasChanges, isEditModeLocal })
  を追加して値を確認
  ```

---

### テスト 3: トースト警告 UI の表示

**目的**: 未保存変更状態でナビゲーション試行時にトースト警告が表示されることを確認

**手順**:
```
1. Edit モードで何か変更を加えた状態
2. SAVE ボタン：enabled 状態を確認
3. TopMenuBar のロゴ（「EDUANIMA」）をクリック → ホームに遷移
4. コンソールで以下を確認：
   └─ "[TopMenuBar] handleNavigation: { path: '/', hasUnsavedChanges: true, isEditMode: true }"
5. 画面中央上部にトースト警告が表示されることを確認：
   ├─ テキスト：「未保存の変更があります。保存して移動しますか？」
   ├─ 背景色：ホワイト/ライトグレー（ブラウザデフォルト）
   ├─ 上部：primary 色（青）のボーダー
   └─ ボタン：3個（SAVE, UNSAVE, CANCEL）
6. ボタン色を確認：
   ├─ SAVE：primary 色（青）
   ├─ UNSAVE：error 色（赤）
   └─ CANCEL：グレー（normal）
```

**期待結果**:
```
✅ トースト警告が表示される
✅ 位置：画面上部中央（anchorOrigin: top, center）
✅ 色：ブラウザデフォルト + primary ボーダー
✅ ボタン色が統一されている
✅ ナビゲーションが一旦中止される
```

**デバッグ情報**:
- トースト警告が表示されない場合：
  ```
  1. hasUnsavedChanges が true か確認
  2. isEditMode が true か確認
  3. showWarningSnackbar が true にセットされているか確認
  ```

---

### テスト 4: SAVE ボタンの動作

**目的**: SAVE ボタン クリック → 保存実行 → ナビゲーション実行の流れを確認

**手順**:
```
1. トースト警告が表示されている状態
2. [SAVE] ボタンをクリック
3. コンソールで以下を確認：
   ├─ "[TopMenuBar] handleSaveAndNavigate: /"
   ├─ "[TopMenuBar] Executing onSave..."
   ├─ "[TopMenuBar] onSave completed" (数秒後)
   └─ 保存処理の詳細ログ（SubQuestionSection）
4. ボタンの状態を確認：
   ├─ クリック直後：disabled
   ├─ テキスト：「保存中...」に変更
   └─ 保存完了後：トースト自動閉じ
5. ページが遷移することを確認：
   └─ URL が変更（ホームに遷移）
```

**期待結果**:
```
✅ クリック時にボタン disabled
✅ テキストが「保存中...」に変更
✅ API 保存処理が実行される
✅ 保存完了後、ページが遷移
✅ トースト警告が自動的に閉じる
```

**パフォーマンス目安**:
- 保存処理時間：3 秒以内（API レスポンス次第）
- ナビゲーション：即座

---

### テスト 5: UNSAVE ボタンの動作

**目的**: UNSAVE ボタン クリック → 保存なし → ナビゲーション実行の流れを確認

**手順**:
```
1. Edit モードで何か変更を加えた状態
2. TopMenuBar で別ページへナビゲーション試行（例：ロゴクリック）
3. トースト警告が表示された状態
4. [UNSAVE] ボタンをクリック
5. コンソールで以下を確認：
   └─ "[TopMenuBar] handleNavigateWithoutSave: /"
6. 以下が実行されないことを確認：
   └─ "[TopMenuBar] Executing onSave..." が出力されない
7. ページが即座に遷移することを確認：
   └─ ナビゲーション遅延がない
8. 元のページに戻り、編集内容が破棄されていることを確認：
   └─ 再度 Edit モードにすると、データが初期状態に戻っている
```

**期待結果**:
```
✅ onSave が実行されない
✅ ナビゲーションが即座に実行
✅ トースト警告が閉じる
✅ 編集内容が破棄される（保存されない）
```

---

### テスト 6: CANCEL ボタンの動作

**目的**: CANCEL ボタン クリック → ナビゲーション中止 → 編集継続

**手順**:
```
1. Edit モードで何か変更を加えた状態
2. TopMenuBar で別ページへナビゲーション試行
3. トースト警告が表示された状態
4. [CANCEL] ボタンをクリック
5. コンソールで以下を確認：
   └─ "[TopMenuBar] handleCancelNavigation"
6. トースト警告が閉じることを確認
7. ページが ProblemViewEditPage のままであることを確認：
   ├─ URL が変更されない
   ├─ Edit モードが継続
   └─ 編集内容が保存されている
8. エディタで編集を続けることができることを確認
```

**期待結果**:
```
✅ トースト警告が閉じる
✅ ナビゲーションが実行されない
✅ ページが元のままで、編集を続行できる
✅ 編集内容が失われない
```

---

### テスト 7: Preview モード（変更なし）

**目的**: Preview（View）モードでは警告が表示されないことを確認

**手順**:
```
1. ProblemViewEditPage に遷移
2. 現在：Preview モード（「View」ボタン表示）
3. TopMenuBar でナビゲーション試行（例：ロゴクリック）
4. コンソールで以下を確認：
   └─ "[TopMenuBar] handleNavigation: { path: '/', hasUnsavedChanges: false, isEditMode: false }"
5. トースト警告が表示されないことを確認
6. ページが即座に遷移することを確認
```

**期待結果**:
```
✅ トースト警告が表示されない
✅ ページが即座に遷移
✅ hasUnsavedChanges: false
✅ isEditMode: false
```

---

### テスト 8: 複数質問の同時編集

**目的**: 複数の質問を編集し、SAVE で並列保存を確認

**手順**:
```
1. Edit モードで複数の質問が表示されていることを確認
2. 複数の質問のコンテンツを編集
   ├─ 質問 1：文字追加
   ├─ 質問 2：文字削除
   └─ 質問 3：文字変更
3. 各質問の hasChanges: true を確認
4. TopMenuBar の SAVE ボタンをクリック
5. コンソールで以下を確認：
   ├─ 複数の SubQuestion.save() が並列実行
   ├─ Promise.all() で全体完了を待機
   └─ すべての保存が完了
```

**期待結果**:
```
✅ 複数の質問が同時に編集可能
✅ SAVE クリック時に全質問が並列保存
✅ すべての保存が完了後、ナビゲーション実行
```

---

## トラブルシューティング

### 問題 1: Edit ボタンを押しても UI が変わらない

**確認項目**:
```
1. コンソールで "[ProblemViewEditPage] isEditMode changed: true" があるか
2. React DevTools で isEditModeLocal の値を確認
3. TopMenuBar で isEditMode が true に更新されているか確認
```

**原因と解決**:
```
原因：useEffect の依存配列が不足している
解決：src/pages/ProblemViewEditPage.tsx の以下を確認
  useEffect(() => {
    setIsEditModeLocal(isEditMode);  // ← isEditMode が依存配列に入っているか
  }, [isEditMode]);
```

---

### 問題 2: SAVE ボタンが常に disabled のまま

**確認項目**:
```
1. コンソールで "[ProblemViewEditPage] hasChanges: true" が出力されているか
2. isEditModeLocal が true か確認
3. editedExam !== exam か確認（JSON.stringify で比較）
```

**原因と解決**:
```
原因 1：isEditModeLocal が false のまま
  → テスト 1 を実行して、Edit モードが有効か確認

原因 2：JSON.stringify の比較が false を返す
  → コンソールで console.log(JSON.stringify(editedExam) === JSON.stringify(exam))
  → 同じオブジェクトを編集しているか確認

原因 3：hasChanges の useMemo の依存配列が不足
  → [exam, editedExam, isEditModeLocal] が入っているか確認
```

---

### 問題 3: トースト警告が表示されない

**確認項目**:
```
1. コンソールで "[TopMenuBar] handleNavigation:" が出力されているか
2. hasUnsavedChanges が true か
3. isEditMode が true か
4. showWarningSnackbar が true にセットされているか
```

**原因と解決**:
```
原因 1：hasUnsavedChanges が false
  → テスト 2 を実行して、hasChanges が true か確認

原因 2：isEditMode が false
  → テスト 1 を実行して、Edit モードが有効か確認

原因 3：showWarningSnackbar の Snackbar に bug
  → TopMenuBar.tsx の Snackbar コンポーネントを確認
  → open={showWarningSnackbar} が正しく設定されているか確認
```

---

### 問題 4: トースト警告の色/位置が異なる

**確認項目**:
```
1. TopMenuBar.tsx の Snackbar anchorOrigin を確認
   └─ {{ vertical: 'top', horizontal: 'center' }}
2. SnackbarContent の sx={backgroundColor} を確認
   └─ theme.palette.background.paper
3. ボタンの色設定を確認
   ├─ SAVE: color="primary"
   ├─ UNSAVE: color="error"
   └─ CANCEL: normal grey
```

---

## テスト完了後のチェックリスト

### 必須確認項目
- [ ] 全 8 つのテストシナリオが成功
- [ ] コンソールにエラーメッセージがない
- [ ] ナビゲーション/ページ遷移が正常
- [ ] データが正しく保存されている

### パフォーマンス確認
- [ ] SAVE ボタンクリック → 保存完了：3 秒以内
- [ ] Edit モード切り替え：遅延なし
- [ ] ページロード時間：2 秒以内

### UI/UX 確認
- [ ] トースト警告の表示位置が正確
- [ ] ボタン色が統一されている
- [ ] フォント・サイズが見やすい
- [ ] レスポンシブ対応（モバイルも確認）

---

## テスト完了！

すべてのテストが成功した場合：

```
✅ Phase 8: 統合テスト完了
📋 次のステップ：
   1. ドキュメント更新
   2. 他のページへの適用
   3. Phase 9: エラーハンドリング強化
```

---

## ログ出力リファレンス

### 期待されるログシーケンス（SAVE 実行時）

```javascript
// 1. Edit モード切り替え
[ProblemViewEditPage] isEditMode changed: true

// 2. コンテンツ編集
[ProblemViewEditPage] hasChanges: true, isEditModeLocal: true

// 3. ナビゲーション試行
[TopMenuBar] handleNavigation: { path: '/', hasUnsavedChanges: true, isEditMode: true }

// 4. SAVE ボタンクリック
[TopMenuBar] handleSaveAndNavigate: /
[TopMenuBar] Executing onSave...

// 5. SubQuestion 保存（複数並列）
[SubQuestionSection] handleSaveSubQuestion: SubQuestion ID...

// 6. 保存完了
[TopMenuBar] onSave completed

// 7. ページ遷移
(URL が変更される)
```

このログシーケンスが出力されれば、すべての機能が正常に動作しています。
