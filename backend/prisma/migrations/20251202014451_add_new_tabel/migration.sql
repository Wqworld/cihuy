/*
  Warnings:

  - You are about to alter the column `status` on the `diskon` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `diskon` MODIFY `status` ENUM('AKTIF', 'NONAKTIF') NOT NULL DEFAULT 'AKTIF';
