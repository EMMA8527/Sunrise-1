import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GamificationService],
  exports: [GamificationService], // 👈 export so other modules (like UserModule) can use it
})
export class GamificationModule {}
