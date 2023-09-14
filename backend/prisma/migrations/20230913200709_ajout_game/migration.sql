-- CreateTable
CREATE TABLE "Games" (
    "id" SERIAL NOT NULL,
    "Player1" TEXT NOT NULL,
    "Player2" TEXT NOT NULL,

    CONSTRAINT "Games_pkey" PRIMARY KEY ("id")
);
