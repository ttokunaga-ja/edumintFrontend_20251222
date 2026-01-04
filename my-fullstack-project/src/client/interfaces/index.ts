// This file exports interfaces that define the structure of data objects used in the frontend, corresponding to backend models. 

export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Post {
    id: number;
    title: string;
    content: string;
    authorId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Comment {
    id: number;
    postId: number;
    authorId: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

// Add more interfaces as needed to match the backend models.