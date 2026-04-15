import { z } from "zod";

const webEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
});

const parsedWebEnv = webEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});

if (!parsedWebEnv.success) {
  const missingKeys = parsedWebEnv.error.issues
    .map((issue) => issue.path.join("."))
    .filter(Boolean)
    .join(", ");

  throw new Error(`Invalid web environment variables: ${missingKeys}`);
}

export const WEB_ENV = parsedWebEnv.data;
export const API_BASE_URL = WEB_ENV.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
