"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Clock, MapPin, Loader2, ChevronLeft, Filter } from "lucide-react";
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
  theater: { _id: string; name: string; location: string };
}

export default function TheaterSelectionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [movieRes, showsRes] = await Promise.all([
          axios.get(`http://localhost:5000/movies/${id}`),
          axios.get(`http://localhost:5000/shows/movie/${id}`)
        ]);
        setMovie(movieRes.data);
        setShows(showsRes.data);
        
        if (showsRes.data.length > 0) {
          // Set initial date to the first available date
          setSelectedDate(showsRes.data[0].date);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const dates = Array.from(new Set(shows.map(s => s.date))).sort();
  const locations = ["All", ...Array.from(new Set(shows.map(s => s.theater?.location).filter(Boolean)))];

  const filteredTheatersWithShows = shows.reduce((acc: any, show) => {
    if (show.date !== selectedDate) return acc;
    if (selectedLocation !== "All" && show.theater?.location !== selectedLocation) return acc;

    const theaterId = show.theater?._id;
    if (!theaterId) return acc;
    if (!acc[theaterId]) {
      acc[theaterId] = {
        theater: show.theater,
        shows: []
      };
    }
    acc[theaterId].shows.push(show);
    return acc;
  }, {});

  const theaterList = Object.values(filteredTheatersWithShows);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-purple-500 h-10 w-10" /></div>;
  if (!movie) return <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">Movie not found</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Movie Header Card */}
        <div className="relative h-[400px] w-full rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
           <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
           <div className="absolute bottom-10 left-10 space-y-4 max-w-2xl">
              <Button variant="ghost" className="mb-4 text-zinc-400 hover:text-white p-0" onClick={() => router.push('/movies')}>
                 <ChevronLeft className="mr-2 h-4 w-4" /> Back to Movies
              </Button>
              <div className="flex items-center gap-3">
                 <span className="px-3 py-1 bg-purple-600 rounded-full text-xs font-bold">{movie.category?.name}</span>
                 <div className="flex items-center gap-1.5 text-zinc-300 text-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {movie.rating}
                 </div>
                 <div className="flex items-center gap-1.5 text-zinc-300 text-sm">
                    <Clock className="h-4 w-4" /> {movie.duration}
                 </div>
              </div>
              <h1 className="text-5xl font-black tracking-tight">{movie.title}</h1>
              <p className="text-zinc-400 line-clamp-2">{movie.description}</p>
           </div>
        </div>

        {/* Filters Section */}
        <div className="space-y-8 bg-zinc-900/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
           <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
              <div className="space-y-4 w-full md:w-auto">
                 <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" /> Select Date
                 </h3>
                 <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {dates.map(date => (
                       <button
                         key={date}
                         onClick={() => setSelectedDate(date)}
                         className={cn(
                           "flex-shrink-0 px-6 py-4 rounded-2xl border transition-all duration-300 text-center min-w-[100px]",
                           selectedDate === date 
                             ? "bg-purple-600 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]" 
                             : "bg-black/40 border-zinc-800 hover:border-zinc-700"
                         )}
                       >
                         <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                         <p className="text-xl font-black">{new Date(date).getDate()}</p>
                         <p className="text-[10px] text-zinc-500 uppercase font-medium">{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</p>
                       </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4 w-full md:w-64">
                 <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-500" /> Select Region
                 </h3>
                 <div className="relative group">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <select 
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50 appearance-none transition-all cursor-pointer hover:border-zinc-700"
                    >
                       {locations.map(loc => (
                          <option key={loc} value={loc} className="bg-zinc-900">{loc}</option>
                       ))}
                    </select>
                 </div>
              </div>
           </div>
        </div>

        {/* Theaters List */}
        <div className="space-y-6">
           <h2 className="text-2xl font-bold flex items-center gap-3">
              Available Theaters <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
           </h2>
           
           {theaterList.length > 0 ? (
              <div className="grid gap-6">
                 {theaterList.map((item: any) => (
                    <div key={item.theater._id} className="bg-zinc-900/20 border border-white/5 rounded-[2rem] p-8 hover:border-purple-500/30 transition-all duration-500 group">
                       <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                          <div className="space-y-2 flex-grow">
                             <h4 className="text-xl font-black group-hover:text-purple-400 transition-colors">{item.theater.name}</h4>
                             <p className="text-zinc-500 text-sm flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5" /> {item.theater.location}
                             </p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                             {item.shows.map((show: Show) => (
                                <button
                                  key={show._id}
                                  onClick={() => router.push(`/movies/${id}/booking/${show._id}`)}
                                  className="px-6 py-3 rounded-xl border border-zinc-800 bg-black/40 hover:bg-purple-600 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-600/20 transition-all duration-300 flex flex-col items-center gap-1"
                                >
                                   <span className="text-sm font-black">{show.time}</span>
                                   <span className="text-[10px] text-zinc-500 group-hover:text-purple-200">₹{show.price}</span>
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           ) : (
              <div className="py-20 text-center space-y-4 bg-zinc-900/20 rounded-[3rem] border border-dashed border-zinc-800">
                 <div className="inline-flex h-16 w-16 rounded-full bg-zinc-900 items-center justify-center">
                    <Clock className="h-8 w-8 text-zinc-700" />
                 </div>
                 <p className="text-zinc-500 text-lg">No shows available for the selected filters.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
