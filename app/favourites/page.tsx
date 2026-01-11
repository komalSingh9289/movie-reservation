"use client";

import { Heart } from "lucide-react";

export default function FavouritesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold">My Favourites</h1>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center space-y-4">
          <p className="text-gray-400 text-lg">Your watchlist is empty.</p>
          <p className="text-sm text-gray-500">Save movies you want to watch later by clicking the heart icon.</p>
        </div>
      </div>
    </div>
  );
}
