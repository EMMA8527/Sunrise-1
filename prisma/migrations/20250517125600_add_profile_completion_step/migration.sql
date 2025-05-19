/*
  Warnings:

  - You are about to drop the column `compatibilityScore` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "compatibilityScore",
DROP COLUMN "password",
ADD COLUMN     "profileCompletionStep" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "showMe" TEXT,
ALTER COLUMN "fullName" DROP NOT NULL,
ALTER COLUMN "intentions" DROP NOT NULL,
ALTER COLUMN "intentions" SET DATA TYPE TEXT,
ALTER COLUMN "birthday" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "photos" SET DEFAULT ARRAY[]::TEXT[];
