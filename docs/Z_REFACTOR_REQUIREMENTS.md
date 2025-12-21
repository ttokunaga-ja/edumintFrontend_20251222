# EduMint フロントエンド MVP リリース向け「最小」改修リスト

MVP を出すために、必ず直す・削るべきポイントだけを列挙。拡張・将来分は切り離し、今リリースに必要な線だけを残す。

## ゴール
- FIGMA ベースの新 UI を本番経路に載せ、実 API（Phase1: Auth/File/Content/Search/AiWorker）と確実に接続。
- 重大なエラーパスと環境変数漏れを潰し、モックフォールバックを禁止。
- MVP 対象外機能（Wallet/Community 等）は「Coming Soon」扱いで安全に隠す。

## 必須改修（優先度順）
1. ルーティング切替  
   - `App.tsx` を FIGMA 版の各ページ（`src/src/pages/*`）へ差し替え、旧 `src/components/*` ルートを封鎖。  
   - ナビゲーション/パンくず/フッターを FIGMA と一致させ、不要リンクは非表示。

2. API ベース URL の必須化  
   - `.env` に `VITE_API_BASE_URL` を必須追加し、未設定ならビルドを fail。  
   - Gateway からのモック自動フォールバックを削除し、HTTP エラー・タイムアウト時に共通アラート＋リトライ動線を表示。

3. Service Health 連動の CTA 制御  
   - `/health/summary` と `/health/{content,community,notifications,search,wallet}` をポーリングし、該当サービスが `degraded/outage` の場合は関連 CTA を無効化し理由を表示。  
   - 検索フィルターや問題提出の「実行」ボタンは `useServiceHealthContext` に一本化。

4. 型/スキーマの最低限同期  
   - 検索結果・問題詳細・提出レスポンスに対し Zod/TS でバリデーションを追加し、欠損時は UI 側で安全なデフォルトを表示。  
   - 直近 API 契約で必須のフィールド（id/title/tags/difficulty/updatedAt/creator）だけを確実に受け取れるようにする。

5. ファイルアップロード/生成ジョブの失敗パス  
   - `FileUploadQueue` と ProblemCreate（Generating 統合ステップ）で失敗時のメッセージ表示＋リトライボタンを追加。  
   - アンマウント時にポーリングを停止し、再マウント時は途中ジョブを再取得して再開。

6. Coming Soon の明示  
   - Wallet/Community/Notify 等の未実装ボタンは `Coming Soon` ラベル＋無効化で露出だけに留める（Feature Flag ではなく固定文言で可）。  
   - 関連 API 呼び出しは行わず、ServiceHealth には登録しない。

## 実装差分（要件→現状で特に影響が大きいもの）
- モック判定: `VITE_API_BASE_URL` が localhost を含むかで分岐している（`J_ENV_VARS_REGISTRY.md`）。誤判定/本番混入を防ぐため、Refactor v2 で **MSW（`VITE_ENABLE_MSW`）へ一本化**し、内部モックフォールバックを撤去する。
- File Upload: 実装は `POST /files/upload-complete`、仕様書は `PATCH /files/upload-job/{id}/complete` を想定（`D_INTERFACE_SPEC.md`, `D_2_...`）。API契約を統一する。
- Generator Health: `aiGenerator` の単独ヘルスエンドポイントが未整備の可能性があるため、`/health/summary` を一次情報として扱う（`C_2`, `C_7`）。
- 編集機能: FIGMA版 `src/src/pages/ProblemViewEditPage.tsx`（目標: `ProblemViewEditPage.tsx`）の統合が不十分。legacy との二重管理を解消する（`C_3`）。

## チェックリスト（リリース前に見る）
- 本番ビルドが `VITE_API_BASE_URL` 未設定で失敗することを確認。  
- 主要ページで 404/500/timeout をモックし、アラート＋リトライ表示が出ること。  
- Service Health を `degraded` にしたとき、検索・生成・提出ボタンが無効化され理由が見えること。  
- アップロード失敗→リトライ→成功のハッピー/バッドパスが通ること。  
- Coming Soon 領域で API 呼び出しが走らないこと。

## Sources
- `../overview/refactor-priorities.md`, `../overview/current_implementation.md`
- `../migration/legacy-to-new.md`
- `../implementation/features/file-upload.md`, `../implementation/service-health/README.md`
- `src/src/services/api/gateway.ts`
