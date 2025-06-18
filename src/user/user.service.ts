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
import { calculateCompatibilityScore } from '../utils/compatibility.util';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcryptjs';
import * as dayjs from 'dayjs';
import { Gender, User, UserProfile } from '@prisma/client';
import { haversineDistance } from '../utils/math';

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


 async getPotentialMatches(
  userId: string,
  page: number,
  filters: {
    gender?: string;
    location?: string;
    minAge?: number;
    maxAge?: number;
    sortBy?: 'recent' | 'age-asc' | 'age-desc';
    limit: number;
    lat?: number;
    lng?: number;
  },
) {
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

  const buildCandidates = async (applyFilters = true) => {
    return await this.prisma.user.findMany({
      where: {
        id: { not: userId, notIn: excludedIds },
        userProfile: applyFilters && filters.gender
          ? { is: { gender: filters.gender as Gender } }
          : { isNot: null },
      },
      include: { userProfile: true },
      take: 50,
    }) as Array<User & { userProfile: UserProfile | null }>;
  };

  let candidates = await buildCandidates(true);

  let matches = candidates
    .map((user) => {
      const profile = user.userProfile!;
      const age = profile.birthday ? dayjs().diff(profile.birthday, 'year') : null;

      const compatibilityScore = calculateCompatibilityScore(
        currentUser.userProfile.quizAnswers,
        profile.quizAnswers,
      );

      let distanceKm: number | null = null;
      if (
        filters.lat &&
        filters.lng &&
        profile.latitude != null &&
        profile.longitude != null
      ) {
        distanceKm = haversineDistance(
          filters.lat,
          filters.lng,
          profile.latitude,
          profile.longitude,
        );
      }

      return {
        id: user.id,
        fullName: profile.fullName,
        age,
        photos: profile.photos,
        compatibilityScore,
        distanceKm,
      };
    })
    .filter((m) => {
      if (filters.minAge && m.age !== null && m.age < filters.minAge) return false;
      if (filters.maxAge && m.age !== null && m.age > filters.maxAge) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'age-asc') return (a.age ?? 0) - (b.age ?? 0);
      if (filters.sortBy === 'age-desc') return (b.age ?? 0) - (a.age ?? 0);
      return b.compatibilityScore - a.compatibilityScore;
    })
    .slice(0, filters.limit);

  // If no matches, fallback to broader pool (no gender, no age filters)
  if (matches.length === 0) {
    candidates = await buildCandidates(false);

    matches = candidates
      .map((user) => {
        const profile = user.userProfile!;
        const age = profile.birthday ? dayjs().diff(profile.birthday, 'year') : null;

        const compatibilityScore = calculateCompatibilityScore(
          currentUser.userProfile.quizAnswers,
          profile.quizAnswers,
        );

        let distanceKm: number | null = null;
        if (
          filters.lat &&
          filters.lng &&
          profile.latitude != null &&
          profile.longitude != null
        ) {
          distanceKm = haversineDistance(
            filters.lat,
            filters.lng,
            profile.latitude,
            profile.longitude,
          );
        }

        return {
          id: user.id,
          fullName: profile.fullName,
          age,
          photos: profile.photos,
          compatibilityScore,
          distanceKm,
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, filters.limit);

    return {
      data: matches,
      fallback: true,
    };
  }

  return {
    data: matches,
    fallback: false,
  };
}



  async getUserProfile(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { userProfile: true },
  });

  if (!user) throw new NotFoundException('User not found');

  const today = new Date().toISOString().split('T')[0]; // e.g. '2025-06-15'
  const lastStreak = user.lastStreakDate
    ? new Date(user.lastStreakDate).toISOString().split('T')[0]
    : null;

  let canShowStreak: boolean | null;

  if (!lastStreak) {
    canShowStreak = null; // First time user
  } else if (lastStreak !== today) {
    canShowStreak = false; // User hasn’t seen streak today
  } else {
    canShowStreak = true; // User already saw today’s streak
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.userProfile?.fullName,
    photo: user.userProfile?.photos?.[0],
    streakCount: user.streakCount,
    canShowStreak, // replaces lastStreakDate
    isPremium: user.isPremium,
  };
}

async markStreakAsSeen(userId: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new NotFoundException('User not found');

  const today = new Date().toDateString();
  const lastSeen = user.lastStreakDate?.toDateString();

  if (lastSeen === today) {
    return { message: 'Streak already marked as seen today' };
  }

  await this.prisma.user.update({
    where: { id: userId },
    data: { lastStreakDate: new Date() },
  });

  return { message: 'Streak marked as seen for today' };
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

async getUserMiniProfile(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { userProfile: true },
  });

  if (!user || !user.userProfile) {
    throw new NotFoundException('User or user profile not found');
  }

  const profile = user.userProfile;

  return {
    id: user.id,
    fullName: profile.fullName || 'Anonymous User',
    photo: profile.photos?.length > 0
      ? profile.photos[0]
      : 'https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=1024x1024&w=is&k=20&c=oGqYHhfkz_ifeE6-dID6aM7bLz38C6vQTy1YcbgZfx8=', // <-- update to your default avatar CDN or asset
  };
}


async findUserById(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    include: { userProfile: true },
  });
}


}