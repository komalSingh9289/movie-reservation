"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Search, Loader2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

// Define Movie Interface matching backend response
interface Movie {
  _id: string;
  title: string;
  poster: string;
  category: {
    _id: string;
    name: string;
  };
  duration: string;
  rating?: number;
  description: string;
}

export default function MoviesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);
  const { getToken, isSignedIn } = useAuth();

  const fetchData = async (page = currentPage) => {
    try {
      setLoading(true);
      const token = isSignedIn ? await getToken() : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [moviesRes, categoriesRes, favoritesRes] = await Promise.all([
        axios.get(`http://localhost:5000/movies?showingOnly=true&page=${page}&limit=12`),
        axios.get("http://localhost:5000/categories"),
        isSignedIn 
          ? axios.get("http://localhost:5000/users/favorites", { headers }).catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] })
      ]);

      setMovies(moviesRes.data.movies);
      setTotalPages(moviesRes.data.totalPages || 1);
      setTotalMovies(moviesRes.data.totalMovies || 0);
      setFavorites(favoritesRes.data.map((f: any) => f._id));
      
      if (categoriesRes.data && Array.isArray(categoriesRes.data)) {
         const categoryNames = categoriesRes.data.map((c: any) => c.name);
         setCategories(["All", ...categoryNames]);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isSignedIn, getToken]);

  const filteredMovies = movies.filter(movie => {
    const matchesCategory = activeCategory === "All" || (movie.category && movie.category.name === activeCategory); 
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = async (movieId: string) => {
    if (!isSignedIn) {
      alert("Please sign in to add movies to your watchlist");
      return;
    }
    try {
      setTogglingFavorite(movieId);
      const token = await getToken();
      const res = await axios.post(`http://localhost:5000/users/favorites/${movieId}`, {}, {
         headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data.favorites);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setTogglingFavorite(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Explore <span className="text-purple-500">Movies</span>
          </h1>
          <p className="text-zinc-400 max-w-xl text-lg">
            Discover the latest blockbusters and timeless classics. Book your tickets now for an unforgettable experience.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between py-8 border-y border-zinc-800/50">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeCategory === cat 
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all"
            />
          </div>
        </div>

        {/* Movie Grid */}
        {loading ? (
           <div className="flex justify-center items-center py-32">
             <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
           </div>
        ) : filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredMovies.map((movie) => (
              <div key={movie._id} className="group relative flex flex-col bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1.5">
                <div className="overflow-hidden relative aspect-[1/1]">
                  <img 
                    src={movie.poster} 
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold flex items-center gap-1">
                    <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                    {movie.rating || "8.5"}
                  </div>
                  <button 
                    onClick={() => toggleFavorite(movie._id)}
                    disabled={togglingFavorite === movie._id}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-colors z-10"
                  >
                    <Heart className={cn("h-3.5 w-3.5", favorites.includes(movie._id) ? "fill-red-500 text-red-500" : "text-white")} />
                  </button>
                </div>
                
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">{movie.category?.name || "Action"}</span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {movie.duration}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold group-hover:text-purple-400 transition-colors line-clamp-1">{movie.title}</h3>
                  
                  <Link href={`/movies/${movie._id}`} className="block pt-1">
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs bg-zinc-800 hover:bg-purple-600 hover:text-white transition-colors">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="inline-flex h-16 w-16 rounded-full bg-zinc-900 items-center justify-center">
              <Search className="h-8 w-8 text-zinc-700" />
            </div>
            <p className="text-zinc-500 text-lg">No movies found matching your criteria.</p>
            <Button variant="link" onClick={() => {setActiveCategory("All"); setSearchQuery("");}} className="text-purple-400">
              Clear all filters
            </Button>
          </div>
        )}

        <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
                setCurrentPage(page);
                fetchData(page);
            }}
        />
      </div>
    </div>
  );
}

import Pagination from "@/components/ui/pagination";

