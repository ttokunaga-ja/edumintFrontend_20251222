# Backend DB Adjustment Proposal — フロントエンド整合性チェック結果（2026-01-03）

## 概要 ✅
フロントエンド（`src/`）の型・フォーム実装と、本リポジトリのデータベース設計書（`docs/Q_DATABASE.md`）を比較した結果、以下の主要な不整合が確認されました。

- フロントエンドは大学/学部/教授/科目 等を「名前（string）」で扱う一方、DB設計は `school` / `faculty_id` / `teacher_id` / `subject_id` のように **数値ID（外部キー）** を期待している（名称 vs ID のギャップ）。
- コード記述問題（question_type = 12）向けの **実行環境設定（execution_options JSONB）** をフロントエンドのスキーマ／UIが扱っておらず、APIペイロードにもマッピングされていない。DB設計には列があるが、受け渡し仕様が未整備。
- APIパスやモデル命名に一部ブレが見られる（例：`/exams` vs `/problems` の使用） — ドキュメントと実装の整合性注意。
- ファイルアップロード系（`file_inputs`）は `user_id` / `original_filename` を NOT NULL としているが、フロントエンドはアップロード時に明示的にユーザーIDを送っていない（認証トークン依存）。運用ルールの明文化が必要。
- 命名規約（camelCase ↔ snake_case）の対応は多くで行われているが、API送受信における期待プロパティ（例: `content` / `message` 等）の明記が不足している箇所がある。

---

## 詳細分析 🔎
以下、対象テーブル／モデルごとに、フロントエンド実装箇所（ファイルと行範囲）と照らして具体的不整合を列挙します。

### A) `exams` テーブル ←→ フロントエンドの試験フォーム
- DB（`docs/Q_DATABASE.md`）: `exams` テーブルは `exam_name` (NOT NULL), `school` (INT NOT NULL, 学校ID), `faculty_id`, `teacher_id`, `subject_id`, `academic_field_id`（すべて外部キー／数値ID）を持つ。
- フロントエンド: フォームスキーマは名前ベースのプロパティを扱う
  - `src/features/exam/schema.ts` — `ExamSchema`（行 113-133 付近）
    - `examName`, `examYear`, `universityName`, `facultyName`, `teacherName`, `subjectName`, `academicFieldName`, `durationMinutes`, `majorType` など（文字列／数値）
  - API ↔ フォーム 変換: `src/features/exam/utils/normalization.ts` にて `exam_name` ↔ `examName` 等のマッピング実装あり（transformToForm / transformToApi）
    - ただしフォーム UI (`ExamMetaSection`) は `universityName` 等を TextField（文字列）で受け取っている（`src/features/exam/components/ExamMetaSection.tsx`）。

不整合内容:
- フロントエンドは**名前（文字列）しか送らない**ため、DBの外部キー（学校IDなど）を必須にしている設計だと、API 側で名前→ID の解決ロジックまたは新規マスタレコード作成が必須になる。

推奨対応:
- DB側ドキュメント案2（長期/望ましい）: フロントエンドを段階的に改修して Autocomplete を用い、`school` / `faculty_id` / `teacher_id` / `subject_id` 等の**数値ID**を API に送信する方式へ移行する。具体的な移行手順:
  1. 検索API を整備する（例: `/search/universities`, `/search/faculties`, `/search/teachers`, `/search/subjects`）で、候補として `{ id, name }` を返す。
  2. フロントエンド改修: `ExamMetaSection` の各フィールドを Autocomplete 化し、選択時に対応する ID を内部状態に格納して送信する（送信時は `university_id`, `faculty_id`, `teacher_id`, `subject_id` を含める）。移行期間は可読性のため `university_name` 等の名前列も併送する運用とする。
  3. バックエンド互換レイヤ: 移行期間は ID または name の双方を受け入れ、name が送られた場合はサーバ側で名前→ID を解決・バリデーションして `*_id` を設定するロジックを実装する。
  4. データ移行: 既存レコードについてはバッチ処理で name→id を解決し、`*_id` カラムを埋める。移行完了後、`*_name` を optional から除去または非推奨化し、`*_id` を NOT NULL + FK 制約に変更する。
  5. テストとドキュメント: API 仕様（ID必須化タイミングを含む）、フロントエンドの変更点、運用手順、ロールバック手順を `docs/Q_DATABASE.md` と API ドキュメントに明記し、E2E/統合テストを追加する。
選択肢量に基づくオートコンプリート要件（追加）:
- 対象フィールド: `university`, `faculty`, `subject`, `teacher`, `keywords`, `examName` など、候補数が多く頻繁に更新される可能性のある属性。
- 要件（閾値ルール）:
  - **プロジェクト全体で候補が15件以下の場合**: バックエンドで INT 型の ID を管理し（例: `university_id` 等）、フロントエンドは専用の小規模ルックアップ API（例: `/lookups/{entity}`）で全候補を取得してマッピング（id ↔ name）を保持して良い。クライアント側での全件キャッシュは許容されるが、TTL を設定して更新を保証すること。
  - **プロジェクト全体で候補が15件を超える場合**: オートコンプリートフォーム化を推奨（保守性向上、入力補助、誤入力抑制のため）。
  - **候補が50件を超える場合**: オートコンプリートフォーム化を必須（クライアント側で全候補を保持しての選択は現実的でないため）。

実装補足:
- 小規模（≤15件）リスト向け: 提案される小規模ルックアップ API `/lookups/{entity}` はキャッシュ可能かつ変更頻度が低いメタデータに最適です。レスポンスは `{ items: [{ id, name, meta? }] }` を返し、フロントエンドは受信した id と name を内部でマッピングし、送信時に id を含めること。

実装ガイダンス:
- サーバサイド検索API:
  - 全てのオートコンプリート対象についてサーバサイドでの検索API（`/search/{entity}?q=...&limit=10&offset=0`）を用意し、部分一致・前方一致・音声キー/正規化文字列による曖昧検索をサポートする。
  - レスポンスは `{ items: [{ id, name, normalized_term?, meta? }], total: number }` 形式で返し、クライアントは `total` を参照して「さらに表示」やページ遷移を行える。
- フロントエンド動作ルール:
  - クライアントは**全候補を事前ロードしない**（メモリと更新コストが高いため）。サーバサイド検索（デバウンス 200~300ms、minChars=2）を行い、上位10件を表示する。
  - 選択済み・最近利用した候補はローカルキャッシュできるが、定期的に更新（TTL）を設ける。
  - 候補が存在しない場合の "Create new" オプションを提供する（新規作成は権限付き、または後処理で name→id 解決するワークフローを採る）。
- バックエンド実装要件:
  - `*_terms` テーブル（`subject_terms` / `university_terms` 等）の `normalized_term` / `phonetic_key` を利用した索引（GIN + trigrams / full-text / phonetic）を整備し、低遅延な検索を保証する。
  - 検索API はページング、スコアリング、悪意あるクエリへのレートリミットを備えるべし。
- ドキュメント化:
  - 上記閾値ルール、API 仕様、UI の動作（デバウンス、minChars、limit）を `docs/Q_DATABASE.md` と API ドキュメントに明記する。
- 付記: 短期的な互換案（ドキュメント案1としての denormalized な名前列の追加）は初期互換を保つ上で有効だが、最終目標はIDベースの正規化された設計に移行することを推奨します。

---

### B) `sub_questions.execution_options`（コード実行オプション）
- DB（`docs/Q_DATABASE.md`）: `execution_options` (JSONB, NULL可) を `sub_questions` に定義（ID 12 用）。
- フロントエンド: `src/features/exam/schema.ts` の `SubQuestionSchema`（行 24-60 付近）には `executionOptions` 相当のフィールドが存在しない。`transformToApi` の `sub_questions` -> ペイロードマッピング（`src/features/exam/utils/normalization.ts`）にも `execution_options` の変換がない。

不整合内容:
- フロントエンドでコード記述問題を作成しても、実行環境設定（言語、タイムアウト等）を送れず、バックエンド側で `execution_options` を受け取れない。

推奨対応:
コード実行に関しては、MVP版では実際に実行せずに問題と解答のみを書く形式です。
---

### C) 命名（API エンドポイント / リソース名） のブレ
- 実装: `src/services/api/gateway/content.ts` は `/exams/:id` を利用している一方、`src/services/api/endpoints.ts` の `CONTENT_ENDPOINTS` には `/problems` が定義されているなど、一貫性がない。

推奨対応:
- API ドキュメントと実装でリソースネームを統一（例: `exams` に一本化）。`docs/Q_DATABASE.md` の「用語/エンドポイント対応」セクションに標準を明記。

---

### D) `file_inputs` とファイルアップロードフロー
- DB: `file_inputs.user_id` と `original_filename` が NOT NULL（`docs/Q_DATABASE.md`）。
- フロントエンド: アップロードは `createUploadJob(entry.file.name, entry.file.type)` を送信し、アップロード完了通知を送るが、ユーザーID は Authorization コンテキストから backend が決定する想定（`src/features/content/hooks/useFileUpload.ts` にて createUploadJob 呼び出し）。

留意点:
- サーバ側で「認証トークンから user_id を確実に紐づける」ことを運用ルールとして明記するか、createUploadJob のペイロードに user_id（もしくはユーザ識別子）を含める仕様にする。DB 設計書へ明示を推奨。

---

### E) 命名規約（camelCase ↔ snake_case）の明文化
- 実装側は多くの場所で正しいマッピングを実装している（`normalization.ts` など）が、ドキュメントに "API のフィールド名 (snake_case) とフロントエンドのフィールド名 (camelCase) の対訳表" を用意すると将来的な齟齬が減る。行いたいです。

---

## 修正提案（具体的 SQL / ドキュメント変更案） ✍️
以下は `docs/Q_DATABASE.md` に追加・修正することを想定した提案です（マイグレーション用 SQL を併記）。

1) Exams: 名前列の追加と `school` の NULL許容（短期互換案）

```sql
ALTER TABLE exams
  ADD COLUMN university_name VARCHAR(255),
  ADD COLUMN faculty_name VARCHAR(255),
  ADD COLUMN teacher_name VARCHAR(255),
  ADD COLUMN subject_name VARCHAR(255),
  ADD COLUMN academic_field_name VARCHAR(255);

ALTER TABLE exams
  ALTER COLUMN school DROP NOT NULL; -- データ移行計画を併せて実施すること
```

2) sub_questions.execution_options の仕様明確化（ドキュメント + カラムコメント）

- 現状方針（MVP）: 本プロダクトのMVPフェーズでは、コード記述問題（question_type = 12）は実行環境を前端から設定せず、問題本文および解答（サンプル）を扱う仕様です。したがって、当面フロントエンドに実行環境入力UIを追加する必要はありません。バックエンド側では `execution_options` カラムを引き続き保持し、将来の機能拡張時に使用する方針をドキュメントに明記してください。

- ドキュメント案: `docs/Q_DATABASE.md` に `execution_options` のサンプル JSON と用途（保存用途、将来の自動実行設定保存先）を追記し、MVPフェーズでは NULL を許容する旨を明記することを推奨します。

- SQL（コメント追記）:

```sql
COMMENT ON COLUMN sub_questions.execution_options IS
  'JSONB (NULL可): 例 {"language":"python","timeout_seconds":5,"memory_limit_mb":128,"runner_image":"python:3.11"}; MVPフェーズではUI入力は不要。将来 UI で収集する場合は追加対応。';
```

- 将来の拡張時の作業（チェックリスト）:
  - フロントエンド: `SubQuestionSchema` に `executionOptions` を追加し、UIで入力フォーム（言語、タイムアウト等）を用意。
  - API: `transformToApi` / `transformToForm` に `execution_options` のマッピングを追加。
  - バックエンド: 受け取った JSON のバリデーションルールを設け、必要であれば Postgres 側で JSON Schema チェックや制約を導入（例: jsonb_path_exists 等）。

3) API 命名規則の明文化（ドキュメント）
- `docs/Q_DATABASE.md` に "API mapping" 章を追加し、DB テーブル名と REST エンドポイント、期待される JSON プロパティ（snake_case）とフロントエンド名（camelCase）の対応表を記載する。

4) file_inputs: アップロードの設計明確化
- ドキュメント追記: `files` upload flow は Authorization header によって `user_id` を backend が決定し、`file_inputs.user_id` を必ず設定する。createUploadJob の必須パラメータとレスポンスを明記する。

---

## 実施手順（運用・技術面の推奨フロー）
1. まずはドキュメント更新（本提案に沿って `docs/Q_DATABASE.md` に追記）とマイグレーション SQL を用意。
2. 互換性のため DB を当面 NULL 許容にした上でバックエンド側に "名前→ID 解決ジョブ" を実装（非同期マイグレーション）。
3. 並行してフロントエンドを改修する場合は、AutoComplete を利用して ID を取得・送信する UI に更新し、最終的に `school` 等を NOT NULL に戻す（段階的移行）。
4. `execution_options` に関してはフロント側に入力 UI を追加し、API に載せる（transformToApi にマッピング追加）。

---

## 参考：フロントエンド実装箇所（抜粋）📁
- `src/features/exam/schema.ts` — `SubQuestionSchema` / `QuestionSchema` / `ExamSchema`（行 ~1-160）
- `src/features/exam/utils/normalization.ts` — `transformToForm` / `transformToApi`（API↔Form の変換実装）
- `src/features/exam/components/ExamMetaSection.tsx` — UI（大学/学部/教授/科目は TextField: 名前を入力）
- `src/features/content/hooks/useFileUpload.ts` — createUploadJob の呼出し箇所（ファイルアップロードフロー）
- `src/services/api/gateway/content.ts` — GET/PUT `/exams/:id` をコールする実装

---

## 結論（推奨）🎯
短期的には DB ドキュメントに **"名前列（denormalized）を追加して、外部キーの NULL 許容化"** を盛り込むことでフロントエンドとの互換性を確保し、バックエンド側で名前→ID 解決のためのバッチ処理/ワーカーを実装することを推奨します。中長期的にはフロントエンドを Autocomplete で ID を送る設計へ移行し、DB 側の外部キー制約を厳格化する（NOT NULL ＋ FK）方針が望ましいです。

---

必要なら、上記 SQL をベースに具体的なマイグレーションスクリプト（データ移行手順、ロールバック手順含む）まで作成します。次に進めてよいですか？
