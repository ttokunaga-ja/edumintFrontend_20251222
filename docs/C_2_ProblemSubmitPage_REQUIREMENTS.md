# C_2 ProblemCreate Page REQUIREMENTS（ProblemSubmit + StructureConfirm + Generating を統合）

## 機能要件
- ルーティング/UX（重要）
  - 生成フローは **単一URL** `/problem-create` で完結（ページ遷移・リロードなしでステップ進行）。
  - ステップは内部状態（例: state machine）で管理し、必要なら `?step=` で復元できるようにする（ブラウザ戻る/更新対策）。
  - 画面上部にステップ進捗（ProgressStepper）を常時表示。
- ステップ構成（統合）
  1. 生成方法選択（講義ノート / 過去問）
  2. アップロード（FileUploadQueue）
  3. 設定（ProblemSettingsBlock / GenerationOptionsBlock）
  4. 構造確認（任意: toggle ON の場合のみ）
  5. 生成中（同ページ内に Generating UI を表示）
  6. 完了（ProblemView への遷移CTA）
- アップロード
  - 署名URL取得: `POST /files/upload-job` → S3 PUT → 完了通知: `POST /files/upload-complete`
  - クライアント側検証（例）: PDF 10MB, JPG/PNG 5MB, TXT/MD 1MB（詳細は `../implementation/features/file-upload.md`）
  - 失敗時: 失敗ファイルのみ再送、指数バックオフ
- 生成設定
  - `POST /generation-settings`（jobId + settings）
  - 構造確認/生成中/閲覧画面に設定サマリーを表示（ユーザーが選んだ前提を可視化）
- 生成開始/生成中
  - `POST /generation/start` → `GET /generation/status/{jobId}` をポーリング（同ページ内）
  - cancel/resume/retry: `POST /generation/{cancel|resume|retry}/{jobId}`（JobStatusRibbon）
  - 生成UIは ProblemCreate の Step として実装（`GeneratingPage` という別ページは持たない）
- Health
  - `outage|maintenance` で CTA disable + Alert（ServiceHealthContext で一本化）
  - `degraded` は警告表示（CTAは原則有効）
- モック（暫定）
  - 現状 `src/src/services/api/gateway.ts` は `VITE_API_BASE_URL` が localhost の場合にモックへ分岐。

## 非機能要件
- 失敗時 UX: 失敗ファイルのみ再送、ポーリング停止、エラートースト。
- i18n 辞書化。Form バリデーションは schema で実装。

## 画面/コンポーネント配置
- route/page tsx: `src/src/pages/ProblemCreatePage.tsx`
- 画面専用: ステップナビ/サマリー。
- 共通: PageHeader, ContextHealthAlert, FileUploadQueue, JobStatusRibbon, GenerationStatusTimeline。

## ワイヤーフレーム（案）
```text
┌──────────────────────────────────────────────────────────────┐
│ TopMenuBar                                                   │
├──────────────────────────────────────────────────────────────┤
│ PageHeader: 問題を作成                                       │
│ ProgressStepper: 方式 → UP → 設定 → 確認 → 生成 → 完了          │
├──────────────────────────────────────────────────────────────┤
│ ContextHealthAlert (file/content/aiGenerator)                │
├──────────────────────────────────────────────────────────────┤
│ (2-column @lg)                                               │
│ ┌────────────── StepContent (switch by step) ──────────────┐ │
│ │ Step 1: SourceTypeSelector (カード2枚)                     │ │
│ │ Step 2: FileUploadZone + FileUploadQueue                   │ │
│ │ Step 3: ProblemMetadataForm + Settings/Options             │ │
│ │ Step 4: StructureEditor (Preview/Edit toggle 付き)         │ │
│ │ Step 5: GenerationProgress (StatusTimeline + ProgressBar)  │ │
│ │ Step 6: Complete (success + [問題を見る])                  │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌────────────── StickySummary (always) ─────────────────────┐ │
│ │ GenerationSettingsSummary / Selected files / errors        │ │
│ └───────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│ FooterActionBar: [戻る] [次へ] / [生成開始] / [中断/再開/再試行] │
└──────────────────────────────────────────────────────────────┘
```

## ブロック → コンポーネント分割（案）
- Shell: `Common/TopMenuBar.tsx`, `Common/PageHeader.tsx`, `Common/ContextHealthAlert.tsx`
- Stepper: `ProblemCreatePage/ProgressStepper.tsx`
- Step 1: `ProblemCreatePage/SourceTypeSelector.tsx`
- Step 2: `ProblemCreatePage/FileUploadZone.tsx`, `Common/FileUploadQueue.tsx`
- Step 3: `ProblemCreatePage/ProblemMetadataForm.tsx`, `ProblemCreatePage/ProblemSettingsBlock.tsx`, `ProblemCreatePage/GenerationOptionsBlock.tsx`
- Step 4: `ProblemCreatePage/StructureEditor.tsx`（内部で `Common/QuestionBlock.tsx` 等を再利用）
- Step 5: `ProblemCreatePage/GenerationProgress.tsx`, `Common/JobStatusRibbon.tsx`, `Common/GenerationStatusTimeline.tsx`
- Step 6: `ProblemCreatePage/CompletePanel.tsx`
- Sidebar: `Common/GenerationSettingsSummary.tsx`
- Footer actions: `Common/FooterActionBar.tsx`（※ wizard 共通）

## 理想要件 vs 現状差分
- ファイル種別: 要件では DOCX/PPT 等の拡張も想定しているが、現状の実装ガイド/コードは PDF/JPG/PNG/TXT/MD を中心にしている（拡張は段階対応）。
- ServiceHealth: `aiGenerator` の単独ヘルスエンドポイントは未整備の可能性があるため、`/health/summary` を一次情報として扱う。

## Sources
- `../overview/requirements.md`, `../overview/use-cases.md`
- `../implementation/features/file-upload.md`
- `../implementation/service-health/README.md`
- `src/src/services/api/gateway.ts`
