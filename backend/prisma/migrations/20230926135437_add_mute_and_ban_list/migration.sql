-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "banID" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "muteID" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
