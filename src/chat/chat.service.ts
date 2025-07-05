/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseAdminService } from '../firebase/firebase-admin.service'; // ✅ adjust the path if needed

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private firebaseAdminService: FirebaseAdminService, // ✅ Inject here
  ) {}

  // src/chat/chat.service.ts

async sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  translatedContent?: string,
) {
  // Save message to DB
  const message = await this.prisma.message.create({
    data: {
      senderId,
      receiverId,
      content,
      translatedContent,
    },
  });

  // Get sender name for notification
  const sender = await this.prisma.user.findUnique({
    where: { id: senderId },
  });

  // Auto-trigger push notification
  await this.notifyUserOnNewMessage(
    receiverId,
    sender?.name ?? 'Someone',
    content,
  );

  return message;
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

  async notifyUserOnNewMessage(receiverId: string, senderName: string, messageText: string) {
    const user = await this.prisma.user.findUnique({ where: { id: receiverId } });
    if (!user?.firebaseToken) return;

    const title = `New message from ${senderName}`;
    const body = messageText.length > 50 ? messageText.slice(0, 47) + '...' : messageText;

    await this.firebaseAdminService.sendPushNotification(user.firebaseToken, title, body, {
      type: 'chat',
      senderId: senderName,
    });
  }
}
