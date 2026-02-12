# 命名規約ガイド - Eduanimaプロジェクト

## 1. 概要

このドキュメントは、Eduanimaプロジェクトにおけるマイクロサービス、物理サービス、データベース、テーブル、API、その他のリソースの命名規約を定義します。一貫性のある命名規則により、コードの可読性、保守性、チーム間のコミュニケーションが向上します。

### 1.1 命名規約の原則

1. **一貫性**: プロジェクト全体で統一されたルールを適用
2. **明確性**: 名前から役割や目的が推測可能
3. **簡潔性**: 必要十分な情報を含みつつ、過度に長くしない
4. **拡張性**: 将来の機能追加に対応できる構造
5. **標準準拠**: 業界標準やベストプラクティスに準拠

---

## 2. マイクロサービス命名規則

### 2.1 基本ルール

**フォーマット**: `eduanima<ServiceName>`
- **プレフィックス**: `eduanima` (小文字)
- **サービス名**: PascalCase（各単語の頭文字を大文字）
- **例**: `eduanimaAuth`, `eduanimaUserProfile`, `eduanimaContent`

### 2.2 命名の原則

#### ✅ DO (推奨)
- **ドメイン駆動**: ビジネスドメインを反映した名前を使用
- **単一責任**: サービスの主要な責務を明確に表現
- **動詞の回避**: サービス名には名詞を使用（動詞は API に使用）
- **略語の最小化**: 理解しやすい完全な単語を使用

```
✓ eduanimaAuth           # 認証サービス
✓ eduanimaUserProfile    # ユーザープロフィール管理
✓ eduanimaContent        # コンテンツ管理
✓ eduanimaNotify         # 通知サービス (Notificationを短縮)
✓ eduanimaMonetizeWallet # 収益化ウォレット
```

#### ❌ DON'T (非推奨)
- **曖昧な名前**: 責務が不明確
- **技術詳細の露出**: 実装技術を名前に含めない
- **過度な短縮**: 理解しにくい略語

```
✗ eduanimaService        # 曖昧すぎる
✗ eduanimaUserMgmt       # 略語の過度な使用
✗ eduanimaAuthJWT        # 実装詳細の露出
✗ eduanimaMySQLHandler   # 技術詳細の露出
```

### 2.3 サービス分類とネーミングパターン

#### コアビジネスサービス
```
eduanimaAuth           # 認証・認可
eduanimaUserProfile    # ユーザー管理
eduanimaContent        # コンテンツ管理
eduanimaFile           # ファイル管理
eduanimaSearch         # 検索機能
```

#### インフラストラクチャサービス
```
eduanimaGateway        # APIゲートウェイ
eduanimaNotify         # 通知配信
eduanimaModeration     # コンテンツモデレーション
```

#### 機能特化サービス
```
eduanimaAiWorker       # AI処理ワーカー
eduanimaSocial         # SNS機能
eduanimaAnalytics      # 分析・レポート
eduanimaAds            # 広告配信
```

#### 収益化サービス
```
eduanimaMonetizeWallet # ウォレット管理
eduanimaRevenue        # 収益分配
```

### 2.4 ベストプラクティスの根拠

1. **Domain-Driven Design (DDD)**: 境界づけられたコンテキストを反映
2. **Google Cloud**: サービス命名ガイドライン準拠
3. **Kubernetes**: DNS-1123 label standard 互換
4. **可読性**: camelCase は英語圏で一般的で読みやすい

---

## 3. 物理サービス・データベース命名規則

### 3.1 物理データベース名

**フォーマット**: `[service_name]_db`
- **ベースネーム**: snake_case（小文字 + アンダースコア）
- **サフィックス**: `_db` (データベースであることを明示)
- **例**: `user_db`, `content_db`, `gateway_db`

#### MSAベストプラクティス: Database-per-Service

各マイクロサービスは**専用の物理データベース**を所有し、完全な自律性を持ちます。

#### 実例

```
gateway_db              # EduanimaGateways専用DB
user_db                 # EduanimaUsers専用DB
content_db              # EduanimaContents専用DB
file_db                 # EduanimaFiles専用DB
search_db               # EduanimaSearch専用DB
ai_worker_db            # EduanimaAiWorker専用DB
moderation_db           # EduanimaModeration専用DB
social_db               # EduanimaSocial専用DB
notification_db         # EduanimaNotification専用DB
analytics_db            # EduanimaAnalytics専用DB
ads_db                  # EduanimaAds専用DB
ai_tutor_db             # EduanimaAiTutor専用DB
wallet_db               # EduanimaMonetizeWallet専用DB
revenue_db              # EduanimaRevenue専用DB
```

### 3.2 命名の原則

#### ✅ DO (推奨)
- **サービスとの1:1対応**: 各サービスが専用DBを持つ
- **snake_case使用**: 多くのDBエンジンとの互換性
- **明確なサフィックス**: `_db`でデータベースであることを明示
- **環境分離**: サフィックスで環境を区別

```
✓ user_db                # シンプルで明確
✓ content_db             # サービス名から推測可能
✓ ai_worker_db           # 複数単語はアンダースコアで連結
✓ user_db_dev            # 開発環境
✓ user_db_staging        # ステージング環境
✓ user_db_prod           # 本番環境
```

#### ❌ DON'T (非推奨)
```
✗ Eduanima_main          # 共有DB（MSA原則違反）
✗ shared_app_db          # 複数サービスで共有（密結合）
✗ eduanima_db            # サービス特定できない
✗ UserDB                 # PascalCase（互換性問題）
✗ user-db                # ハイフン（一部DBエンジンで問題）
```

### 3.3 環境別データベース

開発環境やステージング環境では、サフィックスで区別：

```
user_db_dev              # 開発環境
user_db_staging          # ステージング環境
user_db_prod             # 本番環境（または user_db）

content_db_dev
content_db_staging
content_db_prod
```

**命名規則の選択肢**:
1. **サフィックス方式** (推奨): `[service]_db_[env]`
2. **プレフィックス方式**: `[env]_[service]_db`
3. **別クラスタ**: 環境ごとに完全に分離されたDBクラスタを使用

### 3.4 Database-per-Serviceパターンの利点

1. **独立したスキーマ進化**: 各サービスが他に影響を与えずDB構造を変更可能
2. **技術スタック自由度**: サービスごとに最適なDBエンジン選択（PostgreSQL, MySQL, MongoDB等）
3. **障害の局所化**: 1つのDBの問題が他サービスに波及しない
4. **スケーラビリティ**: 負荷の高いサービスのDBのみをスケールアウト
5. **セキュリティ**: サービスごとに細かいアクセス制御を設定

### 3.5 アンチパターンの回避

#### 分散モノリス（避けるべき）
```
❌ 悪い例: 複数サービスが同じ物理DBを共有
┌─────────────┐
│ Service A   │─┐
├─────────────┤ │
│ Service B   │─┼─→ [Shared_DB]
├─────────────┤ │
│ Service C   │─┘
└─────────────┘

問題点:
- サービス間の密結合
- スキーマ変更の影響が広範囲に及ぶ
- 独立デプロイ不可
- データベースがボトルネック
```

#### Database-per-Service（推奨）
```
✅ 良い例: 各サービスが専用DBを所有
┌─────────────┐      ┌──────────┐
│ Service A   │─────→│ DB_A     │
└─────────────┘      └──────────┘

┌─────────────┐      ┌──────────┐
│ Service B   │─────→│ DB_B     │
└─────────────┘      └──────────┘

┌─────────────┐      ┌──────────┐
│ Service C   │─────→│ DB_C     │
└─────────────┘      └──────────┘

サービス間通信: API / イベント駆動

利点:
- 完全な自律性
- 独立したスケーリング
- 障害の局所化
- 技術スタック自由度
```

### 3.6 ベストプラクティスの根拠

1. **Sam Newman "Building Microservices"**: Database-per-Serviceパターン推奨
2. **Chris Richardson "Microservices Patterns"**: データ所有と境界の明確化
3. **AWS RDS**: マルチテナントではなく、サービス専用インスタンス推奨
4. **Google Cloud SQL**: インスタンスレベルでのサービス分離
5. **PostgreSQL/MySQL標準**: snake_caseが広く互換性がある
- **目的**: snake_case（小文字 + アンダースコア）
- **例**: `Eduanima_main`, `Eduanima_contents_master`, `Eduanima_logs`

#### 実例

```
Eduanima_main              # メインOLTPデータベース
Eduanima_contents_master   # コンテンツマスターデータ
Eduanima_contents_search   # 検索インデックスメタデータ
Eduanima_logs              # ログ・分析データ
```

### 3.2 命名の原則

#### ✅ DO (推奨)
- **用途明確**: データベースの主要な目的を反映
- **環境分離**: 環境別サフィックスで分離 (dev/staging/prod)
- **スケーラビリティ**: シャーディング対応の命名

```
✓ Eduanima_main           # メインデータベース
✓ Eduanima_logs           # ログ専用
✓ Eduanima_analytics      # 分析用
✓ Eduanima_cache          # キャッシュ用
```

#### ❌ DON'T (非推奨)
```
✗ eduanima_db             # 小文字のみ（識別性低い）
✗ EduanimaDatabase1       # 数字だけのサフィックス
✗ eduanima-main           # ハイフン使用（互換性問題）
✗ EDUANIMA_MAIN           # 全て大文字（可読性低い）
```

### 3.3 環境別データベース

開発環境やステージング環境では、サフィックスで区別：

```
Eduanima_main_dev          # 開発環境
Eduanima_main_staging      # ステージング環境
Eduanima_main_prod         # 本番環境（または Eduanima_main）
```

### 3.4 ベストプラクティスの根拠

1. **PostgreSQL/MySQL標準**: アンダースコアは広く互換性がある
2. **AWS RDS**: 命名規則に準拠
3. **バックアップ管理**: 環境別に明確に識別可能
4. **監視ツール**: Grafana/Prometheus で識別しやすい

---

## 4. テーブル命名規則

### 4.1 基本ルール

**フォーマット**: `<entity_name>` または `<entity>_<relation>`
- **ケース**: snake_case（全て小文字 + アンダースコア）
- **単数形/複数形**: **複数形を使用**（業界標準）
- **プレフィックス**: 基本的に不要（マイクロサービスでDB分離されているため）

### 4.2 テーブル種別と命名パターン

#### エンティティテーブル（主要データ）
```sql
users                  # ユーザー情報
exams                  # 試験データ
questions              # 問題
sub_questions          # 小問
files                  # ファイル情報
notifications          # 通知
```

#### 関連テーブル（多対多）
```sql
user_follows           # ユーザーフォロー関係
question_keywords      # 問題とキーワードの関連
exam_likes             # 試験へのいいね
```

#### 統計・メタデータテーブル
```sql
exam_stats             # 試験統計情報
user_profiles          # ユーザープロフィール詳細
file_storage_paths     # ファイルストレージパス
search_index_metadata  # 検索インデックスメタ
```

#### トランザクション・ログテーブル
```sql
wallet_transactions    # ウォレットトランザクション
payment_histories      # 決済履歴
ai_processing_logs     # AI処理ログ
moderation_actions     # モデレーション履歴
```

#### イベント・監査テーブル
```sql
job_events             # ジョブイベント履歴
report_audit           # 通報監査ログ
coin_transaction_logs  # コイン取引ログ
```

### 4.3 命名の原則

#### ✅ DO (推奨)
- **複数形**: `users`, `exams`, `orders` （一部例外: `auth`, `config`）
- **明確性**: 役割が明確にわかる名前
- **一貫性**: プロジェクト全体で同じルール
- **長さ**: 2-4単語が理想的

```sql
✓ users                    # シンプルで明確
✓ user_profiles            # 詳細情報を示す
✓ exam_comments            # 所属とリソースが明確
✓ oauth_tokens             # 業界標準の略語
✓ notification_preferences # 設定テーブル
```

#### ❌ DON'T (非推奨)
```sql
✗ tbl_users                # 不要なプレフィックス
✗ user_table               # 冗長
✗ UserComments             # PascalCase（SQL標準違反）
✗ user-comments            # ハイフン（互換性問題）
✗ comments_from_users      # 冗長で不明瞭
✗ uc                       # 過度な略語
```

### 4.4 特殊なテーブル

#### マスターデータ
```sql
keywords               # キーワードマスタ
report_reasons         # 通報理由コード
subscription_plans     # サブスクリプションプラン
ad_campaigns           # 広告キャンペーン
```

#### 一時・キャッシュテーブル
```sql
temp_processing_jobs   # 一時処理ジョブ（tempプレフィックス）
cache_search_results   # キャッシュ検索結果
```

#### ビュー・マテリアライズドビュー
```sql
vw_user_statistics           # ビュー（vwプレフィックス）
mv_exam_analytics            # マテリアライズドビュー（mvプレフィックス）
mv_revenue_daily_summary     # 日次集計ビュー
```

### 4.5 カラム命名規則

#### 主キー
```sql
id                     # シンプルな主キー (推奨)
user_id                # 外部キーとして使用時は明示的に
exam_id                # リソースIDを明確に
```

#### 外部キー
```sql
user_id                # 参照先テーブル名 + _id
exam_id
question_id
created_by_user_id     # 役割が複数ある場合は明示
```

#### タイムスタンプ
```sql
created_at             # 作成日時 (推奨)
updated_at             # 更新日時 (推奨)
deleted_at             # 論理削除日時 (Soft Delete)
published_at           # 公開日時
completed_at           # 完了日時
```

#### ブール値
```sql
is_active              # is_ プレフィックス (推奨)
is_public
is_verified
has_premium_access     # has_ プレフィックス
can_comment            # can_ プレフィックス
```

#### ステータス・列挙型
```sql
status                 # 'pending', 'processing', 'completed'
user_type              # 'student', 'teacher', 'admin'
payment_method         # 'credit_card', 'bank_transfer'
```

### 4.6 ベストプラクティスの根拠

1. **PostgreSQL/MySQL慣習**: snake_case が標準
2. **Rails Active Record**: 複数形テーブル名が標準
3. **Django ORM**: snake_case が標準
4. **可読性**: 小文字+アンダースコアは可読性が高い
5. **SQL標準**: 大文字小文字の混在を避ける

---

## 5. Kafkaトピック命名規則

### 5.1 基本ルール

**フォーマット**: `<domain>.<resource>.<event>`
- **ドメイン**: ビジネスドメイン（小文字）
- **リソース**: エンティティ名（小文字）
- **イベント**: 過去形の動詞（小文字）
- **区切り**: ドット（`.`）

### 5.2 実例

```
auth.user.logged_in              # ユーザーログイン
auth.user.signed_up              # ユーザー登録
gateway.job.created              # ジョブ作成
gateway.job.completed            # ジョブ完了
content.exam.created             # 試験作成
content.exam.updated             # 試験更新
content.exam.deleted             # 試験削除
ai.processing.completed          # AI処理完了
ai.processing.failed             # AI処理失敗
social.exam.liked                # 試験いいね
social.exam.commented            # コメント投稿
notify.notification.sent         # 通知送信
```

### 5.3 命名の原則

#### ✅ DO (推奨)
```
✓ content.exam.created           # 明確なドメイン.リソース.イベント
✓ user.profile.updated           # 標準的な構造
✓ payment.transaction.completed  # 理解しやすい
```

#### ❌ DON'T (非推奨)
```
✗ ExamCreated                    # PascalCase（Kafka慣習違反）
✗ exam-created                   # ハイフン使用
✗ create_exam                    # 動詞の現在形
✗ exam.content.created           # ドメインとリソースが逆
```

### 5.4 ベストプラクティスの根拠

1. **Confluent推奨**: `<domain>.<resource>.<event>` パターン
2. **Event Sourcing**: 過去形でイベントを表現
3. **拡張性**: 階層構造で整理しやすい

---

## 6. API エンドポイント命名規則

### 6.1 RESTful API

**フォーマット**: `/v{version}/{resources}/{id}/{sub-resources}`
- **バージョン**: v1, v2, ...
- **リソース**: 複数形、kebab-case
- **アクション**: HTTP メソッドで表現

### 6.2 実例

```
GET    /v1/users                    # ユーザー一覧取得
GET    /v1/users/{id}               # ユーザー詳細取得
POST   /v1/users                    # ユーザー作成
PUT    /v1/users/{id}               # ユーザー更新
DELETE /v1/users/{id}               # ユーザー削除

GET    /v1/exams                    # 試験一覧
GET    /v1/exams/{id}               # 試験詳細
GET    /v1/exams/{id}/questions     # 試験の問題一覧
POST   /v1/exams/{id}/comments      # コメント投稿

GET    /v1/jobs/{id}                # ジョブステータス取得
POST   /v1/jobs                     # ジョブ作成
GET    /v1/jobs/{id}/events         # ジョブイベント履歴
```

### 6.3 非RESTfulアクション

カスタムアクションが必要な場合は動詞を使用：

```
POST   /v1/users/{id}/activate      # ユーザー有効化
POST   /v1/exams/{id}/publish       # 試験公開
POST   /v1/files/{id}/upload        # ファイルアップロード
POST   /v1/auth/refresh-token       # トークンリフレッシュ
GET    /v1/search/exams             # 検索（検索専用エンドポイント）
```

### 6.4 命名の原則

#### ✅ DO (推奨)
```
✓ /v1/users                  # 複数形、シンプル
✓ /v1/exam-comments          # kebab-case
✓ /v1/users/{id}/followers   # 関連リソース
```

#### ❌ DON'T (非推奨)
```
✗ /v1/getUsers               # 動詞を含めない（HTTPメソッドで表現）
✗ /v1/user                   # 単数形
✗ /v1/users_list             # 冗長
✗ /v1/Users                  # PascalCase
```

### 6.5 ベストプラクティスの根拠

1. **Google API Design Guide**: RESTful 設計原則
2. **Microsoft REST API Guidelines**: 命名規約
3. **OpenAPI Specification**: 業界標準
4. **URI RFC 3986**: URL構造の標準

---

## 7. gRPC サービス・メソッド命名規則

### 7.1 サービス名

**フォーマット**: `<ServiceName>Service`
- **サービス名**: PascalCase
- **サフィックス**: `Service`

```protobuf
service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse);
}

service ExamService {
  rpc ListExams(ListExamsRequest) returns (ListExamsResponse);
  rpc GetExam(GetExamRequest) returns (GetExamResponse);
  rpc CreateExam(CreateExamRequest) returns (CreateExamResponse);
}

service SearchService {
  rpc Search(SearchRequest) returns (SearchResponse);
  rpc GetSearchSuggestions(GetSearchSuggestionsRequest) returns (GetSearchSuggestionsResponse);
}
```

### 7.2 メソッド命名パターン

```protobuf
// 標準的なCRUD操作
rpc Get<Resource>           # 単一リソース取得
rpc List<Resources>         # リソース一覧取得
rpc Create<Resource>        # リソース作成
rpc Update<Resource>        # リソース更新
rpc Delete<Resource>        # リソース削除

// カスタムメソッド
rpc Search<Resources>       # 検索
rpc Batch<Action>           # バッチ処理
rpc <Action><Resource>      # カスタムアクション
```

### 7.3 ベストプラクティスの根拠

1. **Google API Design Guide**: gRPC 命名規約
2. **Protocol Buffers Style Guide**: 公式スタイルガイド

---

## 8. 環境変数命名規則

### 8.1 基本ルール

**フォーマット**: `<SERVICE>_<CATEGORY>_<NAME>`
- **ケース**: SCREAMING_SNAKE_CASE（全て大文字 + アンダースコア）
- **プレフィックス**: サービス名またはプロジェクト名

### 8.2 実例

```bash
# データベース接続
EDUANIMA_DB_HOST=localhost
EDUANIMA_DB_PORT=5432
EDUANIMA_DB_NAME=eduanima_main
EDUANIMA_DB_USER=eduanima_user
EDUANIMA_DB_PASSWORD=***

# Redis
EDUANIMA_REDIS_HOST=localhost
EDUANIMA_REDIS_PORT=6379
EDUANIMA_REDIS_PASSWORD=***

# AWS S3
EDUANIMA_S3_BUCKET=eduanima-files-prod
EDUANIMA_S3_REGION=ap-northeast-1
EDUANIMA_S3_ACCESS_KEY=***
EDUANIMA_S3_SECRET_KEY=***

# Kafka
EDUANIMA_KAFKA_BROKERS=kafka1:9092,kafka2:9092
EDUANIMA_KAFKA_GROUP_ID=eduanima-consumer-group

# アプリケーション設定
EDUANIMA_APP_ENV=production
EDUANIMA_APP_PORT=8080
EDUANIMA_APP_LOG_LEVEL=info

# 認証
EDUANIMA_AUTH_JWT_SECRET=***
EDUANIMA_AUTH_JWT_EXPIRY=3600

# 外部サービス
EDUANIMA_GEMINI_API_KEY=***
EDUANIMA_ELASTICSEARCH_URL=http://es:9200
```

### 8.3 命名の原則

#### ✅ DO (推奨)
```bash
✓ EDUANIMA_DB_HOST              # 明確なカテゴリ
✓ EDUANIMA_REDIS_PASSWORD       # サービス別に分類
✓ EDUANIMA_APP_LOG_LEVEL        # 設定の種類が明確
```

#### ❌ DON'T (非推奨)
```bash
✗ dbhost                        # 小文字（標準違反）
✗ EDUANIMA_DATABASE_HOSTNAME    # 冗長
✗ DB-HOST                       # ハイフン使用
✗ eduanima_db_host              # snake_case（大文字が標準）
```

### 8.4 ベストプラクティスの根拠

1. **POSIX標準**: SCREAMING_SNAKE_CASE が標準
2. **12-Factor App**: 環境変数の使用原則
3. **Docker/Kubernetes**: 標準的な命名規約

---

## 9. Kubernetes リソース命名規則

### 9.1 基本ルール

**フォーマット**: `<app-name>-<component>-<environment>`
- **ケース**: kebab-case（小文字 + ハイフン）
- **DNS-1123準拠**: 英数字とハイフンのみ、63文字以内

### 9.2 実例

```yaml
# Deployment
eduanima-gateway-deployment
eduanima-auth-deployment
eduanima-content-deployment

# Service
eduanima-gateway-service
eduanima-auth-service
eduanima-db-service

# ConfigMap
eduanima-gateway-config
eduanima-app-settings

# Secret
eduanima-db-credentials
eduanima-api-keys

# Ingress
eduanima-ingress
eduanima-api-ingress

# Namespace
eduanima-prod
eduanima-staging
eduanima-dev
```

### 9.3 ベストプラクティスの根拠

1. **Kubernetes Naming**: DNS-1123 label standard
2. **可読性**: kebab-case は URL フレンドリー

---

## 10. ファイル・ディレクトリ命名規則

### 10.1 ソースコードファイル

```
# TypeScript/JavaScript
UserProfile.tsx              # React Component (PascalCase)
userService.ts               # Service/Utility (camelCase)
user.types.ts                # Type definitions (camelCase + suffix)
user.test.ts                 # Test files (camelCase + .test)

# Go
user_service.go              # Go files (snake_case)
user_service_test.go         # Go test files

# Python
user_service.py              # Python files (snake_case)
test_user_service.py         # Python test files
```

### 10.2 設定ファイル

```
.env                         # 環境変数
.env.local                   # ローカル環境変数
.env.development             # 開発環境
.env.production              # 本番環境

docker-compose.yml           # Docker設定
docker-compose.dev.yml       # 開発環境Docker
Dockerfile                   # Dockerfile (大文字始まり)

package.json                 # Node.js設定
tsconfig.json                # TypeScript設定
```

---

## 11. まとめ：クイックリファレンス

| カテゴリ | ケース | 例 | 備考 |
|---------|--------|-----|------|
| マイクロサービス | camelCase | `eduanimaAuth` | プレフィックス: eduanima |
| 物理データベース | snake_case | `user_db`, `content_db` | Database-per-Service |
| テーブル | snake_case | `users`, `profiles` | 複数形推奨、プレフィックスなし |
| カラム | snake_case | `user_id`, `created_at` | 意味が明確 |
| Kafkaトピック | dot.notation | `content.exam.created` | domain.resource.event |
| REST API | kebab-case | `/v1/exam-comments` | 複数形、バージョニング |
| gRPCサービス | PascalCase | `UserService` | Service サフィックス |
| gRPCメソッド | PascalCase | `GetUser`, `ListUsers` | 動詞+名詞 |
| 環境変数 | SCREAMING_SNAKE | `EDUANIMA_DB_HOST` | 大文字+アンダースコア |
| Kubernetes | kebab-case | `eduanima-gateway-deployment` | DNS-1123準拠 |
| TypeScript Component | PascalCase | `UserProfile.tsx` | React標準 |
| TypeScript Service | camelCase | `userService.ts` | ユーティリティ |
| Go ファイル | snake_case | `user_service.go` | Go標準 |
| Python ファイル | snake_case | `user_service.py` | Python標準 |

**重要な変更点 (v2.0)**:
- 物理DB名: `Eduanima_main` → `user_db` (Database-per-Service)
- テーブル名プレフィックス: 不要（各サービスのDB内でユニーク）
- 環境別DB: `user_db_dev`, `user_db_staging`, `user_db_prod`

---

## 12. 参考資料

### 業界標準・ガイドライン
1. **Google API Design Guide**: https://cloud.google.com/apis/design
2. **Microsoft REST API Guidelines**: https://github.com/microsoft/api-guidelines
3. **AWS Well-Architected Framework**: https://aws.amazon.com/architecture/well-architected/
4. **Kubernetes Naming Conventions**: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/
5. **PostgreSQL Naming Conventions**: https://www.postgresql.org/docs/current/sql-syntax-lexical.html
6. **Confluent Kafka Topic Naming**: https://docs.confluent.io/platform/current/schema-registry/fundamentals/data-contracts.html

### アーキテクチャパターン
1. **Domain-Driven Design (DDD)**: Eric Evans
2. **Microservices Patterns**: Chris Richardson
3. **Building Microservices**: Sam Newman
4. **12-Factor App**: https://12factor.net/

### プロジェクト内参考文書
- `F_ARCHITECTURE_OVERALL.md`: マイクロサービスアーキテクチャ全体像
- `Q_DATABASE.md`: データベース設計書
- `E_DATA_MODEL.md`: データモデル定義
- `D_INTERFACE_SPEC.md`: API仕様

---

## 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|------|-----------|---------|--------|
| 2026-02-12 | 2.0.0 | Database-per-Service適用、物理DB名見直し | System |
| 2026-02-12 | 1.0.0 | 初版作成 | System |

**v2.0の主要変更**:
- 物理データベース命名: `Eduanima_<purpose>` → `[service_name]_db`
- Database-per-Serviceパターンの全面適用
- 共有DBから専用DBへの移行ガイドライン追加
- MSAベストプラクティス（Sam Newman, Chris Richardson）の明示的な引用
- アンチパターン（分散モノリス）の警告追加

---

**ドキュメント管理**
- **ファイル名**: `N_NAMING_CONVENTIONS.md`
- **カテゴリ**: アーキテクチャ・設計標準
- **更新頻度**: 四半期ごとまたは重要な設計変更時
- **関連ドキュメント**: Q_DATABASE.md (Database-per-Service実装例)
