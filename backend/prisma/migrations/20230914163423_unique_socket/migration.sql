/*
  Warnings:

  - A unique constraint covering the columns `[socket]` on the table `PlayersInLine` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PlayersInLine_socket_key" ON "PlayersInLine"("socket");
