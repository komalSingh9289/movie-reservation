"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Ticket, Calendar, User, Search, Filter, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs";

export default function AdminBookings() {
    const { getToken } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = await getToken();
                const res = await fetch("http://localhost:5000/bookings/theater", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setBookings(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [getToken]);

    const filteredBookings = bookings.filter(b => 
        b.show?.movie?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.userId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Theater Bookings</h1>
                        <p className="text-zinc-500 text-sm mt-1">Monitor and manage all ticket reservations for your venue.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input 
                            placeholder="Search by movie or user ID..."
                            className="pl-10 h-11 bg-zinc-900/50 border-zinc-800 rounded-xl text-white focus:border-purple-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
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
                                                    User: {booking.userId.slice(-6).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center md:items-end gap-6 md:gap-1 pl-6 border-l border-zinc-900">
                                            <div className="text-right">
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total Amount</p>
                                                <p className="text-xl font-black text-white">₹{booking.totalAmount}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Seats</p>
                                                <p className="text-sm font-bold text-purple-400">{booking.seats.join(", ")}</p>
                                            </div>
                                        </div>

                                        <Button variant="ghost" size="icon" className="shrink-0 text-zinc-700 group-hover:text-white group-hover:bg-zinc-800 transition-all">
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
            </div>
        </DashboardLayout>
    );
}
