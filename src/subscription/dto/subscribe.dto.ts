/* eslint-disable prettier/prettier */
// src/subscription/dto/subscribe.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class SubscribeDto {
  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string; // e.g. 'stripe', 'offline'
}


