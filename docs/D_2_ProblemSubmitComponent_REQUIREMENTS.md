# D_2 ProblemCreate Component REQUIREMENTS（Submit + StructureConfirm + Generating 統合）

## スコープ
- ProblemCreatePage の主要コンポーネント群（単一URL `/problem-create` 前提）
  - Wizard/Stepper UI（ProgressStepper / FooterActionBar）
  - FileUploadQueue / FileUploadZone
  - ProblemSettingsBlock / GenerationOptionsBlock / GenerationSettingsSummary
  - StructureEditor（任意ステップ）
  - GenerationProgress（Generating を同ページ内ステップとして表示）

## 機能要件
- FileUploadQueue
  - 4状態管理（選択→検証→uploading→complete/error）
  - 失敗ファイルのみ再送（リトライUI）
  - クライアント側検証（例）
    - PDF: 10MB, JPG/PNG: 5MB, TXT/MD: 1MB（`../implementation/features/file-upload.md`）
    - MIME type / ファイル名長（<=255）
- API（現状実装: `src/src/services/api/gateway.ts`）
  - 署名URL: `POST /files/upload-job`（payload: `{ fileName, fileType }`）
  - 完了通知: `POST /files/upload-complete`（payload: `{ jobId }`）
  - 生成設定: `POST /generation-settings`（payload: `{ jobId, settings }`）
  - 生成開始: `POST /generation/start`（payload: `{ structureId }`）
  - 生成状態: `GET /generation/status/{jobId}`（ポーリング）
  - 実装規約: UI（Step/Block）は `services/api/*` を直接 import しない。`features/generation` / `features/content` の hook/repository 経由で呼ぶ。
- Wizard/Stepper
  - ルーティングは増やさない（Step は内部 state machine で管理）。
  - Header に ProgressStepper、Footer に Back/Next/Start/Cancel/Resume/Retry を集約。
- Settings/Options
  - schema バリデーション（Zod）
  - 生成オプションは構造確認/生成中/閲覧画面へ伝搬
- GenerationSettingsSummary
  - 構造確認/生成中で表示し、ユーザーが選んだ設定の「見える化」を担保

### 理想要件 vs 現状差分（ドキュメント集約）
- 理想: `CreateUploadJobRequest` に `file_size` や `source_type` を含め、完了通知も `PATCH /files/upload-job/{id}/complete` など Job 直結の API で統一（`../implementation/features/file-upload.md`）。
- 現状: `POST /files/upload-complete` を利用し、`createUploadJob()` は失敗時にモックへフォールバックする（MVP改修対象: `Z_REFACTOR_REQUIREMENTS.md`）。

## 非機能要件
- エラーは Toast + inline。i18n 辞書化。
- `outage|maintenance` の依存サービス（content/aiGenerator 等）は `/health/summary` を一次情報として disable（API呼び出し抑止）。

## ファイル構成（提案）
- page:
  - `src/src/pages/ProblemCreatePage.tsx`
- components:
  - `src/src/components/page/ProblemCreatePage/ProgressStepper.tsx`
  - `src/src/components/page/ProblemCreatePage/SourceTypeSelector.tsx`
  - `src/src/components/page/ProblemCreatePage/FileUploadZone.tsx`
  - `src/src/components/page/ProblemCreatePage/ProblemMetadataForm.tsx`
  - `src/src/components/page/ProblemCreatePage/ProblemSettingsBlock.tsx`
  - `src/src/components/page/ProblemCreatePage/GenerationOptionsBlock.tsx`
  - `src/src/components/page/ProblemCreatePage/StructureEditor.tsx`
  - `src/src/components/page/ProblemCreatePage/GenerationProgress.tsx`
  - `src/src/components/page/ProblemCreatePage/CompletePanel.tsx`

## Sources
- `../implementation/features/file-upload.md`
- `../overview/requirements.md`, `../overview/current_implementation.md`
- `src/src/services/api/gateway.ts`
