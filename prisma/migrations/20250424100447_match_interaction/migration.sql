-- CreateEnum
CREATE TYPE "MatchAction" AS ENUM ('LIKE', 'PASS');

-- CreateTable
CREATE TABLE "MatchInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "action" "MatchAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchInteraction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MatchInteraction" ADD CONSTRAINT "MatchInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchInteraction" ADD CONSTRAINT "MatchInteraction_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
