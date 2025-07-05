/* eslint-disable prettier/prettier */
// src/chat/chat.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { TranslateService } from 'src/translate/translate.service';
import { NotifyDto } from './dto/notify.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService,
    private translateService: TranslateService,
  ) {}

  @Get('history/:partnerId')
  async getChatHistory(
    @GetUser('id') userId: string,
    @Param('partnerId') partnerId: string,
  ) {
    return this.chatService.getChatHistory(userId, partnerId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('translate')
  async translateText(
    @GetUser('id') userId: string,
    @Body('text') text: string,
    @Body('targetLang') targetLang: string,
  ) {
    const translated = await this.translateService.translateText(text, targetLang);
    return { translated };
  }

  @Post('send')
async sendMessage(
  @GetUser('id') senderId: string,
  @Body('receiverId') receiverId: string,
  @Body('content') content: string,
  @Body('translatedContent') translatedContent?: string,
) {
  return this.chatService.sendMessage(senderId, receiverId, content, translatedContent);
}

 @UseGuards(JwtAuthGuard)
  @Post('notify')
  async notifyUser(@Body() dto: NotifyDto) {
    const { receiverId, senderName, messageText } = dto;
    return this.chatService.notifyUserOnNewMessage(receiverId, senderName, messageText);
  }
}


