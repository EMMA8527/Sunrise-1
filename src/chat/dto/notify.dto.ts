/* eslint-disable prettier/prettier */
import { IsString } from 'class-validator';

export class NotifyDto {
  @IsString()
  receiverId: string;

  @IsString()
  senderName: string;

  @IsString()
  messageText: string;
}
