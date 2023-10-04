/*
  Warnings:

  - The primary key for the `PlayersInLine` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `socket` on the `PlayersInLine` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlayersInLine" DROP CONSTRAINT "PlayersInLine_pkey",
DROP COLUMN "socket",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PlayersInLine_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PlayersInLine_id_seq";
