# データベース構成・設計定義

**Version**: 2.0 (PostgreSQL 18.1 + pgvector)  
**Last Updated**: 2026-02-02

---

## 0. **データベース物理分割構成**

edumintContentサービスは、**CQRSアーキテクチャとセキュリティの観点から2つの物理的に分離されたデータストア**を使用しています。

**重要**: edumintContentは**コンテンツの正データ（Source of Truth）を管理するサービス**であり、検索・ソート・絞り込み・順位づけなどの検索機能は**edumintSearchサービス**で実行します。edumintContentはedumintSearchへのデータレプリケーション元として機能します。

### メインデータベース (`edumint_content`) - Command Model (Source of Truth)
- **用途**: ビジネスロジック、メタデータ、統計情報、**edumintSearchへのレプリケーション用ソースデータ**
- **エンジン**: PostgreSQL 18.1 + pgvector 0.8+
- **特性**: トランザクション整合性、高頻度更新、複雑なJOIN
- **接続情報**: `MAIN_DB_HOST`, `MAIN_DB_USER`, `MAIN_DB_PASSWORD`, `MAIN_DB_NAME`
- **含まれるテーブル**: `exams`, `questions`, `sub_questions`, `keywords`, `exam_stats`, `users` 等
- **CQRS役割**: Command Model（正データのSource of Truth）- 検索クエリはedumintSearchで処理
- **重要**: ジョブ管理は**edumintGateway**に移行済み（`jobs`テーブル）、CDC Outboxパターンは廃止しKafka直接publishに変更

### 生データベース (`edumint_secret_raw`) - Secure Storage
- **用途**: 生ファイルデータ（BLOB）の保管専用
- **エンジン**: PostgreSQL 18.1
- **特性**: 低頻度アクセス、書き込み専用、暗号化対象
- **接続情報**: `RAW_DB_HOST`, `RAW_DB_USER`, `RAW_DB_PASSWORD`, `RAW_DB_NAME`
- **含まれるテーブル**: `raw_exam`, `raw_source`
- **セキュリティポリシー**: 
  - 作成後7日経過したデータは自動暗号化（AES-256-GCM予定）
  - アプリケーション層からは読み取り専用
  - 抽出ワーカーのみ書き込み権限を保持

### なぜ2層構成なのか？
1. **役割分離**: edumintContentは正データ管理、edumintSearchは検索処理と明確に分離
2. **セキュリティ**: 生データ（BLOB）は物理的に分離して厳格なアクセス制御
3. **スケーラビリティ**: 検索負荷はedumintSearchで処理、書き込み負荷はedumintContentで処理
4. **データ整合性**: CDC（Debezium）経由でedumintSearchへ確実にレプリケーション
5. **ベクトルカラム維持**: レプリケーション用ソースとしてpgvectorカラムを保持（検索処理はedumintSearchで実行）

### 検索サービス（edumintSearch）へのデータ連携

**全ての検索機能**（コンテンツ検索、ソート、絞り込み、順位づけ）は専用マイクロサービス **edumintSearch** で実行します。

#### edumintSearchの責務
- **検索エンジン**: **Elasticsearch 9.2.4**（ハイブリッド検索・日本語全文検索対応・Current stable 2026-01-13）
- **ベクトル検索**: Elasticsearchの `dense_vector` フィールド + kNN検索
- **キーワード検索**: Elasticsearchの `match` / `terms` クエリ
- **日本語全文検索**: `kuromoji` アナライザーを使用
- **フィルタリング**: 大学、年度、難易度などのHard Filter
- **ソート・順位づけ**: ハイブリッドスコアリング（キーワード + ベクトル類似度）

#### edumintContentの責務（本サービス）
- **正データ管理**: コンテンツのSource of Truth
- **データ同期**: CDC（Debezium）経由で `content.lifecycle` トピックからedumintSearchへレプリケーション
- **ベクトルカラム**: Elasticsearchへの同期用ソースとして維持（検索処理には使用しない）
- **メタデータ管理**: 試験、問題、キーワード等のCRUD操作
- **ジョブ管理**: AI処理ジョブの進捗管理
- **統計情報**: 閲覧数、評価数等の集計

> **注意**: edumintContent内では検索クエリを実行しません。検索APIは全てedumintSearchが提供します。

---

## 1. 共通制約・ID戦略

- **RDBMS**: PostgreSQL 18.1
- **Character Set**: UTF-8 / **Collation**: `C.UTF-8` または `ja_JP.UTF-8`
- **拡張機能**: 
  ```sql
  -- 必須拡張の有効化
  CREATE EXTENSION IF NOT EXISTS "vector";       -- pgvector拡張
  -- 注意: PostgreSQL 18 以降では組み込みで `uuidv7()` を提供します。
  ```

> **注意**: PostgreSQL 18（2025年秋リリース）以降では、`uuidv7()` が組み込みで利用可能です（RFC9562準拠）。本ドキュメントは PostgreSQL 18 を前提としています。アプリケーション側で生成する場合は `google/uuid` ライブラリによる UUID v7 生成も可能です。

### ID設計（PostgreSQL 18.1 - uuidv7 ネイティブ）

| 用途 | 型 | 説明 |
|:---|:---|:---|
| **Primary Key** | `UUID` | UUID v7（時系列ソート可能、`uuidv7()` 関数使用） |
| **Public (URL露出用)** | `CHAR(16)` | NanoID 16文字（URL-safe、予測不可能、人間可読性） |
| **Static (組織マスタ)** | `INTEGER / SMALLINT` | `GENERATED ALWAYS AS IDENTITY` |

#### なぜUUID v7をPKにするのか？
- **時系列ソート**: UUID v7はタイムスタンプが埋め込まれており、B-treeインデックスでの時系列検索が高速
- **分散生成対応**: 単調増加なAUTO_INCREMENTと異なり、複数ノードでの並列生成が可能
- **内部JOIN最適化**: FK参照が全てUUID同士なので、型変換オーバーヘッドがない

#### なぜNanoIDをpublic_idに分離するのか？
- **機密性**: NanoIDはランダム文字列のため、UUID v7のようにタイムスタンプから推測されない
- **URL露出**: APIレスポンスやURLパスには予測不可能なNanoIDを使用
- **内部・外部の分離**: 内部処理はUUID、外部公開はNanoIDと明確に分離

### ID戦略の実装例
```go
// Public ID生成（API レスポンス用 - URLやレスポンスに露出）
// github.com/matoous/go-nanoid/v2
publicID, _ := gonanoid.New(16) // "xQ8kB2nM7pLwR4vY"

// Primary Key生成（DB PK用） - PostgreSQL 18.1では uuidv7() を使用
// Goからは google/uuid ライブラリを使用
primaryKey := uuid.Must(uuid.NewV7()) // UUIDv7 (時系列順・PK)

// PostgreSQL側での生成（PostgreSQL 18 以降は組み込みの uuidv7() を使用）
// SELECT uuidv7(); -- PostgreSQL 18 で利用可能
```

### pgvector設定（レプリケーション用ソース）

> **注意**: ベクトルカラムはedumintSearchへのレプリケーション用ソースとして維持します。edumintContent内での検索処理には使用しません。HNSWインデックスは、将来的なフォールバック用または開発環境用として定義していますが、本番環境での検索はedumintSearchで実行します。

```sql
-- ベクトル次元数: gemini-embedding-001 = 1536次元（MRL適用）
-- レプリケーション用ソースデータとして維持
SET maintenance_work_mem = '2GB';  -- インデックス構築用メモリ
SET max_parallel_maintenance_workers = 4;  -- 並列インデックス構築
```

### 冪等性保証
- **client_request_id**: APIリクエストごとに一意なUUIDv7を受け取り、`exam_creation_jobs.client_request_id` (UNIQUE制約) で重複リクエストを検出。
- **リトライポリシー**: AI処理ジョブのリトライ上限は**3回**。上限超過時は `status_id = 5 (Failed)` で停止し、手動復旧を待機。

### 統計分離ポリシー
- 更新頻度の高い `view_count`, `good_count`, `bad_count` 等は、行ロック競合回避のため `exam_stats` テーブルへ分離。
- `exam_stats.exam_id` は `exams.id` (UUID v7) を参照。

---

## 2. 組織・教員・科目マスタ（Master Data）

### 2.1 大学・学部（国別分割・Static IDモデル）
フロントエンドでの全件ロードを前提とした超軽量設計。

```sql
CREATE TABLE universities_jp (
  id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug VARCHAR(100) NOT NULL,
  -- 物理言語カラム
  name_en VARCHAR(255) NOT NULL,
  name_ja VARCHAR(255) NOT NULL,
  name_zh_hans VARCHAR(255) NOT NULL,
  name_zh_hant VARCHAR(255) NOT NULL,
  name_vi VARCHAR(255) NOT NULL,
  name_ko VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_univ_slug UNIQUE (slug)
);
COMMENT ON TABLE universities_jp IS '大学マスタ（日本国内向け。国際展開時は universities_xx として別テーブルを作成）';
COMMENT ON COLUMN universities_jp.id IS '内部管理・API通信用ID（SMALLINT上限32,767件・日本国内大学数で十分）';
COMMENT ON COLUMN universities_jp.slug IS 'SEO/URL用英語スラグ';

CREATE TABLE faculties_jp (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  university_id SMALLINT NOT NULL REFERENCES universities_jp(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL,
  -- 物理言語カラム
  name_en VARCHAR(255) NOT NULL,
  name_ja VARCHAR(255) NOT NULL,
  name_zh_hans VARCHAR(255) NOT NULL,
  name_zh_hant VARCHAR(255) NOT NULL,
  name_vi VARCHAR(255) NOT NULL,
  name_ko VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_fac_slug UNIQUE (slug)
);
CREATE INDEX idx_faculties_university_id ON faculties_jp (university_id);
COMMENT ON TABLE faculties_jp IS '学部マスタ（日本国内向け。国際展開時は faculties_xx として別テーブルを作成）';
COMMENT ON COLUMN faculties_jp.id IS '内部管理・API通信用ID';
COMMENT ON COLUMN faculties_jp.slug IS 'SEO/URL用英語スラグ';
```

### 2.2 教員・科目（UUID v7 & 物理カラムモデル）

```sql
CREATE TABLE teachers_jp (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id CHAR(16) NOT NULL UNIQUE,
  university_id SMALLINT NOT NULL REFERENCES universities_jp(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL,
  -- 教員名は日本版では日本語メイン、英語はオプション
  name_ja VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_teacher_jp_slug UNIQUE (university_id, slug)
);
CREATE INDEX idx_teachers_jp_public_id ON teachers_jp (public_id);
CREATE INDEX idx_teachers_jp_university_id ON teachers_jp (university_id);
COMMENT ON TABLE teachers_jp IS '教員マスタ（日本国内向け）';
COMMENT ON COLUMN teachers_jp.id IS 'UUID v7 (PK)';
COMMENT ON COLUMN teachers_jp.public_id IS 'Public NanoID (URL露出用)';
COMMENT ON COLUMN teachers_jp.slug IS 'SEO/URL用英語スラグ';
COMMENT ON COLUMN teachers_jp.name_ja IS '教員名（日本語・必須）';
COMMENT ON COLUMN teachers_jp.name_en IS '教員名（英語・任意）';

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id CHAR(16) NOT NULL UNIQUE,
  faculty_id INTEGER NOT NULL REFERENCES faculties_jp(id) ON DELETE CASCADE,
  slug VARCHAR(150) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ja VARCHAR(255) NOT NULL,
  name_zh_hans VARCHAR(255) NOT NULL,
  name_zh_hant VARCHAR(255) NOT NULL,
  name_vi VARCHAR(255) NOT NULL,
  name_ko VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_subject_slug UNIQUE (faculty_id, slug)
);
CREATE INDEX idx_subjects_public_id ON subjects (public_id);
CREATE INDEX idx_subjects_faculty_id ON subjects (faculty_id);
COMMENT ON TABLE subjects IS '科目マスタ';
COMMENT ON COLUMN subjects.id IS 'UUID v7 (PK)';
COMMENT ON COLUMN subjects.public_id IS 'Public NanoID (URL露出用)';
COMMENT ON COLUMN subjects.slug IS 'SEO/URL用英語スラグ';
```

---

## 3. 試験・問題コア（Core Entities） - メインDB

### 3.1 試験（exams） - 試験メタデータ

```sql
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id CHAR(16) NOT NULL UNIQUE,
  exam_name VARCHAR(200) NOT NULL,
  
  -- === 試験メタデータ（Hard Filter用） ===
  university_id SMALLINT NOT NULL REFERENCES universities_jp(id) ON DELETE RESTRICT,
  faculty_id INTEGER NOT NULL REFERENCES faculties_jp(id) ON DELETE RESTRICT,
  teacher_id UUID NOT NULL REFERENCES teachers_jp(id) ON DELETE RESTRICT,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  author_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  exam_year INTEGER NOT NULL,
  exam_type_id SMALLINT NOT NULL DEFAULT 0,
  academic_field_id SMALLINT NOT NULL DEFAULT 0,
  language_id SMALLINT NOT NULL DEFAULT 0,
  is_humanities BOOLEAN NOT NULL DEFAULT FALSE,
  duration_minutes SMALLINT NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ(6) NULL,
  
  -- 進行状態（数値IDで管理 - Section 4.1参照）
  status_id SMALLINT NOT NULL DEFAULT 0,

  -- 生データへのポインタ（別DB参照 - 論理結合のみ）
  has_raw_data BOOLEAN NOT NULL DEFAULT FALSE,
  original_input_source VARCHAR(20) NULL
    CHECK (original_input_source IN ('text_form', 'file_upload', 'api_import')),
  latest_raw_exam_id UUID NULL,
  latest_raw_source_id UUID NULL,
  
  -- 暗号化
  encryption_version SMALLINT DEFAULT 0,
  
  -- 監査
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ(6) NULL,
  created_by UUID NULL,
  updated_by UUID NULL
);

-- インデックス
CREATE INDEX idx_exams_public_id ON exams (public_id);
CREATE INDEX idx_exams_univ_fac ON exams (university_id, faculty_id);
CREATE INDEX idx_exams_subject_id ON exams (subject_id);
CREATE INDEX idx_exams_status_id ON exams (status_id);
CREATE INDEX idx_exams_deleted_at ON exams (deleted_at);
CREATE INDEX idx_exams_is_public ON exams (is_public) WHERE is_public = TRUE;
CREATE INDEX idx_exams_created_at ON exams (created_at);

-- 全文検索インデックス（試験名の自然言語検索用）
CREATE INDEX idx_exams_exam_name_fulltext ON exams 
  USING GIN (to_tsvector('simple', exam_name));

COMMENT ON TABLE exams IS '試験（Command Model）';
COMMENT ON COLUMN exams.id IS 'UUID v7 (PK・時系列ソート可能)';
COMMENT ON COLUMN exams.public_id IS 'Public NanoID (URL露出用・予測不可能)';
COMMENT ON COLUMN exams.exam_type_id IS '0=REGULAR, 1=INCLASS, 2=QUIZ';
COMMENT ON COLUMN exams.academic_field_id IS '0-26 (分野)';
COMMENT ON COLUMN exams.language_id IS '0=ja, 1=en, 2=zh, 3=ko, 4=other';
COMMENT ON COLUMN exams.status_id IS 'generation_phase: 0-39';
COMMENT ON COLUMN exams.latest_raw_exam_id IS 'raw_exam.id (別DB)';
COMMENT ON COLUMN exams.latest_raw_source_id IS 'raw_source.id (別DB)';
COMMENT ON COLUMN exams.exam_name IS '試験名（全文検索対象: GIN + tsvector）';
```

### 3.2 大問・小問（Separated Tables）

大問（Questions）と小問（SubQuestions）は、属性が全く異なるため、物理的に別々のテーブルとして定義します。

#### 大問（Context/Parent） - 大問メタデータ + ベクトル検索

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id CHAR(16) NOT NULL UNIQUE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  
  sort_order REAL NOT NULL DEFAULT 0,
  question_content TEXT NOT NULL,
  
  -- === 大問メタデータ（Hard Filter用） ===
  difficulty_level_id SMALLINT NOT NULL DEFAULT 0,
  
  -- キーワード管理（JSONB配列でID保存）
  keyword_ids JSONB NULL,
  
  -- ベクトル検索用Embedding（gemini-embedding-001: 1536次元）
  -- question_content + メタデータを結合してベクトル化
  question_content_embedding_gemini vector(1536) NULL,
  
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ(6) NULL
);

-- インデックス
CREATE INDEX idx_questions_public_id ON questions (public_id);
CREATE INDEX idx_questions_exam_sort ON questions (exam_id, sort_order);
CREATE INDEX idx_questions_deleted_at ON questions (deleted_at);
CREATE INDEX idx_questions_keyword_ids ON questions USING GIN (keyword_ids);
CREATE INDEX idx_questions_created_at ON questions (created_at);

-- HNSWインデックス（ベクトル検索用 - コサイン類似度）
CREATE INDEX idx_questions_question_content_embedding_hnsw ON questions 
  USING hnsw (question_content_embedding_gemini vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

COMMENT ON TABLE questions IS '大問（Context/Parent）';
COMMENT ON COLUMN questions.id IS 'UUID v7 (PK・時系列ソート可能)';
COMMENT ON COLUMN questions.public_id IS 'Public NanoID (URL露出用・予測不可能)';
COMMENT ON COLUMN questions.sort_order IS '表示順序（間に挿入可能）';
COMMENT ON COLUMN questions.question_content IS '大問共通の文章・設定';
COMMENT ON COLUMN questions.difficulty_level_id IS '0:Basic, 1:Standard, 2:Advanced';
COMMENT ON COLUMN questions.keyword_ids IS 'キーワードID配列 例: [100, 200, 300]';
COMMENT ON COLUMN questions.question_content_embedding_gemini IS 'question_content + メタデータのベクトル (1536次元)';
```

#### 小問（Specific Item） - 小問メタデータ + ベクトル検索
小問は「個別問題文」、「解答・解説」、「配点」、「問題形式」を管理します。
**ベクトル検索用に問題文と解答解説文を別々にベクトル化**します。

```sql
CREATE TABLE sub_questions (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id CHAR(16) NOT NULL UNIQUE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  sort_order REAL NOT NULL DEFAULT 0,
  sub_content TEXT NOT NULL,
  
  -- === 小問メタデータ（Hard Filter用） ===
  question_type_id SMALLINT NOT NULL DEFAULT 0,
  correct_answer TEXT NULL,
  points INTEGER NULL,
  choices JSONB NULL,
  explanation TEXT NULL,
  
  -- キーワード管理（JSONB配列でID保存）
  keyword_ids JSONB NULL,
  
  -- ベクトル検索用Embedding（gemini-embedding-001: 1536次元）
  -- 問題文用: sub_content + 親question_content + メタデータを結合してベクトル化
  sub_content_embedding_gemini vector(1536) NULL,
  -- 解答解説文用: correct_answer + explanation + choices を結合してベクトル化
  explanation_embedding_gemini vector(1536) NULL,

  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ(6) NULL
);

-- インデックス
CREATE INDEX idx_sub_questions_public_id ON sub_questions (public_id);
CREATE INDEX idx_sub_questions_question_sort ON sub_questions (question_id, sort_order);
CREATE INDEX idx_sub_questions_deleted_at ON sub_questions (deleted_at);
CREATE INDEX idx_sub_questions_keyword_ids ON sub_questions USING GIN (keyword_ids);
CREATE INDEX idx_sub_questions_created_at ON sub_questions (created_at);

-- HNSWインデックス（ベクトル検索用 - コサイン類似度）
-- 問題文ベクトル用インデックス
CREATE INDEX idx_sub_questions_sub_content_embedding_hnsw ON sub_questions 
  USING hnsw (sub_content_embedding_gemini vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 解答解説文ベクトル用インデックス
CREATE INDEX idx_sub_questions_explanation_embedding_hnsw ON sub_questions 
  USING hnsw (explanation_embedding_gemini vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

COMMENT ON TABLE sub_questions IS '小問（Specific Item）';
COMMENT ON COLUMN sub_questions.id IS 'UUID v7 (PK・時系列ソート可能)';
COMMENT ON COLUMN sub_questions.public_id IS 'Public NanoID (URL露出用・予測不可能)';
COMMENT ON COLUMN sub_questions.sort_order IS '大問内での表示順序';
COMMENT ON COLUMN sub_questions.sub_content IS '小問の問題文';
COMMENT ON COLUMN sub_questions.question_type_id IS '0-4:Select, 10+:Essay';
COMMENT ON COLUMN sub_questions.choices IS '選択肢配列（多肢選択問題の場合）';
COMMENT ON COLUMN sub_questions.keyword_ids IS 'キーワードID配列 例: [100, 200, 300]';
COMMENT ON COLUMN sub_questions.sub_content_embedding_gemini IS '問題文ベクトル: sub_content + parent context (1536次元)';
COMMENT ON COLUMN sub_questions.explanation_embedding_gemini IS '解答解説文ベクトル: correct_answer + explanation + choices (1536次元)';
```

#### 設計の意図
- **順序管理**: `sort_order` (REAL) を使用し、間に問題を挿入する際の採番コストを削減
- **属性の分離**: `difficulty_level_id` は大問、`question_type_id`/`points` は小問に配置
- **ベクトル分離**: 小問では「問題文」と「解答解説文」を別々にベクトル化
  - `sub_content_embedding_gemini`: 問題文検索用（「○○の問題を探して」）
  - `explanation_embedding_gemini`: 解答解説検索用（「○○の解き方を知りたい」）
- **ベクトル統合**: 各テーブルに直接ベクトルカラムを持たせ、外部検索DB不要

### 3.3 統計・ソーシャル評価（高頻度更新の分離）

```sql
CREATE TABLE exam_stats (
  exam_id UUID PRIMARY KEY REFERENCES exams(id) ON DELETE CASCADE,
  total_questions INTEGER NOT NULL DEFAULT 0,
  total_points DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  average_difficulty DECIMAL(3,2) NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  good_count INTEGER NOT NULL DEFAULT 0,
  bad_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE exam_stats IS '統計（高頻度更新の分離）';
COMMENT ON COLUMN exam_stats.exam_id IS 'exams.id (UUID v7)';
COMMENT ON COLUMN exam_stats.good_count IS '高評価数';
COMMENT ON COLUMN exam_stats.bad_count IS '低評価数';
```

### 3.4 キーワード管理（Keywords for Search） - LLM正規化対応 + ベクトル検索

大問・小問にコンテンツ内容を表すキーワードを紐付けます。正規化されたリレーショナル構造を採用し、LLMによる表記ゆれ管理を実現します。

#### 3.4.1 設計原則

**キーワードの定義**:
- キーワードは**コンテンツの内容・トピックを表すもののみ**を扱います（例: 「微分積分」「明治維新」「ニューラルネットワーク」）
- メタデータ（難易度、大学名、教授名等）は含めません
- メタデータは別途フィールド（`difficulty_level_id`, `university_id`等）で管理され、Hard Filterとして使用されます
- 試験全体へのキーワード付けは行いません（大問・小問レベルのみ）

**ID管理と正規化**:
- 全てのキーワードは一意な `id (Integer)` で管理
- 表記ゆれ（例: 「微積」と「微分積分」）は、IDを統一し、シノニム（同義語）として解決

#### 3.4.2 マスタ・管理テーブル

```sql
-- 正規キーワードマスタ（重複なし・ユニークな概念のみ）+ ベクトル検索
CREATE TABLE keywords (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  keyword_type SMALLINT NOT NULL DEFAULT 0,
  
  -- ベクトル検索用Embedding（gemini-embedding-001: 1536次元）
  -- name をベクトル化
  name_embedding_gemini vector(1536) NULL,
  
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_keyword_name UNIQUE (name)
);

-- HNSWインデックス（キーワードベクトル検索用）
CREATE INDEX idx_keywords_name_embedding_hnsw ON keywords 
  USING hnsw (name_embedding_gemini vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

COMMENT ON TABLE keywords IS '正規キーワードマスタ（コンテンツ内容専用: 例「微分」「明治維新」）';
COMMENT ON COLUMN keywords.id IS 'キーワードID';
COMMENT ON COLUMN keywords.name IS '正規キーワード名';
COMMENT ON COLUMN keywords.keyword_type IS '将来用（現在は0=contentのみ）';
COMMENT ON COLUMN keywords.name_embedding_gemini IS 'nameのベクトル (1536次元)';

-- シノニム（表記ゆれ）管理
CREATE TABLE keyword_synonyms (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  keyword_id INTEGER NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  synonym_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_synonym_name UNIQUE (synonym_name)
);
CREATE INDEX idx_keyword_synonyms_keyword_id ON keyword_synonyms (keyword_id);

COMMENT ON TABLE keyword_synonyms IS 'キーワード別名管理（表記ゆれ解決用）';
COMMENT ON COLUMN keyword_synonyms.keyword_id IS '正規キーワードID';
COMMENT ON COLUMN keyword_synonyms.synonym_name IS '別名（例: 微積）';

-- 未承認キーワード候補（ステージング）
-- status_id: 0=pending(審査中), 1=merged(既存に統合), 2=promoted(新規登録)
CREATE TABLE keyword_candidates (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  raw_text VARCHAR(100) NOT NULL,
  status_id SMALLINT NOT NULL DEFAULT 0,
  merged_keyword_id INTEGER NULL REFERENCES keywords(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ(6) NULL
);
CREATE INDEX idx_keyword_candidates_status ON keyword_candidates (status_id);
CREATE INDEX idx_keyword_candidates_created_at ON keyword_candidates (created_at);

COMMENT ON TABLE keyword_candidates IS '未承認キーワード候補（LLM正規化待ち）';
COMMENT ON COLUMN keyword_candidates.raw_text IS 'ユーザー入力の生テキスト';
COMMENT ON COLUMN keyword_candidates.status_id IS '0:pending(審査中), 1:merged(既存に統合), 2:promoted(新規登録)';
COMMENT ON COLUMN keyword_candidates.merged_keyword_id IS 'mergedの場合の統合先ID';
COMMENT ON COLUMN keyword_candidates.reviewed_at IS 'LLM/管理者による審査日時';
```

#### 3.4.3 LLMベースの正規化フロー

ユーザー入力が正規マスタに登録されるまでの「名寄せ」プロセス:

1. **入力**: ユーザーが新規ワード「微積」を入力 → `keyword_candidates` に保存 (`status_id=0`)
2. **バッチ処理**: Keyword Normalization Worker が定期起動
3. **ベクトル検索 (Pre-filter)**:
   - 「微積」のEmbeddingベクトルに近い既存キーワード (`keywords`) を検索
   - PostgreSQL pgvector でコサイン類似度検索を実行
   - 類似度が閾値（例: 0.85）を超えるものがあるか確認
4. **LLM判定 (Semantic Judgment)**:
   - 閾値超えの場合、LLMに問い合わせる
   - Prompt: 「『微積』は『微分積分』の同義語として統合すべきですか？」
5. **分岐**:
   - **Yes (統合)**: 
     - `keyword_synonyms` に「微積 → keyword_id=200」を登録
     - `keyword_candidates.status_id = 1` (merged)
   - **No (独立)**: 
     - `keywords` に「微積 (新規ID)」を登録
     - `keyword_candidates.status_id = 2` (promoted)

#### 3.4.4 検索での活用パターン（edumintSearch参考）

> **注意**: 以下の検索クエリは**edumintSearchサービス（Elasticsearch 9.2.4）**で実行されます。edumintContent内では検索クエリを実行しません。

> **推奨用途**: ローカル開発での動作確認、緊急時の参照（フォールバック）。

**アプリケーション側の処理（edumintSearch）**:
1. ユーザー入力: 「自然対数を含んだ微積の問題」
2. メモリ内辞書（Keywords + Synonyms）とマッチング:
   - 「自然対数」→ ID: 100
   - 「微積」→（シノニム解決）→ ID: 200
3. 抽出されたID: `[100, 200]`
4. クエリベクトル化: `[0.05, -0.91, ...]`

**PostgreSQLハイブリッド検索クエリ（開発・フォールバック用参考）**:

> **注意**: 以下はPostgreSQLでの開発・フォールバック用の参考クエリです。実運用の検索処理は **edumintSearch（Elasticsearch）** が担当します。

```sql
-- キーワードID一致 + ベクトル類似度のハイブリッドスコアリング
SELECT 
  sq.id,
  sq.sub_content,
  -- キーワードマッチスコア
  (SELECT COUNT(*) FROM jsonb_array_elements_text(sq.keyword_ids) k 
   WHERE k::int IN (100, 200)) * 100 AS keyword_score,
  -- ベクトル類似度スコア
  (1 - (sq.sub_content_embedding_gemini <=> $1::vector)) * 10 AS vector_score
FROM sub_questions sq
JOIN questions q ON sq.question_id = q.id
JOIN exams e ON q.exam_id = e.id
WHERE e.is_public = TRUE
ORDER BY (keyword_score + vector_score) DESC
LIMIT 20;
```

---

## 4. ジョブ管理（AI Job Management） - edumintGateway移行済み

> **重要なアーキテクチャ変更（2026-02-03）**:
> - **ジョブ管理は edumintGateway に全面移行されました**
> - edumintContent は**ドメインデータの Source of Truth** として試験・問題の管理に専念
> - ジョブのライフサイクル管理は edumintGateway の `jobs` テーブルが担当
> - edumintContent は Kafka イベント（`gateway.jobs` トピック）を購読して処理を実行

### 4.1 責務分離の原則

| サービス | 責務 | 管理するデータ |
|---------|------|---------------|
| **edumintGateway** | ジョブオーケストレーション | `jobs` テーブル（全ジョブ種別を統一管理） |
| **edumintContent** | 試験データの管理 | `exams`, `questions`, `keywords` 等 |
| **edumintSearch** | 検索インデックス | Elasticsearch, Qdrant |
| **edumintAiWorker** | AI処理 | ステートレス（DBなし） |

### 4.2 ステータスID定義（Generation Phase）

ステータスIDはフロントエンド側で定義・管理されており、以下のID体系に従います。
edumintGateway の `jobs.status` カラムがこのID体系を使用します。

#### ID体系
- **00-09**: Common States（共通状態 - 全フェーズで共有）
- **10-19**: Structure Phase（構造化フェーズ - Markdown抽出）
- **20-29**: Generation Phase（生成フェーズ - AIコンテンツ作成）
- **30-39**: Publication Phase（公開フェーズ）

#### 完全なステータスID一覧

| ID | i18nキー | 説明 | editable |
| :--- | :--- | :--- | :---: |
| **0** | `enum.common.confirming` | 確認中（初期状態） | false |
| **1** | `enum.common.saving` | 保存中 | false |
| **2** | `enum.common.completed` | 完了 | false |
| **3** | `enum.common.queued` | キュー待機中（ジョブアイテム初期状態） | false |
| **4** | `enum.common.retry` | リトライ中 | false |
| **5** | `enum.common.failed` | 失敗 | false |
| **10** | `enum.structure.uploading` | アップロード中 | false |
| **11** | `enum.structure.extracting` | 抽出中（ファイル解析） | false |
| **12** | `enum.structure.analyzing` | 解析中 | false |
| **20** | `enum.generation.creating` | 生成中（問題作成） | false |
| **30** | `enum.publication.publishing` | 公開中 | false |
| **31-39** | （将来予約） | 公開フェーズ拡張用（将来予約） | - |

> **注意**: `editable=false` はフロントエンドでユーザー編集不可を示します。

### 4.3 ジョブテーブル（edumintGateway管理）

> **重要**: 以下のテーブルは **edumintGateway サービスのデータベース** に存在します。
> edumintContent は Kafka イベント経由でジョブステータスを通知し、リソース作成結果を返却します。

#### 汎用ジョブテーブル（edumintGateway.jobs）

```sql
-- edumintGateway のデータベース
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  client_request_id UUID NOT NULL UNIQUE,  -- 冪等性キー
  
  -- ジョブメタデータ
  type VARCHAR(50) NOT NULL,  -- 'exam_creation', 'file_processing', 'index_rebuild'
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending', 'processing', 'completed', 'failed'
  
  -- リソース情報（弱参照）
  resource_type VARCHAR(50),  -- 'exam', 'file', 'index'
  resource_id UUID,  -- 作成されたリソースのID（edumintContent が返却）
  
  -- ペイロード
  input_payload JSONB NOT NULL,
  output_payload JSONB,
  
  -- エラー管理
  error_code VARCHAR(50),
  error_message TEXT,
  retry_count SMALLINT DEFAULT 0,
  max_retries SMALLINT DEFAULT 3,
  
  -- 監査
  requested_by UUID NOT NULL,  -- users.id（edumintUserProfile から参照）
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_jobs_client_request_id ON jobs (client_request_id);
CREATE INDEX idx_jobs_status ON jobs (status, created_at);
CREATE INDEX idx_jobs_requested_by ON jobs (requested_by);
CREATE INDEX idx_jobs_resource ON jobs (resource_type, resource_id);

COMMENT ON TABLE jobs IS 'ジョブ管理（全サービス共通）- edumintGatewayが管理';
COMMENT ON COLUMN jobs.type IS 'ジョブ種別（exam_creation, file_processing等）';
COMMENT ON COLUMN jobs.resource_id IS '作成されたリソースID（edumintContent が返却）';
COMMENT ON COLUMN jobs.input_payload IS 'ジョブ作成時のリクエストペイロード';
COMMENT ON COLUMN jobs.output_payload IS 'ジョブ完了時のレスポンスペイロード（resource_id等）';
```

#### edumintContentでの対応

edumintContentは以下のテーブルを**削除**しました:
- ~~`exam_creation_jobs`~~（edumintGateway.jobs に移行）
- ~~`extraction_jobs`~~（edumintGateway.jobs に統合）
- ~~`extraction_job_items`~~（edumintGateway.jobs に統合）
- ~~`outbox`~~（Kafka直接publish に変更）

edumintContentは Kafka イベントを購読し、ドメインロジックを実行するのみです。

### 4.4 新しいジョブフロー（イベント駆動アーキテクチャ）

```
[FrontendUI]
    |
    | POST /v1/jobs
    | Body: {
    |   type: "exam_creation",
    |   client_request_id: "uuid",
    |   payload: { exam_name: "...", university_id: 101, ... }
    | }
    v
[edumintGateway]
    |
    | 1. JWT検証（edumintAuth）
    | 2. 冪等性チェック（client_request_id）
    | 3. jobs テーブルに INSERT（status='pending'）
    |
    | 4. Kafka Publish: job.created
    |    Topic: gateway.jobs
    |    Payload: {
    |      job_id: "...",
    |      type: "exam_creation",
    |      payload: { exam_name: "...", university_id: 101 }
    |    }
    |
    | 5. 202 Accepted を返却
    v
[Kafka: gateway.jobs]
    |
    v
[edumintContent]
    |
    | 6. job.created イベントを購読
    |
    | 7. トランザクション開始
    |   - exams テーブルに INSERT
    |   - exam_stats テーブルに INSERT
    | 8. トランザクションコミット
    |
    | 9. Kafka Publish: content.exam_created
    |    Topic: content.lifecycle
    |    Payload: {
    |      job_id: "...",
    |      exam_id: "...",
    |      status: "created"
    |    }
    v
[Kafka: content.lifecycle]
    |
    +---> [edumintGateway]
    |        |
    |        | 10. content.exam_created を購読
    |        |
    |        | 11. jobs テーブルを UPDATE
    |        |     SET status='processing',
    |        |         resource_id='exam_id',
    |        |         updated_at=NOW()
    |        |
    |        | 12. Kafka Publish: job.processing
    |
    +---> [edumintAiWorker]
             |
             | 13. job.processing を購読
             |
             | 14. AI処理（Gemini API で問題抽出）
             |
             | 15. Kafka Publish: ai.processing_completed
             |     Payload: {
             |       job_id: "...",
             |       exam_id: "...",
             |       extracted_questions: [...]
             |     }
             v
         [edumintContent]
             |
             | 16. ai.processing_completed を購読
             |
             | 17. questions, sub_questions テーブルに INSERT
             |
             | 18. Kafka Publish: content.exam_completed
             v
         [edumintGateway]
             |
             | 19. content.exam_completed を購読
             |
             | 20. jobs テーブルを UPDATE
             |     SET status='completed',
             |         completed_at=NOW(),
             |         output_payload='{ exam_id: "..." }'

※ 責務分離:
   - edumintGateway: ジョブのライフサイクル管理、ステータス集約
   - edumintContent: ドメインロジック実行、リソース作成
   - edumintAiWorker: AI処理（ステートレス）
```

### 4.5 Kafkaトピック設計（更新版）

| トピック | Producer | Consumer | イベント | 説明 |
|---------|----------|----------|---------|------|
| `gateway.jobs` | edumintGateway | edumintContent, edumintFile, edumintSearch | `job.created` | ジョブ作成通知 |
| `content.lifecycle` | edumintContent | edumintGateway, edumintSearch, edumintAiWorker | `exam_created`, `exam_updated`, `exam_deleted`, `exam_completed` | コンテンツライフサイクルイベント |
| `ai.results` | edumintAiWorker | edumintContent | `processing_completed`, `processing_failed` | AI処理結果 |
| `gateway.job_status` | 各ドメインサービス | edumintGateway | `job_completed`, `job_failed`, `job_processing` | ジョブステータス更新 |

#### イベントペイロード例

**gateway.jobs - job.created**
```json
{
  "job_id": "019526a1-7c8d-7000-8000-000000000001",
  "type": "exam_creation",
  "client_request_id": "019526a1-7c8d-7000-8000-000000000002",
  "payload": {
    "exam_name": "2023年度 微分積分学 期末試験",
    "university_id": 101,
    "faculty_id": 5,
    "exam_year": 2023
  },
  "requested_by": "019526a1-7c8d-7000-8000-000000000003"
}
```

**content.lifecycle - exam_created**
```json
{
  "job_id": "019526a1-7c8d-7000-8000-000000000001",
  "exam_id": "019526a1-7c8d-7000-8000-000000000004",
  "exam_name": "2023年度 微分積分学 期末試験",
  "status": "created",
  "timestamp": "2026-02-03T10:30:00.123456Z"
}
```

**ai.results - processing_completed**
```json
{
  "job_id": "019526a1-7c8d-7000-8000-000000000001",
  "exam_id": "019526a1-7c8d-7000-8000-000000000004",
  "extracted_questions": [
    {
      "question_content": "次の関数の導関数を求めよ。",
      "sub_questions": [
        {"sub_content": "f(x) = x^2 + 3x + 2", "points": 10}
      ]
    }
  ],
  "processing_time_seconds": 45
}
```

---

## 5. 生データ層（Secret Raw Content） - 別DB (`edumint_secret_raw`)

> **重要**: 生DBはメインDBと物理的に分離されているため、`exam_id`, `created_by` 等のカラムには**物理的な外部キー制約を設定できません**。アプリケーション層で整合性を保証します。

### 5.1 生試験データ（書き込み専用・外部流出厳禁）

```sql
CREATE TABLE raw_exam (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  exam_id UUID NOT NULL,
  
  -- 生データ（BYTEA - 将来暗号化対象）
  raw_data BYTEA NOT NULL,
  
  -- メタデータ
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  
  -- 暗号化管理
  is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
  encryption_key_version SMALLINT NULL,
  encrypted_at TIMESTAMPTZ(6) NULL,
  
  -- 監査
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL
);

CREATE INDEX idx_raw_exam_exam ON raw_exam (exam_id);
CREATE INDEX idx_raw_exam_created_at ON raw_exam (created_at);
CREATE INDEX idx_raw_exam_encrypted ON raw_exam (is_encrypted, created_at);

COMMENT ON TABLE raw_exam IS '生試験データ（外部流出厳禁・暗号化対象）';
COMMENT ON COLUMN raw_exam.id IS 'UUID v7';
COMMENT ON COLUMN raw_exam.exam_id IS 'exams.id (UUID v7・メインDB参照)';
COMMENT ON COLUMN raw_exam.raw_data IS '生ファイルデータ（PDF, 画像等）';
COMMENT ON COLUMN raw_exam.created_by IS 'users.id (UUID v7・Main DB)';
```

### 5.2 生ソースデータ（外部API取得データ）

```sql
CREATE TABLE raw_source (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  exam_id UUID NOT NULL,
  
  raw_data BYTEA NOT NULL,
  source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('api', 'scraping', 'manual')),
  source_url TEXT NULL,
  
  -- 暗号化管理
  is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
  encryption_key_version SMALLINT NULL,
  encrypted_at TIMESTAMPTZ(6) NULL,
  
  -- 監査
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL
);

CREATE INDEX idx_raw_source_exam ON raw_source (exam_id);
CREATE INDEX idx_raw_source_created_at ON raw_source (created_at);
CREATE INDEX idx_raw_source_source_type ON raw_source (source_type);
CREATE INDEX idx_raw_source_encrypted ON raw_source (is_encrypted, created_at);

COMMENT ON TABLE raw_source IS '外部ソース生データ（暗号化対象）';
COMMENT ON COLUMN raw_source.id IS 'UUID v7';
COMMENT ON COLUMN raw_source.exam_id IS 'exams.id (UUID v7・メインDB参照)';
COMMENT ON COLUMN raw_source.raw_data IS 'API/スクレイピング取得データ';
COMMENT ON COLUMN raw_source.source_type IS 'データソース種別';
COMMENT ON COLUMN raw_source.created_by IS 'users.id (UUID v7・Main DB)';
```

### 5.3 セキュリティポリシー

#### 暗号化対象とタイミング
- **対象**: `raw_exam.raw_data`, `raw_source.raw_data`
- **タイミング**: 作成後7日経過したデータ（cron job で自動実行）
- **方式**: AES-256-GCM（予定）
- **鍵管理**: AWS KMS または Google Cloud KMS

#### アクセス制御
- メインDB: アプリケーション層からの全アクセス可
- 生DB: 
  - **読み取り**: 抽出ワーカー、管理者
  - **書き込み**: 抽出ワーカーのみ
  - **削除**: 管理者のみ（GDPR対応）

---

## 6. イベント駆動アーキテクチャ（Kafka直接publish）

> **重要なアーキテクチャ変更（2026-02-03）**:
> - **CDC Outboxパターンは廃止されました**
> - ビジネスロジック実行後、**Kafka Producerで直接イベントを発行**
> - `outbox` テーブルは削除されました

### 6.1 新しいイベント発行パターン

#### 設計思想

1. **シンプルさ**: Outboxテーブル、Debezium、WALポーリングの複雑性を排除
2. **リアルタイム性**: トランザクションコミット後、即座にKafkaへ発行
3. **責務の明確化**: edumintContent はドメインイベントの発行のみ、ジョブ管理は edumintGateway

#### トレードオフ

| 項目 | CDC Outbox（旧） | Kafka直接publish（新） |
|------|----------------|---------------------|
| **複雑性** | 高（Debezium、WAL監視） | 低（Kafka Producerのみ） |
| **リアルタイム性** | 中（ポーリング遅延あり） | 高（即座に発行） |
| **トランザクション保証** | 強い（同一トランザクション） | 弱い（At-Least-Once） |
| **運用負荷** | 高（Debezium管理） | 低（Kafkaのみ） |

### 6.2 実装パターン（Go）

#### UseCase層での実装

```go
func (uc *ExamUseCase) OnJobCreated(ctx context.Context, event JobCreatedEvent) error {
    // 1. ドメインエンティティを作成
    exam, err := domain.NewExam(event.Payload)
    if err != nil {
        // エラーをKafkaに返す
        uc.kafkaProducer.Publish(ctx, "content.lifecycle", ContentExamFailedEvent{
            JobID: event.JobID,
            Error: err.Error(),
        })
        return err
    }
    
    // 2. DBに保存（トランザクション）
    err = uc.txManager.Do(ctx, func(ctx context.Context) error {
        if err := uc.examRepo.Save(ctx, exam); err != nil {
            return err
        }
        
        if err := uc.examStatsRepo.Create(ctx, domain.NewExamStats(exam.ID())); err != nil {
            return err
        }
        
        return nil
    })
    
    if err != nil {
        return err
    }
    
    // 3. トランザクション成功後、Kafkaへ直接発行
    return uc.kafkaProducer.Publish(ctx, "content.lifecycle", ContentExamCreatedEvent{
        JobID:    event.JobID,
        ExamID:   exam.ID(),
        ExamName: exam.Name(),
        Status:   "created",
    })
}
```

### 6.3 イベントタイプ定義

#### content.lifecycle トピック

| イベントタイプ | 説明 | Producer | Consumer |
|:---|:---|:---|:---|
| `exam_created` | 試験作成完了 | edumintContent | edumintGateway, edumintSearch, edumintAiWorker |
| `exam_updated` | 試験更新 | edumintContent | edumintGateway, edumintSearch |
| `exam_deleted` | 試験削除 | edumintContent | edumintSearch |
| `exam_completed` | 試験作成完了（AI処理含む） | edumintContent | edumintGateway |
| `exam_failed` | 試験作成失敗 | edumintContent | edumintGateway |
| `question_added` | 問題追加 | edumintContent | edumintSearch, edumintAiWorker |
| `question_updated` | 問題更新 | edumintContent | edumintSearch, edumintAiWorker |

#### Pre-joined Payload の原則（継続）

**question_added / question_updated イベント**では、メタデータ（`university_id`, `faculty_id`, `exam_year`, `keywords`等）を**ペイロードに含めること**。

**理由**: 下流のedumintAiWorkerがメタデータをJOINするためにメインDBへコールバックするのを防ぎ、CQRS原則（読み取りモデルの独立性）を維持するため。

### 6.4 イベントフロー図

```
[edumintContent UseCase]
    |
    v (1) Kafka Event 受信: job.created
    |
    v (2) トランザクション開始
    +---> [exams] INSERT
    +---> [exam_stats] INSERT
    |
    v (3) トランザクションコミット
    |
    v (4) Kafka直接publish: exam_created
    |      Topic: content.lifecycle
    |
[Kafka Broker]
    |
    +---> [edumintGateway] jobs.status='processing'
    +---> [edumintSearch] Elasticsearchインデックス更新
    +---> [edumintAiWorker] Embedding生成開始
```

### 6.5 信頼性とエラーハンドリング

#### At-Least-Once保証

- Kafka Producerの`acks=all`設定により、全レプリカへの書き込み成功を保証
- リトライメカニズムにより、一時的なネットワーク障害に対応

#### 冪等性保証

- `job_id` をイベントキーとして使用し、Consumer側で重複検知
- edumintGateway の `jobs.client_request_id` (UNIQUE制約) により冪等性を保証

#### 補償トランザクション（Saga）

```
成功ケース:
  1. edumintGateway: jobs.status='pending'
  2. edumintContent: exams 作成成功 → exam_created
  3. edumintGateway: jobs.status='processing'
  4. edumintAiWorker: AI処理成功 → processing_completed
  5. edumintContent: questions 作成成功 → exam_completed
  6. edumintGateway: jobs.status='completed'

失敗ケース（補償トランザクション）:
  1. edumintGateway: jobs.status='pending'
  2. edumintContent: exams 作成失敗 → exam_failed
  3. edumintGateway: jobs.status='failed', error_message='...'
```

---

## 7. ユーザー・ソーシャル層 - メインDB

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id CHAR(16) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  
  -- 所属情報（任意）
  university_id SMALLINT NULL REFERENCES universities_jp(id) ON DELETE SET NULL,
  faculty_id INTEGER NULL REFERENCES faculties_jp(id) ON DELETE SET NULL,
  major_type SMALLINT NOT NULL DEFAULT 0,
  
  mintcoin_balance INTEGER NOT NULL DEFAULT 0,
  status_id SMALLINT NOT NULL DEFAULT 1,
  
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_public_id ON users (public_id);
CREATE INDEX idx_users_created_at ON users (created_at);
CREATE INDEX idx_users_university_id ON users (university_id);

COMMENT ON TABLE users IS 'ユーザープロファイル';
COMMENT ON COLUMN users.id IS 'UUID v7 (PK・時系列ソート可能)';
COMMENT ON COLUMN users.public_id IS 'Public NanoID (URL露出用・予測不可能)';
COMMENT ON COLUMN users.major_type IS '0:理系, 1:文系';
COMMENT ON COLUMN users.mintcoin_balance IS 'キャッシュ用残高';
COMMENT ON COLUMN users.status_id IS '0:inactive, 1:active, 2:banned';
```

---

## 8. インデックス戦略

### 8.1 ベクトル検索用HNSWインデックス

pgvector の **HNSW (Hierarchical Navigable Small Worlds)** インデックスを使用し、大規模ベクトル検索を実現します。

```sql
-- 各テーブルのベクトルカラムにHNSWインデックスを作成
-- m: グラフの接続数（16が一般的）
-- ef_construction: 構築時の探索幅（64-200）

-- questions
CREATE INDEX idx_questions_question_content_embedding_hnsw ON questions 
  USING hnsw (question_content_embedding_gemini vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- sub_questions (問題文ベクトル)
CREATE INDEX idx_sub_questions_sub_content_embedding_hnsw ON sub_questions 
  USING hnsw (sub_content_embedding_gemini vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- sub_questions (解答解説文ベクトル)
CREATE INDEX idx_sub_questions_explanation_embedding_hnsw ON sub_questions 
  USING hnsw (explanation_embedding_gemini vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- keywords
CREATE INDEX idx_keywords_name_embedding_hnsw ON keywords 
  USING hnsw (name_embedding_gemini vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

### 8.2 検索パフォーマンスチューニング

```sql
-- 検索時のef（探索幅）を調整（精度 vs 速度のトレードオフ）
SET hnsw.ef_search = 100;  -- デフォルト40、精度重視なら100-200

-- メモリ設定
SET work_mem = '256MB';  -- ベクトル演算用
SET maintenance_work_mem = '2GB';  -- インデックス再構築用
```

### 8.3 全インデックス一覧

以下はドキュメント内で定義された全インデックスの網羅的リストです。

#### マスタテーブル

| テーブル | インデックス名 | 種別 | カラム |
|:--|:--|:--|:--|
| `universities_jp` | `uk_univ_slug` | UNIQUE | `slug` |
| `faculties_jp` | `uk_fac_slug` | UNIQUE | `slug` |
| `faculties_jp` | `idx_faculties_university_id` | B-tree | `university_id` |
| `teachers_jp` | `uk_teacher_jp_slug` | UNIQUE | `(university_id, slug)` |
| `teachers_jp` | `idx_teachers_jp_public_id` | B-tree | `public_id` |
| `teachers_jp` | `idx_teachers_jp_university_id` | B-tree | `university_id` |
| `subjects` | `uk_subject_slug` | UNIQUE | `(faculty_id, slug)` |
| `subjects` | `idx_subjects_public_id` | B-tree | `public_id` |
| `subjects` | `idx_subjects_faculty_id` | B-tree | `faculty_id` |

#### コアエンティティ

| テーブル | インデックス名 | 種別 | カラム |
|:--|:--|:--|:--|
| `exams` | `idx_exams_public_id` | B-tree | `public_id` |
| `exams` | `idx_exams_univ_fac` | B-tree | `(university_id, faculty_id)` |
| `exams` | `idx_exams_subject_id` | B-tree | `subject_id` |
| `exams` | `idx_exams_status_id` | B-tree | `status_id` |
| `exams` | `idx_exams_deleted_at` | B-tree | `deleted_at` |
| `exams` | `idx_exams_is_public` | Partial | `is_public` WHERE `is_public = TRUE` |
| `exams` | `idx_exams_created_at` | B-tree | `created_at` |
| `exams` | `idx_exams_exam_name_fulltext` | GIN | `to_tsvector('simple', exam_name)` |
| `questions` | `idx_questions_public_id` | B-tree | `public_id` |
| `questions` | `idx_questions_exam_sort` | B-tree | `(exam_id, sort_order)` |
| `questions` | `idx_questions_deleted_at` | B-tree | `deleted_at` |
| `questions` | `idx_questions_keyword_ids` | GIN | `keyword_ids` (JSONB) |
| `questions` | `idx_questions_created_at` | B-tree | `created_at` |
| `questions` | `idx_questions_question_content_embedding_hnsw` | HNSW | `question_content_embedding_gemini` |
| `sub_questions` | `idx_sub_questions_public_id` | B-tree | `public_id` |
| `sub_questions` | `idx_sub_questions_question_sort` | B-tree | `(question_id, sort_order)` |
| `sub_questions` | `idx_sub_questions_deleted_at` | B-tree | `deleted_at` |
| `sub_questions` | `idx_sub_questions_keyword_ids` | GIN | `keyword_ids` (JSONB) |
| `sub_questions` | `idx_sub_questions_created_at` | B-tree | `created_at` |
| `sub_questions` | `idx_sub_questions_sub_content_embedding_hnsw` | HNSW | `sub_content_embedding_gemini` |
| `sub_questions` | `idx_sub_questions_explanation_embedding_hnsw` | HNSW | `explanation_embedding_gemini` |

#### キーワード管理

| テーブル | インデックス名 | 種別 | カラム |
|:--|:--|:--|:--|
| `keywords` | `uk_keyword_name` | UNIQUE | `name` |
| `keywords` | `idx_keywords_name_embedding_hnsw` | HNSW | `name_embedding_gemini` |
| `keyword_synonyms` | `uk_synonym_name` | UNIQUE | `synonym_name` |
| `keyword_synonyms` | `idx_keyword_synonyms_keyword_id` | B-tree | `keyword_id` |
| `keyword_candidates` | `idx_keyword_candidates_status` | B-tree | `status_id` |
| `keyword_candidates` | `idx_keyword_candidates_created_at` | B-tree | `created_at` |

#### ユーザー

| テーブル | インデックス名 | 種別 | カラム |
|:--|:--|:--|:--|
| `users` | `idx_users_public_id` | B-tree | `public_id` |
| `users` | `idx_users_created_at` | B-tree | `created_at` |
| `users` | `idx_users_university_id` | B-tree | `university_id` |

#### 生データベース（edumint_secret_raw）

| テーブル | インデックス名 | 種別 | カラム |
|:--|:--|:--|:--|
| `raw_exam` | `idx_raw_exam_exam` | B-tree | `exam_id` |
| `raw_exam` | `idx_raw_exam_created_at` | B-tree | `created_at` |
| `raw_exam` | `idx_raw_exam_encrypted` | B-tree | `(is_encrypted, created_at)` |
| `raw_source` | `idx_raw_source_exam` | B-tree | `exam_id` |
| `raw_source` | `idx_raw_source_created_at` | B-tree | `created_at` |
| `raw_source` | `idx_raw_source_source_type` | B-tree | `source_type` |
| `raw_source` | `idx_raw_source_encrypted` | B-tree | `(is_encrypted, created_at)` |

### 8.4 パーティショニング（将来検討）

以下のテーブルはレコード数が**100万件を超過**した時点でパーティショニング導入を検討します。

| テーブル | パーティションキー | 分割単位 | 導入閾値 |
|:--|:--|:--|:--|
| `raw_exam` | `created_at` | 月次 | 100万件 |

> **注意**: パーティショニング導入時はFK制約の見直しが必要です。
> **ジョブ管理**: edumintGateway.jobs テーブルは別サービスのため、本サービスでは考慮不要。

---

## 9. マイグレーション実行順序

```bash
# 1. 拡張機能の有効化
psql -h $MAIN_DB_HOST -U $MAIN_DB_USER -d $MAIN_DB_NAME -c "
  CREATE EXTENSION IF NOT EXISTS vector;
  -- 注意: PostgreSQL 18 以降は `uuidv7()` が組み込みで利用可能です。
"

# 2. メインDBマイグレーション
psql -h $MAIN_DB_HOST -U $MAIN_DB_USER -d $MAIN_DB_NAME -f migrations/000001_init_schema_pg18.1.up.sql

# 3. 生DBマイグレーション（別DB）
psql -h $RAW_DB_HOST -U $RAW_DB_USER -d $RAW_DB_NAME -f migrations_raw/000001_init_secret_raw_pg18.1.up.sql

# 注意: Debezium CDC設定は不要（Kafka直接publishに変更）
```

---

## 10. ベクトルカラム定義（edumintSearchレプリケーション用）

### 10.1 設計方針

> **重要**: 本セクションで定義されるベクトルカラムとHNSWインデックスは、**edumintSearchへのレプリケーション用ソースデータ**として維持されます。edumintContent内では検索クエリを実行しません。
>
> - **本番環境**: 検索処理は全てedumintSearch（Elasticsearch 9.2.4 現行安定版、9.3は2026年Q1のリリースが見込まれる）で実行
> - **開発環境**: ローカル開発・単体テスト時にElasticsearchなしでベクトル検索動作確認（`docker-compose.yml` でedumintSearchを起動しない構成）
> - **フォールバック**: edumintSearchが利用できない緊急時の読み取り専用参照用（書き込みは常にedumintContent経由）

以下はベクトルカラムの定義と、参考用のクエリ例です。

| 手法 | 用途 | 実装 |
|:---|:---|:---|
| **Hard Filter** | 大学、年度、難易度での絶対的な絞り込み | WHERE句（インデックス） |
| **Keyword Match** | キーワードID完全一致によるブースト | JSONB `@>` 演算子 + GINインデックス |
| **Vector Similarity** | 意味的類似度によるあいまい検索 | `<=>` 演算子（コサイン距離）+ HNSW |

### 10.2 ハイブリッド検索クエリ例

> **注意**: 以下のPostgreSQLクエリ例は**開発環境・フォールバック用の参考**です。本番での検索処理はedumintSearch（Elasticsearch）で実行します。
>
> **推奨用途**: ローカル開発での検証、緊急時の参照（フォールバック）。

#### 基本的なベクトル類似度検索

```sql
-- 入力: クエリベクトル（Gemini APIで事前生成）
-- 出力: コサイン類似度が高い上位10件の小問

SELECT 
  sq.id,
  sq.sub_content,
  q.question_content,
  e.exam_name,
  e.university_id,
  1 - (sq.sub_content_embedding_gemini <=> $1::vector) AS similarity
FROM sub_questions sq
JOIN questions q ON sq.question_id = q.id
JOIN exams e ON q.exam_id = e.id
WHERE e.is_public = TRUE
  AND e.deleted_at IS NULL
ORDER BY sq.sub_content_embedding_gemini <=> $1::vector
LIMIT 10;
```

#### ハイブリッド検索（フィルタ + キーワード + ベクトル）

```sql
-- 入力:
--   $1: クエリベクトル [0.05, -0.91, ...] (vector(1536))
--   $2: 大学ID (integer)
--   $3: キーワードID配列 [100, 200] (jsonb)

WITH scored_results AS (
  SELECT 
    sq.id,
    sq.sub_content,
    q.question_content,
    e.exam_name,
    e.id AS exam_id,
    e.university_id,
    e.exam_year,
    -- キーワードマッチスコア（一致したキーワード数 × 100）
    COALESCE(
      (SELECT COUNT(*) FROM jsonb_array_elements_text(sq.keyword_ids) k 
       WHERE k::int IN (SELECT (jsonb_array_elements_text($3))::int)),
      0
    ) * 100 AS keyword_score,
    -- ベクトル類似度スコア（0-1を0-10にスケール）
    (1 - (sq.sub_content_embedding_gemini <=> $1::vector)) * 10 AS vector_score
  FROM sub_questions sq
  JOIN questions q ON sq.question_id = q.id
  JOIN exams e ON q.exam_id = e.id
  WHERE 
    e.is_public = TRUE
    AND e.deleted_at IS NULL
    AND e.university_id = $2
    -- ベクトル近傍フィルタ（上位1000件に限定してからスコアリング）
    AND sq.sub_content_embedding_gemini IS NOT NULL
  ORDER BY sq.sub_content_embedding_gemini <=> $1::vector
  LIMIT 1000
)
SELECT 
  id,
  sub_content,
  question_content,
  exam_name,
  exam_id,
  university_id,
  exam_year,
  keyword_score,
  vector_score,
  (keyword_score + vector_score) AS total_score
FROM scored_results
ORDER BY total_score DESC
LIMIT 20;
```

#### 試験単位での集約（Collapse相当）

```sql
-- exam_id でグルーピングし、各試験から最もスコアの高い小問を1件ずつ返却
-- $1: クエリベクトル (vector(1536))
-- $2: キーワードID配列 (jsonb)

WITH scored_results AS (
  SELECT 
    sq.id AS sub_question_id,
    e.id AS exam_id,
    e.exam_name,
    -- キーワードマッチスコア
    COALESCE(
      (SELECT COUNT(*) FROM jsonb_array_elements_text(sq.keyword_ids) k 
       WHERE k::int IN (SELECT (jsonb_array_elements_text($2))::int)),
      0
    ) * 100 AS keyword_score,
    -- ベクトル類似度スコア
    (1 - (sq.sub_content_embedding_gemini <=> $1::vector)) * 10 AS vector_score
  FROM sub_questions sq
  JOIN questions q ON sq.question_id = q.id
  JOIN exams e ON q.exam_id = e.id
  WHERE e.is_public = TRUE
    AND e.deleted_at IS NULL
    AND sq.sub_content_embedding_gemini IS NOT NULL
),
ranked_results AS (
  SELECT 
    sub_question_id,
    exam_id,
    exam_name,
    (keyword_score + vector_score) AS total_score,
    ROW_NUMBER() OVER (PARTITION BY exam_id ORDER BY (keyword_score + vector_score) DESC) AS rn
  FROM scored_results
)
SELECT 
  exam_id,
  exam_name,
  sub_question_id,
  total_score
FROM ranked_results
WHERE rn = 1
ORDER BY total_score DESC
LIMIT 10;
```

### 10.3 ベクトル化対象の詳細

**edumintAiWorker がベクトル化する際に結合するテキスト**（Context Fusion）:

#### 問題文ベクトル（sub_content_embedding_gemini）

```python
# 小問の問題文ベクトル化
embedding_input_text = f"""
【キーワード】 {', '.join(keyword_names)}
【試験名】 {exam_name}
【共通問題文】 {question_content}
【小問】 {sub_content}
【選択肢】 {choices_text}
"""
vector = gemini_embed(embedding_input_text)  # 1536次元

# PostgreSQLへ更新
UPDATE sub_questions 
SET sub_content_embedding_gemini = $1::vector
WHERE id = $2;
```

#### 解答解説文ベクトル（explanation_embedding_gemini）

```python
# 小問の解答解説文ベクトル化
explanation_input_text = f"""
【キーワード】 {', '.join(keyword_names)}
【問題文】 {sub_content}
【正解】 {correct_answer}
【解説】 {explanation}
【選択肢】 {choices_text}
"""
vector = gemini_embed(explanation_input_text)  # 1536次元

# PostgreSQLへ更新
UPDATE sub_questions 
SET explanation_embedding_gemini = $1::vector
WHERE id = $2;
```

---

## 11. マイクロサービス間データフロー (Event-Driven Architecture)

### 11.1 データパイプライン図（更新版）

```
┌─────────────────────────────────────────────────────────────────┐
│  edumintGateway (Job Orchestration)                             │
│  [Job DB: jobs テーブル]                                         │
│    - ジョブライフサイクル管理                                     │
│    - 冪等性保証（client_request_id）                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Kafka (gateway.jobs: job.created)
                         │
                         v
┌─────────────────────────────────────────────────────────────────┐
│  EdumintContent (Command Model / Source of Truth)               │
│  [Main DB: PostgreSQL 18.1 + pgvector]                          │
│    ├── exams (メタデータのみ、ベクトルなし)                      │
│    ├── questions (+ question_content_embedding_gemini)          │
│    ├── sub_questions (+ sub_content/explanation_embedding)      │
│    └── keywords (+ name_embedding_gemini)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Kafka直接publish (content.lifecycle)
                         │
             ┌───────────┴───────────┬────────────────┐
             │                       │                │
             v                       v                v
┌──────────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  edumintGateway      │ │  edumintAiWorker │ │  edumintSearch   │
│  - ジョブステータス   │ │  - Embedding生成 │ │  - Elasticsearch │
│    更新              │ │  - PostgreSQL    │ │  - ハイブリッド  │
│                      │ │    直接更新      │ │    検索API       │
└──────────────────────┘ └──────────────────┘ └──────────────────┘
```

### 11.2 各サービスの役割詳細（更新版）

| サービス | 役割 | 入力 | 出力 |
| :--- | :--- | :--- | :--- |
| **edumintGateway** | ジョブオーケストレーション、冪等性保証、ステータス集約 | API Request | Kafka (`gateway.jobs`), API Response (202 Accepted) |
| **edumintContent** | 正データの管理（Source of Truth）、ドメインロジック実行、ベクトルカラム管理（レプリケーション用） | Kafka (`gateway.jobs`) | Kafka (`content.lifecycle`) |
| **edumintSearch** | 検索・ソート・絞り込み・順位づけ、ハイブリッド検索API | Kafka (`content.lifecycle`) + Search Request | Search Response |
| **edumintAiWorker** | テキストのベクトル化（Embedding）、PostgreSQLへの直接更新 | Kafka (`content.lifecycle`) | PostgreSQL UPDATE, Kafka (`ai.results`) |

### 11.3 検索クエリ実行フロー

> **注意**: 検索クエリはedumintContentでは処理しません。以下はedumintSearchでの処理フローです。

1. **リクエスト受信**: `GET edumint-search.internal/v1/search?q=自然対数を含んだ微積の問題&university_id=101` → **edumintSearch**
2. **Query Understanding** (edumintSearch): 
   - メモリ上のキーワード辞書でシノニム解決
   - 「微積」→ ID: 200（微分積分のシノニム）
3. **Vectorization**: edumintAiWorker (gRPC) へクエリベクトル化を依頼
4. **Search Execution** (edumintSearch): Elasticsearchでハイブリッド検索クエリを実行
5. **Response**: `exam_id` リストを返却

### 11.4 キーワード更新時のデータフロー

キーワード紐付けの変更（追加・削除）が発生した場合の処理フロー:

#### A. 小問のキーワード更新時

1. **Action**: アプリケーションが `sub_questions.keyword_ids` JSONB全体を更新
   ```sql
   UPDATE sub_questions 
   SET keyword_ids = '[100, 200, 300]'::jsonb, 
       updated_at = NOW()
   WHERE id = '019526a1-7c8d-7000-8000-000000000001';  -- UUID v7形式
   ```

2. **CDC Trigger**: 同一トランザクション内で `outbox` テーブルにイベント登録

3. **Kafka Publish**: Debeziumが `QuestionUpdated` イベントを `content.lifecycle` トピックへ発行

4. **edumintAiWorker**: 
   - イベントを受信
   - `keywords` テーブルからキーワード名を取得
   - 新しい `sub_content_embedding_gemini` を生成
   - PostgreSQLへ直接UPDATE

5. **PostgreSQL Update**: ベクトルカラムが更新される
   ```sql
   UPDATE sub_questions 
   SET sub_content_embedding_gemini = $1::vector
   WHERE id = '019526a1-7c8d-7000-8000-000000000001';  -- UUID v7形式
   ```

#### B. キーワード名変更時

1. **PostgreSQL更新**: `keywords` テーブルのname更新、または `keyword_synonyms` への追加のみ
2. **PostgreSQLベクトルへの影響**: 関連する全レコードの再ベクトル化が必要（バッチ処理）
3. **検索への影響**: アプリケーション層でシノニム辞書を再読み込み

---

## 12. システム全体構成図 (Event-Driven Architecture)

```
【Gateway Service】 (Job Orchestration)
    ┌─────────────────────────────────────────────────┐
    │  edumintGateway                                 │
    │  [Job DB: jobs テーブル]                         │
    │     - ジョブライフサイクル管理                    │
    │     - 冪等性保証（client_request_id）            │
    └──────────────┬──────────────────────────────────┘
                   │
                   │ Kafka (gateway.jobs: job.created)
                   │
                   v
【Content Service Boundary】 (Command Model / Source of Truth)
    ┌─────────────────────────────────────────────────┐
    │  edumintContent                                 │
    │  [Main DB: PostgreSQL 18.1 + pgvector]          │
    │     ├── exams (metadata)                        │
    │     ├── questions (content + embedding source)  │
    │     ├── sub_questions (content + embedding src) │
    │     └── keywords (name + embedding source)      │
    │                                                 │
    │  ※ 検索クエリは実行しない                        │
    │  ※ ベクトルカラムはレプリケーション用ソース       │
    │  ※ Kafka直接publish（outboxテーブルなし）       │
    └───────────────────────┬─────────────────────────┘
                            │
                            │ Kafka (content.lifecycle)
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            v               v               v
    ┌───────────────┐ ┌───────────┐ ┌──────────────────┐
    │ edumintGateway│ │edumintAi  │ │ edumintSearch    │
    │ - ジョブ      │ │Worker     │ │ - Elasticsearch  │
    │   ステータス  │ │- Embedding│ │ - ハイブリッド   │
    │   更新        │ │  生成     │ │   検索API        │
    └───────────────┘ │- PostgreSQL│ │- ソート・絞り込み│
                      │  更新     │ └──────────────────┘
                      └───────────┘

【Raw DB Boundary】 (Secure Storage)
    ┌─────────────────────────────────────────────────┐
    │  [Raw DB: PostgreSQL 18.1]                      │
    │     ├── raw_exam (encrypted BLOB)               │
    │     └── raw_source (encrypted BLOB)             │
    └─────────────────────────────────────────────────┘
```

---

## 13. ER図（PostgreSQL 18.1統合版）

### 13.1 メインDB・生DB間の関係

```
【メインDB: edumint_content】
※ 全テーブル共通: id (UUID v7) = PK, public_id (NanoID 16文字) = URL露出用

[universities_jp]
  +-- id: SMALLINT (PK)
  +-- slug, name_ja, name_en, ...
  |
  +---1---* [faculties_jp]
  |            +-- id: INTEGER (PK)
  |            +-- university_id (FK)
  |
  +---1---* [exams] (大学に複数の試験が紐づく)

[faculties_jp]
  +---1---* [exams] (学部に複数の試験が紐づく)
  +---1---* [subjects]

[users]
  |  id: UUID (PK)
  |  public_id: CHAR(16) (API露出用)
  |
  +---1---* [exam_creation_jobs] (ユーザーが作成リクエスト)

[exams]
  |  id: UUID (PK)
  |  public_id: CHAR(16) (API露出用)
  |  university_id (FK -> universities_jp)
  |  faculty_id (FK -> faculties_jp)
  |  teacher_id (FK -> teachers_jp)
  |  subject_id (FK -> subjects)
  |
  +---* [questions]
  |        +-- id: UUID (PK), public_id: CHAR(16)
  |        +-- question_content_embedding_gemini (vector)
  |        |
  |        +---* [sub_questions]
  |                 +-- id: UUID (PK), public_id: CHAR(16)
  |                 +-- sub_content_embedding_gemini (vector)
  |                 +-- explanation_embedding_gemini (vector)
  |
  +---1 [exam_stats] (exam_id: UUID FK)
  |
  +--- (pointer) ---> [raw_exam] (別DB)
  |
  +--- (pointer) ---> [raw_source] (別DB)

[teachers_jp]
  +-- id: UUID (PK), public_id: CHAR(16)
  +-- name_ja, name_en (日本版教員マスタ)

[subjects]
  +-- id: UUID (PK), public_id: CHAR(16)

[keywords]
  +-- id: INTEGER (PK)
  +-- name_embedding_gemini (vector)
  |
  +---* [keyword_synonyms]

【ジョブ管理】
※ edumintGateway.jobs テーブル（別サービス）
  - type: 'exam_creation', 'file_processing', etc.
  - resource_id: 作成されたリソースID（edumintContent が返却）

【生DB: edumint_secret_raw】
[raw_exam] (exam_id でメインDBと論理結合)
[raw_source] (exam_id でメインDBと論理結合)
```

**注意**: メインDBと生DBの間には物理的な外部キー制約は設定できません。アプリケーション層で整合性を保証します。

---

## 14. 型マッピング参照表（MySQL → PostgreSQL 18.1）

> **注意**: 本ドキュメントでは `TIMESTAMPTZ(6)` （マイクロ秒精度）を標準使用しています。

| MySQL 型 | PostgreSQL 18.1 型 | 備考 |
|:---|:---|:---|
| `BINARY(16)` | `UUID` | PostgreSQL 18.1で `uuidv7()` 関数使用 |
| `CHAR(16)` | `CHAR(16)` | NanoID用（変更なし） |
| `TINYINT(1)` | `BOOLEAN` | true/false |
| `TINYINT UNSIGNED` | `SMALLINT` | 0-255範囲 |
| `SMALLINT UNSIGNED` | `SMALLINT` / `INTEGER` | 必要に応じて |
| `MEDIUMINT UNSIGNED` | `INTEGER` | PostgreSQLにMEDIUMINTなし |
| `INT UNSIGNED` | `INTEGER` | 符号なしはCHECK制約で対応 |
| `BIGINT UNSIGNED` | `BIGINT` | 符号なしはCHECK制約で対応 |
| `FLOAT` | `REAL` | 単精度浮動小数点 |
| `DOUBLE` | `DOUBLE PRECISION` | 倍精度浮動小数点 |
| `DATETIME` | `TIMESTAMPTZ(6)` | タイムゾーン付き・マイクロ秒精度 |
| `TIMESTAMP` | `TIMESTAMPTZ(6)` | タイムゾーン付き・マイクロ秒精度 |
| `JSON` | `JSONB` | バイナリJSON（検索効率向上） |
| `LONGBLOB` | `BYTEA` | バイナリデータ |
| `TEXT` | `TEXT` | 変更なし |
| `VARCHAR(n)` | `VARCHAR(n)` | 変更なし |
| `ENUM(...)` | `VARCHAR + CHECK` | CHECK制約で代替 |
| `AUTO_INCREMENT` | `GENERATED ALWAYS AS IDENTITY` | PostgreSQL標準 |

---

## 15. 参考資料

- ID戦略詳細: [F_ARCHITECTURE.md](F_ARCHITECTURE.md)
- API仕様: [D_INTERFACE_SPEC.md](D_INTERFACE_SPEC.md)
- 環境変数: [J_ENV_VARS_REGISTRY.md](J_ENV_VARS_REGISTRY.md)
- 技術スタック制約: [G_TECH_STACK_CONSTRAINTS.md](G_TECH_STACK_CONSTRAINTS.md)

---

## 16. Changelog

- **Version 2.1** — 2026-02-03: **ジョブ管理をedumintGatewayに全面移行**。`exam_creation_jobs`, `extraction_jobs`, `extraction_job_items`, `outbox` テーブルを削除。CDC Outboxパターンを廃止しKafka直接publishに変更。イベント駆動アーキテクチャへの完全移行。責務分離の明確化（edumintGateway = ジョブ管理、edumintContent = ドメインデータ管理）。Kafkaトピック設計の更新（`gateway.jobs`, `content.lifecycle`, `ai.results`, `gateway.job_status`）。

- **Version 2.0** — 2026-02-02: PostgreSQL 18.1 + pgvector移行完了。CQRS明確化（edumintContent = Source of Truth、edumintSearch = 全ての検索処理）、ベクトルカラムはレプリケーション用に再定義、`faculties_jp` コメント追加、`exam_stats.created_at` 追加、図表・用語の明確化を含む各種修正。
