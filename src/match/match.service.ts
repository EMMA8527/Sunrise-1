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
  )
  
   {
    if (userId === targetId) throw new Error('Invalid action on self');

    if (action === 'LIKE') {
      const existing = await this.prisma.matchInteraction.findFirst({
        where: {
          userId: targetId,
          targetId: userId,
          action: 'LIKE',
        },
      });

      if (existing) {
        // Mutual match!
        await this.prisma.matchInteraction.create({
          data: {
            userId,
            targetId,
            action,
            isMatch: true,
          },
        });

       
        

        await this.prisma.matchInteraction.update({
          where: { id: existing.id },
          data: {
            isMatch: true,
          },
        });

        this.notificationGateway.sendNotification(targetId, {
            type: 'match',
            title: 'It’s a Match! ❤️',
            body: 'You’ve got a new match!',
            from: userId,
          });


        return { message: 'It’s a match!', match: true };
      }
    }

    await this.prisma.matchInteraction.create({
        data: {
          userId,
          targetId,
          action,
        },
      });

      const user = await this.prisma.user.findUnique({ where: { id: userId } });

if (!user.isPremium) {
  const today = new Date().toISOString().slice(0, 10);

  const likeCount = await this.prisma.matchInteraction.count({
    where: {
      userId,
      action: 'LIKE',
      createdAt: {
        gte: new Date(today), // today only
      },
    },
  });

  if (likeCount >= 10) {
    throw new ForbiddenException('You’ve reached your daily like limit. Upgrade to premium for unlimited likes.');
  }
}

      

    return { message: 'Interaction recorded', match: false };
  }

  async getMatchedUsers(userId: string) {
    const matches = await this.prisma.matchInteraction.findMany({
      where: {
        userId,
        isMatch: true,
      },
      include: {
        target: {
          include: {
            userProfile: true,
          },
        },
      },
    });
  
    return matches.map(match => ({
      id: match.target.id,
      fullName: match.target.userProfile?.fullName,
      photo: match.target.userProfile?.photos?.[0],
      age: match.target.userProfile?.birthday
        ? new Date().getFullYear() - new Date(match.target.userProfile.birthday).getFullYear()
        : null,
    }));
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
