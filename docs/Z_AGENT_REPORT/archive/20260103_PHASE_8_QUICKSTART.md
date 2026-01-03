# Phase 8: 統合テスト実行ガイド - クイックスタート

## 🎯 目標

ProblemViewEditPage での以下を確認：
1. ✅ Edit/View モード切り替え
2. ✅ 変更検出と SAVE ボタン有効化
3. ✅ トースト警告 UI の表示と動作
4. ✅ SAVE/UNSAVE/CANCEL ボタンの機能

---

## ⚡ クイックテスト（5 分）

### ステップ 1: Edit モード切り替え
```
1. ProblemViewEditPage に遷移
2. TopMenuBar で "Edit" ボタンをクリック
   → 編集フォームが表示されるか？ ✅ 
```

### ステップ 2: 変更検出
```
1. エディタでテキストを編集（1 文字追加）
2. TopMenuBar の SAVE ボタンが enabled か？ ✅ / ❌
3. Ctrl+Z で元に戻す
4. SAVE ボタンが disabled に戻ったか？ ✅ / ❌
```

### ステップ 3: トースト警告
```
1. テキストを編集
2. TopMenuBar のロゴをクリック（ホームへ遷移）
3. トースト警告が表示されたか？ ✅ / ❌
   - 位置：上部中央？
   - ボタン：3 個表示？
   - 色：SAVE(blue), UNSAVE(red), CANCEL(grey)?
```

### ステップ 4: SAVE 実行
```
1. トースト警告の [SAVE] ボタンをクリック
2. ボタンが disabled → テキスト「保存中...」？ ✅ / ❌
3. 保存完了後、ホームに遷移したか？ ✅ / ❌
```

---

## 📋 詳細テストドキュメント

以下のドキュメントを参照：

- **PHASE_8_INTEGRATION_TEST_PLAN.md**
  - 8 つの詳細テストシナリオ
  - 期待結果と確認項目

- **PHASE_8_TEST_EXECUTION_GUIDE.md**
  - ステップバイステップの実行手順
  - トラブルシューティング
  - ログ出力リファレンス

- **PHASE_8_TEST_REPORT_TEMPLATE.md**
  - テスト結果レポートテンプレート
  - 問題報告フォーム
  - パフォーマンス測定表

---

## 🔍 デバッグ情報

### コンソールで確認できるログ

```javascript
// Edit モード切り替え
[ProblemViewEditPage] isEditMode changed: true

// 変更検出
[ProblemViewEditPage] hasChanges: true, isEditModeLocal: true

// ナビゲーション試行
[TopMenuBar] handleNavigation: { path: '/', hasUnsavedChanges: true, isEditMode: true }

// SAVE ボタンクリック
[TopMenuBar] handleSaveAndNavigate: /
[TopMenuBar] Executing onSave...
[TopMenuBar] onSave completed
```

### ブラウザコンソール開き方
- Windows/Linux: `F12`
- macOS: `Cmd + Option + I`
- Console タブで上記ログを確認

---

## ✅ テスト完了チェック

すべてのテストが ✅ になったら：

```
1. ドキュメントの PHASE_8_TEST_REPORT_TEMPLATE.md に結果を記入
2. 問題がある場合：GitHub Issues に登録
3. 問題がない場合：Phase 9 へ進行
```

---

## 🚀 次のステップ（Phase 9）

- エラーハンドリングの強化
- 自動保存機能の実装
- 競合検出と解決
- 他のページへの適用

---

## 📞 問題が発生した場合

1. **PHASE_8_TEST_EXECUTION_GUIDE.md** のトラブルシューティングセクションを確認
2. コンソールログを確認
3. GitHub Issues で報告

---

**Ready to test? Let's go! 🎉**
