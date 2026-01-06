export type Profile = {
    id: number;
    name: string;
    color: string;
    temperature: number;
    stream: boolean;
    maxTokens?: number;
    autoReply: boolean;
}