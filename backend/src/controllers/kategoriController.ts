import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { updateDiskon } from './diskonController';

export const getAllKategori = async (req: Request, res: Response) => {
    try {
        const response = await prisma.kategori.findMany();
        return res.status(200).json({ message: "Berhasil Mengambil data Kategori", data: response})
    } catch (error) {
        return res.status(500).json({message: "internal Server error", error})
    }
};

export const createKategori = async (req: Request, res: Response) => {
    const {nama} = req.body;
    if (!nama) {
        return res.status(404).json({ message : "Nama kategori harus diisi!"});
    }
    try {
        const response = await prisma.kategori.create({
            data: {
                nama
            }
        })
        return res.status(201).json({message: "Data Kategori Berhasil ditambahkan ", data: response});
    } catch (error) {
        return res.status(500).json({ message: "internal server error", error})
    }
};

export const updateKategori = async (req:Request, res: Response) => {
    const {id} = req.params;
    const {nama} = req.body;
        if (!nama) {
        return res.status(404).json({ message : "Nama kategori harus diisi!"});
    }
    try {
        const response = await prisma.kategori.update({
            where: {
                id: Number(id)
            },
            data: {
                nama
            }
        })

        return res.status(201).json({message: "data kategori berhasil di update"});
    } catch (error) {
        return res.status(500).json({ message : "internal server error", error })
    }
};

export const deleteKategori = async (req: Request, res: Response) => {
    const {id} = req.params;
    try {
        const response = await prisma.kategori.delete({
            where:{
                id: Number(id)
            }
        })
        return res.status(201).json({ message: "data kategori berhasil di hapus", data: response })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};