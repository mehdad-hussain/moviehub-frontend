/* eslint-disable @next/next/no-img-element */
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type Movie } from "@/lib/schema";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter();
  const releaseYear = new Date(movie.releaseDate).getFullYear();

  return (
    <Card
      className="h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer rounded-lg border-none flex flex-col"
      onClick={() => router.push(`/movies/${movie.id}`)}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
        {/* as i used dummy url use img tag instead next js image component */}
        <img
          src={movie.imageUrl || "/placeholder-movie.jpg"}
          alt={movie.title}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute bottom-2 right-2 z-20 bg-black/60 text-white rounded-md px-2 py-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Star className="h-3.5 w-3.5 text-yellow-400 mr-1" fill="currentColor" />
          <span className="text-xs font-medium">{movie.averageRating.toFixed(1)}</span>
        </div>
      </div>

      <CardContent className="p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex-grow flex flex-col">
        <h3 className="font-bold text-lg line-clamp-1 text-gray-900 dark:text-gray-100">
          {movie.title}
        </h3>

        <div className="flex justify-between items-center mt-1.5">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{releaseYear}</p>
          <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded">
            <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" fill="currentColor" />
            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500">
              {movie.averageRating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {movie.genre.slice(0, 2).map((genre) => (
            <Badge
              key={genre}
              variant="secondary"
              className="text-xs py-0.5 font-medium bg-gray-200/80 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            >
              {genre}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
