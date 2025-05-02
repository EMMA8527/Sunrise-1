/* eslint-disable prettier/prettier */
// src/stripe/stripe.service.ts
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil', // Update to the correct API version
  });

  constructor(private prisma: PrismaService) {}

  async createCheckoutSession(userId: string) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: await this.getUserEmail(userId),
      line_items: [
        {
          price: process.env.STRIPE_PREMIUM_PRICE_ID, // e.g., price_1234
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/premium/success`,
      cancel_url: `${process.env.CLIENT_URL}/premium/cancel`,
      metadata: { userId },
    });

    return { url: session.url };
  }

  private async getUserEmail(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user.email;
  }

  async handleWebhook(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata.userId;

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumSince: new Date(),
        },
      });
    }
  }
}
