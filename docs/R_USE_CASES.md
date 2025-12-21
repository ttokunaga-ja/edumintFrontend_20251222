# ユースケース定義書（Frontend）

目的: フロント UI が満たす主要シナリオを明文化し、API/ヘルス/フラグの対応を示す。

## 記述フォーマット（例）
```yaml
UC-01 SearchExam:
  actor: Student
  trigger: HomePage 検索バー submit
  precondition:
    - /health/search = operational
    - VITE_API_BASE_URL 設定済み
  main_flow:
    - 入力バリデーション (keyword/min length)
    - GET /search/exams?page=1
    - 結果をカード表示 + Pagination
  exception_flow:
    - health_outage -> CTA disable + Alert A/B + Coming Soon 文言
    - api_timeout -> Toast + Retry ボタン
  output: exam cards + pagination meta
  related_api: D_INTERFACE_SPEC.md#/search/exams
  acceptance:
    - TTI p75 < 2.5s
    - health_outage 時にリクエストを送らない

UC-02 SubmitAndGenerate:
  actor: Student
  trigger: ファイルアップロード開始
  precondition:
    - /health/summary で content/aiGenerator = operational|degraded
  main_flow:
    - FileUploadQueue でファイルを追加/送信
    - POST /generation/start -> jobId
    - ProblemCreate（Generating 統合ステップ）でポーリング、complete で ProblemView へ遷移
  exception_flow:
    - upload_failed -> 失敗ファイルのみ再送、ジョブ停止
    - job_failed -> retry/resume/cancel CTA 表示
  output: jobStatus, problemId
  acceptance:
    - outage で CTA 無効化、理由を表示
    - retry/resume が UI/ジョブ状態と一致
```

## 必須項目チェックリスト
- UseCase ID (UC-xx)
- アクター / トリガー / 前提条件（ヘルス/フラグ）
- メインフロー / 例外フロー
- 期待出力・成功条件
- 関連 API / イベント / データモデル
- 非機能受入 (性能、可用性、UX)

## 主要ユースケース（集約）
`../overview/use-cases.md` から、Frontend 実装で優先度が高いものを抜粋して A-Z 形式へ整理。

```yaml
UC-01 Register:
  actor: Student (new)
  trigger: Login/Register で「新規登録」
  pages: [C_5]
  main_flow:
    - SSO/メール認証
    - ProfileSetup（大学/学部/分野/ユーザー名）
  exception_flow:
    - invalid_domain -> validation_error
    - auth_unavailable -> CTA disable + Alert

UC-05 ViewWithAds (First time):
  actor: Student (registered)
  trigger: Home で問題カード選択
  pages: [C_1, C_3]
  main_flow:
    - 構造タブ表示
    - 問題/解答は広告視聴後に段階開示
  exception_flow:
    - content_outage -> CTA disable + Alert

UC-07 ViewAndEdit (Owner):
  actor: Owner (poster)
  trigger: 自分の問題を閲覧
  pages: [C_3]
  main_flow:
    - 広告免除
    - Preview/Edit 切替、保存/取消、履歴ロールバック

UC-10 GenerateFromLectureNotes:
  actor: Student
  trigger: ProblemCreate で「講義ノート」→アップロード
  pages: [C_2, C_7]
  main_flow:
    - 署名URL→アップロード→完了通知
    - 生成設定→（任意で構造確認）→生成開始→進捗→完了
  exception_flow:
    - upload_failed -> retry (failed only)
    - aiGenerator_outage -> CTA disable + Alert
```

## Sources
- `../overview/use-cases.md`
