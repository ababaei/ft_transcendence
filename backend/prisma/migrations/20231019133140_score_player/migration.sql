/*
  Warnings:

  - You are about to drop the column `scoreLeft` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `scoreRight` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `side` on the `Player` table. All the data in the column will be lost.
  - Added the required column `score` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "scoreLeft",
DROP COLUMN "scoreRight";

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "side",
ADD COLUMN     "score" INTEGER NOT NULL;
