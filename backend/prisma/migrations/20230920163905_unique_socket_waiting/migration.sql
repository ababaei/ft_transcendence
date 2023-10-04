/*
  Warnings:

  - A unique constraint covering the columns `[socket]` on the table `Waiting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Waiting_socket_key" ON "Waiting"("socket");
