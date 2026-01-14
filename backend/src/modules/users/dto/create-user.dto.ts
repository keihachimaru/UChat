import { IsString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    readonly provider: string;

    @IsString()
    readonly providerId: string;

    @IsString()
    readonly email: string;

    @IsString()
    readonly name: string;

    @IsString()
    readonly avatar: string;
}

