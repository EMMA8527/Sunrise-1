/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { TranslateModule } from 'src/translate/translate.module';
import { NotificationModule } from 'src/notification/notification.module';
import { WsAuthMiddleware } from 'src/common/middleware/ws-auth.middleware';
import { JwtModule } from '@nestjs/jwt'; // 👈 import JwtModule
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [TranslateModule, NotificationModule,   ConfigModule,
    JwtModule.register({}), ], // ✅ move it here
  providers: [ChatService, ChatGateway, PrismaService, WsAuthMiddleware],
  controllers: [ChatController],
})
export class ChatModule {}
