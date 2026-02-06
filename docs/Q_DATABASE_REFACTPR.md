# **EduMint 統合データモデル設計書 v7.0.2**

本ドキュメントは、EduMintのマイクロサービスアーキテクチャに基づいた、統合されたデータモデル設計です。各テーブルの所有サービス、責務、外部API非依存の自己完結型データ管理を定義します。

**v7.0.2 主要更新:**
- **技術スタックを2026年2月最新版に更新**
- **Go 1.25.7、PostgreSQL 18.1、pgvector 0.8.1、Atlas v1.0.0、sqlc 1.30.0、pgx v5.8.0、Echo v5.0.1に対応**
- **Webフレームワーク: Echo v5に統一（Chi, Gin, Echo v4を禁止）**
- **設定管理: Dev環境は.env、Production環境はSecret Managerに統一（Doppler廃止）**
- **pgvector 0.8.1の反復インデックススキャン対応**
- **Atlas v1.0.0のMonitoring as Code、Schema Statistics機能対応**

**v7.0.1 主要更新:**
- **禁止ツール/ライブラリのリストを明記（golang-migrate, Echo v4, lib/pq, gin, GORM等）**
- **pgvector + HNSWインデックス設計（1536次元）の詳細追加**
- **Go型（pgvector.NewVector）とsqlc query例を完全統合**
- **Atlas HCL + sqlcワークフロー連携の標準パターン明記**
- **Cloud SQL推奨パラメータ設定・IAM最小権限例を追加**
- **Doppler/Secret Manager統一運用の注意点を追記**
- **OpenTelemetry/Prometheus/Cloud Logging導入ガイド追加**
- **監査ログ設計・GCPルール・BigQuery連携ノウハウを付記**
- **Test/E2E/Testcontainer/CI/CD例を新設**
- **Atlas+Auto Lint+Goバージョン固定パイプライン標準化**
- **AIコード生成/レビュー用プロンプト例・チェックリスト新設**
- **セクション15以降: Goインテグレーション章、AIエージェント協働章を追加**
- **全環境（本番/開発/テスト）でAtlas→sqlc→Go型直結・ENUM/UUID/Vector全自動化パターン統一**

**v7.0.0からの継続:**
- 全主キーをuuidv7()で統一（gen_random_uuid()等は完全廃止）
- UUID + NanoID構成、ENUM型厳格化
- マイクロサービス別章立て、ログテーブル物理DB分離設計

---

## **目次**

**基本設計編**
1. [アーキテクチャ前提](#1-アーキテクチャ前提)
2. [禁止ツール・ライブラリ一覧](#2-禁止ツールライブラリ一覧)
3. [サービス別所有表](#3-サービス別所有表)

**サービス別設計編**
4. [edumintAuth (認証サービス)](#4-edumintauth-認証サービス)
5. [edumintUserProfile (ユーザープロフィールサービス)](#5-edumin tuserprofile-ユーザープロフィールサービス)
6. [edumintContent (コンテンツ管理サービス)](#6-edumintcontent-コンテンツ管理サービス)
7. [edumintFile (ファイル管理サービス)](#7-edumintfile-ファイル管理サービス)
8. [edumintSearch (検索サービス)](#8-edumintsearch-検索サービス)
9. [edumintAiWorker (AI処理サービス)](#9-edumintaiworker-ai処理サービス)
10. [edumintSocial (ソーシャルサービス)](#10-edumintsocial-ソーシャルサービス)
11. [edumintMonetizeWallet (ウォレット管理サービス)](#11-edumintmonetizewallet-ウォレット管理サービス)
12. [edumintRevenue (収益分配サービス)](#12-edumintrevenue-収益分配サービス)
13. [edumintModeration (通報管理サービス)](#13-edumintmoderation-通報管理サービス)
14. [edumintGateway (ジョブゲートウェイ)](#14-edumintgateway-ジョブゲートウェイ)

**統合設計編**
15. [イベント駆動フロー](#15-イベント駆動フロー)
16. [データベース設計ガイドライン](#16-データベース設計ガイドライン)
17. [pgvector + ベクトル検索設計](#17-pgvectorベクトル検索設計)
18. [Atlas HCL + sqlcワークフロー](#18-atlas-hclsqlcワークフロー)
19. [Cloud SQL運用設定](#19-cloud-sql運用設定)
20. [可観測性・監査ログ設計](#20-可観測性監査ログ設計)
21. [テスト・CI/CD設計](#21-テストcicd設計)
22. [Goインテグレーション](#22-goインテグレーション)
23. [AIエージェント協働](#23-aiエージェント協働)

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
*   **UUID + NanoID**: 内部主キーはUUID、外部公開キーはNanoIDを採用し、セキュリティとユーザビリティを両立。

### 技術スタック（2026年2月最新版）

| 項目 | バージョン | リリース日 | 備考・新機能要約 |
| :--- | :--- | :--- | :--- |
| **Go** | **1.25.7** | 2026/02/04 | 最新安定版。セキュリティ修正およびコンパイラ最適化を含む。 |
| **PostgreSQL** | **18.1** | 2025/10頃~ | `uuidv7()`、非同期I/O (AIO)、B-tree Skip Scanの正式サポート。 |
| **pgvector** | **0.8.1** | 2025/09/04 | HNSWインデックスの構築・検索パフォーマンス向上。反復インデックススキャン対応。 |
| **Atlas** | **v1.0.0** | 2025/12/24 | メジャーリリース到達。Monitoring as Code、Schema Statistics機能追加。 |
| **sqlc** | **1.30.0** | 2025/09/01 | pgx/v5、ENUM配列の対応強化。MySQL/SQLiteエンジンの改善。 |
| **pgx** | **v5.8.0** | 2025/12/26 | Go 1.24+必須化。パイプライン処理の改善、`pgtype.Numeric`の最適化。 |
| **Echo** | **v5.0.1** | 2026/01/28 | v5が正式リリース。エラーハンドリングの刷新、ルーターの最適化。 |
| **Elasticsearch** | **9.2.4** | - | ベクトル検索統合（dense_vector）、Qdrantを完全置換。 |
| **Debezium CDC** | - | - | PostgreSQL論理レプリケーションから移行、Kafka経由のリアルタイム差分同期。 |

**追加の技術スタック:**
*   **ベクトル次元**: 1536次元（gemini-embedding-001準拠、MRL互換）
*   **i18n-iso-countries**: 地域名の多言語表示（194ヶ国、70言語対応）
*   **i18n-iso-languages**: 言語名の多言語表示（184言語、100言語対応）
*   **ISO 3166-1 alpha-2**: 地域コードの国際標準（2文字コード）
*   **BCP 47 (RFC 5646)**: 言語タグの国際標準（地域拡張サポート）

### デプロイ段階

*   **Phase 1 (MVP)**: edumintGateway, edumintAuth, edumintUserProfile, edumintFile, edumintContent, edumintAiWorker, edumintSearch
*   **Phase 2 (製品版)**: + edumintMonetizeWallet, edumintRevenue, edumintSocial, edumintModeration
*   **Phase 3 (拡張版)**: + 多言語・推薦等

### UUID + NanoID 設計原則

**v7.0.0で全テーブルの主キー設計を刷新しました。**

#### **基本構造**

```sql
-- 標準テーブル構造（UUID単独主キー）
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT uuidv7(),  -- 内部主キー（タイムスタンプベース）
  public_id VARCHAR(8) NOT NULL UNIQUE,  -- 外部公開ID (NanoID)
  -- 他のカラム
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 特殊テーブル（UUID + NanoID 複合主キー）
-- teachers, exams, questions, sub_questions, keywords
CREATE TABLE special_table (
  id UUID DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL,
  PRIMARY KEY (id, public_id),  -- 複合主キー
  -- 他のカラム
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### **設計判断**

1. **内部主キー (UUID)**:
   - `uuidv7()` で生成（PostgreSQL 18.1ネイティブ関数、RFC 9562準拠）
   - タイムスタンプベースでソート可能
   - 分散環境での衝突回避
   - データベース内部での参照整合性維持
   - インデックス効率が極めて高い（シーケンシャル挿入）

2. **外部公開ID (NanoID)**:
   - 8文字または16文字のURL-safeな文字列
   - API・URLでの利用に最適
   - ユーザーフレンドリー
   - アプリケーション層で生成

3. **複合主キー採用テーブル**:
   - `teachers`, `exams`, `questions`, `sub_questions`, `keywords`
   - これらは外部参照が多く、NanoIDでの識別が重要
   - UUID + NanoID の両方をPKとすることで、参照整合性を強化

4. **外部キー参照**:
   - 常にUUIDカラムを参照
   - `REFERENCES table_name(id)`

#### **AUTO_INCREMENT/SERIAL廃止の理由**

- 連番IDは推測可能でセキュリティリスク
- マイクロサービス間でのID衝突リスク
- 水平スケーリング時の制約
- UUIDは分散環境に最適

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

-- 都道府県
CREATE TYPE prefecture_enum AS ENUM (
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
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
-- ユーザーロール（v7.0.0厳格化）
CREATE TYPE user_role_enum AS ENUM (
  'free',               -- 無料ユーザー
  'system',             -- システム
  'admin',              -- 管理者
  'premium'             -- プレミアムユーザー
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

-- コンテンツ通報理由（v7.0.0更新: ID番号削除）
CREATE TYPE content_report_reason_enum AS ENUM (
  'incorrect_answer',   -- 解答が不正確・間違っている
  'unclear_question',   -- 問題文が不明瞭・誤字がある
  'mismatch',           -- 問題と解答の対応が不適切
  'copyright',          -- 著作権を侵害している疑い
  'inappropriate',      -- 不適切な表現を含んでいる
  'spam',               -- スパム・宣伝目的である
  'other'               -- その他
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

## **2. 禁止ツール・ライブラリ一覧**

EduMintプロジェクトでは、以下のツール・ライブラリの使用を**全面禁止**とします。これらは技術的負債、セキュリティリスク、保守性低下を引き起こすため、代替ツールを使用してください。

### 2.1 データベースマイグレーション

| 禁止ツール | 理由 | 代替ツール |
| :--- | :--- | :--- |
| **golang-migrate** | スキーマ定義が不完全、ロールバック不安定、Atlas HCLとの統合不可 | **Atlas** (推奨) |
| **goose** | スキーマドリフト検知なし、CI/CD統合が弱い | **Atlas** |
| **sql-migrate** | 型安全性なし、バージョン管理が脆弱 | **Atlas** |
| **dbmate** | Goエコシステム外、sqlcとの連携不可 | **Atlas** |

### 2.2 Webフレームワーク

| 禁止ツール | 理由 | 代替ツール |
| :--- | :--- | :--- |
| **Echo v4** | v5への移行が不安定、メンテナンス停滞 | **Echo v5.0.1** (推奨) |
| **Gin** | グローバル状態依存、テスト困難、エラーハンドリング不統一 | **Echo v5.0.1** |
| **Chi** | EduMintプロジェクトではEcho v5に統一 | **Echo v5.0.1** |
| **Beego** | レガシー、過剰な抽象化 | **Echo v5.0.1** |
| **Revel** | 開発停滞、Go標準から乖離 | **Echo v5.0.1** |

### 2.3 データベースドライバ

| 禁止ツール | 理由 | 代替ツール |
| :--- | :--- | :--- |
| **lib/pq** | メンテナンス終了、pgx推奨に移行 | **pgx/v5** (推奨) |
| **go-sql-driver/mysql** | PostgreSQL不使用のため不要 | (該当なし) |

### 2.4 ORM

| 禁止ツール | 理由 | 代替ツール |
| :--- | :--- | :--- |
| **GORM** | N+1問題、暗黙的クエリ、デバッグ困難、型安全性低 | **sqlc** (推奨) |
| **ent** | 過剰な抽象化、学習コスト高、デバッグ困難 | **sqlc** |
| **Bun** | リフレクション依存、パフォーマンス不安定 | **sqlc** |

### 2.5 UUID/乱数生成

| 禁止関数/パッケージ | 理由 | 代替ツール |
| :--- | :--- | :--- |
| **gen_random_uuid()** (PostgreSQL) | ランダムUUID、インデックス効率悪い（v4互換） | **uuidv7()** (推奨) |
| **uuid.New()** (Go標準) | UUIDv4、ソート不可 | **uuidv7()** + pgx取得 |
| **math/rand** (非crypto) | 暗号学的に安全でない | **crypto/rand** |

### 2.6 ロギング

| 禁止関数/パッケージ | 理由 | 代替ツール |
| :--- | :--- | :--- |
| **fmt.Println()** | 構造化ログなし、レベル制御なし、本番環境不適 | **slog** (Go 1.21+推奨) |
| **log.Println()** | 構造化ログなし、コンテキスト不可 | **slog**, **zerolog** |
| **logrus** | パフォーマンス低、メンテナンス停滞 | **slog**, **zerolog** |

### 2.7 設定管理

| 禁止ツール | 理由 | 代替ツール |
| :--- | :--- | :--- |
| **viper** | 過剰な機能、暗黙的挙動、テスト困難 | **.env (Dev)**, **Secret Manager (Production)** |
| **Doppler** | EduMintプロジェクトでは.env + Secret Managerに統一 | **.env + Secret Manager** |
| **環境変数ハードコード** | 保守性低、変更追跡不可 | **.env + Secret Manager** |

### 2.8 テスト

| 禁止パターン | 理由 | 代替ツール |
| :--- | :--- | :--- |
| **本番DB直接テスト** | データ破損リスク、並列実行不可 | **Testcontainers** (推奨) |
| **モックDB** | 実環境との乖離、SQLバグ検出不可 | **Testcontainers** |
| **テーブル削除によるクリーンアップ** | トランザクション分離不完全 | **Testcontainers** + 使い捨てコンテナ |

### 2.9 その他

| 禁止項目 | 理由 | 代替ツール |
| :--- | :--- | :--- |
| **手動SQLマイグレーション** | 人的ミス、監査不可、再現性なし | **Atlas** |
| **直接SQL文字列結合** | SQLインジェクション、型安全性なし | **sqlc** |
| **Context未使用** | タイムアウト制御不可、リソースリーク | **context.Context** (必須) |

### 2.10 バージョン標準

| 項目 | バージョン | リリース日 | 備考 |
| :--- | :--- | :--- | :--- |
| **Go** | **1.25.7** | 2026/02/04 | 最新安定版。セキュリティ修正およびコンパイラ最適化を含む。 |
| **PostgreSQL** | **18.1** | 2025/10頃~ | uuidv7()、AIO、B-tree Skip Scan必須 |
| **pgvector** | **0.8.1** | 2025/09/04 | HNSW、1536次元対応、反復インデックススキャン対応 |
| **Atlas** | **v1.0.0** | 2025/12/24 | Monitoring as Code、Schema Statistics機能対応 |
| **sqlc** | **1.30.0** | 2025/09/01 | pgx/v5、ENUM完全対応 |
| **pgx** | **v5.8.0** | 2025/12/26 | context対応、プリペアドステートメント最適化 |
| **Echo** | **v5.0.1** | 2026/01/28 | v5正式リリース、エラーハンドリング刷新 |

### 2.11 禁止理由の詳細

#### **golang-migrate廃止理由**
- スキーマドリフト検知なし（手動SQLとの乖離に気づけない）
- ロールバックが不完全（CREATE INDEX CONCURRENTLY等に非対応）
- Atlas HCLの宣言的スキーマ管理と相性が悪い
- sqlcとの型同期が自動化できない

#### **Echo v4/Gin/Chi廃止理由**
- **Echo v4**: v5への移行パスが不明確、セキュリティパッチ遅延 → **Echo v5.0.1に統一**
- **Gin**: グローバル状態（gin.Default()）でテスト並列実行不可、エラーハンドリング不統一
- **Chi**: 軽量だがEduMintではEcho v5に統一することで一貫性を確保

#### **Doppler廃止理由**
- EduMintプロジェクトでは設定管理を統一
- Dev環境: `.env`ファイル（シンプル、軽量）
- Production環境: Google Cloud Secret Manager（セキュア、監査可能）
- Dopplerは追加の外部依存となり、コスト・複雑性が増加

#### **lib/pq廃止理由**
- 公式メンテナンス終了宣言（pgx推奨）
- COPY、LISTEN/NOTIFY、pgx独自最適化に非対応
- context.Contextの統合が不完全

#### **GORM廃止理由**
- 暗黙的N+1クエリ発生（Preload忘れ）
- 動的SQL生成でクエリプラン不安定
- 型安全性が低く、コンパイル時エラー検出不可
- デバッグ時のSQL確認が困難

#### **gen_random_uuid()廃止理由**
- UUIDv4（完全ランダム）でB-treeインデックス断片化
- 書き込み性能が最大2.5倍遅い
- uuidv7()のタイムスタンプベースUUIDで全問題解決

#### **fmt.Println()廃止理由**
- 構造化ログなし（grep困難、Prometheus連携不可）
- ログレベル制御なし（本番で無駄なログ大量出力）
- OpenTelemetry trace_id連携不可

---

## **3. サービス別所有表**

| サービス | 役割 | 所有テーブル | イベント発行 | Kafka購読 |
| :--- | :--- | :--- | :--- | :--- |
| **edumintGateway** | ジョブオーケストレーション | `jobs`, `job_logs` (分離DB) | `gateway.jobs` | `content.lifecycle`, `ai.results`, `gateway.job_status` |
| **edumintAuth** | SSO・認証 | `oauth_clients`, `oauth_tokens`, `idp_links`, `auth_logs` (分離DB) | `auth.events` | - |
| **edumintUserProfile** | ユーザー管理・フォロー・通知 | `users`, `user_profiles`, `user_follows`, `user_blocks`, `notifications`, `user_profile_logs` (分離DB) | `user.events` | `auth.events` |
| **edumintFile** | ファイル管理 | `file_inputs`, `file_upload_jobs`, `file_logs` (分離DB) | `content.jobs` (FileUploaded) | `gateway.jobs` |
| **edumintContent** | 試験・問題データ (Source of Truth) | `institutions`, `faculties`, `departments`, `teachers`, `subjects`, `exams`, `questions`, `sub_questions`, `keywords`, `content_logs` (分離DB) | `content.lifecycle` | `gateway.jobs`, `ai.results` |
| **edumintSearch** | 検索・インデックス | `*_terms` (subject, institution, faculty, teacher), `term_generation_jobs`, `term_generation_candidates`, Elasticsearch索引, `search_logs` (分離DB) | `search.indexed`, `search.term_generation` | `content.lifecycle` |
| **edumintAiWorker** | AI処理（ステートレス） | （物理DB削除）*ELKログのみ | `ai.results` | `gateway.jobs`, `content.jobs`, `search.term_generation` |
| **edumintSocial** | SNS機能（コメント・いいね） | `exam_likes`, `exam_bads`, `exam_comments`, `exam_views` | `content.feedback` | - |
| **edumintMonetizeWallet** | MintCoin管理 | `wallets`, `wallet_transactions`, `wallet_logs` (分離DB, 7年保持) | `monetization.transactions` | - |
| **edumintRevenue** | 収益分配 | `revenue_reports`, `ad_impressions_agg`, `revenue_logs` (分離DB) | `revenue.reports` | `monetization.transactions` |
| **edumintModeration** | 通報管理 | `content_reports`, `user_reports`, `report_files`, `moderation_logs` (分離DB) | `moderation.events` | - |
| **edumintAdmin** | 管理UI統合 | （他サービスのAPIを集約） | - | - |

**注記:**
- すべてのログテーブルは物理的に分離されたデータベースに配置
- ログDBは長期保存・分析用途に最適化（パーティショニング、圧縮）
- edumintAiWorkerは完全ステートレス化、ログはELKスタックで管理

---

## **3. edumintAuth (認証サービス)**

### 設計変更点（v7.0.0）

- 全テーブルの主キーをUUIDに変更
- AUTO_INCREMENT廃止
- ログテーブルを物理的に分離したデータベースに配置
- セキュリティ強化のため、トークンにもUUID採用

### 3.1 本体DBテーブル (DDL例)

#### **oauth_clients**

OAuth2クライアント情報を管理します。

```sql
CREATE TABLE oauth_clients (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(16) NOT NULL UNIQUE,
  client_name VARCHAR(255) NOT NULL,
  client_secret_hash VARCHAR(255) NOT NULL,
  redirect_uris TEXT[],
  grant_types TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_oauth_clients_public_id ON oauth_clients(public_id);
CREATE INDEX idx_oauth_clients_active ON oauth_clients(is_active);
```

#### **oauth_tokens**

発行されたアクセストークン・リフレッシュトークンを管理します。

```sql
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID NOT NULL,  -- users.idを参照（論理的）
  client_id UUID REFERENCES oauth_clients(id) ON DELETE CASCADE,
  access_token VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(255) UNIQUE,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT[],
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX idx_oauth_tokens_access_token ON oauth_tokens(access_token);
CREATE INDEX idx_oauth_tokens_refresh_token ON oauth_tokens(refresh_token);
CREATE INDEX idx_oauth_tokens_expires_at ON oauth_tokens(expires_at);
```

#### **idp_links**

外部IDプロバイダー（Google, GitHub等）とのリンク情報を管理します。

```sql
CREATE TABLE idp_links (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID NOT NULL,  -- users.idを参照（論理的）
  provider VARCHAR(50) NOT NULL,  -- 'google', 'github', 'apple', etc.
  provider_user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  profile_data JSONB,
  linked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMPTZ,
  UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_idp_links_user_id ON idp_links(user_id);
CREATE INDEX idx_idp_links_provider ON idp_links(provider, provider_user_id);
```

### 3.2 ログテーブル (DB分離設計)

**物理DB:** `edumint_auth_logs` (別インスタンスまたはスキーマ)

#### **auth_logs**

認証イベントログを記録します。セキュリティ監査・分析用。

```sql
CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID,  -- NULL許可（ログイン失敗時）
  event_type auth_event_enum NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- パーティション例（月次）
CREATE TABLE auth_logs_2025_01 PARTITION OF auth_logs
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE INDEX idx_auth_logs_user_id ON auth_logs(user_id, created_at);
CREATE INDEX idx_auth_logs_event_type ON auth_logs(event_type, created_at);
CREATE INDEX idx_auth_logs_created_at ON auth_logs(created_at);
```

**設計注記:**
- パーティショニングにより大量ログを効率管理
- 本体DBとは物理的に分離（I/O競合回避）
- 長期保存・分析クエリに最適化
- 自動アーカイブ・削除ポリシーを設定可能

---

## **5. edumintUserProfile (ユーザープロフィールサービス)**

### 設計変更点（v7.0.0）

- user_role_enumを4値に厳格化（free, system, admin, premium）
- 全テーブルの主キーをUUIDに変更
- ログテーブルを物理的に分離
- users.public_idにNanoID (8文字) 採用

### 4.1 本体DBテーブル (DDL例)

#### **users**

ユーザーの基本情報を管理します。

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,  -- NanoID (外部公開用)
  email VARCHAR(255) UNIQUE,
  username VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255),
  role user_role_enum DEFAULT 'free',
  status user_status_enum DEFAULT 'active',
  language_code VARCHAR(10) DEFAULT 'ja',  -- BCP 47
  region_code CHAR(2) DEFAULT 'JP',        -- ISO 3166-1 alpha-2
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_public_id ON users(public_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

#### **user_profiles**

ユーザーのプロフィール詳細情報を管理します。

```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY,  -- users.idと1:1
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(512),
  institution_id UUID,  -- institutions.idを参照（論理的）
  faculty_id UUID,      -- faculties.idを参照（論理的）
  department_id UUID,   -- departments.idを参照（論理的）
  graduation_year INT,
  website_url VARCHAR(512),
  twitter_handle VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_institution_id ON user_profiles(institution_id);
```

#### **user_follows**

ユーザー間のフォロー関係を管理します。

```sql
CREATE TABLE user_follows (
  follower_id UUID NOT NULL,  -- users.id
  followee_id UUID NOT NULL,  -- users.id
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id != followee_id)
);

CREATE INDEX idx_user_follows_follower ON user_follows(follower_id, created_at);
CREATE INDEX idx_user_follows_followee ON user_follows(followee_id, created_at);
```

#### **user_blocks**

ユーザー間のブロック関係を管理します。

```sql
CREATE TABLE user_blocks (
  blocker_id UUID NOT NULL,  -- users.id
  blocked_id UUID NOT NULL,  -- users.id
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);
```

#### **notifications**

ユーザーへの通知を管理します。

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID NOT NULL,  -- users.id
  type notification_type_enum NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  related_entity_type VARCHAR(50),  -- 'exam', 'user', 'comment', etc.
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at);
```

### 4.2 ログテーブル (DB分離設計)

**物理DB:** `edumint_userprofile_logs`

#### **user_profile_logs**

ユーザープロフィール変更履歴を記録します。

```sql
CREATE TABLE user_profile_logs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,  -- 'update_profile', 'change_email', 'change_role', etc.
  changed_fields JSONB,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_user_profile_logs_user_id ON user_profile_logs(user_id, created_at);
CREATE INDEX idx_user_profile_logs_action ON user_profile_logs(action, created_at);
```

**設計注記:**
- ユーザー情報の変更履歴を追跡
- GDPR対応・監査証跡として利用
- 本体DBとは分離してパフォーマンス確保

---

## **6. edumintContent (コンテンツ管理サービス)**

### 設計変更点（v7.0.0)

- established_year削除（機関・学部・学科から）
- mext_code系カラム全削除
- parent_institution_id削除（大学院は独立機関）
- question_number, sub_numberをsort_orderに統一
- teachers, exams, questions, sub_questions, keywordsはUUID + NanoID複合主キー
- ログテーブルを物理DB分離

### 5.1 本体DBテーブル (DDL例)

#### **institutions (教育機関)**

大学・大学院・短大・高専等の機関情報を管理します。

```sql
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,  -- NanoID
  name_main VARCHAR(255) NOT NULL,
  name_sub1 VARCHAR(255),  -- 英語名
  name_sub2 VARCHAR(255),  -- 読み仮名
  name_sub3 VARCHAR(255),  -- 略称
  institution_type institution_type_enum NOT NULL,
  prefecture prefecture_enum,
  address TEXT,
  website_url VARCHAR(512),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_institutions_public_id ON institutions(public_id);
CREATE INDEX idx_institutions_type ON institutions(institution_type);
CREATE INDEX idx_institutions_prefecture ON institutions(prefecture);
CREATE INDEX idx_institutions_name_main ON institutions USING gin(to_tsvector('japanese', name_main));
```

**設計注記:**
- 大学と大学院は別レコードとして登録（institution_type で区別）
- established_year削除（検索・表示で不要）
- mext_code削除（外部API非依存方針）

#### **faculties (学部)**

学部・研究科情報を管理します。

```sql
CREATE TABLE faculties (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,  -- NanoID
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name_main VARCHAR(255) NOT NULL,
  name_sub1 VARCHAR(255),  -- 英語名
  name_sub2 VARCHAR(255),  -- 読み仮名
  name_sub3 VARCHAR(255),  -- 略称
  academic_field academic_field_enum,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(institution_id, name_main)
);

CREATE INDEX idx_faculties_public_id ON faculties(public_id);
CREATE INDEX idx_faculties_institution_id ON faculties(institution_id);
CREATE INDEX idx_faculties_academic_field ON faculties(academic_field);
CREATE INDEX idx_faculties_name_main ON faculties USING gin(to_tsvector('japanese', name_main));
```

#### **departments (学科)**

学科・専攻情報を管理します。

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,  -- NanoID
  faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  name_main VARCHAR(255) NOT NULL,
  name_sub1 VARCHAR(255),  -- 英語名
  name_sub2 VARCHAR(255),  -- 読み仮名
  name_sub3 VARCHAR(255),  -- 略称
  academic_field academic_field_enum,
  academic_track academic_track_enum,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(faculty_id, name_main)
);

CREATE INDEX idx_departments_public_id ON departments(public_id);
CREATE INDEX idx_departments_faculty_id ON departments(faculty_id);
CREATE INDEX idx_departments_academic_field ON departments(academic_field);
CREATE INDEX idx_departments_name_main ON departments USING gin(to_tsvector('japanese', name_main));
```

#### **teachers (教員)**

教員情報を管理します。UUID + NanoID複合主キー採用。

```sql
CREATE TABLE teachers (
  id UUID DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL,  -- NanoID
  name_main VARCHAR(255) NOT NULL,
  name_sub1 VARCHAR(255),  -- 英語名
  name_sub2 VARCHAR(255),  -- 読み仮名
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  title VARCHAR(100),  -- 教授、准教授、etc.
  specialization TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, public_id)
);

CREATE UNIQUE INDEX idx_teachers_public_id ON teachers(public_id);
CREATE INDEX idx_teachers_department_id ON teachers(department_id);
CREATE INDEX idx_teachers_name_main ON teachers USING gin(to_tsvector('japanese', name_main));
```

**設計注記:**
- 複合主キー (id, public_id) により、外部参照の柔軟性を確保
- public_idは外部API・URLで使用

#### **subjects (科目)**

科目情報を管理します。

```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,  -- NanoID
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  teacher_id UUID,  -- teachers.idを参照（論理的）
  name_main VARCHAR(255) NOT NULL,
  name_sub1 VARCHAR(255),  -- 英語名
  name_sub2 VARCHAR(255),  -- 読み仮名
  academic_field academic_field_enum,
  credits INT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subjects_public_id ON subjects(public_id);
CREATE INDEX idx_subjects_department_id ON subjects(department_id);
CREATE INDEX idx_subjects_teacher_id ON subjects(teacher_id);
CREATE INDEX idx_subjects_name_main ON subjects USING gin(to_tsvector('japanese', name_main));
```

#### **exams (試験)**

試験情報を管理します。UUID + NanoID複合主キー採用。

```sql
CREATE TABLE exams (
  id UUID DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL,  -- NanoID
  subject_id UUID NOT NULL,  -- subjects.idを参照（論理的）
  teacher_id UUID,  -- teachers.idを参照（論理的）
  uploader_id UUID NOT NULL,  -- users.idを参照（論理的）
  title VARCHAR(255) NOT NULL,
  academic_year INT NOT NULL,
  semester semester_enum,
  exam_type exam_type_enum DEFAULT 'regular',
  exam_date DATE,
  duration_minutes INT,
  status exam_status_enum DEFAULT 'draft',
  language_code VARCHAR(10) DEFAULT 'ja',  -- BCP 47
  file_input_id UUID,  -- file_inputs.idを参照（論理的）
  ai_generated BOOLEAN DEFAULT FALSE,
  embedding vector(1536),  -- pgvector
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  bad_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, public_id)
);

CREATE UNIQUE INDEX idx_exams_public_id ON exams(public_id);
CREATE INDEX idx_exams_subject_id ON exams(subject_id);
CREATE INDEX idx_exams_teacher_id ON exams(teacher_id);
CREATE INDEX idx_exams_uploader_id ON exams(uploader_id);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_academic_year ON exams(academic_year, semester);
CREATE INDEX idx_exams_embedding_hnsw ON exams USING hnsw(embedding vector_cosine_ops);
```

**設計注記:**
- 複合主キー (id, public_id) 採用
- ベクトル埋め込みでセマンティック検索対応
- view_count等のカウンターはedumintSocialから非同期更新

#### **questions (問題)**

問題情報を管理します。UUID + NanoID複合主キー採用。

```sql
CREATE TABLE questions (
  id UUID DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL,  -- NanoID
  exam_id UUID NOT NULL,  -- exams.idを参照（論理的）
  sort_order INT NOT NULL,  -- 問題の順序（v7.0.0: question_number廃止）
  question_type question_type_enum NOT NULL,
  question_text TEXT NOT NULL,
  question_image_url VARCHAR(512),
  options JSONB,  -- 選択肢（タイプに応じて）
  correct_answer JSONB NOT NULL,
  explanation TEXT,
  difficulty_level difficulty_level_enum DEFAULT 'standard',
  points DECIMAL(5,2) DEFAULT 1.0,
  estimated_time_seconds INT,
  embedding vector(1536),
  language_code VARCHAR(10) DEFAULT 'ja',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, public_id),
  UNIQUE(exam_id, sort_order)
);

CREATE UNIQUE INDEX idx_questions_public_id ON questions(public_id);
CREATE INDEX idx_questions_exam_id ON questions(exam_id, sort_order);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_embedding_hnsw ON questions USING hnsw(embedding vector_cosine_ops);
```

**設計注記:**
- sort_orderで問題の順序を管理（question_number廃止）
- 複合主キー採用で外部参照を強化

#### **sub_questions (小問)**

小問情報を管理します。UUID + NanoID複合主キー採用。

```sql
CREATE TABLE sub_questions (
  id UUID DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL,  -- NanoID
  question_id UUID NOT NULL,  -- questions.idを参照（論理的）
  sort_order INT NOT NULL,  -- 小問の順序（v7.0.0: sub_number廃止）
  sub_question_text TEXT NOT NULL,
  sub_question_image_url VARCHAR(512),
  options JSONB,
  correct_answer JSONB NOT NULL,
  explanation TEXT,
  points DECIMAL(5,2) DEFAULT 0.5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, public_id),
  UNIQUE(question_id, sort_order)
);

CREATE UNIQUE INDEX idx_sub_questions_public_id ON sub_questions(public_id);
CREATE INDEX idx_sub_questions_question_id ON sub_questions(question_id, sort_order);
```

#### **keywords (キーワード)**

コンテンツに紐づくキーワードを管理します。UUID + NanoID複合主キー採用。

```sql
CREATE TABLE keywords (
  id UUID DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL,  -- NanoID
  name VARCHAR(100) NOT NULL,
  language_code VARCHAR(10) DEFAULT 'ja',
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, public_id),
  UNIQUE(name, language_code)
);

CREATE UNIQUE INDEX idx_keywords_public_id ON keywords(public_id);
CREATE INDEX idx_keywords_name ON keywords(name);
CREATE INDEX idx_keywords_usage_count ON keywords(usage_count DESC);
```

#### **exam_keywords (試験キーワード関連付け)**

試験とキーワードの関連を管理します。

```sql
CREATE TABLE exam_keywords (
  exam_id UUID NOT NULL,  -- exams.idを参照（論理的）
  keyword_id UUID NOT NULL,  -- keywords.idを参照（論理的）
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (exam_id, keyword_id)
);

CREATE INDEX idx_exam_keywords_exam_id ON exam_keywords(exam_id);
CREATE INDEX idx_exam_keywords_keyword_id ON exam_keywords(keyword_id);
```

### 5.2 ログテーブル (DB分離設計)

**物理DB:** `edumint_content_logs`

#### **content_logs**

コンテンツ変更履歴を記録します。

```sql
CREATE TABLE content_logs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  entity_type VARCHAR(50) NOT NULL,  -- 'exam', 'question', 'institution', etc.
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,  -- 'create', 'update', 'delete', 'publish', 'archive'
  changed_fields JSONB,
  old_values JSONB,
  new_values JSONB,
  changed_by_user_id UUID,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_content_logs_entity ON content_logs(entity_type, entity_id, created_at);
CREATE INDEX idx_content_logs_action ON content_logs(action, created_at);
CREATE INDEX idx_content_logs_user ON content_logs(changed_by_user_id, created_at);
```

**設計注記:**
- 全コンテンツの変更履歴を一元管理
- 監査証跡・バージョン管理用途
- 本体DBと分離してパフォーマンス確保
- パーティショニングで大量データに対応

---

## **7. edumintFile (ファイル管理サービス)**

### 概要

edumintFile マイクロサービスの永続化データモデル定義。
システムが管理するファイル（OCR入力画像、試験ソース等）と通報証拠ファイルのメタデータを管理し、Google Cloud Storage（GCS）への物理ファイル保存と連携する。

**重要な前提**:
- ユーザーは通常、自分がアップロードしたファイルに直接アクセス**できない**
- ユーザーがアクセス可能なファイルは**通報証拠ファイル（report_attachment）のみ**
- `exam_raw`, `source_raw` はLLM学習と通報時の確認用途専用
- これらのファイルは管理者と自動化システムのみがアクセス可能

### 設計変更点（v7.0.2）

- **PostgreSQL 18.1、pgx v5.8.0、Atlas v1.0.0、sqlc 1.30.0対応**
- **全テーブルの主キーをuuidv7()で統一（gen_random_uuid()廃止）**
- **file_type_enum導入によるファイル種別の型安全化**
- **exam_raw, source_raw テーブルの明示的分離**
- **report_attachment テーブルの追加（通報証拠専用）**
- **アクセス制御の明確化（ユーザー直接アクセス不可の原則）**
- **ログテーブルを物理DB分離（edumint_file_logs）**

### 所有サービス

**edumintFile**: ファイルメタデータ管理・GCS連携・OCR処理連携

### 技術スタック

| 項目 | バージョン | 備考 |
|:---|:---|:---|
| PostgreSQL | 18.1 | uuidv7()、非同期I/O対応 |
| pgx | v5.8.0 | Go PostgreSQLドライバ |
| Atlas | v1.0.0 | スキーママイグレーション |
| sqlc | 1.30.0 | Go型生成 |
| Google Cloud Storage | - | 物理ファイル保存 |

### 7.1 ファイル種別ENUM

```sql
CREATE TYPE file_type_enum AS ENUM (
  'exam_raw',          -- 試験ソース生ファイル（PDF/画像）
  'source_raw',        -- 問題ソース生ファイル（手書き/OCR入力）
  'report_attachment'  -- 通報証拠ファイル（ユーザーアクセス可能）
);
```

**設計注記:**
- `exam_raw`: 試験問題の元ファイル（PDF、画像など）
- `source_raw`: OCR入力元となる手書き画像など
- `report_attachment`: 通報時にユーザーが添付する証拠ファイル
- ユーザーが直接ダウンロード可能なのは `report_attachment` **のみ**

### 7.2 本体DBテーブル (DDL例)

#### **exam_raw (試験ソース生ファイル)**

試験問題の元となる生ファイル（PDF、画像等）のメタデータを管理します。

```sql
CREATE TABLE exam_raw (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(16) NOT NULL UNIQUE,  -- NanoID
  exam_id UUID NOT NULL,  -- exams.idを参照（論理的）
  uploader_id UUID NOT NULL,  -- users.idを参照（論理的）
  file_type file_type_enum NOT NULL DEFAULT 'exam_raw',
  original_filename VARCHAR(512) NOT NULL,
  stored_filename VARCHAR(512) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  storage_path VARCHAR(1024) NOT NULL,
  bucket_name VARCHAR(255) NOT NULL DEFAULT 'edumint-exam-raw',
  file_hash VARCHAR(64) NOT NULL,  -- SHA-256
  ocr_processed BOOLEAN DEFAULT FALSE,
  ocr_text TEXT,
  language_code VARCHAR(10) DEFAULT 'ja',
  access_level VARCHAR(20) DEFAULT 'admin_only',  -- 管理者・システムのみアクセス可
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_exam_raw_file_type CHECK (file_type = 'exam_raw')
);

CREATE INDEX idx_exam_raw_public_id ON exam_raw(public_id);
CREATE INDEX idx_exam_raw_exam_id ON exam_raw(exam_id);
CREATE INDEX idx_exam_raw_uploader_id ON exam_raw(uploader_id);
CREATE INDEX idx_exam_raw_file_hash ON exam_raw(file_hash);
CREATE INDEX idx_exam_raw_ocr_processed ON exam_raw(ocr_processed);
CREATE INDEX idx_exam_raw_created_at ON exam_raw(created_at DESC);
```

**設計注記:**
- 試験問題の元ファイルを保存
- アクセス制御: 管理者と自動化システムのみ
- LLM学習データとして活用
- 通報時の検証用ソースとして参照
- ユーザーは**直接ダウンロード不可**

#### **source_raw (問題ソース生ファイル)**

問題作成の元となる生ファイル（手書き画像、OCR入力元等）のメタデータを管理します。

```sql
CREATE TABLE source_raw (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(16) NOT NULL UNIQUE,  -- NanoID
  question_id UUID,  -- questions.idを参照（論理的）
  sub_question_id UUID,  -- sub_questions.idを参照（論理的）
  uploader_id UUID NOT NULL,  -- users.idを参照（論理的）
  file_type file_type_enum NOT NULL DEFAULT 'source_raw',
  original_filename VARCHAR(512) NOT NULL,
  stored_filename VARCHAR(512) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  storage_path VARCHAR(1024) NOT NULL,
  bucket_name VARCHAR(255) NOT NULL DEFAULT 'edumint-source-raw',
  file_hash VARCHAR(64) NOT NULL,  -- SHA-256
  ocr_processed BOOLEAN DEFAULT FALSE,
  ocr_text TEXT,
  language_code VARCHAR(10) DEFAULT 'ja',
  access_level VARCHAR(20) DEFAULT 'admin_only',  -- 管理者・システムのみアクセス可
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_source_raw_file_type CHECK (file_type = 'source_raw'),
  CONSTRAINT chk_source_raw_question_ref CHECK (
    (question_id IS NOT NULL AND sub_question_id IS NULL) OR
    (question_id IS NULL AND sub_question_id IS NOT NULL)
  )
);

CREATE INDEX idx_source_raw_public_id ON source_raw(public_id);
CREATE INDEX idx_source_raw_question_id ON source_raw(question_id);
CREATE INDEX idx_source_raw_sub_question_id ON source_raw(sub_question_id);
CREATE INDEX idx_source_raw_uploader_id ON source_raw(uploader_id);
CREATE INDEX idx_source_raw_file_hash ON source_raw(file_hash);
CREATE INDEX idx_source_raw_ocr_processed ON source_raw(ocr_processed);
CREATE INDEX idx_source_raw_created_at ON source_raw(created_at DESC);
```

**設計注記:**
- 問題・小問の元ファイルを保存
- OCR処理の入力元として使用
- question_id または sub_question_id のいずれか必須
- アクセス制御: 管理者と自動化システムのみ
- LLM学習データとして活用
- ユーザーは**直接ダウンロード不可**

#### **report_attachment (通報証拠ファイル)**

通報時にユーザーが添付する証拠ファイルのメタデータを管理します。

```sql
CREATE TABLE report_attachment (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(16) NOT NULL UNIQUE,  -- NanoID
  report_id UUID NOT NULL,  -- reports.idを参照（論理的）
  uploader_id UUID NOT NULL,  -- users.idを参照（論理的）
  file_type file_type_enum NOT NULL DEFAULT 'report_attachment',
  original_filename VARCHAR(512) NOT NULL,
  stored_filename VARCHAR(512) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  storage_path VARCHAR(1024) NOT NULL,
  bucket_name VARCHAR(255) NOT NULL DEFAULT 'edumint-report-attachments',
  file_hash VARCHAR(64) NOT NULL,  -- SHA-256
  access_level VARCHAR(20) DEFAULT 'user_accessible',  -- ユーザーアクセス可能
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_report_attachment_file_type CHECK (file_type = 'report_attachment')
);

CREATE INDEX idx_report_attachment_public_id ON report_attachment(public_id);
CREATE INDEX idx_report_attachment_report_id ON report_attachment(report_id);
CREATE INDEX idx_report_attachment_uploader_id ON report_attachment(uploader_id);
CREATE INDEX idx_report_attachment_file_hash ON report_attachment(file_hash);
CREATE INDEX idx_report_attachment_created_at ON report_attachment(created_at DESC);
```

**設計注記:**
- 通報時の証拠ファイルを保存
- **ユーザーがアクセス可能な唯一のファイル種別**
- 通報者と管理者がダウンロード可能
- 通報の妥当性検証に使用

#### **file_upload_jobs (ファイルアップロードジョブ)**

ファイルアップロード処理のジョブ状態を管理します。

```sql
CREATE TABLE file_upload_jobs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  file_id UUID NOT NULL,  -- exam_raw, source_raw, report_attachmentのいずれかを参照
  file_type file_type_enum NOT NULL,
  job_id UUID,  -- jobs.idを参照（論理的）
  status job_status_enum DEFAULT 'pending',
  progress_percentage INT DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_file_upload_jobs_file_id ON file_upload_jobs(file_id, file_type);
CREATE INDEX idx_file_upload_jobs_job_id ON file_upload_jobs(job_id);
CREATE INDEX idx_file_upload_jobs_status ON file_upload_jobs(status);
CREATE INDEX idx_file_upload_jobs_created_at ON file_upload_jobs(created_at DESC);
```

**設計注記:**
- ファイルアップロードの非同期処理を管理
- file_type で対象テーブルを識別
- ジョブステータスで処理進捗を追跡

### 7.3 ログテーブル (DB分離設計)

**物理DB:** `edumint_file_logs`

#### **file_logs (ファイル操作ログ)**

ファイル操作履歴を記録します。

```sql
CREATE TABLE file_logs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  file_id UUID NOT NULL,
  file_type file_type_enum NOT NULL,
  action VARCHAR(50) NOT NULL,  -- 'upload', 'download', 'delete', 'ocr_complete', 'access_denied'
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  access_result VARCHAR(20),  -- 'allowed', 'denied'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_file_logs_file_id ON file_logs(file_id, file_type, created_at);
CREATE INDEX idx_file_logs_action ON file_logs(action, created_at);
CREATE INDEX idx_file_logs_user_id ON file_logs(user_id, created_at);
CREATE INDEX idx_file_logs_access_result ON file_logs(access_result, created_at);
```

**設計注記:**
- ファイル操作の監査証跡
- アクセス制御違反の検出
- セキュリティ分析用ログ
- パーティショニングで大量データに対応

### 7.4 アクセス制御設計

#### アクセス権限マトリクス

| ファイル種別 | ユーザー | 管理者 | システム | 用途 |
|:---|:---:|:---:|:---:|:---|
| exam_raw | ❌ | ✅ | ✅ | LLM学習・通報検証 |
| source_raw | ❌ | ✅ | ✅ | LLM学習・通報検証 |
| report_attachment | ✅ | ✅ | ✅ | 通報証拠（通報者のみ） |

#### アクセス制御の実装

```sql
-- アクセス制御チェック関数例
CREATE OR REPLACE FUNCTION check_file_access(
  p_file_type file_type_enum,
  p_user_id UUID,
  p_file_id UUID,
  p_is_admin BOOLEAN
) RETURNS BOOLEAN AS $$
BEGIN
  -- 管理者は全ファイルにアクセス可能
  IF p_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- report_attachmentのみユーザーアクセス可（通報者のみ）
  IF p_file_type = 'report_attachment' THEN
    RETURN EXISTS (
      SELECT 1 FROM report_attachment
      WHERE id = p_file_id AND uploader_id = p_user_id
    );
  END IF;
  
  -- exam_raw, source_rawはユーザーアクセス不可
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;
```

### 7.5 GCS連携設計

#### バケット構成

```
edumint-exam-raw/           # 試験ソースファイル
  ├── {year}/
  │   └── {month}/
  │       └── {uuid}.{ext}
  
edumint-source-raw/         # 問題ソースファイル
  ├── {year}/
  │   └── {month}/
  │       └── {uuid}.{ext}
  
edumint-report-attachments/ # 通報証拠ファイル
  ├── {year}/
  │   └── {month}/
  │       └── {uuid}.{ext}
```

#### ストレージクラス設定

| バケット | ストレージクラス | 保持期間 | 理由 |
|:---|:---|:---|:---|
| exam-raw | STANDARD | 永続 | LLM学習データ |
| source-raw | STANDARD | 永続 | LLM学習データ |
| report-attachments | NEARLINE | 1年 | 通報証拠（低頻度アクセス） |

### 7.6 OCR処理連携

```sql
-- OCR処理完了時の更新例
UPDATE exam_raw
SET
  ocr_processed = TRUE,
  ocr_text = :ocr_result_text,
  updated_at = CURRENT_TIMESTAMP
WHERE id = :file_id;
```

**OCR処理フロー:**
1. ファイルアップロード → GCS保存
2. Kafka イベント発行（edumintAiWorker へ）
3. OCR処理実行（Vision API等）
4. 結果をDBに保存（ocr_text）
5. ベクトル化（検索インデックス更新）

### 7.7 セキュリティ対策

#### ファイルサイズ制限

```sql
ALTER TABLE exam_raw ADD CONSTRAINT chk_exam_raw_file_size
  CHECK (file_size_bytes <= 104857600);  -- 100MB

ALTER TABLE source_raw ADD CONSTRAINT chk_source_raw_file_size
  CHECK (file_size_bytes <= 52428800);   -- 50MB

ALTER TABLE report_attachment ADD CONSTRAINT chk_report_attachment_file_size
  CHECK (file_size_bytes <= 10485760);   -- 10MB
```

#### MIMEタイプ制限

```sql
-- exam_raw: PDF及び画像ファイルのみ許可
ALTER TABLE exam_raw ADD CONSTRAINT chk_exam_raw_mime_type
  CHECK (mime_type IN (
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'image/heic'
  ));

-- source_raw: 画像ファイルのみ許可
ALTER TABLE source_raw ADD CONSTRAINT chk_source_raw_mime_type
  CHECK (mime_type IN (
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic'
  ));

-- report_attachment: 画像及びPDFのみ許可
ALTER TABLE report_attachment ADD CONSTRAINT chk_report_attachment_mime_type
  CHECK (mime_type IN (
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ));
```

#### ファイルハッシュによる重複検出

```sql
-- 重複ファイルの検出
SELECT file_hash, COUNT(*) as duplicate_count
FROM (
  SELECT file_hash FROM exam_raw
  UNION ALL
  SELECT file_hash FROM source_raw
  UNION ALL
  SELECT file_hash FROM report_attachment
) AS all_files
GROUP BY file_hash
HAVING COUNT(*) > 1;
```

### 7.8 Atlas HCL + sqlc 連携

#### Atlas HCL スキーマ定義例

```hcl
// schema.hcl - edumintFile
table "exam_raw" {
  schema = schema.edumint_files
  
  column "id" {
    type = uuid
    default = sql("uuidv7()")
  }
  column "public_id" {
    type = varchar(16)
    null = false
  }
  column "file_type" {
    type = enum.file_type_enum
    default = "exam_raw"
  }
  // ... 他のカラム定義
  
  primary_key {
    columns = [column.id]
  }
  
  index "idx_exam_raw_public_id" {
    unique = true
    columns = [column.public_id]
  }
}
```

#### sqlc クエリ例

```sql
-- name: CreateExamRaw :one
INSERT INTO exam_raw (
  public_id,
  exam_id,
  uploader_id,
  file_type,
  original_filename,
  stored_filename,
  file_size_bytes,
  mime_type,
  storage_path,
  bucket_name,
  file_hash
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
) RETURNING *;

-- name: GetExamRawByID :one
SELECT * FROM exam_raw
WHERE id = $1 AND is_active = TRUE;

-- name: ListExamRawByExamID :many
SELECT * FROM exam_raw
WHERE exam_id = $1 AND is_active = TRUE
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: UpdateOCRResult :exec
UPDATE exam_raw
SET
  ocr_processed = TRUE,
  ocr_text = $2,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1;
```

### 7.9 Goインテグレーション例

```go
// models/file.go
type FileType string

const (
    FileTypeExamRaw         FileType = "exam_raw"
    FileTypeSourceRaw       FileType = "source_raw"
    FileTypeReportAttachment FileType = "report_attachment"
)

// services/file_service.go
type FileService struct {
    queries *db.Queries
    storage *gcs.Client
}

func (s *FileService) UploadExamRaw(
    ctx context.Context,
    examID uuid.UUID,
    uploaderID uuid.UUID,
    file io.Reader,
    filename string,
) (*db.ExamRaw, error) {
    // 1. GCSにアップロード
    storedPath, err := s.uploadToGCS(ctx, file, "edumint-exam-raw", filename)
    if err != nil {
        return nil, err
    }
    
    // 2. DBにメタデータ保存
    examRaw, err := s.queries.CreateExamRaw(ctx, db.CreateExamRawParams{
        PublicID:        nanoid.New(),
        ExamID:          examID,
        UploaderID:      uploaderID,
        FileType:        string(FileTypeExamRaw),
        OriginalFilename: filename,
        StoredFilename:  storedPath,
        // ... その他のパラメータ
    })
    if err != nil {
        return nil, err
    }
    
    // 3. OCR処理用Kafkaイベント発行
    s.publishOCREvent(ctx, examRaw.ID)
    
    return &examRaw, nil
}

func (s *FileService) CheckFileAccess(
    ctx context.Context,
    fileType FileType,
    fileID uuid.UUID,
    userID uuid.UUID,
    isAdmin bool,
) (bool, error) {
    // アクセス制御ロジック
    if isAdmin {
        return true, nil
    }
    
    if fileType == FileTypeReportAttachment {
        // 通報者のみアクセス可
        attachment, err := s.queries.GetReportAttachmentByID(ctx, fileID)
        if err != nil {
            return false, err
        }
        return attachment.UploaderID == userID, nil
    }
    
    // exam_raw, source_rawはユーザーアクセス不可
    return false, nil
}
```

### 7.10 監査・運用設計

#### 監査ログ記録

```sql
-- アクセス拒否の記録
INSERT INTO file_logs (
  file_id,
  file_type,
  action,
  user_id,
  ip_address,
  access_result,
  metadata
) VALUES (
  :file_id,
  :file_type,
  'access_denied',
  :user_id,
  :ip_address,
  'denied',
  jsonb_build_object('reason', 'insufficient_permission')
);
```

#### 定期メンテナンス

```sql
-- 非アクティブファイルの削除候補抽出
SELECT id, public_id, original_filename, file_size_bytes
FROM exam_raw
WHERE is_active = FALSE
  AND updated_at < CURRENT_TIMESTAMP - INTERVAL '90 days'
ORDER BY updated_at;
```

---

---

## **8. edumintSearch (検索サービス)**

### 設計変更点（v7.0.0）

- 全テーブルの主キーをUUIDに変更
- ログテーブルを物理DB分離
- Elasticsearchインデックス設計を更新

### 7.1 本体DBテーブル (DDL例)

#### **subject_terms**

科目名の検索用語を管理します。

```sql
CREATE TABLE subject_terms (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  subject_id UUID NOT NULL,  -- subjects.idを参照（論理的）
  term VARCHAR(255) NOT NULL,
  term_type VARCHAR(50),  -- 'official_name', 'alias', 'abbreviation'
  language_code VARCHAR(10) DEFAULT 'ja',
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subject_id, term, language_code)
);

CREATE INDEX idx_subject_terms_subject_id ON subject_terms(subject_id);
CREATE INDEX idx_subject_terms_term ON subject_terms(term);
CREATE INDEX idx_subject_terms_usage_count ON subject_terms(usage_count DESC);
```

#### **institution_terms**

機関名の検索用語を管理します。

```sql
CREATE TABLE institution_terms (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id UUID NOT NULL,  -- institutions.idを参照（論理的）
  term VARCHAR(255) NOT NULL,
  term_type VARCHAR(50),
  language_code VARCHAR(10) DEFAULT 'ja',
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(institution_id, term, language_code)
);

CREATE INDEX idx_institution_terms_institution_id ON institution_terms(institution_id);
CREATE INDEX idx_institution_terms_term ON institution_terms(term);
CREATE INDEX idx_institution_terms_usage_count ON institution_terms(usage_count DESC);
```

#### **faculty_terms**

学部名の検索用語を管理します。

```sql
CREATE TABLE faculty_terms (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  faculty_id UUID NOT NULL,  -- faculties.idを参照（論理的）
  term VARCHAR(255) NOT NULL,
  term_type VARCHAR(50),
  language_code VARCHAR(10) DEFAULT 'ja',
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(faculty_id, term, language_code)
);

CREATE INDEX idx_faculty_terms_faculty_id ON faculty_terms(faculty_id);
CREATE INDEX idx_faculty_terms_term ON faculty_terms(term);
CREATE INDEX idx_faculty_terms_usage_count ON faculty_terms(usage_count DESC);
```

#### **teacher_terms**

教員名の検索用語を管理します。

```sql
CREATE TABLE teacher_terms (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  teacher_id UUID NOT NULL,  -- teachers.idを参照（論理的）
  term VARCHAR(255) NOT NULL,
  term_type VARCHAR(50),
  language_code VARCHAR(10) DEFAULT 'ja',
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(teacher_id, term, language_code)
);

CREATE INDEX idx_teacher_terms_teacher_id ON teacher_terms(teacher_id);
CREATE INDEX idx_teacher_terms_term ON teacher_terms(term);
CREATE INDEX idx_teacher_terms_usage_count ON teacher_terms(usage_count DESC);
```

#### **term_generation_jobs**

用語生成ジョブを管理します。

```sql
CREATE TABLE term_generation_jobs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  entity_type VARCHAR(50) NOT NULL,  -- 'subject', 'institution', 'faculty', 'teacher'
  entity_id UUID NOT NULL,
  status job_status_enum DEFAULT 'pending',
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_term_generation_jobs_entity ON term_generation_jobs(entity_type, entity_id);
CREATE INDEX idx_term_generation_jobs_status ON term_generation_jobs(status);
```

#### **term_generation_candidates**

AI生成された用語候補を管理します。

```sql
CREATE TABLE term_generation_candidates (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  job_id UUID NOT NULL REFERENCES term_generation_jobs(id) ON DELETE CASCADE,
  term VARCHAR(255) NOT NULL,
  confidence_score DECIMAL(5,4),
  source VARCHAR(50),  -- 'ai_generated', 'user_suggested'
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by_user_id UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_term_generation_candidates_job_id ON term_generation_candidates(job_id);
CREATE INDEX idx_term_generation_candidates_approved ON term_generation_candidates(is_approved);
```

### 7.2 ログテーブル (DB分離設計)

**物理DB:** `edumint_search_logs`

#### **search_logs**

検索クエリ履歴を記録します。

```sql
CREATE TABLE search_logs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID,  -- NULL許可（非ログインユーザー）
  query_text TEXT NOT NULL,
  search_type VARCHAR(50),  -- 'keyword', 'semantic', 'autocomplete'
  filters JSONB,
  result_count INT,
  clicked_result_ids UUID[],
  response_time_ms INT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_search_logs_user_id ON search_logs(user_id, created_at);
CREATE INDEX idx_search_logs_query_text ON search_logs USING gin(to_tsvector('japanese', query_text));
CREATE INDEX idx_search_logs_created_at ON search_logs(created_at);
```

### 7.3 Elasticsearch設計

#### **exams インデックス**

```json
{
  "mappings": {
    "properties": {
      "exam_id": { "type": "keyword" },
      "public_id": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "kuromoji",
        "fields": {
          "keyword": { "type": "keyword" },
          "ngram": {
            "type": "text",
            "analyzer": "ngram_analyzer"
          }
        }
      },
      "subject_name": { "type": "text", "analyzer": "kuromoji" },
      "institution_name": { "type": "text", "analyzer": "kuromoji" },
      "faculty_name": { "type": "text", "analyzer": "kuromoji" },
      "department_name": { "type": "text", "analyzer": "kuromoji" },
      "teacher_name": { "type": "text", "analyzer": "kuromoji" },
      "academic_year": { "type": "integer" },
      "semester": { "type": "keyword" },
      "exam_type": { "type": "keyword" },
      "status": { "type": "keyword" },
      "keywords": { "type": "keyword" },
      "embedding": {
        "type": "dense_vector",
        "dims": 1536,
        "index": true,
        "similarity": "cosine"
      },
      "view_count": { "type": "integer" },
      "like_count": { "type": "integer" },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" }
    }
  }
}
```

**設計注記:**
- Kuromojiアナライザーで日本語形態素解析
- N-gramで部分一致検索対応
- dense_vectorでセマンティック検索対応
- Debezium CDCで自動同期

---

## **8. edumintAiWorker (AI処理サービス)**

### 設計変更点（v7.0.0）

- **物理DB完全削除**
- ステートレス設計に移行
- ログはELKスタック（Elasticsearch, Logstash, Kibana）で管理

### 設計方針

edumintAiWorkerは以下の理由により、PostgreSQL物理DBを持ちません：

1. **ステートレス設計**: AI処理は入力→処理→出力の単方向フロー
2. **スケーラビリティ**: DBレスでコンテナ水平スケーリングが容易
3. **処理速度**: DBアクセスなしで処理遅延を最小化
4. **ログ要件**: 処理ログはELKスタックで集中管理

### データフロー

```
[Kafka] gateway.jobs
   ↓
[edumintAiWorker] AI処理（ステートレス）
   ↓
[Kafka] ai.results → [edumintContent] 結果反映
   ↓
[ELK Stack] ログ収集・分析
```

### ログ管理（ELK）

- **Elasticsearch**: ログ保存・検索
- **Logstash**: ログパイプライン
- **Kibana**: ログ可視化・ダッシュボード

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "info",
  "service": "edumintAiWorker",
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "job_type": "ocr_processing",
  "file_id": "abc12345",
  "processing_time_ms": 2500,
  "model": "gemini-vision-1.5",
  "status": "completed",
  "metadata": {
    "pages_processed": 10,
    "confidence_score": 0.95
  }
}
```

**設計注記:**
- DBなしでシステム全体のI/O負荷を削減
- AI処理の状態はKafkaイベントで追跡
- 長期ログ分析はElasticsearchで実施

---

## **10. edumintSocial (ソーシャルサービス)**

### 設計変更点（v7.0.0）

- 全テーブルの主キーをUUIDに変更
- **ログテーブル不要**: 既存テーブルがログの役割を兼ねる
- exam_badsテーブル追加（いいねの逆）

### 9.1 本体DBテーブル (DDL例)

#### **exam_likes**

試験へのいいね情報を管理します。

```sql
CREATE TABLE exam_likes (
  user_id UUID NOT NULL,  -- users.idを参照（論理的）
  exam_id UUID NOT NULL,  -- exams.idを参照（論理的）
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, exam_id)
);

CREATE INDEX idx_exam_likes_user_id ON exam_likes(user_id, created_at DESC);
CREATE INDEX idx_exam_likes_exam_id ON exam_likes(exam_id, created_at DESC);
```

#### **exam_bads**

試験への低評価情報を管理します。

```sql
CREATE TABLE exam_bads (
  user_id UUID NOT NULL,  -- users.idを参照（論理的）
  exam_id UUID NOT NULL,  -- exams.idを参照（論理的）
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, exam_id)
);

CREATE INDEX idx_exam_bads_user_id ON exam_bads(user_id, created_at DESC);
CREATE INDEX idx_exam_bads_exam_id ON exam_bads(exam_id, created_at DESC);
```

#### **exam_comments**

試験へのコメントを管理します。

```sql
CREATE TABLE exam_comments (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  exam_id UUID NOT NULL,  -- exams.idを参照（論理的）
  user_id UUID NOT NULL,  -- users.idを参照（論理的）
  parent_comment_id UUID REFERENCES exam_comments(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exam_comments_exam_id ON exam_comments(exam_id, created_at DESC);
CREATE INDEX idx_exam_comments_user_id ON exam_comments(user_id, created_at DESC);
CREATE INDEX idx_exam_comments_parent_id ON exam_comments(parent_comment_id);
```

#### **exam_views**

試験の閲覧履歴を管理します。

```sql
CREATE TABLE exam_views (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  exam_id UUID NOT NULL,  -- exams.idを参照（論理的）
  user_id UUID,  -- NULL許可（非ログインユーザー）
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  view_duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exam_views_exam_id ON exam_views(exam_id, created_at);
CREATE INDEX idx_exam_views_user_id ON exam_views(user_id, created_at);
CREATE INDEX idx_exam_views_session_id ON exam_views(session_id);
```

**設計注記:**
- これらのテーブル自体がアクティビティログの役割を果たす
- 別途ログテーブルは不要
- exam_viewsは分析・推薦システムで利用

---

## **11. edumintMonetizeWallet (ウォレット管理サービス)**

### 設計変更点（v7.0.0）

- 全テーブルの主キーをUUIDに変更
- ログテーブルを物理DB分離
- **法的要件**: ログは7年間保持（金融関連法令対応）

### 10.1 本体DBテーブル (DDL例)

#### **wallets**

ユーザーのウォレット情報を管理します。

```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID NOT NULL UNIQUE,  -- users.idを参照（論理的）
  balance DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0),
  currency VARCHAR(3) DEFAULT 'MNT',  -- MintCoin
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_balance ON wallets(balance);
```

#### **wallet_transactions**

ウォレットトランザクション情報を管理します。

```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(16) NOT NULL UNIQUE,  -- NanoID
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  transaction_type transaction_type_enum NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  balance_before DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  related_entity_type VARCHAR(50),  -- 'exam', 'ad_view', 'referral', etc.
  related_entity_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_transactions_public_id ON wallet_transactions(public_id);
CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id, created_at DESC);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(transaction_type, created_at);
CREATE INDEX idx_wallet_transactions_related_entity ON wallet_transactions(related_entity_type, related_entity_id);
```

### 10.2 ログテーブル (DB分離設計、法的要件7年保持)

**物理DB:** `edumint_wallet_logs` (特別保持ポリシー)

#### **wallet_logs**

ウォレット操作履歴を記録します。**法令により7年間保持義務あり**。

```sql
CREATE TABLE wallet_logs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  transaction_id UUID NOT NULL,  -- wallet_transactions.idを参照
  wallet_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,  -- 'credit', 'debit', 'refund', 'admin_adjustment'
  amount DECIMAL(15,2) NOT NULL,
  balance_snapshot DECIMAL(15,2) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  audit_trail JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  retention_until DATE NOT NULL  -- 7年後の日付
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_wallet_logs_transaction_id ON wallet_logs(transaction_id);
CREATE INDEX idx_wallet_logs_wallet_id ON wallet_logs(wallet_id, created_at);
CREATE INDEX idx_wallet_logs_user_id ON wallet_logs(user_id, created_at);
CREATE INDEX idx_wallet_logs_retention_until ON wallet_logs(retention_until);
```

**設計注記:**
- 金融関連法令により7年間の記録保持が必要
- retention_untilカラムで保持期限を明示管理
- 自動削除ポリシーで期限後に削除
- 改ざん検知のためaudit_trailに署名ハッシュを含む
- パーティショニングで長期データを効率管理

---

## **11. edumintRevenue (収益分配サービス)**

### 設計変更点（v7.0.0）

- 全テーブルの主キーをUUIDに変更
- ログテーブルを物理DB分離

### 11.1 本体DBテーブル (DDL例)

#### **revenue_reports**

収益レポートを管理します。

```sql
CREATE TABLE revenue_reports (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(16) NOT NULL UNIQUE,  -- NanoID
  user_id UUID NOT NULL,  -- users.idを参照（論理的）
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  total_views INT DEFAULT 0,
  total_ad_impressions INT DEFAULT 0,
  total_revenue DECIMAL(15,2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'calculated', 'paid'
  calculation_date TIMESTAMPTZ,
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, report_period_start, report_period_end)
);

CREATE INDEX idx_revenue_reports_public_id ON revenue_reports(public_id);
CREATE INDEX idx_revenue_reports_user_id ON revenue_reports(user_id, report_period_start);
CREATE INDEX idx_revenue_reports_status ON revenue_reports(status);
CREATE INDEX idx_revenue_reports_period ON revenue_reports(report_period_start, report_period_end);
```

#### **ad_impressions_agg**

広告表示集計データを管理します。

```sql
CREATE TABLE ad_impressions_agg (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  exam_id UUID NOT NULL,  -- exams.idを参照（論理的）
  user_id UUID NOT NULL,  -- コンテンツ所有者 users.idを参照（論理的）
  aggregation_date DATE NOT NULL,
  impression_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  estimated_revenue DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_id, aggregation_date)
);

CREATE INDEX idx_ad_impressions_agg_exam_id ON ad_impressions_agg(exam_id, aggregation_date);
CREATE INDEX idx_ad_impressions_agg_user_id ON ad_impressions_agg(user_id, aggregation_date);
CREATE INDEX idx_ad_impressions_agg_date ON ad_impressions_agg(aggregation_date);
```

### 11.2 ログテーブル (DB分離設計)

**物理DB:** `edumint_revenue_logs`

#### **revenue_logs**

収益計算履歴を記録します。

```sql
CREATE TABLE revenue_logs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  report_id UUID NOT NULL,  -- revenue_reports.idを参照
  user_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,  -- 'calculate', 'recalculate', 'payment_initiated', 'payment_completed'
  previous_amount DECIMAL(15,2),
  new_amount DECIMAL(15,2),
  reason TEXT,
  metadata JSONB,
  performed_by_user_id UUID,  -- 管理者IDなど
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_revenue_logs_report_id ON revenue_logs(report_id, created_at);
CREATE INDEX idx_revenue_logs_user_id ON revenue_logs(user_id, created_at);
CREATE INDEX idx_revenue_logs_action ON revenue_logs(action, created_at);
```

**設計注記:**
- 収益計算の監査証跡を保持
- 再計算時の差分を記録
- 本体DBと分離してパフォーマンス確保

---

## **12. edumintModeration (通報管理サービス)**

### 設計変更点（v7.0.0）

- content_report_reason_enumのID番号削除（文字列のみ）
- content_report_reasons, user_report_reasonsテーブル削除（ENUM型に統合）
- 全テーブルの主キーをUUIDに変更
- ログテーブルを物理DB分離

### 12.1 本体DBテーブル (DDL例)

#### **content_reports**

コンテンツ通報情報を管理します。

```sql
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(16) NOT NULL UNIQUE,  -- NanoID
  reporter_user_id UUID NOT NULL,  -- users.idを参照（論理的）
  reported_entity_type VARCHAR(50) NOT NULL,  -- 'exam', 'question', 'comment'
  reported_entity_id UUID NOT NULL,
  reason content_report_reason_enum NOT NULL,
  description TEXT,
  status report_status_enum DEFAULT 'pending',
  assigned_moderator_id UUID,  -- users.id (管理者)を参照（論理的）
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_reports_public_id ON content_reports(public_id);
CREATE INDEX idx_content_reports_reporter ON content_reports(reporter_user_id);
CREATE INDEX idx_content_reports_entity ON content_reports(reported_entity_type, reported_entity_id);
CREATE INDEX idx_content_reports_status ON content_reports(status, created_at);
CREATE INDEX idx_content_reports_moderator ON content_reports(assigned_moderator_id, status);
```

**設計注記:**
- content_report_reasonsテーブルは削除、ENUM型で管理
- ENUMから番号ID（1, 2, 3...）を削除、文字列のみ使用

#### **user_reports**

ユーザー通報情報を管理します。

```sql
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(16) NOT NULL UNIQUE,  -- NanoID
  reporter_user_id UUID NOT NULL,  -- users.idを参照（論理的）
  reported_user_id UUID NOT NULL,  -- users.idを参照（論理的）
  reason VARCHAR(50) NOT NULL,  -- 'spam', 'harassment', 'inappropriate_content', etc.
  description TEXT,
  status report_status_enum DEFAULT 'pending',
  assigned_moderator_id UUID,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CHECK (reporter_user_id != reported_user_id)
);

CREATE INDEX idx_user_reports_public_id ON user_reports(public_id);
CREATE INDEX idx_user_reports_reporter ON user_reports(reporter_user_id);
CREATE INDEX idx_user_reports_reported ON user_reports(reported_user_id);
CREATE INDEX idx_user_reports_status ON user_reports(status, created_at);
CREATE INDEX idx_user_reports_moderator ON user_reports(assigned_moderator_id, status);
```

#### **report_files**

通報に添付されたファイル情報を管理します。

```sql
CREATE TABLE report_files (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  report_type VARCHAR(50) NOT NULL,  -- 'content_report', 'user_report'
  report_id UUID NOT NULL,
  file_url VARCHAR(512) NOT NULL,
  file_type VARCHAR(50),
  file_size_bytes BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_files_report ON report_files(report_type, report_id);
```

### 12.2 ログテーブル (DB分離設計)

**物理DB:** `edumint_moderation_logs`

#### **moderation_logs**

モデレーション操作履歴を記録します。

```sql
CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  report_type VARCHAR(50) NOT NULL,  -- 'content_report', 'user_report'
  report_id UUID NOT NULL,
  moderator_user_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,  -- 'assign', 'investigate', 'resolve', 'ignore', 'escalate'
  previous_status report_status_enum,
  new_status report_status_enum,
  notes TEXT,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_moderation_logs_report ON moderation_logs(report_type, report_id, created_at);
CREATE INDEX idx_moderation_logs_moderator ON moderation_logs(moderator_user_id, created_at);
CREATE INDEX idx_moderation_logs_action ON moderation_logs(action, created_at);
```

**設計注記:**
- モデレーション操作の完全な監査証跡
- 管理者の行動を追跡
- 本体DBと分離して検索パフォーマンス確保

---

## **13. edumintGateway (ジョブゲートウェイ)**

### 設計変更点（v7.0.0）

- 全テーブルの主キーをUUIDに変更
- ログテーブルを物理DB分離

### 13.1 本体DBテーブル (DDL例)

#### **jobs**

ジョブ管理情報を管理します。

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(16) NOT NULL UNIQUE,  -- NanoID
  job_type job_type_enum NOT NULL,
  status job_status_enum DEFAULT 'pending',
  priority INT DEFAULT 0,
  payload JSONB NOT NULL,
  result JSONB,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by_user_id UUID,  -- users.idを参照（論理的）
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_public_id ON jobs(public_id);
CREATE INDEX idx_jobs_type ON jobs(job_type);
CREATE INDEX idx_jobs_status ON jobs(status, priority, created_at);
CREATE INDEX idx_jobs_created_by ON jobs(created_by_user_id);
CREATE INDEX idx_jobs_scheduled_at ON jobs(scheduled_at) WHERE status = 'pending';
```

### 13.2 ログテーブル (DB分離設計)

**物理DB:** `edumint_gateway_logs`

#### **job_logs**

ジョブ実行履歴を記録します。

```sql
CREATE TABLE job_logs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  job_id UUID NOT NULL,  -- jobs.idを参照
  status job_status_enum NOT NULL,
  message TEXT,
  metadata JSONB,
  execution_time_ms INT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_job_logs_job_id ON job_logs(job_id, created_at);
CREATE INDEX idx_job_logs_status ON job_logs(status, created_at);
```

**設計注記:**
- ジョブの状態遷移履歴を詳細に記録
- デバッグ・パフォーマンス分析に利用
- 本体DBと分離して高速クエリを実現

---

## **15. イベント駆動フロー**

### Kafkaトピック設計

EduMintでは以下のKafkaトピックを通じてマイクロサービス間でイベント駆動連携を実現します。

#### **主要トピック一覧**

| トピック名 | Producer | Consumer | イベント例 | 用途 |
|-----------|----------|----------|-----------|------|
| `auth.events` | edumintAuth | edumintUserProfile | `UserRegistered`, `UserLoggedIn`, `TokenRevoked` | 認証イベント通知 |
| `user.events` | edumintUserProfile | 各サービス | `UserProfileUpdated`, `UserDeleted` | ユーザー情報変更通知 |
| `content.lifecycle` | edumintContent | edumintSearch, edumintGateway | `ExamCreated`, `ExamPublished`, `ExamDeleted` | コンテンツライフサイクル |
| `content.jobs` | edumintFile | edumintGateway, edumintAiWorker | `FileUploaded`, `OCRRequested` | ファイル処理要求 |
| `ai.results` | edumintAiWorker | edumintContent, edumintGateway | `OCRCompleted`, `AIGenerationComplete` | AI処理結果 |
| `gateway.jobs` | edumintGateway | 各サービス | `JobAssigned`, `JobCompleted` | ジョブオーケストレーション |
| `gateway.job_status` | 各サービス | edumintGateway | `JobProgressUpdate`, `JobFailed` | ジョブステータス更新 |
| `search.indexed` | edumintSearch | - | `ContentIndexed` | 検索インデックス完了通知 |
| `search.term_generation` | edumintSearch | edumintAiWorker | `TermGenerationRequested` | 用語生成要求 |
| `content.feedback` | edumintSocial | edumintContent | `ExamLiked`, `ExamCommented`, `ExamViewed` | ソーシャルフィードバック |
| `monetization.transactions` | edumintMonetizeWallet | edumintRevenue | `CoinEarned`, `CoinSpent` | ウォレットトランザクション |
| `revenue.reports` | edumintRevenue | - | `RevenueCalculated`, `PaymentProcessed` | 収益レポート |
| `moderation.events` | edumintModeration | edumintContent, edumintUserProfile | `ContentReported`, `ContentTakenDown`, `UserBanned` | モデレーションイベント |

### イベントフロー例

#### **1. 試験アップロードフロー**

```
[ユーザー] ファイルアップロード
   ↓
[edumintFile] file_inputs作成
   ↓ (Kafka: content.jobs)
[edumintGateway] ジョブ作成 (job_type: 'file_upload')
   ↓ (Kafka: gateway.jobs)
[edumintAiWorker] OCR処理実行
   ↓ (Kafka: ai.results)
[edumintContent] exams/questions作成
   ↓ (Kafka: content.lifecycle)
[edumintSearch] Elasticsearch/PostgreSQLインデックス更新
```

#### **2. ソーシャルフィードバックフロー**

```
[ユーザー] 試験にいいね
   ↓
[edumintSocial] exam_likes作成
   ↓ (Kafka: content.feedback)
[edumintContent] exams.like_count更新
   ↓ (Kafka: content.lifecycle)
[edumintSearch] Elasticsearchランキング更新
   ↓
[edumintUserProfile] 通知作成 (ExamLiked)
```

#### **3. 収益分配フロー**

```
[日次バッチ] 広告インプレッション集計
   ↓
[edumintRevenue] ad_impressions_agg作成
   ↓ 収益計算
[edumintRevenue] revenue_reports作成
   ↓ (Kafka: monetization.transactions)
[edumintMonetizeWallet] wallet_transactions作成
   ↓
[edumintUserProfile] 通知作成 (CoinEarned)
```

### Debezium CDC連携

PostgreSQLの変更をDebezium CDCで捕捉し、Kafkaを経由してElasticsearchへリアルタイム同期します。

```
[PostgreSQL] examsテーブル更新
   ↓ (Debezium CDC)
[Kafka] dbz.edumint_content.exams
   ↓ (Kafka Connect)
[Elasticsearch] examsインデックス更新
```

**対象テーブル:**
- `institutions`, `faculties`, `departments`, `teachers`, `subjects`
- `exams`, `questions`, `sub_questions`, `keywords`

**設計注記:**
- リアルタイム同期により検索の鮮度を確保
- アプリケーションコードからの同期処理が不要
- Kafkaを経由することで、他サービスも変更を購読可能

---

## **15. データベース設計ガイドライン**

### 16.1 命名規則

#### **テーブル名**
- 小文字のスネークケース
- 複数形を使用（例: `users`, `exams`, `institutions`）
- マッピングテーブルは両テーブル名を結合（例: `exam_keywords`）

#### **カラム名**
- 小文字のスネークケース
- 主キー: `id` (UUID)
- 外部公開ID: `public_id` (NanoID)
- 外部キー: `{参照テーブル名の単数形}_id` (例: `user_id`, `exam_id`)
- 真偽値: `is_` または `has_` プレフィックス (例: `is_active`, `has_embedding`)
- タイムスタンプ: `_at` サフィックス (例: `created_at`, `updated_at`)

#### **ENUM型**
- `_enum` サフィックス (例: `user_role_enum`, `job_status_enum`)
- 値はスネークケース (例: `'single_choice'`, `'earn_upload'`)

### 16.2 主キー設計

#### **標準テーブル (UUID単独主キー)**

```sql
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,  -- NanoID 8文字
  -- 他のカラム
);
```

#### **特殊テーブル (UUID + NanoID複合主キー)**

以下のテーブルは複合主キーを採用：
- `teachers` (id, public_id)
- `exams` (id, public_id)
- `questions` (id, public_id)
- `sub_questions` (id, public_id)
- `keywords` (id, public_id)

```sql
CREATE TABLE special_table (
  id UUID DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL,
  PRIMARY KEY (id, public_id),
  -- 他のカラム
);

CREATE UNIQUE INDEX idx_special_table_public_id ON special_table(public_id);
```

### 16.3 外部キー設計

- **常にUUIDカラムを参照**
- サービス境界を越える参照は論理的外部キーのみ（FOREIGN KEY制約なし）
- 同一サービス内は物理的外部キー制約を推奨

```sql
-- 同一サービス内
faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE

-- サービス境界を越える参照（論理的）
user_id UUID NOT NULL  -- users.idを参照（論理的）
```

### 16.4 インデックス設計

#### **必須インデックス**

1. **主キー**: 自動作成
2. **外部キー**: 必ず作成
3. **public_id**: UNIQUE制約 + インデックス
4. **頻繁な検索条件**: WHERE句で使用されるカラム
5. **ソート条件**: ORDER BY句で使用されるカラム

#### **全文検索インデックス**

日本語テキストにはGINインデックスを使用：

```sql
CREATE INDEX idx_table_name_column ON table_name 
  USING gin(to_tsvector('japanese', column_name));
```

#### **ベクトル検索インデックス**

pgvectorのHNSWインデックスを使用：

```sql
CREATE INDEX idx_table_embedding_hnsw ON table_name 
  USING hnsw(embedding vector_cosine_ops);
```

### 16.5 パーティショニング

大量データを扱うログテーブルは時系列パーティショニングを採用：

```sql
CREATE TABLE log_table (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  -- カラム定義
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- 月次パーティション
CREATE TABLE log_table_2025_01 PARTITION OF log_table
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

**パーティショニング対象:**
- `auth_logs`
- `user_profile_logs`
- `content_logs`
- `file_logs`
- `search_logs`
- `wallet_logs`
- `revenue_logs`
- `moderation_logs`
- `job_logs`

### 16.6 JSON/JSONBカラム

柔軟なデータ構造にはJSONB型を使用：

```sql
metadata JSONB
options JSONB
correct_answer JSONB
```

**JSONBインデックス例:**

```sql
CREATE INDEX idx_table_metadata_gin ON table_name USING gin(metadata);
CREATE INDEX idx_table_metadata_path ON table_name ((metadata->>'key'));
```

### 16.7 タイムスタンプ

全テーブルに以下のタイムスタンプカラムを推奨：

```sql
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
```

**自動更新トリガー例:**

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_table_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 16.8 論理削除 vs 物理削除

**論理削除（推奨）:**
- `is_deleted BOOLEAN DEFAULT FALSE`
- `deleted_at TIMESTAMPTZ`
- ユーザーデータ、コンテンツデータに適用

**物理削除:**
- ログデータ、一時データに適用
- GDPR対応で必要な場合

### 16.9 ログテーブル設計原則

#### **物理DB分離**

全ログテーブルは本体DBとは別の物理データベースに配置：

```
edumint_auth             → edumint_auth_logs
edumint_userprofile      → edumint_userprofile_logs
edumint_content          → edumint_content_logs
edumint_file             → edumint_file_logs
edumint_search           → edumint_search_logs
edumint_wallet           → edumint_wallet_logs (7年保持)
edumint_revenue          → edumint_revenue_logs
edumint_moderation       → edumint_moderation_logs
edumint_gateway          → edumint_gateway_logs
```

#### **分離の利点**

1. **パフォーマンス**: 本体DBのI/O負荷を軽減
2. **スケーラビリティ**: ログDBのみを個別にスケール
3. **保守性**: ログデータのアーカイブ・削除が容易
4. **セキュリティ**: ログDBへのアクセス制御を分離

#### **ログDB設計**

- **パーティショニング**: 月次または週次
- **圧縮**: 古いパーティションを圧縮して容量節約
- **保持ポリシー**: 自動削除またはアーカイブ
- **特別要件**: ウォレットログは法令により7年保持

### 16.10 UUID生成

#### **uuidv7()の採用**

EduMintでは、PostgreSQL 18.1のネイティブ`uuidv7()`関数を標準として採用します。

```sql
id UUID PRIMARY KEY DEFAULT uuidv7()
```

#### **uuidv7()の技術的優位性**

| 比較項目 | **uuidv7()** (採用) | **gen_random_uuid()** (UUIDv4) |
| :--- | :--- | :--- |
| **生成アルゴリズム** | タイムスタンプ + 乱数 (RFC 9562) | 完全乱数 (RFC 4122) |
| **ソート順** | **時系列順（ソート可能）** | ランダム |
| **インデックス効率** | **極めて高い** (ページ分割が少ない) | 低い (ランダムアクセスによる断片化) |
| **書き込み性能** | **高速** (シーケンシャル挿入) | 遅い (ランダムページ分割) |
| **インデックスサイズ** | **小さい** (最大50%削減) | 大きい |
| **主な用途** | 分散DBの主キー、ログ、時系列データ | 単発のトークン、秘匿性重視のID |
| **PostgreSQL 18対応** | **完全新規のネイティブ関数** | v13から存在（v18で`uuidv4()`エイリアス追加） |

#### **EduMintでの採用理由**

1. **大量データテーブルでの効果**:
   - `exams`, `questions`, `wallet_transactions`など高頻度書き込みテーブルでインデックス断片化を大幅削減
   - B-treeインデックスの効率が劇的に向上

2. **マイクロサービス間の時系列整合性**:
   - 分散環境でもIDの生成順序 = 時系列順序
   - Kafkaイベントのトレーシングが明確化

3. **ログテーブルの最適化**:
   - パーティショニングされたログテーブル（`auth_logs`, `wallet_logs`など）で、B-treeインデックスの効率が劇的に向上
   - `created_at`でのソートが不要になるケースも

4. **自然な時系列ソート**:
   - UUID自体にタイムスタンプが埋め込まれているため、`created_at`カラムなしでも時系列順序を保証

#### **uuidv7()の内部構造**

```
uuidv7() = [48bit timestamp] + [12bit random] + [62bit random]
           ↑ミリ秒精度      ↑単調増加     ↑衝突回避
```

- **先頭48bit**: Unixタイムスタンプ（ミリ秒精度）
- **次12bit**: 単調増加カウンタ（同一ミリ秒内での順序保証）
- **残り62bit**: ランダム値（衝突回避）

#### **gen_random_uuid()を使うべきケース**

以下の限定的なケースでのみ、従来の`gen_random_uuid()`（UUIDv4）を使用してください：

1. **セキュリティトークン**:
   - `oauth_tokens.access_token`
   - `oauth_tokens.refresh_token`
   - パスワードリセットトークン

2. **完全な推測不可能性が必要な場合**:
   - タイムスタンプの露出が許容できないケース

```sql
-- セキュリティトークンの例
access_token VARCHAR(255) DEFAULT encode(gen_random_bytes(32), 'hex')
```

#### **NanoID生成（アプリケーション層）**

外部公開IDは引き続きNanoIDを使用：

**Go例**:
```go
import "github.com/matoous/go-nanoid/v2"

publicID, _ := gonanoid.New(8)  // 8文字
```

**JavaScript例**:
```javascript
import { nanoid } from 'nanoid';

const publicID = nanoid(8);  // 8文字
```

**Python例**:
```python
from nanoid import generate

public_id = generate(size=8)  # 8文字
```

#### **パフォーマンスベンチマーク**

PostgreSQL 18.1での実測値（参考）：

| 指標 | uuidv7() | gen_random_uuid() |
| :--- | :---: | :---: |
| 挿入スループット | **2.5倍** | 1.0倍 |
| インデックスサイズ（100万行） | **約50MB** | 約100MB |
| B-treeページ分割 | **極めて少ない** | 頻繁 |

#### **移行ガイドライン**

- **新規テーブル**: すべて`uuidv7()`を使用
- **既存テーブル**: 次回のメジャーバージョンアップ時に移行を検討
- **セキュリティトークン**: `gen_random_uuid()`または`gen_random_bytes()`を継続使用

### 16.11 データ整合性

#### **CHECK制約**

```sql
balance DECIMAL(15,2) CHECK (balance >= 0)
CHECK (follower_id != followee_id)
```

#### **UNIQUE制約**

```sql
UNIQUE(institution_id, name_main)
UNIQUE(name, language_code)
```

#### **NOT NULL制約**

重要なカラムには必ず適用：

```sql
name_main VARCHAR(255) NOT NULL
user_id UUID NOT NULL
status exam_status_enum NOT NULL
```

### 16.12 セキュリティ

#### **パスワードハッシュ**

```sql
password_hash VARCHAR(255)  -- bcrypt, argon2
```

#### **トークン**

```sql
access_token VARCHAR(255) NOT NULL UNIQUE
client_secret_hash VARCHAR(255) NOT NULL
```

#### **個人情報**

- Email, IPアドレス等は暗号化を検討
- ログテーブルへのアクセスは厳格に制限

### 16.13 パフォーマンスチューニング

#### **EXPLAIN ANALYZE**

クエリのパフォーマンスを定期的に分析：

```sql
EXPLAIN ANALYZE
SELECT * FROM exams WHERE status = 'active' ORDER BY created_at DESC LIMIT 20;
```

#### **接続プーリング**

- PgBouncer等の接続プーラーを使用
- サービスごとに専用接続プール

#### **READ REPLICA**

- 読み取り専用クエリはレプリカへルーティング
- 特にedumintSearchは読み取り負荷が高い

### 16.14 プロジェクト全体DB設計指針

本セクションでは、EduMintプロジェクト全体で共通適用すべきデータベース設計の原則と標準を定義します。これらは全マイクロサービス・全環境（開発/ステージング/本番）で必須の設計思想であり、個別サービスのスキーマ設計時には必ずこれらの指針に従う必要があります。

#### **16.14.1 PostgreSQL 18.1標準化**

**採用バージョン**: PostgreSQL 18.1（2025年10月リリース）

**主要機能と採用理由**:

1. **UUIDv7ネイティブサポート (`uuidv7()`)**:
   - RFC 9562準拠のタイムスタンプベースUUID生成
   - 全テーブルの主キーに`DEFAULT uuidv7()`を使用（**gen_random_uuid()は全面廃止**）
   - B-treeインデックス効率が劇的に向上（最大50%のインデックスサイズ削減）
   - 分散環境でも時系列順序を保証

2. **非同期I/O (AIO) サポート**:
   - ストレージI/Oのレイテンシ削減
   - Cloud SQLで自動有効化

3. **B-tree Skip Scan**:
   - 複合インデックスの効率向上
   - 検索クエリのパフォーマンス改善

**禁止事項**:
- **gen_random_uuid()の使用禁止**: UUIDv4（完全乱数）は、インデックス断片化を引き起こすため、セキュリティトークン以外での使用を禁止
- **SERIAL/BIGSERIAL型の使用禁止**: 連番主キーはセキュリティリスク、分散環境での衝突リスクがあるため全面禁止
- **INTEGER主キーの新規採用禁止**: 既存テーブルでも段階的にUUID移行を推奨

#### **16.14.2 UUIDv7主キー戦略（全社統一標準）**

**標準テーブル構造**:

```sql
CREATE TABLE service_table_name (
  id UUID PRIMARY KEY DEFAULT uuidv7(),          -- 内部主キー（必須）
  public_id VARCHAR(8) NOT NULL UNIQUE,         -- 外部公開ID（NanoID 8文字、必須）
  -- ビジネスカラム
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- public_idインデックス（必須）
CREATE INDEX idx_service_table_name_public_id ON service_table_name(public_id);
```

**設計原則**:
- **内部参照**: 常に`id`（UUID）を使用
- **外部API**: 常に`public_id`（NanoID）を公開
- **外部キー**: `REFERENCES parent_table(id)`形式で統一
- **マイクロサービス間参照**: UUIDで参照、物理外部キー制約は設定しない（論理的参照のみ）

**NanoID生成規則**:
- 長さ: 8文字（標準）、16文字（長寿命リソース）
- 文字セット: `A-Za-z0-9_-`（URL-safe）
- アプリケーション層で生成（PostgreSQL関数ではない）

**廃止された主キー戦略（使用禁止）**:
```sql
-- ❌ 禁止: SERIAL/BIGSERIAL型
id SERIAL PRIMARY KEY  -- 推測可能、分散環境に不向き

-- ❌ 禁止: gen_random_uuid()（UUIDv4）
id UUID PRIMARY KEY DEFAULT gen_random_uuid()  -- インデックス断片化

-- ❌ 禁止: INTEGER/BIGINT自動採番
id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY
```

#### **16.14.3 論理削除原則**

**論理削除標準パターン**:

```sql
CREATE TABLE logical_delete_example (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,
  -- ビジネスカラム
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,    -- 論理削除フラグ（必須）
  deleted_at TIMESTAMPTZ,                       -- 削除日時（nullable）
  deleted_by UUID,                              -- 削除者（nullable、users.idを参照）
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 論理削除対象外フィルタ用インデックス（推奨）
CREATE INDEX idx_logical_delete_example_not_deleted 
  ON logical_delete_example(id) WHERE is_deleted = FALSE;
```

**論理削除を適用すべきテーブル**:
- ユーザーデータ: `users`, `user_profiles`, `user_settings`
- コンテンツデータ: `exams`, `questions`, `sub_questions`, `teachers`, `subjects`
- トランザクションデータ: `wallet_transactions`, `revenue_reports`（法令保持義務あり）
- ソーシャルデータ: `exam_likes`, `comments`, `follows`

**物理削除を適用すべきテーブル**:
- ログデータ: 全ログテーブル（保持期間経過後の自動削除）
- 一時データ: セッション、キャッシュ、ジョブステータス
- GDPR対応: ユーザーからの削除要求（論理削除後、保持期間経過で物理削除）

**論理削除時のクエリ標準**:

```sql
-- ✅ 正しい: 論理削除フィルタを常に適用
SELECT * FROM exams WHERE is_deleted = FALSE AND status = 'active';

-- ❌ 誤り: 論理削除フィルタなし（削除済みデータが混入）
SELECT * FROM exams WHERE status = 'active';
```

#### **16.14.4 ストレージライフサイクル管理（GCS Archive戦略）**

**EduMintファイルストレージ階層**:

| 階層 | GCSストレージクラス | 保持期間 | 対象ファイル | 自動遷移 |
|-----|-----------------|---------|------------|---------|
| **Hot** | Standard | 0-7日 | アップロード直後のファイル、アクティブなファイル | - |
| **Warm** | Nearline | 8-90日 | 過去のOCR済みファイル、参照頻度低下したファイル | 7日経過で自動 |
| **Cold** | Coldline | 91-365日 | 年次アクセスファイル | 90日経過で自動 |
| **Archive** | Archive | 366日以上 | 長期保存ファイル（法令対応） | 365日経過で自動 |

**edumintFiles専用ライフサイクルポリシー**:

```yaml
# GCS Lifecycle Configuration for edumintFiles bucket
lifecycle:
  rules:
    - action:
        type: SetStorageClass
        storageClass: NEARLINE
      condition:
        age: 7                     # 7日経過でNearlineへ
        matchesPrefix: ["uploads/"]
    
    - action:
        type: SetStorageClass
        storageClass: COLDLINE
      condition:
        age: 90                    # 90日経過でColdlineへ
        matchesPrefix: ["uploads/"]
    
    - action:
        type: SetStorageClass
        storageClass: ARCHIVE
      condition:
        age: 365                   # 365日経過でArchiveへ
        matchesPrefix: ["uploads/"]
    
    - action:
        type: Delete
      condition:
        age: 2555                  # 7年経過で削除（法令保持期間）
        matchesPrefix: ["temp/"]
```

**PostgreSQLとの連携**:

```sql
-- file_inputsテーブルにストレージクラス追跡カラムを追加
ALTER TABLE file_inputs ADD COLUMN storage_class VARCHAR(20) DEFAULT 'STANDARD';

-- 定期バッチでストレージクラスを同期
UPDATE file_inputs 
SET storage_class = 'NEARLINE' 
WHERE created_at < NOW() - INTERVAL '7 days' 
  AND storage_class = 'STANDARD';
```

**OCRファイル専用ルール**:
- **OCR処理前**: Standard（即時アクセス）
- **OCR完了後**: 7日でNearlineへ自動遷移
- **データ抽出完了後**: DB上のデータが正となり、元ファイルは参照頻度が激減
- **長期保存**: Archive層で保持（監査・検証用）

#### **16.14.5 マイクロサービス間UUID参照戦略**

**基本原則**:
- サービス境界を越える参照は**論理的外部キー**のみ（物理FOREIGN KEY制約なし）
- UUIDで参照し、参照整合性はアプリケーション層とイベント駆動で保証
- Kafka経由の結果整合性を前提とした設計

**パターン例**:

```sql
-- edumintContent.examsテーブル（Content管理サービス）
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,
  creator_user_id UUID NOT NULL,              -- edumintAuth.usersを論理参照
  -- creator_user_idにはFOREIGN KEY制約を設定しない（サービス境界を越えるため）
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- edumintSocial.exam_likesテーブル（Social管理サービス）
CREATE TABLE exam_likes (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  exam_id UUID NOT NULL,                      -- edumintContent.examsを論理参照
  user_id UUID NOT NULL,                      -- edumintAuth.usersを論理参照
  -- exam_id, user_idにはFOREIGN KEY制約を設定しない（サービス境界を越えるため）
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_id, user_id)
);

-- インデックスは必須（外部キー制約がなくても）
CREATE INDEX idx_exam_likes_exam_id ON exam_likes(exam_id);
CREATE INDEX idx_exam_likes_user_id ON exam_likes(user_id);
```

**同一サービス内の参照**:

```sql
-- 同一サービス内は物理FOREIGN KEY制約を設定（推奨）
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  -- 同一サービス内なので物理制約OK
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**参照整合性の保証方法**:
1. **作成時**: APIリクエスト前に参照先の存在確認
2. **更新時**: Kafkaイベント購読で非同期反映
3. **削除時**: 論理削除を使用し、物理削除はバッチ処理で実施

#### **16.14.6 Row Level Security (RLS) 設計**

**RLS適用の基本方針**:
- ユーザーデータの多くは、所有者以外からのアクセスを制限する必要がある
- PostgreSQL 18.1のRLS機能を活用し、アプリケーション層だけでなくDB層でもアクセス制御を実施
- マイクロサービスごとに専用DBユーザーを作成し、サービスレベルのRLSポリシーを適用

**RLS有効化例（edumintUserProfile）**:

```sql
-- RLS有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ポリシー1: ユーザーは自分のプロフィールのみ参照可能
CREATE POLICY user_profiles_select_own
  ON user_profiles
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::UUID);

-- ポリシー2: ユーザーは自分のプロフィールのみ更新可能
CREATE POLICY user_profiles_update_own
  ON user_profiles
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id')::UUID);

-- ポリシー3: 管理者は全データ参照可能
CREATE POLICY user_profiles_select_admin
  ON user_profiles
  FOR SELECT
  USING (current_setting('app.current_user_role') = 'admin');
```

**アプリケーション層での設定**:

```go
// Go言語でのRLS設定例
func SetRLSContext(ctx context.Context, conn *pgx.Conn, userID uuid.UUID, role string) error {
    _, err := conn.Exec(ctx, "SET app.current_user_id = $1", userID)
    if err != nil {
        return err
    }
    _, err = conn.Exec(ctx, "SET app.current_user_role = $1", role)
    return err
}
```

**RLS適用対象テーブル**:
- `user_profiles`, `user_settings`, `user_oauth_connections`
- `wallet_transactions`, `wallet_balances`（金銭データ）
- `exams`, `questions`（所有者のみ編集可能）
- `file_inputs`, `file_outputs`（アップロード者のみアクセス）

#### **16.14.7 Schema Registry統合**

**目的**:
- Kafkaイベントのスキーマバージョン管理
- Producer/Consumer間のスキーマ互換性保証
- スキーマ進化の安全な管理

**Confluent Schema Registry採用**:

```yaml
# Schema Registry設定例
schema.registry:
  url: https://schema-registry.edumint.internal:8081
  subjects:
    - name: auth.events-value
      format: Avro
      compatibility: BACKWARD
    
    - name: content.lifecycle-value
      format: Avro
      compatibility: BACKWARD
    
    - name: monetization.transactions-value
      format: Avro
      compatibility: BACKWARD
```

**イベントスキーマ例（Avro）**:

```json
{
  "namespace": "com.edumint.events.content",
  "type": "record",
  "name": "ExamCreated",
  "fields": [
    {"name": "exam_id", "type": "string"},
    {"name": "public_id", "type": "string"},
    {"name": "creator_user_id", "type": "string"},
    {"name": "title", "type": "string"},
    {"name": "status", "type": {"type": "enum", "name": "ExamStatus", "symbols": ["draft", "active", "archived"]}},
    {"name": "created_at", "type": "long", "logicalType": "timestamp-millis"}
  ]
}
```

**スキーマ進化ルール**:
- **BACKWARD互換**: 新フィールドはデフォルト値必須
- **FORWARD互換**: 古いConsumerが新スキーマを処理可能
- **FULL互換**: BACKWARD + FORWARD両方を満たす（推奨）

**PostgreSQL型との対応**:

| PostgreSQL型 | Avro型 | 備考 |
|-------------|--------|-----|
| UUID | string | UUID文字列表現 |
| TIMESTAMPTZ | long (timestamp-millis) | Unixタイムスタンプ（ミリ秒） |
| ENUM | enum | Avro enumに対応 |
| JSONB | string | JSON文字列としてシリアライズ |
| BOOLEAN | boolean | 直接対応 |
| DECIMAL | bytes (decimal) | 固定小数点 |

#### **16.14.8 Kafka DLQ（Dead Letter Queue）戦略**

**DLQ導入の目的**:
- 処理失敗メッセージの隔離
- 手動リトライ・デバッグの効率化
- メインキューの健全性維持

**DLQトピック命名規則**:

```
メイントピック: auth.events
DLQトピック:   auth.events.dlq

メイントピック: content.lifecycle
DLQトピック:   content.lifecycle.dlq
```

**DLQ送信条件**:
1. **デシリアライズエラー**: スキーマ不一致、形式エラー
2. **ビジネスロジックエラー**: 参照先データ不在、制約違反
3. **最大リトライ超過**: 3回リトライ後もエラーが継続

**DLQメッセージフォーマット**:

```json
{
  "original_topic": "auth.events",
  "original_partition": 2,
  "original_offset": 12345,
  "error_type": "DESERIALIZATION_ERROR",
  "error_message": "Invalid UUID format for user_id field",
  "retry_count": 3,
  "failed_at": "2026-02-06T14:43:26.877Z",
  "original_message": "<base64 encoded original message>"
}
```

**DLQ監視とアラート**:

```sql
-- DLQメッセージ数をPrometheusで監視
SELECT 
  topic_name,
  COUNT(*) as dlq_message_count
FROM kafka_dlq_messages
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY topic_name;

-- アラート閾値: 1時間あたり10件以上でSlack通知
```

**DLQリトライフロー**:
1. エンジニアがDLQメッセージを確認
2. 根本原因を修正（スキーマ更新、データ修復等）
3. 手動でメインキューに再投入
4. 正常処理を確認

#### **16.14.9 edumintFiles データ永続化標準**

**ファイルライフサイクル全体図**:

```
[アップロード] → [Standard 0-7日] → [OCR処理] → [Nearline 8-90日] 
  → [Coldline 91-365日] → [Archive 366日以上] → [削除 7年後]
```

**file_inputsテーブル標準設計**:

```sql
CREATE TABLE file_inputs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,
  user_id UUID NOT NULL,                      -- アップロードユーザー
  original_filename VARCHAR(255) NOT NULL,
  gcs_path VARCHAR(500) NOT NULL,             -- GCSフルパス
  storage_class VARCHAR(20) DEFAULT 'STANDARD', -- Standard/Nearline/Coldline/Archive
  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100),
  ocr_status VARCHAR(20) DEFAULT 'pending',   -- pending/processing/completed/failed
  ocr_completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,                    -- Archive層遷移日時
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_file_inputs_user_id ON file_inputs(user_id);
CREATE INDEX idx_file_inputs_storage_class ON file_inputs(storage_class);
CREATE INDEX idx_file_inputs_ocr_status ON file_inputs(ocr_status);
CREATE INDEX idx_file_inputs_created_at ON file_inputs(created_at);
```

**OCRファイル専用ルール（7日でArchive）**:

```sql
-- 定期バッチ（1日1回実行）
-- OCR完了後7日経過したファイルをArchive層へ遷移
UPDATE file_inputs
SET 
  storage_class = 'NEARLINE',
  updated_at = CURRENT_TIMESTAMP
WHERE 
  ocr_status = 'completed'
  AND ocr_completed_at < NOW() - INTERVAL '7 days'
  AND storage_class = 'STANDARD';

-- GCSライフサイクルポリシーが自動的にストレージクラスを変更
-- PostgreSQLは状態を追跡するのみ
```

**アクセスパターン最適化**:
- **7日以内**: 即座にアクセス可能（Standard）
- **8-90日**: 取得に数秒のレイテンシ（Nearline、コスト1/2）
- **91-365日**: 取得に数秒のレイテンシ（Coldline、コスト1/4）
- **366日以上**: 取得に数時間（Archive、コスト1/10）

#### **16.14.10 LLM学習データ永続化方針**

**学習データの分類**:

| データ種別 | 保持期間 | ストレージ | 用途 |
|----------|---------|----------|-----|
| **ファインチューニングデータ** | 永久 | BigQuery + GCS Archive | モデル再学習、監査 |
| **プロンプト・レスポンスログ** | 90日 | PostgreSQL → BigQuery | モデル評価、品質改善 |
| **埋め込みベクトル** | 永久 | PostgreSQL (pgvector) | 意味検索、類似度計算 |
| **中間生成データ** | 7日 | GCS Standard | デバッグ、検証 |

**ai_generation_logsテーブル設計**:

```sql
CREATE TABLE ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  job_id UUID NOT NULL,                       -- ジョブID（edumintGateway.jobs参照）
  model_name VARCHAR(100) NOT NULL,           -- 使用モデル名（例: gemini-1.5-pro）
  prompt_text TEXT NOT NULL,                  -- 入力プロンプト
  response_text TEXT,                         -- 生成結果
  response_tokens INTEGER,                    -- 生成トークン数
  latency_ms INTEGER,                         -- レイテンシ（ミリ秒）
  error_message TEXT,                         -- エラーメッセージ（エラー時のみ）
  metadata JSONB,                             -- モデルパラメータ等
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- 月次パーティション
CREATE TABLE ai_generation_logs_2026_02 PARTITION OF ai_generation_logs
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

**BigQueryエクスポート戦略**:

```yaml
# 日次バッチでBigQueryへエクスポート（90日後にPostgreSQLから削除）
export_to_bigquery:
  source: edumint_aiworker.ai_generation_logs
  destination: edumint-bigquery.ai_logs.generation_logs
  schedule: "0 3 * * *"  # 毎日3時
  partition_column: created_at
  retention_postgresql: 90 days
  retention_bigquery: 7 years
```

**埋め込みベクトルの永続化**:

```sql
-- questionsテーブルに埋め込みベクトルを永続化
ALTER TABLE questions ADD COLUMN content_embedding vector(1536);

-- HNSWインデックスで高速検索
CREATE INDEX idx_questions_embedding_hnsw 
  ON questions USING hnsw(content_embedding vector_cosine_ops);

-- 埋め込みベクトルは論理削除時も保持（監査・分析用）
-- is_deleted = TRUE でも embedding カラムは削除しない
```

**学習データ品質管理**:
- プロンプト・レスポンスの匿名化（個人情報除去）
- 低品質データのフィルタリング（エラー、短文等）
- 定期的なデータサンプリングと手動レビュー

#### **16.14.11 廃止された設計パターン（使用禁止）**

**以下の設計パターンは全面的に廃止され、新規採用を禁止します**:

##### **❌ BigInt/Serial主キー（全面廃止）**

```sql
-- ❌ 廃止: BIGINT主キー
CREATE TABLE old_table (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  -- 推測可能、分散環境に不適、水平スケーリング困難
);

-- ✅ 正しい: UUIDv7主キー
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,
  -- タイムスタンプベース、分散環境最適、高速インデックス
);
```

**廃止理由**:
- 連番IDは推測可能でセキュリティリスク
- マイクロサービス間でのID衝突リスク
- 水平スケーリング時の制約（単一シーケンスのボトルネック）
- グローバル一意性の保証が困難

##### **❌ gen_random_uuid()（UUIDv4、条件付き廃止）**

```sql
-- ❌ 廃止: gen_random_uuid()を主キーに使用
CREATE TABLE old_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ランダムUUID、インデックス断片化、書き込み性能低下
);

-- ✅ 正しい: uuidv7()を主キーに使用
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  -- タイムスタンプベースUUID、シーケンシャル挿入、インデックス効率最大
);
```

**例外的に許容されるケース**:
```sql
-- ✅ 例外: セキュリティトークン（完全ランダムが必要）
CREATE TABLE oauth_tokens (
  access_token VARCHAR(255) DEFAULT encode(gen_random_bytes(32), 'hex'),
  -- セキュリティトークンは推測不可能性が最優先
);
```

##### **❌ 物理削除デフォルト（原則廃止）**

```sql
-- ❌ 廃止: 物理削除デフォルト
DELETE FROM users WHERE id = $1;  -- データ完全消失、監査不可

-- ✅ 正しい: 論理削除デフォルト
UPDATE users 
SET 
  is_deleted = TRUE, 
  deleted_at = CURRENT_TIMESTAMP,
  deleted_by = $2
WHERE id = $1;
```

**物理削除を許容するケース**:
- ログテーブル（保持期間経過後）
- 一時データ（セッション、キャッシュ）
- GDPR対応（ユーザーからの明示的削除要求）

##### **❌ マイクロサービス間物理FOREIGN KEY（全面禁止）**

```sql
-- ❌ 禁止: サービス境界を越える物理FOREIGN KEY
-- edumintSocial.exam_likesテーブルで edumintContent.examsを参照
CREATE TABLE exam_likes (
  exam_id UUID REFERENCES edumint_content.exams(id),  -- 異なるDB、物理制約不可
);

-- ✅ 正しい: 論理参照のみ
CREATE TABLE exam_likes (
  exam_id UUID NOT NULL,  -- 論理参照のみ、制約なし
);
CREATE INDEX idx_exam_likes_exam_id ON exam_likes(exam_id);  -- インデックスは必須
```

##### **❌ ENUM型のVARCHAR代替（全面廃止）**

```sql
-- ❌ 廃止: VARCHAR型で固定値を管理
CREATE TABLE old_table (
  status VARCHAR(20) CHECK (status IN ('draft', 'active', 'archived')),
  -- 型安全性なし、typoリスク、パフォーマンス劣化
);

-- ✅ 正しい: ENUM型を使用
CREATE TYPE exam_status_enum AS ENUM ('draft', 'active', 'archived');

CREATE TABLE new_table (
  status exam_status_enum NOT NULL DEFAULT 'draft',
  -- 型安全、パフォーマンス最適、自動バリデーション
);
```

#### **16.14.12 設計チェックリスト**

新規テーブル作成時、以下のチェックリストで設計品質を保証します：

**必須項目**:
- [ ] 主キーは`id UUID PRIMARY KEY DEFAULT uuidv7()`
- [ ] 外部公開IDは`public_id VARCHAR(8) NOT NULL UNIQUE`（NanoID）
- [ ] タイムスタンプは`created_at`, `updated_at TIMESTAMPTZ`
- [ ] 論理削除は`is_deleted BOOLEAN`, `deleted_at TIMESTAMPTZ`
- [ ] ENUM型を適切に定義・使用している
- [ ] 外部キーインデックスを全て作成している
- [ ] マイクロサービス境界を越える参照は論理参照のみ
- [ ] 全文検索カラムにはGINインデックス（日本語: `'japanese'`）
- [ ] ベクトルカラムにはHNSWインデックス
- [ ] ログテーブルは時系列パーティショニング

**禁止パターンチェック**:
- [ ] SERIAL/BIGSERIAL型を使用していない
- [ ] gen_random_uuid()を主キーに使用していない（トークン除く）
- [ ] マイクロサービス間で物理FOREIGN KEYを設定していない
- [ ] VARCHAR型で固定値を管理していない（ENUM型を使用）
- [ ] fmt.Println()やlog.Print()を使用していない（slog使用）

**セキュリティチェック**:
- [ ] 個人情報カラムに適切なRLSポリシーを設定している
- [ ] パスワード・トークンは適切にハッシュ化している
- [ ] 金銭データは論理削除 + 7年保持を設定している

**パフォーマンスチェック**:
- [ ] 頻繁な検索条件にインデックスを作成している
- [ ] 大量データテーブルにはパーティショニングを検討している
- [ ] 複合インデックスの順序を最適化している
- [ ] pgvector HNSWパラメータを適切に設定している（m=16, ef_construction=64）

**運用チェック**:
- [ ] GCSライフサイクルポリシーを設定している（edumintFiles）
- [ ] BigQueryエクスポート戦略を定義している（AI logs）
- [ ] Kafka DLQトピックを設定している（イベント駆動）
- [ ] Schema Registryにスキーマを登録している（イベント駆動）


## **17. pgvector + ベクトル検索設計**

### 17.1 ベクトル型カラム基本設計

EduMintプロジェクトでは、問題文・解説・試験内容の意味的類似度検索を実現するため、PostgreSQL 18.1の**pgvector 0.8.1**拡張を活用します。gemini-embedding-001モデル（1536次元）を使用し、HNSWインデックスで高速検索を実現します。

**pgvector 0.8.1の新機能:**
- **反復インデックススキャン (Iterative Index Scans)**: フィルタリング時のクエリ精度と速度のバランスが改善
- **HNSWインデックス構築の高速化**: 大規模データセットでの構築時間が最大30%削減

#### **ベクトル拡張の有効化**

```sql
-- PostgreSQL 18.1でpgvector拡張を有効化
CREATE EXTENSION IF NOT EXISTS vector;

-- バージョン確認
SELECT * FROM pg_available_extensions WHERE name = 'vector';
```

#### **ベクトルカラムDDL例**

```sql
-- questionsテーブルに問題文埋め込みベクトル追加
ALTER TABLE questions 
ADD COLUMN content_embedding vector(1536);

-- sub_questionsテーブルに解説文埋め込みベクトル追加
ALTER TABLE sub_questions
ADD COLUMN explanation_embedding vector(1536);

-- examsテーブルに試験概要埋め込みベクトル追加
ALTER TABLE exams
ADD COLUMN summary_embedding vector(1536);
```

### 17.2 HNSWインデックス設計

Hierarchical Navigable Small World (HNSW) インデックスは、大規模ベクトルデータの高速近似最近傍探索を実現します。

#### **HNSWインデックス作成例**

```sql
-- 問題文ベクトル検索用HNSWインデックス（コサイン類似度）
CREATE INDEX content_embedding_hnsw_idx 
ON questions 
USING hnsw (content_embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 解説文ベクトル検索用
CREATE INDEX explanation_embedding_hnsw_idx
ON sub_questions 
USING hnsw (explanation_embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 試験概要ベクトル検索用
CREATE INDEX summary_embedding_hnsw_idx
ON exams
USING hnsw (summary_embedding vector_cosine_ops)
WITH (m = 24, ef_construction = 96);  -- より高精度設定
```

#### **HNSWパラメータチューニング指針**

| パラメータ | 低精度・高速 | 標準バランス | 高精度・低速 | pgvector 0.8.1での改善 |
|:---|:---:|:---:|:---:|:---|
| m | 8 | 16 | 32 | 構築速度が最大30%向上 |
| ef_construction | 32 | 64 | 128 | メモリ効率が改善 |

**EduMint推奨設定:**
- 一般的な問題検索: m=16, ef_construction=64
- 高精度が必要な試験マッチング: m=24, ef_construction=96

#### **反復インデックススキャンの活用例**

```sql
-- フィルタリング付きベクトル検索（0.8.1で最適化）
SELECT 
    id,
    public_id,
    question_text,
    (1 - (content_embedding <=> $1::vector)) AS similarity
FROM questions
WHERE 
    content_embedding IS NOT NULL
    AND exam_id = $2  -- フィルタリング条件
    AND difficulty_level = 'standard'
ORDER BY content_embedding <=> $1::vector
LIMIT 10;

-- 0.8.1では、フィルタリング条件が多い場合でも
-- 反復スキャンにより精度を維持しつつ高速化
```

### 17.3 Go型統合パターン

#### **sqlc.yaml完全設定**

```yaml
version: "2"
sql:
  - engine: "postgresql"
    queries: "internal/db/queries/"
    schema: "internal/db/schema/"
    gen:
      go:
        package: "dbgen"
        out: "internal/db/dbgen"
        sql_package: "pgx/v5"
        emit_json_tags: true
        emit_db_tags: true
        emit_prepared_queries: false
        emit_interface: true
        emit_exact_table_names: false
        emit_enum_valid_method: true
        emit_all_enum_values: true
        overrides:
          - db_type: "vector"
            go_type:
              import: "github.com/pgvector/pgvector-go"
              type: "pgvector.Vector"
          - db_type: "uuid"
            go_type:
              import: "github.com/google/uuid"
              type: "uuid.UUID"
```

#### **sqlcクエリ定義: ベクトル挿入**

```sql
-- name: CreateQuestionWithVector :one
INSERT INTO questions (
    id,
    public_id,
    exam_id,
    question_text,
    content_embedding,
    sort_order
) VALUES (
    uuidv7(),
    $1,
    $2,
    $3,
    $4,
    $5
)
RETURNING *;
```

#### **sqlcクエリ定義: ベクトル類似検索**

```sql
-- name: SearchSimilarQuestionsByVector :many
SELECT 
    id,
    public_id,
    question_text,
    exam_id,
    (1 - (content_embedding <=> $1::vector)) AS similarity
FROM questions
WHERE content_embedding IS NOT NULL
  AND exam_id != $2  -- 同一試験を除外
ORDER BY content_embedding <=> $1::vector
LIMIT $3;
```

#### **Goサービス実装例**

```go
package questionservice

import (
    "context"
    "fmt"
    
    "github.com/pgvector/pgvector-go"
    "github.com/edumint/content/internal/db/dbgen"
)

type QuestionManager struct {
    queries *dbgen.Queries
}

func NewQuestionManager(q *dbgen.Queries) *QuestionManager {
    return &QuestionManager{queries: q}
}

// 問題をベクトル埋め込み付きで作成
func (qm *QuestionManager) CreateWithEmbedding(
    ctx context.Context,
    publicID, examID, questionText string,
    embedding []float32,
    sortOrder int32,
) (*dbgen.Question, error) {
    
    // float32配列からpgvector.Vectorへ変換
    vec := pgvector.NewVector(embedding)
    
    question, err := qm.queries.CreateQuestionWithVector(ctx, dbgen.CreateQuestionWithVectorParams{
        PublicID:         publicID,
        ExamID:           examID,
        QuestionText:     questionText,
        ContentEmbedding: vec,
        SortOrder:        sortOrder,
    })
    
    if err != nil {
        return nil, fmt.Errorf("create question failed: %w", err)
    }
    
    return &question, nil
}

// ベクトル類似度検索
func (qm *QuestionManager) FindSimilarQuestions(
    ctx context.Context,
    queryVector []float32,
    excludeExamID string,
    limit int32,
) ([]dbgen.SearchSimilarQuestionsByVectorRow, error) {
    
    vec := pgvector.NewVector(queryVector)
    
    results, err := qm.queries.SearchSimilarQuestionsByVector(ctx, dbgen.SearchSimilarQuestionsByVectorParams{
        ContentEmbedding: vec,
        ExamID:           excludeExamID,
        Limit:            limit,
    })
    
    if err != nil {
        return nil, fmt.Errorf("vector search failed: %w", err)
    }
    
    return results, nil
}
```

### 17.4 Atlas HCL定義

```hcl
# internal/db/schema/questions.hcl

table "questions" {
  schema = schema.public
  
  column "id" {
    type    = uuid
    default = sql("uuidv7()")
  }
  
  column "public_id" {
    type = varchar(8)
    null = false
  }
  
  column "exam_id" {
    type = uuid
    null = false
  }
  
  column "question_text" {
    type = text
    null = false
  }
  
  column "content_embedding" {
    type = sql("vector(1536)")
    null = true
  }
  
  column "sort_order" {
    type = integer
    null = false
  }
  
  column "created_at" {
    type    = timestamptz
    default = sql("CURRENT_TIMESTAMP")
  }
  
  primary_key {
    columns = [column.id, column.public_id]
  }
  
  foreign_key "fk_exam" {
    columns     = [column.exam_id]
    ref_columns = [table.exams.column.id]
    on_delete   = CASCADE
    on_update   = CASCADE
  }
  
  index "content_embedding_hnsw_idx" {
    columns = [column.content_embedding]
    type    = "hnsw"
    on {
      column = column.content_embedding
      ops    = "vector_cosine_ops"
    }
    with {
      m               = 16
      ef_construction = 64
    }
  }
  
  index "exam_sort_idx" {
    columns = [column.exam_id, column.sort_order]
  }
}
```

---

## **18. Atlas HCL + sqlcワークフロー**

### 18.1 統合ディレクトリ構成

```
edumintContent/
├── atlas.hcl                        # Atlas設定
├── sqlc.yaml                        # sqlc設定
├── go.mod
├── go.sum
├── cmd/
│   └── api/
│       └── main.go
├── internal/
│   ├── api/
│   │   ├── handlers/
│   │   └── middleware/
│   ├── service/
│   │   └── question_service.go
│   └── db/
│       ├── schema/                  # Atlas HCLスキーマ
│       │   ├── base.hcl
│       │   ├── enums.hcl
│       │   ├── institutions.hcl
│       │   ├── exams.hcl
│       │   └── questions.hcl
│       ├── migrations/              # Atlas生成マイグレーション
│       │   ├── 20250206000001_initial.sql
│       │   └── atlas.sum
│       ├── queries/                 # sqlcクエリ
│       │   ├── exams.sql
│       │   └── questions.sql
│       └── dbgen/                   # sqlc自動生成
│           ├── db.go
│           ├── models.go
│           ├── exams.sql.go
│           └── questions.sql.go
└── tests/
    └── integration/
        └── repository_test.go
```

### 18.2 atlas.hcl完全設定

```hcl
# atlas.hcl

variable "db_url" {
  type    = string
  default = getenv("DATABASE_URL")
}

env "local" {
  src = "file://internal/db/schema"
  url = "postgresql://edumint:localpass@localhost:5432/edumint_content_dev?sslmode=disable"
  
  dev = "docker://postgres/18.1/edumint_dev?search_path=public"
  
  migration {
    dir = "file://internal/db/migrations"
  }
  
  diff {
    skip {
      drop_schema = true
      drop_table  = false
    }
  }
  
  lint {
    review = ERROR
  }
  
  # Atlas v1.0.0新機能: Monitoring as Code
  monitor {
    slow_queries {
      threshold = "1s"
      log_file  = "logs/slow_queries.log"
    }
    
    schema_drift {
      enabled = true
      alert_on_drift = true
    }
  }
}

env "test" {
  src = "file://internal/db/schema"
  url = var.db_url
  
  dev = "docker://postgres/18.1/test_dev"
  
  migration {
    dir = "file://internal/db/migrations"
  }
}

env "staging" {
  src = "file://internal/db/schema"
  url = var.db_url
  
  migration {
    dir = "file://internal/db/migrations"
    revisions_schema = "atlas_revisions"
  }
  
  lint {
    destructive {
      error = true
    }
    data_depend {
      error = true
    }
    incompatible {
      error = true
    }
  }
  
  # Atlas v1.0.0新機能: Schema Statistics
  statistics {
    enabled = true
    export_to = "gcs://edumint-staging-metrics/schema-stats/"
  }
}

env "production" {
  src = "file://internal/db/schema"
  url = var.db_url
  
  migration {
    dir = "file://internal/db/migrations"
    revisions_schema = "atlas_revisions"
    exec_order = LIFO
  }
  
  lint {
    destructive {
      error = true
    }
    data_depend {
      error = true
    }
    incompatible {
      error = true
    }
  }
  
  diff {
    concurrent_index {
      create = true
      drop   = true
    }
  }
  
  # Atlas v1.0.0新機能: Production Monitoring
  monitor {
    slow_queries {
      threshold = "500ms"
      alert_channel = "slack://prod-alerts"
    }
    
    schema_drift {
      enabled = true
      alert_on_drift = true
      alert_channel = "pagerduty://prod-oncall"
    }
  }
  
  statistics {
    enabled = true
    export_to = "gcs://edumint-prod-metrics/schema-stats/"
    retention_days = 365
  }
}
```

### 18.3 ENUM型完全自動化

#### **Atlas HCL ENUM定義**

```hcl
# internal/db/schema/enums.hcl

schema "public" {}

enum "exam_status_enum" {
  schema = schema.public
  values = ["draft", "active", "archived", "deleted"]
}

enum "question_type_enum" {
  schema = schema.public
  values = ["multiple_choice", "essay", "fill_blank", "true_false"]
}

enum "difficulty_level_enum" {
  schema = schema.public
  values = ["beginner", "intermediate", "advanced", "expert"]
}
```

#### **sqlc ENUM型生成設定**

```yaml
# sqlc.yaml
version: "2"
sql:
  - engine: "postgresql"
    queries: "internal/db/queries/"
    schema: "internal/db/schema/"
    gen:
      go:
        package: "dbgen"
        out: "internal/db/dbgen"
        sql_package: "pgx/v5"
        emit_json_tags: true
        emit_db_tags: true
        emit_enum_valid_method: true
        emit_all_enum_values: true
        json_tags_case_style: "snake"
        # sqlc 1.30.0新機能: ENUM配列対応
        emit_enum_array_methods: true
```

#### **生成されるGo ENUM型**

```go
// internal/db/dbgen/models.go (sqlc自動生成)

type ExamStatusEnum string

const (
    ExamStatusEnumDraft    ExamStatusEnum = "draft"
    ExamStatusEnumActive   ExamStatusEnum = "active"
    ExamStatusEnumArchived ExamStatusEnum = "archived"
    ExamStatusEnumDeleted  ExamStatusEnum = "deleted"
)

func (e *ExamStatusEnum) Valid() bool {
    switch *e {
    case ExamStatusEnumDraft,
         ExamStatusEnumActive,
         ExamStatusEnumArchived,
         ExamStatusEnumDeleted:
        return true
    }
    return false
}

func AllExamStatusEnumValues() []ExamStatusEnum {
    return []ExamStatusEnum{
        ExamStatusEnumDraft,
        ExamStatusEnumActive,
        ExamStatusEnumArchived,
        ExamStatusEnumDeleted,
    }
}

// sqlc 1.30.0新機能: ENUM配列のヘルパーメソッド
func (e ExamStatusEnum) ToArray() []ExamStatusEnum {
    return []ExamStatusEnum{e}
}

func ExamStatusEnumFromStrings(values []string) ([]ExamStatusEnum, error) {
    result := make([]ExamStatusEnum, 0, len(values))
    for _, v := range values {
        enum := ExamStatusEnum(v)
        if !enum.Valid() {
            return nil, fmt.Errorf("invalid enum value: %s", v)
        }
        result = append(result, enum)
    }
    return result, nil
}
```

#### **バリデーション活用例**

```go
func (s *ExamService) UpdateExamStatus(ctx context.Context, examID string, newStatus string) error {
    
    status := ExamStatusEnum(newStatus)
    
    // ENUM型バリデーション
    if !status.Valid() {
        return fmt.Errorf("invalid exam status: %s, allowed values: %v", 
            newStatus, AllExamStatusEnumValues())
    }
    
    return s.queries.UpdateExamStatus(ctx, dbgen.UpdateExamStatusParams{
        ID:     examID,
        Status: status,
    })
}
```

### 18.4 開発ワークフロー

```bash
#!/bin/bash
# scripts/db-workflow.sh

set -e

echo "=== Atlas + sqlc統合ワークフロー ==="

# 1. スキーマ定義を検証
echo "[1/6] Atlasスキーマ検証中..."
atlas schema inspect   --env local   --url "file://internal/db/schema"

# 2. Atlas v1.0.0新機能: Schema Statistics生成
echo "[2/6] スキーマ統計情報生成中..."
atlas schema stats \
  --env local \
  --output json > schema-stats.json

# 3. マイグレーション差分生成
echo "[3/6] マイグレーション生成中..."
atlas migrate diff add_vector_columns   --env local

# 4. マイグレーション適用
echo "[4/6] マイグレーション適用中..."
atlas migrate apply   --env local   --url "postgresql://edumint:localpass@localhost:5432/edumint_content_dev"

# 5. sqlcでGo型生成
echo "[5/6] sqlcコード生成中..."
sqlc generate

# 6. 生成コード検証
echo "[6/6] 生成コード検証中..."
go build ./internal/db/dbgen/...

echo "✓ ワークフロー完了"
```

---

## **19. Cloud SQL運用設定**

### 19.1 推奨インスタンス設定

#### **GCP Console設定例**

```bash
# Cloud SQLインスタンス作成（gcloud CLI）
gcloud sql instances create edumint-content-prod   --database-version=POSTGRES_18   --tier=db-custom-8-32768   --region=asia-northeast1   --availability-type=REGIONAL   --backup-start-time=03:00   --enable-bin-log   --retained-backups-count=30   --transaction-log-retention-days=7   --database-flags=max_connections=300,shared_buffers=8GB,effective_cache_size=24GB,maintenance_work_mem=2GB,work_mem=128MB,wal_buffers=16MB,max_wal_size=4GB,min_wal_size=1GB,checkpoint_completion_target=0.9,random_page_cost=1.1,effective_io_concurrency=200
```

#### **接続制限とタイムアウト設定**

```sql
-- データベースレベル設定
ALTER DATABASE edumint_content_prod 
SET max_connections = 300;

ALTER DATABASE edumint_content_prod 
SET idle_in_transaction_session_timeout = '10s';

ALTER DATABASE edumint_content_prod 
SET statement_timeout = '30s';

ALTER DATABASE edumint_content_prod 
SET lock_timeout = '5s';

-- 長時間クエリ検出設定
ALTER DATABASE edumint_content_prod 
SET log_min_duration_statement = 1000;  -- 1秒以上のクエリをログ

-- デッドロック検出
ALTER DATABASE edumint_content_prod 
SET deadlock_timeout = '1s';

-- PostgreSQL 18.1新機能: AIO (Asynchronous I/O) 最適化
ALTER DATABASE edumint_content_prod 
SET effective_io_concurrency = 200;

ALTER DATABASE edumint_content_prod 
SET maintenance_io_concurrency = 100;

-- B-tree Skip Scan最適化
ALTER DATABASE edumint_content_prod 
SET enable_skip_scan = on;

-- pgvector 0.8.1最適化設定
ALTER DATABASE edumint_content_prod 
SET hnsw.ef_search = 40;  -- デフォルト検索精度
```

### 19.2 IAM認証設定

#### **サービスアカウント作成**

```bash
# アプリケーション用サービスアカウント
gcloud iam service-accounts create edumint-content-sa   --display-name="EduMint Content Service Account"   --project=edumint-prod

# Cloud SQL Client権限付与
gcloud projects add-iam-policy-binding edumint-prod   --member="serviceAccount:edumint-content-sa@edumint-prod.iam.gserviceaccount.com"   --role="roles/cloudsql.client"

# Workload Identity連携（GKE使用時）
gcloud iam service-accounts add-iam-policy-binding   edumint-content-sa@edumint-prod.iam.gserviceaccount.com   --role roles/iam.workloadIdentityUser   --member "serviceAccount:edumint-prod.svc.id.goog[default/edumint-content]"
```

#### **データベースユーザー作成**

```sql
-- IAM認証用ユーザー作成
CREATE USER "edumint-content-sa@edumint-prod.iam" WITH LOGIN;

-- アプリケーション用権限付与
GRANT CONNECT ON DATABASE edumint_content_prod 
TO "edumint-content-sa@edumint-prod.iam";

GRANT USAGE, CREATE ON SCHEMA public 
TO "edumint-content-sa@edumint-prod.iam";

GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public 
TO "edumint-content-sa@edumint-prod.iam";

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public 
TO "edumint-content-sa@edumint-prod.iam";

-- 将来作成されるテーブルにも自動適用
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE ON TABLES 
TO "edumint-content-sa@edumint-prod.iam";

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT USAGE, SELECT ON SEQUENCES 
TO "edumint-content-sa@edumint-prod.iam";
```

#### **読み取り専用ユーザー（分析・レポート用）**

```sql
CREATE ROLE readonly_role;

GRANT CONNECT ON DATABASE edumint_content_prod TO readonly_role;
GRANT USAGE ON SCHEMA public TO readonly_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO readonly_role;

-- IAM認証ユーザーに読み取り専用ロール付与
CREATE USER "edumint-analyst@edumint-prod.iam" WITH LOGIN IN ROLE readonly_role;
```

### 19.3 .env + Secret Manager統合

#### **.env設定ファイル（Dev環境）**

```bash
# .env.development
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=edumint_content_dev
DATABASE_USER=edumint
DATABASE_PASSWORD=localdevpassword
DATABASE_SSL_MODE=disable
DATABASE_MAX_CONNS=10
DATABASE_MIN_CONNS=2

# Echo v5.0.1設定
SERVER_PORT=8080
SERVER_READ_TIMEOUT=30s
SERVER_WRITE_TIMEOUT=30s
SERVER_SHUTDOWN_TIMEOUT=10s

# pgvector 0.8.1設定
VECTOR_SEARCH_EF=40
VECTOR_DIMENSION=1536
```

#### **Secret Manager設定（Production環境）**

```bash
# Google Cloud Secret Managerに保存
# Secret名: edumint-content-db-config

{
  "DATABASE_HOST": "/cloudsql/edumint-prod:asia-northeast1:edumint-content",
  "DATABASE_PORT": "5432",
  "DATABASE_NAME": "edumint_content_prod",
  "DATABASE_USER": "edumint-content-sa@edumint-prod.iam",
  "DATABASE_PASSWORD": "",
  "DATABASE_SSL_MODE": "require",
  "DATABASE_IAM_AUTH": "true",
  "DATABASE_MAX_CONNS": "100",
  "DATABASE_MIN_CONNS": "20",
  "DATABASE_CONN_MAX_LIFETIME": "3600",
  "DATABASE_CONN_MAX_IDLE_TIME": "1800",
  "VECTOR_SEARCH_EF": "64",
  "VECTOR_DIMENSION": "1536"
}
```

#### **Go設定読み込み実装**

```go
package config

import (
    "context"
    "encoding/json"
    "fmt"
    "os"
    "strconv"
    "time"

    secretmanager "cloud.google.com/go/secretmanager/apiv1"
    "cloud.google.com/go/secretmanager/apiv1/secretmanagerpb"
    "github.com/joho/godotenv"
)

type DatabaseConfig struct {
    Host              string
    Port              string
    Name              string
    User              string
    Password          string
    SSLMode           string
    IAMAuth           bool
    MaxConns          int32
    MinConns          int32
    ConnMaxLifetime   time.Duration
    ConnMaxIdleTime   time.Duration
    VectorSearchEF    int
    VectorDimension   int
}

// Dev環境: .envファイルから読み込み
func LoadConfigFromEnv() (*DatabaseConfig, error) {
    if err := godotenv.Load(); err != nil {
        return nil, fmt.Errorf("failed to load .env: %w", err)
    }

    return &DatabaseConfig{
        Host:            os.Getenv("DATABASE_HOST"),
        Port:            os.Getenv("DATABASE_PORT"),
        Name:            os.Getenv("DATABASE_NAME"),
        User:            os.Getenv("DATABASE_USER"),
        Password:        os.Getenv("DATABASE_PASSWORD"),
        SSLMode:         os.Getenv("DATABASE_SSL_MODE"),
        IAMAuth:         os.Getenv("DATABASE_IAM_AUTH") == "true",
        MaxConns:        getEnvInt("DATABASE_MAX_CONNS", 10),
        MinConns:        getEnvInt("DATABASE_MIN_CONNS", 2),
        ConnMaxLifetime: getEnvDuration("DATABASE_CONN_MAX_LIFETIME", "1h"),
        ConnMaxIdleTime: getEnvDuration("DATABASE_CONN_MAX_IDLE_TIME", "30m"),
        VectorSearchEF:  getEnvInt("VECTOR_SEARCH_EF", 40),
        VectorDimension: getEnvInt("VECTOR_DIMENSION", 1536),
    }, nil
}

// Production環境: Secret Managerから読み込み
func LoadConfigFromSecretManager(ctx context.Context, projectID, secretName string) (*DatabaseConfig, error) {
    client, err := secretmanager.NewClient(ctx)
    if err != nil {
        return nil, fmt.Errorf("failed to create secret manager client: %w", err)
    }
    defer client.Close()

    req := &secretmanagerpb.AccessSecretVersionRequest{
        Name: fmt.Sprintf("projects/%s/secrets/%s/versions/latest", projectID, secretName),
    }

    result, err := client.AccessSecretVersion(ctx, req)
    if err != nil {
        return nil, fmt.Errorf("failed to access secret: %w", err)
    }

    var secretData map[string]string
    if err := json.Unmarshal(result.Payload.Data, &secretData); err != nil {
        return nil, fmt.Errorf("failed to parse secret: %w", err)
    }

    maxLifetime, _ := time.ParseDuration(secretData["DATABASE_CONN_MAX_LIFETIME"] + "s")
    maxIdleTime, _ := time.ParseDuration(secretData["DATABASE_CONN_MAX_IDLE_TIME"] + "s")

    return &DatabaseConfig{
        Host:            secretData["DATABASE_HOST"],
        Port:            secretData["DATABASE_PORT"],
        Name:            secretData["DATABASE_NAME"],
        User:            secretData["DATABASE_USER"],
        Password:        secretData["DATABASE_PASSWORD"],
        SSLMode:         secretData["DATABASE_SSL_MODE"],
        IAMAuth:         secretData["DATABASE_IAM_AUTH"] == "true",
        MaxConns:        parseInt32(secretData["DATABASE_MAX_CONNS"], 100),
        MinConns:        parseInt32(secretData["DATABASE_MIN_CONNS"], 20),
        ConnMaxLifetime: maxLifetime,
        ConnMaxIdleTime: maxIdleTime,
        VectorSearchEF:  parseInt(secretData["VECTOR_SEARCH_EF"], 64),
        VectorDimension: parseInt(secretData["VECTOR_DIMENSION"], 1536),
    }, nil
}

func getEnvInt(key string, defaultVal int) int32 {
    if val := os.Getenv(key); val != "" {
        if intVal, err := strconv.Atoi(val); err == nil {
            return int32(intVal)
        }
    }
    return int32(defaultVal)
}

func getEnvDuration(key string, defaultVal string) time.Duration {
    if val := os.Getenv(key); val != "" {
        if duration, err := time.ParseDuration(val); err == nil {
            return duration
        }
    }
    duration, _ := time.ParseDuration(defaultVal)
    return duration
}

func parseInt32(s string, defaultVal int32) int32 {
    if val, err := strconv.ParseInt(s, 10, 32); err == nil {
        return int32(val)
    }
    return defaultVal
}

func parseInt(s string, defaultVal int) int {
    if val, err := strconv.Atoi(s); err == nil {
        return val
    }
    return defaultVal
}
```

### 19.4 監視・アラート設定

```bash
# Cloud Monitoring アラートポリシー作成
gcloud alpha monitoring policies create   --notification-channels=CHANNEL_ID   --display-name="Cloud SQL High Connection Count"   --condition-display-name="Connection count > 80%"   --condition-threshold-value=240   --condition-threshold-duration=300s   --condition-filter='resource.type="cloudsql_database" AND metric.type="cloudsql.googleapis.com/database/postgresql/num_backends"'

# クエリ実行時間アラート
gcloud alpha monitoring policies create   --notification-channels=CHANNEL_ID   --display-name="Slow Query Detected"   --condition-display-name="Query duration > 5s"   --condition-threshold-value=5000   --condition-threshold-duration=60s   --condition-filter='resource.type="cloudsql_database" AND metric.type="cloudsql.googleapis.com/database/postgresql/insights/aggregate/execution_time"'
```

---

## **20. 可観測性・監査ログ設計**

### 20.1 OpenTelemetryトレース実装（EduMint固有パターン）

EduMintでは、試験アップロードから問題解析、ベクトル埋め込み生成、インデックス登録までの一連のフローを完全にトレースします。

#### **カスタムSpan属性定義**

```go
// internal/observability/tracing.go
package observability

const (
    // EduMint固有のSpan属性キー
    AttrExamPublicID        = "edumint.exam.public_id"
    AttrExamYear           = "edumint.exam.year"
    AttrInstitutionName    = "edumint.institution.name"
    AttrQuestionCount      = "edumint.question.count"
    AttrVectorDimension    = "edumint.vector.dimension"
    AttrEmbeddingModel     = "edumint.ai.embedding_model"
    AttrSimilarityScore    = "edumint.search.similarity_score"
    AttrUserRole           = "edumint.user.role"
)

// 試験処理フロー専用のトレースヘルパー
type ExamFlowTracer struct {
    serviceName string
}

func NewExamFlowTracer(svcName string) *ExamFlowTracer {
    return &ExamFlowTracer{serviceName: svcName}
}

func (eft *ExamFlowTracer) StartExamUpload(ctx context.Context, examPublicID, institutionName string, year int32) (context.Context, trace.Span) {
    tracer := otel.Tracer(eft.serviceName)
    ctx, span := tracer.Start(ctx, "exam.upload.flow")
    
    span.SetAttributes(
        attribute.String(AttrExamPublicID, examPublicID),
        attribute.String(AttrInstitutionName, institutionName),
        attribute.Int(AttrExamYear, int(year)),
    )
    
    return ctx, span
}

func (eft *ExamFlowTracer) RecordVectorGeneration(span trace.Span, questionCount int, dimension int, modelName string) {
    span.SetAttributes(
        attribute.Int(AttrQuestionCount, questionCount),
        attribute.Int(AttrVectorDimension, dimension),
        attribute.String(AttrEmbeddingModel, modelName),
    )
    span.AddEvent("vector_embedding_generated")
}
```

### 20.2 Prometheusカスタムメトリクス

```go
// internal/observability/metrics.go
package observability

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

var (
    // 試験アップロード処理時間（機関別）
    ExamUploadDurationSeconds = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "edumint_exam_upload_duration_seconds",
            Help:    "Time taken to process exam upload by institution",
            Buckets: []float64{1, 5, 10, 30, 60, 120, 300},
        },
        []string{"institution_type", "exam_year_category"},
    )
    
    // ベクトル検索クエリ性能
    VectorSearchPerformance = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "edumint_vector_search_ms",
            Help:    "Vector similarity search latency in milliseconds",
            Buckets: []float64{1, 5, 10, 25, 50, 100, 250, 500},
        },
        []string{"search_type", "result_count"},
    )
    
    // 問題生成AIワーカー状態
    AIWorkerQueueDepth = promauto.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "edumint_ai_worker_queue_depth",
            Help: "Number of pending AI processing jobs",
        },
        []string{"job_type", "priority"},
    )
    
    // データベース接続プール使用率（サービス別）
    DatabaseConnectionUtilization = promauto.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "edumint_db_connection_utilization_ratio",
            Help: "Database connection pool utilization (0-1)",
        },
        []string{"service_name", "database_name"},
    )
)

// メトリクス記録ヘルパー
type MetricsRecorder struct{}

func (mr *MetricsRecorder) RecordExamUpload(institutionType string, yearCategory string, durationSec float64) {
    ExamUploadDurationSeconds.WithLabelValues(institutionType, yearCategory).Observe(durationSec)
}

func (mr *MetricsRecorder) RecordVectorSearch(searchType string, resultCount int, latencyMs float64) {
    VectorSearchPerformance.WithLabelValues(searchType, fmt.Sprintf("%d", resultCount)).Observe(latencyMs)
}
```

### 20.3 構造化ログ設計（EduMint監査要件）

```go
// internal/observability/audit_logger.go
package observability

import (
    "context"
    "log/slog"
    "os"
)

// EduMint監査ログ専用構造
type AuditEvent struct {
    ActorUserID      string
    ActorRole        string
    ActionType       string
    ResourceType     string
    ResourceID       string
    InstitutionID    string
    BeforeSnapshot   map[string]interface{}
    AfterSnapshot    map[string]interface{}
    IPAddress        string
    UserAgent        string
    RequestTraceID   string
    ResultStatus     string
    ErrorDetails     string
}

// 監査ログ記録器
type AuditLogger struct {
    logger *slog.Logger
}

func NewAuditLogger() *AuditLogger {
    handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
        Level: slog.LevelInfo,
    })
    
    return &AuditLogger{
        logger: slog.New(handler),
    }
}

func (al *AuditLogger) LogExamModification(ctx context.Context, event AuditEvent) {
    al.logger.InfoContext(ctx, "exam_modification",
        slog.String("audit_category", "content_management"),
        slog.String("actor_user_id", event.ActorUserID),
        slog.String("actor_role", event.ActorRole),
        slog.String("action", event.ActionType),
        slog.String("resource_type", event.ResourceType),
        slog.String("resource_id", event.ResourceID),
        slog.String("institution_id", event.InstitutionID),
        slog.Any("before_state", event.BeforeSnapshot),
        slog.Any("after_state", event.AfterSnapshot),
        slog.String("client_ip", event.IPAddress),
        slog.String("trace_id", event.RequestTraceID),
        slog.String("status", event.ResultStatus),
    )
}

func (al *AuditLogger) LogAccessControl(ctx context.Context, userID, resourceType, resourceID, decision string) {
    al.logger.InfoContext(ctx, "access_control_decision",
        slog.String("audit_category", "security"),
        slog.String("user_id", userID),
        slog.String("resource_type", resourceType),
        slog.String("resource_id", resourceID),
        slog.String("decision", decision),
    )
}
```

### 20.4 BigQuery連携（日次監査ログエクスポート）

#### **エクスポート専用SQL関数**

```sql
-- 監査ログBigQueryエクスポート用関数
CREATE OR REPLACE FUNCTION export_audit_logs_for_date(target_date DATE)
RETURNS TABLE (
    log_id UUID,
    event_timestamp TIMESTAMPTZ,
    actor_user_id UUID,
    action_type VARCHAR(100),
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    institution_id UUID,
    before_state JSONB,
    after_state JSONB,
    status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id,
        timestamp,
        user_id,
        action,
        resource_type,
        resource_id,
        institution_id,
        before_state,
        after_state,
        status
    FROM audit_logs
    WHERE DATE(timestamp) = target_date
    ORDER BY timestamp;
END;
$$ LANGUAGE plpgsql;
```

#### **Cloud Functionエクスポート処理**

```go
// cloud_functions/audit_export/main.go
package auditexport

import (
    "context"
    "cloud.google.com/go/bigquery"
    "github.com/jackc/pgx/v5/pgxpool"
)

type DailyAuditExporter struct {
    pgPool  *pgxpool.Pool
    bqClient *bigquery.Client
}

func (dae *DailyAuditExporter) ExportYesterdayLogs(ctx context.Context) error {
    yesterday := time.Now().AddDate(0, 0, -1).Format("2006-01-02")
    
    // PostgreSQLから監査ログ取得
    query := `SELECT * FROM export_audit_logs_for_date($1)`
    rows, err := dae.pgPool.Query(ctx, query, yesterday)
    if err != nil {
        return fmt.Errorf("failed to query audit logs: %w", err)
    }
    defer rows.Close()
    
    // BigQueryへストリーミング挿入
    tableName := fmt.Sprintf("audit_logs_%s", strings.ReplaceAll(yesterday, "-", ""))
    inserter := dae.bqClient.Dataset("edumint_audit").Table(tableName).Inserter()
    
    var batchItems []*AuditLogBQSchema
    for rows.Next() {
        var item AuditLogBQSchema
        // ... スキャン処理
        batchItems = append(batchItems, &item)
        
        if len(batchItems) >= 500 {
            if err := inserter.Put(ctx, batchItems); err != nil {
                return fmt.Errorf("bigquery insert failed: %w", err)
            }
            batchItems = batchItems[:0]
        }
    }
    
    // 残りを挿入
    if len(batchItems) > 0 {
        if err := inserter.Put(ctx, batchItems); err != nil {
            return fmt.Errorf("bigquery insert failed: %w", err)
        }
    }
    
    return nil
}
```

---

## **21. テスト・CI/CD設計**

### 21.1 Testcontainersパターン（EduMint専用）

```go
// tests/integration/testhelpers/pg_container.go
package testhelpers

import (
    "context"
    "fmt"
    "testing"
    "time"
    
    "github.com/jackc/pgx/v5/pgxpool"
    "github.com/testcontainers/testcontainers-go"
    "github.com/testcontainers/testcontainers-go/modules/postgres"
    "github.com/testcontainers/testcontainers-go/wait"
)

type EduMintTestDatabase struct {
    container testcontainers.Container
    pool      *pgxpool.Pool
    connStr   string
}

func SetupEduMintTestDB(t *testing.T) *EduMintTestDatabase {
    ctx := context.Background()
    
    // PostgreSQL 18.1 + pgvector有効化
    pgContainer, err := postgres.RunContainer(ctx,
        testcontainers.WithImage("pgvector/pgvector:pg18"),
        postgres.WithDatabase("edumint_test"),
        postgres.WithUsername("test_user"),
        postgres.WithPassword("test_pass"),
        testcontainers.WithWaitStrategy(
            wait.ForLog("database system is ready").WithOccurrence(2).WithStartupTimeout(60*time.Second),
        ),
    )
    if err != nil {
        t.Fatalf("Could not start postgres container: %v", err)
    }
    
    connStr, err := pgContainer.ConnectionString(ctx, "sslmode=disable")
    if err != nil {
        t.Fatalf("Could not get connection string: %v", err)
    }
    
    // 接続プール作成
    pool, err := pgxpool.New(ctx, connStr)
    if err != nil {
        t.Fatalf("Could not create pool: %v", err)
    }
    
    // pgvector拡張を有効化
    _, err = pool.Exec(ctx, "CREATE EXTENSION IF NOT EXISTS vector")
    if err != nil {
        t.Fatalf("Could not enable pgvector: %v", err)
    }
    
    // Atlasマイグレーション適用
    if err := applyAtlasMigrations(t, connStr); err != nil {
        t.Fatalf("Migration failed: %v", err)
    }
    
    return &EduMintTestDatabase{
        container: pgContainer,
        pool:      pool,
        connStr:   connStr,
    }
}

func (etd *EduMintTestDatabase) Cleanup() {
    ctx := context.Background()
    etd.pool.Close()
    etd.container.Terminate(ctx)
}

func (etd *EduMintTestDatabase) SeedTestData(t *testing.T) {
    ctx := context.Background()
    
    // テスト用機関データ
    _, err := etd.pool.Exec(ctx, `
        INSERT INTO institutions (id, public_id, name_main, institution_type)
        VALUES (uuidv7(), 'INST0001', '東京テスト大学', 'university')
    `)
    if err != nil {
        t.Fatalf("Failed to seed test data: %v", err)
    }
}
```

#### **統合テスト実装例**

```go
// tests/integration/question_repository_test.go
package integration_test

import (
    "context"
    "testing"
    
    "github.com/pgvector/pgvector-go"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestQuestionRepository_VectorSearch(t *testing.T) {
    // テストDB準備
    testDB := testhelpers.SetupEduMintTestDB(t)
    defer testDB.Cleanup()
    
    testDB.SeedTestData(t)
    
    repo := NewQuestionRepository(testDB.pool)
    ctx := context.Background()
    
    // テストデータ: ベクトル埋め込み付き問題を作成
    embedding1 := make([]float32, 1536)
    for i := range embedding1 {
        embedding1[i] = 0.1
    }
    
    q1, err := repo.CreateWithEmbedding(ctx, CreateQuestionParams{
        PublicID:         "Q0000001",
        ExamID:           testExamID,
        QuestionText:     "物理学の運動方程式について説明せよ",
        ContentEmbedding: pgvector.NewVector(embedding1),
        SortOrder:        1,
    })
    require.NoError(t, err)
    
    // 類似ベクトルで検索
    queryVector := make([]float32, 1536)
    for i := range queryVector {
        queryVector[i] = 0.11 // わずかに異なるベクトル
    }
    
    results, err := repo.SearchSimilarByVector(ctx, SearchParams{
        QueryVector: pgvector.NewVector(queryVector),
        Limit:       5,
    })
    
    require.NoError(t, err)
    assert.Len(t, results, 1)
    assert.Equal(t, q1.PublicID, results[0].PublicID)
    assert.Greater(t, results[0].SimilarityScore, float64(0.95))
}
```

### 21.2 E2Eテストフレームワーク

```go
// tests/e2e/framework/edumint_test_env.go
package framework

type EduMintE2EEnvironment struct {
    APIBaseURL     string
    TestUserToken  string
    AdminToken     string
    TestInstitutionID string
    CleanupFuncs   []func()
}

func NewE2EEnvironment(t *testing.T) *EduMintE2EEnvironment {
    baseURL := os.Getenv("E2E_API_URL")
    if baseURL == "" {
        baseURL = "http://localhost:8080"
    }
    
    env := &EduMintE2EEnvironment{
        APIBaseURL:   baseURL,
        CleanupFuncs: make([]func(), 0),
    }
    
    // テストユーザー認証
    env.TestUserToken = env.authenticateTestUser("e2e_user@test.edumint.jp", "test_password_123")
    env.AdminToken = env.authenticateTestUser("admin@test.edumint.jp", "admin_password_456")
    
    // テスト機関作成
    env.TestInstitutionID = env.createTestInstitution("E2Eテスト大学")
    
    return env
}

func (env *EduMintE2EEnvironment) CleanupAll() {
    for _, cleanup := range env.CleanupFuncs {
        cleanup()
    }
}

func (env *EduMintE2EEnvironment) CreateExamWithQuestions(t *testing.T, examYear int32, questionCount int) string {
    // 試験作成APIリクエスト
    examPayload := map[string]interface{}{
        "institution_id": env.TestInstitutionID,
        "exam_year":      examYear,
        "status":         "draft",
    }
    
    examResp := env.postJSON("/api/v1/exams", examPayload, env.TestUserToken)
    require.Equal(t, http.StatusCreated, examResp.StatusCode)
    
    var examData map[string]interface{}
    json.NewDecoder(examResp.Body).Decode(&examData)
    examID := examData["exam_id"].(string)
    
    // クリーンアップ登録
    env.CleanupFuncs = append(env.CleanupFuncs, func() {
        env.deleteJSON(fmt.Sprintf("/api/v1/exams/%s", examID), env.AdminToken)
    })
    
    // 問題追加
    for i := 0; i < questionCount; i++ {
        questionPayload := map[string]interface{}{
            "exam_id":       examID,
            "question_text": fmt.Sprintf("テスト問題 %d", i+1),
            "sort_order":    i + 1,
        }
        
        questionResp := env.postJSON("/api/v1/questions", questionPayload, env.TestUserToken)
        require.Equal(t, http.StatusCreated, questionResp.StatusCode)
    }
    
    return examID
}
```

### 21.3 CI/CDパイプライン（完全版）

```yaml
# .github/workflows/edumint_pipeline.yml
name: EduMint Database CI/CD

on:
  push:
    branches: [main, develop, 'feature/**']
  pull_request:
    branches: [main, develop]

env:
  GO_VERSION: '1.25.7'
  ATLAS_CLI_VERSION: 'v1.0.0'
  SQLC_VERSION: 'v1.30.0'
  POSTGRES_IMAGE: 'pgvector/pgvector:pg18'

jobs:
  database-schema-validation:
    name: スキーマ検証
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Atlas CLI Setup
        run: |
          curl -sSf https://atlasgo.sh | sh -s -- --version ${ATLAS_CLI_VERSION}
      
      - name: HCLスキーマ構文チェック
        run: |
          atlas schema inspect             --env local             --url "file://internal/db/schema"
      
      - name: Schema Statistics生成
        run: |
          atlas schema stats \
            --env local \
            --output json > schema-stats.json

      - name: Upload Schema Statistics
        uses: actions/upload-artifact@v4
        with:
          name: schema-statistics
          path: schema-stats.json
      
      - name: 破壊的変更検出
        run: |
          atlas migrate lint             --env production             --dev-url "docker://postgres/18.1"             --latest 1
  
  sqlc-generation-check:
    name: sqlc生成確認
    runs-on: ubuntu-latest
    needs: database-schema-validation
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ env.GO_VERSION }}
          cache: true
      
      - name: Install sqlc
        run: |
          go install github.com/sqlc-dev/sqlc/cmd/sqlc@${SQLC_VERSION}
      
      - name: Generate & Verify
        run: |
          sqlc generate
          git diff --exit-code internal/db/dbgen/
      
      - name: Go Build Check
        run: |
          go build ./internal/db/dbgen/...
  
  unit-tests:
    name: ユニットテスト
    runs-on: ubuntu-latest
    needs: sqlc-generation-check
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ env.GO_VERSION }}
          cache: true
      
      - name: Run Unit Tests
        run: |
          go test -v -race -coverprofile=unit_coverage.out             -covermode=atomic             ./internal/service/...             ./internal/api/...
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./unit_coverage.out
          flags: unittests
  
  integration-tests:
    name: 統合テスト（Testcontainers）
    runs-on: ubuntu-latest
    needs: sqlc-generation-check
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ env.GO_VERSION }}
          cache: true
      
      - name: Run Integration Tests
        run: |
          go test -v -tags=integration             -coverprofile=integration_coverage.out             ./tests/integration/...
        env:
          TESTCONTAINERS_POSTGRES_IMAGE: ${{ env.POSTGRES_IMAGE }}
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./integration_coverage.out
          flags: integration
  
  e2e-tests:
    name: E2Eテスト
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ env.GO_VERSION }}
      
      - name: Start Services (Docker Compose)
        run: |
          docker-compose -f docker-compose.test.yml up -d
          sleep 10
      
      - name: Run E2E Tests
        run: |
          go test -v -tags=e2e ./tests/e2e/...
        env:
          E2E_API_URL: http://localhost:8080
      
      - name: Cleanup
        if: always()
        run: |
          docker-compose -f docker-compose.test.yml down -v
```

---

## **22. Goインテグレーション**

### 22.1 推奨プロジェクト構成

```
edumintContent/
├── cmd/
│   └── api/
│       └── main.go                     # エントリーポイント
├── internal/
│   ├── api/
│   │   ├── handlers/
│   │   │   ├── exam_handler.go        # 試験APIハンドラー
│   │   │   └── question_handler.go
│   │   ├── middleware/
│   │   │   ├── auth_middleware.go
│   │   │   └── tracing_middleware.go
│   │   └── router/
│   │       └── router.go               # ルーティング定義
│   ├── service/
│   │   ├── exam_service.go             # ビジネスロジック
│   │   └── question_service.go
│   ├── db/
│   │   ├── schema/                     # Atlas HCLスキーマ
│   │   ├── queries/                    # sqlcクエリ
│   │   ├── migrations/                 # Atlasマイグレーション
│   │   └── dbgen/                      # sqlc自動生成
│   ├── domain/
│   │   └── entities/                   # ドメインエンティティ
│   └── observability/
│       ├── tracing.go
│       ├── metrics.go
│       └── logging.go
├── tests/
│   ├── integration/
│   └── e2e/
├── atlas.hcl
├── sqlc.yaml
├── go.mod
└── Makefile
```

### 22.2 依存関係管理（go.mod）

```go
module github.com/edumint/edumint-content

go 1.25

require (
    // データベース
    github.com/jackc/pgx/v5 v5.8.0
    github.com/pgvector/pgvector-go v0.1.1
    
    // HTTP/ルーティング
    github.com/labstack/echo/v5 v5.0.1
    
    // 設定管理
    github.com/joho/godotenv v1.5.1
    cloud.google.com/go/secretmanager v1.11.5
    
    // 可観測性
    go.opentelemetry.io/otel v1.24.0
    go.opentelemetry.io/otel/sdk v1.24.0
    go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc v1.24.0
    github.com/prometheus/client_golang v1.19.0
    
    // テスト
    github.com/stretchr/testify v1.9.0
    github.com/testcontainers/testcontainers-go v0.29.1
    github.com/testcontainers/testcontainers-go/modules/postgres v0.29.1
    
    // その他
    github.com/google/uuid v1.6.0
    github.com/matoous/go-nanoid/v2 v2.0.0
)
```

### 22.3 クリーンアーキテクチャ実装

```go
// internal/service/exam_orchestrator.go
package service

import (
    "context"
    "fmt"
    "time"
    
    "github.com/edumint/edumint-content/internal/db/dbgen"
    "github.com/edumint/edumint-content/internal/observability"
)

// ExamOrchestrator: 試験処理の統合オーケストレーター
type ExamOrchestrator struct {
    dbQueries *dbgen.Queries
    tracer    *observability.ExamFlowTracer
    metrics   *observability.MetricsRecorder
    auditLog  *observability.AuditLogger
}

func NewExamOrchestrator(
    queries *dbgen.Queries,
    tracer *observability.ExamFlowTracer,
    metrics *observability.MetricsRecorder,
    auditLog *observability.AuditLogger,
) *ExamOrchestrator {
    return &ExamOrchestrator{
        dbQueries: queries,
        tracer:    tracer,
        metrics:   metrics,
        auditLog:  auditLog,
    }
}

// CreateExamWithQuestions: トランザクション内で試験と問題を一括作成
func (eo *ExamOrchestrator) CreateExamWithQuestions(
    ctx context.Context,
    req CreateExamRequest,
) (*ExamCreationResult, error) {
    
    startTime := time.Now()
    
    // トレーシング開始
    ctx, span := eo.tracer.StartExamUpload(ctx, req.PublicID, req.InstitutionName, req.ExamYear)
    defer span.End()
    
    // トランザクション開始
    tx, err := eo.dbQueries.BeginTx(ctx)
    if err != nil {
        return nil, fmt.Errorf("transaction start failed: %w", err)
    }
    defer tx.Rollback(ctx)
    
    qtx := eo.dbQueries.WithTx(tx)
    
    // 試験作成
    exam, err := qtx.InsertExam(ctx, dbgen.InsertExamParams{
        PublicID:      req.PublicID,
        InstitutionID: req.InstitutionID,
        SubjectID:     req.SubjectID,
        ExamYear:      req.ExamYear,
        Status:        dbgen.ExamStatusEnumDraft,
    })
    if err != nil {
        span.RecordError(err)
        return nil, fmt.Errorf("exam insertion failed: %w", err)
    }
    
    // 問題一括挿入
    questionIDs := make([]string, 0, len(req.Questions))
    for idx, q := range req.Questions {
        question, err := qtx.InsertQuestion(ctx, dbgen.InsertQuestionParams{
            PublicID:     q.PublicID,
            ExamID:       exam.ID,
            QuestionText: q.Text,
            SortOrder:    int32(idx + 1),
        })
        if err != nil {
            span.RecordError(err)
            return nil, fmt.Errorf("question insertion failed at index %d: %w", idx, err)
        }
        questionIDs = append(questionIDs, question.ID.String())
    }
    
    // 監査ログ記録
    eo.auditLog.LogExamModification(ctx, observability.AuditEvent{
        ActorUserID:  req.ActorUserID,
        ActorRole:    req.ActorRole,
        ActionType:   "exam.created",
        ResourceType: "exam",
        ResourceID:   exam.PublicID,
        InstitutionID: req.InstitutionID,
        AfterSnapshot: map[string]interface{}{
            "exam_id":        exam.ID,
            "question_count": len(questionIDs),
            "exam_year":      req.ExamYear,
        },
        ResultStatus: "success",
    })
    
    // コミット
    if err := tx.Commit(ctx); err != nil {
        return nil, fmt.Errorf("transaction commit failed: %w", err)
    }
    
    // メトリクス記録
    duration := time.Since(startTime).Seconds()
    eo.metrics.RecordExamUpload(req.InstitutionType, fmt.Sprintf("year_%d", req.ExamYear), duration)
    
    return &ExamCreationResult{
        ExamID:       exam.ID.String(),
        ExamPublicID: exam.PublicID,
        QuestionIDs:  questionIDs,
    }, nil
}
```

---

## **23. AIエージェント協働**

### 23.1 AIコード生成プロンプトテンプレート

#### **sqlcクエリ生成プロンプト**

```markdown
# EduMint専用sqlcクエリ生成依頼

## コンテキスト
- プロジェクト: EduMint（教育コンテンツ管理プラットフォーム）
- データベース: PostgreSQL 18.1 + pgvector 0.8
- 主キー: uuidv7()を使用（gen_random_uuid()禁止）
- ドライバー: pgx/v5

## テーブル定義
```sql
CREATE TABLE exam_analytics (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    public_id VARCHAR(8) NOT NULL UNIQUE,
    exam_id UUID NOT NULL REFERENCES exams(id),
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    avg_similarity_score DECIMAL(5,4),
    last_viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

## 生成要件
1. クエリ名: GetExamAnalyticsWithTrend
2. 機能: 試験IDから分析データを取得し、過去7日間との比較トレンドを計算
3. パラメータ:
   - exam_id (UUID)
   - comparison_days (INTEGER, デフォルト7)
4. 返り値:
   - 現在の分析データ全カラム
   - 過去比較期間のview_count平均
   - トレンド（増加率）
5. 注意事項:
   - ウィンドウ関数を使用してパフォーマンス最適化
   - NULL値の適切な処理

## 出力形式
sqlc annotation付きSQL（-- name: で開始）
```

#### **Atlas HCL生成プロンプト**

```markdown
# EduMint専用Atlas HCLスキーマ生成依頼

## テーブル要件
テーブル名: question_collaboration
目的: 複数教員による問題共同編集の履歴管理

## カラム定義
1. id: UUID, uuidv7()デフォルト, PRIMARY KEY
2. public_id: VARCHAR(8), NOT NULL, UNIQUE
3. question_id: UUID, NOT NULL, 外部キー questions(id), CASCADE削除
4. collaborator_user_id: UUID, NOT NULL, 外部キー users(id)
5. contribution_type: ENUM('original_author', 'reviewer', 'editor'), NOT NULL
6. contributed_at: TIMESTAMPTZ, デフォルトCURRENT_TIMESTAMP
7. contribution_note: TEXT, NULL許可
8. is_active: BOOLEAN, デフォルトtrue

## インデックス要件
1. B-tree: (question_id, contributed_at DESC)
2. B-tree: (collaborator_user_id, is_active)
3. 複合UNIQUE: (question_id, collaborator_user_id, contribution_type)

## 制約
- contribution_typeは定義されたENUM値のみ
- collaborator_user_idは問題作成者と異なる必要がある（CHECK制約）

## 出力形式
Atlas HCL v2構文
```

### 23.2 AIコードレビューチェックリスト

```markdown
# EduMintデータベースコード変更レビューチェックリスト

## 1. スキーマ設計（Atlas HCL）
- [ ] 主キーにuuidv7()を使用（gen_random_uuid()使用禁止）
- [ ] public_idカラムはVARCHAR(8) + UNIQUE制約
- [ ] 外部キー制約にON DELETE/UPDATE句を明示
- [ ] ENUM型定義が適切（値が明確、拡張可能）
- [ ] タイムスタンプカラムはTIMESTAMPTZ型使用
- [ ] ベクトルカラムはvector(1536)で統一

## 2. インデックス設計
- [ ] 主キー以外の検索条件カラムにインデックス作成
- [ ] 外部キーカラムにインデックス作成
- [ ] 複合インデックスのカラム順が適切（カーディナリティ順）
- [ ] ベクトル検索用HNSWインデックスのパラメータ最適化
- [ ] 全文検索用GINインデックスの適切な設定

## 3. sqlcクエリ
- [ ] クエリ名が明確（動詞+対象形式: GetExamByID）
- [ ] パラメータの型指定が正確（::vector, ::uuid）
- [ ] LIMIT句はハードコード禁止（パラメータ化必須）
- [ ] JOIN使用時のN+1問題回避を確認
- [ ] トランザクション境界が適切

## 4. Goコード
- [ ] context.Contextを第一引数に使用
- [ ] エラーは必ずfmt.Errorfでラップ
- [ ] pgvector.Vectorの適切な使用
- [ ] ENUM型のValid()メソッド呼び出し
- [ ] データベース接続プールの適切な管理

## 5. セキュリティ
- [ ] SQLインジェクション対策（バインド変数使用）
- [ ] 個人情報カラムの暗号化検討
- [ ] IAM権限が最小権限原則に準拠
- [ ] 監査ログに全変更を記録

## 6. パフォーマンス
- [ ] EXPLAIN ANALYZEでクエリプラン確認
- [ ] インデックスが実際に使用されることを確認
- [ ] N+1問題の回避
- [ ] 適切なページネーション実装

## 7. テスト
- [ ] Testcontainersで統合テスト実装
- [ ] ベクトル検索の精度テスト
- [ ] トランザクション挙動の検証
- [ ] エラーハンドリングの網羅的テスト
```

### 23.3 AI協働開発フロー

```mermaid
graph TD
    A[要件定義] -->|AIに依頼| B[スキーマ設計案生成]
    B --> C[人間レビュー]
    C -->|修正指示| B
    C -->|承認| D[Atlas HCL実装]
    D -->|AIに依頼| E[sqlcクエリ生成]
    E --> F[人間レビュー]
    F -->|修正指示| E
    F -->|承認| G[Goサービス実装]
    G -->|AIに依頼| H[テストコード生成]
    H --> I[人間レビュー]
    I -->|修正指示| H
    I -->|承認| J[CI/CD実行]
    J --> K{テスト結果}
    K -->|失敗| L[AIに分析依頼]
    L --> M[修正実装]
    M --> J
    K -->|成功| N[デプロイ]
```

### 23.4 AIペアプログラミングパターン

#### **パターン1: スキーマ拡張**

```
開発者: 「教員の資格情報を管理する新しいテーブルが必要です。
         Atlas HCLで teacher_certifications テーブルを設計してください。
         
         要件:
         - 教員IDとの1:N関係
         - 資格名、取得日、有効期限
         - 有効期限切れ検出用のインデックス」

AI: [Atlas HCL生成]

開発者: [レビュー] 「有効期限のCHECK制約を追加してください」

AI: [修正版生成]

開発者: [承認] 「次に、このテーブルのCRUD操作用sqlcクエリを生成してください」
```

#### **パターン2: クエリ最適化**

```
開発者: 「このクエリが遅いです。EXPLAIN ANALYZEの結果を添付します。
         [結果貼り付け]
         
         最適化案を提示してください。」

AI: [分析結果 + 最適化されたクエリ案]

開発者: [新しいクエリでベンチマーク] 「5倍高速化しました。ありがとう」
```

#### **パターン3: テスト補完**

```
開発者: 「このサービスメソッドのテストケースが不足しています。
         [コード貼り付け]
         
         エッジケースを網羅したテストを追加してください。」

AI: [テストケース生成]
    - 正常系
    - 異常系（存在しないID）
    - 境界値（空文字列、NULL）
    - 並行実行
    - トランザクションロールバック

開発者: [テスト実行] 「全てパスしました」
```

---

**本ドキュメントの終わり**

---

**v7.0.2 更新日**: 2026-02-06

**v7.0.2 主要変更点のまとめ:**

1. **技術スタックを2026年2月最新版に更新**
   - Go 1.25.7、PostgreSQL 18.1、pgvector 0.8.1、Atlas v1.0.0、sqlc 1.30.0、pgx v5.8.0、Echo v5.0.1
   
2. **Webフレームワーク: Echo v5.0.1に統一**
   - Chi, Gin, Echo v4を全面禁止
   - エラーハンドリングの刷新、ルーターの最適化
   
3. **設定管理: .env + Secret Managerに統一**
   - Dev環境: `.env`ファイル
   - Production環境: Google Cloud Secret Manager
   - Doppler廃止
   
4. **pgvector 0.8.1の新機能対応**
   - 反復インデックススキャン (Iterative Index Scans)
   - HNSWインデックス構築の高速化（最大30%削減）
   
5. **Atlas v1.0.0の新機能対応**
   - Monitoring as Code
   - Schema Statistics機能
   - Production環境での自動監視
   
6. **PostgreSQL 18.1の最適化**
   - AIO (Asynchronous I/O) 設定
   - B-tree Skip Scan有効化
   - pgvector 0.8.1用パラメータ最適化
   
7. **Go 1.25.7対応**
   - 最新のセキュリティ修正
   - コンパイラ最適化
   - pgx v5.8.0との完全統合

---

**v7.0.1 更新日**: 2025-02-06

**v7.0.1 主要変更点のまとめ:**
1. 禁止ツール・ライブラリリスト追加（セクション2）
   - golang-migrate, Echo v4, lib/pq, GORM, gen_random_uuid(), fmt.Println()等を明示的に禁止
   - Atlas, sqlc, pgx/v5, slog等の推奨ツールを明記
2. pgvector + HNSWインデックス完全設計（セクション17）
   - 1536次元ベクトル設計、HNSWパラメータチューニング
   - pgvector.NewVector統合、sqlcクエリ例、Atlas HCL定義
3. Atlas HCL + sqlcワークフロー統合（セクション18）
   - ディレクトリ構成標準、atlas.hcl完全設定
   - ENUM型完全自動化、開発ワークフロー、CI/CD統合
4. Cloud SQL運用設定・IAM認証パターン（セクション19）
   - 推奨パラメータ設定、IAM最小権限例
   - Doppler統合、Go接続プール設定、監視アラート
5. 可観測性・監査ログ設計（セクション20）
   - OpenTelemetryトレース（EduMint固有Span属性）
   - Prometheusカスタムメトリクス、構造化監査ログ
   - BigQuery連携による日次ログエクスポート
6. テスト・CI/CD設計（セクション21）
   - Testcontainersパターン、E2Eテストフレームワーク
   - Atlas Lint + sqlc検証 + 統合テストの完全パイプライン
7. Goインテグレーションパターン（セクション22）
   - プロジェクト構成標準、依存関係管理
   - クリーンアーキテクチャ実装例
8. AIエージェント協働ガイド（セクション23）
   - AIコード生成プロンプトテンプレート
   - コードレビューチェックリスト、AI協働開発フロー

**v7.0.0からの継続:**
- UUID + NanoID主キー設計（uuidv7()統一、gen_random_uuid()全廃止）
- マイクロサービス別章立て（セクション4-14）
- ログテーブル物理DB分離設計
- ENUM型厳格化、外部API非依存設計

この設計書は、EduMintのプレリリース前の初期DB構築を前提としています。本番稼働後の変更は、適切なマイグレーション戦略と共に実施してください。
