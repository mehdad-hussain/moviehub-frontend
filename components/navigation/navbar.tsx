"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth-store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const { accessToken, user, setAccessToken, setUser } = useAuthStore();

  // Check if the current route is an auth route
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Call auth API to check authentication status
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
          method: "POST",
          credentials: "include", // Important for cookies
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAccessToken(data.accessToken);
          setUser(data.user);
        } else {
          // Clear any stale state if not authenticated
          setAccessToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setAccessToken, setUser]);

  // Don't show navbar on auth routes
  if (isAuthRoute) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setAccessToken(null);
      setUser(null);
      router.refresh();
    }
  };

  const handleLogin = () => {
    const callbackUrl = encodeURI(pathname);
    router.push(`/login?callbackUrl=${callbackUrl}`);
  };

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary">
                MovieHub
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === "/"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                Home
              </Link>
              {!isLoading && accessToken && (
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === "/dashboard"
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                  }`}
                >
                  Dashboard
                </Link>
              )}
              {!isLoading && accessToken && (
                <Link
                  href="/chat"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname.startsWith("/chat")
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                  }`}
                >
                  Chat
                </Link>
              )}
              {isLoading && (
                <div className="inline-flex items-center px-1 pt-1">
                  <Skeleton className="h-4 w-20" />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {isLoading ? (
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-20" />
              </div>
            ) : accessToken ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">Hello, {user?.name}</span>
                <Button variant="outline" className="cursor-pointer" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" className="cursor-pointer" onClick={handleLogin}>
                  Login
                </Button>
                <Button asChild>
                  <Link href="/register" className="cursor-pointer">
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
