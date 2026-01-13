# 演習問題管理データベース設計書（統合版）

## 目次
1. **大学・組織・基本マスタ** (`universities`, `faculties`, `departments`, `teachers`, `subjects`)
2. **ユーザー管理・通知** (`users`, `user_follows`, `user_blocks`, `notifications`)
3. **試験・問題データ** (`exams`, `questions`, `sub_questions`, `question_types`, `file_inputs`)
4. **検索・キーワード** (`keywords`, `question_keywords`, `sub_question_keywords`, 外部ベクトルDB)
5. **ソーシャル・評価（試験）** (`exam_likes`, `exam_bads`, `exam_comments`)
6. **経済・広告・システム** (`mintcoin_transactions`, `user_ad_views`, `learning_histories`)
7. **通報システム（コンテンツ・ユーザー）** (`reports`, `report_reasons`, `report_files` など)

---

## 1. 大学・組織・基本マスタ

### 1.1. `universities` テーブル
大学情報のマスタテーブル。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | 大学ID（Auto Increment） |
| `org_id` | VARCHAR(20) | | 大学ポートレートの組織ID（API連携用） |
| `name` | VARCHAR(255) | | 大学名 |
| `country` | VARCHAR(100) | DEFAULT 'JP' | 国名 |
| `updated_at` | TIMESTAMP | | レコード更新日時 |

#### クライアント参照とIDマッピングのルール（運用）
フロントエンドで参照・選択されるマスタデータ（大学・学部・科目・教授・キーワード・試験名等）に関しては、候補数に応じて取り扱いを以下のように定めます：

- 候補が**15件以下**の場合：バックエンドで INT 型の ID（例: `id`）を管理し、フロントエンドは小規模ルックアップ API（`GET /lookups/{entity}`）で全件取得してローカルでマッピング（id ↔ name）を保持します（TTLキャッシュ推奨）。
- 候補が**15件を超える**場合：フロントエンドはサーバサイド検索API（`GET /search/{entity}?q=...`）を用いたオートコンプリートUIを採用することを推奨します。
- 候補が**50件を超える**場合：オートコンプリートを必須とし、クライアントは全件を事前ロードしないこと（デバウンス、minChars=2、limit=10 のような挙動）を実装してください。

各エンティティは `*_terms` などの補助テーブルで正規化された検索用カラム（`normalized_term`, `phonetic_key` 等）を持ち、検索APIは低遅延で曖昧検索をサポートすること。

### 1.2. `faculties` テーブル
学部情報のマスタテーブル。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | 学部ID |
| `university_id` | INTEGER | FOREIGN KEY → `universities(id)` | 所属大学ID（ON DELETE CASCADE推奨） |
| `name` | VARCHAR(255) | | 学部名 |
| `updated_at` | TIMESTAMP | | レコード更新日時 |

### 1.3. `departments` テーブル
学科情報のマスタテーブル。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | 学科ID |
| `faculty_id` | INTEGER | FOREIGN KEY → `faculties(id)` | 所属学部ID（ON DELETE CASCADE推奨） |
| `name` | VARCHAR(255) | | 学科名 |
| `updated_at` | TIMESTAMP | | レコード更新日時 |

### 1.4. `teachers` テーブル 【新規追加】
教授・教員情報のマスタテーブル。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 教授ID |
| `name` | VARCHAR(255) | NOT NULL | 教授名 |
| `university_id` | INT | FOREIGN KEY → `universities(id)` | 所属大学ID |

### 1.5. `academic_fields` テーブル 【新規追加】
学問分野（情報系、電気電子系等）のマスタテーブル。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 学問分野ID |
| `field_name` | VARCHAR(100) | NOT NULL, UNIQUE | 分野名（例: 情報系、電気電子系、人文系、教養系） |
| `field_type` | VARCHAR(50) | NOT NULL | 分類（science: 理系、humanities: 文系） |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**サンプルデータ**
| field_name | field_type |
| :--- | :--- |
| 情報系 | science |
| 電気電子系 | science |
| 機械系 | science |
| 化学系 | science |
| 人文系 | humanities |
| 教養系 | humanities |

### 1.6. `subjects` テーブル 【新規追加】
科目名のマスタテーブル。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 科目ID |
| `name` | VARCHAR(255) | NOT NULL, UNIQUE | 科目名 |

---

## 2. ユーザー管理・通知

### 2.1. `users` テーブル
ユーザーの基本情報および状態管理。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(255) | PRIMARY KEY, UNIQUE | ユーザーID (UUID) |
| `username` | VARCHAR(255) | NOT NULL, UNIQUE | ログイン用ユーザー名 |
| `university_id` | INTEGER | FOREIGN KEY → `universities(id)` | 大学ID |
| `faculty_id` | INTEGER | FOREIGN KEY → `faculties(id)` | 学部ID |
| `major_type` | INTEGER | NOT NULL | 文理区分（0:理系, 1:文系） |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | メールアドレス |
| `is_email_verified` | BOOLEAN | DEFAULT FALSE | メール認証済みフラグ |
| `password_hash` | VARCHAR(255) | NULL | パスワード（SSO利用時はNULL） |
| `provider` | VARCHAR(50) | NULL | SSOプロバイダー（google等） |
| `provider_user_id` | VARCHAR(255) | NULL | プロバイダー側のID |
| `signup_source` | VARCHAR(100) | NULL | 登録経路 |
| `role` | VARCHAR(50) | DEFAULT 'user' | 権限（user, admin） |
| `status` | VARCHAR(50) | DEFAULT 'active' | 状態（active, banned, deleted等） |
| `deleted_at` | TIMESTAMP | NULL | 論理削除日時 |
| `display_name` | VARCHAR(255) | NULL | 表示名 |
| `bio` | TEXT | NULL | 自己紹介 |
| `language` | VARCHAR(10) | NULL | 使用言語 |
| `country` | VARCHAR(100) | NULL | 国コード |
| `timezone` | VARCHAR(50) | NULL | タイムゾーン |
| `subscription_plan` | VARCHAR(50) | NULL | プラン名 |
| `subscription_start_at`| TIMESTAMP | NULL | サブスク開始日時 |
| `subscription_end_at` | TIMESTAMP | NULL | サブスク終了日時 |
| `last_login_at` | TIMESTAMP | NULL | 最終ログイン日時 |
| `last_password_changed_at`| TIMESTAMP | NULL | 最終パスワード変更日時 |
| `mintcoin_balance` | INTEGER | DEFAULT 0 | MintCoin残高 |
| `follower_count` | INTEGER | DEFAULT 0 | フォロワー数（キャッシュ） |
| `blocked_count` | INTEGER | DEFAULT 0 | 被ブロック数（キャッシュ） |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

### 2.2. `user_follows` テーブル
ユーザー間のフォロー関係。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `follower_id` | INTEGER | NOT NULL | フォローする側のユーザーID |
| `followed_id` | INTEGER | NOT NULL | フォローされる側のユーザーID |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | フォロー日時 |

### 2.3. `user_blocks` テーブル
ユーザー間のブロック関係。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `blocker_id` | INTEGER | FOREIGN KEY → `users(id)` | ブロックする側 |
| `blocked_id` | INTEGER | FOREIGN KEY → `users(id)` | ブロックされる側 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | ブロック日時 |

### 2.4. `notifications` テーブル 【新規追加】
ユーザーへの通知管理。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 通知ID |
| `user_id` | BIGINT | NOT NULL, FOREIGN KEY → `users(id)` | 受信ユーザーID |
| `type` | VARCHAR(50) | NOT NULL | 通知種別（new_comment等） |
| `content` | TEXT | NOT NULL | 通知内容テキスト |
| `link_url` | TEXT | NULL | 遷移先URL |
| `is_read` | BOOLEAN | DEFAULT FALSE | 既読フラグ |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |

---

## 3. 試験・問題データ

### 3.x. 構造図（試験→大問→小問）
```
[exams] 試験メタデータ
  - exam_name / school / subject_id / teacher_id / exam_year / stats(cache)
  - ソーシャル系: good_count / bad_count / comment_count / view_count / ad_count
  └─<1:N> [questions] 大問
        - question_number / level / question_content
        └─<1:N> [sub_questions] 小問
              - sub_question_number / sub_question_type_id / sub_question_content
              - answer_content
              └─<N:1> [question_types] 問題形式マスタ

[keywords] ←→ [question_keywords] (大問キーワード)
           ←→ [sub_question_keywords] (小問キーワード)
```

### 3.1. `exams` テーブル
過去問（試験）単位の管理テーブル。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 試験ID |
| `title` | VARCHAR(255) | **NOT NULL** | **[追加]** 試験名称・タイトル |
| `exam_type` | INT | DEFAULT 0 | **[追加]** 試験形式（0: 定期試験、1: 授業内試験、2: 小テスト） |
| `school` | INT | NOT NULL | 学校ID（`universities.id`想定） |
| `faculty_id` | BIGINT | FOREIGN KEY → `faculties(id)` | **[追加]** 学部ID |
| `teacher_id` | BIGINT | FOREIGN KEY → `teachers(id)` | 教授ID |
| `subject_id` | BIGINT | FOREIGN KEY → `subjects(id)` | 科目ID |
| `exam_year` | INT | NOT NULL | 試験年度 |
| `academic_field_id` | BIGINT | FOREIGN KEY → `academic_fields(id)` | **[追加]** 学問分野ID |
| `academic_track` | INT | DEFAULT 0 | **[追加]** 学位系統（0: 理系、1: 文系） |
| `duration_minutes` | INT | NULL | **[追加]** 所要時間（分） |
| `user_id` | BIGINT | FOREIGN KEY → `users(id)` | 作成者ID |
| `is_public` | BOOLEAN | DEFAULT TRUE | 公開フラグ |
| `status` | VARCHAR(20) | DEFAULT 'active' | コンテンツ状態 |
| `comment_count` | INT | **DEFAULT 0** | **[追加]** コメント数（キャッシュ） |
| `good_count` | INT | DEFAULT 0 | 高評価数 |
| `bad_count` | INT | DEFAULT 0 | 低評価数 |
| `view_count` | INT | DEFAULT 0 | 閲覧数 |
| `ad_count` | INT | DEFAULT 0 | 広告表示完了回数 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

### 3.2. `questions` テーブル
大問単位の問題構造。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 大問ID |
| `exam_id` | BIGINT | FOREIGN KEY → `exams(id)` | 所属試験ID |
| `level` | INT | DEFAULT 0 | 難易度（AI推定など） |
| `question_number` | INT | NOT NULL | 大問番号 |
| `content` | TEXT | NOT NULL | 問題文 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

### 3.3. `sub_questions` テーブル
小問単位の問題構造。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 小問ID |
| `question_id` | BIGINT | FOREIGN KEY → `questions(id)` | 所属大問ID |
| `sub_number` | INT | NOT NULL | 小問番号 |
| `question_type_id` | INT | FOREIGN KEY → `question_types(id)` | 問題タイプID |
| `content` | TEXT | NOT NULL | **[共通]** 問題文（Markdown/LaTeX対応） |
| `answer_explanation` | TEXT | NOT NULL | **[変更]** 模範解答および解説（記述系はここに統合） |
| `execution_options` | JSONB | NULL | **[ID 12用]** 実行環境設定（言語/制限時間など） |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**注意 (2026-01-03)**: `question_format` / `answer_format` の格納は廃止され、DB上から削除されました。レンダリングの判定はコンテンツ内の `$` / `$$` 検出によりフロントエンドで自動判定します。削除に伴うマイグレーションスクリプトは `docs/Z_AGENT_REPORT/migrations/20260103_drop_format_columns.sql` を参照してください。

### 3.4. `question_types` テーブル
問題形式の定義マスタ。

**パターンA: 選択系（ID 1-5）**

| ID | type_name | description |
| :--- | :--- | :--- |
| 1 | 単一選択 | 選択肢から1つを選択（ラジオボタン） |
| 2 | 複数選択 | 複数の正解を選択（チェックボックス） |
| 3 | 正誤判定 | 真偽値判定（True/False） |
| 4 | 組み合わせ | ペアリング/マッチング問題 |
| 5 | 順序並べ替え | シーケンス/順序付け問題 |

**パターンB: 記述系（ID 10-14）**

| ID | type_name | description |
| :--- | :--- | :--- |
| 10 | 記述式 | 自由記述テキスト |
| 11 | 証明問題 | 論理証明・数学証明 |
| 12 | コード記述 | プログラミング記述（実行環境対応） |
| 13 | 翻訳 | 言語翻訳問題 |
| 14 | 数値計算 | 計算問題（許容誤差対応） |

**補足**  
- **ID 1-3（選択系）**: `sub_question_selection` テーブルで選択肢リストを管理。各選択肢に `is_correct` フラグで正解を定義。  
- **ID 4（組み合わせ）**: `sub_question_matching` テーブルで左右項目のペアを管理。正解はペア構成そのもので定義。  
- **ID 5（順序並べ替え）**: `sub_question_ordering` テーブルで要素と正解順序を管理。`correct_order` カラムで序列を定義。  
- **ID 10-14（記述系）**: `sub_questions` の `answer_explanation` カラムに模範解答と解説を統合。選択肢等の補助テーブル不要。  
- **ID 12（コード記述）**: `execution_options` (JSON) に実行環境設定（言語/タイムアウト等）を保持。  

### 3.5. `sub_question_selection` テーブル 【新規】
**対象ID: 1 (単一選択), 2 (複数選択), 3 (正誤判定)**  
選択肢リストを管理するテーブル。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `sub_question_id` | BIGINT | FOREIGN KEY → `sub_questions(id)` | 対象小問 |
| `content` | TEXT | NOT NULL | 選択肢の文言（Markdown/LaTeX対応） |
| `is_correct` | BOOLEAN | DEFAULT FALSE | 正解フラグ |
| `sort_order` | INT | DEFAULT 0 | 表示順 |

### 3.6. `sub_question_matching` テーブル 【新規】
**対象ID: 4 (組み合わせ)**  
左側の項目と右側の項目のペアを管理するテーブル。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `sub_question_id` | BIGINT | FOREIGN KEY → `sub_questions(id)` | 対象小問 |
| `left_content` | TEXT | NOT NULL | 左側の項目（問題側） |
| `right_content` | TEXT | NOT NULL | 右側の項目（解答側） |
| `sort_order` | INT | DEFAULT 0 | 表示順（左側項目の順序） |

### 3.7. `sub_question_ordering` テーブル 【新規】
**対象ID: 5 (順序並べ替え)**  
並べ替え対象の要素と正解順序を管理するテーブル。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `sub_question_id` | BIGINT | FOREIGN KEY → `sub_questions(id)` | 対象小問 |
| `content` | TEXT | NOT NULL | 要素の文言 |
| `correct_order` | INT | NOT NULL | 正解となる順序（1, 2, 3...） |

### 3.8. `file_inputs` テーブル
元データ（PDF/テキスト）管理。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ファイルID |
| `exam_id` | BIGINT | FOREIGN KEY → `exams(id)` | 紐づく試験ID |
| `user_id` | BIGINT | **NOT NULL, FOREIGN KEY → `users(id)`** | **[追加]** アップロードユーザー |
| `file_path` | TEXT | NOT NULL | S3パス等 |
| `original_filename` | TEXT | **NOT NULL** | **[追加]** 元ファイル名 |
| `file_type` | VARCHAR(10) | NOT NULL | ファイル拡張子/タイプ |
| `source_type` | VARCHAR(50) | **NOT NULL** | **[追加]** 生成元タイプ (lecture-notes/past-exam) |
| `analyzed` | BOOLEAN | DEFAULT FALSE | （旧）処理済みフラグ |
| `analysis_status` | VARCHAR(50) | **DEFAULT 'pending'** | **[追加]** AI分析ステータス |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |

---

## 4. 検索・キーワード

### 4.1. `keywords` テーブル
キーワードマスタ。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | キーワードID |
| `keyword` | VARCHAR(100) | UNIQUE, NOT NULL | キーワード文字列 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

### 4.2. `question_keywords` テーブル
大問とキーワードの関連付け。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `question_id` | BIGINT | FOREIGN KEY → `questions(id)` | 大問ID |
| `keyword_id` | BIGINT | FOREIGN KEY → `keywords(id)` | キーワードID |
| `relevance_score` | FLOAT | NULL | 関連度 |
| UNIQUE | | (`question_id`, `keyword_id`) | 重複防止 |

### 4.3. `sub_question_keywords` テーブル
小問とキーワードの関連付け。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `sub_question_id` | BIGINT | FOREIGN KEY → `sub_questions(id)` | 小問ID |
| `keyword_id` | BIGINT | FOREIGN KEY → `keywords(id)` | キーワードID |
| `relevance_score` | FLOAT | NULL | 関連度 |
| UNIQUE | | (`sub_question_id`, `keyword_id`) | 重複防止 |

### 4.4. `subject_terms` テーブル
ユーザーが登録した科目名や派生ワードを検索オートコンプリート向けに正規化して保持します。`subjects`マスタと分離し、表記ゆれ・読み間違い（ひらがな/カタカナ/ローマ字/英語・誤記）を格納することで、単純な完全一致だけでなく「あいまい検索 → 候補提示」までカバーします。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | レコードID |
| `subject_id` | BIGINT | FOREIGN KEY → `subjects(id)` | 対応する科目マスタID |
| `term` | VARCHAR(255) | NOT NULL | 表示用科目名（ユーザー入力値） |
| `hiragana` | VARCHAR(255) | NULL | ひらがな表記 |
| `katakana` | VARCHAR(255) | NULL | カタカナ表記 |
| `romaji` | VARCHAR(255) | NULL | ローマ字表記 |
| `english_name` | VARCHAR(255) | NULL | 英語表記 |
| `phonetic_key` | VARCHAR(255) | NULL | 読み違い吸収用の音声キー（例: Double Metaphone、カナ正規化） |
| `normalized_term` | VARCHAR(255) | NOT NULL | 検索用に正規化した文字列（大文字小文字統一等） |
| `language` | VARCHAR(10) | DEFAULT 'ja' | 言語コード（多言語対応用） |
| `variant_type` | VARCHAR(50) | DEFAULT 'alias' | official/alias/abbreviation/typo 等の分類 |
| `confidence_score` | DECIMAL(3,2) | DEFAULT 0.80 | 候補表示の優先度（0〜1） |
| `usage_count` | INT | DEFAULT 0 | サジェストに採用された回数（ランキング用） |
| `is_primary` | BOOLEAN | DEFAULT FALSE | 代表表記かどうか |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |
| UNIQUE | | (`subject_id`, `normalized_term`) | 同一科目内での重複防止 |

### 4.5. `university_terms` テーブル
大学名のバリエーション（正式名称/略称/言語別表記）を予測候補表示に活用します。将来的にAPI連携から大学名が増えるケースも考慮し、`universities`マスタと疎結合に保持します。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | レコードID |
| `university_id` | BIGINT | FOREIGN KEY → `universities(id)` | 対応する大学マスタID |
| `term` | VARCHAR(255) | NOT NULL | 入力時に表示する名称（例: 東大） |
| `hiragana` | VARCHAR(255) | NULL | ひらがな表記 |
| `katakana` | VARCHAR(255) | NULL | カタカナ表記 |
| `romaji` | VARCHAR(255) | NULL | ローマ字表記 |
| `english_name` | VARCHAR(255) | NULL | 英語表記 |
| `phonetic_key` | VARCHAR(255) | NULL | 読み違い吸収用音声キー |
| `normalized_term` | VARCHAR(255) | NOT NULL | 検索用正規化文字列 |
| `language` | VARCHAR(10) | DEFAULT 'ja' | 言語コード |
| `variant_type` | VARCHAR(50) | DEFAULT 'alias' | official/alias/abbreviation/typo 等 |
| `confidence_score` | DECIMAL(3,2) | DEFAULT 0.80 | 候補優先度 |
| `usage_count` | INT | DEFAULT 0 | サジェスト利用回数 |
| `is_primary` | BOOLEAN | DEFAULT FALSE | 代表表記かどうか |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |
| UNIQUE | | (`university_id`, `normalized_term`) | 同一大学内の重複防止 |

### 4.6. `faculty_terms` テーブル
学部名の表記ゆれを管理し、大学名と組み合わせた高速サジェストに利用します。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | レコードID |
| `faculty_id` | BIGINT | FOREIGN KEY → `faculties(id)` | 対応する学部マスタID |
| `term` | VARCHAR(255) | NOT NULL | 表示用名称（例: 工学部） |
| `hiragana` | VARCHAR(255) | NULL | ひらがな表記 |
| `katakana` | VARCHAR(255) | NULL | カタカナ表記 |
| `romaji` | VARCHAR(255) | NULL | ローマ字表記 |
| `english_name` | VARCHAR(255) | NULL | 英語表記 |
| `phonetic_key` | VARCHAR(255) | NULL | 読み違い吸収用音声キー |
| `normalized_term` | VARCHAR(255) | NOT NULL | 検索用正規化文字列 |
| `language` | VARCHAR(10) | DEFAULT 'ja' | 言語コード |
| `variant_type` | VARCHAR(50) | DEFAULT 'alias' | official/alias/abbreviation/typo 等 |
| `confidence_score` | DECIMAL(3,2) | DEFAULT 0.80 | 候補優先度 |
| `usage_count` | INT | DEFAULT 0 | サジェスト利用回数 |
| `is_primary` | BOOLEAN | DEFAULT FALSE | 代表表記かどうか |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |
| UNIQUE | | (`faculty_id`, `normalized_term`) | 同一学部内の重複防止 |

### 4.7. `teacher_terms` テーブル
教授名の揺らぎ（漢字違い/読み違い/英語名）を補完します。ユーザーが新規教授を登録するケースを想定しています。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | レコードID |
| `teacher_id` | BIGINT | FOREIGN KEY → `teachers(id)` | 対応する教授マスタID |
| `term` | VARCHAR(255) | NOT NULL | 表示用名称 |
| `hiragana` | VARCHAR(255) | NULL | ひらがな表記 |
| `katakana` | VARCHAR(255) | NULL | カタカナ表記 |
| `romaji` | VARCHAR(255) | NULL | ローマ字表記 |
| `english_name` | VARCHAR(255) | NULL | 英語表記 |
| `phonetic_key` | VARCHAR(255) | NULL | 読み違い吸収用音声キー |
| `normalized_term` | VARCHAR(255) | NOT NULL | 検索用正規化文字列 |
| `language` | VARCHAR(10) | DEFAULT 'ja' | 言語コード |
| `variant_type` | VARCHAR(50) | DEFAULT 'alias' | official/alias/abbreviation/typo 等 |
| `confidence_score` | DECIMAL(3,2) | DEFAULT 0.80 | 候補優先度 |
| `usage_count` | INT | DEFAULT 0 | サジェスト利用回数 |
| `is_primary` | BOOLEAN | DEFAULT FALSE | 代表表記かどうか |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |
| UNIQUE | | (`teacher_id`, `normalized_term`) | 同一教授内の重複防止 |

### 4.8. `term_generation_jobs` テーブル（edumintAiWorker連携）
オートコンプリート用の候補をLLM（Gemini等）で自動生成するためのジョブキュー。`edumintContent` / `edumintSearch` からレコード作成 → Kafka `term-generation.jobs` へPublish → `edumintAiWorker` が消費し、LLM API（Gemini 1.5 等）をコールして結果を `term_generation_candidates` に書き込みます。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | ジョブID |
| `entity_type` | VARCHAR(30) | NOT NULL | `university` / `faculty` / `teacher` / `subject` |
| `entity_id` | BIGINT | NOT NULL | 対象エンティティID |
| `status` | VARCHAR(20) | DEFAULT 'pending' | `pending` / `processing` / `completed` / `failed` |
| `trigger_type` | VARCHAR(30) | DEFAULT 'system' | `system`（自動）、`user`（リクエスト）等 |
| `requested_by` | BIGINT | NULL | 発火ユーザーID（システムならNULL） |
| `llm_model` | VARCHAR(50) | DEFAULT 'gemini-1.5-pro-latest' | 使用モデル名 |
| `prompt_payload` | JSONB | NOT NULL | LLMへ送るプロンプト（エンティティのメタ情報含む） |
| `response_raw` | JSONB | NULL | LLMのレスポンス全文（監査/再処理用） |
| `retry_count` | INT | DEFAULT 0 | 再試行回数 |
| `error_message` | TEXT | NULL | 失敗理由 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 生成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

### 4.9. `term_generation_candidates` テーブル
LLMから返却された候補語を保持します。ヒューマンレビューは行わず、`auto_adopted` フラグをONにしたものは即座に `*_terms` テーブルへ反映し、オートコンプリートに使用します。将来的にルール変更する際にロールバックできるよう、生データを保持します。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | 候補ID |
| `job_id` | BIGINT | FOREIGN KEY → `term_generation_jobs(id)` | 生成元ジョブ |
| `entity_type` | VARCHAR(30) | NOT NULL | ジョブの対象と整合性を取る |
| `entity_id` | BIGINT | NOT NULL | 対象エンティティID |
| `suggested_term` | VARCHAR(255) | NOT NULL | LLMが返した候補文字列 |
| `hiragana` | VARCHAR(255) | NULL | LLMから取得/後処理で付与 |
| `katakana` | VARCHAR(255) | NULL | 同上 |
| `romaji` | VARCHAR(255) | NULL | 同上 |
| `english_name` | VARCHAR(255) | NULL | 同上 |
| `normalized_term` | VARCHAR(255) | NOT NULL | 正規化した文字列 |
| `phonetic_key` | VARCHAR(255) | NULL | 読み間違い吸収用キー |
| `variant_type` | VARCHAR(50) | DEFAULT 'llm_alias' | LLM由来であることを示す |
| `confidence_score` | DECIMAL(3,2) | DEFAULT 0.75 | LLMレスポンスに基づく信頼度 |
| `auto_adopted` | BOOLEAN | DEFAULT FALSE | TRUEなら即`*_terms`へ同期済み |
| `adopted_term_id` | BIGINT | NULL | 取り込んだ`*_terms`のID（自動採用後に記録） |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

#### 自動採用フロー
1. `term_generation_jobs` レコード作成 → KafkaへPublish (`edumintContent` or `edumintSearch`)  
2. `edumintAiWorker` がジョブをConsumeし、Gemini等のLLM APIへリクエスト。通信ログは `prompt_payload` / `response_raw` に保存。  
3. レスポンスを解析し、`term_generation_candidates` に候補を複数行挿入。  
4. スコアやフィルタ条件（禁止語、`confidence_score` 閾値等）を満たす候補は自動的に `*_terms` テーブルへInsertし、`auto_adopted = TRUE`, `adopted_term_id` を設定。  
5. 失敗した場合は `status='failed'` と `error_message` を更新し、再試行可否を `retry_count` で制御。

### 4.10. 外部ベクトルDB 要件（参考）
*   **次元数**: モデル依存（例: 1536次元）
*   **レコード**: ID, ベクトル配列, メタデータ（keyword_id等）

> **表記ゆれ対応方針**: それぞれの `*_terms` テーブルで、(1) 生テキスト、(2) 表記種別、(3) 音声キー、(4) 正規化文字列、(5) 信頼スコア／使用回数を保持し、  
> - 入力値を正規化 → `normalized_term` による完全一致検索  
> - `phonetic_key` やひらがな/カタカナでの前方一致 → 誤入力・読み間違い補正  
> - `variant_type` と `confidence_score`, `usage_count` を使ったランキング  
> という3段階で候補を提示します。`term_generation_jobs` + `term_generation_candidates` を通じて edumintAiWorker がLLM APIと連携し、表記ゆれデータを継続的に拡張します。

---

## 5. ソーシャル・評価（試験）

### 5.1. `exam_likes` テーブル
試験への「いいね」管理。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `exam_id` | BIGINT | FOREIGN KEY → `exams(id)` | 試験ID |
| `user_id` | BIGINT | FOREIGN KEY → `users(id)` | ユーザーID |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 日時 |
| UNIQUE | | (`exam_id`, `user_id`) | 重複防止 |

### 5.2. `exam_bads` テーブル
試験への「bad（低評価）」管理。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `exam_id` | BIGINT | FOREIGN KEY → `exams(id)` | 試験ID |
| `user_id` | BIGINT | FOREIGN KEY → `users(id)` | ユーザーID |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 日時 |
| UNIQUE | | (`exam_id`, `user_id`) | 重複防止 |

### 5.3. `exam_comments` テーブル
試験へのコメント管理。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `exam_id` | BIGINT | FOREIGN KEY → `exams(id)` | 試験ID |
| `user_id` | BIGINT | FOREIGN KEY → `users(id)` | ユーザーID |
| `comment` | TEXT | NOT NULL | 本文 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

---

## 6. 経済・広告・システム

### 6.1. `mintcoin_transactions` テーブル
ゲーム内通貨（MintCoin）の取引履歴。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | トランザクションID |
| `user_id` | INTEGER | FOREIGN KEY → `users(id)` | ユーザーID |
| `amount` | INTEGER | NOT NULL | 増減額 |
| `type` | VARCHAR(50) | NOT NULL | 取引種別（earn, spend） |
| `description` | TEXT | NULL | 内容 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 日時 |

### 6.2. `user_ad_views` テーブル
ユーザーの広告視聴履歴。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `user_id` | BIGINT | FOREIGN KEY → `users(id)` | ユーザーID |
| `exam_id` | BIGINT | FOREIGN KEY → `exams(id)` | 試験ID |
| `action_type` | VARCHAR(50) | NOT NULL | トリガーアクション種別 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 完了日時 |
| UNIQUE | | (`user_id`, `exam_id`, `action_type`) | 重複防止 |

### 6.3. `learning_histories` テーブル 【新規追加】
ユーザーの学習（閲覧）履歴。検索画面での「閲覧履歴」フィルタリング等に使用します。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `user_id` | BIGINT | FOREIGN KEY → `users(id)` | ユーザーID |
| `exam_id` | BIGINT | FOREIGN KEY → `exams(id)` | 試験ID |
| `viewed_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 閲覧日時 |

---

## 7. 通報システム

※本システムでは「コンテンツ（問題・解答）」に対する通報と、「ユーザー（プロフィール・行動）」に対する通報の2系統が存在します。

### 7.1. コンテンツ通報（試験・問題）

#### 7.1.1. `content_reports` テーブル
※元の`reports`（セクション13）に該当

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 通報ID |
| `reporter_user_id` | BIGINT | FOREIGN KEY → `users(id)` | 通報者ID |
| `content_type` | VARCHAR(50) | NOT NULL | 種別 (exam, question等) |
| `question_id` | BIGINT | NOT NULL | コンテンツID（名称はquestion_idだがexam_id等も入る） |
| `reason_id` | INT | FOREIGN KEY → `content_report_reasons(id)` | 理由ID |
| `details` | TEXT | NULL | 詳細 |
| `status` | VARCHAR(50) | DEFAULT 'pending' | 対応状況 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 通報日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

#### 7.1.2. `content_report_reasons` テーブル
※元の`report_reasons`（セクション14）に該当

| ID | 理由テキスト | 説明 |
| :--- | :--- | :--- |
| 1 | 解答が不正確・間違っている | 生成された解答の誤り |
| 2 | 問題文が不明瞭・誤字がある | 意味不明瞭、誤字脱字 |
| 3 | 問題と解答の対応が不適切 | 不一致 |
| 4 | 著作権を侵害している疑い | 無断転載 |
| 5 | 不適切な表現を含んでいる | 公序良俗違反 |
| 6 | スパム・宣伝目的である | 宣伝など |
| 99 | その他 | その他 |

#### 7.1.3. `report_files` テーブル
コンテンツ通報に添付される証拠ファイル等。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ファイルID |
| `report_id` | BIGINT | FOREIGN KEY → `content_reports(id)` | 通報ID |
| `file_path` | TEXT | NOT NULL | 保存パス |
| `file_type` | VARCHAR(50) | NOT NULL | 形式 |
| `original_filename` | TEXT | NULL | 元ファイル名 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |

---

### 7.2. ユーザー通報（プロフィール・迷惑行為）

#### 7.2.1. `user_reports` テーブル
※元の`reports`（セクション5）に該当

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 通報ID |
| `reporter_user_id` | BIGINT | FOREIGN KEY → `users(id)` | 通報者ID |
| `content_type` | VARCHAR(50) | NOT NULL | 種別（sub_question, comment等も含む広義のユーザー行動） |
| `content_id` | BIGINT | NOT NULL | 対象ID |
| `reason_id` | INT | FOREIGN KEY → `user_report_reasons(id)` | 理由ID |
| `details` | TEXT | NULL | 詳細 |
| `status` | VARCHAR(50) | DEFAULT 'pending' | 状況 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 通報日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

#### 7.2.2. `user_report_reasons` テーブル
※元の`report_reasons`（セクション6）に該当

| ID | 理由テキスト | 説明 |
| :--- | :--- | :--- |
| 1 | 嫌がらせ・誹謗中傷 | 攻撃的発言、いじめ等 |
| 2 | 不適切なプロフィール | 画像・自己紹介の不適切さ |
| 3 | スパム・迷惑行為 | 宣伝、大量投稿 |
| 4 | なりすまし | 本人詐称 |
| 5 | 差別・ヘイトスピーチ | 差別的発言 |
| 6 | プライバシーの侵害 | 個人情報公開 |
| 7 | 不正行為 | 複数垢、システム不正 |
| 99 | その他 | その他 |
