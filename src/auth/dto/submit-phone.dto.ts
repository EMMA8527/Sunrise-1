/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class SubmitPhoneDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}
