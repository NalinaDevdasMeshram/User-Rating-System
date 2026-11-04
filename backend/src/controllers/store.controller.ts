import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

// GET /api/stores
export const getStores = async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || "").trim();
    const sortBy = String(req.query.sortBy || "name");
    const order = req.query.order === "desc" ? "desc" : "asc";
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { address: { contains: search } },
          ],
        }
      : {};

    const [stores, totalStores] = await Promise.all([
      prisma.store.findMany({
        where,
        include: {
          ratings: {
            select: {
              rating: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy === "name" ? "name" : "createdAt"]: order,
        },
      }),
      prisma.store.count({ where }),
    ]);

    const data = stores.map((store) => {
      const totalRatings = store.ratings.length;

      const averageRating =
        totalRatings === 0
          ? 0
          : store.ratings.reduce((sum, item) => sum + item.rating, 0) /
            totalRatings;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: Number(averageRating.toFixed(1)),
        totalRatings,
      };
    });

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        totalStores,
        currentPage: page,
        totalPages: Math.ceil(totalStores / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("Get stores error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch stores",
    });
  }
};
