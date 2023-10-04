/*
  Warnings:

  - You are about to drop the `Games` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlayersInLine` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Games";

-- DropTable
DROP TABLE "PlayersInLine";

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "socket" TEXT,
    "gameID" INTEGER NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_socket_key" ON "Player"("socket");

-- CreateIndex
CREATE UNIQUE INDEX "Player_gameID_key" ON "Player"("gameID");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameID_fkey" FOREIGN KEY ("gameID") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
