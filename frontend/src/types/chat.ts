export type Chat = {
    id: number;
    name: string;
    messageIds: number[];
    documentIds: number[];
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

export type Model = {
    name: string;
    key: string | null;
    logo: string;
    color: string;
}