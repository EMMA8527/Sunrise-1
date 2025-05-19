/* eslint-disable prettier/prettier */
// src/subscription/subscription.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { ChangePlanDto } from './dto/change-plan.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async subscribe(userId: string, dto: SubscribeDto) {
    // Example: assume dto.planId and dto.paymentMethod
    const { planId, paymentMethod } = dto;
    // create or update subscription record in User table or separate table
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        premiumSince: new Date(),
        premiumExpires: new Date(Date.now() + this.getPlanDuration(planId)),
      },
    });
    return { message: 'Subscription created' };
  }

  async changePlan(userId: string, dto: ChangePlanDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.isPremium) throw new BadRequestException('No active subscription');

    const { newPlanId } = dto;
    // update expiration based on new plan
    await this.prisma.user.update({
      where: { id: userId },
      data: { premiumExpires: new Date(Date.now() + this.getPlanDuration(newPlanId)) },
    });
    return { message: 'Plan changed' };
  }

  async cancelSubscription(userId: string, dto: CancelSubscriptionDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isPremium: false, premiumExpires: null, premiumSince: null },
    });
    return { message: 'Subscription cancelled' };
  }

  async getSubscriptionStatus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return {
      isPremium: user.isPremium,
      premiumSince: user.premiumSince,
      premiumExpires: user.premiumExpires,
    };
  }

  private getPlanDuration(planId: string): number {
    // Simple mapping; replace with real logic
    switch (planId) {
      case 'monthly': return 30 * 24 * 60 * 60 * 1000;
      case 'yearly': return 365 * 24 * 60 * 60 * 1000;
      default: throw new BadRequestException('Invalid plan');
    }
  }
}