import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getAllProduk = async (req: Request, res: Response) => {
    try {
        const response = await prisma.produk.findMany({
            include: {
                kategori: true
            }
        });
        return res.status(200).json({ message: "Berhasil mengambil data produk", data: response })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};

export const createProduk = async (req: Request, res: Response) => {

    const { nama, harga, stok, kategoriId } = req.body;
    const gambar = req.file ? req.file.filename : "default.png"
    if (!nama || !harga || !stok || !kategoriId) {
        return res.status(403).json({ message: "Semua fields harus diisi!" })
    }

    try {
        const response = await prisma.produk.create({
            data: {
                nama,
                harga: Number(harga),
                stok: Number(stok),
                kategoriId: Number(kategoriId),
                gambar: gambar
            }
        })
        return res.status(200).json({ message: "Berhasil mengambil data produk", data: response })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};

export const updateProduk = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        return res.status(403).json({ message: "masukan id untuk " })
    }
    const { nama, harga, stok, kategoriId } = req.body; 
    const oldData = await prisma.produk.findUnique({ where: { id: Number(id) } });
    const gambar = req.file ? req.file.filename : oldData?.gambar;
    if (!nama || !harga || !stok || !kategoriId) {
        return res.status(403).json({ message: "Semua fields harus diisi!" })
    }
    try {
        const response = await prisma.produk.update({
            where: {
                id: Number(id)
            },
            data: {
                nama,
                harga: Number(harga),
                stok: Number(stok),
                kategoriId: Number(kategoriId),
                gambar: gambar

            }
        })
        return res.status(200).json({ message: "Berhasil update data produk", data: response })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
}

export const deleteProduk = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        return res.status(403).json({ message: "masukan id untuk menghapus" })
    }
    const produk = await prisma.produk.findUnique({
        where: {
            id: Number(id)
        }
    })
    if (!produk) {
        return res.status(404).json({ message: "produk dengan id tersebut tidak ditemukan" })
    }
    try {
        const response = await prisma.produk.delete({
            where: {
                id: Number(id)
            }
        })
        return res.status(200).json({ message: "Berhasil delete data produk", data: response })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};