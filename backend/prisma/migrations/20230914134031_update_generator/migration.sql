/*
  Warnings:

  - Added the required column `pos` to the `PlayersInLine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlayersInLine" ADD COLUMN     "pos" INTEGER NOT NULL;
