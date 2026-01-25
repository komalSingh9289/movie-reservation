"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Star,
  Calendar,
  Clock,
  MapPin,
  Loader2,
  ChevronLeft,
  Filter,
} from "lucide-react";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { socket } from "@/lib/socket";

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
  const { isSignedIn } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [movieRes, showsRes] = await Promise.all([
          api.get(`movies/${id}`),
          api.get(`shows/movie/${id}`),
        ]);

        setMovie(movieRes.data);
        setShows(showsRes.data);

        if (showsRes.data.length > 0) {
          setSelectedDate(showsRes.data[0].date);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);



  /** DATE PILLS */
  const dates = Array.from(new Set(shows.map((s) => s.date))).sort();

  /** LOCATION FILTER */
  const locations = [
    "All",
    ...Array.from(
      new Set(shows.map((s) => s.theater?.location).filter(Boolean))
    ),
  ];

  /** GROUP THEATERS WITH SHOWS */
  const filteredTheatersWithShows = shows.reduce((acc: any, show) => {
    if (show.date !== selectedDate) return acc;
    if (
      selectedLocation !== "All" &&
      show.theater?.location !== selectedLocation
    )
      return acc;

    const theaterId = show.theater?._id;
    if (!theaterId) return acc;

    if (!acc[theaterId]) {
      acc[theaterId] = {
        theater: show.theater,
        shows: [],
      };
    }

    acc[theaterId].shows.push(show);
    return acc;
  }, {});

  const theaterList = Object.values(filteredTheatersWithShows);

  const handleBookNow = () => {
    if (!selectedShowId) return;
    router.push(`/movies/${id}/booking/${selectedShowId}`);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500 h-10 w-10" />
      </div>
    );

  if (!movie)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Movie not found
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-32 px-6">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* HEADER */}
        <div className="relative h-[400px] rounded-[3rem] overflow-hidden">
          <img src={movie.poster} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50" />
          <div className="absolute bottom-10 left-10 space-y-4 max-w-xl">
            <Button variant="ghost" onClick={() => router.push("/movies")}>
              <ChevronLeft className="mr-2" /> Back
            </Button>
            <h1 className="text-5xl font-black">{movie.title}</h1>
            <p className="text-zinc-400">{movie.description}</p>
          </div>
        </div>

        {/* DATE FILTER */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-500">
            <Calendar className="h-4 w-4 text-purple-500" /> Select Date
          </h3>

          <div className="flex gap-3 mt-4 overflow-x-auto">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedShowId(null);
                }}
                className={cn(
                  "px-6 py-3 rounded-xl border",
                  selectedDate === date
                    ? "bg-purple-600 border-purple-500"
                    : "border-zinc-800"
                )}
              >
                {new Date(date).toDateString()}
              </button>
            ))}
          </div>
        </div>

        {/* THEATERS */}
        {theaterList.map((item: any) => (
          <div
            key={item.theater._id}
            className="bg-zinc-900/30 rounded-2xl p-6"
          >
            <h4 className="text-xl font-bold">{item.theater.name}</h4>
            <p className="text-zinc-500 flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {item.theater.location}
            </p>

            <div className="flex gap-3 mt-4 flex-wrap">
              {item.shows.map((show: Show) => (
                <button
                  key={show._id}
                  onClick={() => setSelectedShowId(show._id)}
                  className={cn(
                    "px-6 py-3 rounded-xl border",
                    selectedShowId === show._id
                      ? "bg-purple-600 border-purple-500"
                      : "border-zinc-700"
                  )}
                >
                  <div className="font-bold">{show.time}</div>
                  <div className="text-xs text-zinc-400">₹{show.price}</div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* BOOK NOW */}
        {selectedShowId && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
            <Button
              onClick={handleBookNow}
              className="bg-purple-600 px-16 py-6 text-lg font-black rounded-2xl"
            >
              Ready to choose seats →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
