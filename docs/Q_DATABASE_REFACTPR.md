# **EduMint 統合データモデル設計書（最終版）**

本ドキュメントは、EduMintのマイクロサービスアーキテクチャに基づいた、統合されたデータモデル設計です。各テーブルの所有サービス、責務、外部API非依存の自己完結型データ管理を定義します。

---

## **目次**

1. [アーキテクチャ前提](#1-アーキテクチャ前提)
2. [サービス別DB所有関係](#2-サービス別db所有関係)
3. [マスタデータ管理（大学・学部・学科）](#3-マスタデータ管理大学学部学科)
4. [ユーザー・認証管理](#4-ユーザー認証管理)
5. [ファイル・ジョブ管理](#5-ファイルジョブ管理)
6. [試験・問題データ管理](#6-試験問題データ管理)
7. [検索・キーワード・オートコンプリート](#7-検索キーワードオートコンプリート)
8. [ソーシャル・評価データ](#8-ソーシャル評価データ)
9. [経済・広告・学習履歴](#9-経済広告学習履歴)
10. [通報管理（コンテンツ・ユーザー）](#10-通報管理コンテンツユーザー)
11. [イベント駆動フロー](#11-イベント駆動フロー)
12. [データベース設計ガイドライン](#12-データベース設計ガイドライン)

---

## **1. アーキテクチャ前提**

### 基本設計原則

*   **Database per Service**: 各マイクロサービスが自身のデータベースを所有する。
*   **イベント駆動統合**: サービス間の協調は Kafka を通じたイベントで実現。
*   **最終整合性**: ドメインサービス間のデータ同期は結果整合性（Eventual Consistency）を基本とする。ただし金銭取引（ウォレット）は強整合性を維持。
*   **単一オーナーシップ**: 各テーブルの書き込み権限は、当該サービスのみ。他サービスは API または Kafka イベント経由で参照・反映。
*   **外部API非依存**: 全てのマスタデータは自前のDBで管理し、外部APIへの依存を排除（コスト・レイテンシ削減）。
*   **ENUM型の積極採用**: 固定値の管理はPostgreSQL ENUM型を使用し、型安全性・パフォーマンス・可読性を向上させる。
*   **グローバル対応**: 学問分野はUNESCO ISCED-F 2013（11大分類）に準拠し、国際標準に沿った設計とする。

### デプロイ段階

*   **Phase 1 (MVP)**: edumintGateway, edumintAuth, edumintUserProfile, edumintFile, edumintContent, edumintAiWorker, edumintSearch
*   **Phase 2 (製品版)**: + edumintMonetizeWallet, edumintRevenue, edumintSocial, edumintModeration
*   **Phase 3 (拡張版)**: + 多言語・推薦等

### ENUM型定義

EduMintでは固定値の管理にPostgreSQL ENUM型を採用します。これにより型安全性が向上し、フロントエンドとの連携が明確になります。

#### **1.1. 問題・試験関連ENUM**

```sql
-- 問題タイプ
CREATE TYPE question_type_enum AS ENUM (
  'single_choice',      -- 単一選択
  'multiple_choice',    -- 複数選択
  'true_false',         -- 正誤判定
  'matching',           -- 組み合わせ
  'ordering',           -- 順序並べ替え
  'essay',              -- 記述式
  'proof',              -- 証明問題
  'coding',             -- コード記述
  'translation',        -- 翻訳
  'calculation'         -- 数値計算
);

-- 難易度レベル
CREATE TYPE difficulty_level_enum AS ENUM (
  'basic',              -- 基礎
  'standard',           -- 標準
  'advanced'            -- 発展
);

-- 試験タイプ
CREATE TYPE exam_type_enum AS ENUM (
  'regular',            -- 定期試験
  'class',              -- 授業内試験
  'quiz'                -- 小テスト
);

-- 学期
CREATE TYPE semester_enum AS ENUM (
  'spring',             -- 春学期
  'fall',               -- 秋学期
  'summer',             -- 夏季集中
  'winter',             -- 冬季集中
  'full_year',          -- 通年
  'quarter_1',          -- 第1クォーター
  'quarter_2',          -- 第2クォーター
  'quarter_3',          -- 第3クォーター
  'quarter_4'           -- 第4クォーター
);

-- 文理区分
CREATE TYPE academic_track_enum AS ENUM (
  'science',            -- 理系
  'humanities'          -- 文系
);

-- 試験ステータス
CREATE TYPE exam_status_enum AS ENUM (
  'draft',              -- 下書き
  'pending',            -- 承認待ち
  'active',             -- 公開中
  'archived',           -- アーカイブ
  'deleted'             -- 削除済み
);
```

#### **1.2. 教育機関関連ENUM**

```sql
-- 機関タイプ
CREATE TYPE institution_type_enum AS ENUM (
  'university',                 -- 大学（学部）
  'graduate_school',            -- 大学院
  'junior_college',             -- 短期大学
  'technical_college',          -- 高等専門学校（本科）
  'technical_college_advanced', -- 高等専門学校（専攻科）
  'high_school',                -- 高等学校
  'vocational_school'           -- 専門学校
);
```

#### **1.3. 学問分野ENUM（UNESCO ISCED-F 2013準拠）**

```sql
-- 学問分野（UNESCO ISCED-F 2013 11大分類）
CREATE TYPE academic_field_enum AS ENUM (
  'generic_programmes',  -- 00: 汎用プログラム・資格
  'education',           -- 01: 教育
  'arts_and_humanities', -- 02: 芸術・人文科学
  'social_sciences',     -- 03: 社会科学・ジャーナリズム・情報
  'business_and_law',    -- 04: ビジネス・経営・法律
  'natural_sciences',    -- 05: 自然科学・数学・統計
  'ict',                 -- 06: 情報通信技術
  'engineering',         -- 07: 工学・製造・建設
  'agriculture',         -- 08: 農林水産・獣医
  'health_and_welfare',  -- 09: 保健・福祉
  'services'             -- 10: サービス
);
```

#### **1.4. ユーザー・認証関連ENUM**

```sql
-- 言語
CREATE TYPE language_enum AS ENUM (
  'ja',                 -- 日本語
  'en',                 -- 英語
  'zh',                 -- 中国語
  'ko',                 -- 韓国語
  'other'               -- その他
);

-- ユーザーロール
CREATE TYPE user_role_enum AS ENUM (
  'user',               -- 一般ユーザー
  'premium',            -- プレミアムユーザー
  'moderator',          -- モデレーター
  'admin',              -- 管理者
  'system'              -- システム
);

-- ユーザーステータス
CREATE TYPE user_status_enum AS ENUM (
  'active',             -- アクティブ
  'inactive',           -- 非アクティブ
  'suspended',          -- 一時停止
  'banned',             -- 永久停止
  'deleted'             -- 削除済み
);

-- 認証イベント
CREATE TYPE auth_event_enum AS ENUM (
  'login_success',      -- ログイン成功
  'login_failed',       -- ログイン失敗
  'logout',             -- ログアウト
  'token_issued',       -- トークン発行
  'token_refreshed',    -- トークン更新
  'token_revoked',      -- トークン無効化
  'password_changed',   -- パスワード変更
  'mfa_enabled',        -- 多要素認証有効化
  'account_locked'      -- アカウントロック
);
```

#### **1.5. ジョブ・通報関連ENUM**

```sql
-- ジョブステータス
CREATE TYPE job_status_enum AS ENUM (
  'pending',            -- 待機中
  'queued',             -- キュー登録済み
  'processing',         -- 処理中
  'completed',          -- 完了
  'failed',             -- 失敗
  'retrying',           -- リトライ中
  'cancelled'           -- キャンセル
);

-- ジョブタイプ
CREATE TYPE job_type_enum AS ENUM (
  'exam_creation',      -- 試験作成
  'file_upload',        -- ファイルアップロード
  'ocr_processing',     -- OCR処理
  'ai_generation',      -- AI生成
  'search_indexing',    -- 検索インデックス作成
  'term_generation',    -- 用語生成
  'revenue_calculation',-- 収益計算
  'data_sync'           -- データ同期
);

-- 通報ステータス
CREATE TYPE report_status_enum AS ENUM (
  'pending',            -- 未対応
  'assigned',           -- 担当者割当済み
  'investigating',      -- 調査中
  'resolved',           -- 解決済み
  'ignored'             -- 無視
);
```

#### **1.6. 経済・通知関連ENUM**

```sql
-- トランザクションタイプ
CREATE TYPE transaction_type_enum AS ENUM (
  'earn_upload',        -- アップロード報酬
  'earn_ad_view',       -- 広告視聴報酬
  'earn_referral',      -- 紹介報酬
  'spend_unlock',       -- コンテンツ解除
  'spend_tip',          -- 投げ銭
  'refund',             -- 返金
  'admin_adjustment'    -- 管理者調整
);

-- 通知タイプ
CREATE TYPE notification_type_enum AS ENUM (
  'exam_liked',         -- 試験いいね
  'exam_commented',     -- 試験コメント
  'user_followed',      -- フォロー通知
  'coin_earned',        -- コイン獲得
  'report_resolved',    -- 通報解決
  'system_notice',      -- システム通知
  'moderation_action'   -- モデレーション通知
);
```

---

## **2. サービス別DB所有関係**

| サービス | 役割 | 所有テーブル | イベント発行 | Kafka購読 |
| :--- | :--- | :--- | :--- | :--- |
| **edumintGateway** | ジョブオーケストレーション | `jobs` | `gateway.jobs` | `content.lifecycle`, `ai.results`, `gateway.job_status` |
| **edumintAuth** | SSO・認証 | `oauth_clients`, `oauth_tokens`, `idp_links`, `auth_logs` | `auth.events` | - |
| **edumintUserProfile** | ユーザー管理・フォロー・通知 | `users`, `user_profiles`, `user_follows`, `user_blocks`, `notifications` | `user.events` | `auth.events` |
| **edumintFile** | ファイル管理 | `file_inputs`, `file_upload_jobs` | `content.jobs` (FileUploaded) | `gateway.jobs` |
| **edumintContent** | 試験・問題データ (Source of Truth) | `institutions`, `faculties`, `departments`, `teachers`, `subjects`, `academic_field_metadata`, `exams`, `questions`, `sub_questions`, etc. | `content.lifecycle` | `gateway.jobs`, `ai.results` |
| **edumintSearch** | 検索・インデックス | `*_terms` (subject, institution, faculty, teacher), `term_generation_jobs`, `term_generation_candidates`, Elasticsearch索引、Qdrant索引 | `search.indexed`, `search.term_generation` | `content.lifecycle` |
| **edumintAiWorker** | AI処理（ステートレス） | （通常DBなし）*キャッシュ・ジョブログのみ | `ai.results` | `gateway.jobs`, `content.jobs`, `search.term_generation` |
| **edumintSocial** | SNS機能（コメント・いいね） | `exam_likes`, `exam_bads`, `exam_comments`, `exam_views` | `content.feedback` | - |
| **edumintMonetizeWallet** | MintCoin管理 | `wallets`, `wallet_transactions` | `monetization.transactions` | - |
| **edumintRevenue** | 収益分配 | `revenue_reports`, `ad_impressions_agg` | `revenue.reports` | `monetization.transactions` |
| **edumintModeration** | 通報管理 | `content_reports`, `content_report_reasons`, `user_reports`, `user_report_reasons`, `report_files` | `moderation.events` | - |
| **edumintAdmin** | 管理UI統合 | （他サービスのAPIを集約） | - | - |

---

## **3. マスタデータ管理（大学・学部・学科）**

### 管理サービス: **edumintContent**

マスタデータは edumintContent で一元管理します。edumintSearch は Kafka イベントを購読して、検索用語(`*_terms`)の索引を更新します。

### **3.0. 設計原則**

#### **3.0.1. 教育機関の統一管理方針**

EduMintでは以下の教育機関を統一的に扱います：

| 機関種別 | `institution_type` | 説明 |
|----------|-------------------|------|
| 大学（学部） | `university` | 4年制大学の学部課程 |
| 大学院 | `graduate_school` | 大学院課程 |
| 短期大学 | `junior_college` | 2-3年制短期大学 |
| 高等専門学校（本科） | `technical_college` | 5年制高専 |
| 高等専門学校（専攻科） | `technical_college_advanced` | 高専専攻科（2年制） |
| 高等学校 | `high_school` | 高等学校 |
| 専門学校 | `vocational_school` | 専門学校 |

**設計判断：**
- **institution_type で全てを区別**: 大学と大学院は別の institution として登録
- **3階層で統一**: institutions → faculties → departments
- **外部API非依存**: 全データを自前のDBで管理

#### **3.0.2. 階層深度の設計判断**

**結論: 3階層モデルで確定**

```
institutions (第1階層)
  └─ faculties (第2階層)
       └─ departments (第3階層)
```

**設計根拠:**

1. **実用性の観点**: 学科レベル（3階層）まで指定すれば、試験内容は特定される
2. **ユーザー体験の観点**: 全ての学生が「大学・学部・学科」は把握している
3. **データ整備の観点**: 大学・学部・学科は文部科学省の公式データで定義されている
4. **検索精度の観点**: 3階層で十分な結果数を確保しつつ、適切に絞り込み可能
5. **業界標準**: 主要な過去問サイト・大学情報サイトは全て3階層以下

**4階層以上が不要な理由:**
- コース・講座（4階層以降）は研究室配属の話であり、過去問検索とは無関係
- 大学院は別機関として登録すれば3階層で対応可能

#### **3.0.3. データ取り込み戦略**

**初回データ投入:**
```
[文部科学省 公式データ]
  - 大学一覧（Excel/PDF）
  - 短期大学一覧
  - 高等専門学校一覧
     ↓
[手動/半自動 パース]
  - Python スクリプトで Excel → CSV 変換
     ↓
[DB インポート]
  INSERT INTO institutions (mext_code, name, prefecture, ...)
     ↓
[データ補完]
  - name_kana: 形態素解析で自動生成
  - abbreviation: ルールベースで生成
```

**年次更新:**
```
[毎年4月] 文科省が最新データを公開
     ↓
[差分検出] 新設・廃止・名称変更
     ↓
[DB 更新] UPDATE institutions WHERE mext_code = ...
     ↓
[Kafka イベント発行] content.lifecycle → InstitutionUpdated
     ↓
[edumintSearch] *_terms テーブル更新、Elasticsearch 再インデックス
```

---

### **3.1. `institutions` テーブル**

教育機関の基本情報を管理。大学、大学院、短大、高専、高校などを `institution_type` で区別。

```sql
CREATE TABLE institutions (
  -- 主キー
  id SERIAL PRIMARY KEY,
  
  -- 機関種別（ENUM型）
  institution_type institution_type_enum NOT NULL,
  
  -- 親機関（大学院→大学の紐付け）
  parent_institution_id INTEGER REFERENCES institutions(id),
  
  -- 文部科学省コード（データ同期用）
  mext_code VARCHAR(20) UNIQUE,
  
  -- 基本情報
  name VARCHAR(255) NOT NULL,
  name_kana VARCHAR(255), -- 検索・ソートに使用
  name_english VARCHAR(255), -- 多言語対応時に使用
  abbreviation VARCHAR(50), -- オートコンプリート表示に使用（例: 東大、京大）
  
  -- 定員・人気度（検索ソート順位に使用）
  total_enrollment_capacity INTEGER DEFAULT 0,
  popularity_score INTEGER DEFAULT 0,
  
  -- 所在地（地域検索に使用）
  prefecture VARCHAR(50), -- NULL 許容
  
  -- ステータス
  is_active BOOLEAN DEFAULT TRUE,
  
  -- タイムスタンプ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP -- 文科省データ最終同期日時
);

-- インデックス
CREATE INDEX idx_institutions_type ON institutions(institution_type);
CREATE INDEX idx_institutions_parent ON institutions(parent_institution_id);
CREATE INDEX idx_institutions_kana ON institutions(name_kana);
CREATE INDEX idx_institutions_prefecture ON institutions(prefecture) WHERE prefecture IS NOT NULL;
CREATE INDEX idx_institutions_popularity ON institutions(popularity_score DESC);
CREATE INDEX idx_institutions_active ON institutions(is_active) WHERE is_active = TRUE;
CREATE UNIQUE INDEX idx_institutions_mext_code ON institutions(mext_code) WHERE mext_code IS NOT NULL;
```

**イベント:** `content.lifecycle` → `InstitutionCreated`, `InstitutionUpdated`, `InstitutionDeactivated`

**データ例:**

```sql
-- 東京大学（学部）
INSERT INTO institutions (id, name, name_kana, abbreviation, institution_type, parent_institution_id, prefecture, mext_code) VALUES
(1, '東京大学', 'とうきょうだいがく', '東大', 'university', NULL, '東京都', '4A0001');

-- 東京大学大学院
INSERT INTO institutions (id, name, name_kana, abbreviation, institution_type, parent_institution_id, prefecture) VALUES
(2, '東京大学大学院', 'とうきょうだいがくだいがくいん', '東大院', 'graduate_school', 1, '東京都');

-- 早稲田大学（学部）
INSERT INTO institutions (id, name, name_kana, abbreviation, institution_type, parent_institution_id, prefecture) VALUES
(3, '早稲田大学', 'わせだだいがく', '早稲田', 'university', NULL, '東京都');

-- 早稲田大学大学院
INSERT INTO institutions (id, name, name_kana, abbreviation, institution_type, parent_institution_id, prefecture) VALUES
(4, '早稲田大学大学院', 'わせだだいがくだいがくいん', '早稲田院', 'graduate_school', 3, '東京都');
```

---

### **3.2. `faculties` テーブル**

学部、研究科、学科（短大・高専）を統一的に管理。

```sql
CREATE TABLE faculties (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  mext_faculty_code VARCHAR(20),
  
  name VARCHAR(255) NOT NULL,
  name_kana VARCHAR(255),
  name_english VARCHAR(255),
  
  established_year INTEGER,
  total_enrollment_capacity INTEGER DEFAULT 0,
  academic_field academic_field_enum,
  
  is_active BOOLEAN DEFAULT TRUE,
  popularity_score INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(institution_id, name)
);

-- インデックス
CREATE INDEX idx_faculties_institution ON faculties(institution_id);
CREATE INDEX idx_faculties_kana ON faculties(name_kana);
CREATE INDEX idx_faculties_active ON faculties(is_active);
CREATE INDEX idx_faculties_popularity ON faculties(popularity_score DESC);
CREATE INDEX idx_faculties_field ON faculties(academic_field);
```

**イベント:** `content.lifecycle` → `FacultyCreated`, `FacultyUpdated`

**データ例:**

```sql
-- 東京大学の学部
INSERT INTO faculties (institution_id, name, name_kana) VALUES
(1, '工学部', 'こうがくぶ'),
(1, '理学部', 'りがくぶ');

-- 東京大学大学院の研究科
INSERT INTO faculties (institution_id, name, name_kana) VALUES
(2, '工学系研究科', 'こうがくけいけんきゅうか'),
(2, '理学系研究科', 'りがくけいけんきゅうか');
```

---

### **3.3. `departments` テーブル**

学科、専攻、コースを統一的に管理。

```sql
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  
  mext_department_code VARCHAR(20),
  
  name VARCHAR(255) NOT NULL,
  name_kana VARCHAR(255),
  name_english VARCHAR(255),
  
  established_year INTEGER,
  enrollment_capacity INTEGER DEFAULT 0,
  academic_field academic_field_enum,
  
  is_active BOOLEAN DEFAULT TRUE,
  popularity_score INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(faculty_id, name)
);

-- インデックス
CREATE INDEX idx_departments_faculty ON departments(faculty_id);
CREATE INDEX idx_departments_kana ON departments(name_kana);
CREATE INDEX idx_departments_active ON departments(is_active);
CREATE INDEX idx_departments_popularity ON departments(popularity_score DESC);
CREATE INDEX idx_departments_field ON departments(academic_field);
```

**イベント:** `content.lifecycle` → `DepartmentCreated`, `DepartmentUpdated`

**データ例:**

```sql
-- 東京大学 工学部の学科
INSERT INTO departments (faculty_id, name, name_kana) VALUES
(10, '電気電子工学科', 'でんきでんしこうがくか'),
(10, '機械工学科', 'きかいこうがくか');

-- 東京大学大学院 工学系研究科の専攻
INSERT INTO departments (faculty_id, name, name_kana) VALUES
(20, '電気系工学���攻', 'でんきけいこうがくせんこう'),
(20, '機械工学専攻', 'きかいこうがくせんこう');
```

---

### **3.4. `teachers` テーブル**

教授情報を管理。

```sql
CREATE TABLE teachers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  
  name VARCHAR(255) NOT NULL,
  name_kana VARCHAR(255),
  
  institution_id INTEGER NOT NULL REFERENCES institutions(id),
  faculty_id INTEGER REFERENCES faculties(id),
  department_id INTEGER REFERENCES departments(id),
  
  title VARCHAR(50), -- 職位（教授、准教授、講師等）
  research_keywords TEXT[], -- 研究キーワード配列
  
  is_active BOOLEAN DEFAULT TRUE,
  popularity_score INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_teachers_institution ON teachers(institution_id);
CREATE INDEX idx_teachers_faculty ON teachers(faculty_id);
CREATE INDEX idx_teachers_department ON teachers(department_id);
CREATE INDEX idx_teachers_kana ON teachers(name_kana);
CREATE INDEX idx_teachers_popularity ON teachers(popularity_score DESC);
```

**イベント:** `content.lifecycle` → `TeacherCreated`, `TeacherUpdated`

---

### **3.5. `academic_field_metadata` テーブル**

学問分野のメタデータ管理（UNESCO ISCED-F 2013準拠 11大分類）。

**設計方針:**
- 日本独自の学問分類を廃止し、UNESCO ISCED-F 2013の国際標準分類を採用
- ENUM型 (`academic_field_enum`) を主キーとして使用
- 多言語対応・i18n対応のためのメタデータを保持
- 静的マスタとして扱い、Kafkaイベントは発行しない

```sql
CREATE TABLE academic_field_metadata (
  -- 主キー（ENUM型）
  field_code academic_field_enum PRIMARY KEY,
  
  -- ISCED-F公式コード
  isced_code VARCHAR(2) NOT NULL UNIQUE,  -- '00' to '10'
  
  -- 多言語名称（i18nキーで管理、ここはフォールバック用）
  field_name_en VARCHAR(100) NOT NULL,
  field_name_ja VARCHAR(100) NOT NULL,
  
  -- 文理区分（日本市場向け互換性）
  academic_track VARCHAR(20) NOT NULL,
  -- 'humanities': 文系
  -- 'science': 理系
  -- 'interdisciplinary': 学際
  
  -- 表示順序
  sort_order INTEGER NOT NULL,
  
  -- i18nキー（フロントエンドで使用）
  i18n_key VARCHAR(100) NOT NULL,
  
  -- 説明
  description_en TEXT,
  description_ja TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_academic_field_meta_track ON academic_field_metadata(academic_track);
CREATE INDEX idx_academic_field_meta_order ON academic_field_metadata(sort_order);
```

**サンプルデータ（UNESCO ISCED-F 2013 11大分類）:**

```sql
INSERT INTO academic_field_metadata (field_code, isced_code, field_name_en, field_name_ja, academic_track, sort_order, i18n_key, description_en, description_ja) VALUES
('generic_programmes', '00', 'Generic programmes and qualifications', '汎用プログラム・資格', 'interdisciplinary', 1, 'enum.academic_field.generic_programmes', 
 'Not further defined or interdisciplinary programmes', '特定分野に属さない汎用的なプログラムや資格'),

('education', '01', 'Education', '教育', 'humanities', 2, 'enum.academic_field.education',
 'Teacher training and education science', '教員養成および教育学'),

('arts_and_humanities', '02', 'Arts and humanities', '芸術・人文科学', 'humanities', 3, 'enum.academic_field.arts_and_humanities',
 'Arts, humanities, languages, history, philosophy', '芸術、人文科学、言語、歴史、哲学'),

('social_sciences', '03', 'Social sciences, journalism and information', '社会科学・ジャーナリズム・情報', 'humanities', 4, 'enum.academic_field.social_sciences',
 'Social and behavioural sciences, journalism and information', '社会科学、行動科学、ジャーナリズム、情報学'),

('business_and_law', '04', 'Business, administration and law', 'ビジネス・経営・法律', 'humanities', 5, 'enum.academic_field.business_and_law',
 'Business, administration, law', 'ビジネス、経営管理、法学'),

('natural_sciences', '05', 'Natural sciences, mathematics and statistics', '自然科学・数学・統計', 'science', 6, 'enum.academic_field.natural_sciences',
 'Physical sciences, biological sciences, mathematics and statistics', '物理科学、生物科学、数学、統計学'),

('ict', '06', 'Information and Communication Technologies', '情報通信技術', 'science', 7, 'enum.academic_field.ict',
 'Computer science, IT, software and applications development', 'コンピュータサイエンス、IT、ソフトウェア開発'),

('engineering', '07', 'Engineering, manufacturing and construction', '工学・製造・建設', 'science', 8, 'enum.academic_field.engineering',
 'Engineering, manufacturing, construction, architecture', '工学、製造、建設、建築'),

('agriculture', '08', 'Agriculture, forestry, fisheries and veterinary', '農林水産・獣医', 'science', 9, 'enum.academic_field.agriculture',
 'Agriculture, forestry, fisheries, veterinary', '農業、林業、水産業、獣医学'),

('health_and_welfare', '09', 'Health and welfare', '保健・福祉', 'science', 10, 'enum.academic_field.health_and_welfare',
 'Health, medicine, nursing, welfare, social services', '保健、医学、看護、福祉、社会サービス'),

('services', '10', 'Services', 'サービス', 'interdisciplinary', 11, 'enum.academic_field.services',
 'Personal services, transport services, environmental protection, security services', 'パーソナルサービス、運輸、環境保護、保安サービス');
```

**日本独自分類との対応例:**

旧分類（日本独自27分類） → 新分類（UNESCO ISCED-F 11大分類）へのマッピング:

| 旧分類 | 新分類 |
|--------|--------|
| 情報系、情報科学 | `ict` または `natural_sciences` |
| 電気電子系、機械系、建築土木系 | `engineering` |
| 化学系、物理学系、数学系、生物系 | `natural_sciences` |
| 医学系、歯学系、薬学系、看護系 | `health_and_welfare` |
| 農学系 | `agriculture` |
| 経済・経営学系 | `business_and_law` |
| 法学系 | `business_and_law` |
| 文学系、語学系、歴史学系、哲学系 | `arts_and_humanities` |
| 教育学系 | `education` |
| 心理学系、社会学系 | `social_sciences` |
| 芸術・デザイン系 | `arts_and_humanities` |
| 環境科学系、スポーツ科学系、国際関係学系 | `social_sciences` または `interdisciplinary` |

---

### **3.6. `subjects` テーブル**

科目マスタ。

```sql
CREATE TABLE subjects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  
  name VARCHAR(255) NOT NULL UNIQUE,
  name_kana VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**イベント:** `content.lifecycle` → `SubjectCreated`, `SubjectUpdated`

---

### **3.7. 階層ラベルの動的解決**

#### **3.7.1. `institution_hierarchy_configs` テーブル**

機関種別ごとの階層ラベルを管理。

```sql
CREATE TABLE institution_hierarchy_configs (
  id SERIAL PRIMARY KEY,
  institution_type VARCHAR(50) NOT NULL UNIQUE,
  country_code VARCHAR(2) NOT NULL DEFAULT 'JP',
  
  -- 第2階層のラベル
  level2_label_ja VARCHAR(50) NOT NULL,
  level2_label_en VARCHAR(50) NOT NULL,
  
  -- 第3階層のラベル
  level3_label_ja VARCHAR(50) NOT NULL,
  level3_label_en VARCHAR(50) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(institution_type, country_code)
);
```

**サンプルデータ:**

```sql
INSERT INTO institution_hierarchy_configs 
(institution_type, level2_label_ja, level2_label_en, level3_label_ja, level3_label_en) 
VALUES
('university', '学部', 'Faculty', '学科', 'Department'),
('graduate_school', '研究科', 'Graduate School', '専攻', 'Major'),
('junior_college', '学科', 'Department', '専攻', 'Major'),
('technical_college', '学科', 'Department', 'コース', 'Course'),
('technical_college_advanced', '専攻', 'Major', 'コース', 'Course'),
('high_school', '学科', 'Department', 'コース', 'Course'),
('vocational_school', '学科', 'Department', '専攻', 'Major');
```

---

### **3.8. クライアント参照ルール**

#### **3.8.1. ユーザー登録フロー**

```
Step 1: 機関種別を選択
  ( ) 大学（学部）
  ( ) 大学院
  ( ) 短期大学
  ( ) 高等専門学校
  ( ) 高等学校

Step 2: 機関名を選択（オートコンプリート）
  候補ソート順: popularity_score DESC, total_enrollment_capacity DESC

Step 3: 学部/研究科を選択（プルダウン）
  候補ソート順: popularity_score DESC, total_enrollment_capacity DESC

Step 4: 学科/専攻を選択（プルダウン、必須）
  候補ソート順: popularity_score DESC, enrollment_capacity DESC

Step 5: 文理区分を選択
  ( ) 理系
  ( ) 文系

Step 6: 学問分野を選択（任意だが推奨）
  初期値: 学科の academic_field_id から自動推薦
```

#### **3.8.2. オートコンプリートAPI仕様**

**エンドポイント:** `GET /api/v1/autocomplete/institutions`

**パラメータ:**
- `q` (required): 検索クエリ（2文字以上）
- `institution_type` (optional): 機関種別フィルタ
- `limit` (optional): 返却件数（デフォルト: 10）

**レスポンス例:**

```json
{
  "results": [
    {
      "id": 1,
      "name": "東京大学",
      "name_kana": "とうきょうだいがく",
      "abbreviation": "東大",
      "institution_type": "university",
      "prefecture": "東京都",
      "total_enrollment_capacity": 13960,
      "popularity_score": 95000
    }
  ]
}
```

**ソートロジック:**

```sql
ORDER BY
  CASE WHEN name = :query THEN 1
       WHEN abbreviation = :query THEN 2
       ELSE 3 END,
  popularity_score DESC,
  total_enrollment_capacity DESC,
  name_kana ASC
LIMIT :limit;
```

---

## **4. ユーザー・認証管理**

### **4.1. サービス責務分離**

| サービス | 責務 | テーブル |
| :--- | :--- | :--- |
| **edumintAuth** | SSO/OAuth2トークン管理、外部IdP連携 | `oauth_clients`, `oauth_tokens`, `idp_links` |
| **edumintUserProfile** | ユーザープロフィール、ソーシャルグラフ | `users`, `user_profiles`, `user_follows`, `user_blocks`, `notifications` |

---

### **4.2. edumintAuth 管理テーブル**

#### **4.2.1. `oauth_clients` テーブル**

```sql
CREATE TABLE oauth_clients (
  id VARCHAR(36) PRIMARY KEY,
  client_secret_hash VARCHAR(255) NOT NULL,
  redirect_uris TEXT NOT NULL,
  grant_types TEXT NOT NULL,
  response_types TEXT NOT NULL,
  scopes TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **4.2.2. `oauth_tokens` テーブル**

```sql
CREATE TABLE oauth_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  client_id VARCHAR(36) NOT NULL,
  access_token VARCHAR(500) NOT NULL UNIQUE,
  refresh_token VARCHAR(500) UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  scope TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **4.2.3. `idp_links` テーブル**

```sql
CREATE TABLE idp_links (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(provider, provider_user_id)
);
```

**イベント:** `auth.events` → `UserSignedUpViaSSO`, `UserLoggedIn`

---

### **4.3. edumintUserProfile 管理テーブル**

#### **4.3.1. `users` テーブル**

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  
  -- 所属情報（必須）
  institution_id INTEGER NOT NULL REFERENCES institutions(id),
  faculty_id INTEGER NOT NULL REFERENCES faculties(id),
  department_id INTEGER NOT NULL REFERENCES departments(id),
  academic_field academic_field_enum,
  
  -- 学年情報
  academic_track academic_track_enum NOT NULL,
  enrollment_year INTEGER,
  graduation_year INTEGER,
  
  -- プロフィール
  role user_role_enum DEFAULT 'user',
  status user_status_enum DEFAULT 'active',
  deleted_at TIMESTAMP,
  display_name VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(500),
  
  -- 設定
  language language_enum DEFAULT 'ja',
  country VARCHAR(100),
  timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',
  
  -- サブスクリプション
  subscription_plan VARCHAR(50),
  subscription_start_at TIMESTAMP,
  subscription_end_at TIMESTAMP,
  
  -- キャッシュ
  last_login_at TIMESTAMP,
  mintcoin_balance INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  blocked_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_faculty_dept ON users(faculty_id, department_id);
CREATE INDEX idx_users_academic_field ON users(academic_field);
CREATE INDEX idx_users_enrollment_year ON users(enrollment_year);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

**イベント:** `user.events` → `UserCreated`, `UserUpdated`, `UserDeleted`

**購読:** `auth.events` → `UserSignedUpViaSSO` を受信して `users` に自動作成

---

#### **4.3.2. `user_profiles` テーブル**

```sql
CREATE TABLE user_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) UNIQUE REFERENCES users(id),
  
  bio_extended TEXT,
  social_media_links JSONB,
  preferences JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

#### **4.3.3. `user_follows` テーブル**

```sql
CREATE TABLE user_follows (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  follower_id VARCHAR(255) NOT NULL REFERENCES users(id),
  followed_id VARCHAR(255) NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(follower_id, followed_id)
);

CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_followed ON user_follows(followed_id);
```

**イベント:** `user.events` → `UserFollowed`

---

#### **4.3.4. `user_blocks` テーブル**

```sql
CREATE TABLE user_blocks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  blocker_id VARCHAR(255) NOT NULL REFERENCES users(id),
  blocked_id VARCHAR(255) NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(blocker_id, blocked_id)
);
```

**イベント:** `user.events` → `UserBlocked`

---

#### **4.3.5. `notifications` テーブル**

```sql
CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  
  type notification_type_enum NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  link_url TEXT,
  link_exam_id BIGINT,
  
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
```

---

## **5. ファイル・ジョブ管理**

### **5.1. edumintGateway: `jobs` テーブル**

全てのジョブタイプの統一管理テーブル。

```sql
CREATE TABLE jobs (
  id VARCHAR(36) PRIMARY KEY,
  client_request_id VARCHAR(36) UNIQUE,
  
  type job_type_enum NOT NULL,
  status job_status_enum NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  
  payload JSONB NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  
  error_code VARCHAR(50),
  error_message TEXT,
  retry_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_jobs_user ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);
```

**イベント発行:** `gateway.jobs` → `job.created`, `job.processing`, `job.completed`, `job.failed`

---

### **5.2. edumintFile: `file_inputs` テーブル**

```sql
CREATE TABLE file_inputs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  
  file_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type VARCHAR(10) NOT NULL,
  file_size_bytes BIGINT,
  source_type VARCHAR(50) NOT NULL,
  
  analysis_status VARCHAR(50) DEFAULT 'pending',
  analysis_error TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_file_inputs_exam ON file_inputs(exam_id);
CREATE INDEX idx_file_inputs_user ON file_inputs(user_id);
```

**イベント発行:** `content.jobs` → `FileUploaded`

---

### **5.3. edumintFile: `file_upload_jobs` テーブル**

```sql
CREATE TABLE file_upload_jobs (
  id VARCHAR(36) PRIMARY KEY,
  gateway_job_id VARCHAR(36) UNIQUE,
  file_input_id BIGINT REFERENCES file_inputs(id),
  
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## **6. 試験・問題データ管理**

### 管理サービス: **edumintContent**

### **6.1. `exams` テーブル**

```sql
CREATE TABLE exams (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  exam_type exam_type_enum NOT NULL DEFAULT 'regular',
  
  -- 所属情報（必須）
  institution_id INTEGER NOT NULL REFERENCES institutions(id),
  faculty_id INTEGER NOT NULL REFERENCES faculties(id),
  department_id INTEGER NOT NULL REFERENCES departments(id),
  
  teacher_id BIGINT REFERENCES teachers(id),
  subject_id BIGINT NOT NULL REFERENCES subjects(id),
  
  -- 試験情報
  exam_year INT NOT NULL,
  semester semester_enum,
  duration_minutes INT,
  
  academic_field academic_field_enum,
  academic_track academic_track_enum,
  
  -- 作成者
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  
  -- ステータス
  is_public BOOLEAN DEFAULT TRUE,
  status exam_status_enum DEFAULT 'active',
  
  -- ソーシャル指標（キャッシュ）
  comment_count INT DEFAULT 0,
  good_count INT DEFAULT 0,
  bad_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  ad_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_exams_institution ON exams(institution_id);
CREATE INDEX idx_exams_faculty_dept ON exams(faculty_id, department_id);
CREATE INDEX idx_exams_subject_field ON exams(subject_id, academic_field);
CREATE INDEX idx_exams_year_semester ON exams(exam_year, semester);
CREATE INDEX idx_exams_user ON exams(user_id);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_created ON exams(created_at DESC);
```

**イベント発行:** `content.lifecycle` → `ExamCreated`, `ExamUpdated`, `ExamDeleted`, `ExamCompleted`

---

### **6.2. `questions` テーブル（大問）**

```sql
CREATE TABLE questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  
  question_number INT NOT NULL,
  difficulty_level difficulty_level_enum DEFAULT 'standard',
  content TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_exam ON questions(exam_id);
CREATE INDEX idx_questions_level ON questions(difficulty_level);
```

---

### **6.3. `sub_questions` テーブル（小問）**

```sql
CREATE TABLE sub_questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  sub_number INT NOT NULL,
  question_type question_type_enum NOT NULL,
  
  content TEXT NOT NULL,
  answer_explanation TEXT NOT NULL,
  execution_options JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sub_questions_question ON sub_questions(question_id);
CREATE INDEX idx_sub_questions_type ON sub_questions(question_type);
```

**注記:** `question_types` テーブルは廃止され、`question_type_enum` に置き換えられました。

---
```

---

### **6.5-6.7. 補助テーブル**

```sql
-- 選択肢（ID 1-3用）
CREATE TABLE sub_question_selection (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sub_question_id BIGINT NOT NULL REFERENCES sub_questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

-- マッチング（ID 4用）
CREATE TABLE sub_question_matching (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sub_question_id BIGINT NOT NULL REFERENCES sub_questions(id) ON DELETE CASCADE,
  left_content TEXT NOT NULL,
  right_content TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- 順序付け（ID 5用）
CREATE TABLE sub_question_ordering (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sub_question_id BIGINT NOT NULL REFERENCES sub_questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  correct_order INT NOT NULL
);
```

---

### **6.8-6.10. キーワード管理**

```sql
-- キーワードマスタ
CREATE TABLE keywords (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  keyword VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 大問キーワード
CREATE TABLE question_keywords (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  keyword_id BIGINT NOT NULL REFERENCES keywords(id),
  relevance_score FLOAT,
  UNIQUE(question_id, keyword_id)
);

-- 小問キーワード
CREATE TABLE sub_question_keywords (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sub_question_id BIGINT NOT NULL REFERENCES sub_questions(id) ON DELETE CASCADE,
  keyword_id BIGINT NOT NULL REFERENCES keywords(id),
  relevance_score FLOAT,
  UNIQUE(sub_question_id, keyword_id)
);
```

---

## **7. 検索・キーワード・オートコンプリート**

### 管理サービス: **edumintSearch**

### **7.1. 検索用語テーブル**

#### **7.1.1. `institution_terms` テーブル**

```sql
CREATE TABLE institution_terms (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  institution_id INTEGER NOT NULL REFERENCES institutions(id),
  
  term VARCHAR(255) NOT NULL,
  hiragana VARCHAR(255),
  katakana VARCHAR(255),
  romaji VARCHAR(255),
  english_name VARCHAR(255),
  phonetic_key VARCHAR(255),
  normalized_term VARCHAR(255) NOT NULL,
  
  language VARCHAR(10) DEFAULT 'ja',
  variant_type VARCHAR(50) DEFAULT 'alias',
  confidence_score DECIMAL(3,2) DEFAULT 0.80,
  usage_count INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(institution_id, normalized_term)
);

CREATE INDEX idx_institution_terms_normalized ON institution_terms(normalized_term);
CREATE INDEX idx_institution_terms_usage ON institution_terms(usage_count DESC);
CREATE INDEX idx_institution_terms_inst ON institution_terms(institution_id);
```

#### **7.1.2-7.1.4. その他の *_terms テーブル**

同様の構造で `faculty_terms`, `subject_terms`, `teacher_terms` を定義。

---

### **7.2. LLM連携（用語候補自動生成）**

#### **7.2.1. `term_generation_jobs` テーブル**

```sql
CREATE TABLE term_generation_jobs (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(30) NOT NULL,
  entity_id BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  trigger_type VARCHAR(30) DEFAULT 'system',
  requested_by VARCHAR(255),
  llm_model VARCHAR(50) DEFAULT 'gemini-1.5-pro-latest',
  prompt_payload JSONB NOT NULL,
  response_raw JSONB,
  retry_count INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **7.2.2. `term_generation_candidates` テーブル**

```sql
CREATE TABLE term_generation_candidates (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL REFERENCES term_generation_jobs(id),
  entity_type VARCHAR(30) NOT NULL,
  entity_id BIGINT NOT NULL,
  suggested_term VARCHAR(255) NOT NULL,
  hiragana VARCHAR(255),
  katakana VARCHAR(255),
  romaji VARCHAR(255),
  english_name VARCHAR(255),
  normalized_term VARCHAR(255) NOT NULL,
  phonetic_key VARCHAR(255),
  variant_type VARCHAR(50) DEFAULT 'llm_alias',
  confidence_score DECIMAL(3,2) DEFAULT 0.75,
  auto_adopted BOOLEAN DEFAULT FALSE,
  adopted_term_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## **8. ソーシャル・評価データ**

### 管理サービス: **edumintSocial**

```sql
-- いいね
CREATE TABLE exam_likes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_id, user_id)
);

-- 低評価
CREATE TABLE exam_bads (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_id, user_id)
);

-- コメント
CREATE TABLE exam_comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 閲覧
CREATE TABLE exam_views (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT NOT NULL,
  user_id VARCHAR(255),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**イベント発行:** `content.feedback` → `ExamLiked`, `ExamBadRated`, `ExamCommented`, `ExamViewed`

---

## **9. 経済・広告・学習履歴**

### **9.1. edumintMonetizeWallet**

```sql
-- ウォレット
CREATE TABLE wallets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  balance BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'JPY',
  locked_balance BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- トランザクション
CREATE TABLE wallet_transactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  wallet_id BIGINT NOT NULL REFERENCES wallets(id),
  amount BIGINT NOT NULL,
  type transaction_type_enum NOT NULL,
  reference_type VARCHAR(50),
  reference_id VARCHAR(255),
  description TEXT,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);
```

**イベント発行:** `monetization.transactions` → `CoinAwarded`, `CoinSpent`

---

### **9.2. edumintRevenue**

```sql
-- 収益レポート
CREATE TABLE revenue_reports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,
  report_month DATE NOT NULL,
  ad_earnings BIGINT NOT NULL,
  exam_share BIGINT NOT NULL,
  total_earnings BIGINT NOT NULL,
  payable_amount BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### **9.3. edumintUserProfile（共存）**

```sql
-- 広告視聴履歴
CREATE TABLE user_ad_views (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,
  exam_id BIGINT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  ad_network VARCHAR(50),
  revenue_share BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, exam_id, action_type)
);

-- 学習履歴
CREATE TABLE learning_histories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,
  exam_id BIGINT NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## **10. 通報管理（コンテンツ・ユーザー）**

### 管理サービス: **edumintModeration**

```sql
-- コンテンツ通報
CREATE TABLE content_reports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  reporter_user_id VARCHAR(255) NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  content_id BIGINT NOT NULL,
  reason_id INT NOT NULL REFERENCES content_report_reasons(id),
  details TEXT,
  status report_status_enum DEFAULT 'pending',
  moderator_id VARCHAR(255),
  action_taken VARCHAR(50),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_content_reports_reporter ON content_reports(reporter_user_id);

-- コンテンツ通報理由
CREATE TABLE content_report_reasons (
  id INT PRIMARY KEY,
  reason_text VARCHAR(255) NOT NULL,
  description TEXT
);

INSERT INTO content_report_reasons (id, reason_text, description) VALUES
(1, '解答が不正確・間違っている', '生成された解答の誤り'),
(2, '問題文が不明瞭・誤字がある', '意味不明瞭、誤字脱字'),
(3, '問題と解答の対応が不適切', '不一致'),
(4, '著作権を侵害している疑い', '無断転載'),
(5, '不適切な表現を含んでいる', '公序良俗違反'),
(6, 'スパム・宣伝目的である', '宣伝など'),
(99, 'その他', 'その他');

-- ユーザー通報
CREATE TABLE user_reports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  reporter_user_id VARCHAR(255) NOT NULL,
  reported_user_id VARCHAR(255) NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  content_id VARCHAR(255),
  reason_id INT NOT NULL REFERENCES user_report_reasons(id),
  details TEXT,
  status report_status_enum DEFAULT 'pending',
  moderator_id VARCHAR(255),
  action_taken VARCHAR(50),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_reports_status ON user_reports(status);
CREATE INDEX idx_user_reports_reporter ON user_reports(reporter_user_id);

-- ユーザー通報理由
CREATE TABLE user_report_reasons (
  id INT PRIMARY KEY,
  reason_text VARCHAR(255) NOT NULL,
  description TEXT
);

INSERT INTO user_report_reasons (id, reason_text, description) VALUES
(1, '嫌がらせ・誹謗中傷', '攻撃的発言、いじめ等'),
(2, '不適切なプロフィール', '画像・自己紹介の不適切さ'),
(3, 'スパム・迷惑行為', '宣伝、大量投稿'),
(4, 'なりすまし', '本人詐称'),
(5, '差別・ヘイトスピーチ', '差別的発言'),
(6, 'プライバシーの侵害', '個人情報公開'),
(7, '不正行為', '複数垢、システム不正'),
(99, 'その他', 'その他');

-- 通報添��ファイル
CREATE TABLE report_files (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_id BIGINT NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  original_filename TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**イベント発行:** `moderation.events` → `ContentReportCreated`, `ContentActionTaken`, `UserReportCreated`, `UserActionTaken`

---

## **11. イベント駆動フロー**

### **11.1. 試験作成フロー**

```
[フロントエンド]
  POST /v1/exams { clientRequestId, title, institutionId, facultyId, departmentId, ... }
    ↓
[edumintGateway]
  1. JWT検証
  2. Validation
  3. 冪等性チェック (clientRequestId)
  4. INSERT jobs (status='pending')
  5. Publish: gateway.jobs → 'job.created'
  6. Return 202 Accepted
    ↓
[edumintContent]
  7. Subscribe: 'job.created'
  8. BEGIN TRANSACTION
     INSERT exams, questions, keywords
     COMMIT
  9. Publish: content.lifecycle → 'ExamCreated'
    ↓
[edumintGateway]
  10. Subscribe: 'ExamCreated'
  11. UPDATE jobs SET status='processing'
    ↓
[edumintFile]
  12. FileUploaded → Publish: content.jobs
    ↓
[edumintAiWorker]
  13. OCR, Gemini API
  14. Publish: ai.results → 'AIProcessingCompleted'
    ↓
[edumintContent]
  15. INSERT questions, sub_questions
  16. Publish: content.lifecycle → 'ExamCompleted'
    ↓
[edumintGateway]
  17. UPDATE jobs SET status='completed'
```

---

### **11.2. Kafka トピック一覧**

| トピック | Producer | Consumer | イベント型 |
| :--- | :--- | :--- | :--- |
| `auth.events` | edumintAuth | edumintUserProfile | UserLoggedIn, UserSignedUpViaSSO |
| `gateway.jobs` | edumintGateway | edumintContent, edumintFile | job.created |
| `gateway.job_status` | edumintGateway | クライアント (WebSocket) | job_pending, job_completed, job_failed |
| `content.lifecycle` | edumintContent | edumintGateway, edumintSearch | ExamCreated, ExamCompleted, InstitutionUpdated |
| `content.jobs` | edumintFile | edumintAiWorker | FileUploaded |
| `ai.results` | edumintAiWorker | edumintContent | AIProcessingCompleted |
| `content.feedback` | edumintSocial | edumintContent, edumintSearch | ExamLiked, ExamCommented, ExamViewed |
| `search.indexed` | edumintSearch | - | SearchIndexUpdated |
| `user.events` | edumintUserProfile | edumintNotify | UserCreated, UserFollowed |
| `monetization.transactions` | edumintMonetizeWallet | edumintRevenue | CoinAwarded, CoinSpent |
| `moderation.events` | edumintModeration | edumintNotify | ContentReportCreated, UserActionTaken |
| `search.term_generation` | edumintSearch | edumintAiWorker | TermGenerationJobCreated |

---

## **11.3. マイグレーション計画**

ENUM型の導入とUNESCO ISCED-F 2013への移行は、以下の3フェーズで実施します。

### **Phase 1: ENUM型定義とメタデータ投入**

**目的:** 新しいENUM型を定義し、academic_field_metadataテーブルを作成

```sql
-- 1. 全ENUM型の作成（セクション1参照）
CREATE TYPE question_type_enum AS ENUM (...);
CREATE TYPE difficulty_level_enum AS ENUM (...);
-- ... 他14個のENUM型

-- 2. academic_field_metadataテーブル作成
CREATE TABLE academic_field_metadata (...);

-- 3. UNESCO ISCED-F 2013データ投入（11件）
INSERT INTO academic_field_metadata VALUES (...);
```

**実施タイミング:** メンテナンスウィンドウ（ダウンタイム不要）

**ロールバック:** DROP TYPE/TABLE文で元に戻す

### **Phase 2: データ移行**

**目的:** 既存データをINT/VARCHARからENUM値に変換

```sql
-- 1. 新カラム追加（ENUM型）
ALTER TABLE exams ADD COLUMN exam_type_new exam_type_enum;
ALTER TABLE exams ADD COLUMN semester_new semester_enum;
ALTER TABLE exams ADD COLUMN academic_track_new academic_track_enum;
ALTER TABLE exams ADD COLUMN status_new exam_status_enum;
ALTER TABLE exams ADD COLUMN academic_field_new academic_field_enum;

-- 2. データ変換マッピング
UPDATE exams SET exam_type_new = 
  CASE exam_type
    WHEN 0 THEN 'regular'::exam_type_enum
    WHEN 1 THEN 'class'::exam_type_enum
    WHEN 2 THEN 'quiz'::exam_type_enum
  END;

UPDATE exams SET semester_new = 
  CASE exam_semester
    WHEN 1 THEN 'spring'::semester_enum
    WHEN 2 THEN 'fall'::semester_enum
    WHEN 3 THEN 'summer'::semester_enum
    WHEN 4 THEN 'winter'::semester_enum
    WHEN 5 THEN 'full_year'::semester_enum
  END;

UPDATE exams SET academic_track_new = 
  CASE academic_track
    WHEN 0 THEN 'science'::academic_track_enum
    WHEN 1 THEN 'humanities'::academic_track_enum
  END;

UPDATE exams SET status_new = 
  CASE status
    WHEN 'draft' THEN 'draft'::exam_status_enum
    WHEN 'active' THEN 'active'::exam_status_enum
    WHEN 'archived' THEN 'archived'::exam_status_enum
    ELSE 'deleted'::exam_status_enum
  END;

-- 3. 学問分野の変換（academic_field_id → academic_field）
-- 日本独自27分類 → UNESCO ISCED-F 11大分類へのマッピング
UPDATE exams e SET academic_field_new = 
  CASE af.id
    WHEN 1 THEN 'ict'::academic_field_enum  -- 情報系
    WHEN 2 THEN 'engineering'::academic_field_enum  -- 電気電子系
    WHEN 3 THEN 'engineering'::academic_field_enum  -- 機械系
    WHEN 4 THEN 'natural_sciences'::academic_field_enum  -- 化学系
    WHEN 5 THEN 'natural_sciences'::academic_field_enum  -- 生物・生命科学系
    WHEN 6 THEN 'natural_sciences'::academic_field_enum  -- 物理学系
    WHEN 7 THEN 'natural_sciences'::academic_field_enum  -- 数学系
    WHEN 8 THEN 'engineering'::academic_field_enum  -- 建築・土木系
    WHEN 9 THEN 'engineering'::academic_field_enum  -- 材料工学系
    WHEN 10 THEN 'engineering'::academic_field_enum  -- 航空宇宙系
    WHEN 11 THEN 'business_and_law'::academic_field_enum  -- 経済・経営学系
    WHEN 12 THEN 'business_and_law'::academic_field_enum  -- 法学系
    WHEN 13 THEN 'arts_and_humanities'::academic_field_enum  -- 文学系
    WHEN 14 THEN 'education'::academic_field_enum  -- 教育学系
    WHEN 15 THEN 'social_sciences'::academic_field_enum  -- 心理学系
    WHEN 16 THEN 'social_sciences'::academic_field_enum  -- 社会学系
    WHEN 17 THEN 'arts_and_humanities'::academic_field_enum  -- 語学系
    WHEN 18 THEN 'arts_and_humanities'::academic_field_enum  -- 歴史学系
    WHEN 19 THEN 'arts_and_humanities'::academic_field_enum  -- 哲学系
    WHEN 20 THEN 'arts_and_humanities'::academic_field_enum  -- 芸術・デザイン系
    WHEN 21 THEN 'health_and_welfare'::academic_field_enum  -- 医学系
    WHEN 22 THEN 'health_and_welfare'::academic_field_enum  -- 歯学系
    WHEN 23 THEN 'health_and_welfare'::academic_field_enum  -- 薬学系
    WHEN 24 THEN 'health_and_welfare'::academic_field_enum  -- 看護・保健系
    WHEN 25 THEN 'agriculture'::academic_field_enum  -- 農学系
    WHEN 26 THEN 'natural_sciences'::academic_field_enum  -- 環境科学系
    WHEN 27 THEN 'ict'::academic_field_enum  -- 情報科学（文理融合）
    WHEN 28 THEN 'health_and_welfare'::academic_field_enum  -- スポーツ科学系
    WHEN 29 THEN 'social_sciences'::academic_field_enum  -- 国際関係学系
    WHEN 30 THEN 'generic_programmes'::academic_field_enum  -- その他
  END
FROM academic_fields af
WHERE e.academic_field_id = af.id;

-- 4. 同様の変換を他のテーブルにも適用
-- questions, sub_questions, users, jobs, notifications, など

-- 5. NOT NULL制約の追加（必要な場合）
ALTER TABLE exams ALTER COLUMN exam_type_new SET NOT NULL;
```

**実施タイミング:** メンテナンスウィンドウ（読み取り可能、書き込み一時停止）

**検証:** 変換後のデータ整合性チェック

```sql
-- 変換漏れチェック
SELECT COUNT(*) FROM exams WHERE exam_type_new IS NULL AND exam_type IS NOT NULL;
SELECT COUNT(*) FROM exams WHERE academic_field_new IS NULL AND academic_field_id IS NOT NULL;
```

### **Phase 3: 旧カラム削除とクリーンアップ**

**目的:** 旧INT/VARCHARカラムを削除し、ENUMカラムにリネーム

```sql
-- 1. 外部キー制約の削除
ALTER TABLE exams DROP CONSTRAINT IF EXISTS exams_academic_field_id_fkey;

-- 2. 旧カラムの削除
ALTER TABLE exams DROP COLUMN exam_type;
ALTER TABLE exams DROP COLUMN exam_semester;
ALTER TABLE exams DROP COLUMN academic_track;
ALTER TABLE exams DROP COLUMN status;
ALTER TABLE exams DROP COLUMN academic_field_id;

-- 3. 新カラムのリネーム
ALTER TABLE exams RENAME COLUMN exam_type_new TO exam_type;
ALTER TABLE exams RENAME COLUMN semester_new TO semester;
ALTER TABLE exams RENAME COLUMN academic_track_new TO academic_track;
ALTER TABLE exams RENAME COLUMN status_new TO status;
ALTER TABLE exams RENAME COLUMN academic_field_new TO academic_field;

-- 4. インデックスの再作成
CREATE INDEX idx_exams_type ON exams(exam_type);
CREATE INDEX idx_exams_semester ON exams(semester);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_field ON exams(academic_field);

-- 5. 旧テーブルの削除
DROP TABLE IF EXISTS question_types CASCADE;
DROP TABLE IF EXISTS academic_fields CASCADE;
```

**実施タイミング:** メンテナンスウィンドウ（ダウンタイム30分）

**ロールバック:** Phase 2のバックアップから復元

### **マイグレーション後の確認項目**

1. ✅ 全ENUM型が正しく定義されている
2. ✅ academic_field_metadataに11件のデータが存在する
3. ✅ 全テーブルでENUM型が使用されている
4. ✅ 旧テーブル（academic_fields, question_types）が削除されている
5. ✅ フロントエンドのENUM値マッピングが更新されている
6. ✅ APIレスポンスがENUM文字列を返している
7. ✅ i18nファイルにENUM用の翻訳キーが追加されている

---

## **12. データベース設計ガイドライン**

### **12.1. ENUM型使用のベストプラクティス**

#### **12.1.1. ENUM型を使用すべき場合**

✅ **使用推奨:**
- 値の種類が10個以下で固定的
- 値が頻繁に変更されない（年に1-2回程度）
- 型安全性が重要（例: ステータス、タイプ）
- フロントエンドとのインターフェースが明確
- 多言語対応が必要（i18nキーとマッピング）

❌ **使用非推奨:**
- 値の種類が頻繁に変更される（月次以上）
- ユーザー定義可能な値
- 階層構造を持つ値
- 複雑な関連データを持つ値

#### **12.1.2. ENUM値の追加・変更手順**

**追加の場合:**
```sql
ALTER TYPE exam_type_enum ADD VALUE 'final_exam' AFTER 'quiz';
```

**注意事項:**
- トランザクション内で実行不可
- 値の削除は不可（新ENUM型を作成して移行が必要）
- 追加後はアプリケーション・i18nファイルも更新

**変更の場合（推奨しない）:**
```sql
-- 1. 新ENUM型を作成
CREATE TYPE exam_type_enum_new AS ENUM ('regular', 'class', 'quiz', 'final_exam');

-- 2. カラムを変換
ALTER TABLE exams 
  ALTER COLUMN exam_type TYPE exam_type_enum_new 
  USING exam_type::text::exam_type_enum_new;

-- 3. 旧ENUM型を削除
DROP TYPE exam_type_enum;

-- 4. リネーム
ALTER TYPE exam_type_enum_new RENAME TO exam_type_enum;
```

#### **12.1.3. グローバル展開時の拡張戦略**

**UNESCO ISCED-F Narrow Fields（細分類）への対応:**

現在は11大分類（Broad Fields）を採用していますが、将来的に細分類（Narrow Fields、約80分類）が必要になった場合:

**Option 1: 別カラムで管理（推奨）**
```sql
ALTER TABLE exams ADD COLUMN academic_field_narrow VARCHAR(10);
-- 例: '0611' (Computer use, '061' ICTの下位分類)
```

**Option 2: JSON拡張フィールド**
```sql
ALTER TABLE exams ADD COLUMN academic_field_detail JSONB;
-- { "broad": "ict", "narrow": "0611", "detailed": "061101" }
```

**Option 3: 新ENUM型（非推奨、80個は多すぎる）**

**推奨アプローチ:**
- Broad Fields（11大分類）はENUM型で管理
- Narrow Fields（細分類）は必要に応じてVARCHARまたはJSONBで追加
- academic_field_metadataに細分類メタデータを追加

### **12.2. インデックス戦略**

前述の各テーブル定義に含まれるインデックスを参照。

---

### **12.2. バックアップ・保持期間ポリシー**

| テーブル | 保持期間 | バックアップ頻度 |
| :--- | :--- | :--- |
| `jobs` | 90日 | 日次 |
| `wallet_transactions` | 7年 | 日次 |
| `users`, `exams`, `questions` | 永続 | 日次 |
| `notifications` | 30日 | 日次 |
| `content_reports`, `user_reports` | 2年 | 日次 |

---

### **12.3. キャッシュ戦略**

| データ | キャッシュ層 | TTL | 更新トリガー |
| :--- | :--- | :--- | :--- |
| ユーザープロフィール | Redis | 5分 | user.events |
| 試験メタデータ | Redis | 10分 | content.lifecycle |
| キーワード候補 | Redis | 1時間 | term_generation_candidates 採用時 |
| 大学/学部/���科マスタ | Redis | 1時間 | content.lifecycle (InstitutionUpdated) |

---

### **12.4. popularity_score 更新ロジック**

**更新頻度:** 日次バッチ（毎日午前3時）

```sql
-- institutions
UPDATE institutions
SET popularity_score = (
  SELECT COUNT(*) FROM users WHERE institution_id = institutions.id
) + (
  SELECT COUNT(*) FROM exams WHERE institution_id = institutions.id
) * 2 + (
  SELECT COALESCE(SUM(usage_count), 0) FROM institution_terms 
  WHERE institution_id = institutions.id
) / 10;

-- faculties
UPDATE faculties
SET popularity_score = (
  SELECT COUNT(*) FROM users WHERE faculty_id = faculties.id
) + (
  SELECT COUNT(*) FROM exams WHERE faculty_id = faculties.id
) * 2 + (
  SELECT COALESCE(SUM(usage_count), 0) FROM faculty_terms 
  WHERE faculty_id = faculties.id
) / 10;

-- departments
UPDATE departments
SET popularity_score = (
  SELECT COUNT(*) FROM users WHERE department_id = departments.id
) + (
  SELECT COUNT(*) FROM exams WHERE department_id = departments.id
) * 2 + (
  SELECT COALESCE(SUM(usage_count), 0) FROM department_terms 
  WHERE department_id = departments.id
) / 10;
```

---

### **12.5. 文部科学省データ同期バッチ**

**実行頻度:** 年1回（毎年4月1日）

```python
def sync_mext_data():
    # 1. 文科省サイトから最新データ取得
    latest_data = fetch_mext_institutions_list(year=current_year)
    
    # 2. 差分検出
    diff = detect_diff(current_db=institutions, latest=latest_data)
    
    # 3. 新設機関の追加
    for new_inst in diff.new_institutions:
        institution = create_institution(new_inst)
        publish_event('InstitutionCreated', institution)
    
    # 4. 名称変更の反映
    for updated in diff.name_changes:
        update_institution(updated)
        publish_event('InstitutionUpdated', updated)
    
    # 5. 廃止機関の無効化
    for closed in diff.closed_institutions:
        deactivate_institution(closed.id)
        publish_event('InstitutionDeactivated', closed)
    
    # 6. edumintSearch へイベント通知
    # → *_terms テーブル再生成
    # → Elasticsearch 再インデックス
```

---

## **参考**

- [E_DATA_MODEL.md](E_DATA_MODEL.md): Frontend 表示用データ型
- [F_ARCHITECTURE_OVERALL.md](F_ARCHITECTURE_OVERALL.md): マイクロサービスアーキテクチャ全体

## **2.1. サービス別ログテーブル管理**

各マイクロサービスは、監査証跡・セキュリティ・パフォーマンス分析のために専用のログテーブルを保持します。

### **2.1.1. ログ管理方針**

| ログ種別 | 保存先 | 保持期間 | 用途 |
|---------|--------|---------|------|
| アプリケーションログ | ELK Stack / CloudWatch | 30日 | デバッグ、エラー追跡 |
| アクセスログ | ELK Stack / CloudWatch | 90日 | パフォーマンス分析 |
| 監査ログ | **DB テーブル** | 1-7年 | コンプライアンス、証跡管理 |
| セキュリティログ | **DB テーブル + SIEM** | 1年 | 不正アクセス検知 |
| ビジネスイベントログ | **DB テーブル + Kafka** | 1年 | ドメインイベント追跡 |

---

### **2.1.2. サービス別ログテーブル一覧**

| サービス | ログテーブル | 必要性 | 保持期間 | 用途 |
|---------|------------|-------|---------|------|
| **edumintAuth** | `auth_logs` | ✅ 必須 | 1年 | 認証イベント、ログイン失敗検知 |
| **edumintGateway** | `gateway_logs` | △ 推奨 | 90日 | ジョブライフサイクル追跡 |
| **edumintContent** | `content_audit_logs` | ✅ 必須 | 2年 | コンテンツ変更履歴、監査証跡 |
| **edumintFile** | `file_access_logs` | △ 推奨 | 1年 | ファイルアクセス監査 |
| **edumintAiWorker** | `ai_processing_logs` | △ 推奨 | 90日 | AI処理パフォーマンス、コスト分析 |
| **edumintSearch** | `search_query_logs` | ✅ 必須 | 1年 | 検索クエリ分析、UX改善 |
| **edumintUserProfile** | `user_activity_logs` | △ 推奨 | 1年 | ユーザーアクティビティ追跡 |
| **edumintMonetizeWallet** | `wallet_audit_logs` | ✅ 必須 | 7年 | 金銭取引監査（法的要件） |
| **edumintRevenue** | `revenue_calculation_logs` | △ 推奨 | 7年 | 収益計算プロセス追跡 |
| **edumintModeration** | `moderation_action_logs` | ✅ 必須 | 2年 | モデレーション操作監査 |
| **edumintSocial** | - | ❌ 不要 | - | 既存テーブルで代替可能 |

---

### **2.1.3. 共通ログテーブル設計原則**

**必須カラム:**
```sql
id BIGSERIAL PRIMARY KEY,
event_type VARCHAR(50) NOT NULL,
user_id VARCHAR(255),
ip_address INET,
user_agent TEXT,
metadata JSONB,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**インデックス戦略:**
```sql
CREATE INDEX idx_{table}_user ON {table}(user_id);
CREATE INDEX idx_{table}_event ON {table}(event_type);
CREATE INDEX idx_{table}_created ON {table}(created_at DESC);
```

**パーティショニング:**
- 1年以上保持するログテーブルは月次パーティション推奨
- 例: `auth_logs_2026_02`, `auth_logs_2026_03`

---

### **2.1.4. edumintAuth: `auth_logs` テーブル**

**用途:** 認証イベントの監査証跡、セキュリティ監視

```sql
CREATE TABLE auth_logs (
  id BIGSERIAL PRIMARY KEY,
  
  event_type auth_event_enum NOT NULL,
  
  user_id VARCHAR(255),
  username VARCHAR(255),
  email VARCHAR(255),
  
  auth_method VARCHAR(50),
  -- 'password', 'google_oauth', 'microsoft_oauth', 'github_oauth'
  
  provider VARCHAR(50),
  provider_user_id VARCHAR(255),
  
  client_id VARCHAR(36),
  ip_address INET,
  user_agent TEXT,
  
  is_suspicious BOOLEAN DEFAULT FALSE,
  failure_reason VARCHAR(255),
  
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_logs_user ON auth_logs(user_id);
CREATE INDEX idx_auth_logs_event ON auth_logs(event_type);
CREATE INDEX idx_auth_logs_created ON auth_logs(created_at DESC);
CREATE INDEX idx_auth_logs_suspicious ON auth_logs(is_suspicious) WHERE is_suspicious = TRUE;
CREATE INDEX idx_auth_logs_ip ON auth_logs(ip_address);
```

**イベント発行:** なし（ログのみ）

**保持期間:** 1年

**用途例:**
- ログイン失敗5回以上でアカウントロック
- 異常なIPアドレスからのアクセス検知
- コンプライアンス監査

---

### **2.1.5. edumintContent: `content_audit_logs` テーブル**

**用途:** コンテンツの変更履歴追跡

```sql
CREATE TABLE content_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  
  resource_type VARCHAR(50) NOT NULL,
  -- 'institution', 'faculty', 'department', 'exam', 'question', 'sub_question'
  
  resource_id BIGINT NOT NULL,
  
  action VARCHAR(50) NOT NULL,
  -- 'created', 'updated', 'deleted', 'published', 'unpublished'
  
  user_id VARCHAR(255),
  user_role VARCHAR(50),
  
  changed_fields JSONB,
  -- 例: {"title": {"old": "旧タイトル", "new": "新タイトル"}}
  
  previous_value JSONB,
  new_value JSONB,
  
  ip_address INET,
  user_agent TEXT,
  reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_audit_logs_resource ON content_audit_logs(resource_type, resource_id);
CREATE INDEX idx_content_audit_logs_user ON content_audit_logs(user_id);
CREATE INDEX idx_content_audit_logs_action ON content_audit_logs(action);
CREATE INDEX idx_content_audit_logs_created ON content_audit_logs(created_at DESC);
```

**イベント発行:** なし（ログのみ）

**保持期間:** 2年

**トリガー例:**
```sql
-- exams テーブル更新時に自動的にログ記録
CREATE OR REPLACE FUNCTION log_exam_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO content_audit_logs (resource_type, resource_id, action, changed_fields, previous_value, new_value)
    VALUES ('exam', NEW.id, 'updated', 
            jsonb_build_object('title', jsonb_build_object('old', OLD.title, 'new', NEW.title)),
            row_to_json(OLD)::jsonb,
            row_to_json(NEW)::jsonb);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exam_audit_trigger
AFTER UPDATE ON exams
FOR EACH ROW EXECUTE FUNCTION log_exam_changes();
```

---

### **2.1.6. edumintSearch: `search_query_logs` テーブル**

**用途:** 検索クエリ分析、UX改善

```sql
CREATE TABLE search_query_logs (
  id BIGSERIAL PRIMARY KEY,
  
  query_text TEXT NOT NULL,
  normalized_query TEXT,
  
  filters JSONB,
  -- 例: {"institution_id": 1, "faculty_id": 10, "exam_year": 2023}
  
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  
  result_count INTEGER,
  clicked_result_id BIGINT,
  clicked_result_position INTEGER,
  
  search_time_ms INTEGER,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_query_logs_user ON search_query_logs(user_id);
CREATE INDEX idx_search_query_logs_query ON search_query_logs(query_text);
CREATE INDEX idx_search_query_logs_created ON search_query_logs(created_at DESC);
```

**イベント発行:** なし（ログのみ）

**保持期間:** 1年

**用途例:**
- 人気検索キーワードの抽出
- 検索結果クリック率分析
- ユーザー行動分析

---

### **2.1.7. edumintMonetizeWallet: `wallet_audit_logs` テーブル**

**用途:** 金銭取引の監査証跡（法的要件）

```sql
CREATE TABLE wallet_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  
  transaction_id BIGINT NOT NULL REFERENCES wallet_transactions(id),
  wallet_id BIGINT NOT NULL REFERENCES wallets(id),
  
  action VARCHAR(50) NOT NULL,
  -- 'transaction_created', 'transaction_completed', 'transaction_failed',
  -- 'balance_adjusted', 'transaction_reversed'
  
  previous_balance BIGINT,
  new_balance BIGINT,
  amount BIGINT,
  
  user_id VARCHAR(255),
  operator_id VARCHAR(255),
  
  ip_address INET,
  reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_audit_logs_transaction ON wallet_audit_logs(transaction_id);
CREATE INDEX idx_wallet_audit_logs_wallet ON wallet_audit_logs(wallet_id);
CREATE INDEX idx_wallet_audit_logs_user ON wallet_audit_logs(user_id);
CREATE INDEX idx_wallet_audit_logs_created ON wallet_audit_logs(created_at DESC);
```

**イベント発行:** なし（ログのみ）

**保持期間:** 7年（会計法・税法要件）

**トリガー例:**
```sql
CREATE OR REPLACE FUNCTION log_wallet_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO wallet_audit_logs (wallet_id, action, previous_balance, new_balance, amount)
    VALUES (NEW.id, 'balance_adjusted', OLD.balance, NEW.balance, NEW.balance - OLD.balance);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wallet_audit_trigger
AFTER UPDATE ON wallets
FOR EACH ROW EXECUTE FUNCTION log_wallet_changes();
```

---

### **2.1.8. edumintModeration: `moderation_action_logs` テーブル**

**用途:** モデレーション操作の監��証跡

```sql
CREATE TABLE moderation_action_logs (
  id BIGSERIAL PRIMARY KEY,
  
  report_id BIGINT,
  report_type VARCHAR(50),
  
  action VARCHAR(50) NOT NULL,
  -- 'report_created', 'report_assigned', 'report_resolved', 'report_ignored',
  -- 'content_hidden', 'content_deleted', 'user_warned', 'user_suspended', 'user_banned'
  
  moderator_id VARCHAR(255) NOT NULL,
  moderator_role VARCHAR(50),
  
  target_type VARCHAR(50),
  target_id BIGINT,
  
  reason TEXT,
  notes TEXT,
  
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_moderation_action_logs_report ON moderation_action_logs(report_id);
CREATE INDEX idx_moderation_action_logs_moderator ON moderation_action_logs(moderator_id);
CREATE INDEX idx_moderation_action_logs_action ON moderation_action_logs(action);
CREATE INDEX idx_moderation_action_logs_created ON moderation_action_logs(created_at DESC);
```

**イベント発行:** なし（ログのみ）

**保持期間:** 2年

---

### **2.1.9. ログローテーションとアーカイブ戦略**

**自動削除バッチ:**
```sql
-- 1年前のログを削除（auth_logs の例）
DELETE FROM auth_logs WHERE created_at < NOW() - INTERVAL '1 year';
```

**アーカイブ（長期保存が必要な場合）:**
```sql
-- S3 へエクスポート
COPY (SELECT * FROM wallet_audit_logs WHERE created_at < NOW() - INTERVAL '2 years')
TO 's3://edumint-archive/wallet_audit_logs_2024.csv'
WITH (FORMAT csv, HEADER true);

-- アーカイブ後に削除
DELETE FROM wallet_audit_logs WHERE created_at < NOW() - INTERVAL '2 years';
```

---

### **2.1.10. ログ分析ダッシュボード**

**Kibana（ELK Stack）との連携:**
- アプリケーションログ: Fluentd → Elasticsearch → Kibana
- DB ログテーブル: Logstash → Elasticsearch → Kibana

**Grafana との連携:**
- パフォーマンスログ: Prometheus → Grafana
- DB メトリクス: PostgreSQL Exporter → Prometheus → Grafana

---
## **参考文献**

### **UNESCO ISCED-F 2013**
- [UNESCO ISCED Fields of Education and Training 2013 (ISCED-F 2013)](https://uis.unesco.org/sites/default/files/documents/isced-fields-of-education-and-training-2013-en.pdf)
- [UNESCO Institute for Statistics - ISCED](https://uis.unesco.org/en/topic/international-standard-classification-education-isced)

### **OECD 標準**
- [OECD Frascati Manual 2015](https://www.oecd.org/en/publications/frascati-manual-2015_9789264239012-en.html)
- OECD Education at a Glance

### **PostgreSQL ENUM型**
- [PostgreSQL Documentation - Enumerated Types](https://www.postgresql.org/docs/current/datatype-enum.html)
- [PostgreSQL Documentation - ALTER TYPE](https://www.postgresql.org/docs/current/sql-altertype.html)

### **データベース設計ベストプラクティス**
- [Database Design Best Practices (Microsoft)](https://docs.microsoft.com/en-us/azure/architecture/best-practices/data-partitioning)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

## **設計判断の記録**

### **日本独自分類を廃止した理由**

**問題点:**
1. **グローバル展開の障壁**: 日本国内でしか通用しない分類体系
2. **標準化の欠如**: 文部科学省の分類は公式APIがなく、維持コストが高い
3. **細分化の問題**: 27分類は細かすぎて、ユーザーが選択しづらい
4. **国際比較の困難**: 海外の教育データとの互換性がない

**UNESCO ISCED-F 2013採用の根拠:**
1. **国際標準**: 世界200カ国以上で採用されている
2. **11大分類の適切性**: 多すぎず少なすぎず、ユーザーにとって選択しやすい
3. **拡張性**: Narrow Fields（細分類、約80分類）への拡張が可能
4. **データ互換性**: OECD、Eurostat、各国政府機関との連携が容易
5. **持続可能性**: UNESCO/OECDが継続的にメンテナンス

### **ENUM型を積極採用した理由**

**型安全性の向上:**
- アプリケーション層でのバリデーション不要
- データベースレベルで不正な値を防止
- ORMとの親和性が高い（TypeScript、Go、Rust等）

**パフォーマンスの向上:**
- ENUM型は内部的に整数として格納されるため、VARCHAR比で高速
- インデックスのサイズが小さい
- JOIN時のパフォーマンス向上

**可読性の向上:**
- コード上でENUM文字列を使用できる（'active' vs 1）
- SQLクエリが読みやすくなる
- フロントエンドとのインターフェースが明確

**保守性の向上:**
- 値の追加がDDL文で管理される（Git履歴に残る）
- データベースマイグレーションで一元管理
- ドキュメント化が容易

**デメリットと対策:**
- ❌ 値の削除が困難 → 代わりに論理削除フラグを使用
- ❌ 値の順序変更が困難 → sort_orderカラムで管理
- ❌ 複雑な階層構造には不向き → 別テーブルで管理

### **数値ID管理を廃止した判断**

**旧設計の問題:**
```sql
-- 旧設計: INT型でマッピング
exam_type INT -- 0: regular, 1: class, 2: quiz
```

**問題点:**
1. マジックナンバーが散在
2. フロントエンドで変換ロジックが必要
3. ドキュメントとコードが乖離しやすい
4. i18n対応時に2段階の変換が必要（INT→文字列→翻訳）

**新設計:**
```sql
-- 新設計: ENUM型で直接管理
exam_type exam_type_enum -- 'regular', 'class', 'quiz'
```

**メリット:**
1. フロントエンドがそのままENUM文字列を使用できる
2. APIレスポンスが自己文書化される
3. i18nキーと直接マッピング可能（`enum.exam_type.regular`）
4. 型安全性が向上

---

## **変更履歴**

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-02-04 | 2.0.0 | ENUM型全面採用、UNESCO ISCED-F 2013準拠、academic_fields廃止 |
| 2025-12-22 | 1.0.0 | 初版作成 |

---

**以上、EduMint統合データモデル設計書（ENUM型・グローバル対応版）**
