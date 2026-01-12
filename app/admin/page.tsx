"use client";

import DashboardLayout from "@/components/admin/DashboardLayout";
import { Users, Film, Ticket, TrendingUp, Plus, Settings, ChevronRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

export default function AdminDashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  // No need for a separate sync call here, DashboardLayout already does it.
  // We can just rely on the user object from Clerk since we trust the backend scoping for other calls.
  // However, to know if it's super_admin, we might want the role from the DB.
  // DashboardLayout could theoretically pass it down, but for now let's just use the metadata or a single fetch if really needed.
  // Let's assume we want to keep'dbUser' for the 'role' check specifically.
  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
    const fetchRole = async () => {
        const token = await getToken();
        // Just fetch info, don't triggger sync logic again if possible (though findOneAndUpdate is safe)
        const res = await fetch("http://localhost:5000/users/sync", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ clerkId: user?.id }),
        });
        const data = await res.json();
        setDbUser(data);
    };
    if (user) fetchRole();
  }, [user]);

  const isSuperAdmin = dbUser?.role === "super_admin";

  const stats = [
    {
      title: isSuperAdmin ? "Total Monthly Revenue" : "Monthly Revenue",
      value: isSuperAdmin ? "₹8,45,200" : "₹1,24,500",
      change: "+12.5%",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: isSuperAdmin ? "Total Theaters" : "Movie Catalog",
      value: isSuperAdmin ? "24" : "156",
      change: isSuperAdmin ? "+2 new" : "+4 new",
      icon: isSuperAdmin ? Building2 : Film,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Active Users",
      value: "3,842",
      change: "+18%",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Tickets Sold",
      value: "842",
      change: "+24 today",
      icon: Ticket,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Simple Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
                {isSuperAdmin ? "Platform Overview" : "Theater Overview"}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
                {isSuperAdmin 
                    ? "Monitor all theater performances and user activities across the platform." 
                    : "Manage your theater's movies, shows, and ticketing performance."}
            </p>
          </div>
          {!isSuperAdmin && (
            <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-10 px-6 font-semibold transition-all">
                <Plus className="w-4 h-4 mr-2" /> Add Movie
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="bg-zinc-900/40 border-zinc-900 hover:border-zinc-800 transition-colors rounded-xl overflow-hidden"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <span className={`text-[11px] font-bold ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'} flex items-center gap-1`}>
                        {stat.change} <TrendingUp className="w-3 h-3" />
                    </span>
                </div>
                <div>
                    <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{stat.title}</h3>
                    <div className="text-2xl font-bold text-white mt-0.5 tracking-tight">{stat.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-zinc-900/40 border-zinc-900 rounded-2xl overflow-hidden">
                <CardHeader className="px-6 py-5 border-b border-zinc-900 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Recent Movies</CardTitle>
                    <Button variant="ghost" className="text-xs text-zinc-500 hover:text-white px-0 h-auto">View All</Button>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-14 bg-zinc-800 rounded-md overflow-hidden flex items-center justify-center">
                                    <Film className="w-5 h-5 text-zinc-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-white">Interstellar Remastered</p>
                                    <p className="text-[10px] text-zinc-500 font-medium uppercase mt-0.5 tracking-wide">Sci-Fi • 2h 49m</p>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" className="rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/50 w-8 h-8">
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Upcoming Schedule */}
            <Card className="bg-zinc-900/40 border-zinc-900 rounded-2xl overflow-hidden">
                <CardHeader className="px-6 py-5 border-b border-zinc-900">
                    <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Upcoming Shows</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800/50 cursor-pointer group"
                        >
                            <div className="w-12 h-10 rounded-lg bg-zinc-800 flex flex-col items-center justify-center border border-zinc-700/50">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase">PM</span>
                                <span className="text-sm font-bold text-white">7:30</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-white">Cinema {i} Screening</p>
                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">Theater Hall 0{i}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

