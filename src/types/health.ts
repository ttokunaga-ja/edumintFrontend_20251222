// ========================================
// EduMint - Health Status Types
// Grid: 16/24/32px
// ======================================== /** * Service health status * Used for ContextHealthAlert variants */
export type HealthStatus = 'operational' | 'degraded' | 'maintenance' | 'outage'; /** * Service categories for health monitoring * Maps to Alert C1-C5 in ALERT_STATE_BOARD.md */
export type ServiceCategory = | 'AI生成エンジン' // C1 | 'コンテンツサービス' // C2 | 'コイン残高・出金' // C3 | 'コミュニティ機能' // C4 | '通知・お知らせ'; // C5 /** * Service health information */
export interface ServiceHealth { category: ServiceCategory; status: HealthStatus; message: string; action?: { label: string; onClick: () => void; };
} /** * Job status for generation tasks * Used in JobStatusRibbon component */
export type JobStatus = 'queued' | 'processing' | 'paused' | 'completed' | 'error'; /** * File upload status * Used in FileUploadQueue component */
export type FileUploadStatus = 'pending' | 'uploading' | 'success' | 'error'; /** * Upload file with status tracking */
export interface UploadFile { id: string; file: File; status: FileUploadStatus; progress: number; // 0-100 errorMessage?: string;
} /** * Upload file with status tracking */
export interface UploadFile { id: string; file: File; status: FileUploadStatus; progress: number; // 0-100 errorMessage?: string;
}
