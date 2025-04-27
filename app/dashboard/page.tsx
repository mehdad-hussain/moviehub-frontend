"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { moviesApi } from "@/lib/api";
import { FilmIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = Record<string, never>;

type MovieFormData = {
  title: string;
  description: string;
  releaseDate: string;
  genre: string;
  imageUrl: string;
};

const Page = ({}: Props) => {
  const router = useRouter();
  const [formData, setFormData] = useState<MovieFormData>({
    title: "",
    description: "",
    releaseDate: "",
    genre: "",
    imageUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const movieData = {
        ...formData,
        genre: formData.genre.split(",").map((g) => g.trim()),
      };

      await moviesApi.createMovie(movieData);
      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        releaseDate: "",
        genre: "",
        imageUrl: "",
      });

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create movie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movie Dashboard</h1>
          <p className="text-muted-foreground mt-1">Create and manage your movie collection</p>
        </div>
        <FilmIcon className="h-10 w-10 text-primary" />
      </div>

      <Card className="mb-8">
        <CardHeader className="border-b bg-card pb-6">
          <CardTitle className="text-xl text-primary">Add New Movie</CardTitle>
          <CardDescription>Fill in the details to add a movie to the database</CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {success && (
            <Alert className="mb-6 bg-emerald-50 text-emerald-800 border-emerald-200">
              <AlertDescription className="flex items-center gap-2">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                >
                  <path
                    d="M7.5 0.875C3.83884 0.875 0.875 3.83884 0.875 7.5C0.875 11.1612 3.83884 14.125 7.5 14.125C11.1612 14.125 14.125 11.1612 14.125 7.5C14.125 3.83884 11.1612 0.875 7.5 0.875ZM10.7898 6.20455C10.868 6.28107 10.9311 6.37058 10.9753 6.46903C11.0195 6.56749 11.0442 6.67321 11.0478 6.78079C11.0515 6.88837 11.034 6.9953 10.9966 7.09638C10.9591 7.19745 10.9022 7.29094 10.829 7.3719L7.89403 10.4719C7.82213 10.5489 7.73571 10.6113 7.63972 10.6548C7.54373 10.6984 7.44012 10.7223 7.33457 10.7251C7.22903 10.728 7.12426 10.7096 7.02604 10.6713C6.92782 10.633 6.83811 10.5753 6.76193 10.5021L4.26193 8.12713C4.18889 8.05824 4.1315 7.97564 4.09333 7.88485C4.05516 7.79406 4.03701 7.69717 4.03994 7.59987C4.04288 7.50257 4.06684 7.40703 4.1103 7.31905C4.15375 7.23108 4.21581 7.15248 4.29284 7.08833C4.36988 7.02417 4.46054 6.97573 4.55963 6.94591C4.65872 6.91608 4.76402 6.90547 4.86988 6.91465C4.97573 6.92384 5.07894 6.95263 5.17358 7.00005C5.26822 7.04746 5.35243 7.1127 5.42193 7.19122L7.26072 8.93162L9.67557 6.24592C9.7521 6.16399 9.84454 6.09801 9.94684 6.05192C10.0491 6.00583 10.158 5.98042 10.2682 5.97721C10.3785 5.97401 10.4885 5.99306 10.5928 6.03317C10.6971 6.07328 10.7927 6.13361 10.8734 6.21045L10.7898 6.20455Z"
                    fill="currentColor"
                  />
                </svg>
                Movie created successfully!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription className="flex items-center gap-2">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Movie Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter movie title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date</Label>
                <Input
                  id="releaseDate"
                  name="releaseDate"
                  type="date"
                  value={formData.releaseDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide a description of the movie"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="genre">
                  Genres
                  <span className="text-xs text-muted-foreground ml-2 font-normal">
                    (comma separated)
                  </span>
                </Label>
                <Input
                  id="genre"
                  name="genre"
                  placeholder="Action, Drama, Sci-Fi"
                  value={formData.genre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Poster Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="https://example.com/movie-poster.jpg"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {formData.imageUrl && (
              <div className="bg-muted p-4 rounded-lg border">
                <p className="text-sm font-medium mb-2">Image Preview:</p>
                <div className="aspect-[2/3] w-28 overflow-hidden rounded-md shadow-md mx-auto">
                  <img
                    src={formData.imageUrl}
                    alt="Movie poster preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/300x450?text=Invalid+Image";
                    }}
                  />
                </div>
              </div>
            )}

            <Separator />

            <CardFooter className="flex justify-end gap-2 px-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    title: "",
                    description: "",
                    releaseDate: "",
                    genre: "",
                    imageUrl: "",
                  });
                  setSuccess(false);
                }}
                disabled={loading}
              >
                Clear Form
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Add Movie"
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
