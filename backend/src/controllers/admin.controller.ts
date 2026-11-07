import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import bcrypt from "bcryptjs";
import { z } from "zod";

// GET /api/admin/metrics
export const getAdminMetrics = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalStores, totalRatings, averageRating] =
      await Promise.all([
        prisma.user.count(),
        prisma.store.count(),
        prisma.rating.count(),
        prisma.rating.aggregate({
          _avg: {
            rating: true,
          },
        }),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStores,
        totalRatings,
        averageRating: Number((averageRating._avg.rating ?? 0).toFixed(1)),
      },
    });
  } catch (error) {
    console.error("Admin metrics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch admin metrics",
    });
  }
};

// GET /api/admin/users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || "").trim();
    const role = String(req.query.role || "").trim();

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (["ADMIN", "USER", "STORE_OWNER"].includes(role)) {
      where.role = role;
    }

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch users",
    });
  }
};
// POST /api/admin/users
export const createUser = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(20).max(60),
      email: z.string().email(),
      password: z
        .string()
        .min(8)
        .max(16)
        .regex(/[A-Z]/, "Password must contain an uppercase letter")
        .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
      address: z.string().min(1).max(400),
      role: z.enum(["USER", "STORE_OWNER"]),
    });

    const validation = schema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid user details",
        errors: validation.error.flatten(),
      });
    }

    const { name, email, password, address, role } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Create user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create user",
    });
  }
};

// POST /api/admin/stores
export const createStore = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1).max(100),
      email: z.string().email(),
      address: z.string().min(1).max(400),
      ownerId: z.string().uuid(),
    });

    const validation = schema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid store details",
        errors: validation.error.flatten(),
      });
    }

    const { name, email, address, ownerId } = validation.data;

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        role: true,
        store: { select: { id: true } },
      },
    });

    if (!owner || owner.role !== "STORE_OWNER") {
      return res.status(400).json({
        success: false,
        message: "A valid STORE_OWNER account is required",
      });
    }

    if (owner.store) {
      return res.status(409).json({
        success: false,
        message: "This owner already has a store",
      });
    }

    const existingStore = await prisma.store.findUnique({
      where: { email },
    });

    if (existingStore) {
      return res.status(409).json({
        success: false,
        message: "Store email already exists",
      });
    }

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: store,
    });
  } catch (error) {
    console.error("Create store error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create store",
    });
  }
};

export const getAllStores = async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || "").trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { address: { contains: search } },
          ],
        }
      : {};

    const [stores, totalStores] = await Promise.all([
      prisma.store.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          ratings: {
            select: { rating: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.store.count({ where }),
    ]);

    const data = stores.map((store) => {
      const totalRatings = store.ratings.length;
      const averageRating = totalRatings
        ? store.ratings.reduce((sum, item) => sum + item.rating, 0) /
          totalRatings
        : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner,
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
    console.error("Get admin stores error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch stores",
    });
  }
};
