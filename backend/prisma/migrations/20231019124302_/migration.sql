/*
  Warnings:

  - Made the column `scoreLeft` on table `Game` required. This step will fail if there are existing NULL values in that column.
  - Made the column `scoreRight` on table `Game` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "scoreLeft" SET NOT NULL,
ALTER COLUMN "scoreRight" SET NOT NULL;
