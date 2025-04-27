import { z } from "zod";

// Server-side only env schema
const serverEnvSchema = z.object({
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),
});

// Client-side env schema (only public variables)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
});

// Shared env schema
const sharedEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// Create different schemas for client and server
const clientSchema = sharedEnvSchema.merge(clientEnvSchema);
const serverSchema = sharedEnvSchema.merge(serverEnvSchema).merge(clientEnvSchema);

// Check if we're running on the server or client
const isServer = typeof window === "undefined";

// Parse the appropriate schema based on environment
const env = isServer
  ? serverSchema.safeParse(process.env)
  : clientSchema.safeParse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    });

if (!env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(env.error.format(), null, 2));

  // In server context we can throw an error, but in client we should handle it gracefully
  if (isServer) {
    throw new Error("Invalid environment variables");
  }
}

// Export a safe environment object with default values for client-side
export const environment = env.success
  ? env.data
  : {
      NODE_ENV: process.env.NODE_ENV || "development",
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    };

// Type for environment
export type Environment = z.infer<typeof clientSchema> & Partial<z.infer<typeof serverEnvSchema>>;
