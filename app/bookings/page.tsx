"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { Ticket, Calendar, Clock, Armchair, Loader2, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useSearchParams } from "next/navigation";

interface Movie {
  title: string;
  posterImage?: string;
}

interface Theater {
  name: string;
  location: string;
}

interface Show {
  _id: string;
  movie: Movie;
  theater: Theater;
  date: string;
  time: string;
}

interface Booking {
  _id: string;
  show: Show;
  seats: string[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

import { Suspense } from "react";

function BookingsList() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("order_id");
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);

  const fetchData = async (page = currentPage) => {
    try {
        const token = await getToken();
        
        // 1. If order_id exists in URL, verify it first (only on first page load)
        if (orderIdParam && page === 1) {
          setVerifying(true);
          try {
            await axios.post(
              "http://localhost:5000/bookings/verify",
              { orderId: orderIdParam },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (err) {
            console.error("Auto-verification error:", err);
          } finally {
            setVerifying(false);
          }
        }

        // 2. Fetch all bookings with pagination
        const response = await axios.get(`http://localhost:5000/bookings/user?page=${page}&limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(response.data.bookings);
        setTotalPages(response.data.totalPages || 1);
        setTotalBookings(response.data.totalBookings || 0);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchData();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, getToken, orderIdParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 px-6 flex flex-col items-center justify-center space-y-4">
        <Ticket className="w-16 h-16 text-zinc-700" />
        <h1 className="text-2xl font-bold">Please sign in</h1>
        <p className="text-zinc-500 text-center max-w-sm">
          You need to be signed in to view your movie bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-40 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* VERIFICATION BANNER */}
        {verifying && (
          <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
            <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
            <p className="text-sm font-medium text-purple-300">
              Verifying your payment status, please wait...
            </p>
          </div>
        )}

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-2xl shadow-purple-500/10">
              <Ticket className="w-7 h-7 text-purple-500" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">My Bookings</h1>
              <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mt-1">
                Tickets & Reservations
              </p>
            </div>
          </div>
          <div className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-zinc-400 text-sm font-medium">
            {totalBookings} Total
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-16 text-center space-y-6 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-zinc-800/30 flex items-center justify-center mb-2">
               <Ticket className="w-10 h-10 text-zinc-600" />
            </div>
            <div className="space-y-2">
              <p className="text-zinc-300 text-2xl font-bold">No tickets yet</p>
              <p className="text-zinc-500 max-w-xs mx-auto">Your future movie tickets will appear here once you've made a booking.</p>
            </div>
            <Button asChild className="bg-purple-600 hover:bg-purple-500 px-8 py-6 rounded-2xl text-lg font-bold group">
              <Link href="/movies">
                Browse Movies
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div 
                key={booking._id} 
                className="group relative bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] overflow-hidden hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/5"
              >
                <div className="p-8 flex flex-col md:flex-row gap-8">
                  
                  {/* MOVIE INFO */}
                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider border border-purple-500/20">
                          {booking.status}
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold tracking-tight group-hover:text-purple-400 transition-colors uppercase">
                        {booking.show.movie.title}
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                               <p className="text-xs text-zinc-500 uppercase font-black tracking-widest">Cinema</p>
                               <p className="text-sm font-semibold text-zinc-200">{booking.show.theater.name}</p>
                               <p className="text-xs text-zinc-500">{booking.show.theater.location}</p>
                            </div>
                         </div>
                         <div className="flex items-start gap-4">
                            <Ticket className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                               <p className="text-xs text-zinc-500 uppercase font-black tracking-widest">Seats</p>
                               <p className="text-sm font-bold text-purple-400">
                                  {booking.seats.join(", ")}
                               </p>
                               <p className="text-xs text-zinc-500">{booking.seats.length} Tickets</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-start gap-4">
                            <Calendar className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                               <p className="text-xs text-zinc-500 uppercase font-black tracking-widest">Date</p>
                               <p className="text-sm font-semibold text-zinc-200">
                                  {new Date(booking.show.date).toLocaleDateString("en-US", {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                               </p>
                            </div>
                         </div>
                         <div className="flex items-start gap-4">
                            <Clock className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                               <p className="text-xs text-zinc-500 uppercase font-black tracking-widest">Showtime</p>
                               <p className="text-sm font-semibold text-zinc-200">{booking.show.time}</p>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* PRICE & TICKET DESIGN */}
                  <div className="md:w-48 flex flex-col justify-between items-end border-l border-zinc-800/50 md:pl-8 pt-6 md:pt-0">
                    <div className="text-right space-y-1">
                      <p className="text-xs text-zinc-500 uppercase font-black tracking-widest">Amount Paid</p>
                      <p className="text-3xl font-black text-white">₹{booking.totalAmount}</p>
                    </div>
                    
                    <div className="w-full flex flex-col gap-3">
                       <div className="w-full h-12 flex items-center justify-between px-4 bg-zinc-800/50 rounded-xl border border-white/5 overflow-hidden">
                          <div className="flex gap-1">
                             {[...Array(8)].map((_, i) => (
                               <div key={i} className="w-1 h-1 rounded-full bg-zinc-700" />
                             ))}
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">BKM-0{booking._id.slice(-4).toUpperCase()}</span>
                       </div>
                    </div>
                  </div>

                </div>
                
                {/* DECORATIVE DOTS */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 bg-[#0a0a0a] rounded-full border border-zinc-800/50 hidden md:block" />
                <div className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 bg-[#0a0a0a] rounded-full border border-zinc-800/50 hidden md:block" />
              </div>
            ))}
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

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    }>
      <BookingsList />
    </Suspense>
  );
}
