# **EduMint 統合データモデル設計書（マイクロサービスDB管理責務付き）**

本ドキュメントは、EduMintのマイクロサービスアーキテクチャに基づいた、統合されたデータモデル設計です。各テーブルの所有サービス、責務、ライフサイクルを明確にし、イベント駆動による整合性を保証する設計となっています。

---

## **目次**

1. [アーキテクチャ前提](#1-アーキテクチャ前提)
2. [サービス別DB所有関係](#2-サービス別db所有関係)
3. [マスタデータ管理（大学・学部・科目・教授）](#3-マスタデータ管理大学学部科目教授)
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

### デプロイ段階

*   **Phase 1 (MVP)**: edumintGateway, edumintAuth, edumintUserProfile, edumintFile, edumintContent, edumintAiWorker, edumintSearch
*   **Phase 2 (製品版)**: + edumintMonetizeWallet, edumintRevenue, edumintSocial, edumintModeration
*   **Phase 3 (拡張版)**: + 多言語・推薦等

---

## **2. サービス別DB所有関係**

| サービス | 役割 | 所有テーブル | イベント発行 | Kafka購読 |
| :--- | :--- | :--- | :--- | :--- |
| **edumintGateway** | ジョブオーケストレーション | `jobs` | `gateway.jobs` | `content.lifecycle`, `ai.results`, `gateway.job_status` |
| **edumintAuth** | SSO・認証 | `oauth_clients`, `oauth_tokens`, `idp_links` | `auth.events` | - |
| **edumintUserProfile** | ユーザー管理・フォロー・通知 | `users`, `user_profiles`, `user_follows`, `user_blocks`, `notifications` | `user.events` | `auth.events` |
| **edumintFile** | ファイル管理 | `file_inputs`, `file_upload_jobs` | `content.jobs` (FileUploaded) | `gateway.jobs` |
| **edumintContent** | 試験・問題データ (Source of Truth) | `universities`, `faculties`, `departments`, `teachers`, `subjects`, `academic_fields`, `exams`, `questions`, `sub_questions`, `question_types`, `sub_question_selection`, `sub_question_matching`, `sub_question_ordering`, `keywords`, `question_keywords`, `sub_question_keywords` | `content.lifecycle` | `gateway.jobs`, `ai.results` |
| **edumintSearch** | 検索・インデックス | `*_terms` (subject, university, faculty, teacher), `term_generation_jobs`, `term_generation_candidates`, Elasticsearch索引、Qdrant索引 | `search.indexed` | `content.lifecycle`, `content.feedback` |
| **edumintAiWorker** | AI処理（ステートレス） | （通常DBなし）*キャッシュ・ジョブログのみ | `ai.results` | `gateway.jobs`, `content.jobs` (file processing), `term_generation.jobs` |
| **edumintSocial** | SNS機能（コメント・いいね） | `exam_likes`, `exam_bads`, `exam_comments`, `exam_views` | `content.feedback` | - |
| **edumintMonetizeWallet** | MintCoin管理 | `wallets`, `wallet_transactions` | `monetization.transactions` | - |
| **edumintRevenue** | 収益分配 | `revenue_reports`, `ad_impressions_agg` | `revenue.reports` | `monetization.transactions` |
| **edumintModeration** | 通報管理 | `content_reports`, `content_report_reasons`, `user_reports`, `user_report_reasons`, `report_files` | `moderation.events` | - |
| **edumintAdmin** | 管理UI統合 | （他サービスのAPIを集約） | - | - |

**重要**: 太線は「マイクロサービス間のデータ依存性を示す」ものであり、実装時は API 呼び出しまたは Kafka イベント購読によって実現すること。直接 SQL クエリで他のサービスのDB にアクセスすることは禁止。

---

## **3. マスタデータ管理（大学・学部・科目・教授）**

### 管理サービス: **edumintContent**

マスタデータは「最初から正しい候補が限定的」な特性を持つため、**edumintContent** で一元管理します。  
**edumintSearch** は Kafka イベントを購読して、検索用語(`*_terms`)の索引を更新します。

### 3.1. `universities` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | 大学ID（Auto Increment） |
| `org_id` | VARCHAR(20) | UNIQUE | 大学ポートレートの組織ID（API連携用） |
| `name` | VARCHAR(255) | NOT NULL, UNIQUE | 大学名 |
| `country` | VARCHAR(100) | DEFAULT 'JP' | 国名 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**イベント**: `content.lifecycle` → `UniversityCreated`, `UniversityUpdated`

### 3.2. `faculties` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | 学部ID |
| `university_id` | INTEGER | NOT NULL, FOREIGN KEY → `universities(id)` | 所属大学ID（ON DELETE CASCADE） |
| `name` | VARCHAR(255) | NOT NULL | 学部名 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**イベント**: `content.lifecycle` → `FacultyCreated`, `FacultyUpdated`

### 3.3. `departments` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | 学科ID |
| `faculty_id` | INTEGER | NOT NULL, FOREIGN KEY → `faculties(id)` | 所属学部ID（ON DELETE CASCADE） |
| `name` | VARCHAR(255) | NOT NULL | 学科名 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**イベント**: `content.lifecycle` → `DepartmentCreated`, `DepartmentUpdated`

### 3.4. `teachers` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 教授ID |
| `name` | VARCHAR(255) | NOT NULL | 教授名 |
| `university_id` | INT | NOT NULL, FOREIGN KEY → `universities(id)` | 所属大学ID |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**イベント**: `content.lifecycle` → `TeacherCreated`, `TeacherUpdated`

### 3.5. `academic_fields` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 学問分野ID |
| `field_name` | VARCHAR(100) | NOT NULL, UNIQUE | 分野名（例: 情報系、電気電子系、人文系） |
| `field_type` | VARCHAR(50) | NOT NULL | 分類（`science`/`humanities`） |
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

**イベント**: `content.lifecycle` → `AcademicFieldCreated`

### 3.6. `subjects` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 科目ID |
| `name` | VARCHAR(255) | NOT NULL, UNIQUE | 科目名 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**イベント**: `content.lifecycle` → `SubjectCreated`, `SubjectUpdated`

### 3.7. クライアント参照ルール（重要）

フロントエンドで参照・選択されるマスタデータに関する候補数による取り扱いを以下のように定めます：

- **候補が15件以下**: バックエンドで小規模ルックアップ API（`GET /lookups/{entity}`）で全件取得し、フロントエンドがローカルでマッピング（id ↔ name）を保持します。TTL キャッシュ推奨（TTL: 1時間）。
  
- **候補が15〜50件**: フロントエンドはサーバサイド検索API（`GET /search/{entity}?q=...`）を用いたオートコンプリートUIを採用。デバウンス設定推奨（200-300ms）。

- **候補が50件超**: オートコンプリートを必須とし、クライアント側は全件事前ロード禁止。実装例: minChars=2, limit=10 の制限を設ける。

各エンティティ（university, faculty, subject 等）は、次セクション（4.4 以降）で説明する `*_terms` テーブルで検索用語を正規化・保持し、曖昧検索をサポートします。

---

## **4. ユーザー・認証管理**

### 4.1. サービス責務分離

| サービス | 責務 | テーブル |
| :--- | :--- | :--- |
| **edumintAuth** | SSO/OAuth2トークン管理、外部IdP連携 | `oauth_clients`, `oauth_tokens`, `idp_links` |
| **edumintUserProfile** | ユーザープロフィール、ソーシャルグラフ | `users`, `user_profiles`, `user_follows`, `user_blocks`, `notifications` |

### 4.2. edumintAuth 管理テーブル

#### 4.2.1. `oauth_clients` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PRIMARY KEY | OAuth クライアント ID |
| `client_secret_hash` | VARCHAR(255) | NOT NULL | クライアントシークレットのハッシュ |
| `redirect_uris` | TEXT | NOT NULL | リダイレクトURI（JSON配列） |
| `grant_types` | TEXT | NOT NULL | グラントタイプ（authorization_code等） |
| `response_types` | TEXT | NOT NULL | レスポンスタイプ |
| `scopes` | TEXT | NOT NULL | 要求スコープ |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |

#### 4.2.2. `oauth_tokens` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PRIMARY KEY | トークンID |
| `user_id` | VARCHAR(255) | NOT NULL | ユーザーID（edumintUserProfile → users.id） |
| `client_id` | VARCHAR(36) | NOT NULL | クライアント ID |
| `access_token` | VARCHAR(500) | NOT NULL, UNIQUE | アクセストークン |
| `refresh_token` | VARCHAR(500) | UNIQUE | リフレッシュトークン |
| `expires_at` | TIMESTAMP | NOT NULL | 有効期限 |
| `scope` | TEXT | | 付与されたスコープ |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 発行日時 |

#### 4.2.3. `idp_links` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `user_id` | VARCHAR(255) | NOT NULL | ユーザーID |
| `provider` | VARCHAR(50) | NOT NULL | プロバイダー名（google, microsoft等） |
| `provider_user_id` | VARCHAR(255) | NOT NULL | プロバイダー側のユーザーID |
| `email_verified` | BOOLEAN | DEFAULT FALSE | メール認証済み |
| `last_login_at` | TIMESTAMP | NULL | 最終ログイン日時 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| UNIQUE | | (`provider`, `provider_user_id`) | 重複防止 |

**イベント**: `auth.events` → `UserSignedUpViaSSO`, `UserLoggedIn`

### 4.3. edumintUserProfile 管理テーブル

#### 4.3.1. `users` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(255) | PRIMARY KEY, UNIQUE | ユーザーID (UUID) |
| `username` | VARCHAR(255) | NOT NULL, UNIQUE | ログイン用ユーザー名 |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | メールアドレス |
| `is_email_verified` | BOOLEAN | DEFAULT FALSE | メール認証済みフラグ |
| `university_id` | INTEGER | FOREIGN KEY → `universities(id)` | 大学ID（edumintContent） |
| `faculty_id` | INTEGER | FOREIGN KEY → `faculties(id)` | 学部ID（edumintContent） |
| `major_type` | INTEGER | NOT NULL | 文理区分（0:理系, 1:文系） |
| `role` | VARCHAR(50) | DEFAULT 'user' | 権限（user, admin） |
| `status` | VARCHAR(50) | DEFAULT 'active' | 状態（active, banned, deleted） |
| `deleted_at` | TIMESTAMP | NULL | 論理削除日時 |
| `display_name` | VARCHAR(255) | NULL | 表示名 |
| `bio` | TEXT | NULL | 自己紹介 |
| `avatar_url` | VARCHAR(500) | NULL | アバター画像URL |
| `language` | VARCHAR(10) | DEFAULT 'ja' | 使用言語 |
| `country` | VARCHAR(100) | NULL | 国コード |
| `timezone` | VARCHAR(50) | DEFAULT 'Asia/Tokyo' | タイムゾーン |
| `subscription_plan` | VARCHAR(50) | NULL | サブスク プラン名 |
| `subscription_start_at` | TIMESTAMP | NULL | サブスク開始日時 |
| `subscription_end_at` | TIMESTAMP | NULL | サブスク終了日時 |
| `last_login_at` | TIMESTAMP | NULL | 最終ログイン日時 |
| `mintcoin_balance` | INTEGER | DEFAULT 0 | MintCoin残高（キャッシュ、真実はedumintMonetizeWallet） |
| `follower_count` | INTEGER | DEFAULT 0 | フォロワー数（キャッシュ） |
| `blocked_count` | INTEGER | DEFAULT 0 | 被ブロック数（キャッシュ） |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**イベント**: `user.events` → `UserCreated`, `UserUpdated`, `UserDeleted`

**購読**: `auth.events` → `UserSignedUpViaSSO` を受信して `users` に自動作成

#### 4.3.2. `user_profiles` テーブル（拡張フィールド用）

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `user_id` | VARCHAR(255) | UNIQUE, FOREIGN KEY → `users(id)` | ユーザーID |
| `department_id` | INTEGER | FOREIGN KEY → `departments(id)` | 学科ID（edumintContent） |
| `academic_field_id` | INTEGER | FOREIGN KEY → `academic_fields(id)` | 学問分野ID（edumintContent） |
| `bio_extended` | TEXT | NULL | 詳細な自己紹介 |
| `social_media_links` | JSONB | NULL | SNSリンク（Twitter等） |
| `preferences` | JSONB | NULL | ユーザー設定（通知設定等） |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

#### 4.3.3. `user_follows` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `follower_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → `users(id)` | フォローする側 |
| `followed_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → `users(id)` | フォローされる側 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | フォロー日時 |
| UNIQUE | | (`follower_id`, `followed_id`) | 重複防止 |

**イベント**: `user.events` → `UserFollowed`

#### 4.3.4. `user_blocks` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `blocker_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → `users(id)` | ブロック側 |
| `blocked_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → `users(id)` | ブロック側 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | ブロック日時 |
| UNIQUE | | (`blocker_id`, `blocked_id`) | 重複防止 |

**イベント**: `user.events` → `UserBlocked`

#### 4.3.5. `notifications` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 通知ID |
| `user_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → `users(id)` | 受信ユーザーID |
| `type` | VARCHAR(50) | NOT NULL | 通知種別（like, comment, system等） |
| `title` | VARCHAR(255) | NOT NULL | 通知タイトル |
| `content` | TEXT | NOT NULL | 通知内容テキスト |
| `link_url` | TEXT | NULL | 遷移先URL |
| `link_exam_id` | BIGINT | NULL | 関連試験ID（参考） |
| `is_read` | BOOLEAN | DEFAULT FALSE | 既読フラグ |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |

**購読**: 各イベント（like, comment等）から自動生成

---

## **5. ファイル・ジョブ管理**

### 管理サービス

| テーブル | サービス | 責務 |
| :--- | :--- | :--- |
| `jobs` | **edumintGateway** | 全てのジョブのライフサイクル管理（オーケストレーション） |
| `file_inputs`, `file_upload_jobs` | **edumintFile** | ファイルアップロード、S3連携 |

### 5.1. edumintGateway: `jobs` テーブル

**全てのジョブタイプの統一管理テーブル。ジョブの状態遷移は Kafka イベントに基づいて edumintGateway が更新。**

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PRIMARY KEY | ジョブID (UUID) |
| `client_request_id` | VARCHAR(36) | UNIQUE | クライアント側で生成した冪等性キー（UUID v4） |
| `type` | VARCHAR(50) | NOT NULL | ジョブ種別（exam_creation, file_processing, index_rebuild等） |
| `status` | VARCHAR(50) | NOT NULL | ステータス（pending, processing, completed, failed） |
| `user_id` | VARCHAR(255) | NOT NULL | 作成ユーザー ID |
| `payload` | JSONB | NOT NULL | リクエストペイロード（例: {examName, universityId, ...}） |
| `resource_type` | VARCHAR(50) | NULL | 作成されたリソース種別（exam, file, index等） |
| `resource_id` | VARCHAR(255) | NULL | 作成されたリソースID（例: exam_id） |
| `error_code` | VARCHAR(50) | NULL | エラーコード |
| `error_message` | TEXT | NULL | エラーメッセージ |
| `retry_count` | INT | DEFAULT 0 | 再試行回数 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | ジョブ作成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | ジョブ更新日時 |
| `completed_at` | TIMESTAMP | NULL | ジョブ完了日時 |

**イベント発行**: `gateway.jobs` → `job.created`, `job.processing`, `job.completed`, `job.failed`

**ステータス遷移**

```
pending → processing → completed ✓
         ↓
        failed (with retry logic)
```

### 5.2. edumintFile: `file_inputs` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ファイルID |
| `exam_id` | BIGINT | NOT NULL, FOREIGN KEY → exams (edumintContent) | 紐づく試験ID |
| `user_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → users (edumintUserProfile) | アップロード者ID |
| `file_path` | TEXT | NOT NULL | S3パス（s3://bucket/path/file.pdf等） |
| `original_filename` | TEXT | NOT NULL | 元ファイル名 |
| `file_type` | VARCHAR(10) | NOT NULL | 拡張子/タイプ（pdf, txt等） |
| `file_size_bytes` | BIGINT | NULL | ファイルサイズ |
| `source_type` | VARCHAR(50) | NOT NULL | 生成元タイプ（lecture-notes, past-exam等） |
| `analysis_status` | VARCHAR(50) | DEFAULT 'pending' | 分析ステータス（pending, processing, completed, failed） |
| `analysis_error` | TEXT | NULL | 分析失敗理由 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | アップロード日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**イベント発行**: `content.jobs` → `FileUploaded` (edumintContent 向け)

**購読**: `gateway.jobs` → ジョブ ID で file_processing 開始トリガー

### 5.3. edumintFile: `file_upload_jobs` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PRIMARY KEY | upload job ID |
| `gateway_job_id` | VARCHAR(36) | UNIQUE, FOREIGN KEY → jobs | 対応する gateway ジョブ |
| `file_input_id` | BIGINT | FOREIGN KEY → `file_inputs` | ファイル ID |
| `status` | VARCHAR(50) | DEFAULT 'pending' | upload ステータス |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

---

## **6. 試験・問題データ管理**

### 管理サービス: **edumintContent**

### 構造図（試験 → 大問 → 小問）

```
[exams] 試験メタデータ
  - title / school / subject_id / teacher_id / exam_year
  - ソーシャル: good_count / bad_count / comment_count / view_count
  └─<1:N> [questions] 大問
        - question_number / level / content
        └─<1:N> [sub_questions] 小問
              - sub_number / question_type_id / content / answer_explanation
              └─<N:1> [question_types] 問題形式マスタ
                    (1:単一選択, 2:複数選択, ..., 12:コード記述等)

[keywords] ←→ [question_keywords] (大問キーワード)
           ←→ [sub_question_keywords] (小問キーワード)

補助テーブル:
  [sub_question_selection] (ID 1-3用: 選択肢)
  [sub_question_matching] (ID 4用: マッチング)
  [sub_question_ordering] (ID 5用: 順序付け)
```

### 6.1. `exams` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 試験ID |
| `title` | VARCHAR(255) | NOT NULL | 試験名称・タイトル |
| `exam_type` | INT | DEFAULT 0 | 試験形式（0: 定期試験, 1: 授業内試験, 2: 小テスト） |
| `university_id` | INT | NOT NULL, FOREIGN KEY → `universities(id)` | 大学ID |
| `faculty_id` | INT | NULL, FOREIGN KEY → `faculties(id)` | 学部ID |
| `teacher_id` | BIGINT | NULL, FOREIGN KEY → `teachers(id)` | 教授ID |
| `subject_id` | BIGINT | NULL, FOREIGN KEY → `subjects(id)` | 科目ID |
| `exam_year` | INT | NOT NULL | 試験年度 |
| `academic_field_id` | BIGINT | NULL, FOREIGN KEY → `academic_fields(id)` | 学問分野ID |
| `academic_track` | INT | DEFAULT 0 | 学位系統（0: 理系, 1: 文系） |
| `duration_minutes` | INT | NULL | 所要時間（分） |
| `user_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → users (edumintUserProfile) | 作成者ID |
| `is_public` | BOOLEAN | DEFAULT TRUE | 公開フラグ |
| `status` | VARCHAR(20) | DEFAULT 'active' | コンテンツ状態（active, deleted） |
| `comment_count` | INT | DEFAULT 0 | コメント数（キャッシュ、真実はedumintSocial） |
| `good_count` | INT | DEFAULT 0 | 高評価数（キャッシュ） |
| `bad_count` | INT | DEFAULT 0 | 低評価数（キャッシュ） |
| `view_count` | INT | DEFAULT 0 | 閲覧数（キャッシュ） |
| `ad_count` | INT | DEFAULT 0 | 広告表示完了回数 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**イベント発行**: `content.lifecycle` → `ExamCreated`, `ExamUpdated`, `ExamDeleted`, `ExamCompleted`

**購読**:
- `gateway.jobs` (type=exam_creation) → exams 作成トリガー
- `ai.results` (processing_completed) → 問題データ反映

### 6.2. `questions` テーブル（大問）

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 大問ID |
| `exam_id` | BIGINT | NOT NULL, FOREIGN KEY → `exams(id)` | 所属試験ID |
| `question_number` | INT | NOT NULL | 大問番号 |
| `level` | INT | DEFAULT 0 | 難易度（AI推定等） |
| `content` | TEXT | NOT NULL | 問題文（Markdown/LaTeX対応） |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**イベント発行**: `content.lifecycle` → `QuestionCreated`

### 6.3. `sub_questions` テーブル（小問）

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 小問ID |
| `question_id` | BIGINT | NOT NULL, FOREIGN KEY → `questions(id)` | 所属大問ID |
| `sub_number` | INT | NOT NULL | 小問番号 |
| `question_type_id` | INT | NOT NULL, FOREIGN KEY → `question_types(id)` | 問題タイプID |
| `content` | TEXT | NOT NULL | 問題文（Markdown/LaTeX対応） |
| `answer_explanation` | TEXT | NOT NULL | 模範解答および解説 |
| `execution_options` | JSONB | NULL | 実行環境設定（ID 12用: 言語/制限時間等） |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**注意**: `question_format`, `answer_format` 廃止。レンダリングは `$`/`$$` による自動検出。

**イベント発行**: `content.lifecycle` → `SubQuestionCreated`

### 6.4. `question_types` テーブル

| ID | type_name | description | 補助テーブル |
| :--- | :--- | :--- | :--- |
| 1 | 単一選択 | ラジオボタン | `sub_question_selection` |
| 2 | 複数選択 | チェックボックス | `sub_question_selection` |
| 3 | 正誤判定 | True/False | `sub_question_selection` |
| 4 | 組み合わせ | ペアリング | `sub_question_matching` |
| 5 | 順序並べ替え | 順序付け | `sub_question_ordering` |
| 10 | 記述式 | 自由記述 | なし |
| 11 | 証明問題 | 論理証明 | なし |
| 12 | コード記述 | プログラミング | なし (execution_options を使用) |
| 13 | 翻訳 | 言語翻訳 | なし |
| 14 | 数値計算 | 計算問題 | なし |

### 6.5. `sub_question_selection` テーブル（ID 1-3 用）

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `sub_question_id` | BIGINT | NOT NULL, FOREIGN KEY → `sub_questions(id)` | 対象小問 |
| `content` | TEXT | NOT NULL | 選択肢文言（Markdown/LaTeX対応） |
| `is_correct` | BOOLEAN | DEFAULT FALSE | 正解フラグ |
| `sort_order` | INT | DEFAULT 0 | 表示順 |

### 6.6. `sub_question_matching` テーブル（ID 4 用）

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `sub_question_id` | BIGINT | NOT NULL, FOREIGN KEY → `sub_questions(id)` | 対象小問 |
| `left_content` | TEXT | NOT NULL | 左側項目（問題側） |
| `right_content` | TEXT | NOT NULL | 右側項目（解答側） |
| `sort_order` | INT | DEFAULT 0 | 表示順 |

### 6.7. `sub_question_ordering` テーブル（ID 5 用）

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `sub_question_id` | BIGINT | NOT NULL, FOREIGN KEY → `sub_questions(id)` | 対象小問 |
| `content` | TEXT | NOT NULL | 要素文言 |
| `correct_order` | INT | NOT NULL | 正解となる順序（1, 2, 3...） |

### 6.8. `keywords` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | キーワードID |
| `keyword` | VARCHAR(100) | NOT NULL, UNIQUE | キーワード文字列 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

### 6.9. `question_keywords` テーブル（大問キーワード）

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `question_id` | BIGINT | NOT NULL, FOREIGN KEY → `questions(id)` | 大問ID |
| `keyword_id` | BIGINT | NOT NULL, FOREIGN KEY → `keywords(id)` | キーワードID |
| `relevance_score` | FLOAT | NULL | 関連度（0-1） |
| UNIQUE | | (`question_id`, `keyword_id`) | 重複防止 |

### 6.10. `sub_question_keywords` テーブル（小問キーワード）

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `sub_question_id` | BIGINT | NOT NULL, FOREIGN KEY → `sub_questions(id)` | 小問ID |
| `keyword_id` | BIGINT | NOT NULL, FOREIGN KEY → `keywords(id)` | キーワードID |
| `relevance_score` | FLOAT | NULL | 関連度（0-1） |
| UNIQUE | | (`sub_question_id`, `keyword_id`) | 重複防止 |

---

## **7. 検索・キーワード・オートコンプリート**

### 管理サービス: **edumintSearch**

### 7.1. 検索用語テーブル（`*_terms` 系）

表記ゆれに対応し、候補提示の優先順位付けをサポートします。各エンティティの正規化された検索用語を管理。

#### 7.1.1. `university_terms` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `university_id` | INT | NOT NULL, FOREIGN KEY → universities (edumintContent) | 対応する大学ID |
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
| UNIQUE | | (`university_id`, `normalized_term`) | 重複防止 |

**イベント購読**: `content.lifecycle` → `UniversityCreated`, `UniversityUpdated` 受信して自動更新

#### 7.1.2. `faculty_terms` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `faculty_id` | INT | NOT NULL, FOREIGN KEY → faculties (edumintContent) | 対応する学部ID |
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
| UNIQUE | | (`faculty_id`, `normalized_term`) | 重複防止 |

#### 7.1.3. `subject_terms` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `subject_id` | BIGINT | NOT NULL, FOREIGN KEY → subjects (edumintContent) | 対応する科目ID |
| `term` | VARCHAR(255) | NOT NULL | 表示用科目名 |
| `hiragana` | VARCHAR(255) | NULL | ひらがな表記 |
| `katakana` | VARCHAR(255) | NULL | カタカナ表記 |
| `romaji` | VARCHAR(255) | NULL | ローマ字表記 |
| `english_name` | VARCHAR(255) | NULL | 英語表記 |
| `phonetic_key` | VARCHAR(255) | NULL | 読み違い吸収用キー |
| `normalized_term` | VARCHAR(255) | NOT NULL | 検索用正規化文字列 |
| `language` | VARCHAR(10) | DEFAULT 'ja' | 言語コード |
| `variant_type` | VARCHAR(50) | DEFAULT 'alias' | official/alias/abbreviation/typo 等 |
| `confidence_score` | DECIMAL(3,2) | DEFAULT 0.80 | 候補優先度 |
| `usage_count` | INT | DEFAULT 0 | サジェスト利用回数 |
| `is_primary` | BOOLEAN | DEFAULT FALSE | 代表表記かどうか |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |
| UNIQUE | | (`subject_id`, `normalized_term`) | 重複防止 |

#### 7.1.4. `teacher_terms` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `teacher_id` | BIGINT | NOT NULL, FOREIGN KEY → teachers (edumintContent) | 対応する教授ID |
| `term` | VARCHAR(255) | NOT NULL | 表示用名称 |
| `hiragana` | VARCHAR(255) | NULL | ひらがな表記 |
| `katakana` | VARCHAR(255) | NULL | カタカナ表記 |
| `romaji` | VARCHAR(255) | NULL | ローマ字表記 |
| `english_name` | VARCHAR(255) | NULL | 英語表記 |
| `phonetic_key` | VARCHAR(255) | NULL | 読み違い吸収用キー |
| `normalized_term` | VARCHAR(255) | NOT NULL | 検索用正規化文字列 |
| `language` | VARCHAR(10) | DEFAULT 'ja' | 言語コード |
| `variant_type` | VARCHAR(50) | DEFAULT 'alias' | official/alias/abbreviation/typo 等 |
| `confidence_score` | DECIMAL(3,2) | DEFAULT 0.80 | 候補優先度 |
| `usage_count` | INT | DEFAULT 0 | サジェスト利用回数 |
| `is_primary` | BOOLEAN | DEFAULT FALSE | 代表表記かどうか |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 登録日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |
| UNIQUE | | (`teacher_id`, `normalized_term`) | 重複防止 |

### 7.2. LLM 連携（用語候補自動生成）

#### 7.2.1. `term_generation_jobs` テーブル

LLM（Gemini等）でオートコンプリート用候補を自動生成するジョブキュー。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | ジョブID |
| `entity_type` | VARCHAR(30) | NOT NULL | university / faculty / teacher / subject |
| `entity_id` | BIGINT | NOT NULL | 対象エンティティID |
| `status` | VARCHAR(20) | DEFAULT 'pending' | pending / processing / completed / failed |
| `trigger_type` | VARCHAR(30) | DEFAULT 'system' | system / user |
| `requested_by` | VARCHAR(255) | NULL | 発火ユーザーID（システムならNULL） |
| `llm_model` | VARCHAR(50) | DEFAULT 'gemini-1.5-pro-latest' | 使用モデル名 |
| `prompt_payload` | JSONB | NOT NULL | LLMへ送るプロンプト |
| `response_raw` | JSONB | NULL | LLMのレスポンス全文（監査用） |
| `retry_count` | INT | DEFAULT 0 | 再試行回数 |
| `error_message` | TEXT | NULL | 失敗理由 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 生成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**イベント発行**: `search.term_generation` → `TermGenerationJobCreated`

**購読**: edumintAiWorker が `search.term_generation` を購読

#### 7.2.2. `term_generation_candidates` テーブル

LLM から返却された候補語。自動採用フラグで即座に `*_terms` へ同期。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | 候補ID |
| `job_id` | BIGINT | NOT NULL, FOREIGN KEY → `term_generation_jobs(id)` | 生成元ジョブ |
| `entity_type` | VARCHAR(30) | NOT NULL | university / faculty / teacher / subject |
| `entity_id` | BIGINT | NOT NULL | 対象エンティティID |
| `suggested_term` | VARCHAR(255) | NOT NULL | LLMが返した候補 |
| `hiragana` | VARCHAR(255) | NULL | ひらがな表記 |
| `katakana` | VARCHAR(255) | NULL | カタカナ表記 |
| `romaji` | VARCHAR(255) | NULL | ローマ字表記 |
| `english_name` | VARCHAR(255) | NULL | 英語表記 |
| `normalized_term` | VARCHAR(255) | NOT NULL | 正規化文字列 |
| `phonetic_key` | VARCHAR(255) | NULL | 音声キー |
| `variant_type` | VARCHAR(50) | DEFAULT 'llm_alias' | LLM由来 |
| `confidence_score` | DECIMAL(3,2) | DEFAULT 0.75 | 信頼度 |
| `auto_adopted` | BOOLEAN | DEFAULT FALSE | TRUE なら `*_terms` へ同期済み |
| `adopted_term_id` | BIGINT | NULL | 取り込んだ `*_terms` のID |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

### 7.3. 外部検索インデックス

#### Elasticsearch インデックス

*   用途: キーワード検索、テキスト検索（問題文・解答等）
*   ドキュメント構成:
    ```json
    {
      "_id": "exam:12345",
      "exam_id": 12345,
      "title": "2023年度 東京大学 情報科学科 線形代数 定期試験",
      "subject": "線形代数",
      "university": "東京大学",
      "teacher": "田中 太郎",
      "exam_year": 2023,
      "questions": [
        { "id": 1, "content": "行列 A の..." },
        { "id": 2, "content": "固有値の..." }
      ],
      "created_at": "2023-01-15"
    }
    ```

#### Qdrant ベクトル検索

*   用途: セマンティック検索（類似問題検索等）
*   ベクトル次元: 1536（embedding モデル依存）
*   ペイロード: `{exam_id, question_id, content_type, ...}`

### 7.4. 検索フロー

```
[ユーザー入力] "線形代数"
    |
    v
[正規化] "線形代数" → normalized_term: "せんけいだいすう"
    |
    v
[検索実行]
  1. Elasticsearch keyword クエリ: matched_exams
  2. Qdrant semantic クエリ: similar_exams (if threshold > 0.7)
  3. *_terms テーブル: autocomplete_candidates
    |
    v
[結果統合・ランキング]
  - usage_count, confidence_score で優先度付け
  - cached_results (TTL: 5分)
```

---

## **8. ソーシャル・評価データ**

### 管理サービス: **edumintSocial**

### 8.1. `exam_likes` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `exam_id` | BIGINT | NOT NULL, FOREIGN KEY → exams (edumintContent) | 試験ID |
| `user_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → users (edumintUserProfile) | ユーザーID |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | いいね日時 |
| UNIQUE | | (`exam_id`, `user_id`) | 重複防止 |

**イベント発行**: `content.feedback` → `ExamLiked` (購読: edumintContent がキャッシュ更新)

### 8.2. `exam_bads` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `exam_id` | BIGINT | NOT NULL, FOREIGN KEY → exams (edumintContent) | 試験ID |
| `user_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → users (edumintUserProfile) | ユーザーID |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 低評価日時 |
| UNIQUE | | (`exam_id`, `user_id`) | 重複防止 |

**イベント発行**: `content.feedback` → `ExamBadRated`

### 8.3. `exam_comments` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `exam_id` | BIGINT | NOT NULL, FOREIGN KEY → exams (edumintContent) | 試験ID |
| `user_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → users (edumintUserProfile) | ユーザーID |
| `comment` | TEXT | NOT NULL | 本文 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**イベント発行**: `content.feedback` → `ExamCommented`

### 8.4. `exam_views` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `exam_id` | BIGINT | NOT NULL, FOREIGN KEY → exams (edumintContent) | 試験ID |
| `user_id` | VARCHAR(255) | NULL, FOREIGN KEY → users (edumintUserProfile) | ユーザーID（ゲスト時はNULL） |
| `viewed_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 閲覧日時 |

**イベント発行**: `content.feedback` → `ExamViewed`

---

## **9. 経済・広告・学習履歴**

### 9.1. 管理サービス

| テーブル | サービス | 責務 |
| :--- | :--- | :--- |
| `wallets`, `wallet_transactions` | **edumintMonetizeWallet** | MintCoin 残高・取引管理（強整合性） |
| `revenue_reports`, `ad_impressions_agg` | **edumintRevenue** | 月次収益分配、広告集計 |
| `user_ad_views`, `learning_histories` | **edumintUserProfile** 共存 | 広告視聴履歴、学習履歴 |

### 9.2. edumintMonetizeWallet: `wallets` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ウォレットID |
| `user_id` | VARCHAR(255) | UNIQUE, NOT NULL, FOREIGN KEY → users (edumintUserProfile) | ユーザーID |
| `balance` | BIGINT | NOT NULL, DEFAULT 0 | MintCoin 残高（セント） |
| `currency` | VARCHAR(3) | DEFAULT 'JPY' | 通貨 |
| `locked_balance` | BIGINT | DEFAULT 0 | 凍結残高（取引中） |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | ウォレット作成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**強整合性保証**: トランザクションで必ず `balance` と `wallet_transactions` を atomic に更新。

### 9.3. edumintMonetizeWallet: `wallet_transactions` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | トランザクションID |
| `wallet_id` | BIGINT | NOT NULL, FOREIGN KEY → `wallets(id)` | ウォレットID |
| `amount` | BIGINT | NOT NULL | 増減額（セント、負は支出） |
| `type` | VARCHAR(50) | NOT NULL | 取引種別（ad_view, earn_share, spend, bonus等） |
| `reference_type` | VARCHAR(50) | NULL | 参照リソース種別（exam, user等） |
| `reference_id` | VARCHAR(255) | NULL | 参照リソースID |
| `description` | TEXT | NULL | 説明 |
| `status` | VARCHAR(20) | DEFAULT 'completed' | completed / pending / failed |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |

**イベント発行**: `monetization.transactions` → `CoinAwarded`, `CoinSpent`

### 9.4. edumintRevenue: `revenue_reports` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | レポートID |
| `user_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → users (edumintUserProfile) | ユーザーID |
| `report_month` | DATE | NOT NULL | 対象月（例: 2023-01-01） |
| `ad_earnings` | BIGINT | NOT NULL | 広告収益（JPY） |
| `exam_share` | BIGINT | NOT NULL | 試験シェア（JPY） |
| `total_earnings` | BIGINT | NOT NULL | 合計収益（JPY） |
| `payable_amount` | BIGINT | NOT NULL | 支払い対象額（最低額チェック後） |
| `status` | VARCHAR(20) | DEFAULT 'pending' | pending / approved / paid |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 生成日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**イベント購読**: `monetization.transactions` で月次集計

### 9.5. edumintUserProfile: `user_ad_views` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `user_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → users (edumintUserProfile) | ユーザーID |
| `exam_id` | BIGINT | NOT NULL, FOREIGN KEY → exams (edumintContent) | 試験ID |
| `action_type` | VARCHAR(50) | NOT NULL | view / click / share 等 |
| `ad_network` | VARCHAR(50) | NULL | 広告ネットワーク（Google Ads等） |
| `revenue_share` | BIGINT | NULL | 収益シェア（JPY） |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 完了日時 |
| UNIQUE | | (`user_id`, `exam_id`, `action_type`) | 重複防止 |

**イベント購読**: edumintSocial → `ExamViewed` 受信時に自動記録

### 9.6. edumintUserProfile: `learning_histories` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| `user_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → users (edumintUserProfile) | ユーザーID |
| `exam_id` | BIGINT | NOT NULL, FOREIGN KEY → exams (edumintContent) | 試験ID |
| `viewed_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 閲覧日時 |

**用途**: 検索画面での「閲覧履歴」フィルタリング。

---

## **10. 通報管理（コンテンツ・ユーザー）**

### 管理サービス: **edumintModeration**

### 10.1. コンテンツ通報

#### 10.1.1. `content_reports` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 通報ID |
| `reporter_user_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → users (edumintUserProfile) | 通報者ID |
| `content_type` | VARCHAR(50) | NOT NULL | コンテンツ種別（exam, question, sub_question等） |
| `content_id` | BIGINT | NOT NULL | コンテンツID |
| `reason_id` | INT | NOT NULL, FOREIGN KEY → `content_report_reasons(id)` | 理由ID |
| `details` | TEXT | NULL | 詳細 |
| `status` | VARCHAR(50) | DEFAULT 'pending' | pending / resolved / ignored |
| `moderator_id` | VARCHAR(255) | NULL | 対応モデレーターID |
| `action_taken` | VARCHAR(50) | NULL | 実施アクション（hide, delete等） |
| `resolved_at` | TIMESTAMP | NULL | 解決日時 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 通報日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**イベント発行**: `moderation.events` → `ContentReportCreated`, `ContentActionTaken`

#### 10.1.2. `content_report_reasons` テーブル

| ID | reason_text | description |
| :--- | :--- | :--- |
| 1 | 解答が不正確・間違っている | 生成された解答の誤り |
| 2 | 問題文が不明瞭・誤字がある | 意味不明瞭、誤字脱字 |
| 3 | 問題と解答の対応が不適切 | 不一致 |
| 4 | 著作権を侵害している疑い | 無断転載 |
| 5 | 不適切な表現を含んでいる | 公序良俗違反 |
| 6 | スパム・宣伝目的である | 宣伝など |
| 99 | その他 | その他 |

#### 10.1.3. `report_files` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ファイルID |
| `report_id` | BIGINT | NOT NULL, FOREIGN KEY → `content_reports(id)` | 通報ID |
| `file_path` | TEXT | NOT NULL | 保存パス（S3等） |
| `file_type` | VARCHAR(50) | NOT NULL | 形式 |
| `original_filename` | TEXT | NULL | 元ファイル名 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |

### 10.2. ユーザー通報

#### 10.2.1. `user_reports` テーブル

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 通報ID |
| `reporter_user_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → users (edumintUserProfile) | 通報者ID |
| `reported_user_id` | VARCHAR(255) | NOT NULL, FOREIGN KEY → users (edumintUserProfile) | 被通報者ID |
| `content_type` | VARCHAR(50) | NOT NULL | 種別（comment, profile等） |
| `content_id` | VARCHAR(255) | NULL | 対象コンテンツID |
| `reason_id` | INT | NOT NULL, FOREIGN KEY → `user_report_reasons(id)` | 理由ID |
| `details` | TEXT | NULL | 詳細 |
| `status` | VARCHAR(50) | DEFAULT 'pending' | pending / resolved / ignored |
| `moderator_id` | VARCHAR(255) | NULL | 対応モデレーターID |
| `action_taken` | VARCHAR(50) | NULL | 実施アクション（warning, suspend, ban等） |
| `resolved_at` | TIMESTAMP | NULL | 解決日時 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 通報日時 |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**イベント発行**: `moderation.events` → `UserReportCreated`, `UserActionTaken`

#### 10.2.2. `user_report_reasons` テーブル

| ID | reason_text | description |
| :--- | :--- | :--- |
| 1 | 嫌がらせ・誹謗中傷 | 攻撃的発言、いじめ等 |
| 2 | 不適切なプロフィール | 画像・自己紹介の不適切さ |
| 3 | スパム・迷惑行為 | 宣伝、大量投稿 |
| 4 | なりすまし | 本人詐称 |
| 5 | 差別・ヘイトスピーチ | 差別的発言 |
| 6 | プライバシーの侵害 | 個人情報公開 |
| 7 | 不正行為 | 複数垢、システム不正 |
| 99 | その他 | その他 |

---

## **11. イベント駆動フロー**

### 11.1. 試験作成フロー（詳細）

```
[フロントエンド]
    |
    | POST /v1/exams
    | Body: {
    |   type: "exam_creation",
    |   clientRequestId: "uuid-v4",
    |   payload: {
    |     title: "2023年度東大線形代数",
    |     universityId: 1,
    |     subjectId: 101,
    |     exam_year: 2023
    |   }
    | }
    v
[edumintGateway]
    |
    | 1. JWT検証 (edumintAuth)
    | 2. Payload Validation
    | 3. 冪等性チェック (clientRequestId → DUPLICATE KEY)
    | 4. INSERT jobs (status='pending', clientRequestId, user_id)
    | 5. Publish: gateway.jobs → 'job.created'
    | 6. Return 202 Accepted { jobId, status: 'pending' }
    v
[Kafka: gateway.jobs]
    |
    v
[edumintContent]
    |
    | 7. Subscribe: 'job.created'
    | 8. Extract payload, validate domain rules
    | 9. BEGIN TRANSACTION
    |     INSERT exams (title, university_id, subject_id, user_id, status='active')
    |     INSERT questions (exam_id, ...) // ファイルアップロード後に追加
    |     INSERT keywords, question_keywords
    | 10. COMMIT
    | 11. Publish: content.lifecycle → 'ExamCreated' {
    |       jobId, examId, universityId, ...
    |     }
    v
[Kafka: content.lifecycle]
    |
    |--- [edumintGateway]
    |    |
    |    | 12. Subscribe: 'ExamCreated'
    |    | 13. UPDATE jobs SET status='processing', resource_id=examId
    |    | 14. Publish: gateway.job_status → 'job_processing'
    |
    |--- [edumintSearch]
    |    |
    |    | 15. Subscribe: 'ExamCreated'
    |    | 16. INSERT/UPDATE Elasticsearch, Qdrant インデックス
    |    | 17. Publish: search.indexed
    v
[ファイルアップロード後]
    |
    | 18. edumintFile: Publish content.jobs → 'FileUploaded'
    |     (ジョブ ID, ファイルパス等)
    v
[edumintAiWorker]
    |
    | 19. Subscribe: content.jobs → 'FileUploaded'
    | 20. OCR, Gemini API で問題抽出
    | 21. Publish: ai.results → 'AIProcessingCompleted' {
    |       jobId, extractedQuestions: [...]
    |     }
    v
[edumintContent]
    |
    | 22. Subscribe: ai.results → 'AIProcessingCompleted'
    | 23. BEGIN TRANSACTION
    |     INSERT questions, sub_questions, keywords
    |     UPDATE exams (status='active' if completed)
    | 24. COMMIT
    | 25. Publish: content.lifecycle → 'ExamCompleted'
    v
[edumintGateway]
    |
    | 26. Subscribe: content.lifecycle → 'ExamCompleted'
    | 27. UPDATE jobs SET status='completed', completedAt=NOW()
    | 28. Publish: gateway.job_status → 'job_completed'
```

### 11.2. Kafka トピック一覧（最終版）

| トピック | Producer | Consumer | イベント型 | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| `auth.events` | edumintAuth | edumintUserProfile | UserLoggedIn, UserSignedUpViaSSO | ユーザー認証事件 |
| `gateway.jobs` | edumintGateway | edumintContent, edumintFile, edumintSearch | job.created | ジョブ作成 |
| `gateway.job_status` | edumintGateway | クライアント (WebSocket等) | job_pending, job_processing, job_completed, job_failed | ジョブ状態通知 |
| `content.lifecycle` | edumintContent | edumintGateway, edumintSearch, edumintNotify | ExamCreated, ExamUpdated, ExamDeleted, ExamCompleted, QuestionCreated, SubQuestionCreated | コンテンツライフサイクル |
| `content.jobs` | edumintFile, edumintContent | edumintAiWorker | FileUploaded, ProcessingCompleted | コンテンツ処理ジョブ |
| `ai.results` | edumintAiWorker | edumintContent | AIProcessingCompleted, AIProcessingFailed | AI処理結果 |
| `content.feedback` | edumintSocial | edumintSearch, edumintNotify, edumintContent | ExamLiked, ExamBadRated, ExamCommented, ExamViewed | SNS評価アクション |
| `search.indexed` | edumintSearch | - | SearchIndexUpdated | インデックス更新完了 |
| `user.events` | edumintUserProfile | edumintNotify | UserCreated, UserUpdated, UserFollowed, UserBlocked | ユーザー事件 |
| `monetization.transactions` | edumintMonetizeWallet | edumintRevenue | CoinAwarded, CoinSpent | MintCoin取引 |
| `moderation.events` | edumintModeration | edumintNotify, edumintContent | ContentReportCreated, ContentActionTaken, UserReportCreated, UserActionTaken | モデレーション |
| `search.term_generation` | edumintSearch | edumintAiWorker | TermGenerationJobCreated | 用語生成ジョブ |

---

## **12. データベース設計ガイドライン**

### 12.1. インデックス戦略

#### edumintUserProfile DB

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_university_id ON users(university_id);
CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_followed_id ON user_follows(followed_id);
CREATE INDEX idx_notifications_user_id_created ON notifications(user_id, created_at DESC);
```

#### edumintContent DB

```sql
CREATE INDEX idx_exams_university_id ON exams(university_id);
CREATE INDEX idx_exams_subject_id ON exams(subject_id);
CREATE INDEX idx_exams_teacher_id ON exams(teacher_id);
CREATE INDEX idx_exams_user_id ON exams(user_id);
CREATE INDEX idx_exams_created_at ON exams(created_at DESC);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_sub_questions_question_id ON sub_questions(question_id);
CREATE INDEX idx_keywords_keyword ON keywords(keyword);
CREATE INDEX idx_question_keywords_question_id ON question_keywords(question_id);
CREATE INDEX idx_sub_question_keywords_sub_question_id ON sub_question_keywords(sub_question_id);
```

#### edumintSearch DB

```sql
CREATE INDEX idx_university_terms_normalized ON university_terms(normalized_term);
CREATE INDEX idx_university_terms_university_id ON university_terms(university_id);
CREATE INDEX idx_subject_terms_normalized ON subject_terms(normalized_term);
CREATE INDEX idx_subject_terms_subject_id ON subject_terms(subject_id);
CREATE INDEX idx_term_gen_jobs_status ON term_generation_jobs(status);
CREATE INDEX idx_term_gen_candidates_job_id ON term_generation_candidates(job_id);
```

#### edumintSocial DB

```sql
CREATE INDEX idx_exam_likes_exam_id ON exam_likes(exam_id);
CREATE INDEX idx_exam_likes_user_id ON exam_likes(user_id);
CREATE INDEX idx_exam_comments_exam_id ON exam_comments(exam_id);
CREATE INDEX idx_exam_comments_user_id ON exam_comments(user_id);
CREATE INDEX idx_exam_views_exam_id ON exam_views(exam_id);
CREATE INDEX idx_exam_views_viewed_at ON exam_views(viewed_at DESC);
```

#### edumintMonetizeWallet DB

```sql
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);
```

#### edumintModeration DB

```sql
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_content_reports_created_at ON content_reports(created_at DESC);
CREATE INDEX idx_user_reports_status ON user_reports(status);
CREATE INDEX idx_user_reports_created_at ON user_reports(created_at DESC);
```

### 12.2. バックアップ・保持期間ポリシー

| テーブル | サービス | 保持期間 | バックアップ頻度 | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| `jobs` | edumintGateway | 90日 | 日次 | ジョブ履歴は監査用に保持 |
| `wallet_transactions` | edumintMonetizeWallet | 7年 | 日次 | 会計・監査用に長期保持 |
| `users`, `exams`, `questions` | 各サービス | 永続 | 日次 | コアデータは永続保持 |
| `notifications` | edumintUserProfile | 30日 | 日次 | ユーザー通知は定期削除 |
| `content_reports`, `user_reports` | edumintModeration | 2年 | 日次 | 苦情対応記録は長期保持 |

### 12.3. キャッシュ戦略

| データ | サービス | キャッシュ層 | TTL | 更新トリガー |
| :--- | :--- | :--- | :--- | :--- |
| ユーザープロフィール | edumintUserProfile | Redis | 5分 | user.events 受信時 |
| 試験メタデータ | edumintContent | Redis | 10分 | content.lifecycle 受信時 |
| キーワード候補 | edumintSearch | Redis | 1時間 | term_generation_candidates 自動採用時 |
| 大学/学部/科目マスタ | edumintContent | Redis (client-side) | 1時間 | ルックアップAPI使用時 |
| いいね・コメント数 | edumintContent | メモリキャッシュ | 1分 | content.feedback 受信時 |

### 12.4. データ整合性保証

#### 強整合性が必要な領域
- `wallets`, `wallet_transactions`: DB トランザクション（Serializable isolation）
- `jobs`: 冪等性キーによる UNIQUE 制約

#### 結果整合性で許容可能な領域
- `exams` キャッシュ（good_count等）: Kafka イベント駆動で最大5秒遅延
- 検索インデックス: Elasticsearch, Qdrant の最大数秒遅延
- キーワード候補: 自動採用後の `*_terms` 反映に最大1分

### 12.5. セキュリティ対策

- **個人情報暗号化**: `email`, `password_hash` は AES-256-GCM で暗号化
- **ログマスキング**: API ログからは PII を除去
- **監査ログ**: `wallet_transactions`, 通報対応履歴は不変ログとして記録
- **アクセス制御**: 各サービス DB へのアクセスは API 層のみ（直接 SQL 禁止）
- **多要素認証**: ユーザー認証は edumintAuth が一元管理

---

## **参考**

- [E_DATA_MODEL.md](E_DATA_MODEL.md): Frontend 表示用データ型
- [F_ARCHITECTURE_OVERALL.md](F_ARCHITECTURE_OVERALL.md): マイクロサービスアーキテクチャ全体
- [Q_DATABASE.md](Q_DATABASE.md): 過去の統合設計書
