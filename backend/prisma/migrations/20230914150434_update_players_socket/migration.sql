/*
  Warnings:

  - The primary key for the `PlayersInLine` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `PlayersInLine` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PlayersInLine" DROP CONSTRAINT "PlayersInLine_pkey",
ADD COLUMN     "socket" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "PlayersInLine_pkey" PRIMARY KEY ("id");
