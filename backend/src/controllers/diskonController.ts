import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getAllDiskon = async (req: Request, res: Response) => {
    try {
        const response = await prisma.diskon.findMany();
        return res.status(200).json({ message: "Berhasil mendapatkan data diskon", data: response });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};

export const createDiskon = async (req: Request, res: Response) => {
    const {nama, persen, min_transaksi, tanggal_mulai, tanggal_akhir} = req.body;
    
    if (!nama || !persen || !min_transaksi || !tanggal_mulai || !tanggal_akhir) {
        return res.status(400).json({ message: "Semua fields wajib diisi!" });
    }

    try {
        const response = await prisma.diskon.create({
            data: {
                nama,
                persen: Number(persen),
                min_transaksi: Number(min_transaksi),
                tanggal_mulai: new Date(tanggal_mulai), 
                tanggal_akhir: new Date(tanggal_akhir),
                status: "AKTIF"
            }
        })
        return res.status(201).json({ message: "Diskon berhasil dibuat!", data: response });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};

export const updateDiskon = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {nama, persen, min_transaksi, tanggal_mulai, tanggal_akhir} = req.body;
    
    // Validasi sederhana
    if (!nama) return res.status(400).json({ message: "Nama wajib diisi" });

    try {
        const response = await prisma.diskon.update({
            where:{ id : Number(id) },
            data: {
                nama,
                persen: Number(persen),
                min_transaksi: Number(min_transaksi),
                tanggal_mulai: new Date(tanggal_mulai),
                tanggal_akhir: new Date(tanggal_akhir)
            }
        })
        return res.status(201).json({ message : "Berhasil update Data Diskon", data: response})
    } catch (error) { 
        return res.status(500).json({ message: "Internal server error", error });
    }
};

export const deleteDiskon = async (req: Request, res: Response) => {
    const {id} = req.params;
    try {
        await prisma.diskon.delete({ where: { id: Number(id) } });
        return res.status(200).json({ message : "Data diskon berhasil di hapus" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};