/*
  Warnings:

  - You are about to drop the column `jumlah` on the `detailtransaksi` table. All the data in the column will be lost.
  - Added the required column `qty` to the `DetailTransaksi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `detailtransaksi` DROP COLUMN `jumlah`,
    ADD COLUMN `qty` INTEGER NOT NULL;
