/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn } from 'class-validator';

export class CreateAdminUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsIn(['free', 'paid'])
  subscription: 'free' | 'paid';

  @IsIn(['active', 'banned', 'pending'])
  status: 'ACTIVE' | 'BANNED' | 'PENDING';
}
