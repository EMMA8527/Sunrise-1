/* eslint-disable prettier/prettier */
import { IsIn } from 'class-validator';

export class UpdateUserStatusDto {
  @IsIn(['active', 'banned', 'pending'])
  status: 'ACTIVE' | 'BANNED' | 'PENDING';
}
