import { Router } from "express";
import { authRole, authToken } from "../middleware/authMiddleware";
import { getAllProduk, createProduk, updateProduk, deleteProduk } from "../controllers/produkController";
import { upload } from "../utils/uploadFIe";
const router = Router();

router.use(authToken);
router.get("/", authRole(["ADMIN", "KASIR"]) , getAllProduk);
router.post("/", authRole(["ADMIN"]),upload.single('gambar') ,createProduk);
router.put("/:id", authRole(["ADMIN"]),upload.single('gambar'), updateProduk);
router.delete("/:id", authRole(["ADMIN"]), deleteProduk);

export default router;