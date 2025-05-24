/* eslint-disable prettier/prettier */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchingQuizDto } from '../auth/dto/matching-quiz.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MatchService } from '../match/match.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcryptjs';
import * as dayjs from 'dayjs';
import { Gender } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private matchService: MatchService,
  ) {}

  async setName(userId: string, fullName: string) {
  if (!userId || !fullName) {
    throw new Error('userId and fullName are required');
  }

  const profile = await this.prisma.userProfile.upsert({
    where: { userId },
    update: { fullName, profileCompletionStep: 1 },
    create: {
      fullName,
      profileCompletionStep: 1,
      user: { connect: { id: userId } },
    },
  });

  return {
    message: 'Name set successfully',
    data: profile,
  };
}

async setIntentions(userId: string, intentions: string[]) {
  const profile = await this.prisma.userProfile.upsert({
    where: { userId },
    update: { intentions, profileCompletionStep: 2 },
    create: {
      intentions,
      profileCompletionStep: 2,
      user: { connect: { id: userId } },
    },
  });

  return {
    message: 'Intentions set successfully',
    data: profile,
  };
}

async setBirthday(userId: string, birthday: string) {
  const profile = await this.prisma.userProfile.upsert({
    where: { userId },
    update: { birthday: new Date(birthday), profileCompletionStep: 3 },
    create: {
      birthday: new Date(birthday),
      profileCompletionStep: 3,
      user: { connect: { id: userId } },
    },
  });

  return {
    message: 'Birthday set successfully',
    data: profile,
  };
}

async setGender(userId: string, gender: Gender) {
  const profile = await this.prisma.userProfile.upsert({
    where: { userId },
    update: { gender, profileCompletionStep: 4 },
    create: {
      gender,
      profileCompletionStep: 4,
      user: { connect: { id: userId } },
    },
  });

  return {
    message: 'Gender set successfully',
    data: profile,
  };
}

async setPreference(userId: string, preference: string) {
  const profile = await this.prisma.userProfile.upsert({
    where: { userId },
    update: { preference, profileCompletionStep: 5 },
    create: {
      preference,
      profileCompletionStep: 5,
      user: { connect: { id: userId } },
    },
  });

  return {
    message: 'Preference set successfully',
    data: profile,
  };
}

async addPhotos(userId: string, photoUrls: string[]) {
  if (photoUrls.length < 2) {
    throw new ForbiddenException('Please upload at least two photos');
  }

  const profile = await this.prisma.userProfile.upsert({
    where: { userId },
    update: { photos: photoUrls, profileCompletionStep: 6 },
    create: {
      photos: photoUrls,
      profileCompletionStep: 6,
      user: { connect: { id: userId } },
    },
  });

  return {
    message: 'Photos added successfully',
    data: profile,
  };
}


 async submitQuiz(userId: string, dto: MatchingQuizDto) {
  const profile = await this.prisma.userProfile.update({
    where: { userId },
    data: { quizAnswers: dto.quizAnswers },
  });

  return {
    message: 'Quiz submitted successfully',
    data: profile,
  };
}


  async getPotentialMatches(userId: string) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userProfile: true },
    });

    if (!currentUser?.userProfile) {
      throw new NotFoundException('User profile not found');
    }

    const interacted = await this.prisma.matchInteraction.findMany({
      where: { userId },
      select: { targetId: true },
    });

    const excludedIds = interacted.map((i) => i.targetId);

    const candidates = await this.prisma.user.findMany({
      where: {
        id: { not: userId, notIn: excludedIds },
        userProfile: { isNot: null },
      },
      include: { userProfile: true },
      take: 20,
    });

    return candidates.map((user) => {
      const profile = user.userProfile!;
      const age = dayjs().diff(profile.birthday, 'year');
      const matchScore = this.calculateMatchScore(
        currentUser.userProfile,
        profile,
      );

      return {
        id: user.id,
        fullName: profile.fullName,
        age,
        photos: profile.photos,
        compatibilityScore: matchScore,
      };
    });
  }

  calculateMatchScore(current: any, target: any) {
    let score = 0;

    if (
      current.quizAnswers?.loveLanguage &&
      target.quizAnswers?.loveLanguage &&
      current.quizAnswers.loveLanguage === target.quizAnswers.loveLanguage
    ) {
      score += 20;
    }

    if (
      current.quizAnswers?.relationshipStyle &&
      target.quizAnswers?.relationshipStyle &&
      current.quizAnswers.relationshipStyle ===
        target.quizAnswers.relationshipStyle
    ) {
      score += 20;
    }

    return score;
  }

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { userProfile: true },
    });
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userProfile: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      email: user.email,
      fullName: user.userProfile?.fullName,
      photo: user.userProfile?.photos?.[0],
      streakCount: user.streakCount,
      lastStreakDate: user.lastStreakDate,
      isPremium: user.isPremium,
    };
  }

 async updateProfile(userId: string, dto: UpdateProfileDto) {
  const { fullName, birthday, photos, gender, ...rest } = dto;

  const profile = await this.prisma.userProfile.upsert({
    where: { userId },
    update: {
      fullName,
      birthday: birthday ? new Date(birthday) : undefined,
      photos,
      gender: gender ? (gender as Gender) : undefined,
      ...rest,
    },
    create: {
      fullName,
      birthday: birthday ? new Date(birthday) : undefined,
      photos,
      gender: gender ? (gender as Gender) : undefined,
      user: { connect: { id: userId } },
      ...rest,
    },
  });

  return {
    message: 'Profile updated successfully',
    data: profile,
  };
}


  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.password) {
      throw new ForbiddenException('Password not set');
    }

    const isCorrect = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isCorrect) {
      throw new ForbiddenException('Old password is incorrect');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: 'Password updated successfully' };
  }

  async addProfilePhoto(userId: string, photoUrl: string) {
  const profile = await this.prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new NotFoundException('User profile not found');
  }

  const updatedPhotos = [...(profile.photos || []), photoUrl];

  const updatedProfile = await this.prisma.userProfile.update({
    where: { userId },
    data: { photos: updatedPhotos },
  });

  return {
    message: 'Photo added successfully',
    data: updatedProfile,
  };
}

  async upgradeToPremium(userId: string, durationInDays = 30) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');

  const now = new Date();
  const expiry = new Date(now.getTime() + durationInDays * 24 * 60 * 60 * 1000);

  const updated = await this.prisma.user.update({
    where: { id: userId },
    data: {
      isPremium: true,
      premiumSince: now,
      premiumExpires: expiry,
    },
  });

  return {
    message: 'Upgraded to premium successfully',
    data: updated,
  };
}


  async boostProfile(userId: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');

  const today = new Date().toISOString().split('T')[0];

  if (!user.isPremium) {
    const boost = await this.prisma.profileBoost.findFirst({
      where: { userId, date: today },
    });

    if (boost) {
      throw new ForbiddenException(
        'Free boost already used today. Upgrade to premium for unlimited boosts.',
      );
    }

    await this.prisma.profileBoost.create({
      data: { userId, date: today },
    });
  }

  const updated = await this.prisma.userProfile.update({
    where: { userId },
    data: { boostedAt: new Date() },
  });

  return {
    message: 'Profile boosted successfully',
    data: updated,
  };
}
}