import { Router } from "express";
import { getAdminMetrics, getAllUsers, createUser, createStore, } from "../controllers/admin.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
const router = Router();
// Only ADMIN can access these routes
router.get("/metrics", protect, authorize("ADMIN"), getAdminMetrics);
router.get("/users", protect, authorize("ADMIN"), getAllUsers);
router.post("/users", protect, authorize("ADMIN"), createUser);
router.post("/stores", protect, authorize("ADMIN"), createStore);
export default router;
