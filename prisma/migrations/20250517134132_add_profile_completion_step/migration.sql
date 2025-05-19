/*
  Warnings:

  - You are about to drop the column `showMe` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "showMe",
ADD COLUMN     "preference" TEXT;
