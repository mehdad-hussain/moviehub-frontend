import { z } from "zod";

// Authentication schemas
export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

// Movie schemas
export const createMovieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  releaseDate: z.string().min(1, "Release date is required"),
  genre: z.string().min(1, "Genre is required"),
  imageUrl: z.string().url("Please provide a valid URL"),
});

export type CreateMovieFormValues = z.infer<typeof createMovieSchema>;

export type CreateMovieRequest = Omit<CreateMovieFormValues, "genre"> & {
  genre: string[];
};

// User type definition
export type User = {
  id: string;
  _id?: string;
  name: string;
  email: string;
};

// API Response types
export type LoginResponse = {
  user: User;
  accessToken: string;
};

export type RegisterResponse = {
  user: User;
  accessToken: string;
};

// API fetch options type
export type FetchOptions = {
  method?: string;
  headers?: Record<string, string> | Headers;
  body?: string | FormData | null;
  mode?: "cors" | "no-cors" | "same-origin";
  credentials?: "include" | "omit" | "same-origin";
  cache?: "default" | "no-cache" | "reload" | "force-cache" | "only-if-cached";
  redirect?: "follow" | "error" | "manual";
  referrer?: string;
  integrity?: string;
  keepalive?: boolean;
  signal?: AbortSignal | null;
};

// Movie types
export type Rating = {
  user: string;
  value: number;
  createdAt: string;
  updatedAt: string;
};

export type Movie = {
  id: string;
  title: string;
  description: string;
  releaseDate: string;
  genre: string[];
  imageUrl: string;
  ratings: Rating[];
  averageRating: number;
  createdAt: string;
  updatedAt: string;
};

// Chat message type
export type ChatMessage = {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  recipient: string;
  message: string;
  messageType: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};
