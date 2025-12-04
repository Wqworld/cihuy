import { Router } from "express";
import { authRole, authToken } from "../middleware/authMiddleware";
import { getAllKategori, createKategori, updateKategori, deleteKategori } from "../controllers/kategoriController";

const router = Router();

router.use(authToken);
router.get("/", authRole(["ADMIN", "KASIR"]), getAllKategori)
router.post("/", authRole(["ADMIN"]), createKategori)
router.put("/:id", authRole(["ADMIN"]), updateKategori)
router.delete("/:id", authRole(["ADMIN"]), deleteKategori)

export default router;