/* eslint-disable prettier/prettier */
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyResetOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(4, 6)
  otp: string;
}
