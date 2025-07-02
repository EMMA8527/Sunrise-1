/* eslint-disable prettier/prettier */
// src/common/utils/serialize-user.ts

export function serializeUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    country: user.country,
    role: user.role,
    isVerified: user.isVerified,
    isPhoneVerified: user.isPhoneVerified,
    isFaceVerified: user.isFaceVerified,
    firebaseToken: user.firebaseToken ?? null,
    streakCount: user.streakCount,
    premiumSince: user.premiumSince,
    premiumExpires: user.premiumExpires,
    isPremium: user.isPremium,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: {
      fullName: user.userProfile?.fullName ?? null,
      profileCompletionStep: user.userProfile?.profileCompletionStep ?? 0,
      photos: user.userProfile?.photos ?? [],
      intentions: user.userProfile?.intentions ?? [],
      gender: user.userProfile?.gender ?? null,
      birthday: user.userProfile?.birthday ?? null,
      preference: user.userProfile?.preference ?? null,
      latitude: user.userProfile?.latitude ?? null,
      longitude: user.userProfile?.longitude ?? null,
    },
  };
}
