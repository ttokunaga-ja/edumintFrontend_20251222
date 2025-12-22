# O_TASK_PHASES

目的: `ProblemViewEditPage` を小問タイプ毎に責務分離し、拡張性・保守性・テスト性を向上させるための工程表。

前提: フロントエンドは React + TypeScript。バックエンドは既存 API を維持。Moodle 等の OSS を参考に「タイプ別プラグイン」アーキテクチャを採用する。

フェーズ 0 — 準備（1 日）
- 既存の `sub_questions` JSON スキーマを確認し、`sub_question_type_id` / `options` / `answer_content` の有無を検証する。
- 現行 `ProblemViewEditPage` / `SubQuestionBlock` の動作確認（手動）と軽微な読み取りリファクタ（表示のみ委譲済）。

フェーズ 1 — 基盤実装（1-2 日）
- 目的: `ProblemTypeRegistry` を確定し、`registerProblemType(id, loader)` / `getProblemTypeView(typeId)` を提供する。
- 出力: `src/components/problemTypes/ProblemTypeRegistry.tsx`

フェーズ 2 — View コンポーネント群（2-4 日）
- 目的: `question_types` の各 ID（1,2,4,5,6,7,8,9）に対応する View コンポーネントを作成。
- 出力: `src/components/problemTypes/{FreeText,MultipleChoice,Cloze,TrueFalse,Numeric,Proof,Programming,CodeReading}View.tsx`

フェーズ 3 — Edit コンポーネント群（3-6 日、並列可）
- 目的: 各タイプの `Edit` コンポーネントを実装し、`ProblemEditor` から動的に切り替えられるようにする。
- 出力: `src/components/problemTypes/*Edit.tsx`、registry に edit 登録

フェーズ 4 — 動的ロード & パフォーマンス最適化（1-2 日）
- 目的: Vite の dynamic import を利用して初期バンドルを軽量化。多問問題では virtualization の検討。

フェーズ 5 — テスト・Storybook・CI（2-4 日）
- 目的: 各 View/Edit のユニットテスト、Storybook ストーリーを作成。`vitest` を用いた重要な操作の E2E ライクなテスト追加。

フェーズ 6 — バックエンド契約 & 運用（2-4 日）
- 目的: API 契約（問題インスタンスの JSON フィールド）を確定。必要なら backend-migration を提案。

フェーズ 7 — セキュリティ・実行環境（3-7 日）
- 目的: プログラミング問題（ID 8/9）のコード実行は Jobe / CodeRunner 等のサンドボックスで扱う。タイムアウト/メモリ制限/ログ設計。

ロールとタスク分割（Phebe 用に細分化）
- `frontend-registry`（担当 A）: Registry 実装、型定義、デフォルト登録。
- `frontend-views`（担当 B）: View コンポーネント群（表示のみ）。
- `frontend-edits`（担当 C）: Edit コンポーネント群 + `ProblemEditor` の接続。
- `integration`（担当 D）: dynamic import、ビルド最適化、Storybook。
- `backend-contract`（担当 E）: API スキーマ定義、必要なエンドポイント調整。
- `sandbox`（担当 F）: CodeRunner/Jobe 統合設計とサーバ側実装／運用要件。

受け渡し条件（Definition of Done）
- 各タイプの表示が `view` で正しくレンダリングされること。
- 編集モードで各タイプの簡易 edit が動作し、保存／キャンセルが機能すること。
- `npm run build` と `vitest` が CI 上で通る（最低限の tests を含む）。
- ドキュメント（`docs/U_REFACTOR_REQUIREMENTS.md`）が更新されていること。

備考
- Moodle の `question/type/*` は設計の参考に最適。コードを直接流用する場合はライセンス（GPLv3 等）に従うこと。OSS の導入はコードとライセンスの双方をレビューする担当を立てること。
# Docker Implementation: Task Phases & Breakdown

This document outlines the step-by-step phases to implement the Docker containerization for the Edumint Frontend.

## Phase 1: Environment Definition [Completed]
**Objective**: Prepare the Docker environment with the specified stack.

*   1.1. Create `.dockerignore`
    *   **Action**: Create the file at the project root for exclusion.
*   1.2. Prepare Dependencies
    *   **Action**: Ensure `package.json` is configured for React **v18.x**.
    *   **Details**: No upgrade to React 19 is required. Update other minor dependencies if necessary.
*   1.3. Create `Dockerfile`
    *   **Action**: Use **node:24.12.0-alpine** as the base image.
    *   **Details**: Standard multi-stage build setup.

## Phase 2: Orchestration & Configuration [Completed]
**Objective**: Setup Docker Compose and adjust Vite 7 settings.

*   2.1. Create `docker-compose.yml`
    *   **Action**: Create the service with port 5173 mapping and volumes.
*   2.2. Update Vite Configuration
    *   **Action**: Ensure `vite.config.ts` supports Vite 7 requirements and network exposure.

## Phase 3: Verification & Documentation [Completed]
**Objective**: Ensure the setup works as expected and document usage for the team.

*   3.1. Build & Run
    *   **Action**: Run `docker-compose up --build`.
    *   **Check**: Verify console output for successful vite startup.
*   3.2. Test Connectivity & HMR
    *   **Action**: Open `localhost:5173`. Edit `src/App.tsx` (or similar) and save.
    *   **Check**: Confirm browser updates automatically.
*   3.3. Update Documentation
    *   **Action**: Update `README.md` (or create `docs/DOCKER_GUIDE.md`).
    *   **Details**: Add commands for starting (`docker-compose up`), stopping, and rebuilding.

## Phase 4: Cleanup (Optional/Post-Refactor)
**Objective**: Clean up local environment if shifting entirely to Docker.

*   4.1. Remove local `node_modules` (Optional)
    *   **Action**: Delete local `node_modules` to test if the container runs truly independently.
