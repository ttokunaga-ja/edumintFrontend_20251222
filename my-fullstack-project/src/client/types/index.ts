// This file exports TypeScript types used throughout the frontend application, ensuring type safety.

export type User = {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
};

export type Post = {
    id: number;
    title: string;
    content: string;
    authorId: number;
    createdAt: Date;
    updatedAt: Date;
};

export type Comment = {
    id: number;
    postId: number;
    authorId: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
};