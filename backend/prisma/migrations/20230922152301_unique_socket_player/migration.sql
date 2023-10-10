/*
  Warnings:

  - A unique constraint covering the columns `[socket]` on the table `Player` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Player_socket_key" ON "Player"("socket");
