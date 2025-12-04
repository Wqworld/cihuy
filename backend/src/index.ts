import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import diskonRoutes from './routes/diskonRoutes';
import kategoriRoutes from "./routes/kategoriRoutes"
import memberRoutes from "./routes/memberRoutes"
import kasirRoutes from "./routes/kasirRoutes"
import produkRoutes from "./routes/produkRoutes";
import transaksiRoutes from "./routes/transaksiRoutes";
import laporanRoutes from "./routes/laporanRoutes";

const app: Express = express();
dotenv.config();

app.use(cors());
app.use(express.json());

const uploadDir = path.join( process.cwd(), "public", "upload");
app.use("/api/upload", express.static(uploadDir));
app.use("/api/auth", authRoutes);
app.use("/api/diskon", diskonRoutes);
app.use("/api/kategori", kategoriRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/kasir", kasirRoutes);
app.use("/api/produk", produkRoutes);
app.use("/api/transaksi", transaksiRoutes);
app.use("/api/laporan", laporanRoutes);


app.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port http://localhost:${process.env.PORT}`);
})