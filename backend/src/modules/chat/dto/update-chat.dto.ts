import { PartialType } from '@nestjs/mapped-types';
import { CreateChatDto } from './create-chat.dto';
import { IsString } from 'class-validator';

export class UpdateChatDto {
    @IsString()
    id: string;
    
    @IsString()
    author: string;
    
    @IsString()
    name: string;
}
