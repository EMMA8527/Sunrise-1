/*
  Warnings:

  - You are about to drop the column `premiumExpires` on the `UserProfile` table. All the data in the column will be lost.
  - Added the required column `password` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastStreakDate" TIMESTAMP(3),
ADD COLUMN     "premiumExpires" TIMESTAMP(3),
ADD COLUMN     "streakCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "premiumExpires",
ADD COLUMN     "password" TEXT NOT NULL;
