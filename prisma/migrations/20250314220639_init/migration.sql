/*
  Warnings:

  - Added the required column `category` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "comment" DROP NOT NULL;
