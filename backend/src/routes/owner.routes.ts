import { Router } from "express";
import { getOwnerDashboard } from "../controllers/owner.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/dashboard", protect, authorize("STORE_OWNER"), getOwnerDashboard);

export default router;
