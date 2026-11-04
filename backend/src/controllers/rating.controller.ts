import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

// POST /api/ratings
export const submitRating = async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      storeId: z.string().uuid(),
      rating: z.number().int().min(1).max(5),
    });

    const validation = schema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
        errors: validation.error.flatten(),
      });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { storeId, rating } = validation.data;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const savedRating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      update: {
        rating,
      },
      create: {
        userId,
        storeId,
        rating,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      data: savedRating,
    });
  } catch (error) {
    console.error("Submit rating error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit rating",
    });
  }
};
