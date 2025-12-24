# D_3 ProblemView/Edit Component REQUIREMENTS

## スコープ
- ProblemMetaBlock, QuestionBlock, AnswerBlock, PreviewEditToggle, EditHistoryBlock, CommentList (Phase2), ActionBar。

## 機能要件
- 表示
  - Meta/Question/Answer/History をブロックで表示
  - 広告/ロック制御（段階開示、投稿者免除）
- 編集（投稿者）
  - **単一 Page ファイル**で Preview/Edit を切替（Edit 内で Preview を参照できる構造）。
  - Preview/Edit トグルでフォーム切替、保存/取消
  - History: version 差分表示、ロールバック（`GET /exam-edit-history/{examId}`, `POST /exam-history/{examId}/rollback`）
- Social（Phase2）
  - いいね/コメント/投票/通知はヘルスとフラグで制御
  - API: `POST /exams/{examId}/like`, `GET/POST/DELETE /comments`, `POST /comments/{commentId}/vote`
- ActionBar
  - bookmark/share/report を提供（`POST /exams/{examId}/bookmark`, `POST /exams/{examId}/share`, `POST /reports`）
  - 実装規約: UI コンポーネントは `services/api/*` を直接 import しない。`features/content` / `features/moderation` / `features/notifications` の hook/repository 経由で呼ぶ。
- ServiceHealth
  - `GET /health/content`（閲覧/編集の一次依存）
  - `GET /health/community`, `GET /health/notifications`（Social/通知）
- モック（暫定）
  - `src/src/services/api/gateway.ts` は `VITE_API_BASE_URL` が localhost の場合にモックへ分岐

## 非機能要件
- 保存は API 完了後に UI 反映（楽観不可）。エラーは Toast + inline。
- i18n。アクセシビリティ: keyboard navigation。

## ファイル構成（提案）
- page:
  - `src/src/pages/ProblemViewEditPage.tsx`
- components:
  - `src/src/components/page/ProblemViewEditPage/PreviewEditToggle.tsx`
  - `src/src/components/page/ProblemViewEditPage/ViewModeTabs.tsx`（structure/question/answer）
  - `src/src/components/page/ProblemViewEditPage/ProblemMetaBlock.tsx`
  - `src/src/components/page/ProblemViewEditPage/ActionBar.tsx`
  - `src/src/components/page/ProblemViewEditPage/QuestionBlock.tsx`
  - `src/src/components/page/ProblemViewEditPage/SubQuestionBlock.tsx`
  - `src/src/components/page/ProblemViewEditPage/AnswerBlock.tsx`
  - `src/src/components/page/ProblemViewEditPage/EditHistoryBlock.tsx`
  - `src/src/components/page/ProblemViewEditPage/CommentSection.tsx`（Phase2）
  - `src/src/components/page/ProblemViewEditPage/AdGateModal.tsx`
  - `src/src/components/page/ProblemViewEditPage/ReportModal.tsx`

## Sources
- `../overview/requirements.md`, `../overview/use-cases.md`
- `../implementation/service-health/README.md`
- `src/src/services/api/gateway.ts`
