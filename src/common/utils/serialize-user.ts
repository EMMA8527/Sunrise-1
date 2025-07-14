/* eslint-disable prettier/prettier */
// src/common/utils/serialize-user.ts

export function serializeUser(user: any) {
  const lastStreakDate = user.lastStreakDate ? new Date(user.lastStreakDate) : null;
  const today = new Date();
  const diffInDays = lastStreakDate
    ? Math.floor((today.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const canShowStreak = diffInDays === 0; // 🔥 Only show if streak is for today

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
    canShowStreak, // ✅ now it works
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
      location: {
        latitude: user.userProfile?.latitude,
        longitude: user.userProfile?.longitude,
        bio,
      },
    },
  };
}
