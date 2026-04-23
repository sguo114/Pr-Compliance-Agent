import { z } from "zod";

const envSchema = z.object({
  APP_ID: z.string(),
  WEBHOOK_SECRET: z.string(),
  PRIVATE_KEY_PATH: z.string(),
  OLLAMA_BASE_URL: z.string().url().default("http://localhost:11434"),
});

export const env = envSchema.parse(process.env);
