import { environment } from "@/lib/env";
import { User, useAuthStore } from "@/lib/store/auth-store";

const API_BASE_URL = environment.NEXT_PUBLIC_API_URL;

// Response types for API
type LoginResponse = {
  user: User;
  accessToken: string;
};

type RegisterResponse = {
  user: User;
  accessToken: string;
};

// Define a type for fetch options that's more specific than 'any'
type FetchOptions = {
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

// Custom fetch function with authentication token handling
export async function fetchWithAuth(endpoint: string, options: FetchOptions = {}) {
  const accessToken = useAuthStore.getState().accessToken;

  // Set up headers with auth token if available
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // Always include credentials to send cookies with requests
  const fetchOptions = {
    ...options,
    headers,
    credentials: "include" as RequestCredentials,
  };

  // Make the request
  let response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

  // Check for unauthorized status (token expired or invalid)
  if (response.status === 401) {
    try {
      // Try to refresh the token
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshResponse.ok) {
        // Got a new access token
        const refreshData = await refreshResponse.json();
        useAuthStore.getState().setAccessToken(refreshData.accessToken);

        // Retry the original request with the new token
        headers.set("Authorization", `Bearer ${refreshData.accessToken}`);
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...fetchOptions,
          headers,
        });
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      useAuthStore.getState().setUser(null);
      useAuthStore.getState().setAccessToken(null);
      throw new Error("Session expired, please log in again");
    }
  }

  return response;
}

// API functions for authentication
export const authApi = {
  async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Registration failed");
    }

    return await response.json();
  },

  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Login failed");
    }

    return await response.json();
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Logout failed");
    }
    return response.json();
  },
};

// API client for other authenticated requests
export const apiClient = {
  get: (endpoint: string, options: FetchOptions = {}) =>
    fetchWithAuth(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data: T, options: FetchOptions = {}) =>
    fetchWithAuth(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: T, options: FetchOptions = {}) =>
    fetchWithAuth(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data: T, options: FetchOptions = {}) =>
    fetchWithAuth(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (endpoint: string, options: FetchOptions = {}) =>
    fetchWithAuth(endpoint, { ...options, method: "DELETE" }),
};
