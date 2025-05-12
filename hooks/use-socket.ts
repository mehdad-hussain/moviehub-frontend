import { useAuthStore } from "@/lib/store/auth-store";
import {
  getSocket,
  MovieAddedEvent,
  offMovieAdded,
  offRatingUpdated,
  onMovieAdded,
  onRatingUpdated,
  RatingUpdatedEvent,
} from "@/lib/utils/socket-utils";
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

type UseSocketProps = {
  onMovieAdded?: (movie: MovieAddedEvent) => void;
  onRatingUpdated?: (data: RatingUpdatedEvent) => void;
};

export function useSocket({
  onMovieAdded: movieAddedCallback,
  onRatingUpdated: ratingUpdatedCallback,
}: UseSocketProps = {}) {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    // Only attempt to get a socket if we have an access token
    if (accessToken) {
      socketRef.current = getSocket(accessToken).main;
    } else {
      socketRef.current = getSocket().main;
    }

    // Only register event listeners if we have both a socket and callbacks
    if (socketRef.current && movieAddedCallback) {
      onMovieAdded(movieAddedCallback);
    }

    if (socketRef.current && ratingUpdatedCallback) {
      onRatingUpdated(ratingUpdatedCallback);
    }

    // Cleanup function
    return () => {
      if (movieAddedCallback) {
        offMovieAdded(movieAddedCallback);
      }

      if (ratingUpdatedCallback) {
        offRatingUpdated(ratingUpdatedCallback);
      }
    };
  }, [movieAddedCallback, ratingUpdatedCallback, accessToken]);

  return socketRef.current;
}
