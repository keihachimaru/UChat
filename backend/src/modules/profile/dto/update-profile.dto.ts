export class UpdateProfileDto {
    id: string;
    name: string;
    color: string;
    temperature: number;
    stream: boolean;
    maxTokens: number;
    autoReply: boolean;
}
