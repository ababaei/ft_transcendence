-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_gameID_fkey";

-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "gameID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameID_fkey" FOREIGN KEY ("gameID") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
