import { useAuthStore } from "@/lib/store/auth-store";
import {
  ChatMessage,
  getSocket,
  joinRoom as joinChatRoom,
  leaveRoom as leaveChatRoom,
  offMessageSent,
  offNewMessage,
  offNewRoomMessage,
  offRoomAdded,
  offRoomJoined,
  offRoomLeft,
  onMessageSent,
  onNewMessage,
  onNewRoomMessage,
  onRoomAdded,
  onRoomJoined,
  onRoomLeft,
  RoomInfo,
  sendPrivateMessage,
  sendRoomMessage,
} from "@/lib/utils/socket-utils";
import { useCallback, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

type UseChatProps = {
  onNewMessage?: (message: ChatMessage) => void;
  onNewRoomMessage?: (message: ChatMessage) => void;
  onMessageSent?: (message: ChatMessage) => void;
  onRoomJoined?: (data: { roomId: string; name: string }) => void;
  onRoomLeft?: (data: { roomId: string; name: string }) => void;
  onRoomAdded?: (data: { room: RoomInfo; message: string }) => void;
};

export function useChat({
  onNewMessage: newMessageCallback,
  onNewRoomMessage: newRoomMessageCallback,
  onMessageSent: messageSentCallback,
  onRoomJoined: roomJoinedCallback,
  onRoomLeft: roomLeftCallback,
  onRoomAdded: roomAddedCallback,
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
    if (socketRef.current.chat) {
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
    };
  }, [
    newMessageCallback,
    newRoomMessageCallback,
    messageSentCallback,
    roomJoinedCallback,
    roomLeftCallback,
    roomAddedCallback,
    accessToken,
  ]);

  const sendMessage = useCallback(
    (targetId: string, message: string, isRoom: boolean = false) => {
      if (!socketRef.current.chat) {
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
      if (!socketRef.current.chat) {
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
      if (!socketRef.current.chat) {
        console.error("Chat socket not initialized");
        return false;
      }

      leaveChatRoom(roomId);
      return true;
    },
    [socketRef],
  );

  return {
    socket: socketRef.current.chat,
    isConnected: !!socketRef.current.chat?.connected,
    sendMessage,
    joinRoom,
    leaveRoom,
  };
}
