import { IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    readonly schoolLogin: string;
    
    readonly avatar?: string;
}