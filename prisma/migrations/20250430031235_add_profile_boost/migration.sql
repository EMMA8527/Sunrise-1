-- CreateTable
CREATE TABLE "ProfileBoost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "ProfileBoost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProfileBoost" ADD CONSTRAINT "ProfileBoost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
