import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
const createAdmin = async () => {
    try {
        const email = "admin@example.com";
        const password = "Admin@123";
        const name = "System Administrator";
        const address = "Pune Maharashtra";
        const existingAdmin = await prisma.user.findUnique({
            where: { email },
        });
        if (existingAdmin) {
            console.log("Admin account already exists");
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const admin = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                address,
                role: "ADMIN",
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
        console.log("Admin created successfully:", admin);
    }
    catch (error) {
        console.error("Admin creation failed:", error);
    }
    finally {
        await prisma.$disconnect();
    }
};
createAdmin();
