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
  id: string;
  examId: string;
  content: string;
  difficulty?: number;
  format?: 'multiple_choice' | 'text' | 'code';
}

export interface Exam {
  id: string;
  title: string;
  subjectId?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export * from './health';
