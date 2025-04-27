"use client";

import { Button } from "@/components/ui/button";
import { moviesApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth-store";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RatingComponentProps {
  movieId: string;
}

export default function RatingComponent({ movieId }: RatingComponentProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRated, setIsRated] = useState(false);
  const user = useAuthStore((state) => state.user);

  const handleRatingSubmit = async () => {
    if (!rating) {
      toast.error("Rating required", {
        description: "Please select a rating before submitting",
      });
      return;
    }

    if (!user) {
      toast.error("Authentication required", {
        description: "You need to log in to rate movies",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await moviesApi.rateMovie(movieId, rating);
      toast.success("Rating submitted", {
        description: "Thank you for rating this movie!",
      });
      setIsRated(true);
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to submit rating",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className="focus:outline-none p-1"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            disabled={isSubmitting}
          >
            <Star
              className={`h-8 w-8 ${
                (hoveredRating || rating) >= value
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              } transition-colors`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm">
          {rating ? `Your rating: ${rating}/5` : "Select a rating"}
        </span>
      </div>

      <Button
        onClick={handleRatingSubmit}
        disabled={!rating || isSubmitting}
        className={isRated ? "bg-green-600 hover:bg-green-700" : ""}
      >
        {isSubmitting ? "Submitting..." : isRated ? "Rating Submitted" : "Submit Rating"}
      </Button>
    </div>
  );
}
