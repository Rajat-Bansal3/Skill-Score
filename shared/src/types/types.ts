import { Document } from "mongoose";
import z from "zod";
import sanitizeHTML from "sanitize-html";

const difficultySchema = z.enum(["easy", "medium", "hard", "extream"]);

export type Difficulty = z.infer<typeof difficultySchema>;
export const usernameRegex = /^[a-zA-Z0-9_]+$/;
export const phoneRegex = /^[1-9]\d{9}$/;
export const emailRegex = /.+\@.+\..+/;
export const profileImageRegex =
  /^(http[s]?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|svg))$/;
export const RoomValidationSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Tournament name must be at least 3 characters long" })
      .max(50, {
        message: "Tournament name must be at most 50 characters long",
      })
      .regex(/^[A-Za-z0-9_ ]+$/, {
        message:
          "Tournament name can only contain letters, numbers, spaces, and underscores",
      })
      .trim(),
    state: z.enum(["ACTIVE", "WAITING", "FINISHED", "UPCOMING"]),
    maxMembers: z
      .number()
      .min(1, { message: "Tournament must have at least one participant" })
      .max(1000, {
        message: "Tournament cannot have more than 1000 participants",
      })
      .default(100),
    difficulty: difficultySchema.default("easy"),
    gameType: z
      .enum(["Blitz", "Bullet", "Rapid"], {
        errorMap: () => ({
          message:
            "Invalid game type. Allowed values are Blitz, Bullet, and Rapid",
        }),
      })
      .default("Rapid"),
    entryFee: z
      .number()
      .min(0, { message: "Entry fee cannot be negative" })
      .default(0),
    rules: z
      .string()
      .max(1000, { message: "Rules cannot exceed 1000 characters" })
      .default(""),
    scoringSystem: z
      .enum(["points", "time", "kills"], {
        errorMap: () => ({
          message:
            "Invalid scoring system. Allowed values are points, time, and kills",
        }),
      })
      .default("points"),
    startTime: z.date().refine((date: Date) => date > new Date(), {
      message: "Start time must be in the future",
    }),

    endTime: z.date(),
    owner: z
      .string()
      .regex(/^[a-f\d]{24}$/i, { message: "Invalid user ID for owner" }),
    maxWinning: z
      .number()
      .min(0, { message: "Max winning must be at least 0" })
      .default(0),
    minWinning: z
      .number()
      .min(0, { message: "Min winning must be at least 0" }),
    priority: z
      .number()
      .min(0, { message: "Priority must be a non-negative number" })
      .default(0),
    isFeatured: z.boolean().default(false),

    // Optional fields
    currentUsers: z
      .array(
        z.string().regex(/^[a-f\d]{24}$/i, {
          message: "Invalid user ID in currentUsers",
        })
      )
      .default([]),
    expiresAt: z
      .date()
      .refine((date) => date > new Date(), {
        message: "Expiration date must be in the future",
      })
      .optional(),
    winner: z
      .string()
      .regex(/^[a-f\d]{24}$/i, { message: "Invalid user ID for winner" })
      .optional(),
    sponsors: z
      .array(
        z.object({
          name: z
            .string()
            .min(3, {
              message: "Sponsor name must be at least 3 characters long",
            })
            .max(50, {
              message: "Sponsor name must be at most 50 characters long",
            }),
          logo: z
            .string()
            .regex(/^https?:\/\/.+\.(jpg|jpeg|png|svg|webp)$/, {
              message: "Sponsor logo must be a valid image URL",
            })
            .optional(),
          website: z
            .string()
            .regex(/^https?:\/\/.+$/, {
              message: "Sponsor website must be a valid URL",
            })
            .optional(),
        })
      )
      .default([]),
  })
  .superRefine((data, ctx) => {
    const { startTime, endTime, maxWinning, minWinning } = data;
    if (startTime > endTime) {
      ctx.addIssue({
        path: ["endTime"],
        message: "End time must be after the start time",
        code: "invalid_date",
      });
    }
    if (maxWinning > minWinning) {
      ctx.addIssue({
        path: ["maxWinning"],
        message: "maxWinning Can't be greater than minWinning",
        code: "custom",
      });
    }
  });

export const UserValidationSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" })
      .max(64, { message: "Username must not exceed 64 characters" })
      .regex(/^[A-Za-z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores",
      })
      .trim(),

    email: z.string().email({ message: "Invalid email address format" }),
    state: z.enum(["ONLINE", "OFFLINE", "INGAME"]),
    tournament: z
      .string()
      .min(1, { message: "Tournament name cannot be empty" })
      .optional(),

    passwordHash: z
      .string()
      .min(1, { message: "Password hash cannot be empty" }),

    phone: z
      .string()
      .regex(/^[1-9][0-9]{9}$/, {
        message: "Phone number must have 10 digits and not start with zero",
      })
      .optional(),

    isEmailVerified: z.boolean().default(false),

    isPhoneVerified: z.boolean().default(false),

    roles: z
      .array(z.string())
      .nonempty({ message: "Roles must contain at least one role" })
      .default(["user"]),

    lastLogin: z.date().optional(),

    createdAt: z.date().default(() => new Date()),

    updatedAt: z.date().optional(),

    profileImage: z
      .string()
      .regex(/^https?:\/\/.+\.(jpg|jpeg|png|svg|webp)$/, {
        message: "Invalid profile image URL",
      })
      .optional(),

    status: z
      .enum(["active", "banned", "suspended"], {
        errorMap: () => ({
          message:
            "Invalid status. Allowed values are active, banned, or suspended",
        }),
      })
      .default("active"),

    verificationCode: z.string().optional(),

    verificationCodeExpiry: z
      .date()
      .refine((date) => date > new Date(), {
        message: "Verification code expiry must be a valid future date",
      })
      .optional(),

    otp: z
      .number()
      .int()
      .positive({ message: "OTP must be a valid number greater than 0" })
      .optional(),

    otpExpiry: z
      .date()
      .refine((date) => date > new Date(), {
        message: "OTP expiry must be a valid future date",
      })
      .optional(),
  })
  .strict();

export type IUser = z.infer<typeof UserValidationSchema>;
export type IRoom = z.infer<typeof RoomValidationSchema>;
