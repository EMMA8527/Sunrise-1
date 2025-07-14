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
import { calculateCompatibilityScore, calculateDistanceKm } from '../utils/compatibility.util';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcryptjs';
import * as dayjs from 'dayjs';
import { Gender } from '@prisma/client';
import { ParsedMatchFilters } from './dto/match-filters.dto';

function isValidQuizAnswers(value: any): value is Record<string, string[]> {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
}


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
  filters: ParsedMatchFilters,
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

  const candidates = await this.prisma.user.findMany({
    where: {
      id: { not: userId, notIn: excludedIds },
      status: 'ACTIVE',
      userProfile: { isNot: null },
    },
    include: { userProfile: true },
  });

  const safePage = Math.max(1, page || 1);
  const safeLimit = Math.min(Math.max(filters?.limit || 10, 1), 100);

  const matchedCandidates = candidates
  .filter(
    (user) =>
      isValidQuizAnswers(user.userProfile?.quizAnswers) &&
      isValidQuizAnswers(currentUser.userProfile?.quizAnswers),
  )
  .map((user) => {
  const profile = user.userProfile!;
  const score = calculateCompatibilityScore(
    currentUser.userProfile.quizAnswers as Record<string, string[]>,
    profile.quizAnswers as Record<string, string[]>,
  ) || 0;

  let distanceKm: number | null = null;

  if (
    currentUser.userProfile?.latitude != null &&
    currentUser.userProfile?.longitude != null &&
    profile.latitude != null &&
    profile.longitude != null
  ) {
    distanceKm = calculateDistanceKm(
      currentUser.userProfile.latitude,
      currentUser.userProfile.longitude,
      profile.latitude,
      profile.longitude,
    );
  }

  return {
    id: user.id,
    fullName: profile.fullName,
    photos: profile.photos,
    compatibilityScore: score,
    location: profile.location || null,
    distanceKm, // ✅ Add this
    bio,
  };
})

  .sort((a, b) => b.compatibilityScore - a.compatibilityScore);


  const paged = matchedCandidates.slice(
    (safePage - 1) * safeLimit,
    safePage * safeLimit,
  );

  // Default pagination logic
if (paged.length > 0) {
  return {
    page: safePage,
    total: matchedCandidates.length,
    data: paged,
    fallbackUsed: false,
  };
}

// Fallback logic
const fallbackCandidates = await this.prisma.user.findMany({
  where: {
    id: { not: userId, notIn: excludedIds },
    status: 'ACTIVE',
    userProfile: { isNot: null },
  },
  include: { userProfile: true },
});

const fallbackData = fallbackCandidates.map((user) => ({
  id: user.id,
  fullName: user.userProfile?.fullName,
  photos: user.userProfile?.photos || [],
  compatibilityScore: 0,
}));

return {
  page: safePage,
  total: fallbackData.length,
  data: fallbackData.slice((safePage - 1) * safeLimit, safePage * safeLimit),
  fallbackUsed: true,
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
    phone: user.phone,
    role: user.role,
    provider: user.provider,
    name: user.name,
    country: user.country,
    status: user.status,
    isVerified: user.isVerified,
    isPhoneVerified: user.isPhoneVerified,
    isFaceVerified: user.isFaceVerified,
    isPremium: user.isPremium,
    premiumSince: user.premiumSince,
    premiumExpires: user.premiumExpires,
    streakCount: user.streakCount,
    canShowStreak,
    firebaseToken: user.firebaseToken,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,

    profile: {
      fullName: user.userProfile?.fullName,
      intentions: user.userProfile?.intentions || [],
      birthday: user.userProfile?.birthday,
      gender: user.userProfile?.gender,
      preference: user.userProfile?.preference,
      photos: user.userProfile?.photos || [],
      profileCompletionStep: user.userProfile?.profileCompletionStep ?? 0,
      quizAnswers: user.userProfile?.quizAnswers,
      boostedAt: user.userProfile?.boostedAt,
      bio,
      location: {
        latitude: user.userProfile?.latitude,
        longitude: user.userProfile?.longitude,
      },
    },
  };
}

async markStreakAsSeen(userId: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new NotFoundException('User not found');

  const today = new Date().toDateString();
const lastSeen = user.lastStreakDate?.toDateString();

if (lastSeen && lastSeen === today) {
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

async getUserMiniProfile(userId: string, viewerId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { userProfile: true },
  });

  if (!user || !user.userProfile) {
    throw new NotFoundException('User or user profile not found');
  }

  const match = await this.prisma.matchInteraction.findFirst({
    where: {
      userId: viewerId,
      targetId: userId,
      isMatch: true,
    },
  });

  const profile = user.userProfile;

  return {
    id: user.id,
    fullName: profile.fullName || 'Anonymous User',
    photo: profile.photos?.[0] ||
      'https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=1024x1024&w=is&k=20&c=oGqYHhfkz_ifeE6-dID6aM7bLz38C6vQTy1YcbgZfx8=',
    isMatched: !!match,
    bio,
  };
}


async findUserById(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    include: { userProfile: true },
  });
}

async updateCoordinates(userId: string, lat: number, lng: number) {
  const profile = await this.prisma.userProfile.update({
    where: { userId },
    data: {
      latitude: lat,
      longitude: lng,
    },
  });

  return {
    message: 'Location updated',
    data: profile,
  };
}
async updateFirebaseToken(userId: string, token: string) {
  const updated = await this.prisma.user.update({
    where: { id: userId },
    data: { firebaseToken: token },
  });

  return {
    message: 'Token updated',
    data: updated,
  };
}

async searchUsers(
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
    throw new Error('User profile not found');
  }

  // ✅ Exclude users the current user has already interacted with (like or pass)
  const previousInteractions = await this.prisma.matchInteraction.findMany({
    where: { userId },
    select: { targetId: true },
  });
  const excludedIds = previousInteractions.map((i) => i.targetId);

  // ✅ Build raw candidate query
  const candidates = await this.prisma.user.findMany({
    where: {
      id: {
        not: userId,
        notIn: excludedIds,
      },
      status: 'ACTIVE',
      userProfile: {
        is: {
          gender: filters.gender ? (filters.gender as Gender) : undefined,
        },
      },
    },
    include: {
      userProfile: true,
    },
  });

  // ✅ Transform to match DTO with age, distance, score
  const result = candidates.map((user) => {
    const profile = user.userProfile!;
    const age = profile.birthday ? dayjs().diff(profile.birthday, 'year') : null;

    // Compatibility score
    let compatibilityScore = 0;

if (
  isValidQuizAnswers(currentUser.userProfile?.quizAnswers) &&
  isValidQuizAnswers(profile.quizAnswers)
) {
  compatibilityScore = calculateCompatibilityScore(
    currentUser.userProfile.quizAnswers as Record<string, string[]>,
    profile.quizAnswers as Record<string, string[]>,
  );
}


    // Distance (if coords available)
    let distanceKm: number | null = null;
    if (
      filters.lat &&
      filters.lng &&
      profile.latitude != null &&
      profile.longitude != null
    ) {
      distanceKm = calculateDistanceKm(
  filters.lat,
  filters.lng,
  profile.latitude,
  profile.longitude,
);

    }

    return {
      id: user.id,
      fullName: profile.fullName,
      photos: profile.photos,
      age,
      compatibilityScore,
      distanceKm,
    };
  });

  // ✅ Apply age & sorting filters
  const filtered = result
    .filter((u) => {
      if (filters.minAge && u.age && u.age < filters.minAge) return false;
      if (filters.maxAge && u.age && u.age > filters.maxAge) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'age-asc') return (a.age ?? 0) - (b.age ?? 0);
      if (filters.sortBy === 'age-desc') return (b.age ?? 0) - (a.age ?? 0);
      return b.compatibilityScore - a.compatibilityScore;
    });

  const total = filtered.length;

  // ✅ Paginate result
  const paged = filtered.slice((page - 1) * filters.limit, page * filters.limit);

  return {
    page,
    total,
    data: paged,
  };
}

async updateBio(userId: string, bio: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new NotFoundException('User not found');

  await this.prisma.userProfile.update({
    where: { userId },
    data: { bio },
  });

  return { message: 'Bio updated successfully' };
}

async setBio(userId: string, bio: string) {
  const userProfile = await this.prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!userProfile) {
    await this.prisma.userProfile.create({
      data: { userId, bio },
    });
  } else {
    await this.prisma.userProfile.update({
      where: { userId },
      data: { bio },
    });
  }

  return { message: 'Bio set successfully' };
}

// user.service.ts or profile.service.ts
async getUserBio(userId: string) {
  const userProfile = await this.prisma.userProfile.findUnique({
    where: { userId },
    select: {
      bio: true,
    },
  });

  if (!userProfile) throw new NotFoundException('User profile not found');

  return {
    bio: userProfile.bio || '',
  };
}


}