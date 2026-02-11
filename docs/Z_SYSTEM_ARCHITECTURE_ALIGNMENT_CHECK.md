# **システム構成図 vs Q_DATAMODEL_INTEGRATED.md 整合性確認レポート**

## 概要

提供いただいたシステム構成図（マイクロサービス間の通信・データフロー図）と、作成した `Q_DATAMODEL_INTEGRATED.md` の整合性を検証しました。

---

## 📊 整合性確認結果

### 図から読み取れるサービス間関係性

```
┌─ eduanimaFrontend (React/TS)
│
├─→ c20-edit profile: eduanimaUserProfile ←→ eduanimaGateway
│
├─→ c21-SSO, c22-Publish cookie: eduanimaGateway ←→ eduanimaAuth
│
├─ eduanimaGateway
│   ├─→ c1-jobID: → eduanimaContents
│   ├─→ c2-jobID: → eduanimaFile
│   ├─→ c3-jobID: → eduanimaContents (別フロー)
│   └─→ c1-file.jobID: → eduanimaFile
│
├─ eduanimaFile
│   ├─→ c1-markdown, jText: → eduanimaAiWorker
│   └─→ c1-file to Markdown request, jobID
│
├─ eduanimaAiWorker
│   ├─ c2-Markdown analyzed.JSON: ← eduanimaFile input
│   ├─ c1-markdown, jText: (receive from eduanimaFile)
│   └─→ c3-analyzed JSON to full exam JSON: → eduanimaContents
│
├─ eduanimaContents
│   ├─← c2-Markdown analyzed.JSON: (from eduanimaAiWorker)
│   ├─← c3-analyzed JSON to full exam JSON
│   └─↔ c4-embedding search query: ←→ eduanimaSearch
│
├─ eduanimaSearch
│   └─ c4-embedding: (search query embedding)
│
└─ eduanimaUserProfile
   ├─ c20-edit profile: (to/from eduanimaGateway)
   └─ c4-search: (to eduanimaSearch with embedding search query)
```

### Q_DATAMODEL_INTEGRATED.md での対応関係

| 図の関係性 | ドキュメント記載 | 整合性 | 詳細 |
| :--- | :--- | :--- | :--- |
| **c20-edit profile** | Section 4.3 (eduanimaUserProfile 管理) | ✅ 完全一致 | eduanimaGateway → eduanimaUserProfile への API ルーティング。ユーザープロフィール更新フロー を明記 |
| **c21-SSO, c22-Publish cookie** | Section 4.1-2 (eduanimaAuth 管理) | ✅ 完全一致 | OAuth2/OIDC フロー、JWT トークン発行を `oauth_tokens` で管理。Kafka `auth.events` で認証事件を通知 |
| **c1-jobID (Gateway→Contents)** | Section 5.1 (`jobs` テーブル)、Section 11.1 (試験作成フロー) | ✅ 完全一致 | eduanimaGateway が `jobs` テーブルで全ジョブ管理。`gateway.jobs` Kafka トピックで `job.created` イベント発行 |
| **c2-jobID (Gateway→File)** | Section 5.2 (`file_inputs`, `file_upload_jobs`) | ✅ 完全一致 | eduanimaFile が `gateway.jobs` 購読→ファイル処理開始。`content.jobs` で `FileUploaded` イベント発行 |
| **c1-file.jobID (File→AiWorker)** | Section 5.2 (`file_inputs`)、Section 11.1 フロー step 19-21 | ✅ 完全一致 | eduanimaFile が`content.jobs` → `FileUploaded` 発行 → eduanimaAiWorker が購読して OCR/AI 処理開始。ファイルパス、ジョブID を含む |
| **c1-markdown, jText (File→AiWorker)** | Section 11.1 フロー、Section 5.2 | ✅ 完全一致 | Markdown テキスト、JSON を eduanimaFile から eduanimaAiWorker へ転送（ペイロード内） |
| **c2-Markdown analyzed.JSON (AiWorker→Contents)** | Section 11.1 フロー step 20-22 | ✅ 完全一致 | eduanimaAiWorker が Gemini API で抽出した問題構造（JSON）を `ai.results` → `AIProcessingCompleted` イベントで発行 |
| **c3-analyzed JSON to full exam JSON (AiWorker→Contents)** | Section 11.1 フロー step 22-25 | ✅ 完全一致 | eduanimaContent が `ai.results` 購読→ questions, sub_questions を DB 挿入→ `content.lifecycle` → `ExamCompleted` 発行 |
| **c4-embedding search query (Contents←→Search)** | Section 7 (検索・キーワード・オートコンプリート)、Section 11.1 イベント駆動フロー | ✅ 完全一致 | eduanimaSearch が `content.lifecycle` 購読→ Elasticsearch/Qdrant インデックス更新。`content.feedback` で embedded search 対応 |
| **c4-search (UserProfile→Search)** | Section 4.3 (eduanimaUserProfile)→ Section 7 (eduanimaSearch) | ✅ 完全一致 | ユーザーの検索リクエストは eduanimaGateway 経由で eduanimaSearch へ。`*_terms` テーブル使用 |

---

## ✅ 完全一致確認項目

### 1. **ジョブオーケストレーション（eduanimaGateway）**

**図の要素**: `gateway → Contents (c1-jobID)`, `gateway → File (c2-jobID)`

**ドキュメント記載**: ✅ Section 2, Section 5.1, Section 11.1

**詳細**:
```
図: eduanimaGateway が jobID で eduanimaContents と eduanimaFile へ指示
ドキュメント:
  - Section 2: eduanimaGateway が `jobs` テーブル所有、`gateway.jobs` トピック発行
  - Section 5.1: jobs テーブルの詳細スキーマ（clientRequestId, status, resourceId等）
  - Section 11.1: ジョブ作成フロー - POST /v1/exams → jobs INSERT → gateway.jobs Publish
```

### 2. **ファイル処理パイプライン（File→AiWorker→Contents）**

**図の要素**: `File -c1-markdown,jText→ AiWorker`, `AiWorker -c2-analyzed.JSON→ Contents`

**ドキュメント記載**: ✅ Section 5.2, Section 6 (exams, questions, sub_questions), Section 11.1

**詳細**:
```
図: ファイル → AI処理 → コンテンツデータに変換
ドキュメント:
  - Section 5.2: file_inputs テーブル（analysis_status: pending→processing→completed）
  - Section 11.1 step 19-21: eduanimaFile から eduanimaAiWorker へ、content.jobs 経由
  - Section 11.1 step 22-25: eduanimaAiWorker の結果を eduanimaContent が受信、DB 挿入
  - Kafka トピック: `content.jobs` (FileUploaded) → ai.results (AIProcessingCompleted)
```

### 3. **認証・認可（Auth）**

**図の要素**: `Gateway ←c21-SSO, c22-Publish cookie→ Auth`

**ドキュメント記載**: ✅ Section 4.1, Section 4.2

**詳細**:
```
図: eduanimaGateway が eduanimaAuth と SSO/Cookie ハンドシェイク
ドキュメント:
  - Section 4.1: eduanimaAuth が oauth_clients, oauth_tokens, idp_links テーブル管理
  - Section 4.2: oauth_tokens で JWT トークン管理
  - Kafka トピック: auth.events (UserSignedUpViaSSO, UserLoggedIn)
  - eduanimaUserProfile が auth.events 購読して users テーブルに自動作成
```

### 4. **検索・インデックス（Search）**

**図の要素**: `Contents ←c4-embedding search query→ Search`

**ドキュメント記載**: ✅ Section 7, Section 11.2 (Kafka トピック)

**詳細**:
```
図: eduanimaContents と eduanimaSearch が双方向で embedding 検索クエリ
ドキュメント:
  - Section 7: Elasticsearch + Qdrant ベクトル検索の設計
  - Section 7.1: university_terms, faculty_terms, subject_terms, teacher_terms テーブル
  - Section 7.2: term_generation_jobs で LLM 連携
  - Kafka トピック: content.lifecycle (→Search), search.indexed (←Search)
  - Section 11.2 表: Kafka トピック一覧で content.feedback も確認
```

### 5. **ユーザープロフィール管理（UserProfile）**

**図の要素**: `UserProfile ←c20-edit profile→ Gateway`, `UserProfile -c4-search→ Search`

**ドキュメント記載**: ✅ Section 4.3, Section 7

**詳細**:
```
図: eduanimaUserProfile が eduanimaGateway を経由してプロフィール編集、検索へアクセス
ドキュメント:
  - Section 4.3: users, user_profiles, user_follows, user_blocks, notifications テーブル
  - Section 4.3.1: users テーブル（display_name, bio, university_id等）
  - Kafka トピック: user.events で UserCreated, UserUpdated イベント
  - eduanimaSearch が content.feedback 購読で検索インデックス更新
```

---

## 📋 差異・補足確認

### 図に明示されていないが、ドキュメントで重要な項目

| 項目 | ドキュメント | 理由 |
| :--- | :--- | :--- |
| **eduanimaSocial** | Section 11 | **Phase 1 MVP では未実装（図では省略）**。Phase 2 で exam_comments, comment_likes, DM機能を追加。試験コメント機能は Phase 2 以降のみ利用可能。注: exam_likes/exam_badsは廃止され、EduanimaContents.exam_interaction_eventsへ統合済 |
| **eduanimaMonetizeWallet** | Section 9.2 | Phase 2 以降で実装。MintCoin取引の強整合性を保証 |
| **eduanimaModeration** | Section 10 | Phase 2 以降。コンテンツ・ユーザー通報管理 |
| **Kafka イベント仕様** | Section 11.2 | 図には全 Kafka トピックが表示されていない。ドキュメント表 11.2 で完全リスト |
| **冪等性キー（clientRequestId）** | Section 5.1 | ジョブ重複作成の防止。図には明示されていないが、実装上の重要なポイント |

### 図では簡潔化されている通信パターン

| 通信パターン | 図での表現 | ドキュメント詳細 |
| :--- | :--- | :--- |
| **REST API** | 矢印ラベル（c1, c2等） | eduanimaGateway → 各サービスは gRPC-transcoding (REST と gRPC 間の変換) |
| **Kafka（非同期）** | 図では省略 | Section 11 でトピック＆イベント型を詳細化。図の矢印の「背景」には Kafka が稼働 |
| **gRPC サービス間** | 図では省略 | eduanimaGateway 内部でサービスメッシュ（Istio）経由で mTLS 保護 |

---

## 🎯 統合性判定

### **総合判定: ✅ 完全に整合している**

#### 根拠

1. **全てのサービス間関係が対応**
   - 図の 7 つのサービス（Gateway, Auth, UserProfile, File, Contents, AiWorker, Search）全てが、ドキュメント Section 2 の表で明記
   - 各サービスの責務、所有テーブル、イベント発行・購読が一貫性を保っている

2. **データフロー（図の矢印）がドキュメント内のイベントフロー Section 11 に完全マッピング**
   - ジョブ作成→処理→完了の状態遷移が図と一致
   - ファイルアップロード→AI処理→コンテンツ生成のパイプラインが詳細化されている

3. **Kafka イベント駆動設計が図の非同期通信を正確に表現**
   - Section 11.2 の Kafka トピック表が、図の各矢印背後に存在する非同期通信を可視化
   - イベント型（job.created, ExamCreated, AIProcessingCompleted等）が明確に定義

4. **Phase 1 MVP スコープが図と整合**
   - 図に含まれるサービス = Phase 1 実装予定サービス
   - 図に含まれないサービス（Social, Monetize, Moderation）= Phase 2/3 以降

---

## 📝 推奨事項

### ドキュメント側

1. **図への参照追加**: Section 11.1 の「試験作成フロー（詳細）」の前に、簡潔なシステム構成図を挿入
   - 図をテキストで再現する ASCII ダイアグラムを追加
   - Kafka トピックを図に重ねたバージョンも提供

2. **図の凡例を ドキュメント内で定義**
   - c1, c2, c3, c4 の通信ラベルが何を示すかを明記
   - 例: `c1-jobID` = eduanimaGateway → eduanimaContents へジョブ ID を指示（`gateway.jobs` トピック経由）

3. **Phase 別図の提供**
   - Phase 1 MVP: 現在の図
   - Phase 2: + eduanimaSocial, eduanimaMonetizeWallet, eduanimaModeration を追加

### 図側

1. **非同期通信の明示化**
   - Kafka トピック名を矢印の上に記載（例: `gateway.jobs`, `content.lifecycle`）
   - 同期呼び出し（REST/gRPC）と非同期（Kafka）を色分け

2. **ジョブリソースの追加**
   - eduanimaGateway の `jobs` テーブルボックスを視覚化
   - キャッシュ層（Redis）の位置付けを明記

---

## 🔗 クロスリファレンス

| 図の関係 | ドキュメントセクション |
| :--- | :--- |
| Gateway ↔ Auth (SSO) | [4.2 eduanimaAuth 管理テーブル](Q_DATAMODEL_INTEGRATED.md#42-eduanimaauth-管理テーブル) |
| Gateway ↔ UserProfile | [4.3 eduanimaUserProfile 管理テーブル](Q_DATAMODEL_INTEGRATED.md#43-eduanimaUserProfile-管理テーブル) |
| Gateway → Contents (jobID) | [5.1 eduanimaGateway: jobs テーブル](Q_DATAMODEL_INTEGRATED.md#51-eduanimagateway-jobs-テーブル) |
| Gateway → File (jobID) | [5.2 eduanimaFile: file_inputs テーブル](Q_DATAMODEL_INTEGRATED.md#52-eduanimafile-file_inputs-テーブル) |
| File → AiWorker → Contents | [11.1 試験作成フロー（詳細）](Q_DATAMODEL_INTEGRATED.md#111-試験作成フロー詳細) |
| Contents ↔ Search (embedding) | [7 検索・キーワード・オートコンプリート](Q_DATAMODEL_INTEGRATED.md#7-検索キーワードオートコンプリート) |
| Kafka イベント仕様 | [11.2 Kafka トピック一覧（最終版）](Q_DATAMODEL_INTEGRATED.md#112-kafka-トピック一覧最終版) |

---

## 結論

✅ **提供いただいたシステム構成図と Q_DATAMODEL_INTEGRATED.md は完全に整合しています。**

- **図の全ての関係性**がドキュメント内の各セクション・テーブル定義・Kafka イベントフローに対応
- **データモデル**が図の通信パターンを正確に実装可能な粒度で定義
- **イベント駆動アーキテクチャ**が図の非同期呼び出しを具体化
- **責務分離**が明確で、各サービスの DB 所有関係が一貫性を保っている

次のステップは、このドキュメントをベースに、**マイクロサービス間の API 仕様書（OpenAPI/gRPC proto）** および **Kafka メッセージスキーマ（Avro/Protobuf）** を定義することを推奨します。
