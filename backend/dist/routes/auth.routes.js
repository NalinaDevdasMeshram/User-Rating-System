import { Router } from "express";
import { register, login, changePassword, } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.patch("/change-password", protect, changePassword);
export default router;
