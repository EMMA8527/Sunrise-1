/* eslint-disable prettier/prettier */
// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { MatchModule } from '../match/match.module'; // ✅ import MatchModule
import { UserController } from './user.controller';
import { AwsS3Service } from 'src/aws/aws-s3.service';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  controllers: [UserController],
  imports: [PrismaModule, MatchModule, GamificationModule], // ✅ import MatchModule
  providers: [UserService, AwsS3Service], // ✅ remove MatchService
  exports: [UserService],
})
export class UserModule {}
