"use client";

import { Ticket } from "lucide-react";

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Ticket className="w-6 h-6 text-purple-500" />
          </div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center space-y-4">
          <p className="text-gray-400 text-lg">You haven&apos;t booked any tickets yet.</p>
          <p className="text-sm text-gray-500">Your future movie tickets will appear here.</p>
        </div>
      </div>
    </div>
  );
}
