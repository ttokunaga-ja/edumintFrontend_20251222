## U_REFACTOR_REQUIREMENTS

目的: `ProblemViewEditPage` と関連 UI を、小問タイプ毎のプラグイン的な設計にリファクタするための要件定義書。

1) 背景
- DB の `question_types`（`docs/database.md` 3.4節）に示された問題タイプ別に、表示と編集のロジックを分離する。
- Moodle の `question/type/*` を設計参考に、フロント側で `ProblemTypeRegistry` を持ち、タイプ毎に `View` と `Edit` を登録する。

2) 主要ゴール
- 表示（View）と編集（Edit）をタイプ別に分離し、拡張しやすい構造にする。
- 既存 UX を壊さずに段階的に移行できること。

3) 仕様（必須）
- **型定義**: `src/types/problemTypes.ts` に `ProblemTypeViewProps`, `ProblemTypeEditProps`, `ProblemTypeRegistration` を用意すること。
- **レジストリ**: `src/components/problemTypes/ProblemTypeRegistry.tsx` を実装し、`registerProblemType(entry)` / `getProblemTypeView(id)` / `getProblemTypeEdit(id)` を提供すること。
- **表示コンポーネント**: 次の View を実装すること（最低限 view）:
  - ID 1: `FreeTextView`（記述式）
  - ID 2: `MultipleChoiceView`（選択式）
  - ID 4: `ClozeView`（穴埋め）
  - ID 5: `TrueFalseView`（正誤）
  - ID 6: `NumericView`（数値計算）
  - ID 7: `ProofView`（証明/論述）
  - ID 8: `ProgrammingView`（プログラミング）
  - ID 9: `CodeReadingView`（コード読解）
- **編集コンポーネント（編集側）**: 各タイプは `*Edit.tsx` を実装し、`ProblemTypeEditProps` に従って `onQuestionChange/onAnswerChange` を呼ぶこと。
- **委譲**: `SubQuestionBlock.tsx` は view のレンダリングを `ProblemTypeRegistry` に委譲済（追加のエラーフォールバックを実装すること）。
- **動的 import**: Edit コンポーネントは dynamic import で遅延ロードすること（Vite での最適化を考慮）。

4) API（サーバ ↔ クライアント）
- フロントは `sub_questions` インスタンスを次の最小構造で扱うこと:
  - `id`, `sub_question_number`, `sub_question_type_id`, `question_format`, `question_content`, `options?`, `answer_content?`。
- `options` は選択肢用に `{id, content, isCorrect}` を想定。

5) テスト要件
- 各 View の snapshot テスト（`vitest`）
- Edit コンポーネントの操作テスト（入力→onChange 呼び出し）
- Storybook ストーリーを追加すること（UI確認用）

6) セキュリティ要件（ID 8/9 特有）
- プログラム実行はサーバ側のサンドボックス（Jobe/CodeRunner など）を想定。フロント側ではコードを直接評価しないこと。
- 実行結果の受け取りは非同期ジョブで、タイムアウト・リソース制限・返却ログを厳格に扱う。

7) マイグレーション / 互換性
- 既存の `ProblemEditor` が扱っていた保存フロー（`useExamEditor`）を再利用しつつ、問題ペイロードに `sub_question_type_id` / `options` を含める。サーバ側が未対応なら `backend-contract` タスクを作成して調整する。

8) 開発者向け受け入れ基準
- 表示: `ProblemViewEditPage` の表示モードで、各小問が対応する `*View` でレンダリングされること。
- 編集: 編集モードで `*Edit` が呼ばれ、編集 → 保存 → `useExamEditor.updateExam()` が呼ばれること。
- CI: `npm run build` と `npm run test` をローカルで通す。Storybook を用意していることが望ましい。

9) PR チェックリスト（レビュワー）
- 変更は小さなコミットに分かれているか。
- 型定義が追加され、影響範囲が明記されているか。
- dynamic import によりバンドルサイズの異常増加が無いか。
- ID 8/9 の実行に関する安全設計が別途提出されているか。

10) 付録 — Phebe 向けタスク分割（短いコマンド・ファイル指定付き）
- Task A — frontend-registry (担当: A, 1d)
  - 変更: `src/types/problemTypes.ts`, `src/components/problemTypes/ProblemTypeRegistry.tsx`
  - 受け入れ: registry が `registerProblemType` と `getProblemTypeView` を提供していること。`registerDefaults()` の骨子を作る。

- Task B — frontend-views-core (担当: B, 1-2d)
  - 変更: `src/components/problemTypes/FreeTextView.tsx`, `MultipleChoiceView.tsx`
  - 受け入れ: snapshot テスト 1 件ずつ。

- Task C — frontend-edit-wiring (担当: C, 2-3d)
  - 変更: `src/components/page/ProblemViewEditPage/ProblemEditor.tsx`, dynamic import の追加
  - 受け入れ: 編集モードで edit コンポーネントがロードされること。

- Task D — frontend-views-rest (担当: D, 2-3d)
  - 変更: Cloze/TrueFalse/Numeric/Proof/Programming/CodeReading の view 実装

- Task E — tests-storybook (担当: E, 1-2d)
  - 変更: `stories` と `vitest` のテスト追加

- Task F — backend-contract (担当: F, 1-2d)
  - 作業: API スキーマ（sample JSON）を `docs/backend_question_schema.md` で定義し、サーバチームと合意する

- Task G — sandbox (担当: G, 3-7d)
  - 作業: Jobe/CodeRunner 統合仕様書作成（運用・監視・コスト想定）

以上。
# Docker Containerization Requirements (Requirements Definition)

## 1. Project Overview
The goal is to containerize the existing React/Vite frontend application (`edumintFrontend_20251222`) using Docker. This will ensure a consistent development environment across different machines and simplify the deployment process.

## 2. Technical Requirements

### 2.1. Base Image & Environment
- **Node.js**: Use version **node:24.12.0-alpine**.
- **OS**: Alpine Linux.
- **Package Manager**: NPM.
- **React**: Maintain or use **v18.x** (Current project status).
- **Vite**: Use the latest stable version (**v7.x** or **v6.x** depending on compatibility with React 18).

### 2.2. Dockerfile Design
- **Multi-Stage Build**:
  - **Stage 1 (Base/Deps)**: Install dependencies.
  - **Stage 2 (Development)**: optimized for local development with hot-reloading.
  - **Stage 3 (Builder)**: Create production build (`npm run build`).
  - **Stage 4 (Production)**: Serve static files using a lightweight server component (e.g., Nginx or a lightweight Node server), though for this immediate requirement, **Development focus** is priority.
- **Working Directory**: `/app`.

### 2.3. Orchestration (Docker Compose)
- Create a `docker-compose.yml` to manage the service.
- **Service Name**: `frontend` (or `edumint-web`).
- **Network**: Define a default bridge network.
- **Ports**: Expose the Vite default port (5173) to the host (e.g., `5173:5173`).
- **Volumes**:
  - **Bind Mount**: Mount the local project directory to `/app` in the container to enable Hot Module Replacement (HMR).
  - **Anonymous Volume**: Mount `/app/node_modules` to prevent the host's `node_modules` from interfering with the container's Linux-native modules.

### 2.4. Configuration Management
- **.dockerignore**: Properly exclude files to keep the build context light and secure (`node_modules`, `.git`, `.env*`, `dist`, coverage reports).
- **Environment Variables**: Support injection of environment variables via `.env` file or docker-compose `environment` section.

## 3. Success Criteria
1.  **Build Success**: `docker-compose build` completes without errors.
2.  **Run Success**: `docker-compose up` starts the container and the Vite dev server.
3.  **Accessibility**: The application is accessible via browser at `http://localhost:5173`.
4.  **Hot Reloading**: Modifying a source file (e.g., a `.tsx` component) locally immediately updates the running application in the browser.
