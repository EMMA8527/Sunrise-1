/* eslint-disable prettier/prettier */
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class JoinWaitlistDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsEnum(Gender, { message: 'Gender must be MALE or FEMALE' })
  gender: Gender;

  @IsOptional()
  @IsString()
  referredBy?: string;
}
