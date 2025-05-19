/* eslint-disable prettier/prettier */
// src/subscription/subscription.controller.ts
import { Controller, Post, Patch, Get, Body, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { ChangePlanDto } from './dto/change-plan.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  subscribe(
    @GetUser('id') userId: string,
    @Body() dto: SubscribeDto,
  ) {
    return this.subscriptionService.subscribe(userId, dto);
  }

  @Patch('plan')
  changePlan(
    @GetUser('id') userId: string,
    @Body() dto: ChangePlanDto,
  ) {
    return this.subscriptionService.changePlan(userId, dto);
  }

  @Patch('cancel')
  cancel(
    @GetUser('id') userId: string,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.subscriptionService.cancelSubscription(userId, dto);
  }

  @Get()
  status(@GetUser('id') userId: string) {
    return this.subscriptionService.getSubscriptionStatus(userId);
  }
}
