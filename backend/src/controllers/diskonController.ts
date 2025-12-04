import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { error } from "console";

export const getAllDiskon = async (req: Request, res: Response) => {
    try {
        const response = await prisma.diskon.findMany();
        return res.status(200).json({ message: "Berhasil mendapatkan data diskon", data: response });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};

export const createDiskon = async (req: Request, res: Response) => {
    const {nama, persen, status, min_transaksi, tanggal_mulai, tanggal_akhir} = req.body;
    if (!nama || !persen || !status || !min_transaksi) {
        return res.status(400).json({ message: "Semua fields wajib diisi!" });
    }
    try {
        const response = await prisma.diskon.create({
            data: {
                nama,
                persen,
                status,
                min_transaksi,
                tanggal_mulai: new Date(),
                tanggal_akhir: new Date()
            }
        })
        return res.status(201).json({ message: "Diskon berhasil dibuat!", data: response });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};

export const updateDiskon = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {nama, persen, status, min_transaksi, tanggal_mulai, tanggal_akhir} = req.body;
    if (!nama || !persen || !status || !min_transaksi) {
        return res.status(400).json({ message: "Semua fields wajib diisi!" });
    }
    const diskon = await prisma.diskon.findUnique({
        where: { id: Number(id) }
    });
    if (!diskon) {
        return res.status(404).json({ message: "Diskon tidak ditemukan!" });
    }
    try {
        const response = await prisma.diskon.update({
            where:{
                id : Number(id)
            },
            data: {
                nama,
                persen,
                status,
                min_transaksi,
                tanggal_mulai: new Date(),
                tanggal_akhir: new Date()
            }
        })
        return res.status(201).json({ message : "Berhasil menambahkan Data Diskon", data: response})
    } catch (error) { 
        return res.status(500).json({ message: "Internal server error", error });
    }
};

export const deleteDiskon = async (req: Request, res: Response) => {
    const {id} = req.params;
    if (!id) {
        return res.status(404).json({ message: "Id tidak ditemukan"});
    }
    try {
        const response = await prisma.diskon.delete({
            where: {
                id: Number(id)
            }
        })
        return res.status(201).json({ message : "Data diskon berhasil di hapus", error})
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
}