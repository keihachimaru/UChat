import { IsString } from 'class-validator';

export class PinChatDto {
    @IsString()
    id: string;
    
    @IsString()
    author: string;
}
