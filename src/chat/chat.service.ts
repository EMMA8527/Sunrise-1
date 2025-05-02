/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(senderId: string, receiverId: string, content: string, translatedContent?: string) {
    return this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        translatedContent,
      },
    });
  }

  async getChatHistory(userId: string, partnerId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markMessagesAsRead(userId: string, partnerId: string) {
    await this.prisma.message.updateMany({
      where: {
        receiverId: userId,
        senderId: partnerId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }
}
