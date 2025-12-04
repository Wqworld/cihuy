import { Router } from "express";
import { 
  getLaporanPenjualan, 
  getLaporanStok, 
  getDashboardAdmin 
} from "../controllers/laporanController";
import { authRole, authToken } from "../middleware/authMiddleware";

const router = Router();
router.use(authToken);

router.get("/penjualan", authRole(["ADMIN", "KASIR"]), getLaporanPenjualan);

router.get("/stok", authRole(["ADMIN", "KASIR"]), getLaporanStok);

router.get("/dashboard-admin", authRole(["ADMIN"]), getDashboardAdmin);

export default router;