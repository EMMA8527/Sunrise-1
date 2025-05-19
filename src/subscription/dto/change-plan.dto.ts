/* eslint-disable prettier/prettier */
// src/subscription/dto/change-plan.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class ChangePlanDto {
  @IsString()
  @IsNotEmpty()
  newPlanId: string;
}
