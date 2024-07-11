import { IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { UserRole } from '../enum/user.enum';

export class UserDTO {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsStrongPassword()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    fullname: string;

    @IsNotEmpty()
    @IsEnum(UserRole)
    role: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}
