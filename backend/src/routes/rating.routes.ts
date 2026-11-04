import { Router } from "express";
import {
  submitRating,
  getMyRatings,
} from "../controllers/rating.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", protect, submitRating);

//Get ratings submitted by the logged-in user
router.get("/my-ratings", protect, getMyRatings);

export default router;
