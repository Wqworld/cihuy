import { Router } from "express";
import { authRole, authToken } from "../middleware/authMiddleware";
import { createTransaksi, getAllTransaksi } from "../controllers/transaksiController";

const router = Router();

router.use(authToken);
router.post("/", authRole(["ADMIN", "KASIR"]), createTransaksi);
router.get("/", authRole(["ADMIN", "KASIR"]), getAllTransaksi);

export default router;