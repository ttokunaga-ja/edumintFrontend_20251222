# データモデル定義（Frontend 表示用 & API 契約）

フロントは DB を直接扱わない。API レスポンスの型と UI モデルを整理し、欠損時のフォールバックを定義する。

## アーキテクチャ概要

本ドキュメントで定義される型は、以下のマイクロサービスアーキテクチャを前提としています：

### サービス責務分離
- **eduanimaGateway**: 全てのジョブのライフサイクル管理（ジョブオーケストレーション）
- **eduanimaContent**: 試験データのドメインロジック（Source of Truth）
- **eduanimaSearch**: 検索インデックス（Elasticsearch + Qdrant）
- **eduanimaAiWorker**: AI処理（Gemini API、ステートレス）

### ジョブ管理の責務
- **eduanimaGateway**: `jobs` テーブルを所有し、全てのジョブタイプ（`exam_creation`, `file_processing`, `index_rebuild`等）を統一管理
- **eduanimaContent**: ジョブ管理テーブルは保持せず、Kafka イベントを購読してドメインロジックを実行
- **イベント駆動**: ジョブの状態遷移は Kafka トピック（`gateway.jobs`, `content.lifecycle`, `ai.results`, `gateway.job_status`）を介して連携

詳細は [Q_DATAMODEL_REFACTOR.md](Q_DATAMODEL_REFACTOR.md) および [F_ARCHITECTURE_OVERALL.md](F_ARCHITECTURE_OVERALL.md) を参照してください。

---

## フロントエンド向けデータ型定義

```ts
// Search result card
type ExamCard = {
  id: string;
  title: string;
  subject: string;
  university?: string;
  likes?: number;       // optional in early API
  comments?: number;    // optional (Phase2 以降)
  views?: number;
};

// Problem detail
type Problem = {
  id: string;
  title: string;
  meta: {
    subject?: string;
    professor?: string;
    level?: "basic" | "intermediate" | "advanced";
    tags?: string[];
  };
  blocks: ContentBlock[];
};

// Generation job status
// NOTE: ジョブ管理は eduanimaGateway が担当し、このデータは /v1/jobs/:id から取得されます
type GenerationJob = {
  jobId: string;
  clientRequestId?: string;  // 冪等性キー（フロントエンド側で生成してリクエスト時に送信）
  type: "exam_creation" | "file_processing" | "index_rebuild";  // ジョブ種別
  status: "pending" | "processing" | "completed" | "failed";  // ジョブステータス
  resourceType?: "exam" | "file" | "index";  // 作成されたリソースの種類
  resourceId?: string;  // 作成されたリソースのID（例: examId）
  errorCode?: string;
  errorMessage?: string;
  retryCount?: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
};
```

```ts
// Auth / Profile
type User = {
  id: number;
  username: string;
  email?: string;
  university?: string;
  department?: string;
  academicField?: "science" | "humanities";
  isVerified?: boolean;
  createdAt?: string;
};

// Exam / Content（詳細は API 契約に追随）
type Exam = {
  id: number;
  examName: string;
  universityName?: string;
  facultyName?: string;
  subjectName?: string;
  teacherName?: string;
  examYear?: number;
  userId?: number;
  userName?: string;
  isPublic?: boolean;
  goodCount?: number;
  badCount?: number;
  viewCount?: number;
  commentCount?: number;  // Phase 2: eduanimaSocial
  createdAt?: string;
  updatedAt?: string;
};

type Question = {
  id: number;
  examId: number;
  questionNumber: number;
  questionContent: string;
  // NOTE: `questionFormat` removed. Rendering is auto-detected (LaTeX via $/$$).
  keywords?: Keyword[];
};

type SubQuestion = {
  id: number;
  questionId: number;
  subQuestionNumber: number;
  questionTypeId: number;
  questionContent: string;
  // NOTE: `questionFormat` / `answerFormat` removed. Rendering is auto-detected (LaTeX via $/$$).
  answerContent: string;
  keywords?: Keyword[];
};

// Phase 2: eduanimaSocial
type ExamComment = {
  id: number;
  examId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  comment: string;
  createdAt: string;
};

type Report = {
  id: string;
  reporterUserId: string;
  contentType: "exam" | "question" | "sub_question" | "exam_comment";  // "exam_comment" in Phase 2
  contentId: string;
  reasonId: number;
  details?: string;
  status?: "pending" | "resolved" | "ignored";
  createdAt?: string;
};

// Ops / Health
type HealthStatus = "operational" | "degraded" | "maintenance" | "outage";
type HealthSummaryItem = { category: string; status: HealthStatus; message: string };

// Wallet / Notification（Phase2）
type WalletBalance = {
  availableBalance: number;
  pendingEarnings: number;
  totalEarnings: number;
  currency: string;
};

// Phase 2: eduanimaSocial notifications
type Notification = {
  id: string;
  userId: string;
  type: "like" | "comment" | "system";  // "comment" type in Phase 2
  title: string;
  message: string;
  isRead: boolean;
  relatedExamId?: string;
  createdAt: string;
};
```

## フロント側のデータモデル原則
- API 契約は `src/src/types/*` で一元管理し、Zod/TS でバリデーション。
- `likes/comments/bookmarkCount` など後出しフィールドは optional とし、未提供でも UI が崩れないフォールバックを持つ。
- 数値は 0 初期化、文字列は空文字を避けて `"-"` など明示値を表示。
- ID/キー: API から付与された文字列をそのまま使用し、フロントで UUID を生成しない。
- **冪等性**: ジョブ作成時は `clientRequestId` (UUID) をフロントエンド側で生成し、リクエストに含める。これにより、ネットワークエラー等でリトライしても重複ジョブが作成されない。

---

## ジョブ管理とイベントフロー（アーキテクチャ補足）

### ジョブ作成フロー（試験作成の例）

```
[FrontendUI]
    |
    | POST /v1/jobs
    | Body: {
    |   type: "exam_creation",
    |   clientRequestId: "uuid-v4",  // フロントエンド生成
    |   payload: { examName: "...", universityId: 101, ... }
    | }
    v
[eduanimaGateway]
    |
    | 1. JWT検証（eduanimaAuth）
    | 2. 冪等性チェック（clientRequestId で DUPLICATE KEY 検証）
    | 3. jobs テーブルに INSERT（status='pending'）
    | 4. Kafka Publish: job.created
    |    Topic: gateway.jobs
    | 5. 202 Accepted を返却（jobId を含む）
    v
[Kafka: gateway.jobs]
    |
    v
[eduanimaContent]
    |
    | 6. job.created イベントを購読
    | 7. exams, exam_stats テーブルに INSERT
    | 8. Kafka Publish: content.exam_created
    |    Topic: content.lifecycle
    v
[Kafka: content.lifecycle]
    |
    v
[eduanimaGateway]
    |
    | 9. content.exam_created イベントを購読
    | 10. jobs テーブルを UPDATE（status='processing', resourceId=examId）
    v
[eduanimaAiWorker]
    |
    | 11. job.processing イベントを購読
    | 12. AI処理（Gemini API で問題抽出）
    | 13. Kafka Publish: ai.processing_completed
    |     Topic: ai.results
    v
[eduanimaContent]
    |
    | 14. ai.processing_completed を購読
    | 15. questions, sub_questions テーブルに INSERT
    | 16. Kafka Publish: content.exam_completed
    v
[eduanimaGateway]
    |
    | 17. content.exam_completed を購読
    | 18. jobs テーブルを UPDATE（status='completed', completedAt=NOW()）
```

### ジョブステータス取得フロー

```
[FrontendUI]
    |
    | GET /v1/jobs/:jobId
    | （ポーリングまたはWebSocket経由で定期的に取得）
    v
[eduanimaGateway]
    |
    | 1. Redis キャッシュをチェック
    | 2. キャッシュミス → jobs テーブルから SELECT
    | 3. Redis にキャッシュ（TTL: 5秒）
    | 4. レスポンス返却
    |    {
    |      jobId: "...",
    |      type: "exam_creation",
    |      status: "processing",
    |      resourceId: "exam_uuid",
    |      createdAt: "...",
    |      updatedAt: "..."
    |    }
```

### Kafka トピック一覧

| トピック | Producer | Consumer | イベント |
|---------|----------|----------|---------|
| `gateway.jobs` | eduanimaGateway | eduanimaContent, eduanimaFile, eduanimaSearch | `job.created` |
| `content.lifecycle` | eduanimaContent | eduanimaGateway, eduanimaSearch, eduanimaAiWorker | `exam_created`, `exam_updated`, `exam_deleted`, `exam_completed` |
| `ai.results` | eduanimaAiWorker | eduanimaContent | `processing_completed`, `processing_failed` |
| `gateway.job_status` | 各ドメインサービス | eduanimaGateway | `job_completed`, `job_failed` |

### フロントエンドの実装ガイドライン

1. **ジョブ作成時**: `clientRequestId` を必ず生成してリクエストに含める
   ```ts
   const clientRequestId = crypto.randomUUID();
   const response = await fetch('/v1/jobs', {
     method: 'POST',
     body: JSON.stringify({
       type: 'exam_creation',
       clientRequestId,
       payload: { /* ... */ }
     })
   });
   ```

2. **ジョブステータス確認**: ポーリングまたはWebSocket経由で定期的に取得
   ```ts
   const pollJobStatus = async (jobId: string) => {
     const response = await fetch(`/v1/jobs/${jobId}`);
     const job: GenerationJob = await response.json();
     
     if (job.status === 'completed') {
       // resourceId を使ってリソースにアクセス
       window.location.href = `/exams/${job.resourceId}`;
     } else if (job.status === 'failed') {
       // エラーメッセージを表示
       alert(job.errorMessage);
     } else {
       // まだ処理中 - 継続ポーリング
       setTimeout(() => pollJobStatus(jobId), 2000);
     }
   };
   ```

3. **エラーハンドリング**: リトライ可能なエラーは自動リトライ、そうでない場合はユーザーに通知

---

## Sources
- `../overview/requirements.md`, `../overview/current_implementation.md`
- `../architecture/database.md`（DB ↔ 画面のトレーサビリティ）
- `../implementation/service-health/README.md`
- `src/src/services/api/gateway.ts`（現状のフロント実装の型）
- [Q_DATAMODEL_REFACTOR.md](Q_DATAMODEL_REFACTOR.md)（データベース設計詳細）
- [F_ARCHITECTURE_OVERALL.md](F_ARCHITECTURE_OVERALL.md)（マイクロサービスアーキテクチャ全体像）
