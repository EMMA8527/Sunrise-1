/* eslint-disable prettier/prettier */
// src/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Module({
  providers: [NotificationGateway],
  exports: [NotificationGateway], // <-- Important!
})
export class NotificationModule {}
