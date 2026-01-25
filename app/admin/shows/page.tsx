"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Calendar, Plus, Clock, Film, Settings, Info, Ticket, Search, Save, X, Trash2, SlidersHorizontal, Edit2, Archive, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import Pagination from "@/components/ui/pagination";
import api from "@/lib/axios";

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
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "archived">("all");

  const [formData, setFormData] = useState({
    movie: "",
    date: "",
    time: "",
    price: "",
    screenId: "",
  });

  const [editingShowId, setEditingShowId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalShows, setTotalShows] = useState(0);

  const fetchData = async (page = currentPage) => {
    try {
      const token = await getToken();
      
      // Fetch theater details
      const theaterRes = await api.get("theaters/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const theaterData = theaterRes.data;
      console.log(theaterData);
      setTheater(theaterData);

      // Fetch shows with pagination
      const showsRes = await api.get(`shows/me?page=${page}&limit=9`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const showsData = showsRes.data;
      setShows(Array.isArray(showsData.shows) ? showsData.shows : []);
      setTotalPages(showsData.totalPages || 1);
      setTotalShows(showsData.totalShows || 0);

      // Fetch movies for selection (Only from organization collection)
      const moviesRes = await api.get("organization-movies", {
         headers: { Authorization: `Bearer ${token}` }
      });
      const moviesData = moviesRes.data;
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
      const url = editingShowId 
        ? `shows/${editingShowId}`
        : "shows";
      
      const response = await api({
        method: editingShowId ? "PUT" : "POST",
        url,
        data: formData,
        headers: { Authorization: `Bearer ${token}` }
      });

      setModalOpen(false);
      setEditingShowId(null);
      setFormData({ movie: "", date: "", time: "", price: "", screenId: "" });
      toast.success(editingShowId ? "Show updated successfully!" : "Show scheduled successfully!");
      // Fetch data after a short delay to ensure DB sync
      setTimeout(() => fetchData(), 500);
    } catch (error) {
      console.error("Error saving show:", error);
      toast.error(error.response?.data?.message || "Failed to save show");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (show: any) => {
    setEditingShowId(show._id);
    setFormData({
        movie: show.movie?._id,
        date: show.date,
        time: show.time,
        price: show.price.toString(),
        screenId: show.screenId
    });
    setModalOpen(true);
  };

  const handleCancelShow = async (showId: string) => {
    if (!statusConfirm("Are you sure you want to cancel this show? This will mark it as CANCELLED.")) return;
    try {
        const token = await getToken();
        const res = await api.patch(`shows/${showId}/cancel`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Show cancelled successfully");
        fetchData();
    } catch (error) {
        console.error("Error cancelling show:", error);
        toast.error(error.response?.data?.message || "Error cancelling show");
    }
  };

  const handleArchiveShow = async (showId: string) => {
    try {
        const token = await getToken();
        const res = await api.patch(`shows/${showId}/archive`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Show archived successfully");
        fetchData();
    } catch (error) {
        console.error("Error archiving show:", error);
        toast.error(error.response?.data?.message || "Failed to archive show");
    }
  };

  const handleDelete = async (showId: string) => {
    if (!statusConfirm(`Are you sure you want to delete this show? This action cannot be undone.`)) return;
    
    try {
      const token = await getToken();
      const response = await api.delete(`shows/${showId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Show deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Deletion error:", error);
      toast.error(error.response?.data?.message || "Failed to delete show");
    }
  };

  // Helper because confirm is not defined in some SSR environments (though this is 'use client')
  function statusConfirm(msg: string) {
    return window.confirm(msg);
  }

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
    const showStatusFilter = (show: any) => {
        const [year, month, day] = show.date.split('-').map(Number);
        const [hour, minute] = show.time.split(':').map(Number);
        const showDateTime = new Date(year, month - 1, day, hour, minute);
        const isExpired = showDateTime < new Date();
        return isExpired;
    };

    const filteredShows = shows.filter(show => {
        const matchesMovie = filterMovie ? show.movie?._id === filterMovie : true;
        const matchesDate = filterDate ? show.date === filterDate : true;
        
        const isExpired = showStatusFilter(show);
        
        // Filter logic updated to be clearer
        if (filterStatus === "archived") {
            return matchesMovie && matchesDate && show.status === "ARCHIVED";
        }
        
        if (filterStatus === "active") {
            return matchesMovie && matchesDate && !isExpired && show.status === "ACTIVE";
        }

        if (filterStatus === "inactive") {
            return matchesMovie && matchesDate && (isExpired || show.status === "CANCELLED");
        }

        // 'all' shows everything except archived by default
        return matchesMovie && matchesDate && show.status !== "ARCHIVED";
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

            {(filterMovie || filterDate || filterStatus !== "all") && (
                <Button 
                    variant="ghost" 
                    onClick={() => { setFilterMovie(""); setFilterDate(""); setFilterStatus("all"); }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-10 px-3"
                >
                    <X className="w-4 h-4 mr-2" /> Reset
                </Button>
            )}

            <div className="ml-auto flex items-center gap-1.5 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800">
                <button 
                  onClick={() => setFilterStatus("all")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilterStatus("active")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Active
                </button>
                <button 
                  onClick={() => setFilterStatus("inactive")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'inactive' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Inactive
                </button>
                <button 
                  onClick={() => setFilterStatus("archived")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'archived' ? 'bg-zinc-800 text-purple-400 border border-purple-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Archived
                </button>
            </div>
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
                                {(() => {
                                    const showDate = new Date(show.date);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const isExpired = showDate < today;
                                    
                                    let statusConfig = {
                                        label: "Active",
                                        colors: "bg-emerald-500/10 text-emerald-400",
                                        dot: "bg-emerald-500 animate-pulse"
                                    };

                                    if (show.status === "CANCELLED") {
                                        statusConfig = { label: "Cancelled", colors: "bg-orange-500/10 text-orange-400", dot: "bg-orange-500" };
                                    } else if (show.status === "ARCHIVED") {
                                        statusConfig = { label: "Archived", colors: "bg-zinc-500/10 text-zinc-400", dot: "bg-zinc-500" };
                                    } else if (isExpired) {
                                        statusConfig = { label: "Inactive", colors: "bg-red-500/10 text-red-400", dot: "bg-red-500" };
                                    }
                                    
                                    return (
                                        <div className={`flex items-center gap-1.5 p-1 px-2.5 rounded-full ${statusConfig.colors}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-widest`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    );
                                })()}
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
                                    <span className="text-xs font-bold text-zinc-400">
                                        {(show.seats || []).filter((s:any) => s.status === 'BOOKED' || s.status === 'booked' || s.status?.toUpperCase() === 'BOOKED').length} / {show.seats?.length || 0} booked
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {(() => {
                                        const isExpired = showStatusFilter(show);
                                        const todayStr = new Date().toISOString().split('T')[0];
                                        const isUpcomingOrToday = show.date >= todayStr;
                                        
                                        // Edit/Cancel available for active shows that are upcoming or today
                                        const canEditCancel = isUpcomingOrToday && show.status === "ACTIVE";
                                        // Delete available for any show that is upcoming/today (even if cancelled)
                                        const canDelete = isUpcomingOrToday && show.status !== "ARCHIVED";

                                        return (
                                            <>
                                                {canEditCancel && (
                                                    <>
                                                        <Button 
                                                            variant="ghost" size="icon" 
                                                            onClick={() => handleEdit(show)}
                                                            className="h-8 w-8 text-zinc-500 hover:text-purple-400 rounded-lg"
                                                            title="Edit Show"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" size="icon" 
                                                            onClick={() => handleCancelShow(show._id)}
                                                            className="h-8 w-8 text-zinc-500 hover:text-orange-400 rounded-lg"
                                                            title="Cancel Show"
                                                        >
                                                            <Ban className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </>
                                                )}
                                                {canDelete && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDelete(show._id)}
                                                        className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                                                        title="Delete Permanently"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                                {isExpired && show.status !== "ARCHIVED" && (
                                                    <Button 
                                                        variant="ghost" size="icon" 
                                                        onClick={() => handleArchiveShow(show._id)}
                                                        className="h-8 w-8 text-zinc-500 hover:text-blue-400 rounded-lg"
                                                        title="Archive Show"
                                                    >
                                                        <Archive className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                                {show.status === "ARCHIVED" && (
                                                     <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDelete(show._id)}
                                                        className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                                                        title="Delete Permanently"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
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

        <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
                setCurrentPage(page);
                fetchData(page);
            }}
        />

        {/* Custom Modal */}
        {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                    <form onSubmit={handleSubmit}>
                        <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">{editingShowId ? "Update Screening" : "Schedule New Screening"}</h2>
                                <p className="text-zinc-500 text-xs mt-1">Configure movie, time and theater hall allocation.</p>
                            </div>
                            <Button type="button" onClick={() => { setModalOpen(false); setEditingShowId(null); }} variant="ghost" size="icon" className="rounded-xl hover:bg-zinc-800 text-zinc-500">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black px-1">Select Movie</Label>
                                <select 
                                    className="w-full h-12 bg-zinc-800/50 border border-zinc-800 focus:border-purple-500/50 rounded-xl text-white px-4 appearance-none outline-none transition-all text-sm disabled:opacity-50"
                                    value={formData.movie}
                                    onChange={(e) => setFormData({...formData, movie: e.target.value})}
                                    required
                                    disabled={!!editingShowId}
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
                                        className="w-full h-12 bg-zinc-800/50 border border-zinc-800 focus:border-purple-500/50 rounded-xl text-white px-4 appearance-none outline-none transition-all text-sm disabled:opacity-50"
                                        value={formData.screenId}
                                        onChange={(e) => setFormData({...formData, screenId: e.target.value})}
                                        required
                                        disabled={!!editingShowId}
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
                            <Button type="button" onClick={() => { setModalOpen(false); setEditingShowId(null); }} variant="ghost" className="rounded-xl text-zinc-400 hover:bg-zinc-800 px-6 font-bold">
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={submitting}
                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 px-10 font-black shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
                            >
                                {submitting ? "Syncing..." : (editingShowId ? "Update Schedule" : "Finalize Schedule")}
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
