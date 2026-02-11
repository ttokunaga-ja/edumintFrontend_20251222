# ProblemViewEditPage（試験編集・閲覧ページ）完全設計ドキュメント

**作成日**: 2026年1月2日  
**対象チーム**: フロントエンド開発者（ProblemViewEditPage のリファクタリング担当者）  
**目的**: 既存アーキテクチャ規約に準拠した新しい試験編集ページの実装ガイド

---

## 📚 ドキュメント目次

### 1. アーキテクチャ・設計（メイン）
**ファイル**: [PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md](./PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md)

**内容**:
- 現状の課題分析（現実装の構造、問題点）
- 新設計の方針（Form Context Pattern、useFieldArray、Zod Schema）
- Zod スキーマ完全定義（親子孫の全スキーマ）
- コンポーネント実装例（ページ層～形式別エディタ）
- Hooks 実装例（useExamQuery、useExamMutation）
- マイグレーションチェックリスト（5フェーズ）
- 既存実装との差分表（旧→新の比較）
- パフォーマンス予想、拡張性

**対象読者**: 
- アーキテクチャ全体を理解したい設計者
- コンポーネント実装の参考例が必要な開発者

**読了目安**: 30-45分

---

### 2. DB & API 仕様書
**ファイル**: [PROBLEMVIEWEDITPAGE_DB_API_SPEC.md](./PROBLEMVIEWEDITPAGE_DB_API_SPEC.md)

**内容**:
- DB スキーマ設計（11テーブル完全定義）
  - exams, questions, sub_questions
  - 形式別テーブル（selection, matching, ordering, essay）
  - keywords, sub_question_keywords
- テーブル関係図・カラム定義・制約ルール
- API エンドポイント仕様（REST）
  - `GET /api/exams/:id` - 詳細取得
  - `PUT /api/exams/:id` - 全体更新
  - `PUT /api/sub-questions/:id/*` - 形式別更新
  - キーワード操作エンドポイント
- エラーハンドリング & HTTP ステータスコード
- バリデーション・ビジネスロジック（フロント・バック二重検証）
- 認可・セキュリティ設計
- パフォーマンス最適化（インデックス、キャッシング、ページング）
- マイグレーション SQL（参考）

**対象読者**:
- バックエンド開発者（API実装担当）
- DB 設計者
- インフラ・DBA

**読了目安**: 40-50分

---

### 3. 実装前提条件・非機能要件ガイド
**ファイル**: [PROBLEMVIEWEDITPAGE_PREREQUISITES.md](./PROBLEMVIEWEDITPAGE_PREREQUISITES.md)

**内容**:
- 実装前提条件（環境・依存ライブラリ チェック）
- アーキテクチャ理解度チェック（FormProvider, useFieldArray, Zod等）
- 既存コンポーネント・状態の扱い
- 開発環境セットアップ
- 非機能要件（パフォーマンス、スケーラビリティ、アクセシビリティ、セキュリティ）
- ディレクトリ作成チェックリスト
- 実装の進め方（5フェーズ分割）
- コード記述ガイドライン（ファイル構成、命名規則、Type Safety）
- よくある実装エラー & 対策
- テストシナリオ（ユニット・統合・E2E）
- デバッグ・トラブルシューティング
- リリースチェックリスト
- サポート・リソース

**対象読者**:
- フロントエンド開発者（実装者）
- テスト担当者
- QA エンジニア

**読了目安**: 60分

---

## 🎯 読み方ガイド（役割別）

### 👨‍💼 プロジェクトマネージャー向け
1. [PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md](./PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md) - 「現状の課題」セクション
2. [PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md](./PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md) - 「マイグレーションチェックリスト」セクション（スケジュール参考）
3. [PROBLEMVIEWEDITPAGE_PREREQUISITES.md](./PROBLEMVIEWEDITPAGE_PREREQUISITES.md) - 「実装の進め方」セクション

**読了目安**: 15-20分

---

### 🏗️ バックエンド開発者（API実装担当）向け
1. [PROBLEMVIEWEDITPAGE_DB_API_SPEC.md](./PROBLEMVIEWEDITPAGE_DB_API_SPEC.md) - **全セクション**
2. [PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md](./PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md) - 「3. データスキーマ設計」セクション
3. [PROBLEMVIEWEDITPAGE_PREREQUISITES.md](./PROBLEMVIEWEDITPAGE_PREREQUISITES.md) - 「4. よくある実装エラー」（参考）

**読了目安**: 90分

**アクション**:
- [ ] DB マイグレーション SQL の準備
- [ ] API エンドポイント実装
- [ ] バリデーション・ビジネスロジック実装
- [ ] テストケース作成

---

### 👨‍💻 フロントエンド開発者（実装担当）向け
1. [PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md](./PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md) - **全セクション**
2. [PROBLEMVIEWEDITPAGE_PREREQUISITES.md](./PROBLEMVIEWEDITPAGE_PREREQUISITES.md) - **全セクション**
3. [F_ARCHITECTURE.md](./F_ARCHITECTURE.md) - アーキテクチャ規約確認
4. [PROBLEMVIEWEDITPAGE_DB_API_SPEC.md](./PROBLEMVIEWEDITPAGE_DB_API_SPEC.md) - 「API エンドポイント仕様」セクション

**読了目安**: 120分

**アクション**:
- [ ] 環境構築確認（依存ライブラリ）
- [ ] schema.ts 作成
- [ ] Hooks 作成（useExamQuery, useExamMutation）
- [ ] コンポーネント実装（5フェーズ）
- [ ] テスト作成
- [ ] レビュー＆マージ

---

### 🧪 テスト・QA 担当者向け
1. [PROBLEMVIEWEDITPAGE_PREREQUISITES.md](./PROBLEMVIEWEDITPAGE_PREREQUISITES.md) - 「テストシナリオ」セクション
2. [PROBLEMVIEWEDITPAGE_PREREQUISITES.md](./PROBLEMVIEWEDITPAGE_PREREQUISITES.md) - 「リリースチェックリスト」セクション
3. [PROBLEMVIEWEDITPAGE_DB_API_SPEC.md](./PROBLEMVIEWEDITPAGE_DB_API_SPEC.md) - 「バリデーション・ビジネスロジック」セクション

**読了目安**: 45分

**アクション**:
- [ ] テストシナリオ実装
- [ ] E2E テスト作成（Playwright）
- [ ] 各問題形式でのテスト実行
- [ ] パフォーマンス測定
- [ ] アクセシビリティ測定

---

## 📋 全体スケジュール例

| フェーズ | タスク | 期間 | 人員 |
|---------|--------|------|------|
| Phase 0 | 設計レビュー & 環境構築 | 1日 | 全員 |
| Phase 1 | 基盤整備（Schema, Hooks） | 1-2日 | FE 1名 |
| Phase 2 | コンポーネント実装 | 2-3日 | FE 2名 |
| Phase 3 | 形式別エディタ実装 | 2日 | FE 1名 |
| Phase 4 | ページ層・統合 | 1日 | FE 1名 |
| Phase 5 | テスト・デバッグ | 2日 | FE 1名 + QA 1名 |
| Phase 6 | API 実装（並行） | 3-4日 | BE 1-2名 |
| Phase 7 | 統合テスト | 1日 | FE + BE + QA |
| Phase 8 | リリース準備 | 1日 | 全員 |

**合計期間**: 約 2-3週間（規模・チーム構成による）

---

## 🔄 関連するドキュメント

### アーキテクチャ規約
- [F_ARCHITECTURE.md](./F_ARCHITECTURE.md) - このプロジェクト全体のアーキテクチャ規約
  - Pages, Components, Features, Services の役割分離
  - ディレクトリ構成、ライブラリ制約
  - Standard over Custom の原則

### 既存実装ドキュメント（参考）
- [EDITOR_PREVIEW_PANEL_IMPLEMENTATION_REPORT.md](./EDITOR_PREVIEW_PANEL_IMPLEMENTATION_REPORT.md) - 既存の Markdown エディタ実装
- [FEATURES_LAYER_IMPLEMENTATION_COMPLETE_20260101.md](./FEATURES_LAYER_IMPLEMENTATION_COMPLETE_20260101.md) - Features 層の実装パターン
- [PHASE_3_COMPLETION_REPORT.md](./PHASE_3_COMPLETION_REPORT.md) - 過去のリファクタリング事例

---

## 🚀 クイックスタート

### Step 1: ドキュメント読了
- [ ] このファイルを読了
- [ ] [PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md](./PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md) を読了（30-45分）
- [ ] [PROBLEMVIEWEDITPAGE_PREREQUISITES.md](./PROBLEMVIEWEDITPAGE_PREREQUISITES.md) を読了（60分）

### Step 2: 環境構築
```bash
# 依存関係確認
pnpm ls --depth=0 | grep -E "react|zod|react-hook-form|@tanstack|@mui"

# TypeScript チェック
pnpm typecheck

# 開発サーバー起動
pnpm dev
```

### Step 3: ブランチ作成＆実装開始
```bash
# フィーチャーブランチ作成
git checkout -b feat/examPage-refactor

# Phase 1: Schema 作成
touch src/features/exam/schema.ts
touch src/features/exam/hooks/useExamQuery.ts
touch src/features/exam/hooks/useExamMutation.ts

# テスト
pnpm test
```

### Step 4: レビュー＆マージ
```bash
# コミット
git add .
git commit -m "feat: refactor ProblemViewEditPage with Form Context Pattern"

# PR 作成
# → レビューワー: アーキテクチャ責任者
# → チェックリスト確認
```

---

## ❓ よくある質問

### Q1: 既存の SubQuestionBlock との違いは？

**A**: 大きな違いは以下：

| 観点 | 既存 (SubQuestionBlock) | 新設計 |
|------|-----|-----|
| 状態管理 | 各ブロック独立 + Ref で save() 呼び出し | FormProvider で一元化 |
| 保存タイミング | 個別保存（複数回の API呼び出し） | 全体で一度（トランザクション的） |
| Propsフロー | 複数レイヤーのバケツリレー | useFormContext で直接アクセス |
| 検証方法 | validateSubQuestion 関数 | Zod Schema（型安全） |

詳細は [PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md](./PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md) - 「現状の課題分析」を参照。

---

### Q2: Zod Schema の学習時間は？

**A**: React Hook Form + Zod は以下で学習可能：

- **基礎**: 30分 (公式チュートリアル)
- **実装**: 1-2時間 (このドキュメントの schema.ts セクション参照)
- **応用**: 随時（ドキュメント参照）

参考リンク:
- https://react-hook-form.com/form-builder
- https://zod.dev/

---

### Q3: テスト対応は必須か？

**A**: はい。以下のテストは必須：

- **ユニットテスト** (schema バリデーション): 1-2時間
- **統合テスト** (コンポーネント): 2-3時間
- **E2E テスト** (保存フロー): 2時間

詳細は [PROBLEMVIEWEDITPAGE_PREREQUISITES.md](./PROBLEMVIEWEDITPAGE_PREREQUISITES.md) - 「テストシナリオ」を参照。

---

### Q4: 既存の試験データ（API）との互換性は？

**A**: 互換性を保ちます：

- 既存 API エンドポイント (`GET /exams/:id` 等) はそのまま使用可能
- Zod Schema で自動的に normalize（正規化）
- 新フロント ← → 既存バック API でも動作

詳細は [PROBLEMVIEWEDITPAGE_DB_API_SPEC.md](./PROBLEMVIEWEDITPAGE_DB_API_SPEC.md) - 「API エンドポイント仕様」を参照。

---

### Q5: モバイル対応は？

**A**: MUI v6 はレスポンシブ対応済み：

```typescript
// sx prop でレスポンシブスタイリング
sx={{
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' }, // xs: 375px-, md: 960px-
  gap: 2,
}}
```

詳細は [F_ARCHITECTURE.md](./F_ARCHITECTURE.md) - 「MUI Standardization」を参照。

---

## 📞 サポート＆連絡先

### 質問・相談
- **Slack**: #eduanima-frontend チャネル
- **GitHub Issues**: `[QUESTION] ProblemViewEditPage: ...` ラベル
- **対面**: 週 1 回設計レビュー会議

### バグ報告
- **GitHub Issues**: `[BUG] ProblemViewEditPage: ...` ラベル
- **内容**: エラーメッセージ + 再現手順 + スクリーンショット

---

## 📝 変更履歴

| 日時 | 版 | 変更内容 |
|------|----|----|
| 2026-01-02 | 1.0 | 初版作成（3ドキュメント統合） |

---

## ✅ 確認チェックリスト（実装前）

実装を開始する前に、以下をすべて確認してください：

- [ ] このドキュメント（目次）を読了
- [ ] [PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md](./PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md) を全読
- [ ] [PROBLEMVIEWEDITPAGE_PREREQUISITES.md](./PROBLEMVIEWEDITPAGE_PREREQUISITES.md) を全読
- [ ] [F_ARCHITECTURE.md](./F_ARCHITECTURE.md) で アーキテクチャ規約を確認
- [ ] React Hook Form, Zod の基礎を理解している
- [ ] npm/pnpm で依存ライブラリをインストール済み
- [ ] TypeScript strict mode を確認
- [ ] 開発サーバーが起動する
- [ ] ブランチを作成した
- [ ] レビュワー / ステークホルダーに通知した

すべてのチェックが完了したら、[PROBLEMVIEWEDITPAGE_PREREQUISITES.md](./PROBLEMVIEWEDITPAGE_PREREQUISITES.md) の「実装の進め方」セクションに従って Phase 1 を開始してください。

---

**Happy coding! 🚀**

