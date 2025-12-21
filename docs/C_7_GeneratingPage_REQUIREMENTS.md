# C_7 Generating UI REQUIREMENTS（ProblemCreate に統合）

本来は独立ページとして定義していたが、要件として **/problem-create（単一ページ）内の Step** として実装する（別ルート/別 Page ファイルは作らない）。

## 機能要件
- ジョブ進捗表示（JobStatusRibbon + GenerationStatusTimeline）
  - status: queued/processing/paused/completed/error
  - progress(0-100), currentStep, eta（実装型: `GenerationStatusResponse`）
- API
  - `GET /generation/status/{jobId}`（ポーリング）
  - `POST /generation/{cancel|resume|retry}/{jobId}`（CTA）
- Health
  - `aiGenerator` の状態は `GET /health/summary` を一次情報として扱い、`outage|maintenance` の場合は CTA disable + Alert G
- 完了時に `onGenerated(problemId)` を呼び ProblemView へ遷移

## 非機能要件
- ポーリング停止: アンマウント/エラー時は必ず停止。
- i18n、Toast で失敗通知。

## 画面/コンポーネント配置
- 現状: legacy `src/components/GeneratingPage.tsx`
- 目標:
  - `src/src/pages/ProblemCreatePage.tsx` の Step として実装
  - UI コンポーネントは `components/ProblemCreatePage/GenerationProgress.tsx` 等へ切り出し可
- 再利用（共通）: PageHeader, JobStatusRibbon, ContextHealthAlert, GenerationStatusTimeline。

## Sources
- `../overview/requirements.md`, `../overview/use-cases.md`
- `src/src/services/api/gateway.ts`
