"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Search, Film } from "lucide-react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { useAuth, useUser } from "@clerk/nextjs";
import MovieCard from "@/components/admin/movies/MovieCard";
import AddMovieModal from "@/components/admin/movies/AddMovieModal";

export default function AdminMoviesPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [globalMovies, setGlobalMovies] = useState<any[]>([]);
  const [myCollection, setMyCollection] = useState<any[]>([]);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [editingMovie, setEditingMovie] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const token = await getToken();
      
      // 1. Fetch DB user to get role
      const userRes = await fetch("http://localhost:5000/users/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user?.id })
      });
      const userData = await userRes.json();
      setDbUser(userData);

      // 2. Fetch global movies
      const globalRes = await fetch("http://localhost:5000/movies", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const globalData = await globalRes.json();
      setGlobalMovies(Array.isArray(globalData) ? globalData : []);

      // 3. Fetch my organization collection if theater admin
      if (userData.role === 'admin') {
        const myRes = await fetch("http://localhost:5000/organization-movies", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const myData = await myRes.json();
        setMyCollection(Array.isArray(myData) ? myData.map(m => m.movieId._id) : []);
      }

    } catch (error) {
      console.error("Error fetching movies catalog:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const addToCollection = async (movieId: string) => {
    setAddingId(movieId);
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:5000/organization-movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId }),
      });

      if (response.ok) {
        setMyCollection([...myCollection, movieId]);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to add movie");
      }
    } catch (error) {
      console.error("Error adding movie:", error);
    } finally {
      setAddingId(null);
    }
  };

  // New functions for edit/delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;
    try {
        const token = await getToken();
        await api.delete(`/movies/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchData(); // Re-fetch data after deletion
    } catch (error) {
        console.error("Error deleting movie:", error);
        alert("Failed to delete movie");
    }
  };

  const handleEdit = (movie: any) => {
    setEditingMovie(movie);
    setIsEditModalOpen(true);
  };

  const handleMovieUpdated = () => {
    fetchData(); // Re-fetch data after update
    setEditingMovie(null);
    setIsEditModalOpen(false); // Close modal after update
  };
    
  const isSuperAdmin = dbUser?.role === "super_admin";
  const filteredMovies = globalMovies.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
                {isSuperAdmin ? "Global " : "Movie "} 
                <span className="text-purple-500 italic">{isSuperAdmin ? "Catalog" : "Library"}</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-bold">
                {isSuperAdmin 
                    ? "Manage the platform's shared movie database." 
                    : "Browse and curate your theater's movie collection."}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                <Input 
                  placeholder="Search movies..." 
                  className="pl-12 h-12 bg-zinc-900/50 border-zinc-800 rounded-2xl focus:ring-purple-500/20 w-48 md:w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            {isSuperAdmin && <AddMovieModal onMovieAdded={fetchData} />}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard 
              key={movie._id}
              movie={movie}
              isAdded={myCollection.includes(movie._id)}
              isSuperAdmin={isSuperAdmin}
              onAdd={addToCollection}
              addingId={addingId}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-50">
            <Film className="w-16 h-16 text-zinc-800 mb-6" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest">No movies found in catalog.</p>
          </div>
        )}

        {/* Edit Modal */}
        <AddMovieModal 
            open={isEditModalOpen} 
            onOpenChange={(open) => {
                setIsEditModalOpen(open);
                if (!open) setEditingMovie(null);
            }}
            movieToEdit={editingMovie} 
            onMovieAdded={handleMovieUpdated} 
        />
      </div>
    </DashboardLayout>
  );
}
