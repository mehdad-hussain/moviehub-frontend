"use client";

import MovieCard from "@/components/movie-card";
import { useSocket } from "@/hooks/use-socket";
import { moviesApi } from "@/lib/api";
import { type Movie } from "@/lib/schema";
import { useEffect, useState } from "react";

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useSocket({
    onMovieAdded: (newMovie) => {
      setMovies((prevMovies) => [newMovie, ...prevMovies]);
    },
  });

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const fetchedMovies = await moviesApi.getMovies();
        setMovies(fetchedMovies);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-7 max-w-7xl">
        <h1 className="text-2xl font-bold mb-6">Popular Movies</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-gray-200 dark:bg-gray-800 h-[360px] rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-7 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Popular Movies</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div key={movie.id} className="h-full">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  );
}
