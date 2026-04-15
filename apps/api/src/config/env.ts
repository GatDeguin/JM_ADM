import { z } from "zod";

const apiEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  APP_ROLE: z.enum(["api", "worker"]).default("api"),
  IMPORT_WORKER_ENABLED: z.enum(["true", "false"]).default("true"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  STORAGE_ENDPOINT: z.string().url(),
  STORAGE_BUCKET: z.string().min(1),
  STORAGE_ACCESS_KEY: z.string().min(1),
  STORAGE_SECRET_KEY: z.string().min(1),
  STORAGE_REGION: z.string().min(1),
  STORAGE_FORCE_PATH_STYLE: z.enum(["true", "false"]),
  STORAGE_PUBLIC_BASE_URL: z.string().url(),
});

const parsedApiEnv = apiEnvSchema.safeParse(process.env);

if (!parsedApiEnv.success) {
  const invalidKeys = parsedApiEnv.error.issues
    .map((issue) => issue.path.join("."))
    .filter(Boolean)
    .join(", ");

  throw new Error(`Invalid API environment variables: ${invalidKeys}`);
}

export const API_ENV = parsedApiEnv.data;
