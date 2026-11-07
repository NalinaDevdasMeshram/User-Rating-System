import { z } from "zod";
export const registerSchema = z.object({
    name: z.string().min(20).max(60),
    email: z.string().email().toLowerCase(),
    password: z
        .string()
        .min(8)
        .max(16)
        .regex(/[A-Z]/, "Password must contain an uppercase letter")
        .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
    address: z.string().min(1).max(400),
});
export const loginSchema = z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1),
});
