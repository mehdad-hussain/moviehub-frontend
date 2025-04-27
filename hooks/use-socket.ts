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

  useEffect(() => {
    socketRef.current = getSocket();

    if (movieAddedCallback) {
      onMovieAdded(movieAddedCallback);
    }

    if (ratingUpdatedCallback) {
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
  }, [movieAddedCallback, ratingUpdatedCallback]);

  return socketRef.current;
}
