# **EduMint 最新マイクロサービスアーキテクチャ一覧**

このドキュメントは、EduMintの全マイクロサービスの責務、API、データ所有、イベント連携、および段階的なリリース計画を網羅した統合設計案です。SSO（学内ID連携やOAuthプロバイダ連携）は初期リリースから実装する前提で設計しています。

---

## **目次**

1.  **全体ハイレベル図（概念）**
2.  **共通インフラ・設計前提**
3.  **アーキテクチャ一覧**
    *   3.1. フロントエンド / 中間層
    *   3.2. バックエンド・コアサービス群
4.  **Kafkaトピック表（主要イベント）**
5.  **データ所有と整合性ルール**
6.  **セキュリティ（SSO含む）設計**
7.  **デプロイ・スケーリング・運用**
8.  **段階的リリース計画（推奨）**
9.  **付録：設計上の判断メモ**

---

## **1. 全体ハイレベル図（概念）**

クライアント（React） ⇄ APIゲートウェイ（edumintGateway） ⇄ 各マイクロサービス（内部通信はgRPC）
非同期連携は **Kafka**、ファイルは **AWS S3ストレージ**、検索は **Elasticsearch + Qdrant**、キャッシュは **Redis** を想定します。

```
[FrontendUI (React/TS)]
        |
        v
+------------------------------+
|  NGINX Ingress Controller    |  ← TLS終端 / JWT認証 / APIルーティング
+------------------------------+
        |
        v
+------------------------------+
| Istio Ingress Gateway        |  ← VirtualService/ABテスト/カナリア対応
+------------------------------+
        |
        v
[ edumintGateway (Node.js) ]   ← REST/gRPC-transcoding, 認可, キャッシュ層
        |
        v
+─────────────────────────────────────────────+
| Go Microservices (gRPC, via Istio+Envoy)     |
|  [ Sidecar: Envoy Proxy ]                    |
|  - edumintAuth                               |
|  - edumintUserProfile                        |
|  - edumintFile                               |
|  - edumintContent                            |
|  - edumintAiWorker                           |
|  - edumintSearch                             |
|  - edumintSocial                             |
|  - edumintNotify                             |
|  - edumintMonetizeWallet                     |
|  - edumintRevenue                            |
|  - edumintModeration                         |
|  - edumintAdmin                              |
+─────────────────────────────────────────────+
        |
        v
+---------------------------------------------+
| External Services                            |
|  - Kafka (イベント連携)                      |
|  - Redis (キャッシュ)                        |
|  - AWS S3ストレージ (ファイル保存)           |
|  - Elasticsearch + Qdrant (検索インデックス) |
+---------------------------------------------+

```

---

## **2. 共通インフラ・設計前提**

*   **通信**: サービス間はgRPCを原則とし、外部クライアント向けにはAPIゲートウェイでREST/gRPC-transcodingにより変換します。
*   **認証・認可**: `edumintAuth`（SSO/OAuth2）でトークンを発行。サービス間はmTLSまたはサービスメッシュ（例: Istio/Linkerd）で保護します。
*   **メッセージング**: Kafkaを使用します（トピック命名規約：`<domain>.<resource>.<event>`）。
*   **ストレージ**: 各サービスが自身のデータベース（MySQL等）を持つ「Database per Service」パターンを採用します。
*   **ログ/監視**: ELK/PLG（Prometheus+Grafana+Loki）スタックとOpenTelemetryによるトレーシングを導入します。
*   **CI/CD**: コンテナイメージベースのデプロイを行い、マイグレーションやブルーグリーンデプロイに対応します。
*   **運用方針**: 全サービスは、可観測性、ヘルスチェック、Graceful shutdown、再試行・バックオフルールを実装します。

---

## **3. アーキテクチャ一覧**

### **3.1. フロントエンド / 中間層**

#### **3.1.1. FrontendUI (React + TypeScript)**

*   **役割**: ユーザーとのインターフェース全般を担当するSPA（Single Page Application）。直感的な操作と高速な画面遷移を実現し、問題の投稿・編集・検索・表示から収益確認、管理UIまでを提供します。
*   **主な機能モジュール**:
    *   **AuthUI**: ログイン、サインアップ、SSO認証画面。
    *   **ContentUI**: 問題の投稿、編集、検索、閲覧UI。
    *   **NotificationUI**: 通知ベルアイコンと未読管理。
    *   **MonetizationUI**: MintCoin残高や収益の表示UI。
    *   **AdminUI**: 管理者向けダッシュボード。

#### **3.1.2. edumintGateway (Node.js)**

*   **役割**: すべての外部クライアントからのリクエストを受け付ける単一の窓口。フロントエンドとバックエンドGoサービス群の橋渡し役として、セキュリティ、監視、リクエスト制御を集約します。
*   **主な機能モジュール**:
    *   **AuthProxy**: JWT/SSOアクセストークンを検証し、RBAC（ロールベースアクセス制御）に基づいた認可を行います。
    *   **RequestValidator**: 入力スキーマをバリデーションし、不正なリクエストを早期に遮断します。
    *   **ServiceRouter**: リクエストの内容に応じて、適切なバックエンドマイクロサービスへルーティングします。
    *   **CacheLayer**: Redisを活用し、検索結果や共通データをキャッシュしてレスポンスを高速化します。
    *   **LogCollector**: 構造化ログを収集し、OpenTelemetryによる分散トレーシングの起点となります。
    *   **ErrorHandler**: サービス全体で共通化されたエラーレスポンスを管理・返却します。

### **3.2. バックエンド・コアサービス群 (Go)**

#### **A. edumintAuth (必須：SSOを初期実装)**

*   **責務**: SSO / OAuth2 / OpenID Connectの実装とJWTの発行・検証。外部IdP（Google, Microsoft）とのフェデレーションを担う認証の中核です。
*   **gRPC API (例)**: `Authenticate`, `IntrospectToken`
*   **DB (例)**: `oauth_clients`, `oauth_tokens`, `idp_links`
*   **Kafka**: `auth.events`（`UserLoggedIn`, `UserSignedUpViaSSO`）をPublishします。

#### **B. edumintUserProfile**

*   **責務**: ユーザーのプロフィール情報（表示名、大学、自己紹介など）、ソーシャルグラフ（フォロー・ブロック）、通知設定などを管理します。
*   **gRPC API (例)**: `GetProfile`, `UpdateProfile`, `Follow`
*   **DB (例)**: `users`, `user_profiles`, `user_follows`
*   **Kafka**: `user.events`（`UserCreated`, `UserUpdated`）をPublishします。
*   **備考**: パスワードなどの認証情報は保持せず、`edumintAuth`を信頼の起点とします。

#### **C. edumintFile**

*   **責務**: ファイルアップロードの受付、S3への署名付きURL生成、ウィルススキャンなどの初期パイプラインを提供します。
*   **gRPC API (例)**: `CreateUploadJob`, `NotifyUploadComplete`
*   **DB (例)**: `file_inputs`（ジョブID, パス, ステータスなど）
*   **Kafka**: `content.jobs`（`FileUploaded`）をPublishします。
*   **備考**: 大きなバイナリ転送はクライアントからS3へ直接行わせることで、ゲートウェイやサービスの負荷を軽減します。

#### **D. edumintContent**

*   **責務**: 演習問題や講義資料のメタデータ、構造化された問題文・解答などを保持する「信頼できる唯一の情報源（Source of Truth）」です。
*   **gRPC API (例)**: `CreateExam`, `GetExam`, `UpdateExam`, `PublishExam`
*   **DB (例)**: `exams`, `questions`, `exam_metadata`, `exam_stats`
*   **Kafka**: `content.lifecycle`（`ExamCreated`, `ExamUpdated`）をPublishし、`ai.results`をSubscribeしてAI処理結果を反映します。
*   **備考**: コンテンツの構造は厳格なスキーマで管理します。

#### **E. edumintAiWorker**

*   **責務**: Gemini APIの呼び出し、OCRによる文字抽出、問題構造のJSON化、新規問題生成といった、時間のかかる非同期処理を担当するワーカーです。
*   **動作**: Kafkaの`content.jobs`を購読し、処理が完了したら`ai.results`トピックに結果（`AIProcessingCompleted` or `AIProcessingFailed`）をPublishします。
*   **DB**: 原則としてステートレスですが、必要に応じてジョブのログやメトリクスを保持します。
*   **備考**: 各ジョブは冪等（べきとう）に設計し、重複実行されても問題ないようにします。

#### **F. edumintSearch**

*   **責務**: キーワード検索（Elasticsearch）とベクトル検索（Qdrant）を組み合わせたハイブリッド検索基盤を提供します。検索インデックスの所有者です。
*   **gRPC API (例)**: `Search(query, filters, ranking_profile)`
*   **データ**: ElasticsearchとQdrantのインデックス。元のデータは`edumintContent`が保持します。
*   **Kafka**: `content.lifecycle`や`content.feedback`を購読し、インデックスを最新の状態に保ちます。
*   **備考**: ランキングロジックは設定ベースで切り替え可能にし、A/Bテストを容易にします。

#### **G. edumintSocial**

*   **責務**: コメント、いいね、閲覧履歴など、SNS的なユーザーアクションを専門に扱います。高頻度の書き込みを想定し、他のサービスから分離して独立してスケールさせます。
*   **gRPC API (例)**: `AddComment`, `LikeExam`, `RecordView`
*   **DB (例)**: `comments`, `likes`, `views`
*   **Kafka**: `content.feedback`（`ExamLiked`, `ExamViewed`）をPublishし、検索や通知サービスが利用できるようにします。
*   **備考**: 高頻度の書き込みに対応するため、CQRSパターンの導入を検討します。

#### **H. edumintNotify**

*   **責務**: サイト内通知、メール、プッシュ通知などを統合的に配信します。ユーザーの通知設定に応じて適切なチャネルを選択します。
*   **動作**: Kafkaの様々なイベント（`ai.results`, `content.feedback`など）を購読し、通知をトリガーします。
*   **DB (例)**: `notifications`（通知履歴、未読フラグ）
*   **外部連携**: SendGrid, Amazon SES, Firebase Cloud Messaging (FCM) など。
*   **備考**: 即時性が求められる通知と、まとめて配信するバッチ通知を使い分けます。

#### **I. edumintMonetizeWallet**

*   **責務**: プラットフォーム内通貨「MintCoin」の残高管理と取引記録を、トランザクショナルに、かつアトミックに実行します。
*   **gRPC API (例)**: `RecordAdView`, `SpendCoins`, `GetBalance`
*   **DB (例)**: `wallets`, `wallet_transactions`（不変の監査ログ）
*   **Kafka**: `monetization.transactions`（監査用）をPublishします。
*   **備考**: データの整合性を最優先で設計します。

#### **J. edumintRevenue**

*   **責務**: 月次の収益分配計算、広告収益の集計、会計レポートの生成、外部への支払い連携など、バッチ処理を中心とした収益管理を担当します。
*   **gRPC API (例)**: `RunMonthlyRevenueShare`, `GetRevenueReport`
*   **DB (例)**: `revenue_reports`, `ad_impressions_agg`
*   **Kafka**: `monetization.transactions`などを購読し、計算のインプットとします。
*   **備考**: ウォレットサービスとは明確に分離し、監査可能性を確保します。

#### **K. edumintModeration**

*   **責務**: ユーザーからの通報受付、管理者による対応ワークフロー、コンテンツへのアクション（非表示化など）を実行します。
*   **gRPC API (例)**: `CreateReport`, `ListReports`, `TakeAction`
*   **DB (例)**: `reports`, `report_reasons`, `report_audit`
*   **Kafka**: `moderation.events`（`ContentActionTaken`）をPublishします。
*   **備考**: 将来的な機械学習による自動モデレーション機能の拡張ポイントとなります。

#### **L. edumintAdmin**

*   **責務**: 管理者向けダッシュボード（AdminUI）のための統合APIを提供します。ユーザー管理、コンテンツ監視、サービス統計の可視化など、各サービスの管理機能を束ねます。
*   **備考**: `edumintAuth`が提供する管理者ロールによってアクセスを厳格に制御します。

---

## **4. Kafkaトピック表（主要イベント一覧）**

*   `auth.events`: `UserLoggedIn`, `UserSignedUpViaSSO`
*   `content.jobs`: `FileUploaded`
*   `ai.results`: `AIProcessingCompleted`, `AIProcessingFailed`
*   `content.lifecycle`: `ExamCreated`, `ExamUpdated`, `ExamDeleted`
*   `content.feedback`: `ExamLiked`, `ExamViewed`
*   `user.events`: `UserCreated`, `UserUpdated`
*   `moderation.events`: `ContentActionTaken`
*   `monetization.transactions`: `CoinAwarded`, `CoinSpent`

---

## **5. データ所有と整合性ルール**

*   **単一オーナーシップ**: 各データ（例: `exams`テーブル）は、単一のサービス（例: `edumintContent`）のみが書き込み権限を持つことを原則とします。
*   **参照方式**: 他サービスはAPI呼び出しかイベント購読を通じてデータを参照し、安易にデータを複製しません。
*   **最終整合性**: サービス間のデータ同期はKafkaを介したイベント駆動で行い、結果整合性（Eventual Consistency）を基本とします。
*   **強整合性**: ウォレットの残高更新など、即時性と正確性が求められる処理は、データベースのトランザクション内で完結させ、強整合性を保証します。

---

## **6. セキュリティ（SSO含む）設計**

*   **SSO（初期実装）**: OIDCを優先プロトコルとします。SPA向けにAuthorization Code + PKCEフローを採用します。
*   **サービス間通信**: mTLSまたはサービスメッシュを導入し、すべての内部通信を暗号化・認証します。
*   **RBAC**: `admin`, `moderator`, `student`といったロールを定義し、APIごとにアクセス制御を行います。
*   **データ保護**: 個人情報（PII）はデータベースレベルで暗号化し、ログからはマスキングまたは除去します。
*   **監査**: ウォレット操作やコンテンツ削除など、重要なアクションはすべて不変の監査ログとして記録します。

---

## **7. デプロイ・スケーリング・運用**

*   **コンテナ & オーケストレーション**: DockerとKubernetesを標準とし、各サービスを独立してデプロイ・スケーリングします。
*   **リソース設計**:
    *   **高スループットが求められるサービス**: `edumintSearch`, `edumintAiWorker`, `edumintSocial`
    *   **高整合性が求められるサービス**: `edumintMonetizeWallet`
*   **可用性**: 全てのサービスとデータベースは複数のアベイラビリティゾーン（AZ）にまたがってデプロイし、単一障害点をなくします。
*   **SLA設計**: ユーザー認証（`edumintAuth`）やコンテンツ閲覧（`edumintContent`）など、ユーザー体験に直結するサービスは高いSLAを設定します。AI処理などの非同期ジョブはベストエフォートとします。

---

## **8. 段階的リリース計画（推奨）**

### **Phase 1: 試験版 (MVP)**

*   **目的**: 過去問アップロードからAIによる問題生成・閲覧・検索まで、中核となるユーザー体験を最小限の機能で実現する。
*   **実装範囲**:
    *   **必須サービス**: `FrontendUI`, `edumintGateway`, `edumintAuth` (SSO含む), `edumintUserProfile`, `edumintFile`, `edumintContent`, `edumintAiWorker`, `edumintSearch`
    *   **主な機能**: ファイルアップロード、AIによる問題抽出・生成、キーワード＆ベクトル検索、SSOを含むユーザー認証。
*   **除外範囲**: `edumintMonetizeWallet`, `edumintRevenue`, `edumintSocial`, `edumintModeration`,  `edumintNotify` （通知、広告・収益化、SNS機能、高度な管理機能は含めない）。

### **Phase 2: 製品版**

*   **目的**: 収益化モデルを確立し、ユーザーの継続利用を促すコミュニティ機能を導入する。
*   **追加実装範囲**:
    *   **導入サービス**: `edumintMonetizeWallet`, `edumintRevenue`, `edumintSocial`, `edumintModeration`
    *   **主な機能**: 広告表示、MintCoinの付与と消費、収益分配バッチ、いいね・コメント機能、通報管理ダッシュボード。
    *   **機能強化**: `edumintGateway`にキャッシュ/トレーシングを追加。

### **Phase 3: 拡張版**

*   **目的**: 多言語対応による国際展開、エンゲージメントと収益モデルの強化。
*   **追加実装範囲**:
    *   **主な機能**: UIの多言語対応（日・英）、サブスクリプションプラン導入、AIによる問題推薦システム、学内システム連携に向けたBFF/GraphQL層の強化。

---

## **9. 付録：設計上の判断メモ**

*   **SSOの初期導入**: 大学連携を視野に入れる上で、ユーザー獲得の障壁を下げるために不可欠と判断。初期からIdP連携を前提に設計することで、後の大規模な手戻りを防ぎます。
*   **サービス分割の基準**: 将来の変更頻度、スケーラビリティ要求、データ整合性要件を基準にサービスを分割。過剰な分割は運用コストを増大させるため、リリース計画に沿って段階的にサービスを有効化していくアプローチを推奨します。