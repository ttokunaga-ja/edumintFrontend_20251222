# インターフェース仕様（Frontend ⇄ Gateway）

## REST（Gateway: 現状実装）
実装の一次情報（As-Is）は `src/src/services/api/gateway.ts` を参照（下記は要点）。
To-Be（設計）では `src/src/services/api/httpClient.ts` + `src/src/services/api/gateway/*.ts` に分割し、`index.ts` で再 export する（`F_ARCHITECTURE.md`）。

### Health
- `GET /health/summary`
- `GET /health/{service}`（実装: `content|community|notifications|search|wallet`）

### Search
- `GET /search/exams?{filters...}`
- `GET /search/readings?{params...}`

### Exams / Content
- `GET /exams/{examId}`
- `POST /exams`
- `PATCH /exams/{examId}`（更新）
- `GET /exam-edit-history/{examId}`
- `POST /exam-history/{examId}/rollback`

### Social / Interaction
- `POST /exams/{examId}/like`（toggle）
- `POST /exams/{examId}/bookmark`（toggle）
- `POST /exams/{examId}/share`
- `GET /comments?examId={examId}` （Phase 2: eduanimaSocial）
- `POST /comments` （Phase 2: eduanimaSocial）
- `DELETE /comments/{commentId}` （Phase 2: eduanimaSocial）
- `POST /comments/{commentId}/vote` （Phase 2: eduanimaSocial）

### File Upload（現状）
- `POST /files/upload-job`
- `POST /files/upload-complete`

> 注: 仕様書 `../implementation/features/file-upload.md` では `PATCH /files/upload-job/{id}/complete` を想定しているため、要件/実装差分として `C_2` / `D_2` 側に明記する。

### Generation（現状）
- `POST /generation-settings`
- `POST /generation/start`
- `GET /generation/status/{jobId}`
- `POST /generation/cancel/{jobId}`
- `POST /generation/resume/{jobId}`
- `POST /generation/retry/{jobId}`

### User / Wallet / Notifications
- `GET /user/profile` / `GET /user/profile/{userId}` / `PATCH /user/profile`
- `GET /user/stats` / `GET /user/stats/{userId}`
- `GET /user/{userId}/problems?page=&limit=`
- `GET /user/{userId}/liked?page=&limit=`
- `GET /user/{userId}/commented?page=&limit=` （Phase 2: eduanimaSocial）
- `GET /wallet/balance`
- `POST /wallet/withdraw`
- `GET /notifications?limit=`
- `GET /notifications/unread-count`
- `POST /notifications/{notificationId}/read`
- `POST /notifications/read-all`
- `DELETE /notifications/{notificationId}`

## REST（要件/設計: 追加・統合予定）
現状実装に存在しないが、要件ドキュメント側で明記されているもの（API契約が確定次第 `gateway.ts` と同期）。

### Auth / Session
- `POST /auth/login`, `POST /auth/token`
- `GET /profiles/me`

### Master Data / Suggest
- `GET /universities`, `GET /faculties`, `GET /subjects`, `GET /teachers`
- `GET /search/readings`（すでに実装あり。大学/学部等にも適用拡大を想定）

### Submit / Structure Confirm
- `PATCH /exams/{id}/structure`（構造編集）
- `POST /generation-settings`（すでに実装あり。契約を確定して型を同期）

## イベント (UI 内イベント)
- `search:submit` (payload: keyword, filters)  
- `upload:retry` (payload: fileId)  
- `job:status` (payload: jobId, status, problemId?)  
 - `health:updated` (payload: summary)  
 - `featureFlag:evaluated` (payload: flagName, enabled)  

## バリデーション/スキーマ
- Zod/TS でレスポンスを検証し、欠損時はフォールバック値を返す（UI が落ちないこと）。  
- 型ファイルは `src/src/types/*` に置き、Gateway クライアントと共有。  

## エラー/リトライ
- 503/timeout は 1 回まで指数バックオフ。ヘルスが `outage|maintenance` の場合はリクエスト自体を送らず UI で disable。  
- エラーの表示形式は `I_ERROR_LOG_STANDARD.md` に従い、`traceId` がある場合は必ずログへ残す。  

## Sources
- `../overview/requirements.md`, `../overview/current_implementation.md`
- `../implementation/features/file-upload.md`, `../implementation/service-health/README.md`
- `../services/search-service/search-service-api.md`（searchServiceの内部API。FrontendはGateway経由）
