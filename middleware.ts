import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard"];
const authOnlyPaths = ["/login", "/register"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(
    (path) => pathname.startsWith(path) || pathname === path,
  );

  // Check if the path should only be accessible when not authenticated
  const isAuthOnlyPath = authOnlyPaths.some(
    (path) => pathname.startsWith(path) || pathname === path,
  );

  // Only perform session validation if needed
  if (isProtectedPath || isAuthOnlyPath) {
    let isAuthenticated = false;
    try {
      const refreshToken = request.cookies.get("refreshToken")?.value;

      if (!refreshToken) {
        isAuthenticated = false;
      } else {
        // Forward the refresh token in the request
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `refreshToken=${refreshToken}`,
          },
          cache: "no-store",
        });

        const data = await response.json();

        isAuthenticated = response.ok;

        // If authenticated and this is a protected path, forward the request with the new access token
        if (isAuthenticated && isProtectedPath && data.accessToken) {
          return NextResponse.next();
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      isAuthenticated = false;
    }

    // If the path requires authentication and the user is not authenticated,
    // redirect to the login page
    if (isProtectedPath && !isAuthenticated) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", encodeURI(pathname));

      // Create a response object
      const response = NextResponse.redirect(url);

      // Add cache control headers to prevent caching
      response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");

      return response;
    }

    // If the path should only be accessible when not authenticated and the user is authenticated,
    // redirect to the dashboard page
    if (isAuthOnlyPath && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // For protected paths, always add cache control headers
  if (isProtectedPath) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    return response;
  }

  // Continue with the request if none of the conditions are met
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
