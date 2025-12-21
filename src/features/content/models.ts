export type { Exam, Question, SubQuestion, User } from '@/types';

export type ExamDetail = import('@/types').Exam & {
    questions: (import('@/types').Question & {
        subQuestions: import('@/types').SubQuestion[];
    })[];
};
