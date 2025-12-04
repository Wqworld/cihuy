import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';


//cek apakah token ada atau tidak
export const authToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Akses ditolak! Token tidak ditemukan." });  
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token tidak valid!" });
    }
}

//cek role user
export const authRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user || !allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: "Akses ditolak! Anda tidak memiliki izin." });
        }
        next();        
    }
}