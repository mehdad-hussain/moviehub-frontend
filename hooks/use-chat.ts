import { useAuthStore } from "@/lib/store/auth-store";
import {
  ChatMessage,
  getSocket,
  joinRoom as joinChatRoom,
  leaveRoom as leaveChatRoom,
  offMessageSent,
  offNewMessage,
  offNewRoomMessage,
  offReconnect,
  offReconnectionSuccessful,
  offRoomAdded,
  offRoomJoined,
  offRoomLeft,
  onMessageSent,
  onNewMessage,
  onNewRoomMessage,
  onReconnect,
  onReconnectionSuccessful,
  onRoomAdded,
  onRoomJoined,
  onRoomLeft,
  RoomInfo,
  sendPrivateMessage,
  sendRoomMessage,
} from "@/lib/utils/socket-utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

type UseChatProps = {
  onNewMessage?: (message: ChatMessage) => void;
  onNewRoomMessage?: (message: ChatMessage) => void;
  onMessageSent?: (message: ChatMessage) => void;
  onRoomJoined?: (data: { roomId: string; name: string }) => void;
  onRoomLeft?: (data: { roomId: string; name: string }) => void;
  onRoomAdded?: (data: { room: RoomInfo; message: string }) => void;
  onReconnect?: () => void;
  onReconnectionSuccessful?: (data: { message: string }) => void;
};

export function useChat({
  onNewMessage: newMessageCallback,
  onNewRoomMessage: newRoomMessageCallback,
  onMessageSent: messageSentCallback,
  onRoomJoined: roomJoinedCallback,
  onRoomLeft: roomLeftCallback,
  onRoomAdded: roomAddedCallback,
  onReconnect: reconnectCallback,
  onReconnectionSuccessful: reconnectionSuccessfulCallback,
}: UseChatProps = {}) {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken } = useAuthStore();
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    // Only attempt to get a socket if we have an access token
    if (accessToken) {
      socketRef.current = getSocket(accessToken).chat;
    } else {
      socketRef.current = null;
    }

    // Only register event listeners if we have both a socket and callbacks
    if (socketRef.current) {
      if (newMessageCallback) {
        onNewMessage(newMessageCallback);
      }

      if (newRoomMessageCallback) {
        onNewRoomMessage(newRoomMessageCallback);
      }

      if (messageSentCallback) {
        onMessageSent(messageSentCallback);
      }

      if (roomJoinedCallback) {
        onRoomJoined(roomJoinedCallback);
      }

      if (roomLeftCallback) {
        onRoomLeft(roomLeftCallback);
      }

      if (roomAddedCallback) {
        onRoomAdded(roomAddedCallback);
      }

      // Setup reconnection event handlers
      if (reconnectCallback) {
        onReconnect(reconnectCallback);
      }

      if (reconnectionSuccessfulCallback) {
        onReconnectionSuccessful(reconnectionSuccessfulCallback);
      }

      // Default reconnect handlers (if no custom handlers provided)
      if (!reconnectCallback) {
        onReconnect(() => {
          // eslint-disable-next-line no-console
          console.log("Socket reconnected to server");
          setIsReconnecting(false);
        });

        // Also directly listen to the socket.io reconnect event
        socketRef.current.on("reconnect", (attemptNumber) => {
          // eslint-disable-next-line no-console
          console.log(`Reconnected to server after ${attemptNumber} attempts`);
          setIsReconnecting(false);
        });
      }

      if (!reconnectionSuccessfulCallback) {
        onReconnectionSuccessful((data) => {
          // eslint-disable-next-line no-console
          console.log(data.message);
          setIsReconnecting(false);

          // You can resume chat activity here
          // For example, re-fetch active conversations or room data
        });
      }

      // Handle disconnect by setting reconnecting state
      socketRef.current.on("disconnect", () => {
        setIsReconnecting(true);
      });
    }

    // Cleanup function
    return () => {
      if (newMessageCallback) {
        offNewMessage(newMessageCallback);
      }

      if (newRoomMessageCallback) {
        offNewRoomMessage(newRoomMessageCallback);
      }

      if (messageSentCallback) {
        offMessageSent(messageSentCallback);
      }

      if (roomJoinedCallback) {
        offRoomJoined(roomJoinedCallback);
      }

      if (roomLeftCallback) {
        offRoomLeft(roomLeftCallback);
      }

      if (roomAddedCallback) {
        offRoomAdded(roomAddedCallback);
      }

      // Clean up reconnection handlers
      if (reconnectCallback) {
        offReconnect(reconnectCallback);
      }

      if (reconnectionSuccessfulCallback) {
        offReconnectionSuccessful(reconnectionSuccessfulCallback);
      }

      if (socketRef.current) {
        socketRef.current.off("disconnect");
        socketRef.current.off("reconnect");
      }
    };
  }, [
    newMessageCallback,
    newRoomMessageCallback,
    messageSentCallback,
    roomJoinedCallback,
    roomLeftCallback,
    roomAddedCallback,
    reconnectCallback,
    reconnectionSuccessfulCallback,
    accessToken,
  ]);

  const sendMessage = useCallback(
    (targetId: string, message: string, isRoom: boolean = false) => {
      if (!socketRef.current) {
        console.error("Chat socket not initialized");
        return false;
      }

      if (isRoom) {
        sendRoomMessage(targetId, message);
      } else {
        sendPrivateMessage(targetId, message);
      }
      return true;
    },
    [socketRef],
  );

  const joinRoom = useCallback(
    (roomId: string) => {
      if (!socketRef.current) {
        console.error("Chat socket not initialized");
        return false;
      }

      joinChatRoom(roomId);
      return true;
    },
    [socketRef],
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      if (!socketRef.current) {
        console.error("Chat socket not initialized");
        return false;
      }

      leaveChatRoom(roomId);
      return true;
    },
    [socketRef],
  );

  return {
    socket: socketRef.current,
    isConnected: !!socketRef.current?.connected,
    isReconnecting,
    sendMessage,
    joinRoom,
    leaveRoom,
  };
}
