"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Search, Film } from "lucide-react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { useAuth, useUser } from "@clerk/nextjs";
import MovieCard from "@/components/admin/movies/MovieCard";
import AddMovieModal from "@/components/admin/movies/AddMovieModal";
import { toast } from "react-toastify";
import Pagination from "@/components/ui/pagination";

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
  const [filterStatus, setFilterStatus] = useState<"all" | "added" | "not-added">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);

  const fetchData = async (page = currentPage) => {
    try {
      const token = await getToken();
      
      // 1. Fetch DB user to get role
      const userRes = await api.post("users/sync", { clerkId: user?.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = userRes.data;
      setDbUser(userData);

      // 2. Fetch global movies with pagination
      const globalRes = await api.get(`movies?page=${page}&limit=12`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const globalData = globalRes.data;
      setGlobalMovies(Array.isArray(globalData.movies) ? globalData.movies : []);
      setTotalPages(globalData.totalPages || 1);
      setTotalMovies(globalData.totalMovies || 0);

      // 3. Fetch my organization collection if theater admin
      if (userData.role === 'admin') {
        const myRes = await api.get("organization-movies", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const myData = myRes.data;
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
      const response = await api.post("organization-movies", { movieId }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMyCollection([...myCollection, movieId]);
      toast.success("Movie added to collection!");
    } catch (error) {
      console.error("Error adding movie:", error);
      toast.error(error.response?.data?.message || "Failed to add movie");
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
        toast.error("Failed to delete movie");
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
  
  const filteredMovies = globalMovies.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isAdded = myCollection.includes(m._id);
    
    if (filterStatus === "added") return matchesSearch && isAdded;
    if (filterStatus === "not-added") return matchesSearch && !isAdded;
    return matchesSearch;
  });

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
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
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

        {!isSuperAdmin && (
          <div className="flex items-center gap-2 bg-zinc-900/40 p-1.5 rounded-2xl w-fit border border-zinc-800/50">
            <button 
              onClick={() => setFilterStatus("all")}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === 'all' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              All Movies
            </button>
            <button 
              onClick={() => setFilterStatus("added")}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === 'added' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              In Library
            </button>
            <button 
              onClick={() => setFilterStatus("not-added")}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === 'not-added' ? 'bg-zinc-800 text-white shadow-lg shadow-black/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Not Added
            </button>
          </div>
        )}

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

        <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
                setCurrentPage(page);
                fetchData(page);
            }}
        />

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
