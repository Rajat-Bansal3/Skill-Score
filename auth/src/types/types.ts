import { z } from "zod";

const UserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(64, "Username cannot exceed 64 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password hash is required"),
  phone: z
    .string()
    .regex(/^[1-9]\d{9}$/, "Invalid phone number format")
    .optional(),
  isEmailVerified: z.boolean().default(false),
  isPhoneVerified: z.boolean().default(false),
  roles: z.array(z.string()).default(["user"]),
  lastLogin: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
  profileImage: z.string().url("Invalid URL for profile image").optional(),
  status: z.enum(["active", "banned", "suspended"]).default("active"),
  verificationCode: z.string().optional(),
  verificationCodeExpiry: z
    .date()
    .default(() => new Date(Date.now() + 6 * 60 * 1000)),
});

type User = z.infer<typeof UserSchema>;
export { type User };
export default UserSchema;
