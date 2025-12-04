import { Router } from "express";
import { authRole, authToken } from "../middleware/authMiddleware";
import { getAllMember, createMember, updateMember, deleteMember } from "../controllers/memberController";

const router = Router();

router.use(authToken);
router.get("/", authRole(["ADMIN","KASIR"]),getAllMember)
router.post("/", authRole(["ADMIN","KASIR"]),createMember)
router.put("/:id", authRole(["ADMIN","KASIR"]),updateMember)
router.delete("/:id", authRole(["ADMIN"]),deleteMember)

export default router;