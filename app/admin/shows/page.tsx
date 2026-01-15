"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Calendar, Plus, Clock, Film, Settings, Info, Ticket, Search, Save, X, Trash2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUser } from "@clerk/nextjs";

export default function ShowsPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [shows, setShows] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [theater, setTheater] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [filterMovie, setFilterMovie] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [formData, setFormData] = useState({
    movie: "",
    date: "",
    time: "",
    price: "",
    screenId: "",
  });

  const fetchData = async () => {
    try {
      const token = await getToken();
      
      // Fetch theater details
      const theaterRes = await fetch("http://localhost:5000/theaters/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const theaterData = await theaterRes.json();
      setTheater(theaterData);

      // Fetch shows
      const showsRes = await fetch("http://localhost:5000/shows/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const showsData = await showsRes.json();
      setShows(Array.isArray(showsData) ? showsData : []);

      // Fetch movies for selection (Only from organization collection)
      const moviesRes = await fetch("http://localhost:5000/organization-movies", {
         headers: { Authorization: `Bearer ${token}` }
      });
      const moviesData = await moviesRes.json();
      setMovies(Array.isArray(moviesData) ? moviesData.map((m: any) => m.movieId) : []);
      
    } catch (error) {
      console.error("Error fetching shows data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = await getToken();
      const response = await fetch("http://localhost:5000/shows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setModalOpen(false);
        setFormData({ movie: "", date: "", time: "", price: "", screenId: "" });
        fetchData();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to schedule show");
      }
    } catch (error) {
      console.error("Scheduling error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Filter Logic
  const filteredShows = shows.filter(show => {
    const matchesMovie = filterMovie ? show.movie?._id === filterMovie : true;
    const matchesDate = filterDate ? show.date === filterDate : true;
    return matchesMovie && matchesDate;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Show Scheduling</h1>
            <p className="text-zinc-500 text-sm mt-1">Manage movie screenings and theater allocations for <span className="text-purple-400 font-bold">{theater?.name}</span>.</p>
          </div>
          
          <Button 
            onClick={() => setModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-11 px-6 font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" /> Schedule New Show
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50">
            <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Filters</span>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            
            <select
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5 outline-none"
                value={filterMovie}
                onChange={(e) => setFilterMovie(e.target.value)}
            >
                <option value="">All Movies</option>
                {movies?.map((m: any) => ( // Using movies state from parent logic which is list of IDs? Wait, logic says movies stores IDs? 
                   // Let's check: setMovies(Array.isArray(moviesData) ? moviesData.map((m: any) => m.movieId) : []);
                   // Yes, 'movies' state is an array of Movie objects populated from OrganizationMovies.
                   <option key={m._id} value={m._id}>{m.title}</option>
                ))}
            </select>

            <Input 
                type="date"
                className="w-auto bg-zinc-900 border-zinc-800 text-zinc-300 h-10"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
            />

            {(filterMovie || filterDate) && (
                <Button 
                    variant="ghost" 
                    onClick={() => { setFilterMovie(""); setFilterDate(""); }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-10 px-3"
                >
                    <X className="w-4 h-4 mr-2" /> Reset
                </Button>
            )}
        </div>

        {/* Show List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShows.length > 0 ? filteredShows.map((show) => {
                const screen = theater?.screens?.find((s: any) => s._id === show.screenId);
                return (
                    <Card key={show._id} className="bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-all rounded-3xl overflow-hidden group">
                        <CardHeader className="p-6 pb-2">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2.5 py-1 bg-zinc-800/50 rounded-lg border border-zinc-800">
                                    {screen?.name || "Standard Hall"}
                                </span>
                                <div className="flex items-center gap-1.5 p-1 px-2.5 bg-emerald-500/10 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active</span>
                                </div>
                            </div>
                            <CardTitle className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                                {show.movie?.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-4 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Date & Time</p>
                                    <div className="flex items-center gap-2 text-zinc-300">
                                        <Clock className="w-4 h-4 text-purple-400" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold italic">{show.date}</span>
                                            <span className="text-[10px] font-medium text-zinc-500">{show.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-right">
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Price</p>
                                    <p className="text-lg font-black text-white">₹{show.price}</p>
                                </div>
                            </div>

                            <div className="pt-5 border-t border-zinc-800/50 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Ticket className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs font-bold text-zinc-400">{show.seats.filter((s:any) => s.status === 'booked').length} / {show.seats.length} booked</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            }) : (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-zinc-900 rounded-3xl">
                    <Calendar className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">No shows found matching your filters.</p>
                </div>
            )}
        </div>

        {/* Custom Modal */}
        {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                    <form onSubmit={handleSubmit}>
                        <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Schedule New Screening</h2>
                                <p className="text-zinc-500 text-xs mt-1">Configure movie, time and theater hall allocation.</p>
                            </div>
                            <Button type="button" onClick={() => setModalOpen(false)} variant="ghost" size="icon" className="rounded-xl hover:bg-zinc-800 text-zinc-500">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black px-1">Select Movie</Label>
                                <select 
                                    className="w-full h-12 bg-zinc-800/50 border border-zinc-800 focus:border-purple-500/50 rounded-xl text-white px-4 appearance-none outline-none transition-all text-sm"
                                    value={formData.movie}
                                    onChange={(e) => setFormData({...formData, movie: e.target.value})}
                                    required
                                >
                                    <option value="" disabled className="bg-zinc-900">Choose a movie...</option>
                                    {movies.map(m => <option key={m._id} value={m._id} className="bg-zinc-900">{m.title}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black px-1">Date</Label>
                                    <Input 
                                        type="date"
                                        className="h-12 bg-zinc-800/50 border-zinc-800 focus:border-purple-500/50 rounded-xl text-white"
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black px-1">Time</Label>
                                    <Input 
                                        type="time"
                                        className="h-12 bg-zinc-800/50 border-zinc-800 focus:border-purple-500/50 rounded-xl text-white"
                                        value={formData.time}
                                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black px-1">Allocate Screen</Label>
                                    <select 
                                        className="w-full h-12 bg-zinc-800/50 border border-zinc-800 focus:border-purple-500/50 rounded-xl text-white px-4 appearance-none outline-none transition-all text-sm"
                                        value={formData.screenId}
                                        onChange={(e) => setFormData({...formData, screenId: e.target.value})}
                                        required
                                    >
                                        <option value="" disabled className="bg-zinc-900">Select hall...</option>
                                        {theater?.screens?.map((s:any) => <option key={s._id} value={s._id} className="bg-zinc-900">{s.name} ({s.capacity} seats)</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black px-1">Price (₹)</Label>
                                    <Input 
                                        type="number"
                                        placeholder="250"
                                        className="h-12 bg-zinc-800/50 border-zinc-800 focus:border-purple-500/50 rounded-xl text-white"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-zinc-800/30 border-t border-zinc-800 flex justify-end gap-4 mt-4">
                            <Button type="button" onClick={() => setModalOpen(false)} variant="ghost" className="rounded-xl text-zinc-400 hover:bg-zinc-800 px-6 font-bold">
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={submitting}
                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 px-10 font-black shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
                            >
                                {submitting ? "Syncing..." : "Finalize Schedule"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}
