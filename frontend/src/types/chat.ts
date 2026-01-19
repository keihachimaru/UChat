export type Chat = {
    id: string;
    name: string;
    messageIds: string[];
    documentIds: string[];
}

export type Message = {
    id: string;
    system: boolean;
    content: string;
    model?: string;
    author?: number | null;
    pinned: boolean;
    timestamp: string;
    reply: string | null;
}

export type Model = {
    name: string;
    key: string | null;
    logo: string;
    color: string;
}