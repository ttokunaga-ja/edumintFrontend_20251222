# データモデル定義（Frontend 表示用 & API 契約）

フロントは DB を直接扱わない。API レスポンスの型と UI モデルを整理し、欠損時のフォールバックを定義する。

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
    difficulty?: "basic" | "intermediate" | "advanced";
    tags?: string[];
  };
  blocks: ContentBlock[];
};

// Generation job status
type GenerationJob = {
  jobId: string;
  status: "queued" | "processing" | "paused" | "completed" | "error";
  problemId?: string;
  errorMessage?: string;
};
```

```ts
// Auth / Profile
type User = {
  id: string;
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
  id: string;
  examName: string;
  universityName?: string;
  facultyName?: string;
  subjectName?: string;
  teacherName?: string;
  examYear?: number;
  userId?: string;
  userName?: string;
  isPublic?: boolean;
  goodCount?: number;
  badCount?: number;
  viewCount?: number;
  commentCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

type Question = {
  id: string;
  examId: string;
  questionNumber: number;
  questionContent: string;
  // NOTE: `questionFormat` removed. Rendering is auto-detected (LaTeX via $/$$).
  keywords?: Keyword[];
};

type SubQuestion = {
  id: string;
  questionId: string;
  subQuestionNumber: number;
  questionTypeId: number;
  questionContent: string;
  // NOTE: `questionFormat` / `answerFormat` removed. Rendering is auto-detected (LaTeX via $/$$).
  answerContent: string;
  keywords?: Keyword[];
};

type ExamComment = {
  id: string;
  examId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  createdAt: string;
};

type Report = {
  id: string;
  reporterUserId: string;
  contentType: "exam" | "question" | "sub_question" | "exam_comment";
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

type Notification = {
  id: string;
  userId: string;
  type: "like" | "comment" | "system";
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

## Sources
- `../overview/requirements.md`, `../overview/current_implementation.md`
- `../architecture/database.md`（DB ↔ 画面のトレーサビリティ）
- `../implementation/service-health/README.md`
- `src/src/services/api/gateway.ts`（現状のフロント実装の型）
