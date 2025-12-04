import { Router } from "express";
import { authRole, authToken } from "../middleware/authMiddleware";
import { getAllDiskon, createDiskon, updateDiskon, deleteDiskon } from "../controllers/diskonController";
const router = Router();

router.use(authToken);
router.get("/", authRole(["ADMIN", "KASIR"]), getAllDiskon )
router.post("/", authRole(["ADMIN"]), createDiskon )
router.put("/:id", authRole(["ADMIN"]), updateDiskon )
router.delete("/:id", authRole(["ADMIN"]), deleteDiskon )

export default router;