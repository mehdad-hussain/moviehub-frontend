import { NavBar } from "@/components/navigation/navbar";
import SocketProvider from "@/components/providers/socket-provider";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SocketProvider>
          <NavBar />
          <main>{children}</main>
          <Toaster position="top-right" richColors />
        </SocketProvider>
      </body>
    </html>
  );
}
