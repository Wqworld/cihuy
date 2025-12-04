/*
  Warnings:

  - You are about to drop the column `BarangId` on the `detailtransaksi` table. All the data in the column will be lost.
  - Added the required column `ProdukId` to the `DetailTransaksi` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `detailtransaksi` DROP FOREIGN KEY `DetailTransaksi_BarangId_fkey`;

-- DropIndex
DROP INDEX `DetailTransaksi_BarangId_fkey` ON `detailtransaksi`;

-- AlterTable
ALTER TABLE `detailtransaksi` DROP COLUMN `BarangId`,
    ADD COLUMN `ProdukId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `DetailTransaksi` ADD CONSTRAINT `DetailTransaksi_ProdukId_fkey` FOREIGN KEY (`ProdukId`) REFERENCES `Produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
