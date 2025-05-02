/* eslint-disable prettier/prettier */
import { IsNotEmpty } from 'class-validator';

export class VerifyPhoneOtpDto {
  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  code: string;
}
