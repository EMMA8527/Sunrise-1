/* eslint-disable prettier/prettier */
// src/chat/chat.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { ChatService } from './chat.service';
import { TranslateService } from 'src/translate/translate.service';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { WsAuthMiddleware } from 'src/common/middleware/ws-auth.middleware';
  
  
  @WebSocketGateway({ cors: true })
  export class ChatGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;
      
  
    constructor(private chatService: ChatService,
        private translateService: TranslateService,
  private notificationGateway: NotificationGateway,
  private wsAuthMiddleware: WsAuthMiddleware,
    ) {}
  
    async handleConnection(socket: Socket) {
        await this.wsAuthMiddleware.use(socket, err => {
          if (err) throw err;
        });
    
        const userId = socket.data.userId;
        if (userId) {
          socket.join(userId);
        }
      }
  
    @SubscribeMessage('sendMessage')
    async handleSendMessage(
      @MessageBody()
      data: {
        senderId: string;
        receiverId: string;
        content: string;
        translatedContent?: string;
      },
      @ConnectedSocket() client: Socket,
    ) {
      const message = await this.chatService.sendMessage(
        data.senderId,
        data.receiverId,
        data.content,
        data.translatedContent,
      );
  
      // Emit to receiver and sender
      this.server.to(data.receiverId).emit('receiveMessage', message);
      this.server.to(data.senderId).emit('receiveMessage', message);

      // Send push notification (if needed)
      this.notificationGateway.sendNotification(data.receiverId, {
        type: 'message',
        title: 'New Message 💬',
        body: `You got a new message from ${data.senderId}`,
        from: data.senderId,
      });
      
    }

    @SubscribeMessage('translate_message')
async handleTranslateMessage(
  @MessageBody() data: { text: string; targetLang: string },
  @ConnectedSocket() client: Socket,
) {
  try {
    const translated = await this.translateService.translateText(data.text, data.targetLang);
    client.emit('translated_message', {
      original: data.text,
      translated,
      targetLang: data.targetLang,
    });
  } catch (err) {
    client.emit('error', { message: 'Translation failed', error: err.message });
  }
}
  }
  