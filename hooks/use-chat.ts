import { useAuthStore } from "@/lib/store/auth-store";
import {
  ChatMessage,
  getSocket,
  offMessageSent,
  offNewMessage,
  onMessageSent,
  onNewMessage,
  sendPrivateMessage,
} from "@/lib/utils/socket-utils";
import { useCallback, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

type UseChatProps = {
  onNewMessage?: (message: ChatMessage) => void;
  onMessageSent?: (message: ChatMessage) => void;
};

export function useChat({
  onNewMessage: newMessageCallback,
  onMessageSent: messageSentCallback,
}: UseChatProps = {}) {
  const socketRef = useRef<{ main: Socket | null; chat: Socket | null }>({
    main: null,
    chat: null,
  });
  const { accessToken } = useAuthStore();

  useEffect(() => {
    // Only attempt to get a socket if we have an access token
    if (accessToken) {
      socketRef.current = getSocket(accessToken);
    } else {
      socketRef.current = { main: getSocket().main, chat: null };
    }

    // Only register event listeners if we have both a socket and callbacks
    if (socketRef.current.chat && newMessageCallback) {
      onNewMessage(newMessageCallback);
    }

    if (socketRef.current.chat && messageSentCallback) {
      onMessageSent(messageSentCallback);
    }

    // Cleanup function
    return () => {
      if (newMessageCallback) {
        offNewMessage(newMessageCallback);
      }

      if (messageSentCallback) {
        offMessageSent(messageSentCallback);
      }
    };
  }, [newMessageCallback, messageSentCallback, accessToken]);

  const sendMessage = useCallback(
    (recipientId: string, message: string) => {
      if (!socketRef.current.chat) {
        console.error("Chat socket not initialized");
        return false;
      }

      sendPrivateMessage(recipientId, message);
      return true;
    },
    [socketRef],
  );

  return {
    socket: socketRef.current.chat,
    isConnected: !!socketRef.current.chat?.connected,
    sendMessage,
  };
}
