/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service'; // If not globally exported
import { SubscriptionModule } from 'src/subscription/subscription.module'; // Optional if handling subscription

@Module({
  imports: [UserModule, SubscriptionModule],
  controllers: [AdminController],
  providers: [AdminService, UserService],
})
export class AdminModule {}
