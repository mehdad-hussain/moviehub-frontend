import MovieCard from "@/components/movie-card";
import { moviesApi } from "@/lib/api";
import Link from "next/link";

export default async function Home() {
  const movies = await moviesApi.getMovies();
  return (
    <div className="container mx-auto py-8 px-7 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Popular Movies</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <Link key={movie.id} href={`/movies/${movie.id}`}>
            <MovieCard movie={movie} />
          </Link>
        ))}
      </div>
    </div>
  );
}
