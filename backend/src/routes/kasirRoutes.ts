import { Router } from "express";
import { authRole, authToken } from "../middleware/authMiddleware";
import { getAllKasir, updateKasir, createKasir, deleteKasir} from "../controllers/kasirController";

const router = Router();

router.use(authToken);
router.get("/", authRole(["ADMIN", "KASIR"]), getAllKasir);
router.post("/", authRole(["ADMIN"]), createKasir );
router.put("/:id", authRole(["ADMIN"]), updateKasir);
router.delete("/:id", authRole(["ADMIN"]), deleteKasir);

export default router;