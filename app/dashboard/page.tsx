/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { moviesApi } from "@/lib/api";
import { CreateMovieFormValues, CreateMovieRequest, createMovieSchema } from "@/lib/schema";
import { useAuthStore } from "@/lib/store/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { FilmIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = Record<string, never>;

const Page = ({}: Props) => {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const { accessToken } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      setIsAuthChecking(true);

      // If no access token in store, try to refresh
      if (!accessToken) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            // If refresh fails, redirect to login
            router.push("/login?callbackUrl=" + encodeURIComponent("/dashboard"));
            return;
          }
        } catch (error) {
          console.error("Error checking authentication:", error);
          router.push("/login?callbackUrl=" + encodeURIComponent("/dashboard"));
          return;
        }
      }

      setIsAuthChecking(false);
    };

    checkAuth();
  }, [accessToken, router]);

  const form = useForm<CreateMovieFormValues>({
    resolver: zodResolver(createMovieSchema),
    defaultValues: {
      title: "",
      description: "",
      releaseDate: "",
      genre: "",
      imageUrl: "",
    },
  });

  const { watch, reset } = form;
  const imageUrl = watch("imageUrl");

  const onSubmit = async (data: CreateMovieFormValues) => {
    try {
      const movieData: CreateMovieRequest = {
        ...data,
        genre: data.genre.split(",").map((g) => g.trim()),
      };

      await moviesApi.createMovie(movieData);
      toast.success("Movie created successfully!");
      reset();
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create movie";
      toast.error(errorMessage);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        <Card className="mb-8">
          <CardHeader className="border-b bg-card pb-6">
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-40 w-full" />
              <Separator />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-28" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Movie Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter movie title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="releaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Release Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a description of the movie"
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Genres
                        <span className="text-xs text-muted-foreground ml-2 font-normal">
                          (comma separated)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Action, Drama, Sci-Fi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poster Image URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/movie-poster.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {imageUrl && (
                <div className="bg-muted p-4 rounded-lg border">
                  <p className="text-sm font-medium mb-2">Image Preview:</p>
                  <div className="aspect-[2/3] w-28 overflow-hidden rounded-md shadow-md mx-auto">
                    <img
                      src={imageUrl}
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
                  onClick={() => reset()}
                  disabled={form.formState.isSubmitting}
                >
                  Clear Form
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
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
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
