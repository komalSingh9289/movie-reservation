"use client";

import DashboardLayout from "@/components/admin/DashboardLayout";
import { Film, Plus, Search, Filter, Settings, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function MoviesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Movies Management</h1>
            <p className="text-zinc-500 text-sm mt-1">Add, edit, and keep track of your movie catalog.</p>
          </div>
          
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-10 px-6 font-semibold transition-all">
            <Plus className="w-4 h-4 mr-2" /> Add New Movie
          </Button>
        </div>

        {/* Filters & Search - Simple */}
        <div className="flex flex-col md:flex-row gap-4 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                <Input 
                  placeholder="Search by title, genre, or director..." 
                  className="h-11 pl-11 bg-transparent border-none text-white text-sm focus:ring-0 placeholder:text-zinc-600" 
                />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" className="h-9 px-4 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 font-bold text-xs uppercase tracking-wider">
                    <Filter className="w-3.5 h-3.5 mr-2" /> Filters
                </Button>
                <div className="w-[1px] h-4 bg-zinc-800" />
                <span className="text-[10px] font-bold tracking-wider text-zinc-500 px-3 uppercase">156 Results</span>
            </div>
        </div>

        {/* Clean Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="group flex flex-col gap-3">
                    <div className="aspect-[2/3] rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group-hover:border-zinc-700 transition-all duration-300">
                        {/* Placeholder Poster */}
                        <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                            <Film className="w-8 h-8 text-zinc-700" />
                        </div>
                        
                        {/* Overlay Actions - Simplified */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-4">
                             <div className="flex flex-col gap-2 w-full">
                                <Button className="h-9 bg-white text-black hover:bg-zinc-200 rounded-lg font-bold text-xs">Edit</Button>
                                <Button className="h-9 bg-zinc-800/80 text-white hover:bg-zinc-700 rounded-lg font-bold text-xs">Settings</Button>
                             </div>
                        </div>

                        {/* Rating Badge - Simple */}
                        <div className="absolute top-3 right-3 h-7 px-2.5 bg-black/80 rounded-lg flex items-center gap-1.5 border border-zinc-800">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-[10px] font-bold text-white">8.9</span>
                        </div>
                    </div>

                    <div className="px-1">
                        <h3 className="font-bold text-white truncate text-sm">Interstellar</h3>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Sci-Fi • 2014</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

