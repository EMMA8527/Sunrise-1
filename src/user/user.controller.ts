/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MatchingQuizDto } from '../auth/dto/matching-quiz.dto';
import { MatchService } from '../match/match.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Gender } from '@prisma/client';


@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private matchService: MatchService,
  ) {}

  
  @UseGuards(JwtAuthGuard)
  @Post('quiz')
  async submitQuiz(
    @GetUser('id') userId: string,
    @Body() dto: MatchingQuizDto,
  ) {
    return this.userService.submitQuiz(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  async getFeed(@GetUser('id') userId: string) {
    return this.userService.getPotentialMatches(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('like')
  async likeUser(
    @GetUser('id') userId: string,
    @Body('targetId') targetId: string,
  ) {
    return this.matchService.recordAction(userId, targetId, 'LIKE');
  }

  @UseGuards(JwtAuthGuard)
  @Post('pass')
  async passUser(
    @GetUser('id') userId: string,
    @Body('targetId') targetId: string,
  ) {
    return this.matchService.recordAction(userId, targetId, 'PASS');
  }

  @UseGuards(JwtAuthGuard)
  @Get('message/:targetId')
  async openChat(
    @GetUser('id') userId: string,
    @Param('targetId') targetId: string,
  ) {
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

  @UseGuards(JwtAuthGuard)
  @Patch('profile/name')
  async setName(
    @GetUser('id') userId: string,
    @Body() dto: { fullName: string },
  ) {
    return this.userService.setName(userId, dto.fullName);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/intentions')
  async setIntentions(
    @GetUser('id') userId: string,
    @Body() dto: { intentions: string[] },
  ) {
    return this.userService.setIntentions(userId, dto.intentions);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/birthday')
  async setBirthday(
    @GetUser('id') userId: string,
    @Body() dto: { birthday: string },
  ) {
    return this.userService.setBirthday(userId, dto.birthday);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/gender')
  async setGender(
    @GetUser('id') userId: string,
    @Body() dto: { gender: Gender },
  ) {
    return this.userService.setGender(userId, dto.gender);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/preference')
  async setShowMe(
    @GetUser('id') userId: string,
    @Body() dto: { preference: string }, // fixed: dto.preference, not dto.showMe
  ) {
    return this.userService.setPreference(userId, dto.preference);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/photos')
  async addPhotos(
    @GetUser('id') userId: string,
    @Body() dto: { photos: string[] },
  ) {
    return this.userService.addPhotos(userId, dto.photos);
  }
}
