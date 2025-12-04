import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const createTransaksi = async (req: Request, res: Response) => {
  try {
    const { items, memberId, diskonId, bayar, kasirId } = req.body;

    if (!items || items.length === 0) {
      return res.status(403).json({
        message: "Gagal transaksi karena produk kosong"
      });
    }

    const detailData: {
      produkId: number;
      qty: number;
      harga: number;
      subTotal: number;
    }[] = [];

    // Validasi stok dan hitung subtotal
    const produkPromises = items.map(async (item: { id: number; quantity: number }) => {

      const produk = await prisma.produk.findFirst({
        where: { id: item.id }
      });

      if (!produk) {
        throw new Error("Produk tidak ditemukan");
      }

      if (produk.stok < item.quantity) {
        throw new Error(`Stok habis untuk produk ${produk.nama}`);
      }

      const subTotal = produk.harga * item.quantity;

      detailData.push({
        produkId: produk.id,
        harga: produk.harga,
        qty: item.quantity,
        subTotal: subTotal
      });
    });

    await Promise.all(produkPromises);

    // Hitung total harga awal
    let totalHarga = detailData.reduce((sum, item) => sum + item.subTotal, 0);
    let totalHargaAkhir = totalHarga;

    // Member discount 5%
    if (memberId) {
      const member = await prisma.member.findFirst({
        where: { id: Number(memberId) }
      });

      if (member) {
        const memberDiscount = totalHarga * 0.05;
        totalHargaAkhir -= memberDiscount;
      }
    }

    // Diskon voucher
    if (diskonId) {
      const diskon = await prisma.diskon.findFirst({
        where: { id: Number(diskonId) }
      });

      if (diskon && totalHarga >= diskon.min_transaksi) {
        const diskonAmount = totalHargaAkhir * (diskon.persen / 100);
        totalHargaAkhir -= diskonAmount;
      }
    }

    const kembalian = bayar - totalHargaAkhir;
    if (kembalian < 0) {
      return res.status(403).json({
        message: "Uang bayar tidak mencukupi"
      });
    }

    // Simpan transaksi
    await prisma.$transaction(async (tx) => {

      const transaksi = await tx.transaksi.create({
        data: {
          KasirId: Number(kasirId),
          MemberId: memberId ? Number(memberId) : null,
          DiskonId: diskonId ? Number(diskonId) : null,
          total: totalHargaAkhir,
          bayar: Number(bayar),
          kembali: kembalian,
          tglTransaksi: new Date()
        }
      });

      // detail transaksi
      await tx.detailTransaksi.createMany({
        data: detailData.map((item) => ({
          TransaksiId: transaksi.id,
          ProdukId: item.produkId,
          qty: item.qty,
          subTotal: item.subTotal
        }))
      });

      // update stok produk
      const updateStockPromises = items.map((item: { id: number; quantity: number }) =>
        tx.produk.update({
          where: { id: item.id },
          data: { stok: { decrement: item.quantity } }
        })
      );

      await Promise.all(updateStockPromises);

      res.status(201).json({
        message: "Transaksi Berhasil",
        data: transaksi
      });
    });

  } catch (error) {
    console.error("Error transaksi:", error);
    return res.status(500).json({
      message: "Transaksi Gagal dilakukan",
      error: error instanceof Error ? error.message : error
    });
  }
};

// Ambil seluruh transaksi
export const getAllTransaksi = async (_req: Request, res: Response) => {
  try {
    const response = await prisma.transaksi.findMany({
      include: {
        user: { select: { nama: true } },
        diskon: { select: { nama: true, persen: true } },
        member: { select: { nama: true, noTelepon: true } },
        detailTransaksi: true
      }
    });

    return res.status(200).json({
      message: "Berhasil menampilkan transaksi",
      data: response
    });

  } catch (error) {
    return res.status(500).json({
      message: "Gagal Mengambil Data transaksi",
      error
    });
  }
};
