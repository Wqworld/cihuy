import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getAllMember = async (req: Request, res: Response) => {
    try {
        const response = await prisma.member.findMany();
        return res.status(200).json({ message: "Berhasil mengambil data member" , data: response})
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};

export const createMember = async (req: Request, res: Response) => {
    const {nama, noTelepon} = req.body;
    if (!nama || !noTelepon) {
        return res.status(403).json({ message: "Semua fields harus diisi!"})
    }
    const member = await prisma.member.findFirst({
        where:{
            noTelepon
        }
    })
    if (member) {
        return res.status(403).json({ message: "No telepon sudah ada"})
    }
    try {
        const response = await prisma.member.create({
            data:{
                nama,
                noTelepon
            }
        })
        return res.status(200).json({ message: "Berhasil membuat data member" , data: response})
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};

export const updateMember = async(req: Request, res: Response) => {
    const {id} = req.params;
    if (!id) {
        return res.status(403).json({ message: "masukan id untuk update"})
    }
    const {nama, noTelepon} = req.body;
    if (!nama || !noTelepon) {
        return res.status(403).json({ message: "Semua fields harus diisi!"})
    }
    try {
        const response = await prisma.member.update({
            where: {
                id: Number(id)
            },
            data: {
                nama,
                noTelepon
            }
        })
        return res.status(200).json({ message: "Berhasil update data member" , data: response})
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
}

export const deleteMember = async(req: Request, res: Response) => {
    const {id} = req.params;
    if (!id) {
        return res.status(403).json({ message: "masukan id untuk menghapus"})
    }
    try {
        const response = await prisma.member.delete({
            where: {
                id : Number(id)
            }
        })
        return res.status(200).json({ message: "Berhasil hapus data member" , data: response})
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};