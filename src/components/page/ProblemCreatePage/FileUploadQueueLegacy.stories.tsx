// @ts-nocheck
// ========================================
// FileUploadQueue Storybook Stories
// ======================================== import type { Meta, StoryObj } from '@storybook/react';
import { FileUploadQueue } from './FileUploadQueueLegacy';
import type { UploadFile } from '@/types/health'; const meta: Meta<typeof FileUploadQueue> = { title: 'Features/Upload/FileUploadQueue', component: FileUploadQueue, tags: ['autodocs'], parameters: { layout: 'padded', docs: { description: { component: undefined, }, }, }, argTypes: { files: { description: 'Array of files with upload status', control: 'object', }, onRemove: { description: 'Handler called when user removes a file', action: 'onRemove', }, onRetry: { description: 'Handler called when user retries a failed upload', action: 'onRetry', }, acceptedExtensions: { description: 'Accepted file extensions', control: 'array', }, maxFileSize: { description: 'Maximum file size in MB', control: 'number', }, maxFiles: { description: 'Maximum number of files', control: 'number', }, },
}; export default meta;
type Story = StoryObj<typeof FileUploadQueue>; // Mock File objects
const createMockFile = (name: string, size: number): File => { return new File([''], name, { type: 'application/pdf' });
}; // ========================================
// Story 1: Empty State
// ========================================
export const Empty: Story = { args: { files: [], onRemove: (fileId: string) => console.log('Remove:', fileId), onRetry: (fileId: string) => console.log('Retry:', fileId), acceptedExtensions: ['pdf', 'txt', 'md', 'tex'], maxFileSize: 10, maxFiles: 10, },
}; // ========================================
// Story 2: Pending State
// ========================================
export const PendingState: Story = { args: { files: [ { id: '1', file: createMockFile('lecture-notes.pdf', 2500000), status: 'pending', progress: 0, }, { id: '2', file: createMockFile('textbook-chapter3.pdf', 3800000), status: 'pending', progress: 0, }, ], onRemove: (fileId: string) => console.log('Remove:', fileId), onRetry: (fileId: string) => console.log('Retry:', fileId), acceptedExtensions: ['pdf', 'txt', 'md', 'tex'], maxFileSize: 10, maxFiles: 10, },
}; // ========================================
// Story 3: Uploading State
// ========================================
export const UploadingState: Story = { args: { files: [ { id: '1', file: createMockFile('lecture-notes.pdf', 2500000), status: 'uploading', progress: 35, }, { id: '2', file: createMockFile('textbook-chapter3.pdf', 3800000), status: 'uploading', progress: 68, }, { id: '3', file: createMockFile('assignment.md', 120000), status: 'pending', progress: 0, }, ], onRemove: (fileId: string) => console.log('Remove:', fileId), onRetry: (fileId: string) => console.log('Retry:', fileId), acceptedExtensions: ['pdf', 'txt', 'md', 'tex'], maxFileSize: 10, maxFiles: 10, },
}; // ========================================
// Story 4: Success State
// ========================================
export const SuccessState: Story = { args: { files: [ { id: '1', file: createMockFile('lecture-notes.pdf', 2500000), status: 'success', progress: 100, }, { id: '2', file: createMockFile('textbook-chapter3.pdf', 3800000), status: 'success', progress: 100, }, { id: '3', file: createMockFile('assignment.md', 120000), status: 'success', progress: 100, }, ], onRemove: (fileId: string) => console.log('Remove:', fileId), onRetry: (fileId: string) => console.log('Retry:', fileId), acceptedExtensions: ['pdf', 'txt', 'md', 'tex'], maxFileSize: 10, maxFiles: 10, },
}; // ========================================
// Story 5: Error State
// ========================================
export const ErrorState: Story = { args: { files: [ { id: '1', file: createMockFile('lecture-notes.pdf', 2500000), status: 'success', progress: 100, }, { id: '2', file: createMockFile('corrupted-file.pdf', 3800000), status: 'error', progress: 0, errorMessage: 'ファイルが破損しているため、アップロードできません', }, { id: '3', file: createMockFile('too-large.pdf', 15000000), status: 'error', progress: 0, errorMessage: 'ファイルサイズが10MBを超えています', }, ], onRemove: (fileId: string) => console.log('Remove:', fileId), onRetry: (fileId: string) => console.log('Retry:', fileId), acceptedExtensions: ['pdf', 'txt', 'md', 'tex'], maxFileSize: 10, maxFiles: 10, },
}; // ========================================
// Story 6: Mixed State (Real-world)
// ========================================
export const MixedState: Story = { args: { files: [ { id: '1', file: createMockFile('lecture-01.pdf', 2500000), status: 'success', progress: 100, }, { id: '2', file: createMockFile('lecture-02.pdf', 3200000), status: 'success', progress: 100, }, { id: '3', file: createMockFile('lecture-03.pdf', 2800000), status: 'uploading', progress: 42, }, { id: '4', file: createMockFile('lecture-04-corrupted.pdf', 3800000), status: 'error', progress: 0, errorMessage: 'ネットワークエラー: 再試行してください', }, { id: '5', file: createMockFile('lecture-05.pdf', 2900000), status: 'pending', progress: 0, }, ], onRemove: (fileId: string) => console.log('Remove:', fileId), onRetry: (fileId: string) => console.log('Retry:', fileId), acceptedExtensions: ['pdf', 'txt', 'md', 'tex'], maxFileSize: 10, maxFiles: 10, },
}; // ========================================
// Story 7: Large File Queue
// ========================================
export const LargeQueue: Story = { args: { files: Array.from({ length: 8 }, (_, i) => ({ id: `${i + 1}`, file: createMockFile(`lecture-${String(i + 1).padStart(2, '0')}.pdf`, 2000000 + i * 100000), status: (i < 3 ? 'success' : i < 5 ? 'uploading' : 'pending') as 'pending' | 'uploading' | 'success' | 'error', progress: i < 3 ? 100 : i < 5 ? (i - 3) * 30 + 15 : 0, })), onRemove: (fileId: string) => console.log('Remove:', fileId), onRetry: (fileId: string) => console.log('Retry:', fileId), acceptedExtensions: ['pdf', 'txt', 'md', 'tex'], maxFileSize: 10, maxFiles: 10, },
}; // ========================================
// Story 8: Long Filenames
// ========================================
export const LongFilenames: Story = { args: { files: [ { id: '1', file: createMockFile( '微分積分学_第3章_偏微分と重積分_演習問題と解答解説_2024年度版_最終稿.pdf', 2500000 ), status: 'success', progress: 100, }, { id: '2', file: createMockFile( 'Computer_Science_Advanced_Algorithms_and_Data_Structures_Complete_Lecture_Notes_Fall_2024.pdf', 4200000 ), status: 'uploading', progress: 55, }, ], onRemove: (fileId: string) => console.log('Remove:', fileId), onRetry: (fileId: string) => console.log('Retry:', fileId), acceptedExtensions: ['pdf', 'txt', 'md', 'tex'], maxFileSize: 10, maxFiles: 10, },
};
