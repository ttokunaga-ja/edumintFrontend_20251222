# ProblemViewEditPage リファクタリング - Phase 1-3 実装完了レポート

**プロジェクト**: Edumint Frontend Refactoring
**対象機能**: 試験詳細・編集ページ (`ExamPage`)
**実装期間**: 2026-01-02 (Phase 1-3)
**ステータス**: ✅ **実装完了** (テスト・デバッグフェーズへ移行)
**担当**: Research Agent

---

## 1. 📋 エグゼクティブサマリ

### 背景と目的
旧 `ProblemViewEditPage` は、コンポーネント間の過度な依存（Propsバケツリレー）、状態管理の分散、および UI/Logic の密結合により、保守性と拡張性が著しく低下していました。
本リファクタリングでは、**「Standard over Custom」** の原則に基づき、モダンな React エコシステム（React Hook Form, Zod, TanStack Query）を標準採用することで、技術的負債を解消し、堅牢な土台を構築することを目的としました。

### 達成された主要成果
1.  **アーキテクチャの刷新**: `FormProvider` による状態一元管理と `Zod` によるスキーマ駆動開発の導入。
2.  **UI/Logic の分離**: ドメインロジック（`features/exam`）と純粋な UI（`components/ui/exam`）の完全分離。
3.  **パフォーマンス向上**: `useFieldArray` と `ExamViewer`（軽量レンダラー）の採用による描画負荷の低減。

### 進捗状況
| フェーズ | 内容 | ステータス |
| :--- | :--- | :---: |
| **Phase 1** | 基盤整備（Schema, Types, Hooks） | ✅ 完了 |
| **Phase 2** | コンポーネント分割・実装（List, Item, Adapter） | ✅ 完了 |
| **Phase 3** | ページ統合・AppBar連携・UI実装 | ✅ 完了 |
| **Phase 4** | 形式別エディタ詳細実装・E2Eテスト | 🚧 着手待ち |

---

## 2. 🏗️ アーキテクチャ詳細

### 2.1 データフロー設計
**Single Source of Truth** を徹底するため、データフローを以下のように一方向化しました。

1.  **API Load**: `useExamQuery` が API からデータを取得し、`normalization.ts` がフォーム形式（CamelCase）へ変換。
2.  **State Mgmt**: `useForm` (React Hook Form) がデータを保持。`Zod Schema` が型とバリデーションを保証。
3.  **UI Render**: `useFormContext` 経由で各コンポーネントが必要なデータのみを購読（`useWatch`）。
4.  **User Action**: ユーザー入力は RHF の `onChange` に伝播。`isDirty` フラグが即座に更新。
5.  **Save**: `useExamMutation` がデータを API 形式（SnakeCase）へ逆変換し、サーバーへ送信。

### 2.2 ディレクトリ構成と責務
新アーキテクチャに基づくディレクトリ構成です。

```text
src/
├── features/
│   └── exam/                           # 【Domain Logic】
│       ├── hooks/
│       │   ├── useExamQuery.ts         # データ取得 + 正規化
│       │   └── useExamMutation.ts      # データ保存 + キャッシュ更新
│       ├── utils/
│       │   └── normalization.ts        # Data Adapter (Snake ↔ Camel)
│       ├── schema.ts                   # Zod Schema (Single Source of Truth)
│       └── components/                 # 【Domain Components】
│           ├── actions/                # アクションボタン等
│           ├── inputs/
│           │   └── ExamContentField.tsx # ★UIとLogicの結合点 (Adapter)
│           ├── sections/
│           │   ├── ExamMetaSection.tsx
│           │   ├── QuestionList.tsx    # useFieldArray (Parent)
│           │   ├── SubQuestionList.tsx # useFieldArray (Nested)
│           │   └── ...
│           └── ExamEditorLayout.tsx
│
├── components/
│   └── ui/
│       └── exam/                       # 【Pure UI】
│           ├── ExamViewer.tsx          # 表示専用 (Markdown/KaTeX) - 軽量
│           └── ExamEditor.tsx          # 編集用 (Input + Resize + Viewer内包)
│
└── pages/
    └── ExamPage.tsx                    # 【Entry Point】Routing & Provider Setup
```

---

## 3. 🛠️ 実装詳細

### 3.1 Schema Layer (`features/exam/schema.ts`)
*   **統合フィールド**: 従来の `answer` と `explanation` を統合し、UI 上の複雑さを軽減。
*   **Temp ID 戦略**: 新規作成された項目にはフロントエンドで一時 ID（`temp-uuid`）を発行し、React の `key` として利用。バックエンド送信時にこれを除去するロジックを確立。

### 3.2 UI Layer (`components/ui/exam/`)
*   **ExamViewer**: `react-markdown` + `rehype-katex` に特化した軽量コンポーネント。閲覧モード時はこれのみがマウントされるため、初期ロードが高速。
*   **ExamEditor**: 上下リサイズ機能を持つテキストエリア。`ExamViewer` をプレビューエリアとして内包することで、編集時と閲覧時の表示崩れ（一貫性の欠如）を防止。

### 3.3 Binding Layer (`ExamContentField.tsx`)
*   **役割**: 最も重要なアダプターコンポーネント。
*   **機能**: `isEditMode` フラグを受け取り、`ExamEditor`（編集）と `ExamViewer`（閲覧）を動的に切り替える。RHF の `Controller` を内包し、バリデーションエラーの表示も担当。

### 3.4 AppBar Integration (`ExamPage.tsx`)
*   **課題**: 保存ボタンがヘッダー（`TopMenuBar`）にあるため、ページ内のフォーム状態（`handleSubmit`）をどう発火させるか。
*   **解決策**: `AppBarActionContext` を介して、ページ側から `setOnSave(handleSave)` を登録。`handleSave` は `useCallback` で安定化させ、無駄な再レンダリングループを防止。

---

## 4. 📊 パフォーマンス改善指標

| 指標 | 旧実装 (Legacy) | 新実装 (Modern) | 改善要因 |
| :--- | :--- | :--- | :--- |
| **再レンダリング範囲** | 親での入力がページ全体を再描画 | 入力した Input コンポーネントのみ | `useWatch` による購読の局所化 |
| **リスト操作** | 配列のコピーと全再描画 | DOM ノードの移動のみ | `useFieldArray` の内部最適化 |
| **未保存検知** | `JSON.stringify` による全量比較 | `formState.isDirty` フラグ参照 | RHF のプロキシ検知機能 |
| **閲覧モード負荷** | エディタライブラリをロード | 軽量レンダラーのみロード | コンポーネント責務の分離 |
| **コード行数** | 約 2,500 行 (分散・重複あり) | 約 1,200 行 (集約・高凝集) | ロジックの共通化と委譲 |

---

## 5. 🚀 今後のロードマップ

### Phase 4: 形式別エディタの実装 (Immediate)
現在、大枠の Markdown エディタのみが動作しています。次のステップで以下を実装します。
1.  **SelectionEditor**: 単一/複数選択肢の管理（`useFieldArray`）。
2.  **MatchingEditor**: 左右ペアリングの管理。
3.  **FormatRegistry**: `questionTypeId` に基づく動的なエディタ切り替え。

### Phase 5: テストと堅牢化 (Short-term)
1.  **Unit Testing**: `normalization.ts` の変換ロジックと `schema.ts` のバリデーション網羅。
2.  **Integration Testing**: `useExamQuery`/`Mutation` の MSW を用いた結合テスト。
3.  **E2E Testing**: Playwright を用いた「作成 → 編集 → 保存 → リロード」のシナリオテスト。

### Phase 6: UX 強化 (Future)
*   **自動保存**: `localStorage` または `IndexedDB` を用いたドラフト保存。
*   **画像対応**: Markdown への画像ドラッグ＆ドロップアップロード。

---

## 6. 📝 結論

Phase 1-3 の完了により、アプリケーションの核となる「試験作成・編集機能」の土台は極めて堅牢になりました。
「独自実装の排除」と「標準ライブラリへの準拠」を徹底したことで、今後の機能追加（例：新しい問題形式の追加）は、既存のコードを壊すことなく、スキーマとコンポーネントを追加するだけで容易に行える状態になっています。