import { NavBar } from "@/components/navigation/navbar";
import { validateAuthentication } from "@/lib/utils/auth-utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MovieHub - Your Movie Collection",
  description: "Browse and manage your movie collection",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Validate authentication on server side
  const { isAuthenticated, user, accessToken } = await validateAuthentication();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NavBar isAuthenticated={isAuthenticated} user={user} accessToken={accessToken} />
        <main>{children}</main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
