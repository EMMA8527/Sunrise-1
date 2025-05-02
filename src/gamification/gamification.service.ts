/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async updateStreak(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const today = new Date().toDateString();
    const last = user.lastStreakDate?.toDateString();

    if (last === today) return; // Already updated today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isConsecutive =
      last === yesterday.toDateString();

    const streak = isConsecutive ? user.streakCount + 1 : 1;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        streakCount: streak,
        lastStreakDate: new Date(),
      },
    });
    if ([3, 7, 14, 30].includes(streak)) {
        // TODO: send notification, bonus, highlight user etc
        console.log(`User ${userId} hit a ${streak}-day streak! 🎉`);
      }      
  }
}
