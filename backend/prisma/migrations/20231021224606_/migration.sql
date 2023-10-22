-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "senderID" INTEGER NOT NULL DEFAULT 0,
    "challengedID" INTEGER NOT NULL DEFAULT 0,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "gameID" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_userNotification" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_userNotification_AB_unique" ON "_userNotification"("A", "B");

-- CreateIndex
CREATE INDEX "_userNotification_B_index" ON "_userNotification"("B");

-- AddForeignKey
ALTER TABLE "_userNotification" ADD CONSTRAINT "_userNotification_A_fkey" FOREIGN KEY ("A") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userNotification" ADD CONSTRAINT "_userNotification_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
