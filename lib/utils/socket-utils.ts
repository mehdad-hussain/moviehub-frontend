import { environment } from "@/lib/env";
import { Movie } from "@/lib/schema";
import { io, Socket } from "socket.io-client";

export type MovieAddedEvent = Movie;
export type RatingUpdatedEvent = {
  movieId: string;
  averageRating: number;
  ratingsCount: number;
};

let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
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
        console.log("Socket connected:", socket?.id);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
    }
  }

  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Helper functions for working with specific socket events
export const onMovieAdded = (callback: (movie: MovieAddedEvent) => void): void => {
  const socket = getSocket();
  socket.on("movie-added", callback);
};

export const offMovieAdded = (callback: (movie: MovieAddedEvent) => void): void => {
  const socket = getSocket();
  socket.off("movie-added", callback);
};

export const onRatingUpdated = (callback: (data: RatingUpdatedEvent) => void): void => {
  const socket = getSocket();
  socket.on("rating-updated", callback);
};

export const offRatingUpdated = (callback: (data: RatingUpdatedEvent) => void): void => {
  const socket = getSocket();
  socket.off("rating-updated", callback);
};
