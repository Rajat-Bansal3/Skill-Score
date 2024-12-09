import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MONGO_URI: z.string().url().min(1, "Mongo URI is required"),
  PORT: z.coerce.number().default(5050),
  JWT_SECRET: z.string().min(1, "JWT secret is required"),
  MAIL_TRAP_PASSWORD: z.string(),
  MAIL_TRAP_TOKEN: z.string(),
  MAIL_TRAP_INBOX_ID: z.coerce.number(),
  MAIL_TRAP_USER_ID: z.coerce.string(),
  FRONTEND_URL: z.string(),
  MAILTRAP_STMP_SIG: z.string(),
  TEXT_FLOW_API_KEY: z.string(),
  KEY_PATH: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

const env = parsedEnv.data;

export { env };
