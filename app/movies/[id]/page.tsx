/* eslint-disable @next/next/no-img-element */
"use client";

import RatingComponent from "@/components/rating-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSocket } from "@/hooks/use-socket";
import { moviesApi } from "@/lib/api";
import { Movie } from "@/lib/schema";
import { ArrowLeft, Calendar, Star } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MovieDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useSocket({
    onRatingUpdated: (data) => {
      if (movie && data.movieId === movie.id) {
        setMovie((prevMovie) => {
          if (!prevMovie) return null;
          return {
            ...prevMovie,
            averageRating: data.averageRating,
            ratings: Array(data.ratingsCount).fill(null),
          };
        });
      }
    },
  });

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const fetchedMovie = await moviesApi.getMovieById(id);
        setMovie(fetchedMovie);
      } catch (error) {
        console.error("Failed to fetch movie:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading || !movie) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Link href="/">
          <Button variant="ghost" className="mb-6 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Movies
          </Button>
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="relative aspect-[2/3] w-full rounded-lg animate-pulse bg-gray-200 dark:bg-gray-800"></div>
          </div>
          <div className="md:col-span-2">
            <div className="h-8 w-1/2 rounded animate-pulse bg-gray-200 dark:bg-gray-800 mb-4"></div>
            <div className="h-4 w-1/3 rounded animate-pulse bg-gray-200 dark:bg-gray-800 mb-6"></div>
            <div className="h-32 rounded animate-pulse bg-gray-200 dark:bg-gray-800"></div>
          </div>
        </div>
      </div>
    );
  }

  const releaseDate = new Date(movie.releaseDate);
  const formattedDate = releaseDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <Link href="/">
        <Button variant="ghost" className="mb-6 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Movies
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-xl">
            {/* as i used dummy url use img tag instead next js image component */}
            <img
              src={movie.imageUrl || "/placeholder-movie.jpg"}
              alt={movie.title}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-1" />
              <span className="font-semibold">{movie.averageRating.toFixed(1)}/5</span>
              <span className="text-sm text-gray-500 ml-1">({movie.ratings.length} ratings)</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-gray-500">{formattedDate}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {movie.genre.map((genre) => (
              <Badge key={genre} variant="outline">
                {genre}
              </Badge>
            ))}
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">{movie.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Rate This Movie</h2>
              <RatingComponent movieId={movie.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
