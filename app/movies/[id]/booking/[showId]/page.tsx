"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Loader2, Armchair, ChevronLeft, Timer } from "lucide-react";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import Script from "next/script";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";

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
  lockedBy?: string | null;
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
  const { getToken, isSignedIn, userId } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [show, setShow] = useState<Show | null>(null);

  // Ref to track locked seats for unmount cleanup
  const myLockedSeatsRef = useRef<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLocking, setIsLocking] = useState(false);

  // Update ref whenever show/user changes
  useEffect(() => {
    if (show?.seats && userId) {
      myLockedSeatsRef.current = show.seats
        .filter(s => s.status === "LOCKED" && s.lockedBy === userId)
        .map(s => s.seatId);
    }
  }, [show, userId]);

  /* ---------------- SOCKET & DATA ---------------- */

  useEffect(() => {
    if (!showId) return;

    socketRef.current = io("http://localhost:5000", {
        transports: ["websocket"],
    });

    const socket = socketRef.current;

    const joinRoom = () => {
        socket.emit("join-show", showId);
    };

    socket.on("connect", () => {
        console.log("Connected to socket");
        joinRoom();
    });

    if (socket.connected) {
        joinRoom();
    }

    socket.on("seats-updated", (updatedSeats: Seat[]) => {
        console.log("Received update:", updatedSeats);
        setShow(prev => {
            if (!prev) return prev;
            // Merge logic
            const newSeats = prev.seats.map(seat => {
                const update = updatedSeats.find(u => u.seatId === seat.seatId);
                return update ? { ...seat, ...update } : seat;
            });
            return {
                ...prev,
                seats: newSeats
            };
        });
    });

    return () => {
        socket.emit("leave-show", showId);
        socket.disconnect();
    };
  }, [showId]);

  useEffect(() => {
    if (!id || !showId) {
      console.error("Missing id or showId");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const movieRes = await api.get(`movies/${id}`);
        const showRes = await api.get(`shows/${showId}`);

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

const handleSeatClick = async (seatId: string, seat: Seat) => {
  if (isLocking) return;

  const isMine =
    seat.status === "LOCKED" && seat.lockedBy === userId;

  if (seat.status !== "AVAILABLE" && !isMine) return;

  const token = await getToken();
  setIsLocking(true);

  try {
    if (isMine) {
      // UNLOCK
      await api.patch(
        `shows/${showId}/unlock-seats`,
        { seats: [seatId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🔥 Optimistic UI update
      setShow(prev => ({
        ...prev!,
        seats: prev!.seats.map(s =>
          s.seatId === seatId
            ? { ...s, status: "AVAILABLE", lockedBy: null }
            : s
        )
      }));

    } else {
      // LOCK
      await api.patch(
        `shows/${showId}/lock-seats`,
        { seats: [seatId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🔥 Optimistic UI update
      setShow(prev => ({
        ...prev!,
        seats: prev!.seats.map(s =>
          s.seatId === seatId
            ? { ...s, status: "LOCKED", lockedBy: userId }
            : s
        )
      }));

      if (timeLeft === null) setTimeLeft(300);
    }
  } catch (e: any) {
    toast.error(e.response?.data?.message || "Seat update failed");
  } finally {
    setIsLocking(false);
  }
};


  // Timer effect
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft === 0) {
      toast.warning("Seat lock expired! Please select seats again.");
    
      setTimeLeft(null);
      
      const fetchData = async () => {
        try {
          const showRes = await api.get(`shows/${showId}`);
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
  // Unlock on unmount
  useEffect(() => {
    return () => {
      const seatsToUnlock = myLockedSeatsRef.current;
      if (seatsToUnlock.length > 0) {
        getToken().then(token => {
          api.patch(
            `shows/${showId}/unlock-seats`,
            { seats: seatsToUnlock },
            { headers: { Authorization: `Bearer ${token}` } }
          ).catch(err => console.error("Unmount unlock error:", err));
        });
      }
    };
  }, [showId, getToken]);

  /* ---------------- DERIVED STATE ---------------- */
  
  // Calculate effectively selected seats (Union of Local Selection + Server Locks)
  const mySeats = show?.seats.filter(
  s => s.status === "LOCKED" && s.lockedBy === userId
) || [];

  const handleBooking = async () => {
    if (!isSignedIn) {
      toast.info("Please sign in to book tickets.");
      return;
    }

    if (!show || mySeats.length === 0) return;

    try {
      setBooking(true);
      const token = await getToken();

      const res = await api.post(
        "bookings",
        {
          showId: show._id,
          // Use mySeats for the booking payload to match visual selection
          seats: mySeats.map(s => s.seatId),
          totalAmount: show.price * mySeats.length
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { payment_session_id, booking } = res.data;

      const cashfree = new (window as any).Cashfree({
        mode: "sandbox", 
      });

      cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: "_self",
      });

      // Poll verification
      setTimeout(async () => {
        const verifyRes = await api.post(
          "bookings/verify",
          { orderId: booking.orderId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (verifyRes.data.status === "success") {
          toast.success("Booking successful 🎉");
          router.push("/bookings");
        } else if (verifyRes.data.status === "cancelled") {
          toast.info("Payment cancelled");
        } else {
          toast.error("Payment failed");
        }
      }, 4000);

    } catch (err: any) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.message || "Booking failed.");
    } finally {
      setBooking(false);
    }
  };


  /* ---------------- UTILS ---------------- */
const isSeatMine = (seat: Seat) =>
  seat.status === "LOCKED" && seat.lockedBy === userId;


const getSeatColor = (
  seat: Seat,
  isSelected: boolean
) => {
  // 1️⃣ Server truth: locked by me
  if (seat.status === "LOCKED" && seat.lockedBy === userId) {
    return "bg-purple-600 border-purple-500 shadow-lg scale-110";
  }

  // 2️⃣ Local optimistic selection
  if (isSelected) {
    return "bg-purple-600 border-purple-500 shadow-lg scale-110";
  }

  // 3️⃣ Locked / booked by others
  if (seat.status !== "AVAILABLE") {
    return "bg-zinc-900 border-zinc-900 opacity-30 cursor-not-allowed";
  }

  // 4️⃣ Available styles
  if (seat.type === "PLATINUM")
    return "bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/30";

  if (seat.type === "GOLD")
    return "bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30";

  return "bg-zinc-800/40 border-zinc-700 hover:bg-purple-500/10";
};

  /* ---------------- RENDER ---------------- */

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

  const groupedSeats = show.seats.reduce((acc: any, seat) => {
    const row = seat.seatId.charAt(0);
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  const rows = Object.keys(groupedSeats).sort();

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
            <div>
              <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">Seat Types</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center"><Armchair className="h-4 w-4 text-amber-400" /></div>
                  <span className="text-sm text-zinc-300">Platinum</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center"><Armchair className="h-4 w-4 text-yellow-400" /></div>
                  <span className="text-sm text-zinc-300">Gold</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/40 border border-zinc-700 flex items-center justify-center"><Armchair className="h-4 w-4 text-zinc-400" /></div>
                  <span className="text-sm text-zinc-300">Silver</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">Seat Status</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/40 border border-zinc-700 flex items-center justify-center"><Armchair className="h-4 w-4 text-zinc-400" /></div>
                  <span className="text-sm text-zinc-300">Available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 border border-purple-500 flex items-center justify-center"><Armchair className="h-4 w-4 text-white" /></div>
                  <span className="text-sm text-zinc-300">Selected (Yours)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-900 opacity-30 flex items-center justify-center"><Armchair className="h-4 w-4 text-zinc-600" /></div>
                  <span className="text-sm text-zinc-300">Booked/Locked (Others)</span>
                </div>
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
               {groupedSeats[row].map((seat: Seat) => {
  const isMine = seat.status === "LOCKED" && seat.lockedBy === userId;
  const isInteractable = seat.status === "AVAILABLE" || isMine;

  return (
    <button
      key={seat.seatId}
      onClick={() => handleSeatClick(seat.seatId, seat)}
      disabled={!isInteractable}
      className={cn(
        "w-10 h-10 rounded-xl border flex items-center justify-center transition-all",
        getSeatColor(seat, isMine)
      )}
    >
      <Armchair className="h-4 w-4" />
    </button>
  );
})}

              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6">
          <div className="bg-zinc-900/90 p-6 rounded-3xl flex justify-between items-center">
            <div>
              <p className="text-sm text-zinc-400">
                {mySeats.length} seat(s)
              </p>
              <p className="text-xl font-bold">
                ₹{mySeats.length * show.price}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isLocking && <Loader2 className="animate-spin text-purple-400 h-5 w-5" />}
              <Button
                onClick={handleBooking}
                disabled={!mySeats.length || booking || isLocking}
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
