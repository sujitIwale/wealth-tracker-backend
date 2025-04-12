-- AlterTable
ALTER TABLE "ImportedTransaction" ALTER COLUMN "category" SET DEFAULT 'other';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "addedTransaction" BOOLEAN NOT NULL DEFAULT false;
