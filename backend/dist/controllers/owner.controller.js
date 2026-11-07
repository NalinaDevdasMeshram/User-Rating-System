import { prisma } from "../config/prisma.js";
// GET /api/owner/dashboard
export const getOwnerDashboard = async (req, res) => {
    try {
        const ownerId = req.user?.id;
        if (!ownerId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const store = await prisma.store.findUnique({
            where: {
                ownerId,
            },
            include: {
                ratings: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });
        if (!store) {
            return res.status(404).json({
                success: false,
                message: "No store is assigned to this owner",
            });
        }
        const totalRatings = store.ratings.length;
        const averageRating = totalRatings === 0
            ? 0
            : store.ratings.reduce((sum, item) => sum + item.rating, 0) /
                totalRatings;
        const ratings = store.ratings.map((item) => ({
            id: item.id,
            rating: item.rating,
            createdAt: item.createdAt,
            customer: item.user,
        }));
        return res.status(200).json({
            success: true,
            data: {
                store: {
                    id: store.id,
                    name: store.name,
                    email: store.email,
                    address: store.address,
                },
                averageRating: Number(averageRating.toFixed(1)),
                totalRatings,
                ratings,
            },
        });
    }
    catch (error) {
        console.error("Owner dashboard error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch owner dashboard",
        });
    }
};
