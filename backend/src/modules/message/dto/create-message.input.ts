import { IsBoolean, IsString, IsNumber } from "class-validator";

export class CreateMessageInput {
    @IsBoolean()
    system: boolean;
    
    @IsString()
    content: string;
    
    @IsString()
    aimodel?: string;

    @IsString()
    author?: string;

    @IsBoolean()
    pinned: boolean;
    
    @IsString()
    user: string;
    
    @IsString()
    chat: string;

    @IsNumber()
    reply?: number;
}
