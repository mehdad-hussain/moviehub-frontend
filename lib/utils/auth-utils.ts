import { cookies } from "next/headers";

export async function validateAuthentication() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return { isAuthenticated: false };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
      cache: "no-store",
    });

    const data = await response.json();
    return {
      isAuthenticated: response.ok,
      accessToken: response.ok ? data.accessToken : null,
      user: response.ok ? data.user : null,
    };
  } catch (error) {
    console.error("Authentication validation error:", error);
    return { isAuthenticated: false };
  }
}
