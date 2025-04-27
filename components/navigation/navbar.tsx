"use client";

import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { useAuthStore, User } from "@/lib/store/auth-store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
};

export function NavBar({
  isAuthenticated: serverIsAuthenticated,
  user: serverUser,
  accessToken: serverAccessToken,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const {
    accessToken: clientAccessToken,
    user: clientUser,
    setAccessToken,
    setUser,
  } = useAuthStore();

  const isAuthenticated = isClient ? !!clientAccessToken : serverIsAuthenticated;
  const user = isClient ? clientUser : serverUser;

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);

    // Keep server and client states in sync
    if (serverIsAuthenticated && serverAccessToken) {
      setAccessToken(serverAccessToken);
      setUser(serverUser);
    }
  }, [serverAccessToken, serverUser, setAccessToken, setUser, serverIsAuthenticated]);

  // Check if the current route is an auth route
  const isAuthRoute = pathname === "/login" || pathname === "/register";

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
              {isAuthenticated && (
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
            </div>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">Hello, {user?.name}</span>
                <Button variant="outline" className="cursor-pointer" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <Link href="/login">Login</Link>
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
