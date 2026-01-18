"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Loader2, Armchair, ChevronLeft } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

interface Movie {
  _id: string;
  title: string;
  poster: string;
}

interface Show {
  _id: string;
  date: string;
  time: string;
  price: number;
  theater: { name: string; location: string };
  seats: { seatNumber: string; status: string }[];
}

export default function BookingPage() {
  const { id, showId } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [show, setShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [booking, setBooking] = useState(false);
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [movieRes, showRes] = await Promise.all([
          axios.get(`http://localhost:5000/movies/${id}`),
          axios.get(`http://localhost:5000/shows/${showId}`)
        ]);
        setMovie(movieRes.data);
        setShow(showRes.data);
      } catch (error) {
        console.error("Error fetching booking data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id && showId) fetchData();
  }, [id, showId]);

  const handleSeatClick = (seatNumber: string, status: string) => {
    if (status !== "available") return;
    setSelectedSeats(prev => 
      prev.includes(seatNumber) 
        ? prev.filter(s => s !== seatNumber) 
        : [...prev, seatNumber]
    );
  };

  const handleBooking = async () => {
    if (!isSignedIn) {
      alert("Please sign in to book tickets.");
      return;
    }
    if (!show || selectedSeats.length === 0) return;
    try {
      setBooking(true);
      const token = await getToken();
      await axios.post("http://localhost:5000/bookings", {
        showId: show._id,
        seats: selectedSeats,
        totalAmount: show.price * selectedSeats.length
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Booking successful!");
      router.push("/bookings");
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-purple-500 h-10 w-10" /></div>;
  if (!show || !movie) return <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">Booking data not found</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-zinc-900">
               <ChevronLeft className="h-6 w-6" />
            </Button>
            <div>
               <h1 className="text-2xl font-bold">{movie.title}</h1>
               <p className="text-zinc-500 text-sm">{show.theater?.name}, {show.theater?.location} • {new Date(show.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} • {show.time}</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-xs text-zinc-500 uppercase font-bold">Ticket Price</p>
             <p className="text-xl font-bold text-purple-400">₹{show.price}</p>
          </div>
        </div>

        {/* Seating Layout */}
        <div className="p-12 bg-zinc-900/40 rounded-[3rem] border border-zinc-800 shadow-2xl relative overflow-hidden">
           {/* Decorative background glow */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-24 bg-purple-500/10 blur-[80px] -z-10" />

           {/* Screen Indicator */}
           <div className="w-full max-w-2xl mx-auto space-y-4 mb-20">
              <div className="w-full h-2 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent rounded-full shadow-[0_4px_20px_rgba(168,85,247,0.3)]" />
              <p className="text-center text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-medium">Theater Screen</p>
           </div>

           {/* Seat Grid */}
           <div className="grid grid-cols-10 gap-4 max-w-xl mx-auto">
              {show.seats.map(seat => (
                 <button
                   key={seat.seatNumber}
                   onClick={() => handleSeatClick(seat.seatNumber, seat.status)}
                   disabled={seat.status !== "available"}
                   className={cn(
                     "aspect-square rounded-xl border flex items-center justify-center transition-all duration-300 relative group",
                     seat.status === "available" 
                       ? selectedSeats.includes(seat.seatNumber)
                         ? "bg-purple-600 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white scale-110 z-10"
                         : "bg-zinc-800/40 border-zinc-700 hover:border-purple-500 hover:bg-purple-500/10 hover:shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                       : "bg-zinc-900 border-zinc-900 opacity-20 cursor-not-allowed"
                   )}
                 >
                   <Armchair className={cn("h-4 w-4", seat.status === "available" ? "group-hover:scale-110 transition-transform" : "")} />
                   {seat.status === "available" && selectedSeats.includes(seat.seatNumber) && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-white rounded-full animate-pulse" />
                   )}
                 </button>
              ))}
           </div>

           {/* Legend */}
           <div className="flex justify-center gap-10 mt-20 p-6 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-sm max-w-lg mx-auto">
              <div className="flex items-center gap-3">
                 <div className="h-4 w-4 rounded-md bg-zinc-800/40 border border-zinc-700" />
                 <span className="text-xs text-zinc-400 font-medium">Available</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="h-4 w-4 rounded-md bg-purple-600 shadow-sm shadow-purple-500/50" />
                 <span className="text-xs text-zinc-400 font-medium">Selected</span>
              </div>
              <div className="flex items-center gap-3 opacity-30">
                 <div className="h-4 w-4 rounded-md bg-zinc-900 border border-zinc-900" />
                 <span className="text-xs text-zinc-400 font-medium">Sold Out</span>
              </div>
           </div>
        </div>

        {/* Booking Footer */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-50">
           <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-6 rounded-[2rem] shadow-2xl flex items-center justify-between">
              <div className="space-y-1">
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Checkout Summary</p>
                 <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black">₹{show.price * selectedSeats.length || 0}</p>
                    <span className="text-xs text-zinc-500 font-medium">Total Amount</span>
                 </div>
                 <p className="text-[10px] text-purple-400 font-bold">
                    {selectedSeats.length > 0 ? `${selectedSeats.length} Seats: ${selectedSeats.join(', ')}` : 'Please select at least one seat'}
                 </p>
              </div>
              <Button 
                onClick={handleBooking}
                disabled={selectedSeats.length === 0 || booking}
                className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-7 rounded-2xl font-black text-lg h-auto shadow-2xl shadow-purple-600/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
              >
                {booking ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : "Purchase Tickets"}
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
