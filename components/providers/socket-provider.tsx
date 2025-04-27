"use client";

import { initializeSocket } from "@/lib/utils/socket-utils";
import { useEffect } from "react";

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeSocket();
  }, []);

  return <>{children}</>;
}
