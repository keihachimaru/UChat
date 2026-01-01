export interface Chat = {
    id: number;
    name: string;
    messageIds: number[];
    documentIds: number[];
}

export interface Rag = {
    source: string;
    chunkIds: number[];
    vectorIds: number[];
}

export interface Vector = {
    id: number;
    value: number;
    chunkId: number;
}

export interface Chunk = {
    id: number;
    text: string;
    position: string;
    documentId: number;
    tags: string[];
}

export interface Document = {
    id: number;
    source: string;
}

export interface Model = {
    name: string;
    apiKey: string;
    endpoint: string;
}

export interface Message = {
    id: number;
    reply: boolean;
    content: string;
    model?: string;
    author?: number;
    pinned: boolean;
    timestamp: string;
}

export interface Profile = {
    id: number;
    name: string;
    color: string;
    temperature: number;
    stream: boolean;
    maxTokens?: number;
}

