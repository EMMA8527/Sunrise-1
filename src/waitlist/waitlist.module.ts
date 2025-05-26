/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WaitlistService],
  controllers: [WaitlistController],
})
export class WaitlistModule {}
