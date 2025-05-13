/* eslint-disable no-console */
import { environment } from "@/lib/env";
import { Movie, User } from "@/lib/schema";
import { io, Socket } from "socket.io-client";

export type MovieAddedEvent = Movie;
export type RatingUpdatedEvent = {
  movieId: string;
  averageRating: number;
  ratingsCount: number;
};

export type ChatMessage = {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  recipient: string;
  roomId?: string;
  message: string;
  messageType: string;
  createdAt: string;
  updatedAt: string;
  read?: boolean;
};

export type RoomInfo = {
  _id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  creator: string;
};

// Main socket connection (no auth required)
let socket: Socket | null = null;
// Chat namespace socket connection (auth required)
let chatSocket: Socket | null = null;

// Additional events for chat
export const CHAT_EVENTS = {
  PRIVATE_MESSAGE: "private-message",
  NEW_MESSAGE: "new-message",
  MESSAGE_SENT: "message-sent",
  // Room-related events
  ROOM_MESSAGE: "room-message",
  NEW_ROOM_MESSAGE: "new-room-message",
  JOIN_ROOM: "join-room",
  LEAVE_ROOM: "leave-room",
  ROOM_JOINED: "room-joined",
  ROOM_LEFT: "room-left",
  ROOM_ADDED: "room-added",
  USER_JOINED_ROOM: "user-joined-room",
  USER_LEFT_ROOM: "user-left-room",
  ROOM_MEMBER_LEFT: "room-member-left",
  // User status events
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",
  GET_ONLINE_USERS: "get-online-users",
  ONLINE_USERS_LIST: "online-users-list",
  // Reconnection events
  RECONNECT: "reconnect",
  RECONNECTION_SUCCESSFUL: "reconnection-successful",
};

export const initializeSocket = (
  token: string | null,
): { main: Socket | null; chat: Socket | null } => {
  // If socket exists but token has changed, disconnect it first
  if (socket && (socket.auth as { token?: string })?.token !== token) {
    disconnectSocket();
  }

  // Initialize the main namespace socket (no auth required)
  if (!socket) {
    const socketUrl = environment.NEXT_PUBLIC_API_URL;
    socket = io(socketUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    if (environment.NODE_ENV === "development") {
      socket.on("connect", () => {
        console.log("Main socket connected:", socket?.id);
      });

      socket.on("disconnect", (reason) => {
        console.log("Main socket disconnected:", reason);
      });

      socket.on("connect_error", (error) => {
        console.error("Main socket connection error:", error);
      });
    }
  }

  // Only create a chat socket if we have a token
  if (token) {
    if (chatSocket && (chatSocket.auth as { token?: string })?.token !== token) {
      // Disconnect chat socket if token changed
      if (chatSocket.connected) {
        chatSocket.disconnect();
      }
      chatSocket = null;
    }

    if (!chatSocket) {
      const socketUrl = `${environment.NEXT_PUBLIC_API_URL}/chat`;
      chatSocket = io(socketUrl, {
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: { token },
      });

      if (environment.NODE_ENV === "development") {
        chatSocket.on("connect", () => {
          console.log("Chat socket connected:", chatSocket?.id);
        });

        chatSocket.on("disconnect", (reason) => {
          console.log("Chat socket disconnected:", reason);
        });

        chatSocket.on("connect_error", (error) => {
          console.error("Chat socket connection error:", error);
        });

        // Listen for reconnection events
        chatSocket.on("reconnect", (attemptNumber) => {
          console.log(`Chat socket reconnected after ${attemptNumber} attempts`);
        });

        chatSocket.on("reconnect_attempt", (attemptNumber) => {
          console.log(`Chat socket reconnection attempt #${attemptNumber}`);
        });

        chatSocket.on("reconnection-successful", (data) => {
          console.log(`Reconnection successful: ${data.message}`);
        });
      } else {
        // In production, still listen for reconnection events but don't log
        chatSocket.on("reconnect", () => {});
        chatSocket.on("reconnection-successful", () => {});
      }
    }
  } else if (chatSocket) {
    // If no token but chat socket exists, disconnect it
    if (chatSocket.connected) {
      chatSocket.disconnect();
    }
    chatSocket = null;
  }

  return { main: socket, chat: chatSocket };
};

export const getSocket = (token?: string | null): { main: Socket | null; chat: Socket | null } => {
  if (!socket) {
    return initializeSocket(token || null);
  }
  return { main: socket, chat: chatSocket };
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }
};

// Online users helper functions
export const fetchOnlineUsers = (): void => {
  const { chat } = getSocket();
  if (chat) {
    chat.emit(CHAT_EVENTS.GET_ONLINE_USERS);
  }
};

export const onUserOnline = (callback: (data: { userId: string; user: User }) => void): void => {
  const { chat } = getSocket();
  if (chat) {
    chat.on(CHAT_EVENTS.USER_ONLINE, callback);
  }
};

export const offUserOnline = (callback: (data: { userId: string; user: User }) => void): void => {
  if (chatSocket) {
    chatSocket.off(CHAT_EVENTS.USER_ONLINE, callback);
  }
};

export const onUserOffline = (callback: (data: { userId: string }) => void): void => {
  const { chat } = getSocket();
  if (chat) {
    chat.on(CHAT_EVENTS.USER_OFFLINE, callback);
  }
};

export const offUserOffline = (callback: (data: { userId: string }) => void): void => {
  if (chatSocket) {
    chatSocket.off(CHAT_EVENTS.USER_OFFLINE, callback);
  }
};

export const onOnlineUsersList = (callback: (data: { userIds: string[] }) => void): void => {
  const { chat } = getSocket();
  if (chat) {
    chat.on(CHAT_EVENTS.ONLINE_USERS_LIST, callback);
  }
};

export const offOnlineUsersList = (callback: (data: { userIds: string[] }) => void): void => {
  if (chatSocket) {
    chatSocket.off(CHAT_EVENTS.ONLINE_USERS_LIST, callback);
  }
};

// Helper functions for working with main namespace events
export const onMovieAdded = (callback: (movie: MovieAddedEvent) => void): void => {
  const { main } = getSocket();
  if (main) {
    main.on("movie-added", callback);
  }
};

export const offMovieAdded = (callback: (movie: MovieAddedEvent) => void): void => {
  if (socket) {
    socket.off("movie-added", callback);
  }
};

export const onRatingUpdated = (callback: (data: RatingUpdatedEvent) => void): void => {
  const { main } = getSocket();
  if (main) {
    main.on("rating-updated", callback);
  }
};

export const offRatingUpdated = (callback: (data: RatingUpdatedEvent) => void): void => {
  if (socket) {
    socket.off("rating-updated", callback);
  }
};

// Enhanced helper functions for chat namespace events
export const sendPrivateMessage = (recipientId: string, message: string): void => {
  if (!recipientId) {
    console.error("Cannot send message: Recipient ID is undefined");
    return;
  }

  console.log("Sending message to recipient ID:", recipientId);

  const { chat } = getSocket();
  if (chat) {
    chat.emit(CHAT_EVENTS.PRIVATE_MESSAGE, { recipientId, message });
  } else {
    console.error("Chat socket not initialized");
  }
};

export const onNewMessage = (callback: (message: ChatMessage) => void): void => {
  const { chat } = getSocket();
  if (chat) {
    chat.on(CHAT_EVENTS.NEW_MESSAGE, callback);
  }
};

export const offNewMessage = (callback: (message: ChatMessage) => void): void => {
  if (chatSocket) {
    chatSocket.off(CHAT_EVENTS.NEW_MESSAGE, callback);
  }
};

export const onMessageSent = (callback: (message: ChatMessage) => void): void => {
  const { chat } = getSocket();
  if (chat) {
    chat.on(CHAT_EVENTS.MESSAGE_SENT, callback);
  }
};

export const offMessageSent = (callback: (message: ChatMessage) => void): void => {
  if (chatSocket) {
    chatSocket.off(CHAT_EVENTS.MESSAGE_SENT, callback);
  }
};

// Room chat related functions
export const sendRoomMessage = (roomId: string, message: string): void => {
  if (!roomId) {
    console.error("Cannot send message: Room ID is undefined");
    return;
  }

  console.log("Sending message to room ID:", roomId);

  const { chat } = getSocket();
  if (chat) {
    chat.emit(CHAT_EVENTS.ROOM_MESSAGE, { roomId, message });
  } else {
    console.error("Chat socket not initialized");
  }
};

export const onNewRoomMessage = (callback: (message: ChatMessage) => void): void => {
  const { chat } = getSocket();
  if (chat) {
    chat.on(CHAT_EVENTS.NEW_ROOM_MESSAGE, callback);
  }
};

export const offNewRoomMessage = (callback: (message: ChatMessage) => void): void => {
  if (chatSocket) {
    chatSocket.off(CHAT_EVENTS.NEW_ROOM_MESSAGE, callback);
  }
};

export const joinRoom = (roomId: string): void => {
  if (!roomId) {
    console.error("Cannot join room: Room ID is undefined");
    return;
  }

  const { chat } = getSocket();
  if (chat) {
    chat.emit(CHAT_EVENTS.JOIN_ROOM, roomId);
  } else {
    console.error("Chat socket not initialized");
  }
};

export const onRoomJoined = (callback: (data: { roomId: string; name: string }) => void): void => {
  const { chat } = getSocket();
  if (chat) {
    chat.on(CHAT_EVENTS.ROOM_JOINED, callback);
  }
};

export const offRoomJoined = (callback: (data: { roomId: string; name: string }) => void): void => {
  if (chatSocket) {
    chatSocket.off(CHAT_EVENTS.ROOM_JOINED, callback);
  }
};

export const leaveRoom = (roomId: string): void => {
  if (!roomId) {
    console.error("Cannot leave room: Room ID is undefined");
    return;
  }

  const { chat } = getSocket();
  if (chat) {
    chat.emit(CHAT_EVENTS.LEAVE_ROOM, roomId);
  } else {
    console.error("Chat socket not initialized");
  }
};

export const onRoomLeft = (callback: (data: { roomId: string; name: string }) => void): void => {
  const { chat } = getSocket();
  if (chat) {
    chat.on(CHAT_EVENTS.ROOM_LEFT, callback);
  }
};

export const offRoomLeft = (callback: (data: { roomId: string; name: string }) => void): void => {
  if (chatSocket) {
    chatSocket.off(CHAT_EVENTS.ROOM_LEFT, callback);
  }
};

export const onRoomAdded = (
  callback: (data: { room: RoomInfo; message: string }) => void,
): void => {
  const { chat } = getSocket();
  if (chat) {
    chat.on(CHAT_EVENTS.ROOM_ADDED, callback);
  }
};

export const offRoomAdded = (
  callback: (data: { room: RoomInfo; message: string }) => void,
): void => {
  if (chatSocket) {
    chatSocket.off(CHAT_EVENTS.ROOM_ADDED, callback);
  }
};

export const onReconnect = (callback: () => void): void => {
  const { chat } = getSocket();
  if (chat) {
    chat.on(CHAT_EVENTS.RECONNECT, callback);
  }
};

export const offReconnect = (callback: () => void): void => {
  if (chatSocket) {
    chatSocket.off(CHAT_EVENTS.RECONNECT, callback);
  }
};

export const onReconnectionSuccessful = (callback: (data: { message: string }) => void): void => {
  const { chat } = getSocket();
  if (chat) {
    chat.on(CHAT_EVENTS.RECONNECTION_SUCCESSFUL, callback);
  }
};

export const offReconnectionSuccessful = (callback: (data: { message: string }) => void): void => {
  if (chatSocket) {
    chatSocket.off(CHAT_EVENTS.RECONNECTION_SUCCESSFUL, callback);
  }
};
