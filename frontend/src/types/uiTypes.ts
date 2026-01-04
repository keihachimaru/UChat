export type Chat = {
    id: number;
    name: string;
    messageIds: number[];
    documentIds: number[];
}

export type Rag = {
    source: string;
    chunkIds: number[];
    vectorIds: number[];
}

export type Vector = {
    id: number;
    value: number;
    chunkId: number;
}

export type Chunk = {
    id: number;
    text: string;
    position: string;
    documentId: number;
    tags: string[];
}

export type Document = {
    id: number;
    source: string;
}

export type Model = {
    name: string;
    key: string | null;
    logo: string;
    color: string;
}

export type Message = {
    id: number;
    system: boolean;
    content: string;
    model?: string;
    author?: number | null;
    pinned: boolean;
    timestamp: string;
    reply: number | null;
}

export type Profile = {
    id: number;
    name: string;
    color: string;
    temperature: number;
    stream: boolean;
    maxTokens?: number;
    autoReply: boolean;
}

