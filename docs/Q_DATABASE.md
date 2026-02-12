# Q_DATABASE - Eduanimaデータベース設計書

## 1. 概要

このドキュメントは、Eduanimaプロジェクトにおける各マイクロサービスとデータベーステーブルの関係を整理したものです。
各Phase（開発フェーズ）ごとに、どのマイクロサービスがどのテーブルを使用し、それらがどの物理データベースに配置されるかを示します。

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
| EduanimaGateways | jobs | Eduanima_main | 全ジョブタイプの統一管理 |
| EduanimaGateways | job_events | Eduanima_main | ジョブイベント履歴 |
| EduanimaUsers | users | Eduanima_main | ユーザー基本情報 |
| EduanimaUsers | user_profiles | Eduanima_main | プロフィール詳細情報 |
| EduanimaUsers | auth_tokens | Eduanima_main | 認証トークン管理 |
| EduanimaUsers | sso_providers | Eduanima_main | SSO連携設定 |
| EduanimaContents | exams | Eduanima_contents_master | 試験メタデータ |
| EduanimaContents | exam_stats | Eduanima_contents_master | 試験統計情報 |
| EduanimaContents | questions | Eduanima_contents_master | 大問データ |
| EduanimaContents | sub_questions | Eduanima_contents_master | 小問データ |
| EduanimaContents | keywords | Eduanima_contents_master | キーワードマスタ |
| EduanimaContents | question_keywords | Eduanima_contents_master | 問題-キーワード関連 |
| EduanimaFiles | files | Eduanima_main | ファイルメタデータ |
| EduanimaFiles | file_storage_paths | Eduanima_main | S3パス管理 |
| EduanimaSearch | search_index_metadata | Eduanima_contents_search | 検索インデックスメタ情報 |
| EduanimaAiWorker | ai_processing_logs | Eduanima_logs | AI処理ログ |
| EduanimaAiWorker | ai_model_configs | Eduanima_main | AIモデル設定 |
| EduanimaModeration | reports | Eduanima_main | 通報データ |
| EduanimaModeration | moderation_actions | Eduanima_logs | モデレーション履歴 |

**備考**:
- Elasticsearchインデックス: EduanimaSearchが管理（キーワード検索用）
- Qdrantベクトルストア: EduanimaSearchが管理（セマンティック検索用）
- S3ストレージ: EduanimaFilesが管理（実ファイル保存先）

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
| EduanimaSocial | exam_likes | Eduanima_main | 試験へのいいね |
| EduanimaSocial | exam_comments | Eduanima_main | コメント本体 |
| EduanimaSocial | exam_views | Eduanima_main | 閲覧履歴 |
| EduanimaSocial | user_follows | Eduanima_main | ユーザーフォロー関係 |
| EduanimaSocial | exam_bookmarks | Eduanima_main | ブックマーク |
| EduanimaNotification | notifications | Eduanima_main | 通知データ |
| EduanimaNotification | notification_preferences | Eduanima_main | 通知設定 |
| EduanimaNotification | notification_templates | Eduanima_main | 通知テンプレート |
| EduanimaAnalytics | user_activity_logs | Eduanima_logs | ユーザー行動ログ |
| EduanimaAnalytics | exam_analytics | Eduanima_logs | 試験別分析データ |
| EduanimaAnalytics | aggregated_stats | Eduanima_logs | 集計統計 |
| EduanimaAds | ad_campaigns | Eduanima_main | 広告キャンペーン |
| EduanimaAds | ad_impressions | Eduanima_logs | 広告表示ログ |
| EduanimaAds | ad_clicks | Eduanima_logs | 広告クリックログ |

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
| EduanimaAiTutor | tutor_sessions | Eduanima_main | チューターセッション |
| EduanimaAiTutor | learning_paths | Eduanima_main | 学習パス管理 |
| EduanimaAiTutor | user_progress | Eduanima_main | 学習進捗データ |
| EduanimaAiTutor | recommendations | Eduanima_main | AI推薦履歴 |
| EduanimaAiTutor | tutor_feedback | Eduanima_main | チューターフィードバック |
| EduanimaAiTutor | conversation_logs | Eduanima_logs | 会話ログ |

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
| EduanimaMonetizeWallet | wallets | Eduanima_main | ウォレット情報 |
| EduanimaMonetizeWallet | wallet_transactions | Eduanima_main | トランザクション履歴 |
| EduanimaMonetizeWallet | mint_coin_balances | Eduanima_main | MintCoin残高 |
| EduanimaMonetizeWallet | coin_transaction_logs | Eduanima_logs | コイン取引ログ |
| EduanimaRevenue | revenue_distributions | Eduanima_main | 収益分配データ |
| EduanimaRevenue | subscription_plans | Eduanima_main | サブスクプラン |
| EduanimaRevenue | user_subscriptions | Eduanima_main | ユーザー契約情報 |
| EduanimaRevenue | payment_histories | Eduanima_main | 決済履歴 |
| EduanimaRevenue | revenue_reports | Eduanima_logs | 収益レポート |

---

## 3. 物理データベース構成

### 3.1 データベース概要

| 物理データベース名 | 用途 | 特性 |
|-------------------|------|------|
| Eduanima_main | マスターデータ、トランザクションデータ | 高整合性、ACID準拠 |
| Eduanima_contents_master | 試験コンテンツマスタ | 読み込み最適化 |
| Eduanima_contents_search | 検索インデックスメタデータ | 検索性能重視 |
| Eduanima_logs | ログ、分析データ | 大容量、追記最適化 |

### 3.2 Database per Service原則

各マイクロサービスは自身が所有するテーブルにのみ書き込み権限を持ち、他サービスのデータは API またはイベント経由でアクセスします。これにより、サービス間の疎結合性を維持し、独立したスケーリングとデプロイを実現します。

---

## 参考資料
- [F_ARCHITECTURE_OVERALL.md](F_ARCHITECTURE_OVERALL.md): マイクロサービスアーキテクチャ全体像
- [E_DATA_MODEL.md](E_DATA_MODEL.md): データモデル定義
- [Z_SYSTEM_ARCHITECTURE_ALIGNMENT_CHECK.md](Z_SYSTEM_ARCHITECTURE_ALIGNMENT_CHECK.md): アーキテクチャ整合性チェック

