// データベース型定義 (Based on src/docs/architecture/database.md) // 共通型
export type ID = string | number; // フロントエンドでは文字列として扱うことが多いが、DBはBigInt/Integer // ==========================================
// 1. 大学・組織・基本マスタ
// ========================================== export type University = { id: ID; orgId?: string; // 大学ポートレート組織ID name: string; nameKana?: string; nameRomaji?: string; nameEn?: string; country: string; updatedAt: string;
}; export type Faculty = { id: ID; universityId: ID; name: string; nameKana?: string; nameRomaji?: string; updatedAt: string;
}; export type Department = { id: ID; facultyId: ID; name: string; nameKana?: string; nameRomaji?: string; updatedAt: string;
}; export type Teacher = { id: ID; name: string; nameKana?: string; nameRomaji?: string; universityId?: ID;
}; export type Subject = { id: ID; name: string; nameKana?: string; nameRomaji?: string;
}; // ==========================================
// 2. ユーザー管理・通知
// ========================================== export type User = { id: string; // DB: BigInt username: string; displayName?: string; // DB: display_name name?: string; // for backward compatibility email: string; isEmailVerified: boolean; // Affiliation universityId?: ID; universityName?: string; // Join result university?: string; // for backward compatibility facultyId?: ID; facultyName?: string; // Join result department?: string; // for backward compatibility (DBにはdepartment_idがないが、UI要件にある場合keep) majorType: 0 | 1 | 'science' | 'humanities'; // DB: 0 or 1. UI: 'science' | 'humanities' mapping needed academicField?: 'science' | 'humanities' | 'interdisciplinary'; // for backward compatibility // Profile bio?: string; language?: string; country?: string; timezone?: string; // Auth & System provider?: string; providerUserId?: string; signupSource?: string; role: 'user' | 'admin'; status: 'active' | 'banned' | 'deleted' | 'pending'; // Economy & Stats subscriptionPlan?: string; subscriptionStartAt?: string; subscriptionEndAt?: string; mintcoinBalance: number; followerCount: number; blockedCount: number; // Timestamps lastLoginAt?: string; lastPasswordChangedAt?: string; createdAt: string; updatedAt: string; deletedAt?: string; isVerified?: boolean; // for backward compatibility
}; export type Notification = { id: ID; userId: ID; type: 'like' | 'comment' | 'report' | 'system' | 'new_comment' | 'ad_reward'; content: string; // DB: content message?: string; // for backward compatibility linkUrl?: string; title?: string; // for backward compatibility (UI often needs title) isRead: boolean; relatedExamId?: ID; // Optional payload relatedCommentId?: ID; // Optional payload createdAt: string;
}; // ==========================================
// 3. 試験・問題データ
// ========================================== export type Exam = { id: string; // DB: BigInt examName: string; // DB: exam_name NOT NULL title?: string; // for backward compatibility -> alias to examName // Relations school?: string; // for backward compatibility universityId?: ID; universityName?: string; // Join result facultyId?: ID; facultyName?: string; // Join result departmentName?: string; // Join result department?: string; // for backward compatibility teacherId?: ID; teacherName?: string; subjectId?: ID; subjectName?: string; userId: string; authorId?: string; // for backward compatibility userName?: string; // Join result examYear: number; isPublic: boolean; status: 'active' | 'hidden_by_admin' | 'deleted' | 'reported_deleted'; // Stats goodCount: number; badCount: number; viewCount: number; adCount: number; commentCount: number; bookmarkCount: number; // DB: 8.2 expanded shareCount: number; // DB: 8.2 expanded pdfDownloadCount: number; // DB: 8.2 expanded // Metadata 8.2 fieldType?: 'science' | 'humanities'; level?: 'basic' | 'standard' | 'advanced' | 'difficult'; questionCount?: number; durationMinutes?: number; periodTag?: 'today' | 'week' | 'month' | 'year' | 'custom'; keywordChipIds?: ID[]; majorType?: number | 'science' | 'humanities'; createdAt: string; updatedAt: string; // Client-side state userLiked?: boolean; userDisliked?: boolean; questions?: Question[]; // Include questions for details view
}; export type Question = { id: string; examId: string; difficulty: number; // 0-5 questionNumber: number; questionContent: string; questionFormat: 0 | 1; // 0: text, 1: latex keywords?: KeywordLike[]; subQuestions?: SubQuestion[]; // Include sub_questions for details view createdAt: string; updatedAt: string;
}; export type SubQuestion = { id: string; questionId: string; subQuestionNumber: number; questionTypeId: number; questionTypeName?: string; // Join result questionContent: string; questionFormat: 0 | 1; answerContent: string; answerFormat: 0 | 1; selectionMode?: 'single' | 'multiple'; options?: SubQuestionOption[]; numericSettings?: NumericAnswerSettings; clozeBlanks?: ClozeBlank[]; executionMeta?: ExecutionMeta; keywords?: KeywordLike[]; createdAt: string; updatedAt: string;
}; export type SubQuestionOption = { id: string; content: string; isCorrect: boolean; orderIndex?: number; scoreWeight?: number;
}; export type NumericAnswerSettings = { tolerance?: number; unit?: string; scoringType?: 'exact' | 'range' | string;
}; export type ClozeBlank = { id: string; blankIndex: number; answer: string; tolerance?: number; scoreWeight?: number;
}; export type ExecutionMeta = { language?: string; timeLimitMs?: number; memoryMb?: number; runner?: string;
}; export type QuestionType = { id: number; typeName: string; description: string;
}; export type FileInput = { id: string; examId?: string; userId: string; filePath: string; originalFilename: string; fileType: string; sourceType: 'lecture-notes' | 'past-exam'; fileSizeBytes?: number; mimeType?: string; checksum?: string; analyzed: boolean; analysisStatus: 'pending' | 'processing' | 'completed' | 'failed'; createdAt: string;
}; // ==========================================
// 4. 検索・キーワード
// ========================================== export type Keyword = { id: string; keyword: string; relevanceScore?: number;
};
export type KeywordLike = Keyword | string; // ==========================================
// 5. ソーシャル・評価
// ========================================== export type ExamComment = { id: string; examId: string; userId: string; userName: string; userAvatar?: string; comment: string; createdAt: string; updatedAt: string;
}; // ==========================================
// 6. 経済・広告・システム
// ========================================== export type MintCoinTransaction = { id: string; userId: string; amount: number; type: 'earn' | 'spend'; description?: string; createdAt: string;
}; export type UserAdView = { id: string; userId: string; examId: string; actionType: string; createdAt: string;
}; // ==========================================
// 7. 通報システム
// ========================================== export type ReportReason = { id: number; reasonText: string; description: string;
}; export type Report = { id: string; reporterUserId: string; // Combined from content_reports and user_reports for frontend convenience targetType: 'exam' | 'question' | 'sub_question' | 'exam_comment' | 'user' | 'profile'; targetId: string; reasonId: number; details?: string; status: 'pending' | 'resolved' | 'ignored'; // Attachments attachedFiles?: ReportFile[]; createdAt: string; updatedAt: string;
}; export type ReportFile = { id: string; reportId: string; filePath: string; fileType: string; originalFilename?: string; createdAt: string;
}; // ==========================================
// 8. 設定・その他
// ========================================== export type ExamGenerationSettings = { id: string; examId: string; sourceType: 'lecture-notes' | 'past-exam'; levelPreference: 'basic' | 'standard' | 'advanced' | 'difficult' | 'none'; targetQuestionCount: number; questionFormatIds: number[]; autoPublish: boolean; needsStructureReview: boolean; includeExplanation: boolean; allowMathAssets: boolean; createdAt: string; updatedAt: string;
}; // ==========================================
// Frontend Specific / Legacy Types
// ========================================== export type Page = | 'login' | 'profile-setup' | 'home' | 'search' | | | | 'structure-confirm' | 'generating' | 'my-page' | 'admin'; export type GenerationStatus = | 'idle' | 'uploading' | 'analyzing' | 'structure-review' | 'generating' | 'complete' | 'error'; export type SourceType = 'lecture-notes' | 'past-exam'; // 問題構造確認用の型
export type ProblemStructure = { examName: string; school: string; department: string; subjectName: string; examYear: number; questions: QuestionStructure[];
}; export type QuestionStructure = { questionNumber: number; questionContent: string; questionFormat: 0 | 1; difficulty: number; keywords: string[]; subQuestions: SubQuestionStructure[];
}; export type SubQuestionStructure = { subQuestionNumber: number; questionTypeId: number; questionContent: string; questionFormat: 0 | 1; answerContent: string; answerFormat: 0 | 1; keywords: string[];
}; export * from './health';
