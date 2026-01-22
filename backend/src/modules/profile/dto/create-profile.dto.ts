export class CreateProfileDto {
    name: string;
    color: string;
    temperature: number;
    stream: boolean;
    maxTokens: number;
    autoReply: boolean;
}
