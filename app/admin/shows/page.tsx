"use client";

import DashboardLayout from "@/components/admin/DashboardLayout";
import { Calendar, Plus, MapPin, Clock, Film, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ShowsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Show Scheduling</h1>
            <p className="text-zinc-500 text-sm mt-1">Manage movie screenings and theater allocations.</p>
          </div>
          
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-10 px-6 font-semibold transition-all">
            <Plus className="w-4 h-4 mr-2" /> Schedule New Show
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all rounded-2xl overflow-hidden group">
                    <CardHeader className="p-5 pb-2">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 py-0.5 bg-zinc-800 rounded">Hall 0{i}</span>
                            <div className="flex items-center gap-1.5 p-1 px-2.5 bg-emerald-500/10 rounded-lg">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                        <CardTitle className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Interstellar (IMAX)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Show Time</p>
                                <div className="flex items-center gap-2 text-zinc-300">
                                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                                    <span className="text-sm font-semibold italic">07:30 PM</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Tickets</p>
                                <div className="flex items-center gap-2 text-zinc-300">
                                    <Film className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-sm font-semibold italic">124 / 150</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-800 flex gap-2">
                            <Button variant="outline" className="flex-1 h-9 border-zinc-800 hover:bg-zinc-800 text-xs font-bold rounded-lg transition-all">
                                Edit Details
                            </Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 border border-zinc-800 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition-all">
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

