/*
  Warnings:

  - You are about to drop the column `friendsID` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "friendsID";

-- CreateTable
CREATE TABLE "friendRelation" (
    "id" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "friendID" INTEGER NOT NULL,
    "convID" INTEGER NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "friendRelation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "friendRelation" ADD CONSTRAINT "friendRelation_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
