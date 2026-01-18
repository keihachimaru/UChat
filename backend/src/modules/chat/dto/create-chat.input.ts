import { IsString } from 'class-validator';

export class CreateChatInput {
    @IsString()
    name: string;
    
    @IsString()
    author: string;
}
