"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Clock, MapPin, ChevronRight, Loader2, Armchair } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

interface Movie {
  _id: string;
  title: string;
  poster: string;
  description: string;
  rating: number;
  duration: string;
  category: { name: string };
}

interface Show {
  _id: string;
  date: string;
  time: string;
  price: number;
  theater: { name: string };
  seats: { seatNumber: string; status: string }[];
}

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [booking, setBooking] = useState(false);
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieRes, showsRes] = await Promise.all([
          axios.get(`http://localhost:5000/movies/${id}`),
          axios.get(`http://localhost:5000/shows/movie/${id}`)
        ]);
        setMovie(movieRes.data);
        setShows(showsRes.data);
        if (showsRes.data.length > 0) {
          setSelectedDate(showsRes.data[0].date);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isSignedIn, getToken]);

  const dates = Array.from(new Set(shows.map(s => s.date))).sort();
  const filteredShows = shows.filter(s => s.date === selectedDate);

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
    if (!selectedShow || selectedSeats.length === 0) return;
    try {
      setBooking(true);
      const token = await getToken();
      await axios.post("http://localhost:5000/bookings", {
        showId: selectedShow._id,
        seats: selectedSeats,
        totalAmount: selectedShow.price * selectedSeats.length
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
  if (!movie) return <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">Movie not found</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Movie Details */}
        <div className="lg:col-span-1 space-y-8">
          <div className="relative aspect-[2/3] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl shadow-purple-500/10">
            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6 right-6">
               <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
               <div className="flex items-center gap-3 text-sm text-zinc-300">
                 <span className="px-2 py-0.5 bg-purple-600 rounded text-xs font-bold">{movie.category?.name}</span>
                 <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" /> {movie.rating}</div>
                 <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {movie.duration}</div>
               </div>
            </div>
          </div>
          <div className="space-y-4">
             <h2 className="text-xl font-bold text-zinc-100">About the Movie</h2>
             <p className="text-zinc-400 leading-relaxed">{movie.description}</p>
          </div>
        </div>

        {/* Right Column: Scheduling & Seating */}
        <div className="lg:col-span-2 space-y-12">
          {/* Date Selector */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-zinc-300">
              <Calendar className="h-5 w-5 text-purple-500" /> Select Date
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {dates.map(date => (
                <button
                  key={date}
                  onClick={() => {setSelectedDate(date); setSelectedShow(null); setSelectedSeats([]);}}
                  className={cn(
                    "flex-shrink-0 px-6 py-4 rounded-2xl border transition-all duration-300 text-center min-w-[100px]",
                    selectedDate === date 
                      ? "bg-purple-600 border-purple-500 shadow-lg shadow-purple-600/20" 
                      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                  )}
                >
                  <p className="text-xs uppercase font-bold text-zinc-400 mb-1">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  <p className="text-lg font-bold">{new Date(date).getDate()}</p>
                  <p className="text-[10px] text-zinc-500 uppercase">{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Show Selector */}
          {selectedDate && (
             <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-zinc-300">
                  <Clock className="h-5 w-5 text-purple-500" /> Available Shows
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {filteredShows.map(show => (
                      <button
                        key={show._id}
                        onClick={() => {setSelectedShow(show); setSelectedSeats([]);}}
                        className={cn(
                          "p-4 rounded-2xl border text-left transition-all duration-300 group",
                          selectedShow?._id === show._id 
                            ? "bg-purple-600/10 border-purple-500" 
                            : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                        )}
                      >
                         <p className="text-sm font-bold group-hover:text-purple-400 transition-colors">{show.time}</p>
                         <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {show.theater.name}</p>
                         <p className="text-xs text-purple-400 mt-2 font-bold">₹{show.price}</p>
                      </button>
                   ))}
                </div>
             </div>
          )}

          {/* Seating Layout (Dynamic Layout) */}
          {selectedShow && (
             <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-zinc-300">
                    <Armchair className="h-5 w-5 text-purple-500" /> Select Seats
                  </h3>
                  <div className="p-8 bg-zinc-900/40 rounded-3xl border border-zinc-800">
                     {/* Screen Indicator */}
                     <div className="w-full h-1 bg-purple-500/20 rounded-full mb-12 shadow-[0_0_20px_rgba(168,85,247,0.2)]" />
                     <p className="text-center text-[10px] text-zinc-600 uppercase tracking-[0.2em] -mt-8 mb-12">Screen this way</p>

                     {/* Seat Grid */}
                     <div className="grid grid-cols-10 gap-3 max-w-sm mx-auto">
                        {selectedShow.seats.map(seat => (
                           <button
                             key={seat.seatNumber}
                             onClick={() => handleSeatClick(seat.seatNumber, seat.status)}
                             disabled={seat.status !== "available"}
                             className={cn(
                               "aspect-square rounded-md border flex items-center justify-center transition-all duration-200",
                               seat.status === "available" 
                                 ? selectedSeats.includes(seat.seatNumber)
                                   ? "bg-purple-600 border-purple-500 shadow-sm shadow-purple-600/30 text-white"
                                   : "bg-zinc-800/50 border-zinc-700 hover:border-purple-500 hover:bg-purple-500/10"
                                 : "bg-zinc-800/20 border-zinc-900 opacity-30 cursor-not-allowed"
                             )}
                           >
                             <Armchair className="h-3 w-3" />
                           </button>
                        ))}
                     </div>

                     {/* Legend */}
                     <div className="flex justify-center gap-8 mt-12">
                        <div className="flex items-center gap-2">
                           <div className="h-3 w-3 rounded-sm bg-zinc-800 border border-zinc-700" />
                           <span className="text-[10px] text-zinc-500 uppercase font-bold">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="h-3 w-3 rounded-sm bg-purple-600" />
                           <span className="text-[10px] text-zinc-500 uppercase font-bold">Selected</span>
                        </div>
                        <div className="flex items-center gap-3 opacity-30">
                           <div className="h-3 w-3 rounded-sm bg-zinc-800 border border-zinc-900" />
                           <span className="text-[10px] text-zinc-500 uppercase font-bold">Booked</span>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Booking Footer */}
                <div className="flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
                   <div>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Amount</p>
                      <p className="text-2xl font-bold">₹{selectedShow.price * selectedSeats.length || 0}</p>
                      <p className="text-[10px] text-purple-400 font-medium">{selectedSeats.length > 0 ? `${selectedSeats.length} Seats Selected: ${selectedSeats.join(', ')}` : 'No seats selected'}</p>
                   </div>
                   <Button 
                     onClick={handleBooking}
                     disabled={selectedSeats.length === 0 || booking}
                     className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-6 rounded-2xl font-bold h-auto shadow-xl shadow-purple-600/20 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                   >
                     {booking ? <Loader2 className="animate-spin mr-2" /> : "Confirm & Pay"}
                   </Button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
