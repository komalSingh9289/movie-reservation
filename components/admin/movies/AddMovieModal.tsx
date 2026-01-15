"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, Image as ImageIcon, Film, Globe, Clock, Calendar } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import api from "@/lib/axios";

interface AddMovieModalProps {
  onMovieAdded: () => void;
  movieToEdit?: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AddMovieModal({ onMovieAdded, movieToEdit, open: controlledOpen, onOpenChange }: AddMovieModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const isControlled = typeof controlledOpen !== "undefined";
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;
  
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    poster: "",
    duration: "",
    language: "English",
    category: "",
    releaseDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const token = await getToken();
            const res = await api.get("/categories", {
                 headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };
    if (open) fetchCategories();
  }, [open, getToken]);

  useEffect(() => {
    if (movieToEdit) {
      setFormData({
        title: movieToEdit.title || "",
        description: movieToEdit.description || "",
        poster: movieToEdit.poster || "",
        duration: movieToEdit.duration || "",
        language: movieToEdit.language || "English",
        category: movieToEdit.category || "",
        releaseDate: movieToEdit.releaseDate ? new Date(movieToEdit.releaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
        setFormData({
            title: "",
            description: "",
            poster: "",
            duration: "",
            language: "English",
            category: "",
            releaseDate: new Date().toISOString().split('T')[0]
        });
    }
  }, [movieToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      
      let response;
      if (movieToEdit) {
        response = await api.put(`/movies/${movieToEdit._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await api.post("/movies", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (response.status === 200 || response.status === 201) {
        setOpen(false);
        onMovieAdded();
        if (!movieToEdit) {
            setFormData({
                title: "",
                description: "",
                poster: "",
                duration: "",
                language: "English",
                category: "",
                releaseDate: new Date().toISOString().split('T')[0]
            });
        }
      }
    } catch (error: any) {
      console.error("Error saving movie:", error);
      alert(error.response?.data?.message || "Failed to save movie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-purple-600/20 active:scale-95">
            <Plus className="w-4 h-4 mr-2" /> Add Global Movie
            </Button>
        </DialogTrigger>
      )}
      <DialogContent className="bg-zinc-950 border-zinc-900 sm:max-w-[500px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-white tracking-tighter">
            {movieToEdit ? "Edit" : "Add"} <span className="text-purple-500">Movie</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="relative group">
                <Film className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                    placeholder="Movie Title"
                    required
                    className="pl-12 h-14 bg-zinc-900/50 border-zinc-800 rounded-2xl focus:ring-purple-500/20 text-white font-medium"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
            </div>

            <Textarea
                placeholder="Description"
                required
                className="bg-zinc-900/50 border-zinc-800 rounded-2xl focus:ring-purple-500/20 text-white font-medium min-h-[100px] p-4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="relative group">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                    placeholder="Poster URL"
                    required
                    className="pl-12 h-14 bg-zinc-900/50 border-zinc-800 rounded-2xl focus:ring-purple-500/20 text-white font-medium"
                    value={formData.poster}
                    onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                        placeholder="Duration (e.g. 2h 30m)"
                        required
                        className="pl-12 h-14 bg-zinc-900/50 border-zinc-800 rounded-2xl focus:ring-purple-500/20 text-white font-medium"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                </div>
                <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                        placeholder="Language"
                        required
                        className="pl-12 h-14 bg-zinc-900/50 border-zinc-800 rounded-2xl focus:ring-purple-500/20 text-white font-medium"
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    />
                </div>
            </div>

            <div className="relative group">
                 {/* Category Select */}
                 <div className="relative">
                    <select
                        className="w-full h-14 bg-zinc-900/50 border-zinc-800 rounded-2xl focus:ring-purple-500/20 text-white font-medium pl-4 appearance-none"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                    >
                        <option value="" disabled className="text-zinc-500">Select Category</option>
                        {categories.map((cat: any) => (
                            <option key={cat._id} value={cat._id} className="bg-zinc-900 text-white">
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                    type="date"
                    required
                    className="pl-12 h-14 bg-zinc-900/50 border-zinc-800 rounded-2xl focus:ring-purple-500/20 text-white font-medium"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-purple-600/20 active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (movieToEdit ? "Update Movie" : "Create Global Movie")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
