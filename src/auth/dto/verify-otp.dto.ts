/* eslint-disable prettier/prettier */
import { IsEmail, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @Length(4, 4)
  code: string;
}
