"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { initializeSocket } from "@/lib/utils/socket-utils";
import { useEffect, type ReactNode } from "react";

export default function SocketProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuthStore();

  useEffect(() => {
    const { main, chat } = initializeSocket(accessToken);

    // For debugging
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("Main socket initialized:", !!main);
      // eslint-disable-next-line no-console
      console.log("Chat socket initialized:", !!chat);
    }
  }, [accessToken]);

  return <>{children}</>;
}
