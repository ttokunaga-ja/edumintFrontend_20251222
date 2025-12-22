# Q_PROMPT

目的: 他の CodingAgent に実装を依頼する際に、そのままコピペできる詳細プロンプトテンプレート。

注意事項（必ず守る）
--------------------
変更対象ファイルは必ず `git` でブランチを切って PR を作成すること。
外部 OSS（例: Moodle、CodeRunner）のコードを参照・組み込む場合はライセンスに従うこと（GPL 等）。
変更は小さなコミットに分割し、各コミットで CI が通るようにすること。

-----

【共通コンテキスト】
- リポジトリ: edumintFrontend
- 主言語: TypeScript + React
- 既存ページ: `src/pages/ProblemViewEditPage.tsx`
- 既存 UI: `src/components/page/ProblemViewEditPage/*`（`SubQuestionBlock.tsx` 等）
- DB: `sub_questions` に `sub_question_type_id` が存在（`docs/database.md` の `question_types` を参照）

-----

タスク指定テンプレート（コピーして使用）

目的: `ProblemViewEditPage` を小問タイプ別のプラグインアーキテクチャにリファクタする。

作業範囲（最小必須）
- `src/components/problemTypes/ProblemTypeRegistry.tsx` を使ってタイプ登録機構を整備する。
- `src/components/problemTypes/*View.tsx` を実装し、`SubQuestionBlock` の表示部分を委譲する。
- `src/components/page/ProblemViewEditPage/ProblemEditor.tsx` を修正して、編集時にタイプ別 `Edit` を呼び出せるようにする（動的インポート可）。

具体的な指示
1. 既存の `SubQuestionBlock.tsx` は表示委譲済み。まず `ProblemTypeRegistry` に view コンポーネントを登録する。
2. `question_types` ID とコンポーネントマッピングは次の通り: 1=FreeText, 2=MultipleChoice, 4=Cloze, 5=TrueFalse, 6=Numeric, 7=Proof, 8=Programming, 9=CodeReading。
3. 各 View コンポーネントは `ProblemTypeViewProps`（`src/types/problemTypes.ts`）に従うこと。
4. Edit コンポーネントは `ProblemTypeEditProps` に従い、`onQuestionChange/onAnswerChange` を呼ぶ仕様とする。
5. 動的 import は `() => import('./SomeTypeEdit')` の形で行い、ビルドを最適化すること。

受け入れ基準
- 表示: `npm run build` して問題ページを開くと、各小問が期待通りの View で表示される。
- 編集: 編集モードでタイプ毎の Edit コンポーネントがロードされ、編集→保存→サーバへ PUT/POST される（既存 `useExamEditor` を利用）。
- テスト: 主要な View コンポーネントに `vitest` の snapshot テストが1つ以上あること。

実行コマンド（検証用）
```bash
npm install
npm run build
npm run test
``` 

参照 OSS（設計参考）
- Moodle: `question/type/*`（renderer.php / edit_*_form.php） — 表示と編集ロジック分離の例
- CodeRunner: プログラミング問題の実行フロー（Jobe 統合）

エラー報告ルール
- 変更でビルドエラーが発生したら即 PR に `WIP` を付け、エラー解決のための最小変更で再提出すること。
# Docker Implementation: AI Prompts

Use the following prompts sequentially to instruct the Coding Agent (or AI assistant) to build the Docker environment.

---

## Prompt 1: Files Creation (Phase 1 & 2)

```markdown
# Role
DevOps Engineer / Frontend Specialist

# Task
We need to containerize our current React/Vite application. Please create the necessary Docker configuration files in the root directory.

# Requirements

1. **Dependency Preservation/Update**
   - Ensure `react` and `react-dom` remain on **v18.x** (e.g., 18.3.1).
   - Ensure `vite` is updated to the latest stable **v7.x** or compatible version.

2. **.dockerignore**
   - Exclude: `node_modules`, `dist`, `.git`, `.vscode`, `*.log`, `.env.local`.

3. **Dockerfile**
   - Base Image: **node:24.12.0-alpine**.
   - Working Directory: `/app`.
   - Steps:
     - Copy `package.json` and `package-lock.json`.
     - Run `npm install`.
     - Copy the rest of the application code.
     - Expose port `5173`.
     - Default Command: `npm run dev -- --host`.

3. **docker-compose.yml**
   - Service Name: `frontend`.
   - Build Context: `.` (current directory).
   - Ports: Map host `5173` to container `5173`.
   - Volumes:
     - Bind mount `.` to `/app` (for Hot Module Replacement).
     - Anonymous volume for `/app/node_modules` (to preserve container dependencies).
   - Environment: Load from `.env` logic if applicable.

# Output
Please generate the content for `.dockerignore`, `Dockerfile`, and `docker-compose.yml`.
```

---

## Prompt 2: Vite Configuration Adjustment (If needed)

```markdown
# Context
We are running Vite inside Docker. Sometimes Vite restricts network access to local loopback by default.

# Task
Check `vite.config.ts` (or `vite.config.js`). ensure the server is configured to listen on all interfaces.
- Add or verify:
  ```ts
  server: {
    host: true, // or '0.0.0.0'
    port: 5173,
    watch: {
        usePolling: true // Sometimes needed for Windows/WSL file system events
    }
  }
  ```
- If the file needs modification, please apply this change.
```

---

## Prompt 3: Documentation Update (Phase 3)

```markdown
# Task
Update the project documentation to explain how to use the new Docker setup.

# Action
Create a new file `docs/DOCKER_README.md` (or append to main README) with the following info:
1. **Prerequisites**: Docker Desktop installed.
2. **Start Dev Server**: `docker-compose up`
3. **Rebuild**: `docker-compose up --build`
4. **Stop**: `docker-compose down`
5. **Troubleshooting**: Brief note about ensuring ports are free.
```
