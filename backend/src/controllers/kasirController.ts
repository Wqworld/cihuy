import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getAllKasir = async (req: Request, res: Response) => {
    try {
        const response = await prisma.user.findMany({
            where: {
                role: "KASIR"
            }
        });
        return res.status(200).json({ message: "Berhasil mengambil data member" , data: response})
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};

export const createKasir = async (req: Request, res: Response) => {
    const {nama, username, password} = req.body;
    if (!nama || !username || !password) {
        return res.status(403).json({ message: "Semua fields harus diisi!"})
    }
    const user = await prisma.user.findFirst({
        where:{
            nama
        }
    })
    if (user) {
        return res.status(403).json({ message: "No telepon sudah ada"})
    }
    try {
        const response = await prisma.user.create({
            data:{
                nama,
                username,
                password,
                role : "KASIR"
            }
        })
        return res.status(200).json({ message: "Berhasil mengambil data kasir" , data: response})
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};

export const updateKasir = async(req: Request, res: Response) => {
    const {id} = req.params;
    if (!id) {
        return res.status(403).json({ message: "masukan id untuk update"})
    }
    const {nama, username, password, role} = req.body;
    if (!nama || !username || !password) {
        return res.status(403).json({ message: "Semua fields harus diisi!"})
    }

    try {
        const response = await prisma.user.update({
            where: {
                id: Number(id)
            },
            data: {
                nama,
                username,
                password,
                role
            }
        })
        return res.status(200).json({ message: "Berhasil mengambil data kasir" , data: response})
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
}

export const deleteKasir = async(req: Request, res: Response) => {
    const {id} = req.params;
    if (!id) {
        return res.status(403).json({ message: "masukan id untuk menghapus"})
    }
    const kasir = await prisma.user.findUnique({
        where: {
            id: Number(id)
        }
    })
    if (kasir?.role === "ADMIN") {
        return res.status(403).json({message: "Tidak Diperbolehkan untuk menghapus admin"})
    }
    try {
        const response = await prisma.user.delete({
            where: {
                id : Number(id)
            }
        })
        return res.status(200).json({ message: "Berhasil mengambil data member" , data: response})
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};