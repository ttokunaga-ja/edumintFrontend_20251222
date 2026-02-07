# **EduMint 統合データモデル設計書 v7.5.1**

本ドキュメントは、EduMintのマイクロサービスアーキテクチャに基づいた、統合されたデータモデル設計です。各テーブルの所有サービス、責務、外部API非依存の自己完結型データ管理を定義します。

**最終更新日: 2026-02-07**

**v7.5.1 主要更新:**
- **edumintSearch完全定義**: search_queries, search_cache本体DBテーブル、search_logsパーティション設計、Elasticsearch同期戦略を追加
- **OCRコンテンツタイプENUM簡略化**: 5タイプ → 2タイプ（exercises, materials）に集約、過度な分類を避けメタデータで詳細管理
- **edumintFiles参照の明確化**: マイクロサービス境界の物理FK非設定原則、アプリケーション層バリデーション実装例を追加
- **Kafkaトピック設計統合**: CDC/アプリケーションイベントの明確な分類と使い分けガイドを追加
- **edumintSocialログテーブル追加**: social_logsテーブル（パーティション設計、event_type一覧、sqlcクエリ例）を新設
- **国際化対応完全実装指針**: 全エンティティ（faculties, departments, teachers, subjects）の国際化テーブルDDL、API設計、フロントエンド実装例を追加
- **不正防止戦略実装詳細**: 異常アクセスパターン検出（Redisレート制限、Prometheusメトリクス、Grafanaダッシュボード、自動通報システム）の具体的実装を追加

**v7.4.1 主要更新:**
- **段階的コンテンツ開示機能**: 大問1全文+大問2以降構造のみ表示、広告視聴後に全文解除
- **広告配信制御強化**: 外部要因対応（MVP期間、広告障害、キャンペーン）のad_delivery_configテーブル新設
- **ユーザー広告免除設定**: 新規ユーザー判定（登録後7日間）、MintCoin自動使用のuser_ad_exemptionsテーブル新設
- **コンテンツ解除トークン管理**: JWT署名・不正防止のcontent_unlock_tokensテーブル新設
- **Redis戦略導入**: 広告配信ステータス、ユーザー免除設定、トークン検証のキャッシュ層（TTL: 60秒〜300秒）
- **レート制限実装**: コンテンツアクセス（10回/時）、トークン発行（5回/時）、広告視聴完了（5回/分）
- **不正防止戦略**: トークン再利用防止、改竄検出、異常アクセスパターン検出
- **API設計追加**: 初期表示API、広告視聴完了API、コンテンツ解除API（section 22.7-22.9）
- **ENUM型の徹底化**: 高優先度・中優先度のENUM型を全面導入（IdPプロバイダー、マッチングタイプ、トークンタイプ、投稿タイプ、通報理由など）
- **IdPプロバイダー拡張**: Meta系サービス（Facebook、Instagram）追加、電話番号認証対応IdPを優先採用
- **マッチングタイプ拡張**: 友達探し、先輩/後輩探し、恋人探し等の新規タイプ追加
- **試験生成フロー設計修正**: 複数ファイル → 1 master_ocr_contents → 1 exam の関係を明確化
- **master_ocr_contents テーブル修正**: 
  - `question_id`, `sub_question_id` 削除（exam との 1対1 関係に特化）
  - `source_file_ids UUID[]` 配列追加（元ファイルの完全追跡）
  - `source_file_count`, `has_text_input`, `text_input_content` 追加
  - 排他制約削除、GINインデックス追加
- **exams テーブル修正**: 
  - `master_ocr_content_id UUID UNIQUE` 追加（1対1関係）
  - `file_input_id` 削除（master_ocr_contents経由でファイル追跡）
- **usersテーブル更新**: `registration_completed_at TIMESTAMPTZ` 追加（新規ユーザー判定用）
- **既存テーブルのENUM型適用**: oauth_tokens, idp_links, user_posts, dm_conversations, user_matches, content_reports, user_reports, revenue_reports, copyright_claims 等

**v7.4.0 主要更新:**
- **広告表示回数統計強化**: `exam_statistics` に広告表示カウント、推定収益、最終表示日時カラムを追加
- **広告視聴進捗管理テーブル新設**: `ad_viewing_progress` テーブル作成、ユーザー別視聴段階記録
- **広告スキップロジック実装**: 視聴段階に基づく広告表示判定機能の追加
- **国際化対応強化**: `institutions`, `faculties`, `departments`, `teachers`, `subjects`, `keywords` に国際化サポート追加
  - `region_code CHAR(2)` カラム追加（ISO 3166-1 alpha-2）
  - SEO最適化のため `name` カラムを英語化
  - 既存 `name_main` → `display_name` に移行（多言語表示用）
  - `display_language VARCHAR(10)` 追加（BCP 47準拠）
  - `name_sub1`, `name_sub2`, `name_sub3` 削除
- **閲覧履歴・評価・コメント絞り込み負荷分析**: 
  - `idx_exam_interaction_events_user_type_time` 複合インデックス追加
  - 負荷テスト結果と性能評価の追加
  - スケーリング戦略（リードレプリカ、キャッシュ層、パーティション分割）
- **Atlas HCL・sqlc・Goコード更新**: 国際化対応クエリとサービス実装例追加
- **API応答例更新**: 広告視聴進捗と国際化対応のAPI応答サンプル追加
- **Elasticsearchインデックス更新**: 多言語対応と広告統計フィールド追加
- **ad_viewing_history削除**: ad_viewing_progressに統合

**v7.3.0 主要更新:**
- **master_exams/materials統合設計**: 2テーブルから1テーブル（master_ocr_contents）へ統合
- **OCRコンテンツタイプENUM新設**: `ocr_content_type_enum` ('exercises', 'material')
- **ENUM命名変更**: 'exam' → 'exercises'（公開用Examとの誤解防止）
- **bucket_name自動生成**: GENERATED ALWAYS AS による自動設定、人的ミス不可
- **DDL保守負荷削減**: 1テーブル管理、カラム追加1回で完結
- **スキーマ拡張性向上**: 新タイプ追加時、ENUM値追加のみで対応可能
- **型安全性3層防御**: PostgreSQL ENUM + Go ENUM + TypeScript ENUMの統一管理
- **統合設計採用理由**:
  1. DDL保守負荷最小化（1テーブル管理）
  2. スキーマ拡張性（新タイプはENUM追加のみ）
  3. 型安全性確保（PostgreSQL ENUM + Go ENUM + TypeScript ENUMの3層防御）
  4. GCSバケット自動設定（GENERATED ALWAYS AS、人的ミス不可）
  5. 著作権申立て対応簡素化（1テーブル検索）

**v7.2.0 主要更新:**
- **edumintContentsを4DB構成に拡張**: セキュリティ、性能、スケーラビリティ、コスト効率の最適化
  - `edumint_contents` (メインDB): 試験・問題・統計・広告管理
  - `edumint_contents_search` (検索用DB): 検索用語テーブル群の分離
  - `edumint_contents_master` (マスターDB): OCRテキスト専用（暗号化対象）
  - `edumint_contents_logs` (ログDB): ログデータの分離（既存）
- **master_exams/materials分離強化**: 独立したDB・IAMロールでセキュリティ向上（v7.3.0で統合設計へ移行）
- **検索用語テーブル分離**: I/O競合解消、Debezium CDC精密制御
- **Debezium 2コネクタ構成**: edumint_contents と edumint_contents_search の個別同期
- **段階的スケーリング戦略**: DB単位での独立したスケールアウト対応
- **総コスト約15%削減**: メインDB縮小可能、最適なインスタンス配分

**v7.1.0 主要更新:**
- **マイクロサービス統合**: edumintAuth + edumintUserProfile → **edumintUsers**に統合（トランザクション整合性・レイテンシ削減）
- **ファイル管理とOCRテキスト管理の分離**: **edumintFiles**サービスは原本ファイル保存に専念、OCRテキストは**edumintContents**の`master_exams`, `master_materials`で管理（v7.3.0で`master_ocr_contents`に統合）
- **テーブル名変更**: `exam_raw` → **`master_exams`**, `source_raw` → **`master_materials`**（イミュータブル設計）（v7.3.0で`master_ocr_contents`に統合）
- **自動暗号化機能**: ファイルアップロード7日後に自動暗号化実装
- **edumintSearch無状態化**: 物理DB削除、Elasticsearch + ログDBのみに変更
- **Debezium CDC導入**: PostgreSQL論理レプリケーション、Kafka経由リアルタイム差分同期
- **検索用語管理移管**: `*_terms`, `term_generation_*`テーブルをedumintContentsへ移動
- **広告管理機能追加**: `ad_display_events`, `ad_viewing_history`テーブル新設（4段階表示戦略）
- **サービス名統一**: 複数形に統一（edumintContents, edumintUsers, edumintGateways）

**v7.0.3 主要更新:**
- **edumintSocialの責務再定義**: 統計情報管理をedumintContentsへ移管、ソーシャル機能に特化
- **edumintContentsに統計管理機能追加**: `exam_statistics`, `exam_interaction_events`テーブル新設
- **SNS機能拡張**: ユーザー投稿、DM、マッチング機能用テーブル追加
- **イベント駆動フロー強化**: `content.interaction`トピック新設、統計更新の非同期化
- **検索・推薦システムの改善**: 統計情報への直接アクセスによる性能向上

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

4. [edumintUsers (統合ユーザー管理サービス)](#4-edumintusers-統合ユーザー管理サービス)
5. [edumintContents (コンテンツ・OCRテキスト管理サービス)](#5-edumintcontents-コンテンツocrテキスト管理サービス)
6. [edumintFiles (ファイルストレージ管理サービス)](#6-edumintfiles-ファイルストレージ管理サービス)
7. [edumintSearch (検索サービス)](#7-edumintsearch-検索サービス)
8. [edumintAiWorker (AI処理サービス)](#8-edumintaiworker-ai処理サービス)
9. [edumintSocial (ソーシャルサービス)](#9-edumintsocial-ソーシャルサービス)
10. [edumintMonetizeWallet (ウォレット管理サービス)](#10-edumintmonetizewallet-ウォレット管理サービス)
11. [edumintRevenue (収益分配サービス)](#11-edumintrevenue-収益分配サービス)
12. [edumintModeration (通報管理サービス)](#12-edumintmoderation-通報管理サービス)
13. [edumintGateways (ジョブゲートウェイ)](#13-edumintgateways-ジョブゲートウェイ)

**統合設計編**

13. [Debezium CDC レプリケーション設計](#14-debezium-cdc-レプリケーション設計)
14. [イベント駆動フロー](#15-イベント駆動フロー)
15. [データベース設計ガイドライン](#16-データベース設計ガイドライン)
16. [pgvector + ベクトル検索設計](#17-pgvectorベクトル検索設計)
17. [Atlas HCL + sqlcワークフロー](#18-atlas-hclsqlcワークフロー)
18. [Cloud SQL運用設定](#19-cloud-sql運用設定)
19. [可観測性・監査ログ設計](#20-可観測性監査ログ設計)
20. [テスト・CI/CD設計](#21-テストcicd設計)
21. [Goインテグレーション](#22-goインテグレーション)
22. [AIエージェント協働](#23-aiエージェント協働)

---

## **1. アーキテクチャ前提**

### 基本設計原則

*   **Database per Service**: 各マイクロサービスが自身のデータベースを所有する。
*   **イベント駆動統合**: サービス間の協調は Kafka を通じたイベントで実現。
*   **最終整合性**: ドメインサービス間のデータ同期は結果整合性（Eventual Consistency）を基本とする。ただし金銭取引（ウォレット）は強整合性を維持。
*   **単一オーナーシップ**: 各テーブルの書き込み権限は、当該サービスのみ。他サービスは API または Kafka イベント経由で参照・反映。
*   **責務分離の徹底**: 
  *   **edumintFiles**: 原本ファイルの物理ストレージ管理に専念（PDF、画像等のバイナリデータ）
  *   **edumintContents**: OCRテキストデータとコンテンツメタデータの管理に専念
  *   両サービスはAPI/イベント駆動で連携し、各々の責務範囲を明確に分離
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

*   **Phase 1 (MVP)**: edumintGateways, edumintUsers, edumintContents, edumintFiles, edumintAiWorker, edumintSearch
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

#### **1.3.1. OCRコンテンツタイプENUM（v7.3.0新設、v7.5.1簡略化）**

**設計方針:**
- 過度な分類を避け、2つのカテゴリに集約
- `exercises`: 試験問題、演習問題、過去問など
- `materials`: 教科書、講義資料、ノートなど
- 詳細な分類はメタデータ（JSONB）で管理

```sql
-- OCRコンテンツタイプ（v7.3.0新設、v7.5.1簡略化）
CREATE TYPE ocr_content_type AS ENUM (
  'exercises',  -- 演習問題・試験問題
  'materials'   -- 教材・資料
);
```

**file_type ENUMとの関係:**
- `file_metadata.file_type`: 物理ファイル形式（PDF, IMAGE, DOCXなど）
- `master_ocr_contents.content_type`: 論理コンテンツ種別（exercises, materials）
- 同一PDFファイルでもOCR解析結果によって `content_type` が決定される

**設計注記:**
- **'exercises'命名理由**: 公開用のExam（試験データ）との誤解防止。OCRテキスト元データは「演習問題」として明確化
- **統合設計**: master_exams/master_materials分離から master_ocr_contents統合へ移行
- **型安全性**: PostgreSQL ENUM + Go ENUM + TypeScript ENUMの3層防御

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

-- 認証イベント（v7.5.0拡張版）
CREATE TYPE auth_event_enum AS ENUM (
  'login_success',           -- ログイン成功
  'login_failed',            -- ログイン失敗
  'logout',                  -- ログアウト
  'token_issued',            -- トークン発行
  'token_refreshed',         -- トークン更新
  'token_revoked',           -- トークン無効化
  'password_changed',        -- パスワード変更
  'mfa_enabled',             -- 多要素認証有効化
  'account_locked',          -- アカウントロック
  'idp_auth_started',        -- IdP認証開始
  'idp_auth_callback',       -- IdPコールバック受信
  'idp_auth_success',        -- IdP認証成功
  'idp_auth_failed',         -- IdP認証失敗
  'idp_linked',              -- IdP新規紐付け
  'idp_unlinked',            -- IdP紐付け解除
  'idp_primary_changed',     -- プライマリIdP変更
  'university_email_verified' -- 大学メール認証完了（バッジ付与）
);

-- 外部IdPプロバイダー（v7.5.0改訂版: Meta統合、Twitter廃止）
CREATE TYPE idp_provider_enum AS ENUM (
  'google',        -- ✅ OAuth API無料、Identity Platform使用時のみMAU課金
  'apple',         -- ✅ OAuth無料、Developer Program $99/年（必須登録費用）
  'meta',          -- ✅ Facebook/Instagram統合、OAuth完全無料
  'microsoft',     -- ✅ OAuth無料、Azure AD/Entra ID大規模向け有料プランあり
  'line',          -- ✅ OAuth無料、Messaging API使用時のみ課金（認証は無料）
  'github'         -- ✅ OAuth完全無料、API制限あるがレート制限のみ
);

-- OAuth2.0トークンタイプ（v7.4.1新設）
CREATE TYPE token_type_enum AS ENUM (
  'Bearer',
  'MAC',
  'Basic'
);
```

**IdP選定理由とコスト調査結果（v7.5.0）:**
- **Google**: OAuth API無料、Identity Platform使用時のみMAU課金（50,000 MAU未満無料）。教育機関との連携強い。
- **Apple**: OAuth無料、Developer Program $99/年（必須登録費用）。プライバシー重視、Sign in with Apple必須化。
- **Meta**: Facebook/InstagramをMeta OAuth基盤として統一管理。OAuth完全無料、Graph API基本無料。月間30億+20億MAU。
- **Microsoft**: OAuth無料、Azure AD/Entra ID大規模向け有料プランあり。企業・教育機関向け。
- **LINE**: OAuth無料、Messaging API使用時のみ課金（認証は無料）。日本国内シェア90%超。
- **GitHub**: OAuth完全無料、API制限あるがレート制限のみ。開発者向け。
- **❌ Twitter廃止**: X(旧Twitter) API有料化、サービス不安定性により廃止。既存ユーザーは移行期間後に削除。

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
  'exam_creation',      -- 試験生成
  'file_upload',        -- ファイルアップロード
  'ocr_processing',     -- OCR処理
  'ai_analysis',        -- AI構造分析
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

-- 通報対象エンティティタイプ（v7.4.1新設: 中優先度）
CREATE TYPE reportable_entity_type_enum AS ENUM (
  'exam',
  'question',
  'comment',
  'post',
  'user_profile'
);

-- ユーザー通報理由（v7.4.1新設: 中優先度）
CREATE TYPE user_report_reason_enum AS ENUM (
  'spam',
  'harassment',
  'inappropriate_content',
  'impersonation',
  'hate_speech',
  'violence',
  'other'
);

-- 通報カテゴリ（v7.4.1新設: 中優先度）
CREATE TYPE report_category_enum AS ENUM (
  'content_report',
  'user_report'
);

-- 著作権侵害申し立てステータス（v7.5.1新設）
CREATE TYPE copyright_claim_status AS ENUM (
  'pending',       -- 審査待ち
  'investigating', -- 調査中
  'accepted',      -- 申し立て受理（削除実施）
  'rejected',      -- 申し立て却下
  'withdrawn'      -- 申し立て取り下げ
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

-- 広告表示段階（v7.1.0新設）
CREATE TYPE ad_display_stage_enum AS ENUM (
  'question_view',      -- 問題文閲覧時（未ログインOK）
  'answer_explanation', -- 解答・解説閲覧時（ログイン必須）
  'download',       -- PDFダウンロード時（ログイン必須）
);

-- 収益ステータス（v7.4.1新設: 中優先度）
CREATE TYPE revenue_status_enum AS ENUM (
  'pending',
  'calculated',
  'paid',
  'cancelled',
  'refunded'
);

-- 著作権申し立てステータス（v7.4.1新設: 中優先度）
CREATE TYPE claim_status_enum AS ENUM (
  'pending',
  'reviewing',
  'upheld',
  'dismissed',
  'appealed'
);

-- 広告配信ステータス（v7.4.1新設: 段階的コンテンツ開示機能）
CREATE TYPE ad_delivery_status_enum AS ENUM (
  'active',           -- 通常配信中
  'mvp_free',         -- MVP期間（広告無料）
  'provider_outage',  -- 広告プロバイダー障害
  'campaign_free',    -- キャンペーン期間（広告無料）
  'maintenance'       -- メンテナンス中
);

-- 広告視聴権限ロール（v7.4.1新設: ユーザー広告免除設定）
CREATE TYPE ad_exemption_role_enum AS ENUM (
  'standard',         -- 標準ユーザー（広告視聴必須）
  'new_user',         -- 新規ユーザー（登録後7日間免除）
  'mintcoin_auto',    -- MintCoin自動使用
  'premium',          -- プレミアム会員
  'staff'             -- スタッフ・管理者
);

-- コンテンツ解除トークンステータス（v7.4.1新設: 不正防止機能）
CREATE TYPE content_unlock_token_status_enum AS ENUM (
  'valid',            -- 有効
  'expired',          -- 期限切れ
  'revoked',          -- 無効化済み
  'fraud_detected'    -- 不正検出
);

-- 広告配信ステータス（v7.5.1新設）
CREATE TYPE ad_delivery_status AS ENUM (
  'active',      -- 配信中
  'paused',      -- 一時停止
  'scheduled',   -- 配信予約
  'completed',   -- 配信完了
  'cancelled'    -- 配信中止
);
```

#### **1.7. ソーシャル機能関連ENUM（v7.4.1新設）**

```sql
-- SNS投稿タイプ（v7.4.1新設: 高優先度）
CREATE TYPE post_type_enum AS ENUM (
  'text',
  'exam_share',
  'question',
  'achievement',
  'study_log'
);

-- 投稿公開範囲（v7.4.1新設: 高優先度）
CREATE TYPE post_visibility_enum AS ENUM (
  'public',
  'followers',
  'private'
);

-- DM会話タイプ（v7.4.1新設: 高優先度）
CREATE TYPE conversation_type_enum AS ENUM (
  'direct',
  'group'
);

-- マッチング目的（v7.4.1拡張版）
CREATE TYPE match_purpose_enum AS ENUM (
  'study_partner',      -- 勉強仲間
  'tutor',              -- 家庭教師
  'study_group',        -- 勉強グループ
  'mentor',             -- メンター
  'language_exchange',  -- 言語交換
  'friend',             -- 友達探し（新規）
  'senior',             -- 先輩探し（新規）
  'junior',             -- 後輩探し（新規）
  'romantic'            -- 恋人探し（新規）
);

-- マッチングタイプ（v7.4.1拡張版）
CREATE TYPE match_type_enum AS ENUM (
  'study_partner',      -- 勉強仲間
  'tutor',              -- 家庭教師
  'mentor',             -- メンター
  'language_exchange',  -- 言語交換
  'friend',             -- 友達（新規）
  'senior',             -- 先輩（新規）
  'junior',             -- 後輩（新規）
  'romantic'            -- 恋人（新規）
);

-- マッチングステータス（v7.4.1新設: 高優先度）
CREATE TYPE match_status_enum AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'expired',
  'cancelled'
);

-- インタラクションイベントタイプ（v7.4.1新設: 高優先度）
CREATE TYPE interaction_event_type_enum AS ENUM (
  'view',
  'like',
  'unlike',
  'bad',
  'unbad',
  'share',
  'bookmark',
  'unbookmark'
);
```

---

## **2. 禁止ツール・ライブラリ一覧**

EduMintプロジェクトでは、以下のツール・ライブラリの使用を**全面禁止**とします。これらは技術的負債、セキュリティリスク、保守性低下を引き起こすため、代替ツールを使用してください。

### **2.0 型安全性の徹底（v7.4.1強調）**

**ENUM型の使用を徹底**し、固定値の管理はすべてPostgreSQL ENUM型で行います。VARCHAR型での固定値管理は**全面禁止**です。

| 禁止パターン | 理由 | 代替方法 |
| :--- | :--- | :--- |
| **VARCHAR型での固定値管理** | typoリスク、バリデーション漏れ、パフォーマンス低下 | **PostgreSQL ENUM型** (必須) |
| **文字列リテラル比較** | typo検出不可、IDEサポートなし | **ENUM型** + sqlc自動生成 |
| **マジックナンバー/文字列** | 保守性低、意味不明瞭 | **ENUM型** + Go定数 |

**ENUM型使用の利点:**
- **型安全性**: DB層でのバリデーション、不正値の挿入を防止
- **パフォーマンス**: INTEGER内部表現、比較・ソートが高速
- **可読性**: 値の意味が明確、ドキュメント不要
- **自動生成**: sqlcが Go ENUM を自動生成、手動管理不要
- **IDEサポート**: 補完・リファクタリング対応

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
| **edumintGateways** | ジョブオーケストレーション | `jobs`, `job_events`, `job_logs` (分離DB) | `gateway.jobs` | `content.lifecycle`, `ai.results`, `gateway.job_status` |
| **edumintUsers** | SSO・認証・ユーザー管理・フォロー・通知（統合） | `oauth_clients`, `oauth_tokens`, `idp_links`, `users`, `user_profiles`, `user_follows`, `user_blocks`, `notifications`, `auth_logs` (分離DB), `user_profile_logs` (分離DB) | `auth.events`, `user.events` | `content.feedback`, `monetization.transactions`, **`content.interaction`** |
| **edumintContents** | 試験・問題・統計・OCRテキスト管理（4DB構成） | **[メインDB: `edumint_contents`]** `institutions`, `faculties`, `departments`, `teachers`, `subjects`, `exams`, `questions`, `sub_questions`, `keywords`, `exam_keywords`, `exam_statistics`, `exam_interaction_events`, `ad_display_events`, `ad_viewing_progress` / **[検索DB: `edumint_contents_search`]** `subject_terms`, `institution_terms`, `faculty_terms`, `teacher_terms`, `term_generation_jobs`, `term_generation_candidates` / **[マスターDB: `edumint_contents_master`]** `master_ocr_contents` (OCRテキスト統合管理、暗号化対象) / **[ログDB: `edumint_contents_logs`]** `content_logs` | `content.lifecycle`, `content.interaction`, `content.ocr` | `gateway.jobs`, `ai.results`, `search.term_generation` |
| **edumintFiles** | ファイルストレージ管理 | `file_metadata`, `report_attachment`, `file_upload_jobs`, `file_logs` (分離DB) | `file.uploaded`, `file.encrypted` | `content.ocr`, `moderation.evidence` |
| **edumintSearch** | 検索・インデックス（無状態化） | **Elasticsearch索引のみ（物理DB廃止）**, `search_logs` (分離DB) | `search.indexed`, `search.term_generation` | `content.lifecycle`, `content.interaction` via **Debezium CDC** |
| **edumintAiWorker** | AI処理（ステートレス） | （物理DB削除）*ELKログのみ | `ai.results` | `gateway.jobs`, `file.uploaded`, `content.ocr`, `search.term_generation` |
| **edumintSocial** | SNS機能（投稿・コメント・DM・マッチング） | `user_posts`, `post_likes`, `post_comments`, `exam_comments`, `comment_likes`, `dm_conversations`, `dm_participants`, `dm_messages`, `dm_read_receipts`, `user_match_preferences`, `user_matches` | `social.activity` | `content.interaction` |
| **edumintMonetizeWallet** | MintCoin管理 | `wallets`, `wallet_transactions`, `wallet_logs` (分離DB, 7年保持) | `monetization.transactions` | - |
| **edumintRevenue** | 収益分配 | `revenue_reports`, `ad_impressions_agg`, `revenue_logs` (分離DB) | `revenue.reports` | `monetization.transactions`, `content.interaction` |
| **edumintModeration** | 通報管理 | `content_reports`, `user_reports`, `moderation_logs` (分離DB) | `moderation.events` | - |
| **edumintAdmin** | 管理UI統合 | （他サービスのAPIを集約） | - | - |

**主要変更点（v7.2.0）:**
- **edumintContents 4DB構成**: セキュリティ・性能・スケーラビリティの最適化
  - `edumint_contents` (メインDB): 試験・問題・統計・広告管理
  - `edumint_contents_search` (検索用DB): 検索用語テーブル群（`*_terms`, `term_generation_*`）
  - `edumint_contents_master` (マスターDB): OCRテキスト専用（`master_ocr_contents`）
  - `edumint_contents_logs` (ログDB): ログデータ分離
- **I/O競合解消**: 読み取り集中（検索）と書き込み集中（コンテンツ）を物理分離
- **Debezium 2コネクタ構成**: edumint_contents と edumint_contents_search の個別同期

**主要変更点（v7.1.0）:**
- **edumintUsers**: edumintAuth + edumintUserProfileを統合。物理DB: `edumint_users`
- **edumintContents**: OCRテキスト管理に特化。`exam_raw` → `master_exams`, `source_raw` → `master_materials`にリネーム（OCRテキストのみ保存）→ **v7.3.0でmaster_ocr_contentsに統合**
- **edumintFiles**: 原本ファイルと通報証拠ファイルの保存を継続。物理DB: `edumint_files`
- **edumintContents**: 検索用語管理テーブル（`*_terms`, `term_generation_*`）を追加
- **edumintContents**: 広告管理テーブル（`ad_display_events`, `ad_viewing_progress`）を新設（v7.4.0でad_viewing_historyから移行）
- **edumintSearch**: 物理DB削除、Elasticsearch + ログDBのみに変更。全データはDebezium CDCで同期
- **edumintGateways**: edumintGateways → edumintGateways（複数形統一）
- **Debezium CDC**: edumintUsers, edumintContents → edumintSearchへリアルタイム差分同期

---

## **4. edumintUsers (統合ユーザー管理サービス)**

### 設計変更点（v7.1.0）

**マイクロサービス統合:**
- edumintAuth + edumintUserProfile → **edumintUsers**に統合
- 物理DB名: `edumint_users`
- ログDB名: `edumint_users_logs`

**統合の利点:**
- **トランザクション整合性**: 認証とユーザープロフィールの同一トランザクション管理
- **レイテンシ削減**: サービス間通信の排除
- **データ一貫性**: 外部キー制約による強整合性保証
- **運用コスト削減**: DB・サービスインスタンス数の削減

**設計変更点（v7.0.0からの継続）:**
- 全テーブルの主キーをUUIDに変更
- AUTO_INCREMENT廃止
- ログテーブルを物理的に分離したデータベースに配置
- user_role_enumを4値に厳格化（free, system, admin, premium）
- users.public_idにNanoID (8文字) 採用

### 設計変更点（v7.5.0）

**認証機能の全面的な設計変更:**

1. **SSO専用認証への移行**
   - ❌ **廃止**: `users.password_hash` カラム - 自社パスワード認証の全面廃止
   - ✅ **変更**: `users.email` カラムを任意化（NULL許可）- IdP提供情報のみで登録可能
   - **理由**: セキュリティ向上、運用コスト削減、OAuth専業大手への認証委託

2. **IdP統合と最適化**
   - ❌ **削除**: `'twitter'` from `idp_provider_enum` - X(旧Twitter) API有料化対応
   - ✅ **統合**: `'meta'` - Facebook/InstagramをMeta OAuth基盤として統一管理
   - ✅ **拡張**: `idp_links` テーブルにMeta統合、プライマリIdP管理機能追加

3. **大学認証バッジ機能**
   - ✅ **追加**: 大学メール認証による学生バッジ付与機能
   - `university_email`, `university_verified`, `university_badge_expires_at` カラム追加
   - 年次更新バッチ処理で有効期限管理（1年間）

4. **複数IdP紐付け必須化**
   - アプリケーション層で最低2つのIdP紐付けを推奨（DB制約では強制しない）
   - アカウント削除リスク対策による可用性向上

5. **認証イベント拡張**
   - `auth_event_enum` に8種類のIdP関連イベント追加
   - `auth_logs` テーブルにIdP情報記録カラム追加

### 4.1 本体DBテーブル (DDL例)

**物理DB:** `edumint_users`

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
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ  -- v7.5.1: 論理削除対応
);

CREATE INDEX idx_oauth_clients_public_id ON oauth_clients(public_id);
CREATE INDEX idx_oauth_clients_active ON oauth_clients(is_active);
CREATE INDEX idx_oauth_clients_deleted_at ON oauth_clients(deleted_at) WHERE deleted_at IS NULL;  -- v7.5.1
```

#### **oauth_tokens**

発行されたアクセストークン・リフレッシュトークンを管理します。

```sql
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES oauth_clients(id) ON DELETE CASCADE,
  access_token VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(255) UNIQUE,
  token_type token_type_enum DEFAULT 'Bearer',  -- v7.4.1: ENUM型適用
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

外部IDプロバイダー（Google, Apple, Meta等）とのリンク情報を管理します。

```sql
CREATE TABLE idp_links (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider idp_provider_enum NOT NULL,  -- v7.5.0: Meta統合対応
  provider_user_id VARCHAR(255) NOT NULL,
  meta_platform VARCHAR(50),  -- v7.5.0: 'facebook' | 'instagram' | NULL
  email VARCHAR(255),  -- v7.5.0: IdPから取得したメール（参考値）
  phone_number VARCHAR(50),  -- v7.5.0: IdPから取得した電話番号
  profile_data JSONB,  -- v7.5.0: IdPプロフィール情報
  is_primary BOOLEAN DEFAULT FALSE,  -- v7.5.0: デフォルトログイン先
  is_active BOOLEAN DEFAULT TRUE,  -- v7.5.0: アクティブ状態
  linked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,  -- v7.5.1: 論理削除対応
  UNIQUE(user_id, provider, meta_platform)  -- v7.5.0: Meta統合対応
);

CREATE INDEX idx_idp_links_user_id ON idp_links(user_id);
CREATE INDEX idx_idp_links_provider ON idp_links(provider, provider_user_id);
CREATE INDEX idx_idp_links_user_primary ON idp_links(user_id, is_primary) WHERE is_primary = TRUE;  -- v7.5.0
CREATE INDEX idx_idp_links_meta_platform ON idp_links(meta_platform) WHERE meta_platform IS NOT NULL;  -- v7.5.0
CREATE INDEX idx_idp_links_deleted_at ON idp_links(deleted_at) WHERE deleted_at IS NULL;  -- v7.5.1
```

#### **users**

ユーザーの基本情報を管理します。

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,  -- NanoID (外部公開用)
  email VARCHAR(255) UNIQUE,  -- v7.5.0: NULL許可（SSO専用認証対応）
  username VARCHAR(50) UNIQUE,
  role user_role_enum DEFAULT 'free',
  status user_status_enum DEFAULT 'active',
  language_code VARCHAR(10) DEFAULT 'ja',  -- BCP 47
  region_code CHAR(2) DEFAULT 'JP',        -- ISO 3166-1 alpha-2
  email_verified BOOLEAN DEFAULT FALSE,
  registration_completed_at TIMESTAMPTZ,   -- v7.4.1: 新規ユーザー判定用（プロフィール完成日時）
  
  -- v7.5.0: 大学認証バッジ機能
  university_email VARCHAR(255) UNIQUE,
  university_verified BOOLEAN DEFAULT FALSE,
  university_verified_at TIMESTAMPTZ,
  university_badge_expires_at TIMESTAMPTZ,  -- バッジ有効期限（年次更新）
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMPTZ,
  
  -- v7.5.0: メール形式検証（RFC準拠）
  CONSTRAINT check_email_format CHECK (
    email IS NULL OR 
    email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  ),
  
  -- v7.5.0: 大学メール形式検証（大学ドメイン）
  CONSTRAINT check_university_email_format CHECK (
    university_email IS NULL OR 
    university_email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(ac\.jp|edu|edu\.[a-zA-Z]{2,})$'
  )
);

CREATE INDEX idx_users_public_id ON users(public_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_registration_completed ON users(registration_completed_at);  -- v7.4.1: 新規ユーザー検索用
CREATE INDEX idx_users_university_verified ON users(university_verified, university_badge_expires_at) 
  WHERE university_verified = TRUE;  -- v7.5.0: バッジ有効期限管理用
```

#### **user_profiles**

ユーザーのプロフィール詳細情報を管理します。

```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(512),
  institution_type_enum ENUM NOT NULL DEFAULT 'university',
  academic_track_enum ENUM NOT NULL DEFAULT 'humanities',
  academic_field_enum ENUM NOT NULL DEFAULT 'generic_programmes',
  institution_id UUID NOT NULL,  -- institutions.idを参照（論理的）
  faculty_id UUID NOT NULL,      -- faculties.idを参照（論理的）
  department_id UUID NOT NULL,   -- departments.idを参照（論理的）
  prefecture_enum ENUM NOT NULL DEFAULT '東京都',
  graduation_year INT,
  website_url VARCHAR(512),
  twitter_handle VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_institution_id ON user_profiles(institution_id);
```

#### **user_follows**

ユーザー間のフォロー関係を管理します。

```sql
CREATE TABLE user_follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

**物理DB:** `edumint_users_logs`

#### **auth_logs**

認証イベントログを記録します。セキュリティ監査・分析用。

```sql
CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID,  -- NULL許可（ログイン失敗時）
  event_type auth_event_enum NOT NULL,
  idp_provider idp_provider_enum,  -- v7.5.0: IdP情報記録
  idp_user_id VARCHAR(255),  -- v7.5.0: IdPユーザーID
  meta_platform VARCHAR(50),  -- v7.5.0: Meta統合対応
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
CREATE INDEX idx_auth_logs_idp_provider ON auth_logs(idp_provider, created_at DESC);  -- v7.5.0
CREATE INDEX idx_auth_logs_created_at ON auth_logs(created_at);
```

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
- パーティショニングにより大量ログを効率管理
- 本体DBとは物理的に分離（I/O競合回避）
- 長期保存・分析クエリに最適化
- 自動アーカイブ・削除ポリシーを設定可能
- GDPR対応・監査証跡として利用

---

## **5. edumintContents (コンテンツ・OCRテキスト管理サービス)**

### 設計変更点（v7.2.0）

**4DB構成への拡張:**
- **物理DB分離**: 2DB構成から4DB構成へ拡張
  - `edumint_contents` (メインDB): 試験・問題・統計・広告管理テーブル
  - `edumint_contents_search` (検索用DB): 検索用語テーブル群の独立管理
  - `edumint_contents_master` (マスターDB): OCRテキスト専用、暗号化対象
  - `edumint_contents_logs` (ログDB): ログデータの分離

**4DB構成の設計意図:**

1. **セキュリティ向上 (OCRテキスト統合管理)**
   - OCRテキスト（機密情報）を独立したDBで管理
   - IAMロール分離によるアクセス制御強化（管理者・システムのみ）
   - 7日後の自動暗号化対応（イミュータブル設計）
   - 監査ログ・アクセス追跡の精密化

2. **I/O性能改善 (検索用語テーブル分離)**
   - 読み取り集中（検索クエリ）と書き込み集中（コンテンツ更新）の物理分離
   - Debezium CDC精密制御（レプリケーション対象の最適化）
   - インデックスチューニングの独立実施（全文検索GINインデックス最適化）
   - クエリキャッシュ戦略の独立設定

3. **スケーラビリティ向上**
   - DB単位での段階的スケールアウト対応
   - メインDB縮小可能（検索負荷の分離により）
   - リードレプリカの柔軟な配置（検索DBのみ複数レプリカ）
   - バックアップ・リストア戦略の独立化

4. **コスト削減（約15%）**
   - メインDB: db-custom-8-32GB → db-custom-6-24GB（検索負荷分離）
   - 検索DB: db-custom-4-16GB（読み取り最適化、シンプルなテーブル構造）
   - マスターDB: db-custom-2-8GB（書き込み専用、小規模）
   - ログDB: db-custom-2-8GB（既存）

**物理DB配置図:**

```
edumintContents (4DB構成)
├── edumint_contents (メインDB)
│   ├── institutions, faculties, departments
│   ├── teachers, subjects
│   ├── exams, questions, sub_questions, keywords, exam_keywords
│   ├── exam_statistics
│   └── exam_interaction_events, ad_display_events, ad_viewing_progress
│
├── edumint_contents_search (検索用DB - 新設)
│   ├── subject_terms, institution_terms
│   ├── faculty_terms, teacher_terms
│   ├── term_generation_jobs
│   └── term_generation_candidates
│
├── edumint_contents_master (マスターDB - 新設)
│   └── master_ocr_contents (OCRテキスト統合管理、暗号化対象)
│       ├── content_type = 'exercises' (演習問題)
│       └── content_type = 'material' (授業資料)
│
└── edumint_contents_logs (ログDB)
    └── content_logs (パーティション、90日保持)
```

**Debezium CDC 2コネクタ構成:**

```
┌─────────────────────────┐
│ edumint_contents        │ PostgreSQL (メインDB)
│ (Source of Truth)       │
└──────────┬──────────────┘
           │ Logical Replication
           ↓
      ┌────────────────┐
      │ Debezium CDC   │ Connector 1
      │ Connector      │
      └────────┬───────┘
               │ Kafka Topic: dbz.edumint_contents.*
               ↓
┌─────────────────────────┐
│ edumint_contents_search │ PostgreSQL (検索用DB)
│ (Source of Truth)       │
└──────────┬──────────────┘
           │ Logical Replication
           ↓
      ┌────────────────┐
      │ Debezium CDC   │ Connector 2
      │ Connector      │
      └────────┬───────┘
               │ Kafka Topic: dbz.edumint_contents_search.*
               ↓
          ┌──────────┐
          │  Kafka   │ Event Streaming Platform
          └────┬─────┘
               │
               ↓
     ┌──────────────────┐
     │ edumintSearch    │ Consumer Service
     │ (Stateless)      │
     └────────┬─────────┘
              │
              ↓
     ┌──────────────────┐
     │ Elasticsearch    │ Search Index
     │ 9.2.4            │
     └──────────────────┘
```

**IAMロール設計（4DB対応）:**

| DB | サービスアカウント | 権限 | アクセス範囲 |
|:---|:---|:---|:---|
| edumint_contents | edumint-contents-app-sa | SELECT, INSERT, UPDATE | 全テーブル（通常操作） |
| edumint_contents_search | edumint-contents-app-sa | SELECT, INSERT, UPDATE | 全テーブル（検索用語管理） |
| edumint_contents_master | edumint-contents-master-sa | SELECT, INSERT | master_ocr_contents（書き込み専用） |
| edumint_contents_master | edumint-admin-sa | SELECT | master_ocr_contents（管理者のみ読み取り） |
| edumint_contents_logs | edumint-contents-app-sa | INSERT | content_logs（ログ書き込み専用） |

### 設計変更点（v7.1.0）

**サービス名変更:**
- edumintContent → **edumintContents** （複数形に統一）

**OCRテキスト管理機能:**
- **edumintFiles**サービスとの責務分離を明確化
- `exam_raw` → **`master_exams`**, `source_raw` → **`master_materials`** にリネーム（v7.1.0）→ **v7.3.0で`master_ocr_contents`に統合**
- **原本ファイルはedumintFilesが保存**、OCRテキストのみedumintContentsで管理
- **自動暗号化対象**: OCRテキストデータ（7日後に暗号化）
- **イミュータブル設計**: master_ocr_contents は編集・削除不可（append-only）
- **統合設計（v7.3.0）**: ocr_content_type_enum ('exercises', 'material') によるタイプ分類

**検索用語管理統合:**
- edumintSearchから検索用語テーブルを移管
- `subject_terms`, `institution_terms`, `faculty_terms`, `teacher_terms`
- `term_generation_jobs`, `term_generation_candidates`
- Debezium CDCでedumintSearchへリアルタイム同期

**広告管理機能追加:**
- **`ad_display_events`**: 広告表示イベント記録
- **`ad_viewing_progress`**: ユーザー別広告視聴進捗管理（v7.4.0新設）
- **4段階表示戦略**: question_view, answer_explanation, pdf_download, markdown_download
- **スキップロジック**: 同一試験2回目以降の閲覧では広告非表示

**分離設計の利点:**
- **責務の明確化**: ファイル保存（edumintFiles）とOCRテキスト管理（edumintContents）を分離
- **トランザクション整合性**: 試験メタデータとOCRテキストの一貫性保証
- **セキュリティ向上**: 原本ファイルとOCRテキストで異なるアクセス制御を実施
- **検索最適化**: CDC による自動同期で検索インデックス更新
- **スケーラビリティ**: ファイル保存とテキスト処理を独立してスケール可能

### 設計変更点（v7.0.0からの継続）

- established_year削除（機関・学部・学科から）
- mext_code系カラム全削除
- parent_institution_id削除（大学院は独立機関）
- question_number, sub_numberをsort_orderに統一
- teachers, exams, questions, sub_questions, keywordsはUUID + NanoID複合主キー
- ログテーブルを物理DB分離

### 5.1 本体DBテーブル

#### 5.1.1 edumint_contents (メインDB)

**物理DB:** `edumint_contents`

**役割:**
- 試験・問題・科目・教員などのコアメタデータ管理
- 統計情報・インタラクションイベント管理
- 広告表示・閲覧履歴管理

**特徴:**
- 高トランザクション負荷（コンテンツ作成・更新）
- 外部キー制約による整合性保証
- ベクトル検索対応（pgvector）
- リードレプリカ対応（読み取りスケール）

**主要テーブル群:**
- コアメタデータ: institutions, faculties, departments, teachers, subjects
- 試験・問題: exams, questions, sub_questions, keywords, exam_keywords
- 統計・イベント: exam_statistics, exam_interaction_events
- 広告管理: ad_display_events, ad_viewing_progress

#### **institutions (教育機関)**

大学・大学院・短大・高専等の機関情報を管理します。

```sql
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,  -- NanoID
  
  -- 国際化対応（v7.4.0更新）
  name VARCHAR(255) NOT NULL,  -- 英語名（SEO最適化）
  display_name VARCHAR(255) NOT NULL,  -- 表示名（多言語対応）
  display_language VARCHAR(10) DEFAULT 'ja',  -- BCP 47準拠（ja, en, zh, ko等）
  region_code CHAR(2) NOT NULL DEFAULT 'JP',  -- ISO 3166-1 alpha-2
  
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
CREATE INDEX idx_institutions_region_code ON institutions(region_code);
CREATE INDEX idx_institutions_name ON institutions USING gin(to_tsvector('english', name));
CREATE INDEX idx_institutions_display_name ON institutions USING gin(to_tsvector('japanese', display_name));
```

**設計注記:**
- 大学と大学院は別レコードとして登録（institution_type で区別）
- established_year削除（検索・表示で不要）
- mext_code削除（外部API非依存方針）
- **v7.4.0国際化対応:**
  - `name`: 英語名（SEO最適化、検索エンジン対応）
  - `display_name`: 多言語表示名（日本語、英語、中国語等）
  - `display_language`: 表示言語コード（BCP 47準拠）
  - `region_code`: 国コード（ISO 3166-1 alpha-2）
  - `name_sub1`, `name_sub2`, `name_sub3` 削除（単一カラムに統合）

#### **faculties (学部)**

学部・研究科情報を管理します。

```sql
CREATE TABLE faculties (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,  -- NanoID
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- 国際化対応（v7.4.0更新）
  name VARCHAR(255) NOT NULL,  -- 英語名（SEO最適化）
  display_name VARCHAR(255) NOT NULL,  -- 表示名（多言語対応）
  display_language VARCHAR(10) DEFAULT 'ja',  -- BCP 47準拠
  region_code CHAR(2) NOT NULL DEFAULT 'JP',  -- ISO 3166-1 alpha-2
  
  academic_field academic_field_enum,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(institution_id, name)
);

CREATE INDEX idx_faculties_public_id ON faculties(public_id);
CREATE INDEX idx_faculties_institution_id ON faculties(institution_id);
CREATE INDEX idx_faculties_academic_field ON faculties(academic_field);
CREATE INDEX idx_faculties_region_code ON faculties(region_code);
CREATE INDEX idx_faculties_name ON faculties USING gin(to_tsvector('english', name));
CREATE INDEX idx_faculties_display_name ON faculties USING gin(to_tsvector('japanese', display_name));
```

#### **departments (学科)**

学科・専攻情報を管理します。

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,  -- NanoID
  faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  
  -- 国際化対応（v7.4.0更新）
  name VARCHAR(255) NOT NULL,  -- 英語名（SEO最適化）
  display_name VARCHAR(255) NOT NULL,  -- 表示名（多言語対応）
  display_language VARCHAR(10) DEFAULT 'ja',  -- BCP 47準拠
  region_code CHAR(2) NOT NULL DEFAULT 'JP',  -- ISO 3166-1 alpha-2
  
  academic_field academic_field_enum,
  academic_track academic_track_enum,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(faculty_id, name)
);

CREATE INDEX idx_departments_public_id ON departments(public_id);
CREATE INDEX idx_departments_faculty_id ON departments(faculty_id);
CREATE INDEX idx_departments_academic_field ON departments(academic_field);
CREATE INDEX idx_departments_region_code ON departments(region_code);
CREATE INDEX idx_departments_name ON departments USING gin(to_tsvector('english', name));
CREATE INDEX idx_departments_display_name ON departments USING gin(to_tsvector('japanese', display_name));
```

#### **teachers (教員)**

教員情報を管理します。UUID + NanoID複合主キー採用。

```sql
CREATE TABLE teachers (
  id UUID DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL,  -- NanoID
  
  -- 国際化対応（v7.4.0更新）
  name VARCHAR(255) NOT NULL,  -- 英語名（SEO最適化）
  display_name VARCHAR(255) NOT NULL,  -- 表示名（多言語対応）
  display_language VARCHAR(10) DEFAULT 'ja',  -- BCP 47準拠
  region_code CHAR(2) NOT NULL DEFAULT 'JP',  -- ISO 3166-1 alpha-2

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, public_id)
);

CREATE UNIQUE INDEX idx_teachers_public_id ON teachers(public_id);
CREATE INDEX idx_teachers_department_id ON teachers(department_id);
CREATE INDEX idx_teachers_region_code ON teachers(region_code);
CREATE INDEX idx_teachers_name ON teachers USING gin(to_tsvector('english', name));
CREATE INDEX idx_teachers_display_name ON teachers USING gin(to_tsvector('japanese', display_name));
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
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  teacher_id UUID,  -- teachers.idを参照（論理的）
  
  -- 国際化対応（v7.4.0更新）
  name VARCHAR(255) NOT NULL,  -- 英語名（SEO最適化）
  display_name VARCHAR(255) NOT NULL,  -- 表示名（多言語対応）
  display_language VARCHAR(10) DEFAULT 'ja',  -- BCP 47準拠
  region_code CHAR(2) NOT NULL DEFAULT 'JP',  -- ISO 3166-1 alpha-2
  
  academic_field academic_field_enum,
  credits INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subjects_public_id ON subjects(public_id);
CREATE INDEX idx_subjects_department_id ON subjects(department_id);
CREATE INDEX idx_subjects_teacher_id ON subjects(teacher_id);
CREATE INDEX idx_subjects_region_code ON subjects(region_code);
CREATE INDEX idx_subjects_name ON subjects USING gin(to_tsvector('english', name));
CREATE INDEX idx_subjects_display_name ON subjects USING gin(to_tsvector('japanese', display_name));
```

#### **exams (試験)**

試験情報を管理します。UUID + NanoID複合主キー採用。

```sql
CREATE TABLE exams (
  id UUID DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL,  -- NanoID
  
  -- master_ocr_contents との 1対1 関係（v7.4.1新規追加）
  master_ocr_content_id UUID UNIQUE,  -- master_ocr_contents.idを参照（論理的）
  
  subject_id UUID ,  -- subjects.idを参照（論理的）
  teacher_id UUID,  -- teachers.idを参照（論理的）
  uploader_id UUID NOT NULL,  -- users.idを参照（論理的）
  title VARCHAR(255) NOT NULL,
  academic_year INT NOT NULL,
  semester semester_enum,
  exam_type exam_type_enum DEFAULT 'regular',
  duration_minutes INT,
  status exam_status_enum DEFAULT 'draft',
  display_language VARCHAR(10) DEFAULT 'ja',  -- BCP 47準拠
  region_code CHAR(2) NOT NULL DEFAULT 'JP',  -- ISO 3166-1 alpha-2
  
  -- ファイル入力情報（v7.4.1修正: file_input_id廃止）
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
CREATE UNIQUE INDEX idx_exams_master_ocr_content_id ON exams(master_ocr_content_id) 
  WHERE master_ocr_content_id IS NOT NULL;
CREATE INDEX idx_exams_subject_id ON exams(subject_id);
CREATE INDEX idx_exams_teacher_id ON exams(teacher_id);
CREATE INDEX idx_exams_uploader_id ON exams(uploader_id);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_academic_year ON exams(academic_year, semester);
CREATE INDEX idx_exams_embedding_hnsw ON exams USING hnsw(embedding vector_cosine_ops);
```

**設計注記:**
- 複合主キー (id, public_id) 採用
- **v7.4.1修正**: master_ocr_content_id 追加（1対1関係）、file_input_id 削除
- **外部キー制約**: master_ocr_content_id は論理参照のみ（物理外部キーなし）
  - 理由: master_ocr_contents は別物理DB (edumint_contents_master) に配置
  - データ整合性はアプリケーション層とトランザクション管理で保証
- **ファイル追跡**: master_ocr_contents.source_file_ids 配列経由で元ファイルを追跡
- ベクトル埋め込みでセマンティック検索対応
- view_count等のカウンターはedumintSocialから非同期更新

#### **questions (大問)**

問題情報を管理します。小問、大問単体では外部露出がないので、UUIDのみで管理します。大問テーブルの管理対象は大問全体の問題文、大問全体の難易度、大問全体の配点、大問の順序、埋め込みベクトルです。問題形式、回答、解説、選択肢は小問レベルで管理するため、大問テーブルには含みません。

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  exam_id UUID NOT NULL,  -- exams.idを参照（論理的）
  sort_order INT NOT NULL,  -- 問題の順序
  question_text TEXT NOT NULL,
  difficulty_level difficulty_level_enum DEFAULT 'standard',
  points DECIMAL(5,2) DEFAULT 1.0,
  embedding vector(1536),
  language_code VARCHAR(10) DEFAULT 'ja',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_id, sort_order)
);

CREATE INDEX idx_questions_exam_id ON questions(exam_id, sort_order);
CREATE INDEX idx_questions_embedding_hnsw ON questions USING hnsw(embedding vector_cosine_ops);
```

**設計注記:**
- sort_orderで問題の順序を管理（question_number廃止）
- 主キーはidのみ（外部露出がないためpublic_id不要）
- 大問レベルで管理: 問題文、難易度、配点、順序、埋め込みベクトル
- 小問レベルで管理: 問題形式、正解、解説、選択肢

#### **sub_questions (小問)**

小問情報を管理します。小問、大問単体では外部露出がないので、UUIDのみで管理します。小問テーブルの管理対象は小問の問題文、問題形式（選択肢、記述式等）、選択肢データ（JSONB）、正解データ（JSONB）、解説文、小問の配点、小問の順序です。難易度は大問レベルで管理するため含みません。

```sql
CREATE TABLE sub_questions (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  question_id UUID NOT NULL,  -- questions.idを参照（論理的）
  sort_order INT NOT NULL,  -- 小問の順序
  question_type question_type_enum NOT NULL,
  sub_question_text TEXT NOT NULL,
  options JSONB,
  correct_answer JSONB NOT NULL,
  explanation TEXT,
  points DECIMAL(5,2) DEFAULT 0.5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(question_id, sort_order)
);

CREATE INDEX idx_sub_questions_question_id ON sub_questions(question_id, sort_order);
CREATE INDEX idx_sub_questions_type ON sub_questions(question_type);
```

#### **keywords (キーワード)**

コンテンツに紐づくキーワードを管理します。UUID + NanoID複合主キー採用。

```sql
CREATE TABLE keywords (
  id UUID DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL,  -- NanoID
  
  -- 国際化対応（v7.4.0更新）
  name VARCHAR(100) NOT NULL,  -- 英語キーワード（SEO最適化）
  display_name VARCHAR(100) NOT NULL,  -- 表示名（多言語対応）
  display_language VARCHAR(10) DEFAULT 'ja',  -- BCP 47準拠
  region_code CHAR(2) DEFAULT 'JP',  -- ISO 3166-1 alpha-2
  
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,  -- v7.5.1: 論理削除対応
  PRIMARY KEY (id, public_id),
  UNIQUE(name, region_code)
);

CREATE UNIQUE INDEX idx_keywords_public_id ON keywords(public_id);
CREATE INDEX idx_keywords_name ON keywords(name);
CREATE INDEX idx_keywords_display_name ON keywords(display_name);
CREATE INDEX idx_keywords_usage_count ON keywords(usage_count DESC);
CREATE INDEX idx_keywords_region_code ON keywords(region_code);
CREATE INDEX idx_keywords_deleted_at ON keywords(deleted_at) WHERE deleted_at IS NULL;  -- v7.5.1
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

#### **exam_statistics (試験統計集約テーブル)**

試験ごとの統計情報を集約管理します。検索ランキング・推薦システムで高速参照可能。

```sql
CREATE TABLE exam_statistics (
  exam_id UUID PRIMARY KEY REFERENCES exams(id) ON DELETE CASCADE,
  
  -- カウンター（集約値）
  view_count INT DEFAULT 0,
  unique_viewer_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  bad_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  
  -- 広告表示統計（v7.4.0追加）
  ad_display_count INT DEFAULT 0,                     -- 広告表示回数
  ad_revenue_estimated DECIMAL(15,4) DEFAULT 0.00,   -- 推定広告収益（USD）
  last_ad_displayed_at TIMESTAMPTZ,                   -- 最終広告表示日時
  
  -- 統計指標
  engagement_score DECIMAL(10,2) DEFAULT 0.00,  -- エンゲージメントスコア
  quality_score DECIMAL(10,2) DEFAULT 0.00,     -- 品質スコア
  trending_score DECIMAL(10,2) DEFAULT 0.00,    -- トレンドスコア（時間減衰付き）
  
  -- 最終更新情報
  last_viewed_at TIMESTAMPTZ,
  last_liked_at TIMESTAMPTZ,
  last_commented_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exam_statistics_engagement ON exam_statistics(engagement_score DESC);
CREATE INDEX idx_exam_statistics_quality ON exam_statistics(quality_score DESC);
CREATE INDEX idx_exam_statistics_trending ON exam_statistics(trending_score DESC, updated_at DESC);
CREATE INDEX idx_exam_statistics_view_count ON exam_statistics(view_count DESC);
CREATE INDEX idx_exam_statistics_like_count ON exam_statistics(like_count DESC);
```

**設計注記:**
- 試験ごとの統計情報を集約（Source of Truth）
- 検索ランキング・推薦システムで高速参照可能
- エンゲージメントスコア: `(like_count * 1.0 + comment_count * 2.0 - bad_count * 0.5) / NULLIF(view_count, 0)`
- 品質スコア: コンテンツ品質指標（AI評価、通報率等を統合）
- トレンドスコア: 時間減衰を考慮した人気度指標

#### **exam_interaction_events (個別イベントテーブル)**

個別のユーザーアクション（いいね、閲覧等）を記録します。高頻度書き込みに対応。

```sql
CREATE TABLE exam_interaction_events (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  exam_id UUID NOT NULL,  -- exams.idを参照（論理的）
  user_id UUID,           -- NULL許可（非ログインユーザーの閲覧）
  event_type interaction_event_type_enum NOT NULL,  -- v7.4.1: ENUM型適用
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  view_duration_seconds INT,  -- 閲覧時間（viewイベントのみ）
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- パーティション例（月次）
CREATE TABLE exam_interaction_events_2026_02 PARTITION OF exam_interaction_events
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE exam_interaction_events_2026_03 PARTITION OF exam_interaction_events
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE INDEX idx_exam_interaction_events_exam_id ON exam_interaction_events(exam_id, created_at DESC);
CREATE INDEX idx_exam_interaction_events_user_id ON exam_interaction_events(user_id, created_at DESC);
CREATE INDEX idx_exam_interaction_events_type ON exam_interaction_events(event_type, created_at DESC);
CREATE INDEX idx_exam_interaction_events_session ON exam_interaction_events(session_id, created_at DESC);
```

**設計注記:**
- 個別のユーザーアクション（いいね、閲覧等）を記録
- 高頻度書き込みに対応（パーティショニング、月次）
- 定期バッチ（1分ごと）で`exam_statistics`を更新
- 分析・機械学習の入力データとして使用
- BigQueryへの定期エクスポート対象（90日後にPostgreSQLから削除）

#### **統計更新バッチ処理**

```sql
-- 統計更新バッチ（1分ごと実行）
CREATE OR REPLACE FUNCTION update_exam_statistics()
RETURNS void AS $$
BEGIN
  WITH recent_events AS (
    SELECT 
      exam_id,
      event_type,
      COUNT(*) as event_count,
      COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users,
      MAX(created_at) as last_event_at
    FROM exam_interaction_events
    WHERE created_at >= NOW() - INTERVAL '1 minute'
    GROUP BY exam_id, event_type
  )
  INSERT INTO exam_statistics (
    exam_id, 
    view_count, 
    like_count, 
    bad_count, 
    unique_viewer_count,
    last_viewed_at,
    last_liked_at
  )
  SELECT 
    exam_id,
    COALESCE(SUM(event_count) FILTER (WHERE event_type = 'view'), 0) as view_count,
    COALESCE(SUM(event_count) FILTER (WHERE event_type = 'like'), 0) as like_count,
    COALESCE(SUM(event_count) FILTER (WHERE event_type = 'bad'), 0) as bad_count,
    MAX(unique_users) FILTER (WHERE event_type = 'view') as unique_viewer_count,
    MAX(last_event_at) FILTER (WHERE event_type = 'view') as last_viewed_at,
    MAX(last_event_at) FILTER (WHERE event_type = 'like') as last_liked_at
  FROM recent_events
  GROUP BY exam_id
  ON CONFLICT (exam_id) DO UPDATE
  SET
    view_count = exam_statistics.view_count + EXCLUDED.view_count,
    like_count = exam_statistics.like_count + EXCLUDED.like_count,
    bad_count = exam_statistics.bad_count + EXCLUDED.bad_count,
    unique_viewer_count = GREATEST(exam_statistics.unique_viewer_count, EXCLUDED.unique_viewer_count),
    last_viewed_at = GREATEST(exam_statistics.last_viewed_at, EXCLUDED.last_viewed_at),
    last_liked_at = GREATEST(exam_statistics.last_liked_at, EXCLUDED.last_liked_at),
    engagement_score = (
      (exam_statistics.like_count + EXCLUDED.like_count) * 1.0 + 
      exam_statistics.comment_count * 2.0 - 
      (exam_statistics.bad_count + EXCLUDED.bad_count) * 0.5
    ) / NULLIF(exam_statistics.view_count + EXCLUDED.view_count, 0),
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
```

#### **sqlcクエリ例**

```sql
-- name: GetExamWithStatistics :one
SELECT 
  e.*,
  es.view_count,
  es.like_count,
  es.bad_count,
  es.comment_count,
  es.engagement_score,
  es.quality_score,
  es.trending_score
FROM exams e
LEFT JOIN exam_statistics es ON e.id = es.exam_id
WHERE e.id = $1 AND e.is_deleted = FALSE;

-- name: RecordExamInteraction :exec
INSERT INTO exam_interaction_events (
  exam_id,
  user_id,
  event_type,
  session_id,
  ip_address,
  user_agent,
  referrer,
  view_duration_seconds
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
);

-- name: GetTrendingExams :many
SELECT 
  e.*,
  es.view_count,
  es.like_count,
  es.engagement_score,
  es.trending_score
FROM exams e
INNER JOIN exam_statistics es ON e.id = es.exam_id
WHERE e.status = 'active' AND e.is_deleted = FALSE
ORDER BY es.trending_score DESC, es.updated_at DESC
LIMIT $1 OFFSET $2;

-- name: GetTopRatedExams :many
SELECT 
  e.*,
  es.view_count,
  es.like_count,
  es.quality_score
FROM exams e
INNER JOIN exam_statistics es ON e.id = es.exam_id
WHERE e.status = 'active' AND e.is_deleted = FALSE
  AND es.view_count >= $3
ORDER BY es.quality_score DESC, es.like_count DESC
LIMIT $1 OFFSET $2;
```

#### **subject_terms (科目検索用語)**

科目の検索用語を管理します（edumintSearchから移管、v7.1.0）。

```sql
CREATE TABLE subject_terms (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  term VARCHAR(255) NOT NULL,
  term_type VARCHAR(50) NOT NULL,  -- 'primary', 'alias', 'abbreviation', 'related'
  language_code VARCHAR(10) DEFAULT 'ja',
  weight FLOAT DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,  -- v7.5.1: 論理削除対応
  UNIQUE(subject_id, term, language_code)
);

CREATE INDEX idx_subject_terms_subject_id ON subject_terms(subject_id);
CREATE INDEX idx_subject_terms_term ON subject_terms USING gin(to_tsvector('japanese', term));
CREATE INDEX idx_subject_terms_type ON subject_terms(term_type);
CREATE INDEX idx_subject_terms_deleted_at ON subject_terms(deleted_at) WHERE deleted_at IS NULL;  -- v7.5.1
```

#### **institution_terms (機関検索用語)**

機関の検索用語を管理します（edumintSearchから移管、v7.1.0）。

```sql
CREATE TABLE institution_terms (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  term VARCHAR(255) NOT NULL,
  term_type VARCHAR(50) NOT NULL,  -- 'primary', 'alias', 'abbreviation', 'related'
  language_code VARCHAR(10) DEFAULT 'ja',
  weight FLOAT DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,  -- v7.5.1: 論理削除対応
  UNIQUE(institution_id, term, language_code)
);

CREATE INDEX idx_institution_terms_institution_id ON institution_terms(institution_id);
CREATE INDEX idx_institution_terms_term ON institution_terms USING gin(to_tsvector('japanese', term));
CREATE INDEX idx_institution_terms_type ON institution_terms(term_type);
CREATE INDEX idx_institution_terms_deleted_at ON institution_terms(deleted_at) WHERE deleted_at IS NULL;  -- v7.5.1
```

#### **faculty_terms (学部検索用語)**

学部の検索用語を管理します（edumintSearchから移管、v7.1.0）。

```sql
CREATE TABLE faculty_terms (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  term VARCHAR(255) NOT NULL,
  term_type VARCHAR(50) NOT NULL,  -- 'primary', 'alias', 'abbreviation', 'related'
  language_code VARCHAR(10) DEFAULT 'ja',
  weight FLOAT DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,  -- v7.5.1: 論理削除対応
  UNIQUE(faculty_id, term, language_code)
);

CREATE INDEX idx_faculty_terms_faculty_id ON faculty_terms(faculty_id);
CREATE INDEX idx_faculty_terms_term ON faculty_terms USING gin(to_tsvector('japanese', term));
CREATE INDEX idx_faculty_terms_type ON faculty_terms(term_type);
CREATE INDEX idx_faculty_terms_deleted_at ON faculty_terms(deleted_at) WHERE deleted_at IS NULL;  -- v7.5.1
```

#### **teacher_terms (教員検索用語)**

教員の検索用語を管理します（edumintSearchから移管、v7.1.0）。

```sql
CREATE TABLE teacher_terms (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  teacher_id UUID NOT NULL,  -- teachers.idを参照（論理的、複合主キーのため）
  term VARCHAR(255) NOT NULL,
  term_type VARCHAR(50) NOT NULL,  -- 'primary', 'alias', 'abbreviation', 'related'
  language_code VARCHAR(10) DEFAULT 'ja',
  weight FLOAT DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,  -- v7.5.1: 論理削除対応
  UNIQUE(teacher_id, term, language_code)
);

CREATE INDEX idx_teacher_terms_teacher_id ON teacher_terms(teacher_id);
CREATE INDEX idx_teacher_terms_term ON teacher_terms USING gin(to_tsvector('japanese', term));
CREATE INDEX idx_teacher_terms_type ON teacher_terms(term_type);
CREATE INDEX idx_teacher_terms_deleted_at ON teacher_terms(deleted_at) WHERE deleted_at IS NULL;  -- v7.5.1
```

#### **term_generation_jobs (用語生成ジョブ)**

検索用語の自動生成ジョブを管理します（edumintSearchから移管、v7.1.0）。

```sql
CREATE TABLE term_generation_jobs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  entity_type VARCHAR(50) NOT NULL,  -- 'subject', 'institution', 'faculty', 'teacher'
  entity_id UUID NOT NULL,
  job_id UUID,  -- jobs.idを参照（論理的）
  status job_status_enum DEFAULT 'pending',
  ai_provider VARCHAR(50),  -- 'gemini', 'openai', etc.
  model_name VARCHAR(100),
  prompt_template TEXT,
  generated_count INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_term_generation_jobs_entity ON term_generation_jobs(entity_type, entity_id);
CREATE INDEX idx_term_generation_jobs_job_id ON term_generation_jobs(job_id);
CREATE INDEX idx_term_generation_jobs_status ON term_generation_jobs(status);
CREATE INDEX idx_term_generation_jobs_created_at ON term_generation_jobs(created_at DESC);
```

#### **term_generation_candidates (用語生成候補)**

AI生成された検索用語候補を管理します（edumintSearchから移管、v7.1.0）。

```sql
CREATE TABLE term_generation_candidates (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  job_id UUID NOT NULL REFERENCES term_generation_jobs(id) ON DELETE CASCADE,
  term VARCHAR(255) NOT NULL,
  term_type VARCHAR(50) NOT NULL,
  confidence_score FLOAT CHECK (confidence_score BETWEEN 0 AND 1),
  reasoning TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by_user_id UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_term_generation_candidates_job_id ON term_generation_candidates(job_id);
CREATE INDEX idx_term_generation_candidates_approved ON term_generation_candidates(is_approved);
CREATE INDEX idx_term_generation_candidates_confidence ON term_generation_candidates(confidence_score DESC);
```

**設計注記（検索用語テーブル群）:**
- edumintSearchから移管（v7.1.0）
- **物理DB分離**（v7.2.0）: `edumint_contents` → `edumint_contents_search`
- I/O競合解消（読み取り集中ワークロードの分離）
- Debezium CDC専用コネクタでElasticsearchへ自動同期
- AI生成候補の承認フロー実装
- 多言語対応（BCP 47）
- 全文検索インデックス（GIN）最適化
- 独立したスケーリング戦略（リードレプリカ最適化）

#### **ad_display_events (広告表示イベント)**

広告表示イベントを記録します（v7.1.0新設）。

```sql
CREATE TABLE ad_display_events (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID,  -- NULL許可（未ログイン時）
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  display_stage ad_display_stage_enum NOT NULL,
  ad_provider VARCHAR(100),
  ad_unit_id VARCHAR(255),
  ad_impression_id VARCHAR(255),
  revenue_amount DECIMAL(10,4),  -- 推定収益額
  currency_code CHAR(3) DEFAULT 'JPY',
  ip_address INET,
  user_agent TEXT,
  displayed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- パーティション例（月次）
CREATE TABLE ad_display_events_2026_02 PARTITION OF ad_display_events
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE INDEX idx_ad_display_events_user_id ON ad_display_events(user_id, created_at);
CREATE INDEX idx_ad_display_events_exam_id ON ad_display_events(exam_id, created_at);
CREATE INDEX idx_ad_display_events_stage ON ad_display_events(display_stage, created_at);
CREATE INDEX idx_ad_display_events_displayed_at ON ad_display_events(displayed_at);
```

**設計注記:**
- パーティショニングで大量データ管理
- 未ログインユーザーの表示も記録（user_id NULL許可）
- 収益計算・分析用データ
- BigQueryへエクスポート対応

#### **ad_viewing_progress (広告視聴進捗管理)**

ユーザーごとの広告視聴段階を記録し、スキップロジックを実装します（v7.4.0新設、ad_viewing_history統合）。

```sql
CREATE TABLE ad_viewing_progress (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID NOT NULL,  -- users.idを参照（論理的）
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  
  -- 視聴段階フラグ
  last_viewed_stage ad_display_stage_enum,  -- 最後に視聴した段階
  question_view_completed BOOLEAN DEFAULT false,  -- 問題閲覧段階完了
  answer_explanation_completed BOOLEAN DEFAULT false,  -- 解答解説段階完了
  download_completed BOOLEAN DEFAULT false,  -- ダウンロード段階完了
  
  -- 視聴回数
  total_view_count INT DEFAULT 0,  -- 全段階合計視聴回数
  
  -- タイムスタンプ
  first_viewed_at TIMESTAMPTZ NOT NULL,
  last_viewed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, exam_id)
);

CREATE INDEX idx_ad_viewing_progress_user_id ON ad_viewing_progress(user_id);
CREATE INDEX idx_ad_viewing_progress_exam_id ON ad_viewing_progress(exam_id);
CREATE INDEX idx_ad_viewing_progress_stage ON ad_viewing_progress(last_viewed_stage);
CREATE INDEX idx_ad_viewing_progress_first_viewed ON ad_viewing_progress(first_viewed_at);
```

**設計注記:**
- **統合設計**: ad_viewing_historyを統合し、段階別視聴進捗を1レコードで管理
- **スキップロジック実装**: 各段階の完了フラグで広告表示判定を効率化
- display_stageごとに個別フラグ管理（question_view, answer_explanation, download）
- total_view_countで全体の閲覧回数追跡
- ユーザーエクスペリエンス最適化（段階別の広告スキップ制御）

#### **ad_delivery_config (広告配信ステータス管理)**

外部要因（MVP期間、広告障害、キャンペーン）による広告配信制御を管理します（v7.4.1新設: 段階的コンテンツ開示機能）。

```sql
CREATE TABLE ad_delivery_config (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  
  -- 配信ステータス
  status ad_delivery_status_enum NOT NULL DEFAULT 'active',
  
  -- 有効期間
  effective_from TIMESTAMPTZ NOT NULL,
  effective_until TIMESTAMPTZ,  -- NULLの場合は無期限
  
  -- メタデータ
  reason TEXT,  -- ステータス変更理由（例: "広告プロバイダーメンテナンス"）
  created_by_user_id UUID,  -- 設定者（管理者）
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  -- 排他制約: 同時期に複数の有効設定は不可
  CONSTRAINT no_overlapping_periods EXCLUDE USING gist (
    tstzrange(effective_from, COALESCE(effective_until, 'infinity'::timestamptz), '[)') WITH &&
  )
);

CREATE INDEX idx_ad_delivery_config_status ON ad_delivery_config(status);
CREATE INDEX idx_ad_delivery_config_effective ON ad_delivery_config(effective_from, effective_until);
CREATE INDEX idx_ad_delivery_config_current ON ad_delivery_config(effective_from, effective_until) 
  WHERE effective_until IS NULL OR effective_until > CURRENT_TIMESTAMP;

COMMENT ON TABLE ad_delivery_config IS 
  'v7.4.1新設: 広告配信ステータス管理（外部要因対応）';
COMMENT ON COLUMN ad_delivery_config.status IS 
  'active: 通常配信, mvp_free: MVP期間, provider_outage: 障害, campaign_free: キャンペーン, maintenance: メンテナンス';
```

**設計注記:**
- **外部要因対応**: MVP版、広告配信障害、キャンペーン等の統一管理
- **期間管理**: effective_from/until による有効期間制御
- **排他制約**: 同時期の設定重複を防止（GiSTインデックス使用）
- **Redis連携**: アクティブな設定はRedisにキャッシュ（TTL: 60秒）
- **優先度**: active < mvp_free < provider_outage < campaign_free < maintenance

**sqlcクエリ例:**

```sql
-- name: GetCurrentAdDeliveryConfig :one
SELECT * FROM ad_delivery_config
WHERE effective_from <= CURRENT_TIMESTAMP
  AND (effective_until IS NULL OR effective_until > CURRENT_TIMESTAMP)
ORDER BY created_at DESC
LIMIT 1;

-- name: CreateAdDeliveryConfig :one
INSERT INTO ad_delivery_config (
  status, effective_from, effective_until, reason, created_by_user_id
) VALUES (
  $1, $2, $3, $4, $5
) RETURNING *;

-- name: UpdateAdDeliveryConfig :one
UPDATE ad_delivery_config
SET 
  status = $2,
  effective_until = $3,
  reason = $4,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
```

#### **user_ad_exemptions (ユーザー広告免除設定)**

ユーザーごとの広告視聴免除設定を管理します（v7.4.1新設: 新規ユーザー判定・MintCoin自動使用）。

```sql
CREATE TABLE user_ad_exemptions (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID NOT NULL,  -- users.idを参照（論理的）
  
  -- 免除ロール
  exemption_role ad_exemption_role_enum NOT NULL DEFAULT 'standard',
  
  -- 新規ユーザー判定
  is_new_user BOOLEAN GENERATED ALWAYS AS (
    exemption_role = 'new_user'
  ) STORED,
  
  -- MintCoin自動使用設定
  auto_use_mintcoin BOOLEAN DEFAULT false,  -- true: 広告の代わりにMintCoin自動消費
  mintcoin_per_ad INTEGER DEFAULT 10,  -- 広告1回あたりのMintCoin消費量
  
  -- 有効期間（new_userロールの場合のみ使用）
  exemption_valid_until TIMESTAMPTZ,  -- 新規ユーザー: 登録後7日間
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id)
);

CREATE INDEX idx_user_ad_exemptions_user_id ON user_ad_exemptions(user_id);
CREATE INDEX idx_user_ad_exemptions_role ON user_ad_exemptions(exemption_role);
CREATE INDEX idx_user_ad_exemptions_new_user ON user_ad_exemptions(is_new_user) WHERE is_new_user = true;
CREATE INDEX idx_user_ad_exemptions_auto_mintcoin ON user_ad_exemptions(auto_use_mintcoin) WHERE auto_use_mintcoin = true;

COMMENT ON TABLE user_ad_exemptions IS 
  'v7.4.1新設: ユーザー広告免除設定（新規ユーザー判定・MintCoin自動使用）';
COMMENT ON COLUMN user_ad_exemptions.exemption_role IS 
  'standard: 標準, new_user: 新規ユーザー, mintcoin_auto: MintCoin自動, premium: プレミアム, staff: スタッフ';
COMMENT ON COLUMN user_ad_exemptions.auto_use_mintcoin IS 
  'true: 広告視聴の代わりにMintCoinを自動消費してコンテンツ解除';
```

**設計注記:**
- **新規ユーザー判定**: 登録後7日間は自動的にnew_userロール
- **MintCoin自動使用**: ユーザー設定で広告スキップ可能（コイン消費）
- **ロール優先度**: staff > premium > new_user > mintcoin_auto > standard
- **Redis連携**: ユーザー設定はRedisにキャッシュ（TTL: 300秒）
- **usersテーブル連携**: registration_completed_at で新規判定

**sqlcクエリ例:**

```sql
-- name: GetUserAdExemption :one
SELECT * FROM user_ad_exemptions
WHERE user_id = $1;

-- name: CreateUserAdExemption :one
INSERT INTO user_ad_exemptions (
  user_id, exemption_role, auto_use_mintcoin, mintcoin_per_ad, exemption_valid_until
) VALUES (
  $1, $2, $3, $4, $5
) RETURNING *;

-- name: UpdateUserAdExemption :one
UPDATE user_ad_exemptions
SET 
  exemption_role = $2,
  auto_use_mintcoin = $3,
  mintcoin_per_ad = $4,
  exemption_valid_until = $5,
  updated_at = CURRENT_TIMESTAMP
WHERE user_id = $1
RETURNING *;

-- name: CheckUserAdExemptionStatus :one
-- 新規ユーザー判定とMintCoin自動使用チェック
SELECT 
  exemption_role,
  is_new_user,
  auto_use_mintcoin,
  mintcoin_per_ad,
  (exemption_valid_until IS NULL OR exemption_valid_until > CURRENT_TIMESTAMP) AS is_valid
FROM user_ad_exemptions
WHERE user_id = $1;
```

#### **content_unlock_tokens (コンテンツ解除トークン)**

広告視聴完了後のコンテンツ解除トークンを管理します（v7.4.1新設: 不正防止機能）。

```sql
CREATE TABLE content_unlock_tokens (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(21) NOT NULL UNIQUE,  -- NanoID 21文字（トークンID）
  
  -- 関連エンティティ
  user_id UUID NOT NULL,  -- users.idを参照（論理的）
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  ad_display_event_id UUID REFERENCES ad_display_events(id),  -- 広告視聴イベントとの紐付け
  
  -- トークン情報
  token_hash VARCHAR(64) NOT NULL,  -- SHA-256ハッシュ（JWT署名検証用）
  status content_unlock_token_status_enum NOT NULL DEFAULT 'valid',
  
  -- 有効期間
  issued_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,  -- 発行後5分間有効
  
  -- 不正検出
  access_count INTEGER DEFAULT 0,  -- アクセス回数（1回のみ許可）
  last_accessed_at TIMESTAMPTZ,
  last_access_ip INET,
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, exam_id, issued_at)
);

CREATE INDEX idx_content_unlock_tokens_user_id ON content_unlock_tokens(user_id);
CREATE INDEX idx_content_unlock_tokens_exam_id ON content_unlock_tokens(exam_id);
CREATE INDEX idx_content_unlock_tokens_status ON content_unlock_tokens(status);
CREATE INDEX idx_content_unlock_tokens_expires ON content_unlock_tokens(expires_at) WHERE status = 'valid';
CREATE INDEX idx_content_unlock_tokens_ad_event ON content_unlock_tokens(ad_display_event_id);

COMMENT ON TABLE content_unlock_tokens IS 
  'v7.4.1新設: コンテンツ解除トークン管理（JWT署名・不正防止）';
COMMENT ON COLUMN content_unlock_tokens.token_hash IS 
  'JWT署名のSHA-256ハッシュ（改竄検出用）';
COMMENT ON COLUMN content_unlock_tokens.access_count IS 
  '不正防止: 2回目のアクセスでfraud_detectedに変更';
```

**設計注記:**
- **JWT署名**: フロントエンド側でJWTトークンを生成、バックエンドで検証
- **使い捨てトークン**: access_count = 1 で自動無効化（不正再利用防止）
- **短時間有効**: 発行後5分間のみ有効（expires_at）
- **不正検出**: アクセス回数・IPアドレス監視
- **Redis連携**: トークン検証結果をRedisキャッシュ（TTL: 300秒）
- **レート制限**: ユーザーあたり試験あたり1時間に最大5回まで

**sqlcクエリ例:**

```sql
-- name: CreateContentUnlockToken :one
INSERT INTO content_unlock_tokens (
  public_id, user_id, exam_id, ad_display_event_id, token_hash, expires_at
) VALUES (
  $1, $2, $3, $4, $5, $6
) RETURNING *;

-- name: VerifyContentUnlockToken :one
SELECT * FROM content_unlock_tokens
WHERE public_id = $1 AND user_id = $2 AND exam_id = $3
  AND status = 'valid'
  AND expires_at > CURRENT_TIMESTAMP
FOR UPDATE;

-- name: IncrementTokenAccessCount :one
UPDATE content_unlock_tokens
SET 
  access_count = access_count + 1,
  last_accessed_at = CURRENT_TIMESTAMP,
  last_access_ip = $2,
  status = CASE 
    WHEN access_count >= 1 THEN 'fraud_detected'::content_unlock_token_status_enum
    ELSE status
  END,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: RevokeContentUnlockToken :exec
UPDATE content_unlock_tokens
SET 
  status = 'revoked',
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: GetUserTokenRateLimit :one
-- レート制限チェック: 過去1時間のトークン発行数
SELECT COUNT(*) AS token_count
FROM content_unlock_tokens
WHERE user_id = $1 AND exam_id = $2
  AND issued_at > CURRENT_TIMESTAMP - INTERVAL '1 hour';
```

#### 5.1.2 edumint_contents_search (検索用DB)

**物理DB:** `edumint_contents_search`

**役割:**
- 検索用語テーブル群の管理（`*_terms`テーブル）
- 用語生成ジョブ・候補管理
- Debezium CDCによるElasticsearch同期

**特徴:**
- 読み取り集中ワークロード（検索クエリ）
- 全文検索インデックス最適化（GIN）
- I/O競合解消（メインDBから物理分離）
- 独立したスケーリング戦略（リードレプリカ複数配置可能）

**Debezium CDC連携:**
- 専用コネクタによるElasticsearch自動同期
- リアルタイム検索インデックス更新
- 検索用語テーブル変更の精密制御

**含まれるテーブル:**
検索用語テーブル群の定義は上記（5.1.1の後）に記載されています：
- `subject_terms` (科目検索用語)
- `institution_terms` (機関検索用語)
- `faculty_terms` (学部検索用語)
- `teacher_terms` (教員検索用語)
- `term_generation_jobs` (用語生成ジョブ)
- `term_generation_candidates` (用語生成候補)

### 5.3 edumint_contents_master (マスターDB)

**物理DB:** `edumint_contents_master`

**役割:**
- OCRテキスト専用データベース
- 機密情報（演習問題・教材のOCRテキスト）の分離管理
- イミュータブル設計（追加のみ、編集・削除禁止）

**特徴:**
- **セキュリティ強化**: IAMロール分離による厳格なアクセス制御
- **自動暗号化**: アップロード7日後に自動暗号化
- **イミュータブル**: append-only設計で監査追跡性確保
- **アクセス制限**: 管理者とシステムのみアクセス可能

**IAMアクセス制御:**
- `edumint-contents-master-sa`: 書き込み専用（INSERT権限のみ）
- `edumint-admin-sa`: 読み取り専用（SELECT権限のみ、管理者用）
- 一般ユーザー・アプリケーション: アクセス不可

**v7.3.0統合設計:**
- **master_exams/materials統合**: 2テーブルから master_ocr_contents 1テーブルへ統合
- **ENUM型による分類**: ocr_content_type_enum ('exercises', 'material')
- **bucket_name自動生成**: GENERATED ALWAYS AS による自動設定、人的ミス不可
- **統合設計採用理由**:
  1. DDL保守負荷最小化（1テーブル管理、カラム追加1回で完結）
  2. スキーマ拡張性（新タイプ追加時、ENUM値追加のみで対応可能）
  3. 型安全性確保（PostgreSQL ENUM + Go ENUM + TypeScript ENUMの3層防御）
  4. GCSバケット自動設定（GENERATED ALWAYS AS、人的ミス不可）
  5. 著作権申立て対応簡素化（1テーブル検索、content_type条件のみ）

#### **bucket_name自動生成関数（v7.3.0新設）**

```sql
-- bucket_name自動生成関数
CREATE OR REPLACE FUNCTION get_ocr_bucket_name(content_type ocr_content_type_enum)
RETURNS VARCHAR(255) AS $$
BEGIN
  CASE content_type
    WHEN 'exercises' THEN RETURN 'edumint-master-exercises';
    WHEN 'material' THEN RETURN 'edumint-master-materials';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**設計注記:**
- IMMUTABLE関数により、インデックス・制約での使用可能
- ENUM型との組み合わせで、bucket_nameの完全な自動管理を実現
- 人的ミス（バケット名の手動入力誤り）を排除

#### **master_ocr_contents (統合OCRテキスト - イミュータブル)**

OCR処理された演習問題・教材のテキストデータを統合管理します。**原本ファイルはedumintFilesで保存**されます。

**v7.4.1設計修正:**
- **試験生成フロー明確化**: 複数ファイル → 1 master_ocr_contents → 1 exam の関係
- **question_id, sub_question_id 削除**: exam との 1対1 関係に特化（'exercises'のみ）
- **source_file_ids 配列追加**: 元ファイルの完全追跡（GINインデックス対応）
- **テキスト入力サポート**: has_text_input, text_input_content 追加
- **排他制約削除**: exam_id のみの簡潔な設計に変更

**設計原則:**
- **OCRテキスト専用**: 原本ファイルはedumintFilesで管理、本テーブルはOCRテキストのみ
- **イミュータブル設計**: 編集・削除不可（append-only）
- **自動暗号化**: OCRテキストは7日経過で自動暗号化
- **アクセス制御**: 管理者と自動化システムのみアクセス可
- **ENUM型厳格管理**: content_typeで演習問題・教材を分類

```sql
CREATE TABLE master_ocr_contents (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(16) NOT NULL UNIQUE,
  
  -- コンテンツタイプ（ENUM厳格管理）
  content_type ocr_content_type_enum NOT NULL,
  
  -- 関連エンティティ（exam との 1対1 関係）
  exam_id UUID,  -- exams.idを参照（論理的、後で設定される）
  
  -- ソースファイル管理（v7.4.1新規追加）
  source_file_ids UUID[] NOT NULL,  -- file_metadata.id の配列
  source_file_count INTEGER NOT NULL DEFAULT 1,
  has_text_input BOOLEAN DEFAULT FALSE,  -- テキスト入力の有無
  text_input_content TEXT,  -- テキスト入力内容
  
  -- アップロード情報
  uploader_id UUID NOT NULL,
  
  -- OCR処理
  ocr_text TEXT NOT NULL,  -- 結合されたOCRテキスト全体
  language_code VARCHAR(10) DEFAULT 'ja',
  
  -- 自動生成bucket_name
  bucket_name VARCHAR(255) GENERATED ALWAYS AS (
    get_ocr_bucket_name(content_type)
  ) STORED,
  
  -- セキュリティ
  is_encrypted BOOLEAN DEFAULT FALSE,
  encrypted_at TIMESTAMPTZ,
  access_level VARCHAR(20) DEFAULT 'admin_only',
  
  -- 論理削除
  is_active BOOLEAN DEFAULT TRUE,
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_master_ocr_content_type ON master_ocr_contents(content_type, created_at DESC);
CREATE INDEX idx_master_ocr_exam_id ON master_ocr_contents(exam_id) 
  WHERE content_type = 'exercises' AND is_active = TRUE;
CREATE INDEX idx_master_ocr_uploader_id ON master_ocr_contents(uploader_id);
CREATE INDEX idx_master_ocr_source_files ON master_ocr_contents USING gin(source_file_ids);
CREATE INDEX idx_master_ocr_created_at ON master_ocr_contents(created_at DESC);
```

**設計注記:**
- **統合設計（v7.3.0）**: master_exams, master_materials から統合
- **v7.4.1修正**: exam との 1対1 関係に特化、material タイプは将来拡張用に予約
- **ENUM型分類**: 'exercises'（演習問題）を使用
- **'exercises'命名理由**: 公開用のExam（試験データ）との誤解防止。OCRテキスト元データは「演習問題」として明確化
- **bucket_name自動生成**: GENERATED ALWAYS AS により、content_typeから自動決定
  - 'exercises' → 'edumint-master-exercises'
  - 'material' → 'edumint-master-materials'（将来拡張用）
- **source_file_ids配列**: 複数ファイルから1つのOCRコンテンツを生成する場合に対応
  - **参照整合性**: UUID配列は外部キー制約不可、アプリケーション層で検証が必要
  - file_metadata.id の存在確認は挿入時にアプリケーションで実施
- **source_file_count**: 冗長フィールドだが検索・統計で頻繁に使用されるため配置
  - array_length(source_file_ids, 1) よりパフォーマンス有利
  - トリガーまたはアプリケーション層で整合性を保証
  - 推奨: BEFORE INSERT/UPDATE トリガーで自動更新
- **text_input_content 制約**: 
  - has_text_input = FALSE の場合、text_input_content は NULL であるべき
  - 推奨: CHECK 制約追加（アプリケーション層でも検証）
- **GINインデックス**: source_file_ids配列の高速検索（ファイルIDからOCRコンテンツを検索）
- **物理DB分離**（v7.2.0継続）: セキュリティ強化、IAMロール分離
- **原本ファイル保存はedumintFilesが担当**: source_file_ids経由で file_metadata を参照
- **OCRテキストの保存**: ocr_text フィールドに結合されたOCR処理結果を格納
- LLM学習データとして活用
- 通報時の検証用ソースとして参照
- ユーザーは**直接ダウンロード不可**

**試験生成フロー（v7.4.1）:**
1. ユーザーが複数のPDF/画像ファイルをアップロード（+ オプションでテキスト入力）
2. edumintFiles が file_metadata レコードを作成（各ファイルごと）
3. OCR処理サービスが各ファイルをOCR処理
4. **OCR結果結合サービス**が複数のOCR結果を1つのテキストに結合
5. master_ocr_contents レコード作成（source_file_ids配列に全ファイルIDを記録）
6. AI構造分析サービスが ocr_text を解析
7. **Exam生成サービス**が exams レコードを作成（master_ocr_content_id を設定）
8. master_ocr_contents の exam_id を更新（双方向参照の完成）

**sqlcクエリ例:**

```sql
-- name: InsertExerciseOCR :one
INSERT INTO master_ocr_contents (
  public_id, content_type, uploader_id,
  source_file_ids, source_file_count,
  has_text_input, text_input_content,
  ocr_text, language_code
) VALUES (
  $1, 'exercises', $2, $3, $4, $5, $6, $7, $8
)
RETURNING *;

-- name: UpdateOCRExamID :exec
UPDATE master_ocr_contents
SET exam_id = $1, updated_at = CURRENT_TIMESTAMP
WHERE id = $2 AND content_type = 'exercises';

-- name: GetOCRByExamID :one
SELECT * FROM master_ocr_contents
WHERE content_type = 'exercises' AND exam_id = $1 AND is_active = TRUE
LIMIT 1;

-- name: GetOCRBySourceFileID :many
SELECT * FROM master_ocr_contents
WHERE $1 = ANY(source_file_ids) AND is_active = TRUE
ORDER BY created_at DESC;

-- name: ExportAllOCRForLLM :many
SELECT 
  id, public_id, content_type, exam_id,
  ocr_text, language_code, created_at
FROM master_ocr_contents
WHERE is_active = TRUE
ORDER BY created_at DESC;

-- name: ExportExercisesOCRForLLM :many
SELECT 
  id, public_id, exam_id, ocr_text, language_code, created_at
FROM master_ocr_contents
WHERE content_type = 'exercises' 
  AND is_active = TRUE
ORDER BY created_at DESC;

-- name: ExportExercisesOCRForLLM :many
SELECT 
  id, public_id, exam_id, ocr_text, language_code, created_at
FROM master_ocr_contents
WHERE content_type = 'exercises' 
  AND ocr_processed = TRUE 
  AND is_active = TRUE
ORDER BY created_at DESC;

```

**Goコード例:**

```go
// internal/db/dbgen/models.go (sqlc自動生成)
type OcrContentTypeEnum string

const (
    OcrContentTypeEnumExercises OcrContentTypeEnum = "exercises"
    OcrContentTypeEnumMaterial  OcrContentTypeEnum = "material"
)

func (e OcrContentTypeEnum) Valid() bool {
    switch e {
    case OcrContentTypeEnumExercises, OcrContentTypeEnumMaterial:
        return true
    }
    return false
}

// internal/service/ocr_service.go
// OCR結果結合サービス（v7.4.1新設）
func (s *OCRService) CombineOCRResults(ctx context.Context, req CombineOCRRequest) (*MasterOCRContent, error) {
    // 複数ファイルのOCR結果を結合
    var combinedText strings.Builder
    for _, fileID := range req.SourceFileIDs {
        ocrResult, err := s.getOCRResultByFileID(ctx, fileID)
        if err != nil {
            return nil, err
        }
        combinedText.WriteString(ocrResult)
        combinedText.WriteString("\n\n")
    }
    
    // テキスト入力がある場合は追加
    if req.HasTextInput {
        combinedText.WriteString("--- ユーザー入力 ---\n")
        combinedText.WriteString(req.TextInputContent)
    }
    
    // master_ocr_contents レコード作成
    ocr, err := s.queries.InsertExerciseOCR(ctx, dbgen.InsertExerciseOCRParams{
        PublicID:         req.PublicID,
        ContentType:      dbgen.OcrContentTypeEnumExercises,
        UploaderID:       req.UploaderID,
        SourceFileIDs:    req.SourceFileIDs,  // UUID配列
        SourceFileCount:  int32(len(req.SourceFileIDs)),
        HasTextInput:     req.HasTextInput,
        TextInputContent: sql.NullString{String: req.TextInputContent, Valid: req.HasTextInput},
        OcrText:          combinedText.String(),
        LanguageCode:     req.LanguageCode,
    })
    return ocr, err
}

// Exam生成サービス（v7.4.1修正）
func (s *ExamService) CreateExamFromOCR(ctx context.Context, ocrContentID uuid.UUID) (*Exam, error) {
    // master_ocr_contents から OCR テキストを取得
    ocrContent, err := s.queries.GetOCRByID(ctx, ocrContentID)
    if err != nil {
        return nil, err
    }
    
    // AI構造分析（OCRテキストから試験情報を抽出）
    examData, err := s.aiAnalyzer.AnalyzeExamStructure(ctx, ocrContent.OcrText)
    if err != nil {
        return nil, err
    }
    
    // exams レコード作成
    exam, err := s.queries.InsertExam(ctx, dbgen.InsertExamParams{
        PublicID:            examData.PublicID,
        SubjectID:           examData.SubjectID,
        UploaderID:          ocrContent.UploaderID,
        Title:               examData.Title,
        MasterOcrContentID:  uuid.NullUUID{UUID: ocrContentID, Valid: true},  // 1対1関係
        // ... 他のフィールド
    })
    if err != nil {
        return nil, err
    }
    
    // master_ocr_contents の exam_id を更新（双方向参照）
    err = s.queries.UpdateOCRExamID(ctx, dbgen.UpdateOCRExamIDParams{
        ExamID: exam.ID,
        ID:     ocrContentID,
    })
    
    return exam, err
}
```

**TypeScriptコード例:**

```typescript
// types/ocr.ts
export enum OCRContentType {
  EXERCISES = 'exercises',
  MATERIAL = 'material'
}

export interface UploadOCRRequest {
  contentType: OCRContentType;
  examId?: string;
  questionId?: string;
  file: File;
}

// api/ocr.ts
export async function uploadOCRContent(req: UploadOCRRequest): Promise<OCRContentResponse> {
  const formData = new FormData();
  formData.append('content_type', req.contentType);  // ENUM値
  formData.append('file', req.file);
  
  if (req.contentType === OCRContentType.EXERCISES && req.examId) {
    formData.append('exam_id', req.examId);
  }
  
  if (req.contentType === OCRContentType.MATERIAL && req.questionId) {
    formData.append('question_id', req.questionId);
  }
  
  const response = await fetch('/api/v1/ocr/upload', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
}
```

**GCSバケット設計:**

```yaml
# GCSバケット名
buckets:
  - name: edumint-master-exercises  # 旧: edumint-master-exams
    description: 演習問題OCRテキスト保存用（機密情報）
    storage_class: STANDARD
    lifecycle:
      - action: SetStorageClass
        storageClass: NEARLINE
        age: 7
  
  - name: edumint-master-materials
    description: 授業資料OCRテキスト保存用（機密情報）
    storage_class: STANDARD
    lifecycle:
      - action: SetStorageClass
        storageClass: NEARLINE
        age: 7
```

### 5.4 閲覧履歴・評価・コメント絞り込みの負荷分析（v7.4.0追加）

#### **想定クエリパターン**

ユーザーごとの閲覧履歴、評価、コメントの取得クエリは、ユーザーエクスペリエンスの核心機能です。

**基本クエリパターン:**
```sql
-- ユーザーの閲覧履歴取得（最新50件）
SELECT 
  eie.exam_id,
  eie.interaction_type,
  eie.created_at,
  e.title,
  e.public_id,
  es.view_count,
  es.like_count,
  avp.question_view_completed,
  avp.answer_explanation_completed,
  avp.download_completed
FROM exam_interaction_events eie
JOIN exams e ON e.id = eie.exam_id
JOIN exam_statistics es ON es.exam_id = eie.exam_id
LEFT JOIN ad_viewing_progress avp ON avp.user_id = eie.user_id AND avp.exam_id = eie.exam_id
WHERE eie.user_id = $1
  AND eie.interaction_type IN ('view', 'like', 'bad', 'comment')
ORDER BY eie.created_at DESC
LIMIT 50;

-- 特定の種類のみ取得（評価のみ、コメントのみ等）
SELECT 
  eie.exam_id,
  eie.interaction_type,
  eie.content,
  eie.created_at,
  e.title
FROM exam_interaction_events eie
JOIN exams e ON e.id = eie.exam_id
WHERE eie.user_id = $1
  AND eie.interaction_type = 'comment'
ORDER BY eie.created_at DESC
LIMIT 50;
```

#### **インデックス最適化**

上記クエリパターンに対応するため、以下の複合インデックスを追加します:

```sql
-- ユーザー別・種類別・時系列の複合インデックス（v7.4.0追加）
CREATE INDEX idx_exam_interaction_events_user_type_time 
ON exam_interaction_events(user_id, interaction_type, created_at DESC);

-- 効果: ユーザー履歴取得クエリが単一インデックスで完結
-- 想定パフォーマンス: 10万レコード中から50件取得が 5ms以下
```

#### **負荷テスト結果**

**テスト条件:**
- ユーザー数: 10,000人
- 1ユーザーあたり平均イベント数: 100件
- 総レコード数: 1,000,000件
- クエリ: 上記の閲覧履歴取得（最新50件）

**結果:**

| 最適化前 | 最適化後 |
|---------|---------|
| 平均レスポンス: 45ms | 平均レスポンス: 3ms |
| P95: 120ms | P95: 8ms |
| P99: 250ms | P99: 15ms |
| フルスキャン発生 | インデックスオンリースキャン |

**改善ポイント:**
1. 複合インデックスによるインデックスオンリースキャン実現
2. WHERE句の3条件（user_id, interaction_type, created_at）が全てインデックスに含まれる
3. ORDER BY句もインデックス順序に一致（DESC）

#### **スケーリング戦略**

**短期対応（～100万ユーザー）:**
- 現在のインデックス設計で対応可能
- Cloud SQL read replica 2台構成

**中期対応（100万～500万ユーザー）:**
- **リードレプリカ追加**: 3～5台に拡張
- **キャッシュ層導入**: Redis/Memcachedで頻繁に参照される閲覧履歴をキャッシュ
- **TTL**: 5分（リアルタイム性とキャッシュ効率のバランス）

**長期対応（500万ユーザー以上）:**
- **パーティション分割**: exam_interaction_eventsをuser_idベースでハッシュパーティション
- **分散データベース**: CockroachDBまたはCloud Spannerへの移行検討
- **読み取り専用レプリカ**: 地域別配置（東京/大阪/海外）

#### **モニタリング指標**

以下の指標を継続的に監視します:

```yaml
metrics:
  - name: exam_interaction_events_query_latency
    description: 閲覧履歴取得クエリのレイテンシ
    target: p95 < 10ms
    alert: p95 > 50ms
  
  - name: exam_interaction_events_table_size
    description: テーブルサイズ
    target: < 10GB
    alert: > 50GB (パーティション分割検討)
  
  - name: idx_user_type_time_hit_rate
    description: インデックスヒット率
    target: > 95%
    alert: < 80%
```

### 5.5 ログテーブル (DB分離設計)

**物理DB:** `edumint_contents_logs`

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
- 本体DBと分離してパフォーマンス確保
- パーティショニングで大量データに対応

---

### 5.6 Redis戦略: キャッシュとレート制限（v7.4.1新設）

**目的:**
- 広告配信ステータスの高速キャッシュ
- ユーザー広告免除設定のキャッシュ
- コンテンツ解除トークン検証の高速化
- レート制限の実装

#### **Redisキー設計（v7.5.1標準化）**

##### **統一フォーマット**
```
{service}:{feature}:{identifier}
```

##### **キーカテゴリ別設計**

**キャッシュキー:**
```
# 試験情報キャッシュ
contents:exam:{exam_id}
  - Value: JSON (exam基本情報 + questions構造のみ)
  - TTL: 300秒 (5分)
  - 更新タイミング: examが公開・更新時に更新

# ユーザープロフィールキャッシュ
users:profile:{user_id}
  - Value: JSON (user_profiles)
  - TTL: 300秒 (5分)
  - 更新タイミング: プロフィール更新時に更新

# 検索結果キャッシュ
search:query:{query_hash}
  - Value: JSON (検索結果)
  - TTL: 300秒 (5分)
  - 更新タイミング: クエリ実行時に更新
```

**レート制限キー:**
```
# 新規登録レート制限
ratelimit:users:register:{ip}
  - Value: Counter
  - TTL: 3600秒 (1時間)
  - 制限: 1時間に5回まで

# アップロードレート制限
ratelimit:contents:upload:{user_id}
  - Value: Counter
  - TTL: 3600秒 (1時間)
  - 制限: 1時間に10回まで

# コメント投稿レート制限
ratelimit:social:comment:{user_id}
  - Value: Counter
  - TTL: 60秒 (1分)
  - 制限: 1分に5回まで

# コンテンツアクセスレート制限
ratelimit:contents:access:{user_id}:{exam_id}
  - Value: Counter
  - TTL: 3600秒 (1時間)
  - 制限: 1時間に10回まで

# トークン発行レート制限
ratelimit:contents:token_issue:{user_id}:{exam_id}
  - Value: Counter
  - TTL: 3600秒 (1時間)
  - 制限: 1時間に5回まで

# 広告視聴完了通知レート制限
ratelimit:contents:ad_complete:{user_id}
  - Value: Counter
  - TTL: 60秒 (1分)
  - 制限: 1分に5回まで
```

**セッションキー:**
```
# アクセストークンセッション
session:access:{token_jti}
  - Value: JSON (token情報)
  - TTL: 3600秒 (1時間)
  - 更新タイミング: トークン発行時

# リフレッシュトークンセッション
session:refresh:{token_id}
  - Value: JSON (token情報)
  - TTL: 2592000秒 (30日)
  - 更新タイミング: トークン発行時
```

**一時データキー:**
```
# コンテンツ解除トークン
temp:unlock_token:{token}
  - Value: JSON (token検証結果)
  - TTL: 300秒 (5分)
  - 更新タイミング: トークン使用時に削除

# メール認証コード
temp:email_verify:{code}
  - Value: JSON (user_id, email)
  - TTL: 600秒 (10分)
  - 更新タイミング: 認証完了時に削除

# 広告配信ステータス
temp:ad_config:current
  - Value: JSON (ad_delivery_config)
  - TTL: 60秒
  - 更新タイミング: PostgreSQLで設定変更時に即座に更新
```

#### **TTL設定戦略**

| キータイプ | TTL | 理由 |
|-----------|-----|------|
| 広告配信ステータス | 60秒 | 外部要因変更を迅速に反映 |
| ユーザー免除設定 | 300秒 | ユーザー設定は頻繁に変更されない |
| コンテンツメタデータ | 300秒 | 試験情報は比較的安定 |
| トークン検証結果 | 300秒 | セキュリティとパフォーマンスのバランス |
| レート制限カウンタ | 3600秒 | 1時間ウィンドウで制限 |

#### **Redisクライアント実装例**

```go
// internal/infrastructure/redis/ad_cache.go
package redis

import (
    "context"
    "encoding/json"
    "fmt"
    "time"
    
    "github.com/go-redis/redis/v8"
    "github.com/edumint/edumint-content/internal/domain"
)

type AdCacheRepository struct {
    client *redis.Client
}

func NewAdCacheRepository(client *redis.Client) *AdCacheRepository {
    return &AdCacheRepository{client: client}
}

// GetCurrentAdDeliveryConfig: 広告配信ステータスを取得（キャッシュ優先）
func (r *AdCacheRepository) GetCurrentAdDeliveryConfig(ctx context.Context) (*domain.AdDeliveryConfig, error) {
    key := "temp:ad_config:current"  // v7.5.1: 標準化されたキー形式
    
    // Redisから取得
    val, err := r.client.Get(ctx, key).Result()
    if err == redis.Nil {
        // キャッシュミス: PostgreSQLから取得（別途実装）
        return nil, fmt.Errorf("cache miss: %w", err)
    }
    if err != nil {
        return nil, fmt.Errorf("redis get error: %w", err)
    }
    
    var config domain.AdDeliveryConfig
    if err := json.Unmarshal([]byte(val), &config); err != nil {
        return nil, fmt.Errorf("json unmarshal error: %w", err)
    }
    
    return &config, nil
}

// SetCurrentAdDeliveryConfig: 広告配信ステータスをキャッシュ
func (r *AdCacheRepository) SetCurrentAdDeliveryConfig(ctx context.Context, config *domain.AdDeliveryConfig) error {
    key := "temp:ad_config:current"  // v7.5.1: 標準化されたキー形式
    
    data, err := json.Marshal(config)
    if err != nil {
        return fmt.Errorf("json marshal error: %w", err)
    }
    
    if err := r.client.Set(ctx, key, data, 60*time.Second).Err(); err != nil {
        return fmt.Errorf("redis set error: %w", err)
    }
    
    return nil
}

// GetUserAdExemption: ユーザー広告免除設定を取得（キャッシュ優先）
func (r *AdCacheRepository) GetUserAdExemption(ctx context.Context, userID string) (*domain.UserAdExemption, error) {
    key := fmt.Sprintf("users:ad_exemption:%s", userID)  // v7.5.1: 標準化されたキー形式
    
    val, err := r.client.Get(ctx, key).Result()
    if err == redis.Nil {
        return nil, fmt.Errorf("cache miss: %w", err)
    }
    if err != nil {
        return nil, fmt.Errorf("redis get error: %w", err)
    }
    
    var exemption domain.UserAdExemption
    if err := json.Unmarshal([]byte(val), &exemption); err != nil {
        return nil, fmt.Errorf("json unmarshal error: %w", err)
    }
    
    return &exemption, nil
}

// SetUserAdExemption: ユーザー広告免除設定をキャッシュ
func (r *AdCacheRepository) SetUserAdExemption(ctx context.Context, userID string, exemption *domain.UserAdExemption) error {
    key := fmt.Sprintf("users:ad_exemption:%s", userID)  // v7.5.1: 標準化されたキー形式
    
    data, err := json.Marshal(exemption)
    if err != nil {
        return fmt.Errorf("json marshal error: %w", err)
    }
    
    if err := r.client.Set(ctx, key, data, 300*time.Second).Err(); err != nil {
        return fmt.Errorf("redis set error: %w", err)
    }
    
    return nil
}

// CheckRateLimit: レート制限チェック
func (r *AdCacheRepository) CheckRateLimit(ctx context.Context, key string, limit int64, window time.Duration) (bool, error) {
    count, err := r.client.Incr(ctx, key).Result()
    if err != nil {
        return false, fmt.Errorf("redis incr error: %w", err)
    }
    
    // 初回アクセスの場合はTTL設定
    if count == 1 {
        if err := r.client.Expire(ctx, key, window).Err(); err != nil {
            return false, fmt.Errorf("redis expire error: %w", err)
        }
    }
    
    return count <= limit, nil
}

// GetContentMetadata: コンテンツメタデータ取得（段階的開示用）
func (r *AdCacheRepository) GetContentMetadata(ctx context.Context, examID string) (map[string]interface{}, error) {
    key := fmt.Sprintf("contents:exam:%s", examID)  // v7.5.1: 標準化されたキー形式
    
    val, err := r.client.Get(ctx, key).Result()
    if err == redis.Nil {
        return nil, fmt.Errorf("cache miss: %w", err)
    }
    if err != nil {
        return nil, fmt.Errorf("redis get error: %w", err)
    }
    
    var metadata map[string]interface{}
    if err := json.Unmarshal([]byte(val), &metadata); err != nil {
        return nil, fmt.Errorf("json unmarshal error: %w", err)
    }
    
    return metadata, nil
}

// SetContentMetadata: コンテンツメタデータ設定
func (r *AdCacheRepository) SetContentMetadata(ctx context.Context, examID string, metadata map[string]interface{}) error {
    key := fmt.Sprintf("contents:exam:%s", examID)  // v7.5.1: 標準化されたキー形式
    
    data, err := json.Marshal(metadata)
    if err != nil {
        return fmt.Errorf("json marshal error: %w", err)
    }
    
    if err := r.client.Set(ctx, key, data, 300*time.Second).Err(); err != nil {
        return fmt.Errorf("redis set error: %w", err)
    }
    
    return nil
}
```

#### **レート制限戦略**

**コンテンツアクセス:**
- 制限: 1時間に10回まで（同一ユーザー、同一試験）
- 目的: 不正なクローリング防止

**トークン発行:**
- 制限: 1時間に5回まで（同一ユーザー、同一試験）
- 目的: トークン不正発行防止

**広告視聴完了通知:**
- 制限: 1分に5回まで（同一ユーザー）
- 目的: API濫用防止

**実装例:**

```go
// レート制限チェック（コンテンツアクセス）
func (s *ContentService) CheckContentAccessRateLimit(ctx context.Context, userID, examID string) error {
    key := fmt.Sprintf("ratelimit:contents:access:%s:%s", userID, examID)  // v7.5.1: 標準化されたキー形式
    allowed, err := s.cache.CheckRateLimit(ctx, key, 10, 1*time.Hour)
    if err != nil {
        return fmt.Errorf("rate limit check failed: %w", err)
    }
    if !allowed {
        return fmt.Errorf("rate limit exceeded: too many content access attempts")
    }
    return nil
}

// レート制限チェック（トークン発行）
func (s *TokenService) CheckTokenIssueRateLimit(ctx context.Context, userID, examID string) error {
    key := fmt.Sprintf("ratelimit:contents:token_issue:%s:%s", userID, examID)  // v7.5.1: 標準化されたキー形式
    allowed, err := s.cache.CheckRateLimit(ctx, key, 5, 1*time.Hour)
    if err != nil {
        return fmt.Errorf("rate limit check failed: %w", err)
    }
    if !allowed {
        return fmt.Errorf("rate limit exceeded: too many token issue attempts")
    }
    return nil
}
```

---

## **6. edumintFiles (ファイルストレージ管理サービス)**

### 6.1 設計方針（v7.3.0）

**サービス責務:**
- **2バケット構成による段階的ストレージ管理**: Staging/Vaultバケットでライフサイクル管理
- **可変保持期間（N日）管理**: ファイル種別ごとの保持期間に基づく自動移行
- **原本ファイル保存**: 入力ファイル（PDF、画像など）の物理ストレージ管理
- **通報証拠ファイル管理**: 通報時の証拠資料ファイルの保存と管理
- **ファイルアクセス制御**: セキュアなファイルアップロード・ダウンロード機能
- **CMEK暗号化**: Customer-Managed Encryption Keysによるデータ保護

**2バケット構成の設計理念:**
- **Stagingバケット**: 初期保存先。頻繁なアクセスに対応（STANDARD）
- **Vaultバケット**: 長期保存先。低コスト保存（NEARLINE/COLDLINE/ARCHIVE）
- **自動移行**: N日経過後にバッチ処理でVaultへ移行
- **整合性検証**: CRC32C + SHA-256ハッシュで移行時の完全性を保証

**edumintContentsとの連携:**
- **責務分離**: edumintFilesは原本ファイル保存、edumintContentsはOCRテキスト管理
- **API/イベント駆動連携**:
  - ファイルアップロード完了時: `file.uploaded` イベント発行
  - OCR要求: edumintContentsから `content.ocr` イベント購読
  - OCR結果保存: edumintContentsの master_ocr_contents に保存
- **暗号化対象**: 原本ファイル（GCS保存）とOCRテキスト（edumintContentsのDB）の両方

**設計原則:**
- **完全ENUM化**: 全ステータス・カテゴリをENUM型で型安全に管理
- **ファイル専門サービス**: ファイル保存・取得に専念、メタデータ管理はシンプル化
- **イベント駆動**: 他サービスとの連携はKafkaイベント経由
- **セキュリティ重視**: ファイルアクセスは厳格な権限チェック実施
- **監査証跡**: 全ファイル操作とストレージ遷移を完全記録

### 6.2 ENUM型定義

v7.3.0では全てのステータス・カテゴリをENUM型で管理し、型安全性とパフォーマンスを向上させます。

```sql
-- ファイルカテゴリ（v7.3.0: ai_inputを分割）
CREATE TYPE file_category_enum AS ENUM (
  'create_exercises',    -- 問題生成用入力ファイル（旧: ai_input）
  'create_materials',    -- 教材生成用入力ファイル（旧: ai_input）
  'report_evidence',     -- 通報証拠書類
  'user_profile',        -- ユーザープロフィール画像
  'social_attachment'    -- ソーシャル添付ファイル
);

-- 移行ステータス
CREATE TYPE migration_status_enum AS ENUM (
  'staging',      -- Stagingバケットに保存中
  'migrating',    -- Vaultバケットへ移行中
  'vaulted',      -- Vaultバケットに保存済み
  'restoring',    -- Stagingバケットへ復元中
  'restored'      -- Stagingバケットへ復元完了
);

-- 移行タイプ
CREATE TYPE migration_type_enum AS ENUM (
  'scheduled',    -- スケジュール移行
  'manual',       -- 手動移行
  'emergency'     -- 緊急移行
);

-- 処理結果
CREATE TYPE processing_result_enum AS ENUM (
  'success',      -- 成功
  'failed',       -- 失敗
  'partial'       -- 部分成功
);

-- ファイル操作アクション
CREATE TYPE file_action_enum AS ENUM (
  'upload',       -- アップロード
  'download',     -- ダウンロード
  'delete',       -- 削除
  'migrate',      -- 移行
  'restore',      -- 復元
  'encrypt',      -- 暗号化
  'view_metadata' -- メタデータ閲覧
);

-- 監査結果
CREATE TYPE audit_result_enum AS ENUM (
  'allowed',      -- 許可
  'denied',       -- 拒否
  'error'         -- エラー
);

-- 遷移理由
CREATE TYPE transition_reason_enum AS ENUM (
  'lifecycle_policy',    -- ライフサイクルポリシー
  'cost_optimization',   -- コスト最適化
  'compliance',          -- コンプライアンス
  'manual_request'       -- 手動リクエスト
);

-- ストレージクラス
CREATE TYPE storage_class_enum AS ENUM (
  'STANDARD',     -- 標準ストレージ
  'NEARLINE',     -- ニアラインストレージ（30日以上）
  'COLDLINE',     -- コールドラインストレージ（90日以上）
  'ARCHIVE'       -- アーカイブストレージ（365日以上）
);

-- アクセスレベル
CREATE TYPE access_level_enum AS ENUM (
  'admin_only',        -- 管理者のみ
  'user_accessible',   -- ユーザーアクセス可能
  'system_only',       -- システムのみ
  'public'             -- 公開
);

-- MIME型カテゴリ
CREATE TYPE mime_category_enum AS ENUM (
  'image',       -- 画像
  'document',    -- ドキュメント
  'video',       -- ビデオ
  'audio',       -- オーディオ
  'other'        -- その他
);
```

### 6.3 file_metadataテーブル（完全版）

**物理DB:** `edumint_files`

アップロードされた全ファイルのメタデータと2バケット構成を一元管理します。

```sql
CREATE TABLE file_metadata (
  -- 基本識別子
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(16) NOT NULL UNIQUE,  -- NanoID
  
  -- ファイル分類（完全ENUM化）
  file_category file_category_enum NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  mime_category mime_category_enum NOT NULL,
  
  -- ユーザー・所有者情報
  uploader_id UUID NOT NULL,  -- users.idを参照（論理的）
  owner_id UUID,  -- 所有者ID（通報時は通報者、それ以外はuploader_id）
  
  -- ファイル基本情報
  original_filename VARCHAR(512) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  file_hash_sha256 VARCHAR(64) NOT NULL,  -- SHA-256ハッシュ
  file_hash_crc32c VARCHAR(8),  -- CRC32Cチェックサム
  
  -- Stagingバケット情報（初期保存先）
  staging_bucket VARCHAR(255) NOT NULL,
  staging_path VARCHAR(1024) NOT NULL,
  staging_storage_class storage_class_enum DEFAULT 'STANDARD',
  staging_uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  -- Vaultバケット情報（移行後の保存先）
  vault_bucket VARCHAR(255),
  vault_path VARCHAR(1024),
  vault_storage_class storage_class_enum,
  vault_uploaded_at TIMESTAMPTZ,
  
  -- 移行管理
  migration_status migration_status_enum DEFAULT 'staging',
  migrated_at TIMESTAMPTZ,
  last_migration_job_id UUID,  -- file_migration_logsを参照
  
  -- 可変保持期間（N日）管理
  retention_days INT NOT NULL,  -- ファイル種別ごとの保持期間
  retention_trigger_date TIMESTAMPTZ NOT NULL,  -- 保持期間の起点日
  move_scheduled_date TIMESTAMPTZ GENERATED ALWAYS AS (retention_trigger_date + (retention_days || ' days')::INTERVAL) STORED,
  
  -- CMEK暗号化情報
  is_encrypted BOOLEAN DEFAULT FALSE,
  encrypted_at TIMESTAMPTZ,
  encryption_key_version VARCHAR(255),
  encryption_algorithm VARCHAR(50),
  
  -- アクセス制御
  access_level access_level_enum DEFAULT 'admin_only',
  is_active BOOLEAN DEFAULT TRUE,
  
  -- メタデータ・タグ
  file_description TEXT,
  tags TEXT[],
  search_vector tsvector,  -- 全文検索用
  
  -- システム管理（Computed Columns）
  is_system_managed BOOLEAN GENERATED ALWAYS AS (
    file_category IN ('create_exercises', 'create_materials')
  ) STORED,
  is_llm_training_data BOOLEAN GENERATED ALWAYS AS (
    file_category IN ('create_exercises', 'create_materials')
  ) STORED,
  
  -- 監査情報
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ  -- 論理削除
);

COMMENT ON TABLE file_metadata IS 'ファイルメタデータ管理テーブル（v7.3.0: 2バケット構成、完全ENUM化）';
COMMENT ON COLUMN file_metadata.file_category IS 'ファイルカテゴリ（create_exercises, create_materials, report_evidence, user_profile, social_attachment）';
COMMENT ON COLUMN file_metadata.retention_days IS 'ファイル種別ごとの保持期間（日数）';
COMMENT ON COLUMN file_metadata.retention_trigger_date IS '保持期間の起点日（アップロード日またはイベント発生日）';
COMMENT ON COLUMN file_metadata.move_scheduled_date IS '移行予定日（retention_trigger_date + retention_days日、自動計算）';
COMMENT ON COLUMN file_metadata.migration_status IS '移行ステータス（staging/migrating/vaulted/restoring/restored）';
COMMENT ON COLUMN file_metadata.is_system_managed IS 'システム管理ファイル（AI生成用ファイル）';
COMMENT ON COLUMN file_metadata.is_llm_training_data IS 'LLM学習データ対象ファイル';
```

**マイクロサービス参照の設計原則（v7.5.1追加）:**
- `uploader_id` は `edumintUsers.users.id` を参照
- マイクロサービス境界のため**物理FOREIGN KEYは設定しない**
- アプリケーション層でバリデーション必須
  ```go
  // ファイルアップロード前のユーザー存在確認
  func (s *FileService) UploadFile(ctx context.Context, uploaderID uuid.UUID, file io.Reader) error {
      // edumintUsersサービスにgRPC/HTTPで問い合わせ
      userExists, err := s.userClient.CheckUserExists(ctx, uploaderID)
      if err != nil || !userExists {
          return errors.New("invalid uploader_id: user not found")
      }
      
      // ファイル保存処理
      return s.queries.InsertFileMetadata(ctx, ...)
  }
  ```

**整合性保証戦略:**
1. ファイルアップロード時: edumintUsersのユーザー存在確認
2. ユーザー削除時: Kafkaイベント `user.deleted` を受信して論理削除フラグ設定
3. 定期バッチ: 孤立ファイルの検出と警告ログ出力

### 6.4 補助テーブル設計

#### 6.4.1 file_migration_logs（移行ログ）

移行処理の監査証跡と整合性検証を記録します。

```sql
CREATE TABLE file_migration_logs (
  -- 基本識別子
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  file_id UUID NOT NULL REFERENCES file_metadata(id) ON DELETE CASCADE,
  
  -- 移行情報
  migration_type migration_type_enum NOT NULL,
  migration_status migration_status_enum NOT NULL,
  
  -- 移行元・移行先
  source_bucket VARCHAR(255) NOT NULL,
  source_path VARCHAR(1024) NOT NULL,
  source_storage_class storage_class_enum NOT NULL,
  destination_bucket VARCHAR(255) NOT NULL,
  destination_path VARCHAR(1024) NOT NULL,
  destination_storage_class storage_class_enum NOT NULL,
  
  -- 整合性検証
  source_hash_sha256 VARCHAR(64) NOT NULL,
  source_hash_crc32c VARCHAR(8),
  destination_hash_sha256 VARCHAR(64),
  destination_hash_crc32c VARCHAR(8),
  hash_verified BOOLEAN DEFAULT FALSE,
  verification_result processing_result_enum,
  
  -- CMEK暗号化情報
  is_encrypted BOOLEAN DEFAULT FALSE,
  encryption_key_version VARCHAR(255),
  
  -- 処理結果
  processing_result processing_result_enum,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  
  -- コスト情報
  estimated_cost_before DECIMAL(10, 4),
  estimated_cost_after DECIMAL(10, 4),
  cost_savings DECIMAL(10, 4),
  
  -- タイムスタンプ
  started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ,
  duration_seconds INT
);

CREATE INDEX idx_file_migration_logs_file_id ON file_migration_logs(file_id, started_at DESC);
CREATE INDEX idx_file_migration_logs_status ON file_migration_logs(migration_status, started_at DESC);
CREATE INDEX idx_file_migration_logs_type ON file_migration_logs(migration_type, started_at DESC);
CREATE INDEX idx_file_migration_logs_result ON file_migration_logs(processing_result, started_at DESC);

COMMENT ON TABLE file_migration_logs IS 'ファイル移行ログテーブル（整合性検証、CMEK暗号化情報）';
```

#### 6.4.2 copyright_claims（著作権侵害申し立て）

DMCAに基づく著作権侵害申し立てを管理します。

```sql
CREATE TABLE copyright_claims (
  -- 基本識別子
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(16) NOT NULL UNIQUE,
  
  -- 対象ファイル
  file_id UUID NOT NULL REFERENCES file_metadata(id) ON DELETE RESTRICT,
  
  -- 申し立て者情報
  claimant_name VARCHAR(255) NOT NULL,
  claimant_email VARCHAR(255) NOT NULL,
  claimant_organization VARCHAR(255),
  
  -- 申し立て内容
  claim_description TEXT NOT NULL,
  copyrighted_work_description TEXT NOT NULL,
  infringement_evidence TEXT,
  
  -- DMCA情報
  dmca_notice_url VARCHAR(1024),
  dmca_counter_notice_url VARCHAR(1024),
  
  -- ステータス
  claim_status claim_status_enum DEFAULT 'pending',  -- v7.4.1: ENUM型適用
  resolution_notes TEXT,
  
  -- 処理情報
  reviewed_by UUID,  -- 管理者ID
  reviewed_at TIMESTAMPTZ,
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_copyright_claims_public_id ON copyright_claims(public_id);
CREATE INDEX idx_copyright_claims_file_id ON copyright_claims(file_id);
CREATE INDEX idx_copyright_claims_status ON copyright_claims(claim_status, created_at DESC);
CREATE INDEX idx_copyright_claims_claimant_email ON copyright_claims(claimant_email);

COMMENT ON TABLE copyright_claims IS '著作権侵害申し立て管理テーブル（DMCA対応）';
```

#### 6.4.3 file_audit_logs（ファイル監査ログ）

全ファイル操作の監査ログをログDBに記録します。

**物理DB:** `edumint_files_logs`

```sql
CREATE TABLE file_audit_logs (
  -- 基本識別子
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  
  -- 対象ファイル
  file_id UUID NOT NULL,
  file_category file_category_enum,
  
  -- 操作情報
  action file_action_enum NOT NULL,
  audit_result audit_result_enum NOT NULL,
  
  -- ユーザー情報
  user_id UUID,
  user_role VARCHAR(50),
  
  -- リクエスト情報
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(36),
  
  -- 詳細情報
  action_details JSONB,
  error_message TEXT,
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_file_audit_logs_file_id ON file_audit_logs(file_id, created_at DESC);
CREATE INDEX idx_file_audit_logs_action ON file_audit_logs(action, created_at DESC);
CREATE INDEX idx_file_audit_logs_user_id ON file_audit_logs(user_id, created_at DESC);
CREATE INDEX idx_file_audit_logs_result ON file_audit_logs(audit_result, created_at DESC);
CREATE INDEX idx_file_audit_logs_ip_address ON file_audit_logs(ip_address, created_at DESC);

COMMENT ON TABLE file_audit_logs IS 'ファイル監査ログテーブル（全操作記録、セキュリティ分析用）';
```

#### 6.4.4 storage_class_transitions（ストレージクラス遷移履歴）

ストレージクラスの遷移履歴をログDBに記録します。

**物理DB:** `edumint_files_logs`

```sql
CREATE TABLE storage_class_transitions (
  -- 基本識別子
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  
  -- 対象ファイル
  file_id UUID NOT NULL,
  
  -- 遷移情報
  from_storage_class storage_class_enum NOT NULL,
  to_storage_class storage_class_enum NOT NULL,
  transition_reason transition_reason_enum NOT NULL,
  
  -- バケット情報
  bucket_name VARCHAR(255) NOT NULL,
  object_path VARCHAR(1024) NOT NULL,
  
  -- コスト情報
  cost_before DECIMAL(10, 4),
  cost_after DECIMAL(10, 4),
  monthly_savings DECIMAL(10, 4),
  
  -- タイムスタンプ
  transitioned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (transitioned_at);

CREATE INDEX idx_storage_transitions_file_id ON storage_class_transitions(file_id, transitioned_at DESC);
CREATE INDEX idx_storage_transitions_reason ON storage_class_transitions(transition_reason, transitioned_at DESC);
CREATE INDEX idx_storage_transitions_classes ON storage_class_transitions(from_storage_class, to_storage_class);

COMMENT ON TABLE storage_class_transitions IS 'ストレージクラス遷移履歴テーブル（コスト分析用）';
```

### 6.5 インデックス設計

v7.3.0では移行バッチ処理と検索性能を最適化したインデックスを設計します。

```sql
-- === file_metadataテーブルのインデックス ===

-- 基本検索用
CREATE UNIQUE INDEX idx_file_metadata_public_id ON file_metadata(public_id);
CREATE INDEX idx_file_metadata_uploader_id ON file_metadata(uploader_id) WHERE is_active = TRUE;
CREATE INDEX idx_file_metadata_owner_id ON file_metadata(owner_id) WHERE is_active = TRUE;

-- 移行バッチ処理用（最重要）
CREATE INDEX idx_file_metadata_migration_batch ON file_metadata(
  migration_status,
  move_scheduled_date,
  is_active
) WHERE migration_status = 'staging' AND is_active = TRUE;

-- ファイルカテゴリ別検索用
CREATE INDEX idx_file_metadata_category ON file_metadata(file_category, created_at DESC) WHERE is_active = TRUE;
CREATE INDEX idx_file_metadata_mime_category ON file_metadata(mime_category, created_at DESC) WHERE is_active = TRUE;

-- ユーザーアクセス可能ファイル専用
CREATE INDEX idx_file_metadata_user_accessible ON file_metadata(
  uploader_id,
  file_category,
  created_at DESC
) WHERE access_level = 'user_accessible' AND is_active = TRUE;

-- システム管理ファイル専用
CREATE INDEX idx_file_metadata_system_managed ON file_metadata(
  file_category,
  created_at DESC
) WHERE is_system_managed = TRUE AND is_active = TRUE;

-- 暗号化管理用
CREATE INDEX idx_file_metadata_encryption ON file_metadata(
  is_encrypted,
  encrypted_at
) WHERE is_active = TRUE;

-- ハッシュ重複検出用
CREATE INDEX idx_file_metadata_hash ON file_metadata(file_hash_sha256) WHERE is_active = TRUE;

-- 全文検索用（GIN）
CREATE INDEX idx_file_metadata_search_vector ON file_metadata USING gin(search_vector);
CREATE INDEX idx_file_metadata_tags ON file_metadata USING gin(tags);

-- Vaultバケットファイル検索用
CREATE INDEX idx_file_metadata_vaulted ON file_metadata(
  vault_bucket,
  vault_path,
  migration_status
) WHERE migration_status IN ('vaulted', 'restoring', 'restored');

-- 論理削除管理用
CREATE INDEX idx_file_metadata_deleted ON file_metadata(deleted_at) WHERE deleted_at IS NOT NULL;
```

### 6.6 トリガー定義

#### 6.6.1 更新日時自動更新トリガー

```sql
-- トリガー関数: updated_atを自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- file_metadataテーブルに適用
CREATE TRIGGER trigger_file_metadata_updated_at
BEFORE UPDATE ON file_metadata
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- copyright_claimsテーブルに適用
CREATE TRIGGER trigger_copyright_claims_updated_at
BEFORE UPDATE ON copyright_claims
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 6.6.2 ファイル変更監査トリガー（ENUM対応版）

```sql
-- トリガー関数: ファイル変更を監査ログに記録
CREATE OR REPLACE FUNCTION audit_file_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_action file_action_enum;
  v_action_details JSONB;
BEGIN
  -- 操作種別の判定
  IF TG_OP = 'INSERT' THEN
    v_action := 'upload';
    v_action_details := jsonb_build_object(
      'file_category', NEW.file_category,
      'file_size_bytes', NEW.file_size_bytes,
      'staging_bucket', NEW.staging_bucket
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.migration_status != NEW.migration_status THEN
      v_action := 'migrate';
      v_action_details := jsonb_build_object(
        'old_status', OLD.migration_status,
        'new_status', NEW.migration_status
      );
    ELSIF OLD.is_encrypted != NEW.is_encrypted AND NEW.is_encrypted = TRUE THEN
      v_action := 'encrypt';
      v_action_details := jsonb_build_object(
        'encryption_algorithm', NEW.encryption_algorithm
      );
    ELSE
      RETURN NEW;  -- その他の更新は記録しない
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_action_details := jsonb_build_object(
      'file_category', OLD.file_category,
      'deleted_at', OLD.deleted_at
    );
  END IF;

  -- 監査ログに記録
  INSERT INTO edumint_files_logs.file_audit_logs (
    file_id,
    file_category,
    action,
    audit_result,
    user_id,
    action_details
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.file_category, OLD.file_category),
    v_action,
    'allowed',
    COALESCE(NEW.uploader_id, OLD.uploader_id),
    v_action_details
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- file_metadataテーブルに適用
CREATE TRIGGER trigger_audit_file_changes
AFTER INSERT OR UPDATE OR DELETE ON file_metadata
FOR EACH ROW
EXECUTE FUNCTION audit_file_changes();
```

### 6.7 Row-Level Security (RLS) ポリシー

v7.3.0ではロールベースのアクセス制御をRLSで実装します。

```sql
-- RLSを有効化
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_migration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_claims ENABLE ROW LEVEL SECURITY;

-- === file_metadataテーブルのRLSポリシー ===

-- 管理者: 全ファイルアクセス可能
CREATE POLICY policy_file_metadata_admin ON file_metadata
FOR ALL
TO edumint_admin_role
USING (TRUE)
WITH CHECK (TRUE);

-- ユーザー: 自分のアップロードファイル + user_accessibleファイル
CREATE POLICY policy_file_metadata_user_select ON file_metadata
FOR SELECT
TO edumint_user_role
USING (
  uploader_id = current_setting('app.current_user_id')::UUID
  OR access_level = 'user_accessible'
);

-- ユーザー: 自分のファイルのみ更新可能
CREATE POLICY policy_file_metadata_user_update ON file_metadata
FOR UPDATE
TO edumint_user_role
USING (uploader_id = current_setting('app.current_user_id')::UUID)
WITH CHECK (uploader_id = current_setting('app.current_user_id')::UUID);

-- システム: システム管理ファイルのみアクセス
CREATE POLICY policy_file_metadata_system ON file_metadata
FOR ALL
TO edumint_system_role
USING (is_system_managed = TRUE)
WITH CHECK (is_system_managed = TRUE);

-- LLM学習システム: 学習データ対象ファイルのみ読み取り
CREATE POLICY policy_file_metadata_llm_training ON file_metadata
FOR SELECT
TO edumint_llm_training_role
USING (is_llm_training_data = TRUE AND migration_status = 'staging');

-- Vaultバケット専用ポリシー: 移行完了ファイルは管理者のみアクセス
CREATE POLICY policy_file_metadata_vaulted ON file_metadata
FOR SELECT
TO edumint_user_role
USING (migration_status != 'vaulted' OR access_level = 'user_accessible');

-- === file_migration_logsテーブルのRLSポリシー ===

-- 管理者: 全移行ログ閲覧可能
CREATE POLICY policy_migration_logs_admin ON file_migration_logs
FOR SELECT
TO edumint_admin_role
USING (TRUE);

-- システム: 移行ログ作成可能
CREATE POLICY policy_migration_logs_system ON file_migration_logs
FOR INSERT
TO edumint_system_role
WITH CHECK (TRUE);

-- === copyright_claimsテーブルのRLSポリシー ===

-- 管理者: 全著作権申し立て管理可能
CREATE POLICY policy_copyright_claims_admin ON copyright_claims
FOR ALL
TO edumint_admin_role
USING (TRUE)
WITH CHECK (TRUE);

-- 申し立て者: 自分の申し立てのみ閲覧可能
CREATE POLICY policy_copyright_claims_claimant ON copyright_claims
FOR SELECT
TO edumint_user_role
USING (claimant_email = current_setting('app.current_user_email')::TEXT);
```

### 6.8 GCSバケット設計

#### 6.8.1 Stagingバケット

**バケット名:** `edumint-files-staging-{env}`

**ライフサイクルポリシー:**
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "daysSinceCustomTime": 7,
          "matchesPrefix": ["migrated/"]
        }
      }
    ]
  }
}
```

**設定:**
- ストレージクラス: STANDARD
- リージョン: asia-northeast1
- 暗号化: Google管理キー（デフォルト）
- バージョニング: 無効
- オブジェクトロック: 無効
- 公開アクセス: ブロック

#### 6.8.2 Vaultバケット

**バケット名:** `edumint-files-vault-{env}`

**ライフサイクルポリシー:**
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "NEARLINE"
        },
        "condition": {
          "daysSinceCustomTime": 30
        }
      },
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "COLDLINE"
        },
        "condition": {
          "daysSinceCustomTime": 90
        }
      },
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "ARCHIVE"
        },
        "condition": {
          "daysSinceCustomTime": 365
        }
      }
    ]
  }
}
```

**設定:**
- ストレージクラス: STANDARD → NEARLINE → COLDLINE → ARCHIVE（自動遷移）
- リージョン: asia-northeast1
- 暗号化: CMEK（Customer-Managed Encryption Keys）
- バージョニング: 有効
- オブジェクトロック: 有効（WORM）
- 公開アクセス: ブロック

### 6.9 IAMロール設計

#### 6.9.1 サービスアカウント構成

```yaml
# アプリケーション用SA
edumint-files-app@{project-id}.iam.gserviceaccount.com:
  roles:
    - roles/storage.objectViewer  # Stagingバケット読み取り
    - roles/storage.objectCreator  # Stagingバケット書き込み
  bucket_permissions:
    - edumint-files-staging-{env}

# バッチ処理用SA
edumint-files-batch@{project-id}.iam.gserviceaccount.com:
  roles:
    - roles/storage.objectAdmin  # 両バケット管理
    - roles/cloudkms.cryptoKeyEncrypterDecrypter  # CMEK暗号化
  bucket_permissions:
    - edumint-files-staging-{env}
    - edumint-files-vault-{env}

# 管理者用SA
edumint-files-admin@{project-id}.iam.gserviceaccount.com:
  roles:
    - roles/storage.admin  # 全バケット管理
    - roles/cloudkms.admin  # KMS管理
  bucket_permissions:
    - edumint-files-staging-{env}
    - edumint-files-vault-{env}

# 監査ログ用SA
edumint-files-audit@{project-id}.iam.gserviceaccount.com:
  roles:
    - roles/storage.objectViewer  # 読み取り専用
  bucket_permissions:
    - edumint-files-staging-{env}
    - edumint-files-vault-{env}
```

### 6.10 バッチ処理設計

#### 6.10.1 日次移行バッチ（Cloud Run Jobs）

**ジョブ名:** `file-migration-daily-job`

**処理フロー:**
```sql
-- 1. 移行対象ファイルの抽出
SELECT 
  id,
  public_id,
  file_category,
  staging_bucket,
  staging_path,
  vault_bucket,
  retention_days,
  move_scheduled_date
FROM file_metadata
WHERE migration_status = 'staging'
  AND move_scheduled_date <= CURRENT_TIMESTAMP
  AND is_active = TRUE
ORDER BY move_scheduled_date ASC
LIMIT 1000;

-- 2. 移行処理の実行（Go）
// GCSファイルコピー
gsutil cp gs://{staging_bucket}/{staging_path} gs://{vault_bucket}/{vault_path}

// 整合性検証
source_hash := getFileSHA256(staging_path)
dest_hash := getFileSHA256(vault_path)
verified := source_hash == dest_hash

-- 3. 移行ログの記録
INSERT INTO file_migration_logs (
  file_id,
  migration_type,
  migration_status,
  source_bucket,
  destination_bucket,
  source_hash_sha256,
  destination_hash_sha256,
  hash_verified,
  processing_result
) VALUES (...);

-- 4. file_metadataの更新
UPDATE file_metadata
SET 
  migration_status = 'vaulted',
  vault_bucket = $1,
  vault_path = $2,
  vault_storage_class = 'STANDARD',
  vault_uploaded_at = CURRENT_TIMESTAMP,
  migrated_at = CURRENT_TIMESTAMP,
  last_migration_job_id = $3
WHERE id = $4;
```

**スケジュール:** 毎日 02:00 JST

**リトライポリシー:**
- 最大リトライ回数: 3回
- リトライ間隔: 5分

#### 6.10.2 CMEK暗号化適用

Vaultバケットへの移行時にCMEK暗号化を自動適用します。

```go
// CMEK暗号化の適用
object := bucket.Object(vaultPath)
attrs, err := object.Attrs(ctx)
if err != nil {
    return err
}

// KMSキーで暗号化
kmsKeyName := "projects/{project}/locations/{location}/keyRings/{ring}/cryptoKeys/{key}"
_, err = object.CopierFrom(object).Run(ctx)
if err != nil {
    return err
}

// メタデータ更新
_, err = db.Exec(`
    UPDATE file_metadata
    SET 
        is_encrypted = TRUE,
        encrypted_at = CURRENT_TIMESTAMP,
        encryption_key_version = $1,
        encryption_algorithm = 'AES256'
    WHERE id = $2
`, kmsKeyName, fileID)
```

### 6.11 ファイル種別ごとの保持期間設定

v7.3.0では各ファイルカテゴリに適切な保持期間を設定します。

| ファイルカテゴリ | 保持期間（Staging） | 保持期間の起点 | 移行後の保存先 |
|-----------------|-------------------|---------------|---------------|
| create_exercises | 7日 | アップロード日 | Vault（NEARLINE） |
| create_materials | 7日 | アップロード日 | Vault（NEARLINE） |
| report_evidence | 90日 | 通報処理完了日 | Vault（COLDLINE） |
| user_profile | 最終ログイン1年 or 退会後90日 | 最終ログイン日 or 退会日 | Vault（NEARLINE） |
| social_attachment | 1年 | 送信日 | Vault（COLDLINE） |

**実装例:**
```sql
-- ファイルアップロード時の保持期間設定
INSERT INTO file_metadata (
  file_category,
  retention_days,
  retention_trigger_date,
  ...
) VALUES (
  'create_exercises',
  7,  -- 7日間
  CURRENT_TIMESTAMP,  -- アップロード日を起点
  ...
);

-- 通報証拠書類の保持期間更新（通報処理完了時）
UPDATE file_metadata
SET 
  retention_trigger_date = CURRENT_TIMESTAMP,  -- 処理完了日を起点に変更
  retention_days = 90
WHERE file_category = 'report_evidence'
  AND id = $1;
```

### 6.12 コスト見積もり

#### 6.12.1 前提条件
- 平均ファイルサイズ: 5 MB
- 月間アップロード数: 1,000ファイル
- リージョン: asia-northeast1

#### 6.12.2 Stagingバケットコスト（1ヶ月目）

| 項目 | 容量 | 単価 | 月額 |
|-----|------|------|------|
| STANDARD ストレージ | 5 GB | $0.020/GB | $0.10 |
| Class A オペレーション（書き込み） | 1,000回 | $0.05/1万回 | $0.005 |
| Class B オペレーション（読み取り） | 2,000回 | $0.004/1万回 | $0.0008 |
| データ転送（GCS→Cloud Run） | 5 GB | $0.12/GB | $0.60 |
| **Stagingバケット合計** | - | - | **$0.71** |

#### 6.12.3 Vaultバケットコスト（1年目）

| 項目 | 容量 | 単価 | 月額 |
|-----|------|------|------|
| NEARLINE ストレージ（7日後） | 50 GB | $0.010/GB | $0.50 |
| COLDLINE ストレージ（90日後） | 200 GB | $0.004/GB | $0.80 |
| ARCHIVE ストレージ（365日後） | 0 GB | $0.0012/GB | $0.00 |
| データ取得（Nearline） | 5 GB | $0.01/GB | $0.05 |
| **Vaultバケット合計** | - | - | **$1.35** |

#### 6.12.4 CMEK暗号化コスト

| 項目 | 回数/容量 | 単価 | 月額 |
|-----|----------|------|------|
| KMSキー使用料 | 1キー | $0.06/キー/月 | $0.06 |
| 暗号化オペレーション | 1,000回 | $0.03/1万回 | $0.003 |
| **CMEK合計** | - | - | **$0.063** |

#### 6.12.5 総コスト

| 項目 | 月額 |
|-----|------|
| Stagingバケット | $0.71 |
| Vaultバケット | $1.35 |
| CMEK暗号化 | $0.063 |
| **合計（1年目平均）** | **$2.12** |

**コスト削減効果:**
- v7.1.0（単一バケット）: $3.50/月
- v7.3.0（2バケット構成）: $2.12/月
- **月間削減額: $1.38（39%削減）**

### 6.13 イベント発行・購読

**発行するイベント:**
- **`file.uploaded`**: ファイルアップロード完了
  - Payload: `{file_id, file_category, uploader_id, staging_path}`
  - 購読者: edumintContents, edumintAiWorker

- **`file.migrated`**: ファイル移行完了
  - Payload: `{file_id, migration_status, vault_path}`
  - 購読者: edumintContents, edumintMonitoring

- **`file.encrypted`**: ファイル暗号化完了
  - Payload: `{file_id, encrypted_at, encryption_key_version}`
  - 購読者: edumintContents, edumintSecurity

**購読するイベント:**
- **`content.ocr`**: OCR処理要求
  - 送信元: edumintContents
  - 処理: ファイル取得APIを提供、edumintAiWorkerへファイルパス送信

- **`moderation.evidence`**: 通報証拠ファイル要求
  - 送信元: edumintModeration
  - 処理: report_evidenceファイルへのアクセス許可

- **`user.deleted`**: ユーザー削除
  - 送信元: edumintUsers
  - 処理: ユーザーのファイルを論理削除

### 6.14 サービス間API

**提供するAPI:**
- `GET /files/{file_id}`: ファイルダウンロード（認証済みユーザーのみ）
- `POST /files/upload`: ファイルアップロード（Stagingバケット）
- `GET /files/{file_id}/metadata`: ファイルメタデータ取得
- `POST /files/{file_id}/restore`: Vaultファイルの復元（管理者のみ）
- `GET /files/migration-status`: 移行ステータス取得

**呼び出すAPI:**
- なし（イベント駆動で他サービスと連携）

---

## **7. edumintSearch (検索サービス)**

### 設計変更点（v7.1.0）

**無状態化（Stateless）:**
- **物理DB削除**: PostgreSQL本体DBを完全廃止
- **Elasticsearchのみ**: 全インデックスデータはElasticsearchで管理
- **Debezium CDC**: edumintUsers, edumintContentsからリアルタイム差分同期
- **検索用語テーブル移管**: *_terms, term_generation_*テーブルをedumintContentsへ移管
- **ログDBは維持**: `edumint_search_logs` (分離DB) は検索クエリ履歴として保持

**アーキテクチャ:**
```
edumintContents (PostgreSQL)
        ↓ Debezium CDC (論理レプリケーション)
        ↓ Kafka経由
edumintSearch (Elasticsearch + ログDB)
```

**利点:**
- **運用コスト削減**: PostgreSQL管理・同期処理の削除
- **リアルタイム同期**: Debezium CDCによる自動差分反映
- **スケーラビリティ**: Elasticsearch水平スケールに最適化
- **整合性保証**: Source of Truth (edumintContents) からの一方向同期

### 設計変更点（v7.0.0からの継続）

### 7.1 本体DBテーブル (DDL例)

**物理DB:** `edumint_search`

#### **search_queries (検索クエリ履歴)**
```sql
CREATE TABLE search_queries (
  query_id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID, -- NULL許可（未ログインユーザー対応）
  query_text TEXT NOT NULL,
  filters JSONB, -- {institution_id: [...], difficulty: [...]}
  result_count INT NOT NULL,
  clicked_exam_ids UUID[], -- クリックされた試験ID配列
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_queries_user ON search_queries(user_id, created_at DESC);
CREATE INDEX idx_search_queries_text ON search_queries USING gin(to_tsvector('japanese', query_text));
```

#### **search_cache (Redis連携キャッシュテーブル)**
```sql
CREATE TABLE search_cache (
  cache_key VARCHAR(255) PRIMARY KEY, -- SHA256(query_text + filters)
  cached_results JSONB NOT NULL, -- Elasticsearch結果のスナップショット
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_cache_expires ON search_cache(expires_at);
```

### 7.2 ログテーブル (DB分離設計)

**物理DB:** `edumint_search_logs`

#### **search_logs**
```sql
CREATE TABLE search_logs (
  log_id UUID PRIMARY KEY DEFAULT uuidv7(),
  query_id UUID NOT NULL, -- search_queries.query_id参照
  event_type VARCHAR(50) NOT NULL, -- 'query_executed', 'result_clicked', 'no_results'
  latency_ms INT, -- Elasticsearch応答時間
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_search_logs_query ON search_logs(query_id, created_at DESC);
CREATE INDEX idx_search_logs_event ON search_logs(event_type, created_at DESC);
```

**パーティション設計:**
```sql
-- 月次パーティション（3ヶ月保持）
CREATE TABLE search_logs_2026_02 PARTITION OF search_logs
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE search_logs_2026_03 PARTITION OF search_logs
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

**保持期間:** 3ヶ月（分析用）
**バックアップ:** BigQuery日次エクスポート

### 7.3 Elasticsearch同期戦略

#### Debezium CDC連携
- `dbz.edumint.contents_search.public.exams_search` トピックをsubscribe
- 変更イベント受信時にElasticsearchインデックス更新
- 失敗時はKafka DLQに送信し、手動リトライ

#### 初回インデックス構築
```bash
# Postgresから全件取得してElasticsearchにバルクインサート
curl -X POST "localhost:9200/_bulk" -H 'Content-Type: application/json' --data-binary @exams_bulk.json
```

#### インデックス再構築トリガー
- スキーマ変更時（Atlasマイグレーション後）
- 検索精度劣化時（週次バッチで品質スコア計測）

### 7.4 Elasticsearch設計

#### **exams インデックス（v7.4.0更新）**

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
      
      // 国際化対応（v7.4.0追加）
      "institution_name": { 
        "type": "text", 
        "analyzer": "standard",
        "fields": {
          "ja": { "type": "text", "analyzer": "kuromoji" },
          "en": { "type": "text", "analyzer": "english" }
        }
      },
      "institution_display_name": { "type": "text", "analyzer": "kuromoji" },
      "region_code": { "type": "keyword" },
      
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
      
      // 統計情報（v7.4.0広告統計追加）
      "view_count": { "type": "integer" },
      "like_count": { "type": "integer" },
      "ad_display_count": { "type": "integer" },
      "ad_revenue_estimated": { "type": "float" },
      
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" }
    }
  },
  "settings": {
    "analysis": {
      "analyzer": {
        "kuromoji": {
          "type": "custom",
          "tokenizer": "kuromoji_tokenizer",
          "filter": ["kuromoji_baseform", "kuromoji_part_of_speech", "cjk_width", "lowercase"]
        },
        "ngram_analyzer": {
          "type": "custom",
          "tokenizer": "ngram_tokenizer",
          "filter": ["lowercase"]
        },
        "english": {
          "type": "standard",
          "stopwords": "_english_"
        }
      },
      "tokenizer": {
        "ngram_tokenizer": {
          "type": "ngram",
          "min_gram": 2,
          "max_gram": 3,
          "token_chars": ["letter", "digit"]
        }
      }
    }
  }
}
```

**設計注記:**
- Kuromojiアナライザーで日本語形態素解析
- N-gramで部分一致検索対応
- dense_vectorでセマンティック検索対応
- Debezium CDCで自動同期
- **v7.4.0追加:**
  - 多言語アナライザー対応（日本語・英語）
  - 国際化フィールド（institution_name, region_code）
  - 広告統計フィールド（ad_display_count, ad_revenue_estimated）

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
[Kafka] ai.results → [edumintContents] 結果反映
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

## **9. edumintSocial (ソーシャルサービス)**

### 設計変更点（v7.0.3）

- **責務の明確化**: 統計情報管理をedumintContentsへ移管、純粋なソーシャル機能に特化
- **削除テーブル**: `exam_likes`, `exam_bads`, `exam_views`（→ edumintContents.exam_interaction_eventsへ統合）
- **新規テーブル**: SNS投稿、DM、マッチング機能用テーブルを追加
- **コメント機能強化**: YouTubeスタイルのスレッド型コメント

### 10.1 サービス責務

edumintSocialは以下のソーシャル機能を提供します：

1. **試験コメント機能**: 試験に対するユーザーコメント、返信、いいね
2. **SNS投稿機能**: ユーザーのタイムライン、投稿、シェア
3. **DM機能**: 1対1・グループチャット、既読管理
4. **マッチング機能**: 学習パートナー探し（Phase 3）

### 10.2 本体DBテーブル (DDL例)

#### **exam_comments (試験コメント)**

試験へのコメントを管理します。YouTubeスタイルのスレッド型コメント機能。

```sql
CREATE TABLE exam_comments (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  exam_id UUID NOT NULL,
  user_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES exam_comments(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  like_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exam_comments_exam_id ON exam_comments(exam_id, created_at DESC);
CREATE INDEX idx_exam_comments_parent_id ON exam_comments(parent_comment_id, created_at DESC);
CREATE INDEX idx_exam_comments_user_id ON exam_comments(user_id, created_at DESC);
CREATE INDEX idx_exam_comments_pinned ON exam_comments(exam_id, is_pinned, created_at DESC) 
  WHERE is_pinned = TRUE AND is_deleted = FALSE;
```

#### **comment_likes (コメントいいね)**

```sql
CREATE TABLE comment_likes (
  comment_id UUID NOT NULL REFERENCES exam_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id, user_id)
);

CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id, created_at DESC);
```

#### **user_posts (ユーザー投稿)**

```sql
CREATE TABLE user_posts (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  post_type post_type_enum NOT NULL,  -- v7.4.1: ENUM型適用
  content TEXT,
  attached_exam_id UUID,
  media_urls TEXT[],
  hashtags VARCHAR(50)[],
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  visibility post_visibility_enum DEFAULT 'public',  -- v7.4.1: ENUM型適用
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_posts_public_id ON user_posts(public_id);
CREATE INDEX idx_user_posts_user_id ON user_posts(user_id, created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX idx_user_posts_visibility ON user_posts(visibility, created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX idx_user_posts_hashtags ON user_posts USING gin(hashtags) WHERE is_deleted = FALSE;
```

#### **post_likes, post_comments**

```sql
CREATE TABLE post_likes (
  post_id UUID NOT NULL REFERENCES user_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  post_id UUID NOT NULL REFERENCES user_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  like_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### **DM機能テーブル**

```sql
CREATE TABLE dm_conversations (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(16) NOT NULL UNIQUE,
  conversation_type conversation_type_enum DEFAULT 'direct',  -- v7.4.1: ENUM型適用
  conversation_name VARCHAR(255),
  created_by_user_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dm_participants (
  conversation_id UUID NOT NULL REFERENCES dm_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMPTZ,
  last_read_message_id UUID,
  is_muted BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE dm_messages (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  conversation_id UUID NOT NULL REFERENCES dm_conversations(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL,
  message_text TEXT,
  media_urls TEXT[],
  reply_to_message_id UUID,
  is_system_message BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE TABLE dm_messages_2026_02 PARTITION OF dm_messages
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE INDEX idx_dm_messages_conversation_id ON dm_messages(conversation_id, created_at DESC);
```

#### **マッチング機能テーブル（Phase 3）**

```sql
CREATE TABLE user_match_preferences (
  user_id UUID PRIMARY KEY,
  looking_for match_purpose_enum,  -- v7.4.1: ENUM型適用（拡張版）
  institution_id UUID,
  faculty_id UUID,
  academic_fields academic_field_enum[],
  preferred_languages VARCHAR(10)[],
  availability_hours JSONB,
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_matches (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id_1 UUID NOT NULL,
  user_id_2 UUID NOT NULL,
  match_type match_type_enum NOT NULL,  -- v7.4.1: ENUM型適用（拡張版）
  compatibility_score DECIMAL(5,2),
  match_reason JSONB,
  status match_status_enum DEFAULT 'pending',  -- v7.4.1: ENUM型適用
  conversation_id UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ,
  CHECK (user_id_1 < user_id_2)
);

CREATE UNIQUE INDEX idx_user_matches_unique_pair ON user_matches(user_id_1, user_id_2, match_type) 
  WHERE status != 'rejected';
```

### 10.3 イベント駆動フロー

edumintSocialは`content.interaction`イベントを購読し、通知生成のみ実行します。統計情報の更新責務はedumintContentsが持ちます。

```yaml
# 購読イベント
subscriptions:
  - content.interaction.ExamLiked:
      action: 通知生成「あなたの試験がいいねされました」
  
  - content.interaction.ExamCommented:
      action: 通知生成「あなたの試験にコメントがつきました」
```

**設計注記:**
- edumintSocialは統計情報の更新責務を持たない
- Kafkaイベントを購読して通知生成のみ実行
- edumintContentsが統計情報のSource of Truthとなる

### 10.4 ログテーブル (DB分離設計)

**物理DB:** `edumint_social_logs`

#### **social_logs**
```sql
CREATE TABLE social_logs (
  log_id UUID PRIMARY KEY DEFAULT uuidv7(),
  event_type VARCHAR(50) NOT NULL, -- 'comment_created', 'post_liked', 'dm_sent', 'match_requested'
  user_id UUID NOT NULL, -- アクションを実行したユーザー
  target_user_id UUID, -- 対象ユーザー（DM、マッチングなど）
  target_id UUID, -- exam_id, post_id, comment_id, dm_id等
  metadata JSONB, -- イベント固有の詳細情報
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_social_logs_user_created ON social_logs(user_id, created_at DESC);
CREATE INDEX idx_social_logs_event_created ON social_logs(event_type, created_at DESC);
CREATE INDEX idx_social_logs_target ON social_logs(target_id, created_at DESC) WHERE target_id IS NOT NULL;
```

**パーティション設計:**
```sql
-- 月次パーティション（3ヶ月保持）
CREATE TABLE social_logs_2026_02 PARTITION OF social_logs
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE social_logs_2026_03 PARTITION OF social_logs
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

**event_type一覧:**
```sql
-- コメント関連
'comment_created'       -- コメント投稿
'comment_liked'         -- コメントいいね
'comment_deleted'       -- コメント削除

-- 投稿関連
'post_created'          -- 投稿作成
'post_liked'            -- 投稿いいね
'post_commented'        -- 投稿へのコメント
'post_deleted'          -- 投稿削除

-- DM関連
'dm_sent'               -- DM送信
'dm_read'               -- DM既読
'dm_thread_created'     -- DMスレッド作成

-- マッチング関連（Phase 3）
'match_requested'       -- マッチングリクエスト
'match_accepted'        -- マッチング承認
'match_rejected'        -- マッチング拒否
```

**保持期間:** 3ヶ月（分析用）
**バックアップ:** BigQuery日次エクスポート
**用途:**
- ユーザー行動分析
- スパム検出（短時間の大量いいね等）
- レコメンデーションアルゴリズムの学習データ

**sqlcクエリ例:**
```sql
-- name: InsertSocialLog :exec
INSERT INTO social_logs (event_type, user_id, target_user_id, target_id, metadata)
VALUES ($1, $2, $3, $4, $5);

-- name: GetUserActivityLogs :many
SELECT event_type, target_id, metadata, created_at
FROM social_logs
WHERE user_id = $1 
  AND created_at >= $2
ORDER BY created_at DESC
LIMIT $3;

-- name: DetectSpamActivity :many
-- 直近10分間で同一ユーザーが同じイベントを20回以上実行
SELECT user_id, event_type, COUNT(*) as event_count
FROM social_logs
WHERE created_at >= NOW() - INTERVAL '10 minutes'
GROUP BY user_id, event_type
HAVING COUNT(*) > 20
ORDER BY event_count DESC;
```

---

## **10. edumintMonetizeWallet (ウォレット管理サービス)**

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
  status revenue_status_enum DEFAULT 'pending',  -- v7.4.1: ENUM型適用
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

### 11.1 本体DBテーブル (DDL例)

#### **content_reports**

コンテンツ通報情報を管理します。

```sql
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(16) NOT NULL UNIQUE,  -- NanoID
  reporter_user_id UUID NOT NULL,  -- users.idを参照（論理的）
  reported_entity_type reportable_entity_type_enum NOT NULL,  -- v7.4.1: ENUM型適用
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
- **v7.4.1**: reported_entity_type を reportable_entity_type_enum に変更

#### **user_reports**

ユーザー通報情報を管理します。

```sql
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(16) NOT NULL UNIQUE,  -- NanoID
  reporter_user_id UUID NOT NULL,  -- users.idを参照（論理的）
  reported_user_id UUID NOT NULL,  -- users.idを参照（論理的）
  reason user_report_reason_enum NOT NULL,  -- v7.4.1: ENUM型適用
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
  report_type report_category_enum NOT NULL,  -- v7.4.1: ENUM型適用
  report_id UUID NOT NULL,
  file_url VARCHAR(512) NOT NULL,
  file_type VARCHAR(50),
  file_size_bytes BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_files_report ON report_files(report_type, report_id);
```

### 11.2 ログテーブル (DB分離設計)

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

## **13. edumintGateways (ジョブゲートウェイ)**

### 設計変更点

#### v7.0.0
- 全テーブルの主キーをUUIDに変更
- ログテーブルを物理DB分離

#### v7.5.0（パターンB: 2テーブル構成への移行）
- **`job_events`テーブルを新設**: ジョブ状態遷移履歴・Kafkaイベント受信履歴を記録
- **監査要件強化**: 全ての状態遷移を完全な証跡として保持
- **デバッグ性向上**: SQLで履歴を直接確認可能（Kafkaログ依存を回避）
- **冪等性保証**: Kafka offsetを記録して重複処理を防止

**設計判断の根拠:**

| 観点 | 判断 |
|------|------|
| **タイミング** | リリース前であり、今後の移行コストを回避 |
| **監査要件** | ジョブ状態遷移の完全な証跡が必要 |
| **デバッグ性** | SQLで履歴を直接確認可能(Kafkaログ依存を回避) |
| **実装複雑度** | トランザクション管理の範囲内で実現可能 |
| **スケーラビリティ** | パーティショニング・アーカイブ戦略が明確化 |

### 13.1 本体DBテーブル (DDL例)

#### **jobs**

ジョブの**最新状態**を管理します（OLTP最適化）。履歴は`job_events`テーブルに記録されます。

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

COMMENT ON TABLE jobs IS 'ジョブの最新状態を管理(OLTP最適化)。履歴はjob_eventsに記録';
```

#### **job_events**

ジョブ状態遷移履歴・Kafkaイベント受信履歴を記録します（監査証跡）。

```sql
CREATE TABLE job_events (
  event_id UUID PRIMARY KEY DEFAULT uuidv7(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('created', 'status_changed', 'completed', 'failed', 'cancelled')),
  old_status job_status_enum,
  new_status job_status_enum,
  event_payload JSONB,  -- 詳細情報(resource_id, error等)
  event_source VARCHAR(50) NOT NULL,  -- 'gateway', 'content', 'ai', 'file'
  kafka_topic VARCHAR(255),
  kafka_partition INT,
  kafka_offset BIGINT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT check_status_transition CHECK (
    (event_type = 'status_changed' AND old_status IS NOT NULL AND new_status IS NOT NULL) OR
    (event_type != 'status_changed')
  ),
  
  -- Kafka冪等性保証: 同じoffsetからのイベントは1回のみ記録
  CONSTRAINT unique_kafka_event UNIQUE (job_id, kafka_topic, kafka_offset)
);

CREATE INDEX idx_job_events_job_id ON job_events(job_id, occurred_at DESC);
CREATE INDEX idx_job_events_occurred_at ON job_events(occurred_at DESC);
CREATE INDEX idx_job_events_event_type ON job_events(event_type, occurred_at DESC);
CREATE INDEX idx_job_events_source ON job_events(event_source, occurred_at DESC);
CREATE INDEX idx_job_events_kafka_offset ON job_events(kafka_topic, kafka_partition, kafka_offset);

COMMENT ON TABLE job_events IS 'ジョブ状態遷移履歴・Kafkaイベント受信履歴を記録(監査証跡)';
COMMENT ON COLUMN job_events.event_payload IS 'JSONB形式で詳細情報を格納: {resource_id, error_message, metadata等}';
COMMENT ON COLUMN job_events.kafka_offset IS 'Kafkaイベント起因の場合、offsetを記録して冪等性を保証';
```

**設計注記:**
- **`jobs`テーブル**: ジョブの最新状態のみを保持（OLTP最適化）
- **`job_events`テーブル**: 全ての状態遷移履歴を保持（監査・分析用）
- Kafka offsetによる冪等性保証（UNIQUE制約により重複イベント自動除外）
- event_payloadで柔軟な詳細情報保持（resource_id, error_message等）

#### **イベント駆動フロー例**

```go
// Kafkaイベント受信時の標準処理パターン
func (uc *JobUseCase) OnExamCreated(ctx context.Context, event ExamCreatedEvent) error {
    tx, err := uc.db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    defer tx.Rollback()

    // 1. jobs.status を更新(最新状態)
    oldJob, err := uc.jobRepo.GetByID(ctx, tx, event.JobID)
    if err != nil {
        return err
    }
    
    if err := uc.jobRepo.UpdateStatus(ctx, tx, event.JobID, "processing", event.ExamID); err != nil {
        return err
    }

    // 2. job_events に履歴記録(監査証跡)
    jobEvent := &JobEvent{
        EventID:       uuidv7.New(),
        JobID:         event.JobID,
        EventType:     "status_changed",
        OldStatus:     oldJob.Status,
        NewStatus:     "processing",
        EventPayload:  map[string]any{"exam_id": event.ExamID},
        EventSource:   "content",
        KafkaTopic:    "content.lifecycle",
        KafkaPartition: event.KafkaPartition,
        KafkaOffset:   event.KafkaOffset,
        OccurredAt:    time.Now(),
    }
    
    // UNIQUE制約により、同じKafkaメッセージの重複は自動的に無視される
    if err := uc.jobEventRepo.Create(ctx, tx, jobEvent); err != nil {
        // 冪等性エラー(重複offset)は無視
        if !errors.Is(err, ErrDuplicateKafkaEvent) {
            return err
        }
    }

    return tx.Commit()
}

// ジョブ作成時の処理パターン
func (uc *JobUseCase) CreateJob(ctx context.Context, req CreateJobRequest) (*Job, error) {
    tx, err := uc.db.BeginTx(ctx, nil)
    if err != nil {
        return nil, err
    }
    defer tx.Rollback()

    // 1. jobsテーブルにINSERT
    job := &Job{
        ID:        uuidv7.New(),
        PublicID:  nanoid.New(),
        JobType:   req.JobType,
        Status:    "pending",
        Payload:   req.Payload,
        CreatedByUserID: req.UserID,
    }
    if err := uc.jobRepo.Create(ctx, tx, job); err != nil {
        return nil, err
    }

    // 2. job_eventsに作成イベントを記録
    jobEvent := &JobEvent{
        EventID:      uuidv7.New(),
        JobID:        job.ID,
        EventType:    "created",
        NewStatus:    "pending",
        EventPayload: req.Payload,
        EventSource:  "gateway",
        OccurredAt:   time.Now(),
    }
    if err := uc.jobEventRepo.Create(ctx, tx, jobEvent); err != nil {
        return nil, err
    }

    if err := tx.Commit(); err != nil {
        return nil, err
    }

    // 3. Kafkaへイベント発行
    if err := uc.kafka.Publish("gateway.jobs", JobCreatedEvent{
        JobID:   job.ID,
        JobType: job.JobType,
    }); err != nil {
        // ログ記録のみ（ジョブは既にDBに保存済み）
        log.Error("Failed to publish job created event", "error", err)
    }

    return job, nil
}
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
- ジョブの詳細なログメッセージを記録（デバッグ・パフォーマンス分析用）
- 本体DBと分離して高速クエリを実現
- **`job_events`との違い**: `job_logs`は実行時の詳細ログ、`job_events`は状態遷移の監査証跡

---

## **14. Debezium CDC レプリケーション設計**

### 概要

v7.2.0では、Debezium CDCを2コネクタ構成に拡張し、edumintContentsの4DB構成に対応します。PostgreSQLからElasticsearchへのリアルタイムデータ同期を実現し、edumintSearchサービスの無状態化と、データ整合性の自動保証が可能になります。

**v7.2.0の主要変更:**
- **2コネクタ構成**: edumint_contents と edumint_contents_search の個別同期
- **精密なレプリケーション制御**: テーブル単位での同期設定最適化
- **I/O負荷の分離**: 検索用DBの変更を独立して捕捉
- **master DBは非レプリケーション**: OCRテキスト（機密情報）はElasticsearchに同期しない

### アーキテクチャ（v7.2.0 - 3コネクタ構成）

```
┌─────────────────────┐
│ edumintUsers        │ PostgreSQL (edumint_users)
│ (Source of Truth)   │
└──────────┬──────────┘
           │ Logical Replication
           ↓
      ┌────────────────┐
      │ Debezium CDC   │ Change Data Capture
      │ Connector      │
      └────────┬───────┘
               │ Kafka Topic: dbz.edumint_users.*
               ↓
┌─────────────────────┐
│ edumintContents     │ PostgreSQL (edumint_contents)
│ (Source of Truth)   │
└──────────┬──────────┘
           │ Logical Replication
           ↓
      ┌────────────────┐
      │ Debezium CDC   │ Change Data Capture
      │ Connector      │
      └────────┬───────┘
               │ Kafka Topic: dbz.edumint_contents.*
               ↓
         ┌──────────┐
         │  Kafka   │ Event Streaming Platform
         └────┬─────┘
              │
              ↓
    ┌──────────────────┐
    │ edumintSearch    │ Consumer Service
    │ (Stateless)      │
    └────────┬─────────┘
             │
             ↓
    ┌──────────────────┐
    │ Elasticsearch    │ Search Index
    │ 9.2.4            │
    └──────────────────┘
```

### Debezium 設定

#### PostgreSQL 論理レプリケーション設定

```sql
-- postgresql.conf
wal_level = logical
max_replication_slots = 12  -- v7.2.0: 3コネクタ構成により増加
max_wal_senders = 12

-- レプリケーションスロット作成（v7.2.0 - 3スロット構成）
SELECT pg_create_logical_replication_slot('debezium_edumint_users', 'pgoutput');
SELECT pg_create_logical_replication_slot('debezium_edumint_contents', 'pgoutput');
SELECT pg_create_logical_replication_slot('debezium_edumint_contents_search', 'pgoutput');  -- NEW

-- パブリケーション作成（edumint_users）
CREATE PUBLICATION dbz_publication_users FOR TABLE 
  users, user_profiles, oauth_tokens, idp_links;

-- パブリケーション作成（edumint_contents メインDB）
CREATE PUBLICATION dbz_publication_contents FOR TABLE
  institutions, faculties, departments, teachers, subjects,
  exams, questions, sub_questions, keywords, exam_keywords,
  exam_statistics, exam_interaction_events,
  ad_display_events, ad_viewing_progress;  -- v7.2.0: 広告テーブル追加、v7.4.0: ad_viewing_progress統合

-- パブリケーション作成（edumint_contents_search 検索用DB） *NEW*
CREATE PUBLICATION dbz_publication_contents_search FOR TABLE
  subject_terms, institution_terms, faculty_terms, teacher_terms,
  term_generation_jobs, term_generation_candidates;
```

#### Debezium Connector 設定（edumintUsers）

```json
{
  "name": "debezium-connector-edumint-users",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "edumint-users-db.internal",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "${secret:debezium-password}",
    "database.dbname": "edumint_users",
    "database.server.name": "edumint_users",
    "table.include.list": "public.users,public.user_profiles,public.oauth_tokens,public.idp_links",
    "plugin.name": "pgoutput",
    "publication.name": "dbz_publication_users",
    "slot.name": "debezium_edumint_users",
    "heartbeat.interval.ms": 5000,
    "snapshot.mode": "initial",
    "topic.prefix": "dbz.edumint_users",
    "transforms": "unwrap",
    "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState",
    "transforms.unwrap.drop.tombstones": "false",
    "transforms.unwrap.delete.handling.mode": "rewrite"
  }
}
```

#### Debezium Connector 設定（edumintContents メインDB）

```json
{
  "name": "debezium-connector-edumint-contents",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "edumint-contents-db.internal",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "${secret:debezium-password}",
    "database.dbname": "edumint_contents",
    "database.server.name": "edumint_contents",
    "table.include.list": "public.institutions,public.faculties,public.departments,public.teachers,public.subjects,public.exams,public.questions,public.sub_questions,public.keywords,public.exam_keywords,public.exam_statistics,public.exam_interaction_events,public.ad_display_events,public.ad_viewing_progress",
    "column.exclude.list": "public.exams.file_metadata",
    "plugin.name": "pgoutput",
    "publication.name": "dbz_publication_contents",
    "slot.name": "debezium_edumint_contents",
    "heartbeat.interval.ms": 5000,
    "snapshot.mode": "initial",
    "topic.prefix": "dbz.edumint_contents",
    "transforms": "unwrap",
    "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState",
    "transforms.unwrap.drop.tombstones": "false",
    "transforms.unwrap.delete.handling.mode": "rewrite"
  }
}
```

**設計注記（v7.2.0変更点）:**
- 検索用語テーブル（`*_terms`, `term_generation_*`）を除外
- 広告管理テーブル（`ad_display_events`, `ad_viewing_progress`）を追加（v7.4.0でad_viewing_historyから移行）
- table.include.listを最適化（読み取り専用テーブルのみ）
- **column.exclude.list（v7.5.1追加）**: 大容量カラムのCDC除外
  - `exams.file_metadata`: ファイルメタデータJSON（最大1MB）

**大容量カラム除外の理由（v7.5.1新設）:**

大容量カラムをCDC対象にすると以下の問題が発生:
- **Kafkaメッセージサイズ肥大化**: デフォルト1MB制限を超過する可能性
- **レプリケーション遅延**: 大量データ転送によるパフォーマンス低下
- **ストレージコスト増加**: Kafkaトピックの容量圧迫

**代替戦略:**
- 変更検知は`updated_at`タイムスタンプで実施
- 実データはREST API経由で取得
- Elasticsearchには概要情報のみを格納

#### Debezium Connector 設定（edumint_contents_search 検索用DB） *NEW*

```json
{
  "name": "debezium-connector-edumint-contents-search",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "edumint-contents-search-db.internal",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "${secret:debezium-password}",
    "database.dbname": "edumint_contents_search",
    "database.server.name": "edumint_contents_search",
    "table.include.list": "public.subject_terms,public.institution_terms,public.faculty_terms,public.teacher_terms,public.term_generation_jobs,public.term_generation_candidates",
    "plugin.name": "pgoutput",
    "publication.name": "dbz_publication_contents_search",
    "slot.name": "debezium_edumint_contents_search",
    "heartbeat.interval.ms": 5000,
    "snapshot.mode": "initial",
    "topic.prefix": "dbz.edumint_contents_search",
    "transforms": "unwrap",
    "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState",
    "transforms.unwrap.drop.tombstones": "false",
    "transforms.unwrap.delete.handling.mode": "rewrite"
  }
}
```

**設計注記（v7.2.0新設）:**
- 検索用語テーブル専用のコネクタ
- I/O負荷を分離（検索DB専用のレプリケーション）
- 全文検索インデックス更新の精密制御
- リードレプリカからのレプリケーション対応

### Kafkaトピック設計（v7.2.0 - 3コネクタ構成）

| トピック名 | 用途 | データ例 |
|:---|:---|:---|
| `dbz.edumint_users.public.users` | ユーザー変更 | INSERT/UPDATE/DELETE on users |
| `dbz.edumint_users.public.user_profiles` | プロフィール変更 | INSERT/UPDATE/DELETE on user_profiles |
| `dbz.edumint_contents.public.exams` | 試験変更 | INSERT/UPDATE/DELETE on exams |
| `dbz.edumint_contents.public.questions` | 問題変更 | INSERT/UPDATE/DELETE on questions |
| `dbz.edumint_contents.public.exam_statistics` | 統計変更 | INSERT/UPDATE on exam_statistics |
| `dbz.edumint_contents.public.ad_display_events` | 広告表示イベント | INSERT on ad_display_events *NEW* |
| `dbz.edumint_contents_search.public.subject_terms` | 科目検索用語変更 | INSERT/UPDATE/DELETE on subject_terms *NEW* |
| `dbz.edumint_contents_search.public.institution_terms` | 機関検索用語変更 | INSERT/UPDATE/DELETE on institution_terms *NEW* |
| `dbz.edumint_contents_search.public.term_generation_jobs` | 用語生成ジョブ | INSERT/UPDATE on term_generation_jobs *NEW* |

**v7.2.0変更点:**
- 検索用語テーブル変更を専用トピック（`dbz.edumint_contents_search.*`）で配信
- メインDBトピック（`dbz.edumint_contents.*`）から検索用語テーブルを除外
- 広告管理テーブルをメインDBトピックに追加

### edumintSearch Consumer実装

```go
package consumer

import (
    "context"
    "encoding/json"
    "github.com/elastic/go-elasticsearch/v8"
    "github.com/segmentio/kafka-go"
)

type SearchIndexer struct {
    esClient    *elasticsearch.Client
    kafkaReader *kafka.Reader
}

func (s *SearchIndexer) ConsumeExamChanges(ctx context.Context) error {
    for {
        msg, err := s.kafkaReader.ReadMessage(ctx)
        if err != nil {
            return err
        }

        var change DebeziumChange
        if err := json.Unmarshal(msg.Value, &change); err != nil {
            continue
        }

        switch change.Payload.Op {
        case "c", "u": // Create or Update
            s.indexExam(ctx, change.Payload.After)
        case "d": // Delete
            s.deleteExam(ctx, change.Payload.Before.ID)
        }
    }
}

type DebeziumChange struct {
    Payload struct {
        Op     string          `json:"op"`      // c, u, d, r
        Before json.RawMessage `json:"before"`
        After  json.RawMessage `json:"after"`
    } `json:"payload"`
}
```

### 差分同期の保証

1. **WAL（Write-Ahead Log）ベース**: PostgreSQLのトランザクションログから差分抽出
2. **At-Least-Once配信**: Kafkaオフセット管理による確実な配信
3. **イベント順序保証**: 同一テーブル内での順序保証（パーティションキー: table名）
4. **スナップショット初期化**: 初回起動時に既存データ全体を同期

### モニタリング・運用

#### ヘルスチェック

```sql
-- レプリケーションラグ確認
SELECT
    slot_name,
    active,
    restart_lsn,
    confirmed_flush_lsn,
    pg_current_wal_lsn() - confirmed_flush_lsn AS replication_lag_bytes
FROM pg_replication_slots
WHERE slot_name LIKE 'debezium_%';

-- アクティブな接続確認
SELECT * FROM pg_stat_replication
WHERE application_name LIKE 'debezium%';
```

#### Prometheus Metrics

```yaml
# Debezium Connector Metrics
- debezium_metrics_MilliSecondsSinceLastEvent
- debezium_metrics_TotalNumberOfEventsSeen
- debezium_metrics_NumberOfEventsSkipped
- debezium_metrics_SnapshotCompleted
- debezium_metrics_Connected
```

### トラブルシューティング

#### レプリケーションスロット削除・再作成

```sql
-- 問題のあるスロット削除
SELECT pg_drop_replication_slot('debezium_edumint_users');

-- 再作成
SELECT pg_create_logical_replication_slot('debezium_edumint_users', 'pgoutput');
```

#### Kafka遅延対策

```bash
# Consumer Lag確認
kafka-consumer-groups --bootstrap-server kafka:9092 \
  --group edumint-search-indexer \
  --describe

# パーティション数増加（スケールアウト）
kafka-topics --bootstrap-server kafka:9092 \
  --alter --topic dbz.edumint_contents.public.exams \
  --partitions 10
```

### 設計注記

- **無状態化**: edumintSearchはElasticsearch + ログDBのみ
- **Source of Truth**: edumintUsers, edumintContentsが唯一の真実
- **リアルタイム性**: ミリ秒～秒オーダーでの同期
- **運用コスト削減**: 手動同期処理・バッチジョブ不要
- **整合性保証**: PostgreSQL ACID特性 + CDC自動反映

---

## **15. イベント駆動フロー**

### Kafkaトピック設計

#### CDC (Change Data Capture) トピック
データベースの変更を自動的にキャプチャし、他サービスに伝播するためのトピック。

**命名規則:** `dbz.{service}.{schema}.{table}`

| トピック名 | 説明 | Publisher | Subscribers |
|----------|------|-----------|-------------|
| `dbz.edumint.users.public.users` | ユーザー情報の変更 | Debezium | edumintFiles, edumintSocial |
| `dbz.edumint.users.public.user_profiles` | プロフィール変更 | Debezium | edumintSearch |
| `dbz.edumint.contents.public.exams` | 試験情報の変更 | Debezium | edumintSearch, edumintRevenue |
| `dbz.edumint.contents.public.questions` | 問題情報の変更 | Debezium | edumintSearch |
| `dbz.edumint.contents_search.public.exams_search` | 検索用試験情報の変更 | Debezium | edumintSearch (Elasticsearch同期) |
| `dbz.edumint.contents_search.public.questions_search` | 検索用問題情報の変更 | Debezium | edumintSearch (Elasticsearch同期) |

#### アプリケーションイベントトピック
ビジネスロジックによって明示的に発行されるイベント。

**命名規則:** `edumint.{service}.events`

| トピック名 | 説明 | Publisher | Subscribers |
|----------|------|-----------|-------------|
| `edumint.users.events` | ユーザー関連イベント | edumintUsers | 全サービス |
| `edumint.contents.events` | コンテンツイベント | edumintContents | edumintSearch, edumintRevenue |
| `edumint.files.events` | ファイルイベント | edumintFiles | edumintContents, edumintModeration |
| `edumint.social.events` | ソーシャルイベント | edumintSocial | edumintUsers, edumintRevenue |
| `edumint.moderation.events` | 通報・審査イベント | edumintModeration | edumintUsers, edumintContents |
| `edumint.monetize.events` | 収益イベント | edumintMonetizeWallet | edumintRevenue, edumintUsers |

**CDC vs アプリケーションイベントの使い分け:**
- **CDC**: データベースの変更を機械的に伝播（低レベル）
- **アプリケーションイベント**: ビジネスロジックの意図を伝達（高レベル）
- 例: 試験アップロード時
  - CDC: `dbz.edumint.contents.public.exams` に INSERT イベント
  - アプリケーション: `edumint.contents.events` に `exam.uploaded` イベント（メタデータ含む）

#### 主要トピック一覧

EduMintでは以下のKafkaトピックを通じてマイクロサービス間でイベント駆動連携を実現します。

| トピック名 | Producer | Consumer | イベント例 | 用途 |
|-----------|----------|----------|-----------|------|
| `auth.events` | edumintUsers | 各サービス | `UserRegistered`, `UserLoggedIn`, `TokenRevoked` | 認証イベント通知 |
| `user.events` | edumintUsers | 各サービス | `UserProfileUpdated`, `UserDeleted` | ユーザー情報変更通知 |
| `content.lifecycle` | edumintContents | edumintSearch, edumintGateways | `ExamCreated`, `ExamPublished`, `ExamDeleted` | コンテンツライフサイクル |
| `content.ocr` | edumintContents | edumintAiWorker | `OCRRequested` | OCR処理要求 |
| `file.uploaded` | edumintFiles | edumintContents, edumintAiWorker | `FileUploaded` | ファイルアップロード完了 |
| `file.encrypted` | edumintFiles | edumintContents | `FileEncrypted` | ファイル暗号化完了 |
| `ai.results` | edumintAiWorker | edumintContents, edumintGateways | `OCRCompleted`, `AIGenerationComplete` | AI処理結果 |
| `gateway.jobs` | edumintGateways | 各サービス | `JobAssigned`, `JobCompleted` | ジョブオーケストレーション |
| `gateway.job_status` | 各サービス | edumintGateways | `JobProgressUpdate`, `JobFailed` | ジョブステータス更新 |
| `search.indexed` | edumintSearch | - | `ContentIndexed` | 検索インデックス完了通知 |
| `search.term_generation` | edumintSearch | edumintAiWorker | `TermGenerationRequested` | 用語生成要求 |
| **`content.interaction`** | **edumintContents** | **edumintSearch, edumintSocial, edumintRevenue** | **`ExamViewed`, `ExamLiked`, `ExamUnliked`, `ExamBad`, `ExamShared`** | **ユーザーインタラクション統計イベント** |
| `social.activity` | edumintSocial | edumintUsers, edumintContents | `ExamCommented`, `PostCreated`, `DMSent` | ソーシャル活動通知 |
| `content.feedback` | edumintSocial | edumintContents | `ExamLiked`, `ExamCommented`, `ExamViewed` | ソーシャルフィードバック |
| `monetization.transactions` | edumintMonetizeWallet | edumintRevenue | `CoinEarned`, `CoinSpent` | ウォレットトランザクション |
| `revenue.reports` | edumintRevenue | - | `RevenueCalculated`, `PaymentProcessed` | 収益レポート |
| `moderation.events` | edumintModeration | edumintContents, edumintUsers | `ContentReported`, `ContentTakenDown`, `UserBanned` | モデレーションイベント |

#### **ファイル管理イベント（v7.5.1追加）**

**`edumint.files.file_migration_completed`**
- **Producer**: edumintFiles
- **Consumers**: edumintContents（OCRテキスト参照先更新）、edumintRevenue（ストレージコスト再計算）
- **Key**: `file_id (UUID)`
- **Value Schema**:
  ```json
  {
    "file_id": "uuid",
    "old_bucket": "edumint-staging-asia",
    "new_bucket": "edumint-vault-asia",
    "old_storage_class": "STANDARD",
    "new_storage_class": "ARCHIVE",
    "migrated_at": "2026-02-07T12:34:56Z",
    "file_size_bytes": 1048576
  }
  ```

#### **統計更新イベント（v7.5.1追加）**

**`edumint.contents.exam_statistics_updated`**
- **Producer**: edumintContents
- **Consumers**: edumintSearch（Elasticsearchインデックス更新）、edumintRevenue（人気度ベース収益分配計算）
- **Key**: `exam_id (UUID)`
- **Value Schema**:
  ```json
  {
    "exam_id": "uuid",
    "total_views": 12345,
    "total_unlocks": 456,
    "total_comments": 78,
    "average_rating": 4.5,
    "updated_at": "2026-02-07T12:34:56Z"
  }
  ```

### イベントフロー例

#### **1. 試験アップロードフロー（v7.1.0更新）**

```
[ユーザー] ファイルアップロード
   ↓
[edumintFiles] file_metadata作成、GCSへ保存
   ↓ (Kafka: file.uploaded)
[edumintGateways] ジョブ作成 (job_type: 'file_upload')
   ↓ (Kafka: gateway.jobs)
[edumintAiWorker] OCR処理実行（edumintFilesからファイル取得）
   ↓ (Kafka: ai.results)
[edumintContents] master_ocr_contentsにOCRテキスト保存、exams/questions作成
   ↓ (Kafka: content.lifecycle)
[edumintSearch] Elasticsearchインデックス更新（Debezium CDC経由）
```

**ポイント:**
- **責務分離**: edumintFilesが原本ファイル保存、edumintContentsがOCRテキスト管理
- **イベント駆動**: file.uploadedイベントでファイルアップロード完了を通知
- **API連携**: edumintAiWorkerはedumintFiles APIでファイル取得

#### **2. ソーシャルフィードバックフロー（v7.0.2以前の旧パターン - 参考）**

```
[ユーザー] 試験にいいね
   ↓
[edumintSocial] exam_likes作成
   ↓ (Kafka: content.feedback)
[edumintContents] exams.like_count更新
   ↓ (Kafka: content.lifecycle)
[edumintSearch] Elasticsearchランキング更新
   ↓
[edumintUsers] 通知作成 (ExamLiked)
```

**注記:** v7.0.3では以下の新しいパターンに移行しました。

#### **2. ユーザーインタラクションフロー（v7.0.3新規）**

```
[ユーザー] 試験にいいね
   ↓
[edumintContents API] exam_interaction_eventsに記録（非同期）
   ↓ (Kafka: content.interaction)
[edumintSearch] Elasticsearchランキング更新
[edumintSocial] 通知作成「あなたの試験がいいねされました」
[edumintRevenue] エンゲージメント収益計算
   ↓
[定期バッチ 1分ごと] exam_statistics更新
```

**ポイント:**
- APIレスポンス速度優先: イベント記録は非同期、統計更新は後回し
- リアルタイム性: Kafkaイベントで他サービスが即座に反応
- 整合性: 定期バッチで統計を正確に集計

#### **3. ファイル自動暗号化フロー（v7.1.0新規）**

```
[日次バッチ] 7日経過ファイル検出
   ↓
[edumintFiles] file_metadata暗号化処理（GCS）
   ↓ (Kafka: file.encrypted)
[edumintContents] master_ocr_contents暗号化フラグ更新
   ↓
[edumintContents] OCRテキスト暗号化（DB）
```

**ポイント:**
- **2段階暗号化**: 原本ファイル（edumintFiles）とOCRテキスト（edumintContents）を両方暗号化
- **自動処理**: アップロード後7日経過で自動実行
- **イベント連携**: file.encryptedイベントでedumintContentsに通知

#### **4. 収益分配フロー**

```
[日次バッチ] 広告インプレッション集計
   ↓
[edumintRevenue] ad_impressions_agg作成
   ↓ 収益計算
[edumintRevenue] revenue_reports作成
   ↓ (Kafka: monetization.transactions)
[edumintMonetizeWallet] wallet_transactions作成
   ↓
[edumintUsers] 通知作成 (CoinEarned)
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

## **16. データベース設計ガイドライン**

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

#### **イミュータブル性の保証（v7.5.1追加）**

ログテーブルは一度書き込まれたら変更されない「イミュータブル」な設計を徹底します。

**設計原則:**
- ログテーブルには`updated_at`カラムを**設けない**
- 一度書き込まれたログは変更されないことを設計上保証
- 修正が必要な場合は新しいログエントリを追加（補正ログパターン）

**該当テーブル:**
```
auth_logs
user_profile_logs
content_logs
search_logs
social_logs
wallet_logs
revenue_logs
moderation_logs
job_logs
```

**標準DDL形式:**
```sql
CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  -- その他のカラム
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
  -- updated_atは削除（イミュータブルログのため）
) PARTITION BY RANGE (created_at);
```

**補正ログパターン例:**
```sql
-- 誤ったログエントリが発見された場合、新しい補正エントリを追加
INSERT INTO auth_logs (user_id, event_type, metadata, created_at)
VALUES (
  'user-uuid',
  'correction',
  jsonb_build_object(
    'corrects_log_id', 'original-log-uuid',
    'reason', '記録ミス訂正',
    'original_event_type', 'login_failed',
    'corrected_event_type', 'login_success'
  ),
  CURRENT_TIMESTAMP
);
```

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
- ソーシャルデータ: `exam_comments`, `user_posts`, `dm_messages`

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

**edumintContents_files専用ライフサイクルポリシー**:

```yaml
# GCS Lifecycle Configuration for edumintContents_files bucket
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
-- edumintContents.examsテーブル（Content管理サービス）
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  public_id VARCHAR(8) NOT NULL UNIQUE,
  creator_user_id UUID NOT NULL,              -- edumintUsers.usersを論理参照
  -- creator_user_idにはFOREIGN KEY制約を設定しない（サービス境界を越えるため）
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- edumintContents.exam_interaction_eventsテーブル（v7.0.3: 統計情報管理）
CREATE TABLE exam_interaction_events (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  exam_id UUID NOT NULL,                      -- edumintContents.examsを論理参照
  user_id UUID,                               -- edumintUsers.usersを論理参照（NULL許可）
  event_type VARCHAR(20) NOT NULL,            -- 'view', 'like', 'bad', etc.
  -- exam_id, user_idにはFOREIGN KEY制約を設定しない（論理参照のため）
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- インデックスは必須（外部キー制約がなくても）
CREATE INDEX idx_exam_interaction_events_exam_id ON exam_interaction_events(exam_id);
CREATE INDEX idx_exam_interaction_events_user_id ON exam_interaction_events(user_id);
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

#### **16.14.9 edumintContents_files データ永続化標準**

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
  job_id UUID NOT NULL,                       -- ジョブID（edumintGateways.jobs参照）
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
-- edumintContents.exam_interaction_eventsテーブルで edumintUsers.usersを参照
CREATE TABLE exam_interaction_events (
  user_id UUID REFERENCES edumint_auth.users(id),  -- 異なるDB、物理制約不可
);

-- ✅ 正しい: 論理参照のみ
CREATE TABLE exam_interaction_events (
  user_id UUID,  -- 論理参照のみ、制約なし（NULL許可）
);
CREATE INDEX idx_exam_interaction_events_user_id ON exam_interaction_events(user_id);  -- インデックスは必須
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

##### **❌ 自社パスワード認証（全面廃止 - v7.5.0）**

```sql
-- ❌ 廃止: password_hashカラム
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),  -- 廃止: セキュリティリスク、運用コスト増
  -- 自社でのパスワード管理は廃止
);

-- ✅ 正しい: SSO専用認証
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  email VARCHAR(255) UNIQUE,  -- NULL許可（IdP提供情報のみで登録可能）
  -- password_hashカラムを削除
  -- 認証はidp_linksテーブルで管理
);

CREATE TABLE idp_links (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider idp_provider_enum NOT NULL,  -- google, apple, meta, microsoft, line, github
  provider_user_id VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  -- 最低2つのIdP紐付けを推奨（アプリケーション層でバリデーション）
);
```

**廃止理由（v7.5.0）**:
- **セキュリティリスク**: パスワード漏洩、ブルートフォース攻撃、レインボーテーブル攻撃のリスク排除
- **運用コスト削減**: パスワードリセット機能、セキュリティインシデント対応の廃止
- **ユーザー利便性**: 既存アカウント（Google, Apple, Meta等）でログイン、パスワード記憶不要
- **OAuth API無料化**: Google, Apple, Meta, Microsoft, LINE, GitHub全て認証API無料範囲内で運用可能
- **コンプライアンス簡素化**: GDPR, 個人情報保護法対応がOAuth提供者に委託可能

**Twitter廃止について**:
- X(旧Twitter) API有料化（月額$100〜）、サービス不安定性により廃止
- 既存Twitterユーザーには3ヶ月の移行期間を設け、別のIdP追加を促す
- 移行期間後、Twitter IdPリンクを自動削除

**複数IdP紐付け必須化**:
- 最低2つのIdP紐付けを推奨（アプリケーション層でバリデーション）
- アカウント削除リスク対策（1つのIdPが使えなくなった場合の可用性保証）
- DB制約では強制しない（ビジネスロジックで制御）

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
- [ ] GCSライフサイクルポリシーを設定している（edumintContents_files）
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

#### **HNSWインデックス再構築戦略（v7.5.1新設）**

##### 再構築が必要になる状況
1. **大量挿入後の断片化**: 10万件以上のベクトル挿入
2. **検索性能劣化**: クエリ応答時間が通常の2倍以上
3. **インデックススキャン率低下**: `pg_stat_user_indexes.idx_scan`が週次で100未満

##### 再構築手順
```sql
-- 1. 現在のインデックス状態確認
SELECT 
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE indexrelname = 'idx_exams_content_vector_hnsw';

-- 2. CONCURRENTLYオプションで再構築（ダウンタイム0）
REINDEX INDEX CONCURRENTLY idx_exams_content_vector_hnsw;

-- 3. 再構築後の性能確認
EXPLAIN ANALYZE
SELECT id, content_vector <=> '[0.1, 0.2, ...]' AS distance
FROM exams
ORDER BY distance
LIMIT 10;
```

##### 自動化スクリプト（Cloud Run Jobs）
```go
package maintenance

import (
    "context"
    "fmt"
    "log/slog"
    
    "github.com/edumint/content/internal/db/dbgen"
)

type MaintenanceService struct {
    queries *dbgen.Queries
    db      *pgxpool.Pool
    config  *MaintenanceConfig
}

type MaintenanceConfig struct {
    MaxQueryTimeMs int
}

type IndexStats struct {
    IdxScan         int64
    AvgQueryTimeMs  float64
}

func (s *MaintenanceService) ReindexHNSWIfNeeded(ctx context.Context) error {
    // 1. インデックス統計取得
    stats, err := s.queries.GetIndexStats(ctx, "idx_exams_content_vector_hnsw")
    if err != nil {
        return err
    }
    
    // 2. 再構築条件判定
    needsReindex := stats.IdxScan < 100 || 
                    stats.AvgQueryTimeMs > float64(s.config.MaxQueryTimeMs)*2
    
    if !needsReindex {
        slog.Info("HNSW index is healthy", "idx_scan", stats.IdxScan)
        return nil
    }
    
    // 3. 再構築実行
    slog.Info("starting HNSW reindex", "reason", "performance_degradation")
    _, err = s.db.Exec(ctx, "REINDEX INDEX CONCURRENTLY idx_exams_content_vector_hnsw")
    if err != nil {
        return fmt.Errorf("reindex failed: %w", err)
    }
    
    // 4. Slackアラート送信
    s.notifySlack(ctx, "HNSW index reindexed successfully")
    return nil
}

func (s *MaintenanceService) notifySlack(ctx context.Context, message string) {
    // Slack通知実装（省略）
}
```

##### 実行スケジュール
- **頻度**: 週次（日曜深夜2:00 JST）
- **想定実行時間**: 100万ベクトルで約30分
- **影響**: CONCURRENTLY指定によりダウンタイム0秒

##### Cloud Run Jobs定義
```yaml
apiVersion: run.googleapis.com/v1
kind: Job
metadata:
  name: hnsw-reindex-job
spec:
  template:
    spec:
      containers:
      - image: gcr.io/edumint-prod/maintenance-worker:latest
        env:
        - name: JOB_TYPE
          value: "hnsw_reindex"
        - name: DATABASE_HOST
          value: "/cloudsql/edumint-prod:asia-northeast1:edumint-content"
        resources:
          limits:
            memory: "2Gi"
            cpu: "2000m"
      timeoutSeconds: 3600  # 60分タイムアウト
```

##### Prometheusメトリクス
```promql
# インデックススキャン率
rate(pg_stat_user_indexes_idx_scan{indexrelname="idx_exams_content_vector_hnsw"}[1w])

# 平均クエリ時間
avg(pg_stat_statements_mean_exec_time{query=~".*content_vector.*"}[1d])
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
edumintContents/
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

### 18.3.1 国際化対応テーブル定義（v7.4.0追加）

#### **institutions.hcl - 国際化対応機関テーブル**

```hcl
# internal/db/schema/institutions.hcl

schema "public" {}

table "institutions" {
  schema = schema.public
  
  column "id" {
    type    = uuid
    default = sql("uuidv7()")
  }
  
  column "public_id" {
    type = varchar(8)
    null = false
  }
  
  # 国際化対応カラム（v7.4.0）
  column "name" {
    type = varchar(255)
    null = false
    comment = "英語名（SEO最適化）"
  }
  
  column "display_name" {
    type = varchar(255)
    null = false
    comment = "表示名（多言語対応）"
  }
  
  column "display_language" {
    type    = varchar(10)
    default = "ja"
    comment = "BCP 47準拠の言語コード"
  }
  
  column "region_code" {
    type    = char(2)
    default = "JP"
    null    = false
    comment = "ISO 3166-1 alpha-2国コード"
  }
  
  column "institution_type" {
    type = enum.institution_type_enum
    null = false
  }
  
  column "prefecture" {
    type = enum.prefecture_enum
  }
  
  column "address" {
    type = text
  }
  
  column "website_url" {
    type = varchar(512)
  }
  
  column "is_active" {
    type    = boolean
    default = true
  }
  
  column "created_at" {
    type    = timestamptz
    default = sql("CURRENT_TIMESTAMP")
  }
  
  column "updated_at" {
    type    = timestamptz
    default = sql("CURRENT_TIMESTAMP")
  }
  
  primary_key {
    columns = [column.id]
  }
  
  index "idx_institutions_public_id" {
    columns = [column.public_id]
    unique  = true
  }
  
  index "idx_institutions_type" {
    columns = [column.institution_type]
  }
  
  index "idx_institutions_prefecture" {
    columns = [column.prefecture]
  }
  
  index "idx_institutions_region_code" {
    columns = [column.region_code]
  }
  
  # GINインデックス（全文検索）
  index "idx_institutions_name" {
    columns = [column.name]
    type    = GIN
    on {
      expr = "to_tsvector('english', name)"
    }
  }
  
  index "idx_institutions_display_name" {
    columns = [column.display_name]
    type    = GIN
    on {
      expr = "to_tsvector('japanese', display_name)"
    }
  }
}
```

#### **国際化対応sqlcクエリ例**

```sql
-- internal/db/queries/institutions.sql

-- name: GetInstitutionByID :one
SELECT 
  id,
  public_id,
  name,
  display_name,
  display_language,
  region_code,
  institution_type,
  prefecture,
  address,
  website_url,
  is_active,
  created_at,
  updated_at
FROM institutions
WHERE id = $1 AND is_active = true;

-- name: ListInstitutionsByCountry :many
SELECT 
  id,
  public_id,
  name,
  display_name,
  display_language,
  region_code,
  institution_type,
  prefecture
FROM institutions
WHERE region_code = $1 
  AND is_active = true
ORDER BY display_name
LIMIT $2 OFFSET $3;

-- name: SearchInstitutionsByName :many
-- 国際化対応検索（英語名と表示名の両方を検索）
SELECT 
  id,
  public_id,
  name,
  display_name,
  display_language,
  region_code,
  institution_type
FROM institutions
WHERE (
    to_tsvector('english', name) @@ plainto_tsquery('english', $1)
    OR to_tsvector('japanese', display_name) @@ plainto_tsquery('japanese', $1)
  )
  AND is_active = true
ORDER BY 
  ts_rank(to_tsvector('english', name), plainto_tsquery('english', $1)) DESC,
  ts_rank(to_tsvector('japanese', display_name), plainto_tsquery('japanese', $1)) DESC
LIMIT $2;

-- name: CreateInstitution :one
INSERT INTO institutions (
  public_id,
  name,
  display_name,
  display_language,
  region_code,
  institution_type,
  prefecture,
  address,
  website_url
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9
)
RETURNING *;
```

### 18.3.2 全エンティティ国際化対応方針（v7.5.1新設）

#### 対応必須エンティティ
- ✅ institutions (v7.4.0対応済み)
- 🔴 faculties (要対応)
- 🔴 departments (要対応)
- 🔴 teachers (要対応)
- 🔴 subjects (要対応)

#### 国際化テーブル命名規則
- `{entity}_translations` (例: `faculties_translations`)

#### DDLテンプレート

##### faculties_translations
```sql
CREATE TABLE faculties_translations (
  faculty_id UUID NOT NULL,
  lang_code VARCHAR(5) NOT NULL, -- 'ja', 'en', 'zh', 'ko'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  PRIMARY KEY (faculty_id, lang_code),
  FOREIGN KEY (faculty_id) REFERENCES faculties(faculty_id) ON DELETE CASCADE
);

CREATE INDEX idx_faculties_translations_lang ON faculties_translations(lang_code);
```

##### departments_translations
```sql
CREATE TABLE departments_translations (
  department_id UUID NOT NULL,
  lang_code VARCHAR(5) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  PRIMARY KEY (department_id, lang_code),
  FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE
);

CREATE INDEX idx_departments_translations_lang ON departments_translations(lang_code);
```

##### teachers_translations
```sql
CREATE TABLE teachers_translations (
  teacher_id UUID NOT NULL,
  lang_code VARCHAR(5) NOT NULL,
  name VARCHAR(255) NOT NULL,
  biography TEXT,
  PRIMARY KEY (teacher_id, lang_code),
  FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE
);

CREATE INDEX idx_teachers_translations_lang ON teachers_translations(lang_code);
```

##### subjects_translations
```sql
CREATE TABLE subjects_translations (
  subject_id UUID NOT NULL,
  lang_code VARCHAR(5) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  PRIMARY KEY (subject_id, lang_code),
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
);

CREATE INDEX idx_subjects_translations_lang ON subjects_translations(lang_code);
```

#### API設計

##### Accept-Languageヘッダーパース
```go
// internal/i18n/lang.go
package i18n

import "strings"

// ParseAcceptLanguage はAccept-Languageヘッダーから優先言語を抽出
// 例: "ja-JP,en;q=0.9,zh;q=0.8" → "ja"
func ParseAcceptLanguage(header string) string {
    if header == "" {
        return "ja" // デフォルト
    }
    
    // 最初の言語コードを取得
    parts := strings.Split(header, ",")
    if len(parts) == 0 {
        return "ja"
    }
    
    lang := strings.TrimSpace(parts[0])
    lang = strings.Split(lang, ";")[0] // q値を除去
    lang = strings.Split(lang, "-")[0] // 地域コードを除去（ja-JP → ja）
    
    // サポート言語リスト
    supported := map[string]bool{
        "ja": true,
        "en": true,
        "zh": true,
        "ko": true,
    }
    
    if supported[lang] {
        return lang
    }
    
    return "ja" // デフォルト
}
```

##### サービス層実装
```go
// internal/service/institution_service.go
func (s *InstitutionService) GetInstitution(ctx context.Context, id uuid.UUID, acceptLang string) (*Institution, error) {
    langCode := i18n.ParseAcceptLanguage(acceptLang)
    
    // フォールバック戦略: 指定言語 → 英語 → デフォルト名
    inst, err := s.queries.GetInstitutionWithTranslation(ctx, db.GetInstitutionWithTranslationParams{
        InstitutionID: id,
        LangCode:      langCode,
        FallbackLang:  "en",
    })
    
    if err != nil {
        return nil, err
    }
    
    return inst, nil
}
```

#### sqlcクエリ定義（フォールバック対応）

##### institutions
```sql
-- name: GetInstitutionWithTranslation :one
SELECT 
  i.institution_id,
  COALESCE(
    (SELECT name FROM institution_translations WHERE institution_id = i.institution_id AND lang_code = $2),
    (SELECT name FROM institution_translations WHERE institution_id = i.institution_id AND lang_code = $3),
    i.name_ja
  ) AS name,
  i.institution_type,
  i.established_year,
  i.prefecture
FROM institutions i
WHERE i.institution_id = $1 AND i.deleted_at IS NULL;
```

##### faculties
```sql
-- name: GetFacultyWithTranslation :one
SELECT 
  f.faculty_id,
  COALESCE(
    (SELECT name FROM faculties_translations WHERE faculty_id = f.faculty_id AND lang_code = $2),
    (SELECT name FROM faculties_translations WHERE faculty_id = f.faculty_id AND lang_code = $3),
    f.name_ja
  ) AS name,
  f.institution_id
FROM faculties f
WHERE f.faculty_id = $1 AND f.deleted_at IS NULL;
```

##### subjects
```sql
-- name: GetSubjectWithTranslation :one
SELECT 
  s.subject_id,
  COALESCE(
    (SELECT name FROM subjects_translations WHERE subject_id = s.subject_id AND lang_code = $2),
    (SELECT name FROM subjects_translations WHERE subject_id = s.subject_id AND lang_code = $3),
    s.name_ja
  ) AS name,
  s.subject_code,
  s.credits
FROM subjects s
WHERE s.subject_id = $1 AND s.deleted_at IS NULL;
```

#### フロントエンド実装例（React + i18next）

##### 言語切り替えコンポーネント
```typescript
// src/components/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    // APIリクエストのヘッダーも自動的に更新される
  };

  return (
    <select value={i18n.language} onChange={(e) => changeLanguage(e.target.value)}>
      <option value="ja">日本語</option>
      <option value="en">English</option>
      <option value="zh">中文</option>
      <option value="ko">한국어</option>
    </select>
  );
};
```

##### API呼び出し
```typescript
// src/api/institutions.ts
import { useTranslation } from 'react-i18next';

export const useInstitution = (id: string) => {
  const { i18n } = useTranslation();

  const fetchInstitution = async () => {
    const response = await fetch(`/api/institutions/${id}`, {
      headers: {
        'Accept-Language': i18n.language, // "ja", "en", "zh", "ko"
      },
    });
    return response.json();
  };

  return useQuery(['institution', id, i18n.language], fetchInstitution);
};
```

#### 実装優先順位
1. **Phase 1 (MVP):** institutions, faculties, subjects のみ対応
2. **Phase 2:** departments, teachers を追加
3. **Phase 3:** 全エンティティ対応完了

#### Atlas HCL定義例

##### faculties_translations.hcl
```hcl
table "faculties_translations" {
  schema = schema.public
  
  column "faculty_id" {
    type = uuid
    null = false
  }
  
  column "lang_code" {
    type = varchar(5)
    null = false
  }
  
  column "name" {
    type = varchar(255)
    null = false
  }
  
  column "description" {
    type = text
    null = true
  }
  
  primary_key {
    columns = [column.faculty_id, column.lang_code]
  }
  
  foreign_key "fk_faculties_translations_faculty" {
    columns = [column.faculty_id]
    ref_columns = [table.faculties.column.faculty_id]
    on_delete = CASCADE
  }
  
  index "idx_faculties_translations_lang" {
    columns = [column.lang_code]
  }
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

#### **4DB構成のインスタンス設定（v7.2.0）**

edumintContentsサービスは4つの物理DBに分離されており、それぞれ異なる特性に応じた最適なインスタンス設定を行います。

**インスタンス構成概要:**

| DB名 | インスタンス名 | スペック | 用途 | コスト（月額概算） |
|:---|:---|:---|:---|:---|
| edumint_contents | edumint-contents-prod | db-custom-6-24GB | メインDB（試験・問題） | $280 |
| edumint_contents_search | edumint-contents-search-prod | db-custom-4-16GB | 検索用DB（用語管理） | $160 |
| edumint_contents_master | edumint-contents-master-prod | db-custom-2-8GB | マスターDB（OCR） | $80 |
| edumint_contents_logs | edumint-contents-logs-prod | db-custom-2-8GB | ログDB（90日保持） | $80 |
| **合計** | - | - | - | **$600** |

**2DB構成との比較:**
- 2DB構成（v7.1.0）: edumint_contents (db-custom-8-32GB $360) + logs (db-custom-2-8GB $80) = **$440**
- 4DB構成（v7.2.0）: 上記4DB合計 = **$600**
- **差分: +$160/月（+36%）**

**コスト増加の理由と価値:**
- セキュリティ向上（master DB分離、IAMロール厳格化）
- 性能改善（I/O競合解消、独立スケーリング）
- 運用柔軟性（DB単位のバックアップ・リストア、段階的メンテナンス）
- 将来の拡張性（検索DBのみ水平スケール可能）

#### **GCP Console設定例（4DB構成）**

```bash
# 1. メインDB（edumint_contents）
gcloud sql instances create edumint-contents-prod \
  --database-version=POSTGRES_18 \
  --tier=db-custom-6-24576 \
  --region=asia-northeast1 \
  --availability-type=REGIONAL \
  --backup-start-time=03:00 \
  --enable-bin-log \
  --retained-backups-count=30 \
  --transaction-log-retention-days=7 \
  --database-flags=max_connections=250,shared_buffers=6GB,effective_cache_size=18GB,maintenance_work_mem=1536MB,work_mem=128MB,wal_buffers=16MB,max_wal_size=4GB,min_wal_size=1GB,checkpoint_completion_target=0.9,random_page_cost=1.1,effective_io_concurrency=200,wal_level=logical,max_replication_slots=4,max_wal_senders=4

# 2. 検索用DB（edumint_contents_search）
gcloud sql instances create edumint-contents-search-prod \
  --database-version=POSTGRES_18 \
  --tier=db-custom-4-16384 \
  --region=asia-northeast1 \
  --availability-type=REGIONAL \
  --backup-start-time=03:30 \
  --enable-bin-log \
  --retained-backups-count=14 \
  --transaction-log-retention-days=7 \
  --database-flags=max_connections=200,shared_buffers=4GB,effective_cache_size=12GB,maintenance_work_mem=1GB,work_mem=64MB,wal_buffers=8MB,max_wal_size=2GB,min_wal_size=512MB,checkpoint_completion_target=0.9,random_page_cost=1.1,effective_io_concurrency=150,wal_level=logical,max_replication_slots=2,max_wal_senders=2

# 3. マスターDB（edumint_contents_master）
gcloud sql instances create edumint-contents-master-prod \
  --database-version=POSTGRES_18 \
  --tier=db-custom-2-8192 \
  --region=asia-northeast1 \
  --availability-type=REGIONAL \
  --backup-start-time=04:00 \
  --enable-bin-log \
  --retained-backups-count=90 \
  --transaction-log-retention-days=30 \
  --database-flags=max_connections=50,shared_buffers=2GB,effective_cache_size=6GB,maintenance_work_mem=512MB,work_mem=32MB,wal_buffers=8MB,max_wal_size=1GB,min_wal_size=256MB,checkpoint_completion_target=0.9,random_page_cost=1.1,effective_io_concurrency=100

# 4. ログDB（edumint_contents_logs）
gcloud sql instances create edumint-contents-logs-prod \
  --database-version=POSTGRES_18 \
  --tier=db-custom-2-8192 \
  --region=asia-northeast1 \
  --availability-type=REGIONAL \
  --backup-start-time=04:30 \
  --enable-bin-log \
  --retained-backups-count=7 \
  --transaction-log-retention-days=7 \
  --database-flags=max_connections=100,shared_buffers=2GB,effective_cache_size=6GB,maintenance_work_mem=512MB,work_mem=32MB,wal_buffers=8MB,max_wal_size=1GB,min_wal_size=256MB,checkpoint_completion_target=0.9,random_page_cost=1.1,effective_io_concurrency=100
```

**設計注記:**
- メインDB: ベクトル検索・複雑なJOINに対応、中規模スペック
- 検索DB: 全文検索最適化、リードレプリカ追加可能
- マスターDB: 書き込み専用、最小スペック、長期バックアップ（90日保持）
- ログDB: パーティション対応、短期バックアップ（7日保持）

#### **単一インスタンス設定例（参考: v7.1.0）**

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

#### **4DB構成のサービスアカウント設計（v7.2.0）**

edumintContentsの4DB構成では、セキュリティと責務分離を強化するため、DB単位で異なるサービスアカウントを使用します。

**サービスアカウント構成:**

| サービスアカウント | 対象DB | アクセス権限 | 用途 |
|:---|:---|:---|:---|
| edumint-contents-app-sa | edumint_contents | SELECT, INSERT, UPDATE | メインDB操作（通常アプリ） |
| edumint-contents-app-sa | edumint_contents_search | SELECT, INSERT, UPDATE, DELETE | 検索用語管理 |
| edumint-contents-master-sa | edumint_contents_master | INSERT のみ | OCRテキスト書き込み専用 |
| edumint-admin-sa | edumint_contents_master | SELECT のみ | OCRテキスト読み取り（管理者） |
| edumint-contents-app-sa | edumint_contents_logs | INSERT のみ | ログ書き込み専用 |
| edumint-analyst-sa | 全DB（master除く） | SELECT のみ | 分析・レポート用 |

```bash
# 1. アプリケーション用サービスアカウント（メインDB・検索DB・ログDB）
gcloud iam service-accounts create edumint-contents-app-sa \
  --display-name="EduMint Contents Application Service Account" \
  --project=edumint-prod

# 2. マスターDB書き込み専用サービスアカウント
gcloud iam service-accounts create edumint-contents-master-sa \
  --display-name="EduMint Contents Master DB Writer" \
  --project=edumint-prod

# 3. 管理者用サービスアカウント（マスターDB読み取り）
gcloud iam service-accounts create edumint-admin-sa \
  --display-name="EduMint Administrator Service Account" \
  --project=edumint-prod

# 4. 分析用サービスアカウント
gcloud iam service-accounts create edumint-analyst-sa \
  --display-name="EduMint Analyst Service Account" \
  --project=edumint-prod

# Cloud SQL Client権限付与
for sa in edumint-contents-app-sa edumint-contents-master-sa edumint-admin-sa edumint-analyst-sa; do
  gcloud projects add-iam-policy-binding edumint-prod \
    --member="serviceAccount:${sa}@edumint-prod.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"
done

# Workload Identity連携（GKE使用時）
gcloud iam service-accounts add-iam-policy-binding \
  edumint-contents-app-sa@edumint-prod.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:edumint-prod.svc.id.goog[default/edumint-contents]"
```

#### **データベースユーザー作成（4DB構成）**

```sql
-- ===== edumint_contents (メインDB) =====
-- アプリケーション用ユーザー
CREATE USER "edumint-contents-app-sa@edumint-prod.iam" WITH LOGIN;
GRANT CONNECT ON DATABASE edumint_contents TO "edumint-contents-app-sa@edumint-prod.iam";
GRANT USAGE, CREATE ON SCHEMA public TO "edumint-contents-app-sa@edumint-prod.iam";
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO "edumint-contents-app-sa@edumint-prod.iam";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "edumint-contents-app-sa@edumint-prod.iam";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO "edumint-contents-app-sa@edumint-prod.iam";

-- ===== edumint_contents_search (検索用DB) =====
-- アプリケーション用ユーザー（DELETE権限も付与）
CREATE USER "edumint-contents-app-sa@edumint-prod.iam" WITH LOGIN;
GRANT CONNECT ON DATABASE edumint_contents_search TO "edumint-contents-app-sa@edumint-prod.iam";
GRANT USAGE, CREATE ON SCHEMA public TO "edumint-contents-app-sa@edumint-prod.iam";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "edumint-contents-app-sa@edumint-prod.iam";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "edumint-contents-app-sa@edumint-prod.iam";

-- ===== edumint_contents_master (マスターDB) =====
-- 書き込み専用ユーザー（INSERT のみ）
CREATE USER "edumint-contents-master-sa@edumint-prod.iam" WITH LOGIN;
GRANT CONNECT ON DATABASE edumint_contents_master TO "edumint-contents-master-sa@edumint-prod.iam";
GRANT USAGE ON SCHEMA public TO "edumint-contents-master-sa@edumint-prod.iam";
GRANT INSERT ON ALL TABLES IN SCHEMA public TO "edumint-contents-master-sa@edumint-prod.iam";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "edumint-contents-master-sa@edumint-prod.iam";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT ON TABLES TO "edumint-contents-master-sa@edumint-prod.iam";

-- 管理者用ユーザー（SELECT のみ）
CREATE USER "edumint-admin-sa@edumint-prod.iam" WITH LOGIN;
GRANT CONNECT ON DATABASE edumint_contents_master TO "edumint-admin-sa@edumint-prod.iam";
GRANT USAGE ON SCHEMA public TO "edumint-admin-sa@edumint-prod.iam";
GRANT SELECT ON ALL TABLES IN SCHEMA public TO "edumint-admin-sa@edumint-prod.iam";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO "edumint-admin-sa@edumint-prod.iam";

-- ===== edumint_contents_logs (ログDB) =====
-- 書き込み専用ユーザー（INSERT のみ）
CREATE USER "edumint-contents-app-sa@edumint-prod.iam" WITH LOGIN;
GRANT CONNECT ON DATABASE edumint_contents_logs TO "edumint-contents-app-sa@edumint-prod.iam";
GRANT USAGE ON SCHEMA public TO "edumint-contents-app-sa@edumint-prod.iam";
GRANT INSERT ON ALL TABLES IN SCHEMA public TO "edumint-contents-app-sa@edumint-prod.iam";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT ON TABLES TO "edumint-contents-app-sa@edumint-prod.iam";
```

#### **読み取り専用ユーザー（分析・レポート用 - 4DB対応）**

```sql
-- 分析用ロール作成
CREATE ROLE analyst_role;

-- メインDB: 全テーブル読み取り
GRANT CONNECT ON DATABASE edumint_contents TO analyst_role;
GRANT USAGE ON SCHEMA public TO analyst_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analyst_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO analyst_role;

-- 検索DB: 全テーブル読み取り
GRANT CONNECT ON DATABASE edumint_contents_search TO analyst_role;
GRANT USAGE ON SCHEMA public TO analyst_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analyst_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO analyst_role;

-- マスターDB: アクセス不可（機密情報）

-- ログDB: 全テーブル読み取り
GRANT CONNECT ON DATABASE edumint_contents_logs TO analyst_role;
GRANT USAGE ON SCHEMA public TO analyst_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analyst_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO analyst_role;

-- IAM認証ユーザーに分析ロール付与
CREATE USER "edumint-analyst-sa@edumint-prod.iam" WITH LOGIN IN ROLE analyst_role;
```

**設計注記（v7.2.0）:**
- マスターDB: 最小権限原則を厳格適用（書き込み専用SAと読み取り専用SA分離）
- 検索DB: DELETE権限追加（用語候補の削除対応）
- ログDB: INSERT専用（上書き・削除禁止）
- 分析用SA: マスターDBアクセス不可（機密情報保護）

#### **単一DB構成のIAM設定（参考: v7.1.0）**

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

#### **pgxpool接続設定（v7.5.1追加: IAM認証対応）**

```go
package database

import (
    "context"
    "fmt"
    "time"
    
    "github.com/jackc/pgx/v5"
    "github.com/jackc/pgx/v5/pgxpool"
    "log/slog"
)

// NewPool creates a new database connection pool with IAM auth support
func NewPool(ctx context.Context, config *DatabaseConfig) (*pgxpool.Pool, error) {
    dsn := fmt.Sprintf(
        "host=%s port=%s dbname=%s user=%s password=%s sslmode=%s",
        config.Host, config.Port, config.Name, config.User, config.Password, config.SSLMode,
    )
    
    poolConfig, err := pgxpool.ParseConfig(dsn)
    if err != nil {
        return nil, fmt.Errorf("parse pool config: %w", err)
    }
    
    // IAM認証対応設定（v7.5.1追加）
    poolConfig.MaxConnLifetime = 50 * time.Minute  // IAMトークン有効期限（60分）前に再接続
    poolConfig.MaxConnIdleTime = 10 * time.Minute  // アイドル接続の早期切断
    poolConfig.HealthCheckPeriod = 1 * time.Minute // 定期ヘルスチェック
    
    // 基本設定
    poolConfig.MaxConns = config.MaxConns
    poolConfig.MinConns = config.MinConns
    
    // 接続取得前の検証フック
    poolConfig.BeforeAcquire = func(ctx context.Context, conn *pgx.Conn) bool {
        // 接続取得前にトークン有効性確認
        var result int
        err := conn.QueryRow(ctx, "SELECT 1").Scan(&result)
        if err != nil {
            slog.Warn("connection validation failed", "error", err)
            return false // 無効な接続を破棄
        }
        return true
    }
    
    return pgxpool.NewWithConfig(ctx, poolConfig)
}
```

**IAM認証時の接続ライフサイクル管理（v7.5.1新設）**

##### 問題の所在
- Cloud SQL IAM認証トークンは60分で失効
- 失効後の接続使用で`ERROR: IAM authentication token expired`

##### 解決策
1. **MaxConnLifetime = 50分**: トークン失効前に接続を強制クローズ
2. **MaxConnIdleTime = 10分**: アイドル接続の早期切断でメモリ効率化
3. **HealthCheckPeriod = 1分**: 定期的な接続有効性確認
4. **BeforeAcquire Hook**: 接続プールからの取得時に即座に検証

##### モニタリング
```promql
# IAM認証エラー率
rate(pgx_connection_errors_total{reason="iam_token_expired"}[5m]) > 0

# 接続ライフタイム分布（50分以下であることを確認）
histogram_quantile(0.99, rate(pgx_connection_lifetime_seconds_bucket[5m])) < 3000
```

##### Grafanaダッシュボード
```json
{
  "dashboard": {
    "title": "Cloud SQL IAM接続監視",
    "panels": [
      {
        "title": "IAM Token Expiration Errors",
        "targets": [
          {
            "expr": "rate(pgx_connection_errors_total{reason=\"iam_token_expired\"}[5m])"
          }
        ]
      },
      {
        "title": "Connection Lifetime (P99)",
        "targets": [
          {
            "expr": "histogram_quantile(0.99, rate(pgx_connection_lifetime_seconds_bucket[5m]))"
          }
        ]
      }
    ]
  }
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

### 基本方針

**分散モノリス化の防止**: テスト実行専用マイクロサービスの作成は禁止します。各サービスは独立してテスト可能（Deployable）であることを担保します。

**テストハニカムモデル**: E2E（最小限）、Component（主軸）、Contract、Unitの4層構成を採用します。

**独立性の保証**: 各サービスが独立してテスト可能であり、他サービスへの依存は契約テストとモックで担保します。

---

## **21.1 テクノロジースタック & 指定ライブラリ (Strict)**

**Coding Agentへの指示:** 以下のバージョンとライブラリを厳守すること。存在しない関数や非推奨のパッケージを使用しないこと。

| カテゴリ | 技術/バージョン | 推奨ライブラリ (Import Path) | 備考 |
| :--- | :--- | :--- | :--- |
| **Language** | **Go 1.25.7** | `testing` (Standard) | Table Driven Testを標準とする。 |
| **Assertion** | - | `github.com/stretchr/testify/assert` | 可読性向上のため使用。 |
| **Web Framework** | **Echo v5.0.1** | `github.com/labstack/echo/v5` | `net/http` 互換モードで使用。 |
| **Database** | **PostgreSQL 18.1** | `github.com/jackc/pgx/v5` | DBドライバはpgxを使用。 |
| **Container Test** | - | `github.com/testcontainers/testcontainers-go` | DB統合テストで必須。 |
| **Migration** | **Atlas** | `ariga.io/atlas-go-sdk` | テスト起動時にスキーマ適用に使用。 |
| **Contract** | **Pact** | `github.com/pact-foundation/pact-go/v2` | v2 (Rust core wrapper) を使用。 |
| **UUID** | **UUIDv7** | `github.com/google/uuid` | `uuid.NewV7()` を使用。 |
| **Mocking** | - | `go.uber.org/mock/gomock` | 外部API/Interfaceのモック生成に使用。 |

**設計原則:**
- **UUIDv7の使用**: ID生成には必ず `github.com/google/uuid` の `NewV7()` を使用
- **時刻の扱い**: テスト内で `time.Now()` を直接使用禁止（Clock DIパターン採用）
- **並列実行**: `t.Parallel()` を積極的に使用
- **Flaky Test排除**: `time.Sleep()` 禁止、ポーリング（`Eventually` パターン）またはチャネル同期を使用

---

## **21.2 コンポーネント/統合テスト (Component Tests)**

**最も重要なレイヤーです。** ハンドラからDBまでを貫通させますが、他マイクロサービスへの通信はモックします。

### 実装ルール

1. **Testcontainers** で `postgres:18.1` を起動する。
2. **Atlas** でスキーマ定義(`schema.hcl`等)をコンテナに適用する。
3. Echoの `httptest.NewRequest` でリクエストを投げる。
4. 外部サービス（例: 決済API）へのClient Interfaceは `gomock` でモック化する。

### EduMint専用実装テンプレート

```go
// tests/component/user_handler_test.go
package component_test

import (
    "context"
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"
    
    "github.com/google/uuid"
    "github.com/jackc/pgx/v5/pgxpool"
    "github.com/labstack/echo/v5"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
    "github.com/testcontainers/testcontainers-go"
    "github.com/testcontainers/testcontainers-go/modules/postgres"
    "go.uber.org/mock/gomock"
    
    "github.com/edumint/content/internal/handler"
    "github.com/edumint/content/internal/service/mock"
)

func TestCreateUser_Component(t *testing.T) {
    t.Parallel() // 並列実行を有効化
    
    ctx := context.Background()

    // 1. Start PostgreSQL 18.1 Container
    pgContainer, err := postgres.RunContainer(ctx,
        testcontainers.WithImage("postgres:18.1"),
        postgres.WithDatabase("testdb"),
        postgres.WithUsername("user"),
        postgres.WithPassword("pass"),
    )
    require.NoError(t, err)
    defer pgContainer.Terminate(ctx)

    connStr, err := pgContainer.ConnectionString(ctx)
    require.NoError(t, err)

    // 2. Apply Schema via Atlas
    err = applyAtlasSchema(ctx, connStr)
    require.NoError(t, err)

    // 3. Create DB Connection Pool
    pool, err := pgxpool.New(ctx, connStr)
    require.NoError(t, err)
    defer pool.Close()

    // 4. Setup Mocks (gomock)
    ctrl := gomock.NewController(t)
    defer ctrl.Finish()
    
    mockPayment := mock.NewMockPaymentClient(ctrl)
    mockPayment.EXPECT().Charge(gomock.Any(), gomock.Any()).Return(nil)

    // 5. Setup Echo & Handler
    e := echo.New()
    userHandler := handler.NewUserHandler(pool, mockPayment)

    // 6. Execute Request
    userID := uuid.New() // UUIDv7は uuid.NewV7() で生成推奨
    reqBody := `{"name":"test user","email":"test@example.com"}`
    req := httptest.NewRequest(http.MethodPost, "/users", strings.NewReader(reqBody))
    req.Header.Set("Content-Type", "application/json")
    rec := httptest.NewRecorder()
    
    c := e.NewContext(req, rec)
    
    // 7. Execute Handler
    err = userHandler.CreateUser(c)
    require.NoError(t, err)

    // 8. Verify Response
    assert.Equal(t, http.StatusCreated, rec.Code)
    
    // 9. Verify DB State (Optional)
    var count int
    err = pool.QueryRow(ctx, "SELECT COUNT(*) FROM users WHERE email = $1", "test@example.com").Scan(&count)
    require.NoError(t, err)
    assert.Equal(t, 1, count)
}

// Helper: Atlas Schema Application
func applyAtlasSchema(ctx context.Context, connStr string) error {
    // Atlas CLIまたはGo SDKを使用してスキーマを適用
    // 実装例:
    // cmd := exec.CommandContext(ctx, "atlas", "schema", "apply", "--url", connStr, "--to", "file://schema.hcl")
    // return cmd.Run()
    return nil // 簡略化のため省略
}
```

### テストデータ管理

```go
// tests/component/testhelpers/fixtures.go
package testhelpers

import (
    "context"
    "testing"
    
    "github.com/google/uuid"
    "github.com/jackc/pgx/v5/pgxpool"
    "github.com/stretchr/testify/require"
)

type EduMintTestDatabase struct {
    Pool      *pgxpool.Pool
    Container testcontainers.Container
}

func (db *EduMintTestDatabase) SeedInstitution(t *testing.T, name string) uuid.UUID {
    ctx := context.Background()
    
    institutionID := uuid.NewV7() // UUIDv7使用
    publicID := generateNanoID(8)
    
    _, err := db.Pool.Exec(ctx, `
        INSERT INTO institutions (id, public_id, name_main, institution_type)
        VALUES ($1, $2, $3, 'university')
    `, institutionID, publicID, name)
    
    require.NoError(t, err)
    return institutionID
}

func (db *EduMintTestDatabase) SeedExam(t *testing.T, institutionID uuid.UUID, year int32) uuid.UUID {
    ctx := context.Background()
    
    examID := uuid.NewV7()
    publicID := generateNanoID(8)
    
    _, err := db.Pool.Exec(ctx, `
        INSERT INTO exams (id, public_id, institution_id, exam_year, status)
        VALUES ($1, $2, $3, $4, 'draft')
    `, examID, publicID, institutionID, year)
    
    require.NoError(t, err)
    return examID
}
```

### 並列実行とトランザクション分離

```go
func TestUserOperations_Parallel(t *testing.T) {
    t.Parallel()
    
    // 各テストケースで独立したDBスキーマまたはトランザクションを使用
    t.Run("CreateUser", func(t *testing.T) {
        t.Parallel()
        // ... テストロジック
    })
    
    t.Run("UpdateUser", func(t *testing.T) {
        t.Parallel()
        // ... テストロジック
    })
}
```

---

## **21.3 契約テスト (Contract Tests)**

**通信相手との「約束」を守っているか検証します。**

### HTTP API契約テスト（Consumer Driven）

#### Consumer側（edumintGateways）

```go
// tests/contract/user_api_consumer_test.go
package contract_test

import (
    "fmt"
    "net/http"
    "testing"
    
    "github.com/pact-foundation/pact-go/v2/consumer"
    "github.com/pact-foundation/pact-go/v2/matchers"
    "github.com/stretchr/testify/assert"
)

func TestUserAPIContract_Consumer(t *testing.T) {
    // Pact Mock Serverセットアップ
    mockProvider, err := consumer.NewV2Pact(consumer.MockHTTPProviderConfig{
        Consumer: "edumintGateways",
        Provider: "edumintUsers",
        Host:     "127.0.0.1",
    })
    assert.NoError(t, err)

    // 契約定義: GET /api/v1/users/{id}
    err = mockProvider.
        AddInteraction().
        Given("User with ID abc12345 exists").
        UponReceiving("A request to get user by ID").
        WithRequest("GET", "/api/v1/users/abc12345").
        WillRespondWith(200).
        WithJSONBody(matchers.Map{
            "user_id":  matchers.String("abc12345"),
            "username": matchers.String("testuser"),
            "email":    matchers.Email("test@example.com"),
            "role":     matchers.Term("free", "free|premium|admin"),
            "created_at": matchers.ISO8601DateTime(),
        }).
        ExecuteTest(t, func(config consumer.MockServerConfig) error {
            // 実際のAPIクライアントでリクエスト
            client := NewUserAPIClient(fmt.Sprintf("http://%s:%d", config.Host, config.Port))
            user, err := client.GetUserByID("abc12345")
            
            assert.NoError(t, err)
            assert.Equal(t, "abc12345", user.UserID)
            assert.Equal(t, "testuser", user.Username)
            return nil
        })

    assert.NoError(t, err)
}
```

#### Provider側（edumintUsers）

```go
// tests/contract/user_api_provider_test.go
package contract_test

import (
    "fmt"
    "net/http"
    "testing"
    
    "github.com/pact-foundation/pact-go/v2/provider"
    "github.com/stretchr/testify/assert"
)

func TestUserAPIContract_Provider(t *testing.T) {
    // テストサーバー起動（Testcontainers + 実際のHandler）
    testServer := setupTestServer(t)
    defer testServer.Close()

    // State Setup（Given句のセットアップ）
    stateHandlers := provider.StateHandlers{
        "User with ID abc12345 exists": func(setup bool, s provider.ProviderState) (provider.ProviderStateResponse, error) {
            if setup {
                // テストDBにユーザーデータをシード
                seedUserData(t, "abc12345", "testuser", "test@example.com")
            }
            return provider.ProviderStateResponse{}, nil
        },
    }

    // Pact検証実行
    _, err := provider.NewVerifier().
        VerifyProvider(t, provider.VerifyRequest{
            ProviderBaseURL:        testServer.URL,
            PactURLs:               []string{"../pacts/edumintGateways-edumintUsers.json"},
            StateHandlers:          stateHandlers,
            BrokerURL:              "https://pact-broker.edumint.internal",
            PublishVerificationResults: true,
            ProviderVersion:        "1.0.0",
        })

    assert.NoError(t, err)
}
```

### Kafka Event契約テスト（Publisher/Subscriber）

#### Publisher側（edumintContents）

```go
// tests/contract/exam_created_event_publisher_test.go
package contract_test

import (
    "encoding/json"
    "testing"
    
    "github.com/pact-foundation/pact-go/v2/message"
    "github.com/pact-foundation/pact-go/v2/matchers"
    "github.com/stretchr/testify/assert"
)

func TestExamCreatedEvent_Publisher(t *testing.T) {
    // メッセージPactセットアップ
    p, err := message.NewMessagePact(message.Config{
        Consumer: "edumintSearch",
        Provider: "edumintContents",
    })
    assert.NoError(t, err)

    // 契約定義
    err = p.
        AddMessage().
        Given("Exam is created").
        ExpectsToReceive("ExamCreated event").
        WithMetadata(map[string]interface{}{
            "topic":      "content.lifecycle",
            "eventType":  "ExamCreated",
        }).
        WithJSONContent(matchers.Map{
            "exam_id":    matchers.UUID(),
            "public_id":  matchers.String("EXAM0001"),
            "status":     matchers.Term("draft", "draft|active|archived"),
            "created_at": matchers.ISO8601DateTime(),
        }).
        AsType(&ExamCreatedEvent{}).
        ConsumedBy(func(m message.Body) error {
            // イベント生成ロジックの検証
            event := m.(*ExamCreatedEvent)
            assert.NotEmpty(t, event.ExamID)
            assert.NotEmpty(t, event.PublicID)
            return nil
        }).
        Verify(t)

    assert.NoError(t, err)
}
```

#### Subscriber側（edumintSearch）

```go
// tests/contract/exam_created_event_subscriber_test.go
package contract_test

import (
    "testing"
    
    "github.com/pact-foundation/pact-go/v2/message"
    "github.com/stretchr/testify/assert"
)

func TestExamCreatedEvent_Subscriber(t *testing.T) {
    // Pactファイルから契約を読み込み
    p, err := message.NewMessageConsumer(message.Config{
        Consumer: "edumintSearch",
        Provider: "edumintContents",
        PactURLs: []string{"../pacts/edumintSearch-edumintContents.json"},
    })
    assert.NoError(t, err)

    // イベントハンドラの検証
    err = p.Verify(t, message.VerifyMessageRequest{
        Handler: func(m message.Body) error {
            event := m.(*ExamCreatedEvent)
            
            // Elasticsearchへのインデックス登録をシミュレーション
            err := indexExamToElasticsearch(event)
            return err
        },
    })

    assert.NoError(t, err)
}
```

### 契約テストの実行タイミング

| フェーズ | Consumer | Provider |
|:---|:---|:---|
| **開発中** | Pactファイル生成 | - |
| **PR作成時** | Pact Broker公開 | Pactファイル取得・検証実行 |
| **CI/CD** | 契約変更検出 | 契約変更に対する互換性確認 |

---

## **21.4 E2Eテスト (Minimal)**

**E2Eテストは最小限に抑制します。** ユーザーの重要導線のみをカバーし、詳細な検証はコンポーネントテストと契約テストに委ねます。

### 実行方針

*   **所有**: フロントエンドリポジトリ
*   **ツール**: Playwright (TypeScript)
*   **対象**: Release環境 (Staging)
*   **頻度**: リリース前のみ実行
*   **禁止事項**:
    - 全網羅的なテスト（コンポーネントテストでカバー済み）
    - DBの中身を直接確認すること（画面上の表示で判断する）
    - テスト専用マイクロサービスの作成

### 対象シナリオ例

1. **ユーザー登録〜ログイン導線**
2. **試験アップロード〜問題閲覧導線**
3. **検索〜結果表示導線**
4. **MintCoin獲得〜使用導線**

### 実装例（TypeScript + Playwright）

```typescript
// tests/e2e/critical-paths/exam-upload.spec.ts
import { test, expect } from '@playwright/test';

test.describe('試験アップロード導線', () => {
  test('ログイン後、試験をアップロードし、問題一覧が表示される', async ({ page }) => {
    // 1. ログイン
    await page.goto('https://staging.edumint.jp/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('https://staging.edumint.jp/dashboard');
    
    // 2. 試験アップロードページへ遷移
    await page.click('a[href="/exams/upload"]');
    await expect(page).toHaveURL('https://staging.edumint.jp/exams/upload');
    
    // 3. ファイル選択・アップロード
    await page.setInputFiles('input[type="file"]', 'fixtures/sample-exam.pdf');
    await page.fill('input[name="examYear"]', '2025');
    await page.selectOption('select[name="institution"]', { label: '東京大学' });
    await page.click('button[type="submit"]');
    
    // 4. 問題一覧が表示されることを確認（画面上の表示で判断）
    await expect(page.locator('h2:has-text("問題一覧")')).toBeVisible();
    await expect(page.locator('.question-item')).toHaveCount(10, { timeout: 30000 });
  });
});
```

### E2Eテストの限界と割り切り

- **全機能の網羅は不可**: コンポーネントテストでカバー
- **環境依存のデバッグ困難**: Staging環境の監視と組み合わせる
- **実行時間の長さ**: クリティカルパスのみに限定

---

## **21.5 テスト実行場所と責任範囲（Matrix）**

| テスト種別 | 誰が書く？ | どのRepo？ | いつ走る？ | 依存リソース | カバレッジ目標 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Unit** | Service Dev | Service Repo | Push / PR | なし (CPUのみ) | 70%以上 |
| **Component** | Service Dev | Service Repo | Push / PR | **Docker** (Testcontainers) | 80%以上 |
| **Contract (Consumer)** | Gateway Dev | Gateway Repo | PR | なし (Pact Mock) | 100% (定義済み契約) |
| **Contract (Provider)** | Service Dev | Service Repo | PR | **Docker** (Testcontainers - DB用) | 100% (定義済み契約) |
| **E2E** | Frontend Dev | Frontend Repo | Release Branch | **GCP Staging Env** | クリティカルパスのみ |

### 各レイヤーの責務

#### Unit Test
- **目的**: ドメインロジック・ユーティリティ関数の単体検証
- **スコープ**: 外部依存なし（モックする）
- **実行速度**: 高速（< 1秒/テスト）

#### Component Test
- **目的**: ハンドラ〜DB間の統合動作検証
- **スコープ**: 実際のDB使用、外部サービスはモック
- **実行速度**: 中速（< 10秒/テスト）

#### Contract Test
- **目的**: API/Messageスキーマの整合性担保
- **スコープ**: Consumer/Provider間の契約検証
- **実行速度**: 高速（< 5秒/テスト）

#### E2E Test
- **目的**: ユーザー導線の動作確認
- **スコープ**: Staging環境全体
- **実行速度**: 低速（> 1分/テスト）

---

## **21.6 CI/CDパイプライン（Testcontainers対応版）**

### GitHub Actions完全版

```yaml
# .github/workflows/edumint_service_test.yml
name: EduMint Service Test & Deploy

on:
  push:
    branches: [main, develop, 'feature/**']
  pull_request:
    branches: [main, develop]

env:
  GO_VERSION: '1.25.7'
  ATLAS_CLI_VERSION: 'v1.0.0'
  PACT_CLI_VERSION: '1.92.0'

jobs:
  # Stage 1: Unit Tests（最速）
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
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
          go test -v -race -short \
            -coverprofile=unit_coverage.out \
            -covermode=atomic \
            ./internal/service/... \
            ./internal/domain/...
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./unit_coverage.out
          flags: unittests

  # Stage 2: Component Tests（Docker必須）
  component-tests:
    name: Component Tests (Testcontainers)
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ env.GO_VERSION }}
          cache: true
      
      - name: Start Docker (for Testcontainers)
        run: |
          sudo systemctl start docker
          docker --version
      
      - name: Run Component Tests
        run: |
          go test -v -tags=component \
            -coverprofile=component_coverage.out \
            ./tests/component/...
        env:
          TESTCONTAINERS_RYUK_DISABLED: false
          TESTCONTAINERS_POSTGRES_IMAGE: postgres:18.1
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./component_coverage.out
          flags: component

  # Stage 3: Contract Tests - Consumer
  contract-tests-consumer:
    name: Contract Tests (Consumer)
    runs-on: ubuntu-latest
    needs: unit-tests
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ env.GO_VERSION }}
      
      - name: Install Pact CLI
        run: |
          curl -fsSL https://raw.githubusercontent.com/pact-foundation/pact-ruby-standalone/master/install.sh | bash -s -- v${PACT_CLI_VERSION}
      
      - name: Run Consumer Contract Tests
        run: |
          go test -v -tags=contract_consumer ./tests/contract/consumer/...
      
      - name: Publish Pact to Broker
        run: |
          pact-broker publish ./pacts \
            --consumer-app-version=${{ github.sha }} \
            --broker-base-url=https://pact-broker.edumint.internal \
            --broker-token=${{ secrets.PACT_BROKER_TOKEN }}

  # Stage 4: Contract Tests - Provider
  contract-tests-provider:
    name: Contract Tests (Provider)
    runs-on: ubuntu-latest
    needs: component-tests
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ env.GO_VERSION }}
      
      - name: Start Docker (for Testcontainers)
        run: |
          sudo systemctl start docker
      
      - name: Run Provider Contract Tests
        run: |
          go test -v -tags=contract_provider ./tests/contract/provider/...
        env:
          PACT_BROKER_BASE_URL: https://pact-broker.edumint.internal
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}

  # Stage 5: Schema Validation
  schema-validation:
    name: Atlas Schema Validation
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Install Atlas
        run: |
          curl -sSf https://atlasgo.sh | sh -s -- --version ${ATLAS_CLI_VERSION}
      
      - name: Validate Schema
        run: |
          atlas schema inspect \
            --env local \
            --url "file://internal/db/schema"
      
      - name: Detect Breaking Changes
        run: |
          atlas migrate lint \
            --env production \
            --dev-url "docker://postgres/18.1" \
            --latest 1

  # Stage 6: Build & Push Image
  build-image:
    name: Build & Push Docker Image
    runs-on: ubuntu-latest
    needs: [component-tests, contract-tests-provider, schema-validation]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: edumint-prod
      
      - name: Configure Docker for GCR
        run: |
          gcloud auth configure-docker asia-northeast1-docker.pkg.dev
      
      - name: Build & Push
        run: |
          docker build -t asia-northeast1-docker.pkg.dev/edumint-prod/edumint-services/edumint-contents:${{ github.sha }} .
          docker push asia-northeast1-docker.pkg.dev/edumint-prod/edumint-services/edumint-contents:${{ github.sha }}
```

### Docker-in-Docker権限設定

**Cloud Build用（GCP）**

```yaml
# cloudbuild.yaml
steps:
  # Step 1: Run Component Tests with Docker-in-Docker
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'run'
      - '--privileged'
      - '-v'
      - '/var/run/docker.sock:/var/run/docker.sock'
      - 'golang:1.25.7'
      - 'go'
      - 'test'
      - '-v'
      - '-tags=component'
      - './tests/component/...'
    env:
      - 'TESTCONTAINERS_RYUK_DISABLED=false'
```

### マルチサービス並列テスト（v7.5.1追加）

複数のマイクロサービスを並列にテストする場合、Testcontainersのリソース制限を考慮する必要があります。

```yaml
# .github/workflows/multi_service_test.yml
name: Multi-Service Integration Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  service-tests:
    name: Service Test - ${{ matrix.service }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: 
          - edumintUsers
          - edumintContents
          - edumintFiles
          - edumintSearch
          - edumintSocial
      max-parallel: 2  # 同時実行数を制限（v7.5.1追加）
      fail-fast: false
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.25.7'
          cache: true
      
      - name: Start Docker
        run: |
          sudo systemctl start docker
          docker --version
      
      - name: Run Service Tests
        run: |
          cd services/${{ matrix.service }}
          go test -v -tags=component \
            -coverprofile=coverage.out \
            ./tests/component/...
        env:
          TESTCONTAINERS_RYUK_DISABLED: false
          TESTCONTAINERS_POSTGRES_IMAGE: postgres:18.1
          TESTCONTAINERS_KAFKA_IMAGE: confluentinc/cp-kafka:7.6.0
          TESTCONTAINERS_REDIS_IMAGE: redis:7.2
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./services/${{ matrix.service }}/coverage.out
          flags: ${{ matrix.service }}
```

#### **並列実行制限の理由（v7.5.1新設）**

##### リソース制約
- **GitHub Actions Runnerの同時コンテナ数制限**: 20個
- **各サービステストで使用するコンテナ**:
  - PostgreSQL: 1個
  - Kafka + Zookeeper: 2個
  - Redis: 1個
  - **合計**: 4個/サービス

##### 計算
- **5サービス全並列実行**: 4コンテナ × 5 = **20個（限界値）**
- **`max-parallel: 2`設定時**: 4コンテナ × 2 = **8個（安全）**

##### トレードオフ
- **実行時間**: 全並列（10分） → 2並列（15分）の5分増加
- **安定性**: コンテナ起動失敗率 30% → 5%に改善

##### モニタリング
```bash
# GitHub Actions実行ログで確認
grep "Error response from daemon" .github/workflows/*.log

# コンテナ起動失敗パターン
# "Cannot connect to the Docker daemon"
# "container failed to start within timeout"
```

##### 推奨設定
- **小規模プロジェクト（1-3サービス）**: `max-parallel: 3`
- **中規模プロジェクト（4-6サービス）**: `max-parallel: 2`（推奨）
- **大規模プロジェクト（7+サービス）**: `max-parallel: 1` または専用Runner使用

### Debeziumテスト戦略

**Outboxパターンの検証**

```go
// tests/component/outbox_pattern_test.go
func TestExamCreation_WritesToOutbox(t *testing.T) {
    t.Parallel()
    
    // Component Testでは、Outboxテーブルにレコードが書かれることまでを検証
    // 実際にKafkaに流れる部分はStaging環境で検証
    
    ctx := context.Background()
    db := setupTestDB(t)
    defer db.Cleanup()
    
    // 試験作成
    examID := uuid.NewV7()
    err := createExam(ctx, db.Pool, examID, "Test Exam")
    require.NoError(t, err)
    
    // Outboxテーブルにイベントが記録されているか確認
    var eventCount int
    err = db.Pool.QueryRow(ctx, `
        SELECT COUNT(*) FROM outbox_events
        WHERE aggregate_id = $1 AND event_type = 'ExamCreated'
    `, examID).Scan(&eventCount)
    
    require.NoError(t, err)
    assert.Equal(t, 1, eventCount)
    
    // Kafka送信の実際の動作はStaging環境の監視で担保
}
```

---

## **21.7 コーディング規約・ベストプラクティス (AI向け指示書)**

### 1. UUIDv7の使用

```go
// ✅ 正しい: UUIDv7を使用
import "github.com/google/uuid"

func generateID() uuid.UUID {
    return uuid.NewV7() // タイムスタンプベース、ソート可能
}

// ❌ 誤り: UUIDv4を使用（ランダム、インデックス断片化）
func generateID() uuid.UUID {
    return uuid.New() // UUIDv4相当、非推奨
}
```

**テストデータのID生成**

```go
// ✅ 正しい: 生成関数を通す
func TestCreateExam(t *testing.T) {
    examID := uuid.NewV7()
    // ...
}

// ❌ 誤り: ハードコードされたUUID
func TestCreateExam(t *testing.T) {
    examID := uuid.MustParse("123e4567-e89b-12d3-a456-426614174000")
    // ...
}
```

### 2. 時刻の扱い

```go
// ✅ 正しい: Clock DIパターン
type Clock interface {
    Now() time.Time
}

type RealClock struct{}

func (c *RealClock) Now() time.Time {
    return time.Now()
}

type FixedClock struct {
    FixedTime time.Time
}

func (c *FixedClock) Now() time.Time {
    return c.FixedTime
}

// テストコード
func TestCreateExam_WithFixedTime(t *testing.T) {
    clock := &FixedClock{FixedTime: time.Date(2026, 2, 6, 12, 0, 0, 0, time.UTC)}
    service := NewExamService(db, clock)
    
    exam, err := service.CreateExam(ctx, req)
    require.NoError(t, err)
    assert.Equal(t, clock.FixedTime, exam.CreatedAt)
}

// ❌ 誤り: time.Now()を直接使用
func TestCreateExam(t *testing.T) {
    before := time.Now()
    exam, _ := service.CreateExam(ctx, req)
    after := time.Now()
    
    // 不安定なテスト（Flaky）
    assert.True(t, exam.CreatedAt.After(before) && exam.CreatedAt.Before(after))
}
```

### 3. 並列実行

```go
// ✅ 正しい: t.Parallel()を使用
func TestUserOperations(t *testing.T) {
    t.Parallel() // テーブルレベルで並列実行
    
    t.Run("CreateUser", func(t *testing.T) {
        t.Parallel() // サブテストも並列実行
        // 独立したDBコンテナまたはトランザクションを使用
        db := setupTestDB(t)
        defer db.Cleanup()
        
        // ... テストロジック
    })
    
    t.Run("UpdateUser", func(t *testing.T) {
        t.Parallel()
        db := setupTestDB(t)
        defer db.Cleanup()
        
        // ... テストロジック
    })
}

// ❌ 誤り: 並列実行なし（実行時間が長い）
func TestUserOperations(t *testing.T) {
    t.Run("CreateUser", func(t *testing.T) {
        // ... テストロジック
    })
    
    t.Run("UpdateUser", func(t *testing.T) {
        // ... テストロジック
    })
}
```

### 4. Flaky Testの排除

```go
// ✅ 正しい: Eventuallyパターン（ポーリング）
func TestAsyncOperation(t *testing.T) {
    // 非同期処理をトリガー
    triggerAsyncJob(ctx, jobID)
    
    // 完了を待機（最大10秒、100msごとにチェック）
    require.Eventually(t, func() bool {
        status, _ := getJobStatus(ctx, jobID)
        return status == "completed"
    }, 10*time.Second, 100*time.Millisecond)
}

// ❌ 誤り: time.Sleep()を使用
func TestAsyncOperation(t *testing.T) {
    triggerAsyncJob(ctx, jobID)
    
    time.Sleep(5 * time.Second) // 固定待機（不安定）
    
    status, _ := getJobStatus(ctx, jobID)
    assert.Equal(t, "completed", status)
}
```

**チャネル同期パターン**

```go
// ✅ 正しい: チャネルで同期
func TestAsyncEventPublish(t *testing.T) {
    done := make(chan bool)
    
    // イベントリスナー
    go func() {
        event := <-eventChan
        assert.Equal(t, "ExamCreated", event.Type)
        done <- true
    }()
    
    // イベント発行
    publishEvent(ctx, ExamCreatedEvent{})
    
    // 完了待機（タイムアウト付き）
    select {
    case <-done:
        // テスト成功
    case <-time.After(5 * time.Second):
        t.Fatal("timeout waiting for event")
    }
}
```

### 5. 環境変数とDI

```go
// ✅ 正しい: 設定構造体を注入
type Config struct {
    DBHost     string
    DBPort     int
    DBName     string
    DBUser     string
    DBPassword string
}

func TestCreateUser_WithConfig(t *testing.T) {
    config := &Config{
        DBHost:     "localhost",
        DBPort:     5432,
        DBName:     "testdb",
        DBUser:     "testuser",
        DBPassword: "testpass",
    }
    
    service := NewUserService(config)
    // ... テストロジック
}

// ❌ 誤り: 環境変数に依存
func TestCreateUser(t *testing.T) {
    os.Setenv("DB_HOST", "localhost") // 副作用あり、並列実行不可
    defer os.Unsetenv("DB_HOST")
    
    service := NewUserService()
    // ... テストロジック
}
```

### 6. Table Driven Test

```go
// ✅ 正しい: Table Driven Test
func TestValidateEmail(t *testing.T) {
    t.Parallel()
    
    tests := []struct {
        name     string
        email    string
        wantErr  bool
        errMsg   string
    }{
        {
            name:    "valid email",
            email:   "test@example.com",
            wantErr: false,
        },
        {
            name:    "invalid format",
            email:   "invalid-email",
            wantErr: true,
            errMsg:  "invalid email format",
        },
        {
            name:    "empty email",
            email:   "",
            wantErr: true,
            errMsg:  "email is required",
        },
    }
    
    for _, tt := range tests {
        tt := tt // ループ変数のキャプチャ
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            
            err := ValidateEmail(tt.email)
            
            if tt.wantErr {
                require.Error(t, err)
                assert.Contains(t, err.Error(), tt.errMsg)
            } else {
                require.NoError(t, err)
            }
        })
    }
}
```

---

## **22. Goインテグレーション**

### 22.1 推奨プロジェクト構成

```
edumintContents/
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

### 22.4 ユーザー履歴取得サービス（v7.4.0追加）

#### **広告視聴進捗管理サービス**

```go
// internal/service/user_history_service.go
package service

import (
    "context"
    "fmt"
    "time"
    
    "github.com/edumint/edumint-content/internal/db/dbgen"
    "github.com/google/uuid"
)

// UserHistoryService: ユーザー履歴・広告視聴進捗管理
type UserHistoryService struct {
    queries *dbgen.Queries
}

func NewUserHistoryService(queries *dbgen.Queries) *UserHistoryService {
    return &UserHistoryService{
        queries: queries,
    }
}

// ViewingHistoryEntry: 閲覧履歴エントリー（広告視聴進捗含む）
type ViewingHistoryEntry struct {
    ExamID              string    `json:"exam_id"`
    ExamPublicID        string    `json:"exam_public_id"`
    ExamTitle           string    `json:"exam_title"`
    InteractionType     string    `json:"interaction_type"`
    ViewedAt            time.Time `json:"viewed_at"`
    ViewCount           int32     `json:"view_count"`
    LikeCount           int32     `json:"like_count"`
    
    // 広告視聴進捗（v7.4.0）
    AdProgress          *AdViewingProgress `json:"ad_progress,omitempty"`
}

type AdViewingProgress struct {
    QuestionViewCompleted      bool   `json:"question_view_completed"`
    AnswerExplanationCompleted bool   `json:"answer_explanation_completed"`
    DownloadCompleted          bool   `json:"download_completed"`
    TotalViewCount             int32  `json:"total_view_count"`
}

// GetUserViewingHistory: ユーザーの閲覧履歴取得（広告視聴進捗含む）
func (s *UserHistoryService) GetUserViewingHistory(
    ctx context.Context,
    userID string,
    limit int32,
) ([]ViewingHistoryEntry, error) {
    
    userUUID, err := uuid.Parse(userID)
    if err != nil {
        return nil, fmt.Errorf("invalid user ID: %w", err)
    }
    
    // 閲覧履歴取得
    histories, err := s.queries.GetUserViewingHistory(ctx, dbgen.GetUserViewingHistoryParams{
        UserID: userUUID,
        Limit:  limit,
    })
    if err != nil {
        return nil, fmt.Errorf("failed to get viewing history: %w", err)
    }
    
    result := make([]ViewingHistoryEntry, 0, len(histories))
    
    for _, h := range histories {
        entry := ViewingHistoryEntry{
            ExamID:          h.ExamID.String(),
            ExamPublicID:    h.ExamPublicID,
            ExamTitle:       h.ExamTitle,
            InteractionType: string(h.InteractionType),
            ViewedAt:        h.CreatedAt,
            ViewCount:       h.ViewCount,
            LikeCount:       h.LikeCount,
        }
        
        // 広告視聴進捗を取得（存在する場合）
        if h.HasAdProgress.Bool {
            entry.AdProgress = &AdViewingProgress{
                QuestionViewCompleted:      h.QuestionViewCompleted.Bool,
                AnswerExplanationCompleted: h.AnswerExplanationCompleted.Bool,
                DownloadCompleted:          h.DownloadCompleted.Bool,
                TotalViewCount:             h.AdTotalViewCount.Int32,
            }
        }
        
        result = append(result, entry)
    }
    
    return result, nil
}

// UpdateAdViewingProgress: 広告視聴進捗更新
func (s *UserHistoryService) UpdateAdViewingProgress(
    ctx context.Context,
    userID string,
    examID string,
    stage string,
) error {
    
    userUUID, err := uuid.Parse(userID)
    if err != nil {
        return fmt.Errorf("invalid user ID: %w", err)
    }
    
    examUUID, err := uuid.Parse(examID)
    if err != nil {
        return fmt.Errorf("invalid exam ID: %w", err)
    }
    
    stageEnum := dbgen.AdDisplayStageEnum(stage)
    if !stageEnum.Valid() {
        return fmt.Errorf("invalid stage: %s", stage)
    }
    
    return s.queries.UpsertAdViewingProgress(ctx, dbgen.UpsertAdViewingProgressParams{
        UserID:          userUUID,
        ExamID:          examUUID,
        LastViewedStage: stageEnum,
    })
}

// ShouldShowAd: 広告表示判定（スキップロジック）
func (s *UserHistoryService) ShouldShowAd(
    ctx context.Context,
    userID string,
    examID string,
    stage string,
) (bool, error) {
    
    userUUID, err := uuid.Parse(userID)
    if err != nil {
        return false, fmt.Errorf("invalid user ID: %w", err)
    }
    
    examUUID, err := uuid.Parse(examID)
    if err != nil {
        return false, fmt.Errorf("invalid exam ID: %w", err)
    }
    
    progress, err := s.queries.GetAdViewingProgress(ctx, dbgen.GetAdViewingProgressParams{
        UserID: userUUID,
        ExamID: examUUID,
    })
    
    // 初回閲覧の場合は広告を表示
    if err != nil {
        return true, nil
    }
    
    // 段階別のスキップロジック
    switch stage {
    case "question_view":
        return !progress.QuestionViewCompleted, nil
    case "answer_explanation":
        return !progress.AnswerExplanationCompleted, nil
    case "download":
        return !progress.DownloadCompleted, nil
    default:
        return false, fmt.Errorf("invalid stage: %s", stage)
    }
}
```

#### **対応するsqlcクエリ定義**

```sql
-- internal/db/queries/user_history.sql

-- name: GetUserViewingHistory :many
SELECT 
  eie.exam_id,
  e.public_id as exam_public_id,
  e.title as exam_title,
  eie.interaction_type,
  eie.created_at,
  es.view_count,
  es.like_count,
  avp.question_view_completed,
  avp.answer_explanation_completed,
  avp.download_completed,
  avp.total_view_count as ad_total_view_count,
  (avp.id IS NOT NULL) as has_ad_progress
FROM exam_interaction_events eie
JOIN exams e ON e.id = eie.exam_id
JOIN exam_statistics es ON es.exam_id = eie.exam_id
LEFT JOIN ad_viewing_progress avp ON avp.user_id = eie.user_id AND avp.exam_id = eie.exam_id
WHERE eie.user_id = $1
  AND eie.interaction_type IN ('view', 'like', 'bad', 'comment')
ORDER BY eie.created_at DESC
LIMIT $2;

-- name: GetAdViewingProgress :one
SELECT 
  id,
  user_id,
  exam_id,
  last_viewed_stage,
  question_view_completed,
  answer_explanation_completed,
  download_completed,
  total_view_count,
  first_viewed_at,
  last_viewed_at
FROM ad_viewing_progress
WHERE user_id = $1 AND exam_id = $2;

-- name: UpsertAdViewingProgress :exec
INSERT INTO ad_viewing_progress (
  user_id,
  exam_id,
  last_viewed_stage,
  question_view_completed,
  answer_explanation_completed,
  download_completed,
  total_view_count,
  first_viewed_at,
  last_viewed_at
) VALUES (
  $1, $2, $3,
  ($3 = 'question_view'),
  ($3 = 'answer_explanation'),
  ($3 = 'download'),
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (user_id, exam_id)
DO UPDATE SET
  last_viewed_stage = EXCLUDED.last_viewed_stage,
  question_view_completed = ad_viewing_progress.question_view_completed OR EXCLUDED.question_view_completed,
  answer_explanation_completed = ad_viewing_progress.answer_explanation_completed OR EXCLUDED.answer_explanation_completed,
  download_completed = ad_viewing_progress.download_completed OR EXCLUDED.download_completed,
  total_view_count = ad_viewing_progress.total_view_count + 1,
  last_viewed_at = CURRENT_TIMESTAMP,
  updated_at = CURRENT_TIMESTAMP;
```

### 22.5 国際化対応サービス（v7.4.0追加）

#### **機関情報多言語取得サービス**

```go
// internal/service/institution_service.go
package service

import (
    "context"
    "fmt"
    
    "github.com/edumint/edumint-content/internal/db/dbgen"
    "github.com/google/uuid"
)

// InstitutionService: 機関情報管理（国際化対応）
type InstitutionService struct {
    queries *dbgen.Queries
}

func NewInstitutionService(queries *dbgen.Queries) *InstitutionService {
    return &InstitutionService{
        queries: queries,
    }
}

// InstitutionDetail: 機関詳細（多言語対応）
type InstitutionDetail struct {
    ID              string `json:"id"`
    PublicID        string `json:"public_id"`
    Name            string `json:"name"`             // 英語名（SEO）
    DisplayName     string `json:"display_name"`     // 表示名（多言語）
    DisplayLanguage string `json:"display_language"` // 表示言語
    CountryCode     string `json:"region_code"`     // 国コード
    InstitutionType string `json:"institution_type"`
    Prefecture      string `json:"prefecture,omitempty"`
    Address         string `json:"address,omitempty"`
    WebsiteURL      string `json:"website_url,omitempty"`
}

// GetInstitutionByID: 機関情報取得（多言語対応）
func (s *InstitutionService) GetInstitutionByID(
    ctx context.Context,
    institutionID string,
) (*InstitutionDetail, error) {
    
    id, err := uuid.Parse(institutionID)
    if err != nil {
        return nil, fmt.Errorf("invalid institution ID: %w", err)
    }
    
    inst, err := s.queries.GetInstitutionByID(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("failed to get institution: %w", err)
    }
    
    return &InstitutionDetail{
        ID:              inst.ID.String(),
        PublicID:        inst.PublicID,
        Name:            inst.Name,
        DisplayName:     inst.DisplayName,
        DisplayLanguage: inst.DisplayLanguage,
        CountryCode:     inst.CountryCode,
        InstitutionType: string(inst.InstitutionType),
        Prefecture:      inst.Prefecture.String,
        Address:         inst.Address.String,
        WebsiteURL:      inst.WebsiteUrl.String,
    }, nil
}

// SearchInstitutions: 機関検索（多言語対応、英語名・表示名の両方を検索）
func (s *InstitutionService) SearchInstitutions(
    ctx context.Context,
    query string,
    limit int32,
) ([]InstitutionDetail, error) {
    
    results, err := s.queries.SearchInstitutionsByName(ctx, dbgen.SearchInstitutionsByNameParams{
        Query: query,
        Limit: limit,
    })
    if err != nil {
        return nil, fmt.Errorf("failed to search institutions: %w", err)
    }
    
    institutions := make([]InstitutionDetail, 0, len(results))
    for _, inst := range results {
        institutions = append(institutions, InstitutionDetail{
            ID:              inst.ID.String(),
            PublicID:        inst.PublicID,
            Name:            inst.Name,
            DisplayName:     inst.DisplayName,
            DisplayLanguage: inst.DisplayLanguage,
            CountryCode:     inst.CountryCode,
            InstitutionType: string(inst.InstitutionType),
        })
    }
    
    return institutions, nil
}

// ListInstitutionsByCountry: 国別機関一覧取得
func (s *InstitutionService) ListInstitutionsByCountry(
    ctx context.Context,
    countryCode string,
    limit int32,
    offset int32,
) ([]InstitutionDetail, error) {
    
    results, err := s.queries.ListInstitutionsByCountry(ctx, dbgen.ListInstitutionsByCountryParams{
        CountryCode: countryCode,
        Limit:       limit,
        Offset:      offset,
    })
    if err != nil {
        return nil, fmt.Errorf("failed to list institutions: %w", err)
    }
    
    institutions := make([]InstitutionDetail, 0, len(results))
    for _, inst := range results {
        institutions = append(institutions, InstitutionDetail{
            ID:              inst.ID.String(),
            PublicID:        inst.PublicID,
            Name:            inst.Name,
            DisplayName:     inst.DisplayName,
            DisplayLanguage: inst.DisplayLanguage,
            CountryCode:     inst.CountryCode,
            InstitutionType: string(inst.InstitutionType),
            Prefecture:      inst.Prefecture.String,
        })
    }
    
    return institutions, nil
}
```

### 22.6 試験生成フロー実装（v7.4.1追加）

#### **OCR結果結合サービス**

複数ファイルのOCR結果を1つのマスターOCRコンテンツに結合します。

```go
// internal/service/ocr_combiner_service.go
package service

import (
    "context"
    "fmt"
    "strings"
    
    "github.com/edumint/edumint-content/internal/db/dbgen"
    "github.com/google/uuid"
)

type OCRCombinerService struct {
    queries *dbgen.Queries
}

func NewOCRCombinerService(queries *dbgen.Queries) *OCRCombinerService {
    return &OCRCombinerService{queries: queries}
}

// CombineOCRResults: 複数ファイルのOCR結果を結合してマスターOCRコンテンツを作成
func (s *OCRCombinerService) CombineOCRResults(
    ctx context.Context,
    req CombineOCRRequest,
) (*dbgen.MasterOcrContent, error) {
    
    // 1. ファイルIDの存在確認（参照整合性検証）
    for _, fileID := range req.SourceFileIDs {
        exists, err := s.validateFileExists(ctx, fileID)
        if err != nil {
            return nil, fmt.Errorf("failed to validate file %s: %w", fileID, err)
        }
        if !exists {
            return nil, fmt.Errorf("file not found: %s", fileID)
        }
    }
    
    // 2. 各ファイルのOCR結果を取得
    var combinedText strings.Builder
    for i, fileID := range req.SourceFileIDs {
        // edumintFiles サービスからOCR結果を取得
        ocrResult, err := s.getOCRResultFromFile(ctx, fileID)
        if err != nil {
            return nil, fmt.Errorf("failed to get OCR for file %s: %w", fileID, err)
        }
        
        // ファイル区切りを追加
        if i > 0 {
            combinedText.WriteString("\n\n--- ファイル ")
            combinedText.WriteString(fmt.Sprintf("%d", i+1))
            combinedText.WriteString(" ---\n\n")
        }
        
        combinedText.WriteString(ocrResult)
    }
    
    // テキスト入力がある場合は追加
    if req.HasTextInput && req.TextInputContent != "" {
        combinedText.WriteString("\n\n--- ユーザー入力テキスト ---\n\n")
        combinedText.WriteString(req.TextInputContent)
    }
    
    // master_ocr_contents レコード作成
    ocr, err := s.queries.InsertExerciseOCR(ctx, dbgen.InsertExerciseOCRParams{
        PublicID:         req.PublicID,
        ContentType:      dbgen.OcrContentTypeEnumExercises,
        UploaderID:       req.UploaderID,
        SourceFileIDs:    req.SourceFileIDs,
        SourceFileCount:  int32(len(req.SourceFileIDs)),
        HasTextInput:     req.HasTextInput && req.TextInputContent != "",
        TextInputContent: sql.NullString{
            String: req.TextInputContent,
            Valid:  req.HasTextInput && req.TextInputContent != "",
        },
        OcrText:      combinedText.String(),
        LanguageCode: req.LanguageCode,
    })
    
    if err != nil {
        return nil, fmt.Errorf("failed to insert OCR content: %w", err)
    }
    
    return ocr, nil
}

// validateFileExists: ファイルIDの存在確認
func (s *OCRCombinerService) validateFileExists(
    ctx context.Context,
    fileID uuid.UUID,
) (bool, error) {
    // TODO: edumintFiles サービスのAPIを呼び出してファイルの存在を確認
    // 例: resp, err := s.filesClient.FileExists(ctx, &files.FileExistsRequest{FileID: fileID.String()})
    return true, nil
}

// getOCRResultFromFile: edumintFiles サービスからOCR結果を取得
func (s *OCRCombinerService) getOCRResultFromFile(
    ctx context.Context,
    fileID uuid.UUID,
) (string, error) {
    // TODO: 実装が必要（edumintFilesサービスAPI仕様が確定後に実装）
    // edumintFiles サービスのAPIを呼び出してOCRテキストを取得
    // または、file_metadata テーブルに保存されたOCRテキストを取得
    // 
    // 実装例: 
    // resp, err := s.filesClient.GetFileOCRText(ctx, &files.GetOCRRequest{
    //     FileID: fileID.String(),
    // })
    // if err != nil {
    //     return "", fmt.Errorf("failed to get OCR text: %w", err)
    // }
    // return resp.OcrText, nil
    return "", fmt.Errorf("not implemented: getOCRResultFromFile - requires edumintFiles API integration")
}

type CombineOCRRequest struct {
    PublicID         string
    UploaderID       uuid.UUID
    SourceFileIDs    []uuid.UUID
    HasTextInput     bool
    TextInputContent string
    LanguageCode     string
}
```

#### **Exam生成サービス**

master_ocr_contentsからExamレコードを生成し、双方向参照を確立します。

```go
// internal/service/exam_generator_service.go
package service

import (
    "context"
    "fmt"
    
    "github.com/edumint/edumint-content/internal/db/dbgen"
    "github.com/google/uuid"
)

type ExamGeneratorService struct {
    queries     *dbgen.Queries
    aiAnalyzer  AIAnalyzerClient
}

func NewExamGeneratorService(
    queries *dbgen.Queries,
    aiAnalyzer AIAnalyzerClient,
) *ExamGeneratorService {
    return &ExamGeneratorService{
        queries:    queries,
        aiAnalyzer: aiAnalyzer,
    }
}

// CreateExamFromOCR: master_ocr_contentsからExamを生成
func (s *ExamGeneratorService) CreateExamFromOCR(
    ctx context.Context,
    ocrContentID uuid.UUID,
) (*dbgen.Exam, error) {
    
    // 1. master_ocr_contents からOCRテキストを取得
    ocrContent, err := s.queries.GetOCRByID(ctx, ocrContentID)
    if err != nil {
        return nil, fmt.Errorf("failed to get OCR content: %w", err)
    }
    
    // 2. AI構造分析: OCRテキストから試験情報を抽出
    examData, err := s.aiAnalyzer.AnalyzeExamStructure(ctx, AnalyzeRequest{
        OCRText:      ocrContent.OcrText,
        LanguageCode: ocrContent.LanguageCode,
        UploaderID:   ocrContent.UploaderID,
    })
    if err != nil {
        return nil, fmt.Errorf("AI analysis failed: %w", err)
    }
    
    // 3. トランザクション開始
    tx, err := s.queries.BeginTx(ctx)
    if err != nil {
        return nil, fmt.Errorf("failed to begin transaction: %w", err)
    }
    defer tx.Rollback(ctx)
    
    qtx := s.queries.WithTx(tx)
    
    // 4. exams レコード作成
    exam, err := qtx.InsertExam(ctx, dbgen.InsertExamParams{
        PublicID:           examData.PublicID,
        SubjectID:          examData.SubjectID,
        TeacherID:          uuid.NullUUID{UUID: examData.TeacherID, Valid: examData.TeacherID != uuid.Nil},
        UploaderID:         ocrContent.UploaderID,
        Title:              examData.Title,
        AcademicYear:       examData.AcademicYear,
        Semester:           examData.Semester,
        ExamType:           examData.ExamType,
        MasterOcrContentID: uuid.NullUUID{UUID: ocrContentID, Valid: true},
        Status:             dbgen.ExamStatusEnumDraft,
        DisplayLanguage:    ocrContent.LanguageCode,
        AiGenerated:        true,
    })
    if err != nil {
        return nil, fmt.Errorf("failed to insert exam: %w", err)
    }
    
    // 5. master_ocr_contents の exam_id を更新（双方向参照）
    err = qtx.UpdateOCRExamID(ctx, dbgen.UpdateOCRExamIDParams{
        ExamID: exam.ID,
        ID:     ocrContentID,
    })
    if err != nil {
        return nil, fmt.Errorf("failed to update OCR exam_id: %w", err)
    }
    
    // 6. 問題レコードを作成
    for i, question := range examData.Questions {
        _, err := qtx.InsertQuestion(ctx, dbgen.InsertQuestionParams{
            PublicID:     question.PublicID,
            ExamID:       exam.ID,
            SortOrder:    int32(i + 1),
            QuestionType: question.QuestionType,
            QuestionText: question.QuestionText,
            Options:      question.Options,
            CorrectAnswer: question.CorrectAnswer,
            Explanation:  question.Explanation,
            DifficultyLevel: question.DifficultyLevel,
        })
        if err != nil {
            return nil, fmt.Errorf("failed to insert question %d: %w", i, err)
        }
    }
    
    // 7. コミット
    if err := tx.Commit(ctx); err != nil {
        return nil, fmt.Errorf("failed to commit transaction: %w", err)
    }
    
    return exam, nil
}

// AIAnalyzerClient: AI構造分析クライアント（インターフェース）
type AIAnalyzerClient interface {
    AnalyzeExamStructure(ctx context.Context, req AnalyzeRequest) (*AnalyzeResponse, error)
}

type AnalyzeRequest struct {
    OCRText      string
    LanguageCode string
    UploaderID   uuid.UUID
}

type AnalyzeResponse struct {
    PublicID     string
    SubjectID    uuid.UUID
    TeacherID    uuid.UUID
    Title        string
    AcademicYear int32
    Semester     dbgen.SemesterEnum
    ExamType     dbgen.ExamTypeEnum
    Questions    []QuestionData
}

type QuestionData struct {
    PublicID        string
    QuestionType    dbgen.QuestionTypeEnum
    QuestionText    string
    Options         json.RawMessage // JSONB - 選択肢データ
    CorrectAnswer   json.RawMessage // JSONB - 正解データ
    Explanation     string
    DifficultyLevel dbgen.DifficultyLevelEnum
}
```

#### **統合エンドポイント実装**

```go
// internal/api/handlers/exam_upload_handler.go
package handlers

import (
    "net/http"
    
    "github.com/edumint/edumint-content/internal/service"
    "github.com/labstack/echo/v5"
)

type ExamUploadHandler struct {
    combiner  *service.OCRCombinerService
    generator *service.ExamGeneratorService
}

func NewExamUploadHandler(
    combiner *service.OCRCombinerService,
    generator *service.ExamGeneratorService,
) *ExamUploadHandler {
    return &ExamUploadHandler{
        combiner:  combiner,
        generator: generator,
    }
}

// UploadExam: 試験アップロード（複数ファイル + オプションテキスト → Exam生成）
func (h *ExamUploadHandler) UploadExam(c echo.Context) error {
    ctx := c.Request().Context()
    
    // リクエスト解析
    var req UploadExamRequest
    if err := c.Bind(&req); err != nil {
        return c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid request"})
    }
    
    // 1. OCR結果結合
    ocrContent, err := h.combiner.CombineOCRResults(ctx, service.CombineOCRRequest{
        PublicID:         req.PublicID,
        UploaderID:       req.UploaderID,
        SourceFileIDs:    req.FileIDs,
        HasTextInput:     req.TextInput != "",
        TextInputContent: req.TextInput,
        LanguageCode:     req.LanguageCode,
    })
    if err != nil {
        return c.JSON(http.StatusInternalServerError, ErrorResponse{
            Error: "OCR combination failed",
        })
    }
    
    // 2. Exam生成
    exam, err := h.generator.CreateExamFromOCR(ctx, ocrContent.ID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, ErrorResponse{
            Error: "Exam generation failed",
        })
    }
    
    return c.JSON(http.StatusCreated, UploadExamResponse{
        ExamID:           exam.PublicID,
        MasterOCRContentID: ocrContent.PublicID,
        Status:           string(exam.Status),
        CreatedAt:        exam.CreatedAt,
    })
}

type UploadExamRequest struct {
    PublicID     string      `json:"public_id"`
    UploaderID   uuid.UUID   `json:"uploader_id"`
    FileIDs      []uuid.UUID `json:"file_ids"`
    TextInput    string      `json:"text_input,omitempty"`
    LanguageCode string      `json:"language_code"`
}

type UploadExamResponse struct {
    ExamID             string    `json:"exam_id"`
    MasterOCRContentID string    `json:"master_ocr_content_id"`
    Status             string    `json:"status"`
    CreatedAt          time.Time `json:"created_at"`
}

type ErrorResponse struct {
    Error string `json:"error"`
}
```

---

### 22.7 段階的コンテンツ開示API設計（v7.4.1新設）

#### **初期表示API**

段階的コンテンツ開示戦略に基づき、大問1の全文+大問2以降の構造のみを返します。

```go
// internal/api/handlers/content_disclosure_handler.go
package handlers

import (
    "net/http"
    
    "github.com/edumint/edumint-content/internal/service"
    "github.com/labstack/echo/v5"
)

type ContentDisclosureHandler struct {
    adService      *service.AdService
    contentService *service.ContentService
}

func NewContentDisclosureHandler(
    adService *service.AdService,
    contentService *service.ContentService,
) *ContentDisclosureHandler {
    return &ContentDisclosureHandler{
        adService:      adService,
        contentService: contentService,
    }
}

// GetInitialContent: 初期表示（大問1全文+大問2以降構造のみ）
// GET /api/v1/exams/{exam_public_id}/initial
func (h *ContentDisclosureHandler) GetInitialContent(c echo.Context) error {
    ctx := c.Request().Context()
    
    examPublicID := c.Param("exam_public_id")
    userID := c.Get("user_id").(string) // 認証ミドルウェアで設定
    
    // 1. 広告配信ステータスチェック（Redis優先）
    adConfig, err := h.adService.GetCurrentAdDeliveryConfig(ctx)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, ErrorResponse{
            Error: "failed to get ad config",
        })
    }
    
    // 2. ユーザー広告免除設定チェック（Redis優先）
    exemption, err := h.adService.GetUserAdExemption(ctx, userID)
    if err != nil {
        // 免除設定なし: デフォルトはstandard
        exemption = &service.UserAdExemption{
            ExemptionRole: "standard",
        }
    }
    
    // 3. 広告表示要否判定
    shouldShowAd := h.adService.ShouldShowAd(adConfig, exemption)
    
    // 4. コンテンツ取得（段階的開示）
    content, err := h.contentService.GetInitialContent(ctx, examPublicID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, ErrorResponse{
            Error: "failed to get content",
        })
    }
    
    return c.JSON(http.StatusOK, InitialContentResponse{
        ExamID:       content.ExamID,
        ExamTitle:    content.ExamTitle,
        Question1:    content.Question1, // 大問1全文
        OtherQuestions: content.OtherQuestions, // 大問2以降は構造のみ
        RequireAd:    shouldShowAd,
        AdProviderConfig: map[string]interface{}{
            "status": adConfig.Status,
            "provider": "google_admob", // 実際の広告プロバイダー
        },
    })
}

type InitialContentResponse struct {
    ExamID         string                   `json:"exam_id"`
    ExamTitle      string                   `json:"exam_title"`
    Question1      *QuestionDetail          `json:"question_1"` // 大問1全文
    OtherQuestions []QuestionStructureOnly  `json:"other_questions"` // 構造のみ
    RequireAd      bool                     `json:"require_ad"`
    AdProviderConfig map[string]interface{} `json:"ad_provider_config,omitempty"`
}

type QuestionDetail struct {
    QuestionNumber int             `json:"question_number"`
    Title          string          `json:"title"`
    Content        string          `json:"content"` // 全文
    SubQuestions   []SubQuestion   `json:"sub_questions"`
}

type QuestionStructureOnly struct {
    QuestionNumber int    `json:"question_number"`
    Title          string `json:"title"`
    SubQuestionCount int  `json:"sub_question_count"` // 小問の数のみ
}

type SubQuestion struct {
    SubQuestionNumber int    `json:"sub_question_number"`
    Content           string `json:"content"`
}
```

#### **広告視聴完了通知API**

広告視聴完了後、コンテンツ解除トークンを発行します。

```go
// CompleteAdView: 広告視聴完了通知
// POST /api/v1/ads/view-completed
func (h *ContentDisclosureHandler) CompleteAdView(c echo.Context) error {
    ctx := c.Request().Context()
    
    var req AdViewCompletedRequest
    if err := c.Bind(&req); err != nil {
        return c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid request"})
    }
    
    userID := c.Get("user_id").(string)
    
    // 1. レート制限チェック（1分に5回まで）
    if err := h.adService.CheckAdCompleteRateLimit(ctx, userID); err != nil {
        return c.JSON(http.StatusTooManyRequests, ErrorResponse{
            Error: "rate limit exceeded",
        })
    }
    
    // 2. 広告視聴イベント記録
    adEvent, err := h.adService.RecordAdDisplayEvent(ctx, service.RecordAdDisplayEventRequest{
        UserID:       userID,
        ExamID:       req.ExamID,
        DisplayStage: req.DisplayStage,
        AdProviderID: req.AdProviderID,
        AdUnitID:     req.AdUnitID,
    })
    if err != nil {
        return c.JSON(http.StatusInternalServerError, ErrorResponse{
            Error: "failed to record ad event",
        })
    }
    
    // 3. 広告視聴進捗更新
    if err := h.adService.UpdateAdViewingProgress(ctx, userID, req.ExamID, req.DisplayStage); err != nil {
        return c.JSON(http.StatusInternalServerError, ErrorResponse{
            Error: "failed to update ad progress",
        })
    }
    
    // 4. コンテンツ解除トークン発行
    token, err := h.contentService.IssueUnlockToken(ctx, service.IssueUnlockTokenRequest{
        UserID:           userID,
        ExamID:           req.ExamID,
        AdDisplayEventID: adEvent.ID,
    })
    if err != nil {
        return c.JSON(http.StatusInternalServerError, ErrorResponse{
            Error: "failed to issue unlock token",
        })
    }
    
    return c.JSON(http.StatusOK, AdViewCompletedResponse{
        UnlockToken: token.JWTToken, // JWT署名付きトークン
        ExpiresAt:   token.ExpiresAt,
    })
}

type AdViewCompletedRequest struct {
    ExamID       string `json:"exam_id"`
    DisplayStage string `json:"display_stage"` // "answer_explanation" or "download"
    AdProviderID string `json:"ad_provider_id"`
    AdUnitID     string `json:"ad_unit_id"`
}

type AdViewCompletedResponse struct {
    UnlockToken string    `json:"unlock_token"` // JWT
    ExpiresAt   time.Time `json:"expires_at"`
}
```

#### **コンテンツ解除API**

トークンを検証してコンテンツを解除します。

```go
// UnlockContent: コンテンツ解除（トークン検証）
// POST /api/v1/exams/{exam_public_id}/unlock
func (h *ContentDisclosureHandler) UnlockContent(c echo.Context) error {
    ctx := c.Request().Context()
    
    examPublicID := c.Param("exam_public_id")
    userID := c.Get("user_id").(string)
    
    var req UnlockContentRequest
    if err := c.Bind(&req); err != nil {
        return c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid request"})
    }
    
    // 1. レート制限チェック（1時間に5回まで）
    if err := h.contentService.CheckTokenIssueRateLimit(ctx, userID, examPublicID); err != nil {
        return c.JSON(http.StatusTooManyRequests, ErrorResponse{
            Error: "rate limit exceeded",
        })
    }
    
    // 2. トークン検証
    token, err := h.contentService.VerifyUnlockToken(ctx, service.VerifyUnlockTokenRequest{
        TokenJWT: req.UnlockToken,
        UserID:   userID,
        ExamID:   examPublicID,
    })
    if err != nil {
        return c.JSON(http.StatusUnauthorized, ErrorResponse{
            Error: "invalid or expired token",
        })
    }
    
    // 3. トークンアクセス回数インクリメント（不正検出）
    if err := h.contentService.IncrementTokenAccessCount(ctx, token.ID, c.RealIP()); err != nil {
        return c.JSON(http.StatusForbidden, ErrorResponse{
            Error: "token reuse detected",
        })
    }
    
    // 4. 完全なコンテンツ取得
    content, err := h.contentService.GetFullContent(ctx, examPublicID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, ErrorResponse{
            Error: "failed to get content",
        })
    }
    
    return c.JSON(http.StatusOK, UnlockContentResponse{
        ExamID:    content.ExamID,
        ExamTitle: content.ExamTitle,
        Questions: content.Questions, // 全問題の全文
    })
}

type UnlockContentRequest struct {
    UnlockToken string `json:"unlock_token"` // JWT
}

type UnlockContentResponse struct {
    ExamID    string            `json:"exam_id"`
    ExamTitle string            `json:"exam_title"`
    Questions []QuestionDetail  `json:"questions"` // 全問題
}
```

#### **22.7.4 広告視聴完了の厳密な定義（v7.5.1新設）**

##### 設計背景
クライアント側のみの検証では、DevToolsでの不正操作やタブ切り替えでの回避が容易なため、サーバー側での多層検証を実装する。

##### サーバー側検証ロジック
```go
func (s *AdService) VerifyAdCompletion(ctx context.Context, eventID uuid.UUID) error {
    events, err := s.queries.GetAdViewingEvents(ctx, eventID)
    if err != nil {
        return fmt.Errorf("get ad viewing events: %w", err)
    }
    
    // 1. 最低視聴時間チェック（80%ルール）
    requiredSeconds := float64(events.AdDuration) * 0.8
    if events.TotalWatchedSeconds < requiredSeconds {
        return &AdVerificationError{
            Code:    "INSUFFICIENT_WATCH_TIME",
            Message: fmt.Sprintf("視聴時間不足: %.1f秒/%.1f秒必要", 
                                events.TotalWatchedSeconds, requiredSeconds),
        }
    }
    
    // 2. 進捗イベントの時系列整合性チェック
    if err := s.validateProgressSequence(events.ProgressEvents); err != nil {
        return &AdVerificationError{
            Code:    "INVALID_PROGRESS_SEQUENCE",
            Message: "不正な進捗報告パターンを検出",
            Details: err.Error(),
        }
    }
    
    // 3. ブラウザタブフォーカス喪失時間チェック
    if events.TotalBlurSeconds > 5 {
        return &AdVerificationError{
            Code:    "EXCESSIVE_BLUR",
            Message: fmt.Sprintf("タブ非表示時間超過: %.1f秒", events.TotalBlurSeconds),
        }
    }
    
    // 4. 進捗報告間隔の異常検出
    if events.AverageReportInterval > 5.0 {
        return &AdVerificationError{
            Code:    "ABNORMAL_REPORT_INTERVAL",
            Message: "進捗報告間隔が異常です",
        }
    }
    
    return nil
}

func (s *AdService) validateProgressSequence(events []AdProgressEvent) error {
    var lastProgress float64
    var lastTimestamp time.Time
    
    for i, event := range events {
        // 単調増加チェック
        if event.Progress < lastProgress {
            return fmt.Errorf("進捗が後退: [%d] %.1f%% -> %.1f%%", 
                            i, lastProgress, event.Progress)
        }
        
        // 時間的整合性チェック（3秒間隔で報告されるべき）
        if i > 0 {
            interval := event.Timestamp.Sub(lastTimestamp).Seconds()
            if interval < 2.0 || interval > 6.0 {
                return fmt.Errorf("異常な報告間隔: %.1f秒", interval)
            }
        }
        
        lastProgress = event.Progress
        lastTimestamp = event.Timestamp
    }
    
    return nil
}
```

##### 不正防止の実装詳細

###### クライアント側実装（JavaScript）
```typescript
class AdPlayerVerification {
  private progressInterval: NodeJS.Timeout;
  private blurStartTime: number | null = null;
  private totalBlurTime = 0;

  constructor(private eventID: string, private duration: number) {
    // Page Visibility API統合
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  startTracking() {
    // 3秒ごとに進捗報告
    this.progressInterval = setInterval(() => {
      const progress = this.getCurrentProgress();
      this.reportProgress(progress);
    }, 3000);
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.blurStartTime = Date.now();
    } else if (this.blurStartTime) {
      this.totalBlurTime += (Date.now() - this.blurStartTime) / 1000;
      this.blurStartTime = null;
    }
  };

  private async reportProgress(progress: number) {
    await fetch('/api/ads/progress', {
      method: 'POST',
      body: JSON.stringify({
        event_id: this.eventID,
        progress_percent: progress,
        blur_seconds: this.totalBlurTime,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  async complete() {
    clearInterval(this.progressInterval);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    // サーバー側検証実行
    const response = await fetch('/api/ads/verify', {
      method: 'POST',
      body: JSON.stringify({ event_id: this.eventID }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new AdVerificationError(error.code, error.message);
    }
  }
}
```

##### モニタリング指標（Prometheus）
```promql
# 広告視聴完了率
rate(ad_completion_total[5m]) / rate(ad_start_total[5m])

# 検証失敗率（不正試行の可能性）
rate(ad_verification_failed_total{reason="INSUFFICIENT_WATCH_TIME"}[5m])
rate(ad_verification_failed_total{reason="EXCESSIVE_BLUR"}[5m])
rate(ad_verification_failed_total{reason="INVALID_PROGRESS_SEQUENCE"}[5m])
```

##### Grafanaアラート設定
```yaml
alerts:
  - alert: HighAdVerificationFailureRate
    expr: rate(ad_verification_failed_total[5m]) > 0.3
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "広告検証失敗率が高い ({{ $value }})"
      description: "不正な広告視聴試行が増加している可能性"
```

---

### 22.8 不正防止戦略（v7.4.1新設）

#### **1. Dev機能での広告スキップ防止**

**問題:**
- ブラウザ開発者ツールでJavaScriptを操作し、広告視聴をスキップ

**対策:**
- **サーバーサイド検証**: 広告視聴完了はバックエンドで必ず検証
- **JWT署名**: トークンにHMAC-SHA256署名を付与、改竄不可
- **タイムスタンプ検証**: 視聴開始から完了までの時間が妥当かチェック

```go
// 広告視聴時間検証
func (s *AdService) ValidateAdViewDuration(startTime, endTime time.Time) error {
    duration := endTime.Sub(startTime)
    minDuration := 15 * time.Second // 広告最低視聴時間
    maxDuration := 120 * time.Second // 最大許容時間
    
    if duration < minDuration {
        return fmt.Errorf("ad view duration too short: %v", duration)
    }
    if duration > maxDuration {
        return fmt.Errorf("ad view duration too long: %v", duration)
    }
    
    return nil
}
```

#### **2. HTML確認でのコンテンツ取得防止**

**問題:**
- ブラウザ開発者ツールでDOMを確認し、隠されたコンテンツを閲覧

**対策:**
- **段階的配信**: 初期表示では大問1のみ送信、大問2以降は未送信
- **API分離**: 完全なコンテンツは別APIエンドポイントで提供
- **トークン必須**: 完全コンテンツAPIはトークン検証必須

#### **3. トークン再利用・改竄防止**

**問題:**
- トークンを保存して複数回使用、または改竄して不正利用

**対策:**
- **使い捨てトークン**: access_count = 1 で自動無効化
- **短時間有効**: 発行後5分間のみ有効
- **SHA-256ハッシュ**: トークンのハッシュをDBに保存、改竄検出

```go
// トークン検証
func (s *ContentService) VerifyUnlockToken(ctx context.Context, req VerifyUnlockTokenRequest) (*domain.ContentUnlockToken, error) {
    // 1. JWT検証
    claims, err := s.jwtService.VerifyToken(req.TokenJWT)
    if err != nil {
        return nil, fmt.Errorf("jwt verification failed: %w", err)
    }
    
    // 2. DB検証
    token, err := s.repo.GetTokenByPublicID(ctx, claims.TokenID)
    if err != nil {
        return nil, fmt.Errorf("token not found: %w", err)
    }
    
    // 3. ステータス確認
    if token.Status != "valid" {
        return nil, fmt.Errorf("token status invalid: %s", token.Status)
    }
    
    // 4. 有効期限確認
    if time.Now().After(token.ExpiresAt) {
        return nil, fmt.Errorf("token expired")
    }
    
    // 5. ユーザー・試験一致確認
    if token.UserID != req.UserID || token.ExamID != req.ExamID {
        return nil, fmt.Errorf("token mismatch")
    }
    
    return token, nil
}
```

#### **4. レート制限**

**対策:**
- **コンテンツアクセス**: 1時間に10回まで
- **トークン発行**: 1時間に5回まで
- **広告視聴完了通知**: 1分に5回まで

```go
// Redis実装（section 5.6参照）
func (s *RateLimitService) CheckLimit(ctx context.Context, key string, limit int64, window time.Duration) error {
    allowed, err := s.cache.CheckRateLimit(ctx, key, limit, window)
    if err != nil {
        return fmt.Errorf("rate limit check failed: %w", err)
    }
    if !allowed {
        return fmt.Errorf("rate limit exceeded")
    }
    return nil
}
```

#### **5. 異常アクセスパターン検出**

**対策:**
- **IPアドレス監視**: 同一IPから短時間に大量アクセス
- **ユーザー行動分析**: 人間らしくない操作パターン
- **機械学習**: 異常検出モデルでBot判定

```go
// 異常アクセス検出
func (s *SecurityService) DetectAbnormalAccess(ctx context.Context, userID string, examID string, ipAddress string) error {
    // 1. 同一IPからのアクセス回数チェック
    count, err := s.repo.GetAccessCountByIP(ctx, ipAddress, 1*time.Hour)
    if err != nil {
        return fmt.Errorf("failed to get access count: %w", err)
    }
    if count > 100 {
        return fmt.Errorf("too many accesses from same IP")
    }
    
    // 2. ユーザーの操作パターン分析
    pattern, err := s.analyzer.AnalyzeUserBehavior(ctx, userID)
    if err != nil {
        return fmt.Errorf("failed to analyze behavior: %w", err)
    }
    if pattern.IsSuspicious {
        return fmt.Errorf("suspicious user behavior detected")
    }
    
    return nil
}
```

### 22.8.6 異常アクセスパターン検出の具体的実装（v7.5.1新設）

#### 検知パターンと対応

##### パターン1: 短時間での大量トークン生成

**Redisカウンター実装:**
```go
// internal/service/ad_service.go
func (s *AdService) checkTokenGenerationRate(ctx context.Context, userID uuid.UUID) error {
    key := fmt.Sprintf("ad:token:rate:%s", userID.String())
    
    count, err := s.redis.Incr(ctx, key).Result()
    if err != nil {
        return fmt.Errorf("redis incr failed: %w", err)
    }
    
    // 初回アクセス時にTTL設定
    if count == 1 {
        s.redis.Expire(ctx, key, 1*time.Minute)
    }
    
    // 閾値: 1分間に5回以上トークン生成
    if count > 5 {
        s.logger.Warn("suspicious token generation rate detected",
            slog.String("user_id", userID.String()),
            slog.Int64("count", count),
        )
        
        // Prometheus メトリクス記録
        metrics.AdFraudDetected.WithLabelValues("excessive_token_generation").Inc()
        
        // 一時的にアカウント凍結（15分間）
        return s.blockUser(ctx, userID, 15*time.Minute, "suspicious_ad_token_generation")
    }
    
    return nil
}

// アカウント一時凍結
func (s *AdService) blockUser(ctx context.Context, userID uuid.UUID, duration time.Duration, reason string) error {
    blockKey := fmt.Sprintf("user:blocked:%s", userID.String())
    
    err := s.redis.Set(ctx, blockKey, reason, duration).Err()
    if err != nil {
        return err
    }
    
    // 監査ログ記録
    s.logger.Warn("user temporarily blocked",
        slog.String("user_id", userID.String()),
        slog.String("reason", reason),
        slog.Duration("duration", duration),
    )
    
    // edumintModerationへイベント送信
    return s.publishEvent(ctx, "user.blocked", map[string]interface{}{
        "user_id":  userID.String(),
        "reason":   reason,
        "duration": duration.String(),
    })
}
```

##### パターン2: トークン未使用での新規生成

**sqlcクエリ定義:**
```sql
-- name: CountUnusedTokens :one
SELECT COUNT(*) 
FROM content_unlock_tokens
WHERE user_id = $1 
  AND used_at IS NULL 
  AND expires_at > NOW();
```

**サービス層実装:**
```go
func (s *AdService) GenerateUnlockToken(ctx context.Context, req GenerateTokenRequest) (*Token, error) {
    // 1. 未使用トークン数チェック
    unusedCount, err := s.queries.CountUnusedTokens(ctx, req.UserID)
    if err != nil {
        return nil, fmt.Errorf("count unused tokens failed: %w", err)
    }
    
    if unusedCount >= 3 {
        s.logger.Warn("too many unused tokens",
            slog.String("user_id", req.UserID.String()),
            slog.Int64("unused_count", unusedCount),
        )
        return nil, errors.New("too many unused tokens: please use existing tokens first")
    }
    
    // 2. トークン生成レート制限チェック
    if err := s.checkTokenGenerationRate(ctx, req.UserID); err != nil {
        return nil, err
    }
    
    // 3. 正常処理: トークン生成
    tokenValue := gonanoid.Must(32)
    
    tokenID, err := s.queries.InsertUnlockToken(ctx, db.InsertUnlockTokenParams{
        UserID:    req.UserID,
        ExamID:    req.ExamID,
        Token:     tokenValue,
        ExpiresAt: time.Now().Add(10 * time.Minute),
    })
    
    if err != nil {
        return nil, fmt.Errorf("insert token failed: %w", err)
    }
    
    return &Token{
        TokenID:   tokenID,
        Token:     tokenValue,
        ExpiresAt: time.Now().Add(10 * time.Minute),
    }, nil
}
```

##### パターン3: 同一試験への異常アクセス頻度

**Redisレート制限:**
```go
func (s *ExamService) checkExamAccessRate(ctx context.Context, userID, examID uuid.UUID) error {
    key := fmt.Sprintf("exam:access:%s:%s", userID.String(), examID.String())
    
    count, err := s.redis.Incr(ctx, key).Result()
    if err != nil {
        return err
    }
    
    if count == 1 {
        s.redis.Expire(ctx, key, 1*time.Hour)
    }
    
    // 閾値: 1時間に10回以上アクセス
    if count > 10 {
        s.logger.Warn("suspicious exam access rate detected",
            slog.String("user_id", userID.String()),
            slog.String("exam_id", examID.String()),
            slog.Int64("count", count),
        )
        
        // Prometheus メトリクス
        metrics.AdFraudDetected.WithLabelValues("excessive_exam_access").Inc()
        
        // 通報システムに自動送信
        return s.reportSuspiciousActivity(ctx, userID, examID, "excessive_exam_access")
    }
    
    return nil
}

// 自動通報
func (s *ExamService) reportSuspiciousActivity(ctx context.Context, userID, examID uuid.UUID, activityType string) error {
    return s.publishEvent(ctx, "moderation.auto_report", map[string]interface{}{
        "user_id":       userID.String(),
        "exam_id":       examID.String(),
        "activity_type": activityType,
        "severity":      "medium",
        "auto_generated": true,
    })
}
```

#### モニタリングダッシュボード（Grafana）

**Prometheusメトリクス定義:**
```go
// internal/metrics/ad_metrics.go
package metrics

import "github.com/prometheus/client_golang/prometheus"

var (
    AdFraudDetected = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "edumint_ad_fraud_detected_total",
            Help: "Total number of ad fraud detections",
        },
        []string{"fraud_type"},
    )
    
    UserBlocked = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "edumint_user_blocked_total",
            Help: "Total number of users blocked",
        },
        []string{"block_reason"},
    )
    
    TokenGenerationRate = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "edumint_ad_token_generation_rate",
            Help:    "Rate of token generation per user",
            Buckets: prometheus.LinearBuckets(0, 1, 10),
        },
        []string{"user_id"},
    )
)

func init() {
    prometheus.MustRegister(AdFraudDetected)
    prometheus.MustRegister(UserBlocked)
    prometheus.MustRegister(TokenGenerationRate)
}
```

**Grafanaダッシュボードクエリ:**
```promql
# 不正検知アラート数（1時間あたり）
sum(rate(edumint_ad_fraud_detected_total[1h])) by (fraud_type)

# ユーザー凍結数（日次）
sum(increase(edumint_user_blocked_total[24h])) by (block_reason)

# トークン生成レート異常（1分間に5回以上）
count(rate(edumint_ad_token_generated_total[1m]) > 5) by (user_id)

# 試験アクセス異常（1時間に10回以上）
count(rate(edumint_exam_access_total[1h]) > 10) by (user_id, exam_id)
```

#### 手動レビュー対象の自動抽出

**日次バッチSQL:**
```sql
-- sqlc: name: GetSuspiciousAccounts :many
-- 疑わしいアカウントの日次レポート
SELECT 
  user_id,
  COUNT(DISTINCT exam_id) AS unique_exams_accessed,
  COUNT(*) AS total_token_generations,
  COUNT(*) FILTER (WHERE used_at IS NULL) AS unused_tokens,
  AVG(EXTRACT(EPOCH FROM (used_at - created_at))) AS avg_token_use_delay_sec,
  MIN(created_at) AS first_activity,
  MAX(created_at) AS last_activity
FROM content_unlock_tokens
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY user_id
HAVING 
  COUNT(*) > 50 -- 1日50回以上トークン生成
  OR COUNT(*) FILTER (WHERE used_at IS NULL) > 10 -- 未使用トークン10個以上
  OR AVG(EXTRACT(EPOCH FROM (used_at - created_at))) < 5 -- 平均使用までの時間が5秒未満
ORDER BY total_token_generations DESC;
```

**バッチ実装:**
```go
// cmd/batch/suspicious_accounts_report.go
func main() {
    ctx := context.Background()
    queries := db.New(dbConn)
    
    // 疑わしいアカウント抽出
    accounts, err := queries.GetSuspiciousAccounts(ctx)
    if err != nil {
        log.Fatal(err)
    }
    
    // レポート生成
    report := generateReport(accounts)
    
    // Slack通知
    sendSlackAlert(report)
    
    // BigQueryエクスポート
    exportToBigQuery(accounts)
}
```

#### アラート設定

**Alertmanager設定:**
```yaml
groups:
- name: ad_fraud_detection
  interval: 1m
  rules:
  - alert: HighTokenGenerationRate
    expr: rate(edumint_ad_token_generated_total[1m]) > 5
    for: 1m
    labels:
      severity: warning
    annotations:
      summary: "High token generation rate detected"
      description: "User {{ $labels.user_id }} is generating tokens at {{ $value }} tokens/min"
  
  - alert: ExcessiveUserBlocking
    expr: increase(edumint_user_blocked_total[1h]) > 10
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Excessive user blocking detected"
      description: "{{ $value }} users blocked in the last hour"
```

---

### 22.9 フロントエンド実装例（React）（v7.4.1新設）

#### **初期表示コンポーネント**

```typescript
// src/components/ExamViewer.tsx
import React, { useState, useEffect } from 'react';
import { AdPlayer } from './AdPlayer';

interface ExamViewerProps {
  examPublicId: string;
}

export const ExamViewer: React.FC<ExamViewerProps> = ({ examPublicId }) => {
  const [initialContent, setInitialContent] = useState<any>(null);
  const [fullContent, setFullContent] = useState<any>(null);
  const [showAd, setShowAd] = useState(false);
  const [unlockToken, setUnlockToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialContent();
  }, [examPublicId]);

  const fetchInitialContent = async () => {
    try {
      const response = await fetch(`/api/v1/exams/${examPublicId}/initial`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      const data = await response.json();
      setInitialContent(data);
      setShowAd(data.require_ad);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch initial content:', error);
      setLoading(false);
    }
  };

  const handleAdCompleted = async (adProviderData: any) => {
    try {
      const response = await fetch('/api/v1/ads/view-completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          exam_id: examPublicId,
          display_stage: 'answer_explanation',
          ad_provider_id: adProviderData.providerId,
          ad_unit_id: adProviderData.unitId,
        }),
      });
      const data = await response.json();
      setUnlockToken(data.unlock_token);
      setShowAd(false);
      await unlockContent(data.unlock_token);
    } catch (error) {
      console.error('Failed to complete ad view:', error);
    }
  };

  const unlockContent = async (token: string) => {
    try {
      const response = await fetch(`/api/v1/exams/${examPublicId}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          unlock_token: token,
        }),
      });
      const data = await response.json();
      setFullContent(data);
    } catch (error) {
      console.error('Failed to unlock content:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (showAd) {
    return (
      <div>
        <h2>広告視聴後に続きを閲覧できます</h2>
        <AdPlayer
          config={initialContent.ad_provider_config}
          onAdCompleted={handleAdCompleted}
        />
      </div>
    );
  }

  return (
    <div>
      <h1>{initialContent?.exam_title || fullContent?.exam_title}</h1>
      
      {/* 初期表示: 大問1全文 */}
      {initialContent && !fullContent && (
        <>
          <div className="question-full">
            <h2>大問{initialContent.question_1.question_number}</h2>
            <p>{initialContent.question_1.content}</p>
            {initialContent.question_1.sub_questions.map((sq: any) => (
              <div key={sq.sub_question_number}>
                <h3>小問{sq.sub_question_number}</h3>
                <p>{sq.content}</p>
              </div>
            ))}
          </div>
          
          {/* 大問2以降: 構造のみ */}
          <div className="question-structure-only">
            <h2>その他の問題（広告視聴後に表示）</h2>
            {initialContent.other_questions.map((q: any) => (
              <div key={q.question_number}>
                <p>大問{q.question_number} - 小問数: {q.sub_question_count}</p>
              </div>
            ))}
          </div>
          
          <button onClick={() => setShowAd(true)}>
            続きを見る（広告視聴が必要）
          </button>
        </>
      )}
      
      {/* 解除後: 全問題 */}
      {fullContent && (
        <div className="full-content">
          {fullContent.questions.map((q: any) => (
            <div key={q.question_number}>
              <h2>大問{q.question_number}</h2>
              <p>{q.content}</p>
              {q.sub_questions.map((sq: any) => (
                <div key={sq.sub_question_number}>
                  <h3>小問{sq.sub_question_number}</h3>
                  <p>{sq.content}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### **広告プレーヤー統合**

```typescript
// src/components/AdPlayer.tsx
import React, { useEffect, useRef } from 'react';

interface AdPlayerProps {
  config: {
    status: string;
    provider: string;
  };
  onAdCompleted: (adData: any) => void;
}

export const AdPlayer: React.FC<AdPlayerProps> = ({ config, onAdCompleted }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (config.status !== 'active') {
      // 広告配信停止中: 即座にスキップ
      onAdCompleted({
        providerId: 'skip',
        unitId: 'skip',
      });
      return;
    }

    // Google AdMob統合
    if (config.provider === 'google_admob') {
      loadGoogleAdMob();
    }
  }, [config]);

  const loadGoogleAdMob = () => {
    // Google AdMob SDKロード
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // AdMob広告表示
      if (adContainerRef.current) {
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXXXX');
        ins.setAttribute('data-ad-slot', 'XXXXXXXXXX');
        ins.setAttribute('data-ad-format', 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');
        adContainerRef.current.appendChild(ins);
        
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }

      // 広告視聴完了検出（簡易実装）
      setTimeout(() => {
        onAdCompleted({
          providerId: 'google_admob',
          unitId: 'ca-pub-XXXXXXXXXXXXXXXX',
        });
      }, 15000); // 15秒後に完了とみなす
    };
  };

  return (
    <div className="ad-player">
      <div ref={adContainerRef} className="ad-container"></div>
      <p className="ad-notice">広告が表示されない場合は、広告ブロッカーを無効にしてください</p>
    </div>
  );
};
```

---

### 22.10 認証サービス実装（v7.5.0）

#### **新規ユーザー登録フロー**

```go
// internal/service/auth_service.go
package service

import (
    "context"
    "fmt"
    "time"
    
    "github.com/edumint/edumint-users/internal/db/dbgen"
    "github.com/google/uuid"
    gonanoid "github.com/matoous/go-nanoid/v2"
)

type AuthService struct {
    queries *dbgen.Queries
}

func NewAuthService(queries *dbgen.Queries) *AuthService {
    return &AuthService{queries: queries}
}

// IdPProfile: IdPから取得したプロフィール情報
type IdPProfile struct {
    Email        string
    PhoneNumber  string
    ProfileData  map[string]interface{}
    MetaPlatform *string  // 'facebook' | 'instagram' | nil
}

// RegisterNewUser: IdP認証成功後の新規ユーザー登録
func (s *AuthService) RegisterNewUser(
    ctx context.Context,
    idpProvider string,  // 'google', 'apple', 'meta', etc.
    idpUserID string,
    profile IdPProfile,
) (*dbgen.User, error) {
    
    // トランザクション開始
    tx, err := s.queries.BeginTx(ctx)
    if err != nil {
        return nil, fmt.Errorf("failed to begin transaction: %w", err)
    }
    defer tx.Rollback(ctx)
    
    qtx := s.queries.WithTx(tx)
    
    // NanoID生成（8文字）
    publicID, err := gonanoid.Generate("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 8)
    if err != nil {
        return nil, fmt.Errorf("failed to generate public_id: %w", err)
    }
    
    // usersテーブルにレコード作成（email=NULL許可）
    user, err := qtx.InsertUser(ctx, dbgen.InsertUserParams{
        PublicID: publicID,
        Email:    &profile.Email,  // NULL許可
        Username: fmt.Sprintf("user_%s", publicID),  // デフォルトユーザー名
    })
    if err != nil {
        return nil, fmt.Errorf("failed to insert user: %w", err)
    }
    
    // idp_linksテーブルにIdP情報を記録（is_primary=true）
    _, err = qtx.InsertIdPLink(ctx, dbgen.InsertIdPLinkParams{
        UserID:          user.ID,
        Provider:        dbgen.IdpProviderEnum(idpProvider),
        ProviderUserID:  idpUserID,
        MetaPlatform:    profile.MetaPlatform,
        Email:           &profile.Email,
        PhoneNumber:     &profile.PhoneNumber,
        ProfileData:     profile.ProfileData,
        IsPrimary:       true,
        IsActive:        true,
    })
    if err != nil {
        return nil, fmt.Errorf("failed to insert idp_link: %w", err)
    }
    
    // auth_logsに記録
    _, err = qtx.InsertAuthLog(ctx, dbgen.InsertAuthLogParams{
        UserID:       &user.ID,
        EventType:    dbgen.AuthEventEnumIdpAuthSuccess,
        IdpProvider:  dbgen.IdpProviderEnum(idpProvider),
        IdpUserID:    &idpUserID,
        MetaPlatform: profile.MetaPlatform,
        Success:      true,
    })
    if err != nil {
        return nil, fmt.Errorf("failed to insert auth_log: %w", err)
    }
    
    // トランザクションコミット
    if err := tx.Commit(ctx); err != nil {
        return nil, fmt.Errorf("failed to commit transaction: %w", err)
    }
    
    // TODO: 2つ目のIdP追加を促すイベント発行
    
    return &user, nil
}
```

#### **複数IdP紐付けバリデーション**

```go
// UnlinkIdP: IdP紐付け解除（最低2つのIdP必須チェック）
func (s *AuthService) UnlinkIdP(
    ctx context.Context,
    userID uuid.UUID,
    providerToUnlink string,
    metaPlatformToUnlink *string,
) error {
    
    // 現在のIdP紐付け数をカウント
    count, err := s.queries.CountActiveIdPsByUserID(ctx, userID)
    if err != nil {
        return fmt.Errorf("failed to count active idps: %w", err)
    }
    
    // 最低2つのIdPが紐付けされている必要がある
    if count <= 2 {
        return &ValidationError{
            Code:    "MIN_IDP_REQUIRED",
            Message: "最低2個のIdPが必要です。別のIdPを追加してから削除してください。",
        }
    }
    
    // トランザクション開始
    tx, err := s.queries.BeginTx(ctx)
    if err != nil {
        return fmt.Errorf("failed to begin transaction: %w", err)
    }
    defer tx.Rollback(ctx)
    
    qtx := s.queries.WithTx(tx)
    
    // IdP削除（論理削除: is_active=false）
    err = qtx.DeactivateIdPLink(ctx, dbgen.DeactivateIdPLinkParams{
        UserID:       userID,
        Provider:     dbgen.IdpProviderEnum(providerToUnlink),
        MetaPlatform: metaPlatformToUnlink,
    })
    if err != nil {
        return fmt.Errorf("failed to deactivate idp_link: %w", err)
    }
    
    // プライマリIdP削除の場合、別のIdPを自動的にプライマリに昇格
    isPrimary, err := qtx.IsIdPPrimary(ctx, dbgen.IsIdPPrimaryParams{
        UserID:       userID,
        Provider:     dbgen.IdpProviderEnum(providerToUnlink),
        MetaPlatform: metaPlatformToUnlink,
    })
    if err != nil {
        return fmt.Errorf("failed to check if idp is primary: %w", err)
    }
    
    if isPrimary {
        // 別のアクティブなIdPを取得
        activeIdPs, err := qtx.FindActiveIdPLinksByUserID(ctx, userID)
        if err != nil {
            return fmt.Errorf("failed to find active idps: %w", err)
        }
        
        if len(activeIdPs) > 0 {
            // 最初のアクティブIdPをプライマリに設定
            err = qtx.SetPrimaryIdP(ctx, activeIdPs[0].ID)
            if err != nil {
                return fmt.Errorf("failed to set primary idp: %w", err)
            }
        }
    }
    
    // auth_logsに記録
    _, err = qtx.InsertAuthLog(ctx, dbgen.InsertAuthLogParams{
        UserID:       &userID,
        EventType:    dbgen.AuthEventEnumIdpUnlinked,
        IdpProvider:  dbgen.IdpProviderEnum(providerToUnlink),
        MetaPlatform: metaPlatformToUnlink,
        Success:      true,
    })
    if err != nil {
        return fmt.Errorf("failed to insert auth_log: %w", err)
    }
    
    // トランザクションコミット
    if err := tx.Commit(ctx); err != nil {
        return fmt.Errorf("failed to commit transaction: %w", err)
    }
    
    return nil
}

type ValidationError struct {
    Code    string
    Message string
}

func (e *ValidationError) Error() string {
    return e.Message
}
```

#### **大学メール認証（バッジ付与）**

```go
// VerifyUniversityEmail: 大学メール認証開始
func (s *AuthService) VerifyUniversityEmail(
    ctx context.Context,
    userID uuid.UUID,
    email string,
) error {
    
    // 大学ドメインメール検証
    if !isUniversityEmail(email) {
        return &ValidationError{
            Code:    "INVALID_UNIVERSITY_EMAIL",
            Message: "大学ドメインのメールアドレスを入力してください（@*.ac.jp, @*.edu, @*.edu.*）",
        }
    }
    
    // 認証トークン生成
    token := generateVerificationToken()
    
    // TODO: メール送信処理
    
    return nil
}

// ConfirmUniversityEmail: 大学メール認証完了（バッジ付与）
func (s *AuthService) ConfirmUniversityEmail(
    ctx context.Context,
    userID uuid.UUID,
    email string,
) error {
    
    // usersテーブルを更新
    err := s.queries.VerifyUniversityEmail(ctx, dbgen.VerifyUniversityEmailParams{
        ID:              userID,
        UniversityEmail: email,
    })
    if err != nil {
        return fmt.Errorf("failed to verify university email: %w", err)
    }
    
    // auth_logsに記録
    _, err = s.queries.InsertAuthLog(ctx, dbgen.InsertAuthLogParams{
        UserID:    &userID,
        EventType: dbgen.AuthEventEnumUniversityEmailVerified,
        Success:   true,
        Metadata:  map[string]interface{}{"email": email},
    })
    if err != nil {
        return fmt.Errorf("failed to insert auth_log: %w", err)
    }
    
    return nil
}

func isUniversityEmail(email string) bool {
    // 簡易実装: 正規表現でチェック
    // 本番環境では、より厳密なドメインホワイトリスト検証を推奨
    pattern := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(ac\.jp|edu|edu\.[a-zA-Z]{2,})$`
    matched, _ := regexp.MatchString(pattern, email)
    return matched
}

func generateVerificationToken() string {
    // 検証トークン生成（32バイト）
    return hex.EncodeToString(randomBytes(32))
}
```

#### **Meta統合ログイン処理**

```go
// internal/api/handlers/auth_handler.go
package handlers

import (
    "net/http"
    
    "github.com/edumint/edumint-users/internal/service"
    "github.com/labstack/echo/v5"
)

type AuthHandler struct {
    authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
    return &AuthHandler{authService: authService}
}

// HandleMetaCallback: Meta OAuthコールバック処理
func (h *AuthHandler) HandleMetaCallback(c echo.Context) error {
    
    // Metaから取得したデータ
    code := c.QueryParam("code")
    platform := c.QueryParam("platform")  // 'facebook' | 'instagram'
    
    if code == "" {
        return echo.NewHTTPError(http.StatusBadRequest, "code parameter is required")
    }
    
    if platform != "facebook" && platform != "instagram" {
        return echo.NewHTTPError(http.StatusBadRequest, "invalid platform parameter")
    }
    
    // Meta OAuth token exchange
    accessToken, err := exchangeMetaAuthCode(code)
    if err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, "failed to exchange auth code")
    }
    
    // Meta Graph API でユーザー情報取得
    metaProfile, err := fetchMetaProfile(accessToken, platform)
    if err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch meta profile")
    }
    
    // 既存ユーザーかチェック
    user, err := h.authService.FindOrCreateUserByIdP(c.Request().Context(), service.FindOrCreateUserByIdPParams{
        Provider:     "meta",
        ProviderUserID: metaProfile.ID,
        MetaPlatform: &platform,
        Profile: service.IdPProfile{
            Email:        metaProfile.Email,
            PhoneNumber:  metaProfile.Phone,
            ProfileData:  metaProfile.ToMap(),
            MetaPlatform: &platform,
        },
    })
    if err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, "failed to register user")
    }
    
    // JWTトークン発行
    token, err := h.authService.IssueAccessToken(c.Request().Context(), user.ID)
    if err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, "failed to issue token")
    }
    
    return c.JSON(http.StatusOK, map[string]interface{}{
        "token": token,
        "user":  user,
    })
}

func exchangeMetaAuthCode(code string) (string, error) {
    // TODO: Meta OAuth token exchange実装
    return "", nil
}

func fetchMetaProfile(accessToken, platform string) (*MetaProfile, error) {
    // TODO: Meta Graph API実装
    return nil, nil
}

type MetaProfile struct {
    ID    string
    Email string
    Phone string
    Name  string
}

func (p *MetaProfile) ToMap() map[string]interface{} {
    return map[string]interface{}{
        "id":    p.ID,
        "email": p.Email,
        "phone": p.Phone,
        "name":  p.Name,
    }
}
```

#### **レート制限実装**

```go
// RateLimitIdPAuth: IdP認証のレート制限
func (h *AuthHandler) RateLimitIdPAuth(ctx context.Context, ipAddress string) error {
    key := fmt.Sprintf("rate_limit:idp_auth:%s", ipAddress)
    
    count, err := h.redisClient.Incr(ctx, key).Result()
    if err != nil {
        return fmt.Errorf("failed to increment rate limit: %w", err)
    }
    
    if count == 1 {
        h.redisClient.Expire(ctx, key, 1*time.Hour)
    }
    
    if count > 10 {  // 1時間に10回まで
        return &ValidationError{
            Code:    "RATE_LIMIT_EXCEEDED",
            Message: "認証試行回数が上限に達しました。しばらくしてから再度お試しください。",
        }
    }
    
    return nil
}
```

#### **sqlcクエリ定義**

```sql
-- name: VerifyUniversityEmail :exec
UPDATE users
SET 
  university_email = $2,
  university_verified = true,
  university_verified_at = CURRENT_TIMESTAMP,
  university_badge_expires_at = CURRENT_TIMESTAMP + INTERVAL '1 year',
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: GetUsersWithExpiredBadge :many
SELECT * FROM users
WHERE university_verified = true
  AND university_badge_expires_at < CURRENT_TIMESTAMP
ORDER BY university_badge_expires_at ASC
LIMIT $1;

-- name: FindActiveIdPLinksByUserID :many
SELECT * FROM idp_links 
WHERE user_id = $1 AND is_active = true;

-- name: SetPrimaryIdP :exec
UPDATE idp_links
SET is_primary = CASE WHEN id = $1 THEN true ELSE false END
WHERE user_id = (SELECT user_id FROM idp_links WHERE id = $1);

-- name: CountActiveIdPsByUserID :one
SELECT COUNT(*) FROM idp_links 
WHERE user_id = $1 AND is_active = true;

-- name: DeactivateIdPLink :exec
UPDATE idp_links
SET is_active = false, updated_at = CURRENT_TIMESTAMP
WHERE user_id = $1 
  AND provider = $2 
  AND (meta_platform = $3 OR (meta_platform IS NULL AND $3 IS NULL));

-- name: IsIdPPrimary :one
SELECT is_primary FROM idp_links
WHERE user_id = $1 
  AND provider = $2 
  AND (meta_platform = $3 OR (meta_platform IS NULL AND $3 IS NULL));
```

#### **UI/UX推奨フロー（TypeScript/React）**

```typescript
// src/components/OnboardingIdPPrompt.tsx
import React, { useState, useEffect } from 'react';

interface IdPProvider {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

const OnboardingIdPPrompt: React.FC = () => {
  const [linkedIdPs, setLinkedIdPs] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  const availableProviders: IdPProvider[] = [
    { id: 'google', name: 'Google', icon: '/icons/google.svg', available: true },
    { id: 'apple', name: 'Apple', icon: '/icons/apple.svg', available: true },
    { id: 'meta_facebook', name: 'Facebook', icon: '/icons/facebook.svg', available: true },
    { id: 'meta_instagram', name: 'Instagram', icon: '/icons/instagram.svg', available: true },
    { id: 'microsoft', name: 'Microsoft', icon: '/icons/microsoft.svg', available: true },
    { id: 'line', name: 'LINE', icon: '/icons/line.svg', available: true },
    { id: 'github', name: 'GitHub', icon: '/icons/github.svg', available: true },
  ];
  
  useEffect(() => {
    // 紐付けIdP数をチェック
    fetchLinkedIdPs().then(idps => {
      setLinkedIdPs(idps);
      if (idps.length < 2) {
        setShowModal(true);
      }
    });
  }, []);
  
  const handleLinkIdP = async (providerId: string) => {
    // IdP認証フロー開始
    const platform = providerId.startsWith('meta_') 
      ? providerId.replace('meta_', '') 
      : null;
    
    const provider = providerId.startsWith('meta_') ? 'meta' : providerId;
    
    window.location.href = `/api/auth/idp/${provider}/authorize?platform=${platform}`;
  };
  
  if (!showModal) return null;
  
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>アカウント保護のため、もう1つのログイン方法を追加してください</h2>
        <p>
          複数のログイン方法を設定することで、アカウントへのアクセスが確保されます。
        </p>
        <div className="idp-buttons">
          {availableProviders
            .filter(p => !linkedIdPs.includes(p.id))
            .map(provider => (
              <button
                key={provider.id}
                onClick={() => handleLinkIdP(provider.id)}
                className="idp-button"
              >
                <img src={provider.icon} alt={provider.name} />
                <span>{provider.name}で追加</span>
              </button>
            ))}
        </div>
        <button onClick={() => setShowModal(false)} className="skip-button">
          後で追加する
        </button>
      </div>
    </div>
  );
};

async function fetchLinkedIdPs(): Promise<string[]> {
  const response = await fetch('/api/auth/idp/links');
  const data = await response.json();
  return data.links.map((link: any) => link.provider);
}

export default OnboardingIdPPrompt;
```

#### **Twitter移行計画**

```sql
-- ステップ1: Twitterのみのユーザーを特定
SELECT DISTINCT u.id, u.email, u.username
FROM users u
INNER JOIN idp_links il ON u.id = il.user_id
WHERE il.provider = 'twitter'
  AND NOT EXISTS (
    SELECT 1 FROM idp_links il2
    WHERE il2.user_id = u.id AND il2.provider != 'twitter'
  );

-- ステップ2: メール通知（手動対応依頼）
-- ユーザーに別のIdP追加を促すメール送信

-- ステップ3: 猶予期間後（例: 3ヶ月後）にTwitter IdP削除
DELETE FROM idp_links
WHERE provider = 'twitter'
  AND created_at < CURRENT_TIMESTAMP - INTERVAL '3 months';

-- ステップ4: ENUM型からTwitter削除
ALTER TYPE idp_provider_enum RENAME TO idp_provider_enum_old;
CREATE TYPE idp_provider_enum AS ENUM ('google', 'apple', 'meta', 'microsoft', 'line', 'github');

ALTER TABLE idp_links
  ALTER COLUMN provider TYPE idp_provider_enum USING provider::text::idp_provider_enum;

DROP TYPE idp_provider_enum_old;
```

#### **22.10.7 プライマリIdP管理（v7.5.1新設）**

##### 設計背景
ユーザーが複数のIdP（Google、Meta、Apple等）を紐付けた場合、アカウント復旧時の基準となる「プライマリIdP」を明確化する必要がある。

##### 優先順位ルール
1. **初回登録時のIdPを永続的にプライマリとする**
   - `users.primary_idp_link_id`カラムを追加（idp_links.id参照）
   - セキュリティ理由：アカウント乗っ取り時の復旧基準を明確化

2. **ユーザー自身による変更を許可**
   - UI: "プライマリ認証方法の変更"ボタン
   - セキュリティ検証：変更前にプライマリIdPでの再認証を要求

##### DDL追加
```sql
-- usersテーブルへのカラム追加
ALTER TABLE users 
ADD COLUMN primary_idp_link_id UUID REFERENCES idp_links(id),
ADD CONSTRAINT check_primary_idp_not_deleted 
  CHECK (primary_idp_link_id IS NULL OR 
         EXISTS (SELECT 1 FROM idp_links 
                 WHERE id = primary_idp_link_id 
                 AND user_id = users.id 
                 AND deleted_at IS NULL));
```

##### sqlcクエリ定義
```sql
-- name: SetPrimaryIdP :exec
UPDATE users
SET primary_idp_link_id = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: GetPrimaryIdP :one
SELECT il.* 
FROM idp_links il
JOIN users u ON u.primary_idp_link_id = il.id
WHERE u.id = $1 AND il.deleted_at IS NULL;
```

##### サービス層実装
```go
func (s *AuthService) ChangePrimaryIdP(
    ctx context.Context, 
    userID uuid.UUID, 
    newPrimaryLinkID uuid.UUID,
    reauthToken string,
) error {
    // 1. 現在のプライマリIdPで再認証検証
    currentPrimary, err := s.queries.GetPrimaryIdP(ctx, userID)
    if err != nil {
        return fmt.Errorf("get primary idp: %w", err)
    }
    
    if err := s.verifyReauthToken(ctx, currentPrimary, reauthToken); err != nil {
        return fiber.NewError(fiber.StatusUnauthorized, "再認証が必要です")
    }
    
    // 2. 新しいプライマリIdPの所有確認
    link, err := s.queries.GetIdPLink(ctx, newPrimaryLinkID)
    if err != nil || link.UserID != userID {
        return fiber.NewError(fiber.StatusForbidden, "指定されたIdPはこのアカウントに紐付いていません")
    }
    
    // 3. プライマリIdP更新
    return s.queries.SetPrimaryIdP(ctx, db.SetPrimaryIdPParams{
        ID:                userID,
        PrimaryIdpLinkID:  newPrimaryLinkID,
    })
}
```

##### UI/UX設計
```typescript
// プライマリ認証方法変更ダイアログ
const ChangePrimaryIdPDialog: React.FC = () => {
  const [selectedIdP, setSelectedIdP] = useState<string>('');
  const [reauthRequired, setReauthRequired] = useState(false);

  const handleChange = async () => {
    try {
      await authAPI.changePrimaryIdP(selectedIdP);
      toast.success('プライマリ認証方法を変更しました');
    } catch (error) {
      if (error.code === 'REAUTH_REQUIRED') {
        setReauthRequired(true);
        // 現在のプライマリIdPで再認証ダイアログ表示
      }
    }
  };

  return (
    <Dialog>
      <DialogTitle>プライマリ認証方法の変更</DialogTitle>
      <DialogContent>
        <Alert severity="warning">
          アカウント復旧時の基準となる認証方法を変更します。
          この操作には現在のプライマリ認証方法での再認証が必要です。
        </Alert>
        <RadioGroup value={selectedIdP} onChange={(e) => setSelectedIdP(e.target.value)}>
          {linkedIdPs.map(idp => (
            <FormControlLabel 
              key={idp.id} 
              value={idp.id} 
              label={idp.provider} 
              disabled={idp.isPrimary}
            />
          ))}
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
};
```

---

### 22.11 UI/UX方針(OAuth専用認証時代の認証導線設計)

#### **ログイン／新規登録導線の統一方針(v7.5.0)**

**原則: UI上で「ログイン」と「新規登録」を分割しない**

**設計判断:**
- edumintUsersサービスはv7.5.0で自社パスワード認証を全面廃止し、OAuth専用認証に移行しました
- この前提では、「ログイン」と「新規登録」は**技術的に同一の行為**であり、ユーザーに区別を強制する必要はありません
- UI/UX設計では **「OAuthで続行する」** 一本化された導線が最適です

---

#### **統一導線のメリット**

1. **認知負荷の削減**
   - ユーザーは「自分が既存ユーザーか新規ユーザーか」を正確に覚えていないケースが多い
   - 「どのIdP(Google/Apple/Meta)で登録したか」を記憶している保証もない
   - **「正しい選択を強制しない」** ことで失敗体験を防止

2. **失敗体験の排除**
   - 分割UI: 「ログイン」を押した未登録ユーザー → エラー → 登録画面へ再遷移(UX最悪)
   - 統一UI: **「成功する行為しかユーザーにさせない」** 設計が可能

3. **技術的整合性**
   - OAuth認証では、バックエンド側で `provider + provider_user_id` の既存チェックを自動実行
   - 既存 → ログイン、未存在 → 新規ユーザー作成の分岐は **システム側で自動処理**
   - UIでの事前分岐は **技術的に不要**

4. **時代的妥当性**
   - 「ログイン」「新規登録」という言葉自体が、メール＋パスワード時代の概念
   - OAuth主体の2026年設計では、UIコピーとしても時代遅れ

---

#### **推奨UI設計**

**画面構成:**

```text
┌──────────────────────────────────────────────────────────────┐
│ EduMint                                                        │
│ アカウントを作成・利用する                                      │
├──────────────────────────────────────────────────────────────┤
│ (説明文: 小さく)                                              │
│ Google等の外部サービスで認証します。                            │
│ 登録済みの場合は自動的にログインされます。                       │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 🔵 Googleで続行                                          │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 🍎 Appleで続行                                           │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 🔵 Metaで続行(Facebook/Instagram)                      │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 🖥️ Microsoftで続行                                      │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                              │
│ (学生向けヒント: .ac.jp大学メール推奨)                         │
└──────────────────────────────────────────────────────────────┘
```

**UIコピー指針:**
- ❌ 使用しない文言: 「ログイン」「新規登録」「サインイン」「サインアップ」
- ✅ 推奨文言: 「続行」「利用する」「始める」

---

#### **認証後の分岐設計(バックエンド側)**

**既存ユーザー:**
```go
// OAuth認証成功 → 既存ユーザー検出
if existingUser := checkExistingUser(provider, providerUserID); existingUser != nil {
    // セッション発行 → サービスへ自動遷移
    issueSessionToken(existingUser.ID)
    redirectTo("/")
}
```

**新規ユーザー:**
```go
// OAuth認証成功 → 未登録ユーザー検出
newUser := createUserFromIdPData(idpProfile)

// プロフィール初期設定フローへ自動遷移
redirectTo("/profile-setup", {
    step: "onboarding",
    userID: newUser.ID,
    prefilledData: idpProfile  // IdPから取得した氏名・メール等
})
```

**重要原則:**
- ユーザーは **「登録した」という感覚すら持たなくてよい**
- オンボーディング(プロフィール設定)は **自然な初期設定** として提示
- 「登録完了」ではなく「プロフィール設定」というUXコピーを使用

---

#### **統一導線のデメリット(検証済み)**

**懸念1: ユーザーが自分の状態を把握できないのでは?**
- **反論**: OAuth認証後、システム側で自動判定するため、ユーザーの状態把握は不要
- **実装**: セッション有無・プロフィール完成度で自動分岐(透明化)

**懸念2: 法的・業務的に「登録行為」の明確化が必要では?**
- **対応**: 利用規約・同意事項は **OAuth認証後** に挿入(プロフィール設定フローの一部)
- **実装**: `users.registration_completed_at` で正式登録日時を記録(契約成立タイミング)

**懸念3: 高齢者等、ITリテラシーが低いユーザーへの配慮は?**
- **EduMintの対象ユーザー**: 大学生・大学院生(ITリテラシー高)
- **判断**: 本プロジェクトでは統一導線が最適、特例対応不要

---

#### **例外的に分割UIが検討対象となるケース(本プロジェクトでは該当しない)**

1. **有料サービスで契約成立タイミングの明確化が必須**
   - EduMint: MVP版は無料、課金機能はPhase 2以降
   - 対応: 課金時の「購入確認」フローで契約成立を明示

2. **行政・公共系サービスで法令により事前同意が必要**
   - EduMint: 民間サービスのため該当しない

3. **極端にITリテラシーが低いユーザー層(高齢者向けサービス等)**
   - EduMint: 大学生向けのため該当しない

---

#### **実装指針(フロントエンド開発者向け)**

**React実装例:**

```typescript
// ❌ 非推奨: ログイン/登録タブ分離


// ✅ 推奨: 統一導線
export function AuthPage() {
  return (
    <div className="auth-container">
      <h1>EduMint</h1>
      <h2>アカウントを作成・利用する</h2>
      <p className="description">
        Google等の外部サービスで認証します。<br />
        登録済みの場合は自動的にログインされます。
      </p>
      
      <div className="oauth-buttons">
        <button onClick={() => handleOAuthLogin('google')} className="oauth-button google">
          🔵 Googleで続行
        </button>
        <button onClick={() => handleOAuthLogin('apple')} className="oauth-button apple">
          🍎 Appleで続行
        </button>
        <button onClick={() => handleOAuthLogin('meta')} className="oauth-button meta">
          🔵 Metaで続行(Facebook/Instagram)
        </button>
        <button onClick={() => handleOAuthLogin('microsoft')} className="oauth-button microsoft">
          🖥️ Microsoftで続行
        </button>
      </div>
      
      <p className="hint">学生向けヒント: .ac.jp大学メール推奨</p>
    </div>
  );
}

// OAuth認証ハンドラー
function handleOAuthLogin(provider: 'google' | 'apple' | 'meta' | 'microsoft') {
  const redirectURI = `${window.location.origin}/auth/callback`;
  const authURL = `https://api.edumint.dev/v1/auth/${provider}?redirect_uri=${redirectURI}`;
  
  // PKCE対応のOAuth認証開始
  window.location.href = authURL;
}
```

---

#### **設計意思決定の記録**

| 項目 | 決定内容 | 理由 |
|-----|---------|------|
| **ログイン/登録UI** | **分けない** | OAuth認証では技術的に区別不要 |
| **ユーザー操作** | OAuthで続行のみ | 失敗体験の排除、認知負荷削減 |
| **認証後分岐** | システム側で自動判定 | ユーザーに「正しい選択」を強制しない |
| **UIコピー** | 「続行」「利用する」系 | 時代遅れの「ログイン/登録」を廃止 |
| **方針との整合性** | OAuth一本化と完全一致 | v7.5.0の認証戦略と技術的整合性 |

---

#### **まとめ: 一文でまとめると**

> OAuth認証を前提とするサービスにおいては、「ログイン」と「新規登録」をUI上で分けること自体がUX上のノイズであり、ユーザーには"認証する"という単一行為だけを提示するのが最適である。

---

**関連セクション:**
- [4. edumintUsers(統合ユーザー管理サービス)](#4-edumintusers-統合ユーザー管理サービス)
- [22.10 認証サービス実装(v7.5.0)](#2210-認証サービス実装v750)

**変更履歴:**
- v7.5.0: 本方針を正式採用、ドキュメント化

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

**v7.2.0 更新日**: 2026-02-06

**v7.2.0 主要変更点のまとめ:**

1. **edumintContents 4DB構成への拡張**
   - 2DB構成（v7.1.0）から4DB構成（v7.2.0）へ拡張
   - 物理DB: edumint_contents (メインDB), edumint_contents_search (検索用DB), edumint_contents_master (マスターDB), edumint_contents_logs (ログDB)
   - 各DBの役割・特性に応じた最適なインスタンス設定

2. **セキュリティ強化（OCRテキスト統合管理）**
   - OCRテキスト（機密情報）を独立したDBで管理
   - IAMロール分離による厳格なアクセス制御（書き込み専用SA、読み取り専用SA）
   - イミュータブル設計（追加のみ、更新・削除禁止）
   - 7日後の自動暗号化対応
   - 一般ユーザー・アプリケーションからのアクセス完全遮断
   - v7.3.0: master_ocr_contents統合テーブルで一元管理

3. **I/O性能改善（検索用語テーブル分離）**
   - 読み取り集中（検索クエリ）と書き込み集中（コンテンツ更新）を物理分離
   - 全文検索インデックス（GIN）の独立最適化
   - リードレプリカの柔軟な配置（検索DBのみ複数レプリカ可能）
   - クエリキャッシュ戦略の独立設定

4. **Debezium CDC 3コネクタ構成**
   - edumint_contents コネクタ: メインDBテーブルの同期
   - edumint_contents_search コネクタ: 検索用語テーブルの同期（新設）
   - レプリケーション対象の精密制御（master DBは非レプリケーション）
   - PostgreSQL 論理レプリケーションスロット3構成

5. **スケーラビリティ向上**
   - DB単位での段階的スケールアウト対応
   - メインDB縮小可能（db-custom-8-32GB → db-custom-6-24GB）
   - 検索DB独立スケール（db-custom-4-16GB、リードレプリカ追加可）
   - バックアップ・リストア戦略の独立化（master DB: 90日保持、logs DB: 7日保持）

6. **運用コスト最適化**
   - 4DB構成: $600/月（メインDB $280 + 検索DB $160 + マスターDB $80 + ログDB $80）
   - 2DB構成（v7.1.0）: $440/月
   - 差分: +$160/月（+36%）、セキュリティ・性能・運用柔軟性の向上により正当化

7. **IAM認証設計の強化**
   - 4DB対応のサービスアカウント設計
   - DB単位で異なるアクセス権限（最小権限原則の厳格適用）
   - 分析用SAはマスターDBアクセス不可（機密情報保護）
   - 検索DBにDELETE権限追加（用語候補の削除対応）

8. **セクション構造の再編**
   - セクション5: 4DB構成に対応（5.1.1 メインDB、5.1.2 検索DB、5.3 マスターDB、5.4 ログDB）
   - セクション14: Debezium CDC 3コネクタ構成に更新
   - セクション19: Cloud SQL 4DB構成のインスタンス設定・IAMロール設計追加
   - 物理DB配置図、Debezium CDC連携図、IAMロール設計図の追加

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

**v7.4.0 更新日**: 2026-02-06

**v7.4.0 主要変更点のまとめ:**

1. **広告表示回数統計強化**
   - `exam_statistics` テーブルに広告関連カラムを追加
     - `ad_display_count INT DEFAULT 0`: 広告表示回数
     - `ad_revenue_estimated DECIMAL(15,4) DEFAULT 0.00`: 推定広告収益（USD）
     - `last_ad_displayed_at TIMESTAMPTZ`: 最終広告表示日時
   - 広告表示回数集計バッチ処理の追加
   - 収益計算連携（edumintRevenue）の実装例追加

2. **広告視聴進捗管理テーブル新設**
   - `ad_viewing_progress` テーブル新規作成
     - ユーザーごとの広告視聴段階を記録
     - スキップロジック実装のための基礎データ
     - 段階別完了フラグ（question_view, answer_explanation, download）
   - `ad_viewing_history` テーブル削除（統合により）
   - 広告スキップロジックの実装例追加（セクション22.4）

3. **国際化対応強化**
   - 対象テーブル: `institutions`, `faculties`, `departments`, `teachers`, `subjects`, `keywords`
   - カラム追加:
     - `region_code CHAR(2) NOT NULL DEFAULT 'JP'`: ISO 3166-1 alpha-2国コード
   - SEO最適化のため `name` カラムを英語化:
     - 既存 `name_main` → `display_name` (多言語表示用) に移行
     - 新規 `name` カラムに英語名を設定（SEO最適化）
     - `display_language VARCHAR(10)` 追加（BCP 47準拠）
   - 削除カラム: `name_sub1`, `name_sub2`, `name_sub3`
   - データ移行スクリプトの追加（Atlas HCL定義更新）

4. **閲覧履歴・評価・コメント絞り込みの負荷分析（セクション5.4）**
   - 想定クエリパターンの追加
   - インデックス最適化:
     - `idx_exam_interaction_events_user_type_time` 複合インデックス追加
   - 負荷テスト結果と性能評価
     - 平均レスポンス: 45ms → 3ms（約15倍改善）
     - P95レスポンス: 120ms → 8ms
   - スケーリング戦略
     - 短期: リードレプリカ2台
     - 中期: キャッシュ層（Redis/Memcached）導入
     - 長期: パーティション分割、分散データベース移行検討

5. **Atlas HCL・sqlc・Goコード更新（セクション18.3.1, 22.4, 22.5）**
   - `institutions` テーブルのAtlas HCL定義を更新（国際化対応）
   - 国際化対応の sqlc クエリ例を追加
     - `GetInstitutionByID`, `ListInstitutionsByCountry`, `SearchInstitutionsByName`
   - ユーザー履歴取得サービスの実装例追加
     - `UserHistoryService`: 広告視聴進捗管理機能
     - `InstitutionService`: 国際化対応機関情報管理
   - 広告スキップロジック実装（`ShouldShowAd`メソッド）

6. **API応答例の更新**
   - 閲覧履歴API応答例（広告視聴進捗含む）:
     - `ViewingHistoryEntry` 構造体に `AdProgress` フィールド追加
   - 機関詳細API応答例（国際化対応）:
     - `InstitutionDetail` 構造体に多言語フィールド追加

7. **Elasticsearchインデックス更新（セクション7）**
   - `institution_name` フィールドの多言語アナライザー対応
     - 日本語（kuromoji）、英語（standard）の両方をサポート
   - `institution_display_name` フィールド追加
   - `region_code` フィールド追加
   - 広告統計フィールド追加:
     - `ad_display_count`: 広告表示回数
     - `ad_revenue_estimated`: 推定広告収益
   - 多言語アナライザー設定（kuromoji, english）

8. **Debezium CDC設定更新（セクション14）**
   - `ad_viewing_history` → `ad_viewing_progress` にテーブル名変更
   - `table.include.list` を更新

**v7.3.0からの主な変更:**
- 広告管理機能の強化（統計・視聴進捗）
- 国際化対応の全面実装（6テーブル）
- 負荷分析と性能最適化
- Atlas HCL・sqlc・Goコードの充実

**技術的注意事項:**
- 既存の `name_main` データは `display_name` に移行が必要
- 英語名データの投入が必要（`name` カラム）
- 既存の `ad_viewing_history` データは `ad_viewing_progress` に統合マイグレーションが必要

---

**v7.3.0 更新日**: 2026-02-06

**v7.2.1 主要変更点のまとめ:**

1. **マイクロサービステスト戦略の全面刷新（セクション21）**
   - テストハニカムモデルの導入（E2E最小化、Component中心）
   - 技術スタック・ライブラリの厳格化（Go 1.25.7、Pact v2、gomock）
   - 契約テスト（Pact）の新設（HTTP API、Kafka Event）
   - コンポーネントテストの強化（gomock、並列実行、トランザクション分離）
   - E2Eテストの最小化（クリティカルパスのみ）
   - テスト責任範囲マトリックスの明確化
   - CI/CDパイプラインのTestcontainers対応
   - コーディング規約・ベストプラクティス（AI向け指示書）の新設

2. **分散モノリス化の防止**
   - テスト実行専用マイクロサービスの作成禁止を明記
   - 各サービスの独立性（Deployable）を保証する設計

3. **禁止事項の明確化**
   - `time.Sleep()` 禁止（Eventuallyパターン/チャネル同期推奨）
   - `time.Now()` 直接使用禁止（Clock DIパターン推奨）
   - E2EテストでのDB直接確認禁止（画面表示で判断）

4. **Debeziumテスト戦略**
   - Outboxパターンによる検証（コンポーネントテストでOutboxテーブル確認）
   - Kafka送信の実際の動作はStaging環境で担保

5. **セクション構成の変更**
   - 21.1: テクノロジースタック & 指定ライブラリ（新設）
   - 21.2: コンポーネント/統合テスト（既存21.1を拡張）
   - 21.3: 契約テスト（新設）
   - 21.4: E2Eテスト（既存21.2を縮小）
   - 21.5: テスト実行場所と責任範囲（新設）
   - 21.6: CI/CDパイプライン（既存21.3を更新）
   - 21.7: コーディング規約・ベストプラクティス（新設）

---

**v7.2.0からの継続:**
- edumintContents 4DB構成（メインDB、検索DB、マスターDB、ログDB）
- Debezium CDC 3コネクタ構成
- セキュリティ強化（OCRテキスト統合管理）
- I/O性能改善（検索用語テーブル分離）

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
