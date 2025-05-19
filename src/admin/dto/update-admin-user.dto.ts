/* eslint-disable prettier/prettier */
import { IsEmail, IsOptional, IsString, MinLength, IsIn } from 'class-validator';

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsIn(['free', 'paid'])
  subscription?: 'free' | 'paid';

  @IsOptional()
  @IsIn(['active', 'banned', 'pending'])
  status?: 'ACTIVE' | 'BANNED' | 'PENDING';
}
