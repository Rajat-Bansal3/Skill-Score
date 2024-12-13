import z, { coerce } from "zod";

export const fetchPlayerStatsRequest = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/,
      "Invalid chess.com username"
    ),
});

export const fetchPlayerGamesRequest = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/,
      "Invalid chess.com username"
    ),
  year: z.string(),
  month: z.string(),
  mode: z.enum(["bullet", "rapid", "blitz"]),
});
//   .superRefine((data, ctx) => {
//     if (data.startTime !== undefined && data.startTime < new Date().getTime()) {
//       ctx.addIssue({
//         path: ["startTime"],
//         message: "startTime cannot be in the future",
//         code: "custom",
//       });
//     }
//   });
const PlayerSchema = z.object({
  rating: z.number(),
  result: z.string(),
  "@id": z.string().url(),
  username: z.string(),
  uuid: z.string(),
});
const GameSchema = z.object({
  url: z.string().url(),
  pgn: z.string(),
  time_control: z.string(),
  end_time: z.number(),
  rated: z.boolean(),
  tcn: z.string(),
  uuid: z.string(),
  initial_setup: z.string().optional(),
  fen: z.string(),
  time_class: z.string(),
  rules: z.string(),
  white: PlayerSchema,
  black: PlayerSchema,
  eco: z.string().url(),
});
export type Game = z.infer<typeof GameSchema>;
export type Player = z.infer<typeof PlayerSchema>;
