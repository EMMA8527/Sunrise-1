/* eslint-disable prettier/prettier */
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { WsAuthMiddleware } from './common/middleware/ws-auth.middleware';
import { GamificationService } from './gamification/gamification.service';
import { MatchModule } from './match/match.module';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { TranslateModule } from './translate/translate.module';
import { NotificationModule } from './notification/notification.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { AwsS3Service } from './aws/aws-s3.service';
import { WaitlistModule } from './waitlist/waitlist.module';

@Module({
  imports: [AuthModule, UserModule, PrismaModule, MatchModule, NotificationModule, TranslateModule, ChatModule, SubscriptionModule, WaitlistModule,
    ConfigModule.forRoot({
      isGlobal: true, // 👈 makes ConfigService available globally
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  
  ],
  controllers: [AppController],
  providers: [AppService, WsAuthMiddleware, GamificationService, AwsS3Service],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    
  }
}
