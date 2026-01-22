"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Loader2, Armchair, ChevronLeft, Timer } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
import Script from "next/script";

declare global {
  interface Window {
    Cashfree: any;
  }
}

/* ---------------- TYPES ---------------- */

interface Seat {
  seatId: string;
  status: "AVAILABLE" | "BOOKED" | "LOCKED";
  type: "SILVER" | "GOLD" | "PLATINUM";
}

interface Theater {
  name: string;
  location: string;
}

interface Show {
  _id: string;
  date: string;
  time: string;
  price: number;
  seats: Seat[];
  theater: Theater;
}

interface Movie {
  title: string;
}

/* ---------------- COMPONENT ---------------- */

export default function BookingPage() {
  const { id, showId } = useParams();
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [show, setShow] = useState<Show | null>(null);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLocking, setIsLocking] = useState(false);

  /* ---------------- FETCH DATA ---------------- */
  console.log("id:", id);
console.log("showId:", showId);

useEffect(() => {
  if (!id || !showId) {
    console.error("Missing id or showId");
    setLoading(false);
    return;
  }

  const fetchData = async () => {
    try {
      setLoading(true);

      const movieRes = await axios.get(
        `http://localhost:5000/movies/${id}`
      );

      const showRes = await axios.get(
        `http://localhost:5000/shows/${showId}`
      );

      console.log("Movie response:", movieRes.data);
console.log("Show response:", showRes.data);

      setMovie(movieRes.data);
      setShow(showRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [id, showId]);


  /* ---------------- HANDLERS ---------------- */

  const handleSeatClick = async (seatId: string, status: string) => {
    if (status !== "AVAILABLE" || isLocking) return;

    const isSelected = selectedSeats.includes(seatId);
    const newSelection = isSelected
      ? selectedSeats.filter(s => s !== seatId)
      : [...selectedSeats, seatId];

    try {
      setIsLocking(true);
      const token = await getToken();
      
      if (isSelected) {
        // Unlock
        await axios.patch(
          `http://localhost:5000/shows/${showId}/unlock-seats`,
          { seats: [seatId] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Lock
        await axios.patch(
          `http://localhost:5000/shows/${showId}/lock-seats`,
          { seats: [seatId] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setSelectedSeats(newSelection);
      
      // Start/Reset timer if seats are selected
      if (newSelection.length > 0) {
        if (!timeLeft) setTimeLeft(300); // 5 minutes
      } else {
        setTimeLeft(null);
      }
    } catch (err: any) {
      console.error("Lock/Unlock error:", err);
      alert(err.response?.data?.message || "Failed to update seat status.");
    } finally {
      setIsLocking(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft === 0) {
      alert("Seat lock expired! Please select seats again.");
      setSelectedSeats([]);
      setTimeLeft(null);
      // Refresh show data to see available seats
      const fetchData = async () => {
        try {
          const showRes = await axios.get(`http://localhost:5000/shows/${showId}`);
          setShow(showRes.data);
        } catch (err) {
          console.error("Refresh error:", err);
        }
      };
      fetchData();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showId]);

  // Unlock on unmount
  useEffect(() => {
    return () => {
      if (selectedSeats.length > 0) {
        getToken().then(token => {
          axios.patch(
            `http://localhost:5000/shows/${showId}/unlock-seats`,
            { seats: selectedSeats },
            { headers: { Authorization: `Bearer ${token}` } }
          ).catch(err => console.error("Unmount unlock error:", err));
        });
      }
    };
  }, [selectedSeats, showId, getToken]);

const handleBooking = async () => {
  if (!isSignedIn) {
    alert("Please sign in to book tickets.");
    return;
  }

  if (!show || selectedSeats.length === 0) return;

  try {
    setBooking(true);
    const token = await getToken();

    // 1️⃣ Create booking
    const res = await axios.post(
      "http://localhost:5000/bookings",
      {
        showId: show._id,
        seats: selectedSeats,
        totalAmount: show.price * selectedSeats.length
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const { payment_session_id, booking } = res.data;

    // 2️⃣ Initialize Cashfree (CORRECT)
    const cashfree = new (window as any).Cashfree({
      mode: "sandbox", // production later
    });

    // 3️⃣ Open checkout
    cashfree.checkout({
      paymentSessionId: payment_session_id,
      redirectTarget: "_self",
    });

    // 4️⃣ Poll verification after redirect
    setTimeout(async () => {
      const verifyRes = await axios.post(
        "http://localhost:5000/bookings/verify",
        { orderId: booking.orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (verifyRes.data.status === "success") {
        alert("Booking successful 🎉");
        router.push("/bookings");
      } else if (verifyRes.data.status === "cancelled") {
        alert("Payment cancelled");
      } else {
        alert("Payment failed");
      }
    }, 4000);

  } catch (err: any) {
    console.error("Booking error:", err);
    alert(err.response?.data?.message || "Booking failed.");
  } finally {
    setBooking(false);
  }
};


  /* ---------------- LOADING / ERROR ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500 h-10 w-10" />
      </div>
    );
  }

  if (!show || !movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Booking data not found
      </div>
    );
  }

  if (!show.seats || show.seats.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">
        No seats configured for this show
      </div>
    );
  }

  /* ---------------- SEAT GROUPING ---------------- */

  const groupedSeats = show.seats.reduce((acc: any, seat) => {
    const row = seat.seatId.charAt(0);
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  const rows = Object.keys(groupedSeats).sort();

  const getSeatColor = (status: string, type: string, isSelected: boolean) => {
    if (status !== "AVAILABLE")
      return "bg-zinc-900 border-zinc-900 opacity-30 cursor-not-allowed";

    if (isSelected)
      return "bg-purple-600 border-purple-500 shadow-lg scale-110";

    if (type === "PLATINUM")
      return "bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/30";

    if (type === "GOLD")
      return "bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30";

    return "bg-zinc-800/40 border-zinc-700 hover:bg-purple-500/10";
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-40 px-6">
      <Script 
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="beforeInteractive"
      />
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{movie.title}</h1>
              <p className="text-zinc-500 text-sm">
                {show.theater.name}, {show.theater.location} •{" "}
                {new Date(show.date).toDateString()} • {show.time}
              </p>
            </div>
          </div>
          <p className="text-xl font-bold text-purple-400">₹{show.price}</p>
        </div>

        {/* TIMER */}
        {timeLeft !== null && (
          <div className="flex items-center justify-center gap-2 bg-purple-500/10 border border-purple-500/20 py-3 rounded-2xl">
            <Timer className="h-4 w-4 text-purple-400 animate-pulse" />
            <p className="text-sm font-medium text-purple-300">
              Seats are locked for {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </p>
          </div>
        )}

        {/* LEGEND */}
        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-400 mb-4">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* Seat Types */}
            <div>
              <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">Seat Types</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                    <Armchair className="h-4 w-4 text-amber-400" />
                  </div>
                  <span className="text-sm text-zinc-300">Platinum</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                    <Armchair className="h-4 w-4 text-yellow-400" />
                  </div>
                  <span className="text-sm text-zinc-300">Gold</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/40 border border-zinc-700 flex items-center justify-center">
                    <Armchair className="h-4 w-4 text-zinc-400" />
                  </div>
                  <span className="text-sm text-zinc-300">Silver</span>
                </div>
              </div>
            </div>

            {/* Seat Status */}
            <div>
              <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">Seat Status</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/40 border border-zinc-700 flex items-center justify-center">
                    <Armchair className="h-4 w-4 text-zinc-400" />
                  </div>
                  <span className="text-sm text-zinc-300">Available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 border border-purple-500 flex items-center justify-center">
                    <Armchair className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-zinc-300">Selected</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-900 opacity-30 flex items-center justify-center">
                    <Armchair className="h-4 w-4 text-zinc-600" />
                  </div>
                  <span className="text-sm text-zinc-300">Booked</span>
                </div>
              </div>
            </div>

            {/* Row Labels */}
            <div className="col-span-2 md:col-span-1">
              <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">Row Labels</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <span className="text-sm font-semibold text-zinc-400">A</span>
                  </div>
                  <span className="text-sm text-zinc-300">Row A, B, C...</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Each row is labeled alphabetically</p>
              </div>
            </div>
          </div>
        </div>

        {/* SCREEN */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-full max-w-2xl h-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent rounded-full"></div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Screen This Way</p>
        </div>

        {/* SEATS */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {rows.map(row => (
            <div key={row} className="flex items-center gap-4 justify-center">
              <span className="w-6 text-zinc-400">{row}</span>

              <div className="flex gap-3">
                {groupedSeats[row].map((seat: Seat) => (
                  <button
                    key={seat.seatId}
                    onClick={() => handleSeatClick(seat.seatId, seat.status)}
                    disabled={seat.status !== "AVAILABLE"}
                    className={cn(
                      "w-10 h-10 rounded-xl border flex items-center justify-center transition-all",
                      getSeatColor(
                        seat.status,
                        seat.type,
                        selectedSeats.includes(seat.seatId)
                      )
                    )}
                  >
                    <Armchair className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6">
          <div className="bg-zinc-900/90 p-6 rounded-3xl flex justify-between items-center">
            <div>
              <p className="text-sm text-zinc-400">
                {selectedSeats.length} seat(s)
              </p>
              <p className="text-xl font-bold">
                ₹{selectedSeats.length * show.price}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isLocking && <Loader2 className="animate-spin text-purple-400 h-5 w-5" />}
              <Button
                onClick={handleBooking}
                disabled={!selectedSeats.length || booking || isLocking}
                className="bg-purple-600 px-10 py-6 text-lg"
              >
                {booking ? <Loader2 className="animate-spin" /> : "Pay Now"}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
