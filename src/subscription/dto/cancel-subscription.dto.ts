/* eslint-disable prettier/prettier */
// src/subscription/dto/cancel-subscription.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class CancelSubscriptionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
