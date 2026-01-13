import { IsString } from 'class-validator';

export class LoginDto {
    @IsString()
    readonly email: string;

    @IsString()
    readonly name: string;

    @IsString()
    readonly avatar: string;
    
    @IsString()
    readonly provider: string;
    
    @IsString()
    readonly providerId: string;
}
