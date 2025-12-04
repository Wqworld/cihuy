import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req: Request, res: Response) => {
    try {
        const { nama, username, password, role } = req.body;
        //logika registrasi
        if (!nama || !username || !password || !role) {
            return res.status(400).json({ message: "Semua fields wajib diisi!" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const response = await prisma.user.create({
            data: {
                nama,
                username,
                password : hashedPassword,
                role
            }
        })

        return res.status(201).json({ message: "User berhasil didaftarkan!", data: response });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
}

export const login = async (req: Request, res: Response) => {
    //logika login
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Semua fields wajib diisi!" });
    }
    try {
        const user = await prisma.user.findFirst({
            where: { username }
        });
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan!" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Password salah!" });
        }
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, nama: user.nama },
            process.env.SECRET_KEY as string,
            { expiresIn: "3h" }
        );
        return res.status(200).json({ message: "Login berhasil!", data: token });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error });
    }
}