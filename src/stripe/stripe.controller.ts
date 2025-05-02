/* eslint-disable prettier/prettier */
// src/stripe/stripe.controller.ts
import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PrismaService } from '../../prisma/prisma.service'; // Import PrismaService
import { Request,  } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import {  Headers } from '@nestjs/common';

@Controller('stripe')
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private prisma: PrismaService, // Inject PrismaService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckout(@GetUser('id') userId: string) {
    return this.stripeService.createCheckoutSession(userId);
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Headers('stripe-signature') sig: string) {
    const buf = (req as any).rawBody;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const stripe = new (require('stripe'))(process.env.STRIPE_SECRET_KEY);
    let event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook error:', err.message);
      return { received: false };
    }

    await this.stripeService.handleWebhook(event);
    return { received: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('status')
  async getSubscriptionStatus(@GetUser('id') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPremium: true,
        premiumSince: true,
      },
    });

    return {
      isPremium: user.isPremium,
      premiumSince: user.premiumSince,
    };
  }
}
