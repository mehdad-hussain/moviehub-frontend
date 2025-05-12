"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { CHAT_EVENTS, initializeSocket } from "@/lib/utils/socket-utils";
import { useEffect, type ReactNode } from "react";

export default function SocketProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuthStore();

  useEffect(() => {
    const { main, chat } = initializeSocket(accessToken);

    // Setup reconnection event handlers for the chat socket
    if (chat) {
      // Handle reconnect event from socket.io
      chat.on("reconnect", (attemptNumber) => {
        // For debugging
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.log(`Reconnected to server after ${attemptNumber} attempts`);
        }
      });
    }

    // For debugging
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("Main socket initialized:", !!main);
      // eslint-disable-next-line no-console
      console.log("Chat socket initialized:", !!chat);
    }

    // Cleanup listeners when the component unmounts or accessToken changes
    return () => {
      if (chat) {
        chat.off(CHAT_EVENTS.RECONNECTION_SUCCESSFUL);
        chat.off("reconnect");
      }
    };
  }, [accessToken]);

  return <>{children}</>;
}
