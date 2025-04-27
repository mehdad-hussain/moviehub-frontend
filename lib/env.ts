/* eslint-disable no-console */
import { z } from "zod";

// Server-side only env schema
const serverEnvSchema = z.object({});

// Client-side env schema (only public variables)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
});

// Shared env schema
const sharedEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const clientSchema = sharedEnvSchema.merge(clientEnvSchema);
const serverSchema = sharedEnvSchema.merge(serverEnvSchema).merge(clientEnvSchema);

const isServer = typeof window === "undefined";

const env = isServer
  ? serverSchema.safeParse(process.env)
  : clientSchema.safeParse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    });

if (!env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(env.error.format(), null, 2));

  if (isServer) {
    throw new Error("Invalid environment variables");
  }
}

export const environment = env.success
  ? env.data
  : {
      NODE_ENV: process.env.NODE_ENV || "development",
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    };

export type Environment = z.infer<typeof clientSchema> & Partial<z.infer<typeof serverEnvSchema>>;
