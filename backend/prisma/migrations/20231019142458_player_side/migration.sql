/*
  Warnings:

  - Added the required column `side` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "side" TEXT NOT NULL;
