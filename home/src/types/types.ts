import z from "zod";

export const RoomSchema = z.object({
  name: z
    .string()
    .min(3, "Room name must be at least 3 characters long")
    .max(30, "Room name must be at most 30 characters long")
    .regex(
      /^[A-Za-z0-9_ ]+$/,
      "Room name can only contain letters, numbers, and spaces"
    ),
  state: z.enum(["ACTIVE", "WAITING", "FINISHED", "UPCOMING"], {
    errorMap: () => ({
      message:
        "Invalid state. Allowed states are ACTIVE, WAITING, FINISHED, and UPCOMING",
    }),
  }),
  maxMembers: z
    .number()
    .min(1, "Room must have at least one member")
    .max(100, "Room cannot have more than 100 members")
    .default(20),
  currentUsers: z.array(z.string().min(3)).default([]),
  expiresAt: z.date().optional(),
});

const RoleScheam = z.enum(["admin", "subscriber", "user"]);

export const UpdateRoomSchema = RoomSchema.partial();
export type UpdateRoom = z.infer<typeof UpdateRoomSchema>;
export type Role = z.infer<typeof RoleScheam>;
export type RoomType = z.infer<typeof RoomSchema>;
