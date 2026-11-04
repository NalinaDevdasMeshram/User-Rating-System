import { Router } from "express";
import { submitRating } from "../controllers/rating.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", protect, submitRating);

export default router;
