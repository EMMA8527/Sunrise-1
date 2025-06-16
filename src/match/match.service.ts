/* eslint-disable prettier/prettier */
// src/match/match.service.ts
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationGateway } from 'src/notification/notification.gateway';

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  async recordAction(
  userId: string,
  targetId: string,
  action: 'LIKE' | 'PASS',
) {
  if (userId === targetId) throw new Error('Invalid action on self');

  const targetUser = await this.prisma.user.findUnique({
    where: { id: targetId },
  });

  if (!targetUser) throw new Error('Target user does not exist');

  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { userProfile: true },
  });

  if (!user) throw new Error('User not found');

  if (action === 'LIKE') {
    if (!user.isPremium) {
      const today = new Date().toISOString().slice(0, 10);
      const likeCount = await this.prisma.matchInteraction.count({
        where: {
          userId,
          action: 'LIKE',
          createdAt: { gte: new Date(today) },
        },
      });

      if (likeCount >= 10) {
        throw new ForbiddenException(
          'You’ve reached your daily like limit. Upgrade to premium for unlimited likes.',
        );
      }
    }

    const existing = await this.prisma.matchInteraction.findFirst({
      where: {
        userId: targetId,
        targetId: userId,
        action: 'LIKE',
      },
    });

    if (existing) {
      await this.prisma.matchInteraction.create({
        data: { userId, targetId, action, isMatch: true },
      });

      await this.prisma.matchInteraction.update({
        where: { id: existing.id },
        data: { isMatch: true },
      });

      this.notificationGateway.sendNotification(targetId, {
        type: 'match',
        title: 'It’s a Match! ❤️',
        body: `You and ${user.userProfile?.fullName || 'Someone'} both liked each other — say hi!`,
        from: userId,
      });

      return { message: 'It’s a match!', match: true };
    }
  }

  await this.prisma.matchInteraction.create({
    data: { userId, targetId, action },
  });

  return { message: 'Interaction recorded', match: false };
}


{
  "page": 1,
  "limit": 20,
  "total": 58,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPreviousPage": false,
  "users": [ ... ]
}



async getPeopleWhoLikedMe(userId: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });

  if (!user.isPremium) {
    throw new ForbiddenException('Upgrade to premium to see who liked you.');
  }

  const likes = await this.prisma.matchInteraction.findMany({
    where: {
      targetId: userId,
      action: 'LIKE',
      isMatch: false,
    },
    include: {
      user: {
        include: { userProfile: true },
      },
    },
  });

  return likes.map((like) => ({
    id: like.user.id,
    fullName: like.user.userProfile?.fullName,
    photo: like.user.userProfile?.photos?.[0],
  }));
}



}
