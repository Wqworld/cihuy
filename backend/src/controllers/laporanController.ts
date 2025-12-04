import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getLaporanPenjualan = async (req: Request, res: Response) => {
  try {
    const { tgl_mulai, tgl_akhir } = req.query;

    const now = new Date();
    let startDate = new Date(now.setHours(0, 0, 0, 0));
    let endDate = new Date(now.setHours(23, 59, 59, 999));

    if (tgl_mulai && tgl_akhir) {
      startDate = new Date(`${tgl_mulai}T00:00:00.000Z`);
      endDate = new Date(`${tgl_akhir}T23:59:59.999Z`);
    }



    const transaksi = await prisma.transaksi.findMany({
      where: {
        tglTransaksi: { 
          gte: startDate,
          lte: endDate  
        }
      },
      include: {
        user: { select: { nama: true } },
        member: { select: { nama: true } },
      },
      orderBy: { tglTransaksi: 'desc' }
    });


    const totalOmset = transaksi.reduce((acc, curr) => acc + curr.total, 0);

    res.json({
      message: "Laporan Penjualan",
      periode: { start: startDate, end: endDate },
      ringkasan: {
        jumlah_transaksi: transaksi.length,
        total_omset: totalOmset
      },
      data: transaksi
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal ambil laporan penjualan" });
  }
};

export const getLaporanStok = async (req: Request, res: Response) => {
  try {
    const produk = await prisma.produk.findMany({
      include: {
        kategori: true
      },
      orderBy: {
        stok: 'asc'
      }
    });

    const formattedData = produk.map(p => ({
      id: p.id,
      nama_barang: p.nama,
      kategori: p.kategori?.nama || "Tanpa Kategori",
      harga: p.harga,
      stok_saat_ini: p.stok,
      status: p.stok < 5 ? "KRITIS" : "Aman"
    }));

    res.json({
      message: "Laporan Stok Barang",
      data: formattedData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal ambil laporan stok" });
  }
};

export const getDashboardAdmin = async (req: Request, res: Response) => {
  try {

    const totalTransaksi = await prisma.transaksi.count();

    const aggregatTransaksi = await prisma.transaksi.aggregate({
      _sum: {
        total: true
      }
    });

    const aggregatDetail = await prisma.detailTransaksi.aggregate({
      _sum: {
        subTotal: true
      }
    });

    const totalGross = aggregatDetail._sum?.subTotal || 0;
    const totalNet = aggregatTransaksi._sum?.total || 0;
    const totalDiskon = totalGross - totalNet;

    const bestSeller = await prisma.detailTransaksi.groupBy({
      by: ['ProdukId'],
      _sum: {
        subTotal: true
      },
      orderBy: {
        _sum: {
          subTotal: 'desc'
        }
      },
      take: 5
    });

    const topProducts = await Promise.all(bestSeller.map(async (item) => {
      const produk = await prisma.produk.findUnique({
        where: { id: item.ProdukId }
      });
      return {
        nama: produk?.nama || "Produk Dihapus",
        terjual: item._sum.subTotal
      };
    }));

    // C. Stok Menipis (Top 5)
    const lowStock = await prisma.produk.findMany({
      orderBy: { stok: 'asc' },
      take: 5,
      select: { nama: true, stok: true }
    });

    // --- KIRIM RESPONSE ---
    res.json({
      message: "Data Dashboard Admin",
      summary: {
        total_penjualan: totalTransaksi,
        total_omset: totalNet,
        total_diskon: totalDiskon,
      },
      analysis: {
        produk_terlaris: topProducts,
        stok_menipis: lowStock
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal ambil data dashboard", error });
  }
};