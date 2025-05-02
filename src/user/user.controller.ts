/* eslint-disable prettier/prettier */
// src/user/user.controller.ts
import { Controller, Post, Body, UseGuards, Get, Param, } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateProfileDto } from './../auth/dto/create-profile.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // Ensure you have a guard set up
import { MatchingQuizDto } from 'src/auth/dto/matching-quiz.dto';
import { MatchService } from 'src/match/match.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService, private matchService: MatchService,) {}

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async createOrUpdateProfile(
    @GetUser('id') userId: string,
    @Body() dto: CreateProfileDto,
  ) {
    return this.userService.createOrUpdateProfile(userId, dto);
  }

  @Post('quiz')
  @UseGuards(JwtAuthGuard)
  @Post('quiz')
  async submitQuiz(@GetUser('id') userId: string, @Body() dto: MatchingQuizDto) {
    return this.userService.submitQuiz(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
@Get('feed')
async getFeed(@GetUser('id') userId: string) {
  return this.userService.getPotentialMatches(userId);
}

@UseGuards(JwtAuthGuard)
@Post('like')
async likeUser(@GetUser('id') userId: string, @Body('targetId') targetId: string) {
  return this.matchService.recordAction(userId, targetId, 'LIKE'); // ✅ use matchService
}

@UseGuards(JwtAuthGuard)
@Post('pass')
async passUser(@GetUser('id') userId: string, @Body('targetId') targetId: string) {
  return this.matchService.recordAction(userId, targetId, 'PASS'); // ✅ use matchService
}

@UseGuards(JwtAuthGuard)
@Get('message/:targetId')
async openChat(@GetUser('id') userId: string, @Param('targetId') targetId: string) {
  const user = await this.userService.findUserById(targetId);
  return {
    id: user.id,
    name: user.userProfile?.fullName,
    photo: user.userProfile?.photos?.[0],
  };
}

@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@GetUser('id') userId: string) {
  const user = await this.userService.getUserProfile(userId);

  if (!user) {
    throw new Error('Profile not found');
  }

  return user;
}

@UseGuards(JwtAuthGuard)
@Post('change-password')
async changePassword(
  @GetUser('id') userId: string,
  @Body() dto: ChangePasswordDto,
) {
  return this.userService.changePassword(userId, dto);
}

@UseGuards(JwtAuthGuard)
@Post('upload-photo')
async uploadPhoto(
  @GetUser('id') userId: string,
  @Body('photoUrl') photoUrl: string,
) {
  return this.userService.addProfilePhoto(userId, photoUrl);
}

@UseGuards(JwtAuthGuard)
@Post('subscribe')
async subscribeToPremium(
  @GetUser('id') userId: string,
  @Body() dto: SubscribeDto,
) {
  return this.userService.subscribe(userId, dto);
}

@UseGuards(JwtAuthGuard)
@Post('upgrade-premium')
async upgradePremium(@GetUser('id') userId: string) {
  return this.userService.upgradeToPremium(userId);
}

@UseGuards(JwtAuthGuard)
@Get('liked-me')
async getPeopleWhoLikedMe(@GetUser('id') userId: string) {
  return this.matchService.getPeopleWhoLikedMe(userId);
}

@UseGuards(JwtAuthGuard)
@Post('boost')
async boostProfile(@GetUser('id') userId: string) {
  return this.userService.boostProfile(userId);
}


}
