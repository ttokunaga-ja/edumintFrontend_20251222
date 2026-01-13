// Minimal, safe type stubs for initial buildability. Replace with
// full definitions later when type-checking parity is needed.

export type ID = string | number;

export type User = {
  id: string;
  username?: string;
  displayName?: string;
  email?: string;
  university?: string;
  facultyName?: string;
  department?: string;
  role?: 'user' | 'admin';
};

export type AnyRecord = Record<string, any>;

export type Page =
  | 'login'
  | 'profile-setup'
  | 'home'
  | 'search'
  | 'structure-confirm'
  | 'generating'
  | 'my-page'
  | 'admin';

export type GenerationStatus =
  | 'idle'
  | 'uploading'
  | 'analyzing'
  | 'structure-review'
  | 'generating'
  | 'complete'
  | 'error';

export type SourceType = 'lecture-notes' | 'past-exam';

export interface Question {
  id: number;
  examId: number;
  content: string;
  difficulty?: number;
  format?: 'multiple_choice' | 'text' | 'code';
}

export interface Exam {
  id: number;
  title: string;
  subjectId?: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export * from './health';
