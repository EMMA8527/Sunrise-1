/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Query,
  Patch,
  Req
} from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MatchingQuizDto } from '../auth/dto/matching-quiz.dto';
import { MatchService } from '../match/match.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SetNameDto } from './dto/set-name.dto';
import { SetIntentionsDto } from './dto/set-intentions.dto';
import { SetBirthdayDto } from './dto/set-birthday.dto';
import { SetGenderDto } from './dto/set-gender.dto';
import { SetPreferenceDto } from './dto/set-preference.dto';
import { AddPhotosDto } from './dto/add-photos.dto';
import { AwsS3Service } from 'src/aws/aws-s3.service';
import {MatchFiltersDto} from './dto/match-filters.dto'
import { GamificationService } from '../gamification/gamification.service';
import { UpdateBioDto } from './dto/update-bio.dto';



@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private matchService: MatchService,
    private readonly awsS3Service: AwsS3Service,
    private readonly gamificationService: GamificationService,
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
    return this.userService.getPotentialMatches(userId, 1, { limit: 20 });
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

  @Get('profile/:id')
async getProfileById(@Param('id') id: string) {
  const user = await this.userService.getUserProfile(id);
  return { data: user };
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

  // ✅ Set Name using DTO and consistent guard
  @UseGuards(JwtAuthGuard)
  @Post('set-name')
  async setName(
    @GetUser('id') userId: string,
    @Body() dto: SetNameDto,
  ) {
    console.log('userId:', userId);
    console.log('fullName:', dto.fullName);
    return this.userService.setName(userId, dto.fullName);
  }

  @UseGuards(JwtAuthGuard)
  @Post('set-intentions')
  async setIntentions(
    @GetUser('id') userId: string,
    @Body() dto: SetIntentionsDto,
  ) {
    return this.userService.setIntentions(userId, dto.intentions);
  }

  @UseGuards(JwtAuthGuard)
  @Post('set-birthday')
  async setBirthday(
    @GetUser('id') userId: string,
    @Body() dto: SetBirthdayDto,
  ) {
    return this.userService.setBirthday(userId, dto.birthday);
  }

  @UseGuards(JwtAuthGuard)
  @Post('set-gender')
  async setGender(
    @GetUser('id') userId: string,
    @Body() dto: SetGenderDto,
  ) {
    return this.userService.setGender(userId, dto.gender);
  }

  @UseGuards(JwtAuthGuard)
  @Post('set-preference')
  async setPreference(
    @GetUser('id') userId: string,
    @Body() dto: SetPreferenceDto,
  ) {
    return this.userService.setPreference(userId, dto.preference);
  }

   @UseGuards(JwtAuthGuard)
  @Get('get-upload-url')
  async getUploadUrl(
    @GetUser('id') userId: string,
    @Query('fileType') fileType: string = 'image/jpeg',
  ) {
    const fileName = `${userId}-${Date.now()}.jpg`;
    const uploadUrl = await this.awsS3Service.getPresignedUrl(fileName, fileType);
    const key = `profile_photos/${fileName}`;

    return {
      uploadUrl,
      key,
      publicUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-photos')
  async addPhotos(
    @GetUser('id') userId: string,
    @Body() dto: AddPhotosDto, // expects `photoUrls: string[]`
  ) {
    return this.userService.addPhotos(userId, dto.photoUrls);
  }

  @Get(':id/mini-profile')
async getMiniProfile(
  @Param('id') id: string,
  @GetUser('id') viewerId: string, // 🔥 the one viewing this mini profile
) {
  return this.userService.getUserMiniProfile(id, viewerId);
}


@Patch('streak/seen')
markStreakAsSeen(@Req() req) {
  const userId = req.user.id;
  return this.userService.markStreakAsSeen(userId);
}

@UseGuards(JwtAuthGuard)
@Get('matches')
getMatches(@Req() req, @Query() query: MatchFiltersDto) {
  const userId = req.user.id;

  return this.userService.getPotentialMatches(userId, Number(query.page), {
    gender: query.gender,
    location: query.location,
    sortBy: query.sortBy,
    limit: query.limit ? Number(query.limit) : 20,
    minAge: query.minAge ? Number(query.minAge) : undefined,
    maxAge: query.maxAge ? Number(query.maxAge) : undefined,
    lat: query.lat ? Number(query.lat) : undefined,
    lng: query.lng ? Number(query.lng) : undefined,
  });
}


 @UseGuards(JwtAuthGuard)
  @Patch('streak/update')
  async updateStreak(@Req() req) {
    const userId = req.user.id;
    await this.gamificationService.updateStreak(userId);
    return { message: 'Streak updated successfully' };
  }

  @UseGuards(JwtAuthGuard)
@Patch('update-coordinates')
async updateCoordinates(
  @GetUser('id') userId: string,
  @Body('latitude') lat: number,
  @Body('longitude') lng: number,
) {
  return this.userService.updateCoordinates(userId, lat, lng);
}

@UseGuards(JwtAuthGuard)
@Patch('update-firebase-token')
async updateFirebaseToken(
  @GetUser('id') userId: string,
  @Body('token') token: string,
) {
  return this.userService.updateFirebaseToken(userId, token);
}

@UseGuards(JwtAuthGuard)
@Get('explore')
searchUsers(
  @GetUser('id') userId: string,
  @Query() query: MatchFiltersDto,
) {
  return this.userService.searchUsers(userId, Number(query.page), {
    ...query,
    limit: Number(query.limit),
    minAge: query.minAge ? Number(query.minAge) : undefined,
    maxAge: query.maxAge ? Number(query.maxAge) : undefined,
    lat: query.lat ? Number(query.lat) : undefined,
    lng: query.lng ? Number(query.lng) : undefined,
  });
}

@UseGuards(JwtAuthGuard)
@Patch('update-bio')
async updateBio(
  @GetUser('id') userId: string,
  @Body() dto: UpdateBioDto,
) {
  return this.userService.updateBio(userId, dto.bio);
}

@UseGuards(JwtAuthGuard)
@Post('set-bio')
async setBio(@GetUser('id') userId: string, @Body() dto: UpdateBioDto) {
  return this.userService.setBio(userId, dto.bio);
}

// user.controller.ts or profile.controller.ts
@UseGuards(JwtAuthGuard)
@Get('bio')
async getBio(@GetUser('id') userId: string) {
  return this.userService.getUserBio(userId);
}

@Get('bio/:id')
async getUserBioById(@Param('id') userId: string) {
  return this.userService.getUserBio(userId);
}


}
