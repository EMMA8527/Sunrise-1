/* eslint-disable prettier/prettier */
// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { MatchModule } from '../match/match.module'; // ✅ import MatchModule

@Module({
  imports: [PrismaModule, MatchModule], // ✅ import MatchModule
  providers: [UserService], // ✅ remove MatchService
  exports: [UserService],
})
export class UserModule {}
