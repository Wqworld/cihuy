/*
  Warnings:

  - You are about to drop the column `diskon` on the `diskon` table. All the data in the column will be lost.
  - Added the required column `persen` to the `Diskon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `diskon` DROP COLUMN `diskon`,
    ADD COLUMN `persen` INTEGER NOT NULL;
