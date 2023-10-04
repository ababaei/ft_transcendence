-- CreateTable
CREATE TABLE "PlayersInLine" (
    "id" SERIAL NOT NULL,
    "socket" TEXT NOT NULL,

    CONSTRAINT "PlayersInLine_pkey" PRIMARY KEY ("id")
);
