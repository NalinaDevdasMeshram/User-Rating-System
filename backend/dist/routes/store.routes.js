import { Router } from "express";
import { getStores } from "../controllers/store.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = Router();
router.get("/", protect, getStores);
export default router;
