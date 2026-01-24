"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Ticket, Calendar, User, Search, Filter, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs";
import Pagination from "@/components/ui/pagination";
import { X, User as UserIcon, Building, CreditCard, Clock as ClockIcon, Armchair } from "lucide-react";

export default function AdminBookings() {
    const { getToken } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterMovie, setFilterMovie] = useState("");
    const [movies, setMovies] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBookings, setTotalBookings] = useState(0);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

    const fetchData = async (page = currentPage) => {
        try {
            const token = await getToken();
            
            // Fetch bookings with pagination
            const bookingsRes = await fetch(`http://localhost:5000/bookings/theater?page=${page}&limit=5`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const bookingsData = await bookingsRes.json();
            setBookings(Array.isArray(bookingsData.bookings) ? bookingsData.bookings : []);
            setTotalPages(bookingsData.totalPages || 1);
            setTotalBookings(bookingsData.totalBookings || 0);

            // Fetch movies for filter
            const moviesRes = await fetch("http://localhost:5000/organization-movies", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const moviesData = await moviesRes.json();
            setMovies(Array.isArray(moviesData) ? moviesData.map((m: any) => m.movieId) : []);

        } catch (error) {
            console.error("Error fetching admin bookings data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [getToken]);

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.show?.movie?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             b.userId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMovie = filterMovie ? b.show?.movie?._id === filterMovie : true;
        const matchesDate = filterDate ? b.show?.date === filterDate : true;
        
        return matchesSearch && matchesMovie && matchesDate;
    });

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Theater Bookings</h1>
                        <p className="text-zinc-500 text-sm mt-1">Monitor and manage all ticket reservations for your venue.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input 
                            placeholder="Search by movie or user ID..."
                            className="pl-10 h-11 bg-zinc-900/50 border-zinc-800 rounded-xl text-white focus:border-purple-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <select
                        className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block p-2.5 outline-none h-11"
                        value={filterMovie}
                        onChange={(e) => setFilterMovie(e.target.value)}
                    >
                        <option value="">All Movies</option>
                        {movies.map((m: any) => (
                            <option key={m._id} value={m._id}>{m.title}</option>
                        ))}
                    </select>

                    <Input 
                        type="date"
                        className="w-auto bg-zinc-900 border-zinc-800 text-zinc-300 h-11 rounded-xl"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />

                    {(searchTerm || filterMovie || filterDate) && (
                        <Button 
                            variant="ghost" 
                            onClick={() => { setSearchTerm(""); setFilterMovie(""); setFilterDate(""); }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-11 px-4 rounded-xl"
                        >
                            Reset
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                            <Card key={booking._id} className="bg-zinc-900/40 border-zinc-900 hover:border-zinc-800 transition-all rounded-2xl overflow-hidden group">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row items-center gap-6 p-6">
                                        <div className="h-20 w-14 bg-zinc-800 rounded-lg overflow-hidden shrink-0 border border-zinc-800/50">
                                            {booking.show?.movie?.poster ? (
                                                <img src={booking.show.movie.poster} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Ticket className="w-6 h-6 text-zinc-700" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <h3 className="text-lg font-bold text-white truncate">{booking.show?.movie?.title || "Unknown Movie"}</h3>
                                            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 font-medium">
                                                <span className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded-md">
                                                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                                                    {booking.show?.date} • {booking.show?.time}
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded-md">
                                                    <User className="w-3.5 h-3.5 text-blue-400" />
                                                    User: {booking.userName || booking.userId.slice(-6).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center md:items-end gap-6 md:gap-1 pl-6 border-l border-zinc-900">
                                            <div className="text-right">
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total Amount</p>
                                                <p className="text-xl font-black text-white">₹{booking.totalAmount}</p>
                                            </div>
                                             <div className="text-right">
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Seats & Screen</p>
                                                <p className="text-sm font-bold text-purple-400">
                                                    {booking.show?.theater?.screens?.find((s:any) => s._id === booking.show.screenId)?.name || 'Main Screen'} 
                                                    <span className="text-zinc-600 font-medium ml-1.5">• {booking.seats.join(", ")}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => setSelectedBooking(booking)}
                                            className="shrink-0 text-zinc-700 group-hover:text-white group-hover:bg-zinc-800 transition-all"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border-2 border-dashed border-zinc-900/50">
                            <Ticket className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                            <p className="text-zinc-500 font-medium">No bookings found matching your criteria.</p>
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

                {/* Booking Details Modal */}
                {selectedBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Booking Details</h2>
                                    <p className="text-zinc-500 text-xs mt-1 font-bold tracking-widest uppercase">ID: {selectedBooking._id}</p>
                                </div>
                                <Button onClick={() => setSelectedBooking(null)} variant="ghost" size="icon" className="rounded-full hover:bg-zinc-800 text-zinc-500">
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Section: Movie & Show */}
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-28 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-800 shrink-0">
                                            {selectedBooking.show?.movie?.poster && (
                                                <img src={selectedBooking.show.movie.poster} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-white uppercase">{selectedBooking.show?.movie?.title}</h3>
                                            <p className="text-sm font-medium text-purple-400">{selectedBooking.show?.movie?.category?.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {selectedBooking.show?.date}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <ClockIcon className="w-3.5 h-3.5" />
                                                {selectedBooking.show?.time}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-zinc-800/30 rounded-2xl space-y-3">
                                        <div className="flex items-center gap-3">
                                            <UserIcon className="w-4 h-4 text-blue-400" />
                                            <div>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Customer Name</p>
                                                <p className="text-xs font-bold text-zinc-200">{selectedBooking.userName || selectedBooking.userId}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Armchair className="w-4 h-4 text-emerald-400" />
                                            <div>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Screen & Seats</p>
                                                <p className="text-xs font-bold text-white">
                                                    {selectedBooking.show?.theater?.screens?.find((s:any) => s._id === selectedBooking.show.screenId)?.name || 'Standard Screen'}
                                                    {' • '}
                                                    <span className="text-emerald-400">{selectedBooking.seats?.join(", ")}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Payment & Stats */}
                                <div className="space-y-6">
                                    <div className="p-6 bg-zinc-800/30 rounded-3xl border border-zinc-800/50 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Status</p>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                selectedBooking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                                selectedBooking.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                                                'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                                {selectedBooking.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Amount Paid</p>
                                            <p className="text-2xl font-black text-white">₹{selectedBooking.totalAmount}</p>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Order ID</p>
                                            <p className="text-xs font-mono text-zinc-400">{selectedBooking.orderId}</p>
                                        </div>
                                        {selectedBooking.cfOrderId && (
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Gateway Ref</p>
                                                <p className="text-[10px] font-mono text-zinc-500">{selectedBooking.cfOrderId}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-2">Booked On</p>
                                        <div className="flex items-center gap-2 px-2 text-xs text-zinc-400">
                                            <ClockIcon className="w-3.5 h-3.5" />
                                            {new Date(selectedBooking.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-8 bg-zinc-800/30 border-t border-zinc-800 flex justify-end">
                                <Button onClick={() => setSelectedBooking(null)} className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl h-12 px-8 font-bold">
                                    Close Details
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
