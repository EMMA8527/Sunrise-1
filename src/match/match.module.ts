/* eslint-disable prettier/prettier */
// src/match/match.module.ts
import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller'; // ✅ import this
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [MatchController], // ✅ add this line
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
