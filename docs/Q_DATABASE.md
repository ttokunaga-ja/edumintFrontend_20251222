# Q_DATABASE - Eduanimaデータベース設計書

## 1. 概要

このドキュメントは、Eduanimaプロジェクトにおける各マイクロサービスとデータベーステーブルの関係を整理したものです。
各Phase（開発フェーズ）ごとに、どのマイクロサービスがどのテーブルを使用し、それらがどの物理データベースに配置されるかを示します。

### 1.1 アーキテクチャ原則

本プロジェクトは**Database-per-Service**パターンを採用し、以下の原則に従います：

1. **サービス独立性**: 各マイクロサービスは専用の物理データベースを所有
2. **疎結合**: サービス間のデータアクセスはAPI/イベント駆動で実現
3. **境界づけられたコンテキスト**: DDDに基づき、異なるサービス間でのテーブル名重複を許容
4. **スキーマ自律性**: 各サービスが独自にスキーマ変更を行え、他サービスへの影響を最小化

### 1.2 命名規則

- **物理DB名**: `[service_name]_db` (snake_case、例: `user_db`, `content_db`)
- **環境別サフィックス**: 
  - 開発: `[service]_db_dev`
  - ステージング: `[service]_db_staging`
  - 本番: `[service]_db_prod` または `[service]_db`
- **テーブル名**: `[resource_plural]` (複数形の名詞、サービス名プレフィックスなし)

## 2. Phase別実装計画

### 2.5.2 Phase 1 (MVP) - 2026 Q2-Q3

Phase 1では、過去問アップロードからAIによる問題生成・閲覧・検索まで、中核となるユーザー体験を実現します。

#### 実装サービス（7個）
- EduanimaGateways: ジョブオーケストレーション、API Gateway
- EduanimaUsers: ユーザー認証・プロフィール管理
- EduanimaContents: 試験データのドメインロジック（Source of Truth）
- EduanimaFiles: ファイルアップロード・ストレージ管理
- EduanimaSearch: キーワード・ベクトル検索
- EduanimaAiWorker: AI処理（問題抽出・生成）
- EduanimaModeration: コンテンツ通報・モデレーション

#### 使用するテーブル
各サービスが管理するテーブルと物理データベースの配置は以下の通りです。

#### Phase 1 テーブル構成

| マイクロサービス | 使用テーブル | 物理データベース | 備考 |
|-----------------|-------------|----------------|------|
| EduanimaGateways | jobs | gateway_db | 全ジョブタイプの統一管理 (exam_creation, file_processing, index_rebuild等) |
| EduanimaGateways | job_events | gateway_db | ジョブイベント履歴 |
| EduanimaUsers | users | user_db | ユーザー基本情報 |
| EduanimaUsers | profiles | user_db | プロフィール詳細情報 |
| EduanimaUsers | oauth_clients | user_db | OAuth2クライアント設定 |
| EduanimaUsers | oauth_tokens | user_db | JWTトークン管理 |
| EduanimaUsers | idp_links | user_db | SSOプロバイダ連携情報 |
| EduanimaUsers | auth_tokens | user_db | 認証トークン管理 |
| EduanimaUsers | sso_providers | user_db | SSO連携設定 |
| EduanimaUsers | follows | user_db | ユーザーフォロー関係 |
| EduanimaContents | exams | content_db | 試験メタデータ |
| EduanimaContents | exam_stats | content_db | 試験統計情報 |
| EduanimaContents | questions | content_db | 大問データ |
| EduanimaContents | sub_questions | content_db | 小問データ |
| EduanimaContents | keywords | content_db | キーワードマスタ |
| EduanimaContents | question_keywords | content_db | 問題-キーワード関連 |
| EduanimaFiles | files | file_db | ファイルメタデータ |
| EduanimaFiles | storage_paths | file_db | S3パス管理 |
| EduanimaFiles | inputs | file_db | ファイル処理ジョブ（ジョブID、パス、ステータス等）|
| EduanimaSearch | index_metadata | search_db | 検索インデックスメタ情報 |
| EduanimaAiWorker | processing_logs | ai_worker_db | AI処理ログ |
| EduanimaAiWorker | model_configs | ai_worker_db | AIモデル設定 |
| EduanimaModeration | reports | moderation_db | 通報データ |
| EduanimaModeration | report_reasons | moderation_db | 通報理由コードマスタ |
| EduanimaModeration | audit_logs | moderation_db | モデレーション処理監査ログ |
| EduanimaModeration | actions | moderation_db | モデレーション履歴 |

**備考**:
- Elasticsearchインデックス: EduanimaSearchが管理（キーワード検索用）
- Qdrantベクトルストア: EduanimaSearchが管理（セマンティック検索用）
- S3ストレージ: EduanimaFilesが管理（実ファイル保存先）
- 廃止されたテーブル: `exam_creation_jobs`, `extraction_jobs`, `outbox` は統合され、`jobs`テーブルで一元管理されています

**Database-per-Service設計のポイント**:
- 各サービスは専用のデータベースを持ち、完全な自律性を保持
- サービス間でテーブル名が重複する可能性がありますが、これは境界づけられたコンテキストの適切な実装を示します
- 例: `users`テーブルは複数サービスで異なる目的で存在可能（user_dbの認証情報 vs social_dbのプロフィール情報）

---

### 2.5.3 Phase 2 (SNS拡張・マネタイズ基盤) - 2026 Q4-2027 Q1

Phase 2では、収益化モデルの確立とコミュニティ機能の導入を行います。

#### 追加サービス（4個）
- EduanimaSocial: SNS機能（いいね・コメント・フォロー）
- EduanimaNotification: 通知管理
- EduanimaAnalytics: アクセス解析・レポート
- EduanimaAds: 広告配信・管理

#### 新規使用テーブル
Phase 2で追加されるテーブルは以下の通りです。

#### Phase 2 テーブル構成

| マイクロサービス | 使用テーブル | 物理データベース | 備考 |
|-----------------|-------------|----------------|------|
| EduanimaSocial | likes | social_db | 試験へのいいね |
| EduanimaSocial | comments | social_db | コメント本体 |
| EduanimaSocial | views | social_db | 閲覧履歴 |
| EduanimaSocial | bookmarks | social_db | ブックマーク |
| EduanimaNotification | notifications | notification_db | 通知データ |
| EduanimaNotification | preferences | notification_db | 通知設定 |
| EduanimaNotification | templates | notification_db | 通知テンプレート |
| EduanimaAnalytics | activity_logs | analytics_db | ユーザー行動ログ |
| EduanimaAnalytics | exam_analytics | analytics_db | 試験別分析データ |
| EduanimaAnalytics | aggregated_stats | analytics_db | 集計統計 |
| EduanimaAds | campaigns | ads_db | 広告キャンペーン |
| EduanimaAds | impressions | ads_db | 広告表示ログ |
| EduanimaAds | clicks | ads_db | 広告クリックログ |

**Database-per-Service設計の効果**:
- 各サービスが独立したスキーマ進化を実現
- 例: `social_db`の`comments`テーブルと`notification_db`の構造は完全に独立
- サービス間のデータ同期はイベント駆動（Kafka等）で実現

---

### 2.5.4 Phase 3 (AI Agent Tutor) - 2027 Q2-Q3

Phase 3では、AIチューター機能と高度なパーソナライゼーションを導入します。

#### 追加サービス（1個）
- EduanimaAiTutor: AI家庭教師機能、学習推薦

#### 新規使用テーブル
Phase 3で追加されるテーブルは以下の通りです。

#### Phase 3 テーブル構成

| マイクロサービス | 使用テーブル | 物理データベース | 備考 |
|-----------------|-------------|----------------|------|
| EduanimaAiTutor | sessions | ai_tutor_db | チューターセッション |
| EduanimaAiTutor | learning_paths | ai_tutor_db | 学習パス管理 |
| EduanimaAiTutor | progress | ai_tutor_db | 学習進捗データ |
| EduanimaAiTutor | recommendations | ai_tutor_db | AI推薦履歴 |
| EduanimaAiTutor | feedback | ai_tutor_db | チューターフィードバック |
| EduanimaAiTutor | conversation_logs | ai_tutor_db | 会話ログ |

---

### 2.5.5 Phase XX (収益化) - 実施時期未定

Phase XXでは、本格的な収益化機能を実装します。

#### 追加サービス（2個）
- EduanimaMonetizeWallet: MintCoin管理、ウォレット機能
- EduanimaRevenue: 収益分配、サブスクリプション管理

#### 新規使用テーブル
Phase XXで追加されるテーブルは以下の通りです。

#### Phase XX テーブル構成

| マイクロサービス | 使用テーブル | 物理データベース | 備考 |
|-----------------|-------------|----------------|------|
| EduanimaMonetizeWallet | wallets | wallet_db | ウォレット情報 |
| EduanimaMonetizeWallet | transactions | wallet_db | トランザクション履歴 |
| EduanimaMonetizeWallet | coin_balances | wallet_db | MintCoin残高 |
| EduanimaMonetizeWallet | transaction_logs | wallet_db | コイン取引ログ |
| EduanimaRevenue | distributions | revenue_db | 収益分配データ |
| EduanimaRevenue | subscription_plans | revenue_db | サブスクプラン |
| EduanimaRevenue | subscriptions | revenue_db | ユーザー契約情報 |
| EduanimaRevenue | payment_histories | revenue_db | 決済履歴 |
| EduanimaRevenue | reports | revenue_db | 収益レポート |
| EduanimaRevenue | ad_impressions_agg | revenue_db | 広告インプレッション集計データ |

---

## 3. 物理データベース構成

### 3.1 データベース概要

本プロジェクトは**Database-per-Service**パターンを採用し、各マイクロサービスが専用のデータベースを所有します。

| 物理データベース名 | 所有サービス | 用途 | 特性 |
|-------------------|-------------|------|------|
| gateway_db | EduanimaGateways | ジョブオーケストレーション | トランザクション管理、ACID準拠 |
| user_db | EduanimaUsers | ユーザー認証・プロフィール | 高整合性、セキュリティ重視 |
| content_db | EduanimaContents | 試験コンテンツマスタ | 読み込み最適化、大容量 |
| file_db | EduanimaFiles | ファイルメタデータ | S3連携、メタデータ管理 |
| search_db | EduanimaSearch | 検索インデックスメタ | 検索性能重視 |
| ai_worker_db | EduanimaAiWorker | AI処理ログ・設定 | 大容量ログ、設定管理 |
| moderation_db | EduanimaModeration | モデレーション | 監査ログ、コンプライアンス |
| social_db | EduanimaSocial | SNS機能 | 高頻度書き込み、スケーラビリティ |
| notification_db | EduanimaNotification | 通知管理 | 配信管理、設定保存 |
| analytics_db | EduanimaAnalytics | アクセス解析 | 大容量、集計最適化 |
| ads_db | EduanimaAds | 広告配信 | ログ記録、キャンペーン管理 |
| ai_tutor_db | EduanimaAiTutor | AIチューター | 学習データ、会話履歴 |
| wallet_db | EduanimaMonetizeWallet | ウォレット | トランザクション、残高管理 |
| revenue_db | EduanimaRevenue | 収益分配 | 決済、サブスク管理 |

### 3.2 Database per Service原則

各マイクロサービスは自身が所有するテーブルにのみ書き込み権限を持ち、他サービスのデータは API またはイベント経由でアクセスします。これにより、サービス間の疎結合性を維持し、独立したスケーリングとデプロイを実現します。

#### 主要な利点

1. **独立したスキーマ進化**: 各サービスが他に影響せずにDB構造を変更可能
2. **技術スタック自由度**: サービスごとに最適なDBエンジンを選択可能（PostgreSQL, MySQL, MongoDB等）
3. **障害の局所化**: 1つのDBの問題が他サービスに波及しない
4. **スケーラビリティ**: 負荷の高いサービスのDBのみをスケールアウト可能
5. **セキュリティ**: サービスごとにアクセス制御を細かく設定可能

#### テーブル名重複の許容

異なるサービス間でのテーブル名重複は、**境界づけられたコンテキスト（Bounded Context）**が適切に実装されている証拠です：

**例**: `users`テーブル
- `user_db.users`: 認証情報（ID、パスワードハッシュ、メールアドレス）
- `social_db.users`: ソーシャル情報（ニックネーム、アバター、フォロワー数）
- これらは異なるコンテキストを表し、それぞれが独立して進化します

### 3.3 サービス間通信

Database-per-Serviceパターンでは、サービス間のデータ共有は以下の方法で実現します：

1. **同期通信**: REST API / gRPC
   - リアルタイム性が求められるデータ取得
   - 例: ユーザープロフィール情報の取得

2. **非同期通信**: イベント駆動（Kafka）
   - データ変更の通知と同期
   - 例: ユーザー登録イベント → 各サービスが必要なデータをローカルに保存

3. **結果整合性（Eventual Consistency）**
   - 即座の整合性ではなく、最終的な整合性を保証
   - 分散システムにおける現実的なトレードオフ

### 3.4 環境別データベース命名

各環境ごとに物理DBを分離し、環境サフィックスで識別します：

```
開発環境:       user_db_dev, content_db_dev, ...
ステージング:   user_db_staging, content_db_staging, ...
本番環境:       user_db_prod (または user_db), content_db_prod, ...
```

### 3.5 移行戦略

既存の共有DB（`Eduanima_main`等）から移行する場合：

1. **段階的移行**: サービスごとに順次データを専用DBに移行
2. **データ複製期間**: 移行中は両DBを維持し、データ同期を実施
3. **API層での抽象化**: フロントエンドへの影響を最小化
4. **ロールバック計画**: 問題発生時の切り戻し手順を整備

---

## 4. ベストプラクティスと参考文献

### 4.1 設計原則の理論的根拠

本設計は以下の業界標準とベストプラクティスに基づいています：

1. **Sam Newman "Building Microservices" (2nd Ed, 2021)**
   - Database-per-Serviceパターンの重要性
   - サービス境界とデータ境界の一致

2. **Chris Richardson "Microservices Patterns"**
   - 各サービスが自身のDBを所有
   - API/イベント駆動によるデータ共有

3. **Domain-Driven Design (Eric Evans)**
   - 境界づけられたコンテキスト（Bounded Context）
   - テーブル名重複の理論的正当性

4. **Google Cloud Architecture Framework**
   - リソース命名の整合性
   - 環境識別可能な命名規則

5. **Microsoft Azure Well-Architected Framework**
   - マイクロサービスにおけるデータ分離
   - コンテキストごとのデータ重複の許容

### 4.2 アンチパターンの回避

以下のアンチパターンを避けることが重要です：

❌ **分散モノリス**
- 複数サービスが同じ物理DBの同じスキーマを共有
- MSAの利点（独立デプロイ、スケーラビリティ）を失う

❌ **過度なサービス名プレフィックス**
- テーブル名に `user_service_users` のようなプレフィックス
- DRY原則に反し、冗長性が高い

❌ **共有データベース**
- `Eduanima_main` のような共有DB
- サービス間の密結合を生み、独立性を損なう

### 4.3 実装時の推奨事項

1. **Infrastructure as Code (IaC)**
   - Terraform/CDKでDB構築を自動化
   - `var.service_name` を変数としてDB名に注入

2. **メタデータ管理**
   - DBの「タグ」や「コメント」で所有チーム/サービス名を管理
   - テーブル名にサービス名を含めない代わりに活用

3. **監視とオブザーバビリティ**
   - サービスごとのDB性能メトリクスを監視
   - 独立したアラート設定

4. **バックアップと災害復旧**
   - サービスごとのバックアップポリシー
   - RPO/RTOの個別設定

---

## 参考資料
- [F_ARCHITECTURE_OVERALL.md](F_ARCHITECTURE_OVERALL.md): マイクロサービスアーキテクチャ全体像
- [E_DATA_MODEL.md](E_DATA_MODEL.md): データモデル定義
- [N_NAMING_CONVENTIONS.md](N_NAMING_CONVENTIONS.md): 命名規約ガイド
- [Z_SYSTEM_ARCHITECTURE_ALIGNMENT_CHECK.md](Z_SYSTEM_ARCHITECTURE_ALIGNMENT_CHECK.md): アーキテクチャ整合性チェック

---

**ドキュメントバージョン**: 2.0.0 (MSA Best Practices適用版)
**最終更新**: 2026-02-12
**変更内容**: Database-per-Serviceパターンへの全面移行、物理DB名・テーブル名の見直し

