import { nanoid } from 'nanoid';

// Job State Definition
export interface JobState {
    jobId: string;
    tempKey?: string;
    contentsId?: string;
    phase: number;
    lastUpdated: number;
    options: {
        checkStructure: boolean;
        isPublic: boolean;
    };
    data?: any;
}

// Global mutable state
export const jobs = new Map<string, JobState>();
export const createdExams: any[] = [];
