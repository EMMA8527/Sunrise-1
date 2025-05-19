/* eslint-disable prettier/prettier */
// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { MatchModule } from '../match/match.module'; // ✅ import MatchModule
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  imports: [PrismaModule, MatchModule], // ✅ import MatchModule
  providers: [UserService], // ✅ remove MatchService
  exports: [UserService],
})
export class UserModule {}
