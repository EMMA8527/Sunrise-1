/* eslint-disable prettier/prettier */
import { IsDateString } from 'class-validator';

export class SubscribeDto {
  @IsDateString()
  premiumExpires: string; // ISO string
}
