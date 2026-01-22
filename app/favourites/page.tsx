"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Heart, Trash2, Calendar, Star, Loader2, ArrowLeft, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { cn } from "@/lib/utils";

interface Movie {
  _id: string;
  title: string;
  poster: string;
  duration: string;
  rating?: number;
  description: string;
  category?: { name: string };
}

export default function FavouritesPage() {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const fetchFavorites = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get("http://localhost:5000/users/favorites", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (isLoaded) {
      fetchFavorites();
    }
  }, [isLoaded, fetchFavorites]);

  const handleRemove = async (movieId: string) => {
    try {
      setRemovingId(movieId);
      const token = await getToken();
      await axios.post(`http://localhost:5000/users/favorites/${movieId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(prev => prev.filter(m => m._id !== movieId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    } finally {
      setRemovingId(null);
    }
  };

  if (!isLoaded || (loading && favorites.length === 0)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 px-6 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
           <Heart className="w-10 h-10 text-zinc-700" />
        </div>
        <h1 className="text-3xl font-bold">Please sign in</h1>
        <p className="text-zinc-500 max-w-sm">You need to be logged in to view your favorite movies and manage your watchlist.</p>
        <Link href="/">
           <Button className="bg-purple-600 hover:bg-purple-500 px-8 rounded-full">Go Back Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-900">
          <div className="space-y-4">
            <Link href="/movies" className="inline-flex items-center gap-2 text-zinc-500 hover:text-purple-400 transition-colors text-sm font-medium mb-2">
               <ArrowLeft className="h-4 w-4" /> Back to Movies
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 flex items-center justify-center shadow-lg shadow-pink-500/5">
                <Heart className="w-7 h-7 text-pink-500 fill-pink-500/10" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Watchlist</span>
              </h1>
            </div>
            <p className="text-zinc-500 text-lg">Manage your favorite picks and book them for your next show.</p>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800 text-sm font-medium">
             <Ticket className="h-4 w-4 text-purple-500" />
             {favorites.length} {favorites.length === 1 ? 'Movie' : 'Movies'} Saved
          </div>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favorites.map((movie) => (
              <div key={movie._id} className="group relative flex flex-col bg-zinc-900/40 rounded-3xl overflow-hidden border border-zinc-800 hover:border-pink-500/30 transition-all duration-500 hover:-translate-y-2">
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img 
                    src={movie.poster} 
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold flex items-center gap-1.5 shadow-xl">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      {movie.rating || "N/A"}
                    </div>
                  </div>

                  {/* Actions on Hover */}
                  <button 
                    onClick={() => handleRemove(movie._id)}
                    disabled={removingId === movie._id}
                    className="absolute top-4 right-4 p-2.5 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white backdrop-blur-md border border-red-500/20 transition-all duration-300 transform scale-90 group-hover:scale-100 shadow-xl"
                    title="Remove from favorites"
                  >
                    {removingId === movie._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  <div>
                    <span className="text-[10px] font-bold text-pink-500 uppercase tracking-[0.15em]">{movie.category?.name || "Movie"}</span>
                    <h3 className="text-lg font-bold mt-1 group-hover:text-pink-400 transition-colors line-clamp-1">{movie.title}</h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {movie.duration}
                    </span>
                  </div>

                  <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed flex-grow">
                    {movie.description}
                  </p>

                  <div className="pt-2">
                    <Link href={`/movies/${movie._id}`}>
                      <Button className="w-full bg-white text-black hover:bg-zinc-200 rounded-xl font-bold py-6 shadow-lg shadow-white/5 transition-all duration-300">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-zinc-900/20 rounded-[3rem] border border-zinc-900/50">
            <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 mb-2">
               <Heart className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Your watchlist is empty</h2>
              <p className="text-zinc-500 max-w-sm">Movies you heart on the exploration page will appear here for quick access.</p>
            </div>
            <Link href="/movies">
               <Button variant="default" className="bg-purple-600 hover:bg-purple-500 px-8 rounded-full h-12">Start Exploring</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
