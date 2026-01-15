"use client";

import DashboardLayout from "@/components/admin/DashboardLayout";
import { Users, Film, Ticket, TrendingUp, Plus, ChevronRight, Building2, Store, Calendar, StopCircle } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

export default function AdminDashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [dbUser, setDbUser] = useState<any>(null);
  // State for simplified stats mapping
  const [adminStats, setAdminStats] = useState<any>(null);
  const [statsData, setStatsData] = useState({
    revenue: 0,
    theaters: 0,
    users: 0,
    tickets: 0,
    movies: 0
  });
  const [recentMovies, setRecentMovies] = useState([]);
  const [upcomingShows, setUpcomingShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        const token = await getToken();
        
        // 1. Sync/Fetch User Role
        const userRes = await api.post("/users/sync", { clerkId: user.id }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const currentUser = userRes.data;
        setDbUser(currentUser);

        if (currentUser.role === 'super_admin' || currentUser.role === 'admin') {
            // Fetch comprehensive stats for BOTH roles (endpoint now handles both)
            const statsRes = await api.get("/admin/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdminStats(statsRes.data);
            
             // Fetch Recent Movies (keep existing logic for table)
            const moviesRes = await api.get("/movies", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecentMovies(moviesRes.data.slice(0, 5));

            // Fetch Upcoming Shows (keep existing logic)
             const showsRes = await api.get("/shows/upcoming", {
                headers: { Authorization: `Bearer ${token}` }
           });
           setUpcomingShows(showsRes.data);

        } else {
             // Fallback for regular user or error state?
             // Should not happen on admin page.
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const isSuperAdmin = dbUser?.role === "super_admin";

  // Super Admin Stats: 5 Cards Grid (Screens Removed)
  const superAdminStats = adminStats ? [
    {
      title: "Total Organizations",
      value: adminStats.organizations?.total.toString(),
      trend: adminStats.organizations?.trend,
      icon: Building2,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Theaters",
      value: adminStats.theaters?.total.toString(),
      trend: adminStats.theaters?.trend,
      icon: Store,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Total Movies",
      value: adminStats.movies?.total.toString(),
      trend: adminStats.movies?.trend,
      icon: Film,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
    },
    {
      title: "Active Shows Today",
      value: adminStats.activeShows?.total.toString(),
      trend: adminStats.activeShows?.trend,
      icon: Calendar,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Total Bookings",
      value: adminStats.bookings?.total.toString(),
      subValue: `${adminStats.bookings?.today} today / ${adminStats.bookings?.month} mth`, 
      trend: "All time",
      icon: Ticket,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    }
  ] : [];

  // Theater Admin Stats 
  const theaterAdminStats = adminStats ? [
    {
        title: "Monthly Revenue",
        value: `₹${adminStats.revenue?.total?.toLocaleString() || 0}`,
        trend: adminStats.revenue?.trend,
        icon: TrendingUp,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
      },
      {
        title: "My Movie Catalog",
        value: adminStats.movies?.total?.toString() || "0", 
        trend: adminStats.movies?.trend,
        icon: Film,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
      },
      {
        title: "Total Bookings",
        value: adminStats.bookings?.total?.toString() || "0",
        trend: adminStats.bookings?.trend,
        icon: Ticket,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
      },
      {
        title: "Active Shows",
        value: adminStats.activeShows?.total?.toString() || "0",
        trend: adminStats.activeShows?.trend,
        icon: Calendar,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
      },
  ] : [];

  const stats = isSuperAdmin ? superAdminStats : theaterAdminStats;

  if (loading) {
     return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        </DashboardLayout>
     )
  }

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
        <div className={`grid grid-cols-1 md:grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-3 xl:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
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
                </div>
                <div>
                    <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{stat.title}</h3>
                    <div className="text-2xl font-bold text-white mt-0.5 tracking-tight">{stat.value}</div>
                    {/* Render subValue if present, otherwise change/trend */}
                    {(stat as any).subValue && <p className="text-[10px] text-zinc-400 font-medium mt-1">{(stat as any).subValue}</p>}
                    {(stat as any).trend && !(stat as any).subValue && <p className="text-[10px] text-emerald-400 font-bold mt-1">{(stat as any).trend}</p>}
                     {/* Legacy 'change' support */}
                    {(stat as any).change && !(stat as any).trend && !(stat as any).subValue && <p className="text-[10px] text-emerald-400 font-bold mt-1">{(stat as any).change}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Movies */}
          <Card className="bg-zinc-900/40 border-zinc-900 rounded-2xl overflow-hidden">
                <CardHeader className="px-6 py-5 border-b border-zinc-900 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Recent Movies</CardTitle>
                    <Button variant="ghost" className="text-xs text-zinc-500 hover:text-white px-0 h-auto">View All</Button>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                    {recentMovies.map((movie: any) => (
                        <div
                            key={movie._id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-14 bg-zinc-800 rounded-md overflow-hidden flex items-center justify-center relative">
                                    {movie.poster ? (
                                        <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <Film className="w-5 h-5 text-zinc-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-white line-clamp-1">{movie.title}</p>
                                    <p className="text-[10px] text-zinc-500 font-medium uppercase mt-0.5 tracking-wide">{movie.description?.substring(0, 20)}...</p>
                                </div>
                            </div>
                            {/* <Button size="icon" variant="ghost" className="rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/50 w-8 h-8">
                                <Settings className="w-4 h-4" />
                            </Button> */}
                        </div>
                    ))}
                    {recentMovies.length === 0 && <p className="text-zinc-500 text-center py-4 text-sm">No recent movies</p>}
                </CardContent>
            </Card>

            {/* Upcoming Schedule */}
            <Card className="bg-zinc-900/40 border-zinc-900 rounded-2xl overflow-hidden">
                <CardHeader className="px-6 py-5 border-b border-zinc-900">
                    <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Upcoming Shows</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                    {upcomingShows.map((show: any) => (
                        <div
                            key={show._id}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800/50 cursor-pointer group"
                        >
                            <div className="w-12 h-10 rounded-lg bg-zinc-800 flex flex-col items-center justify-center border border-zinc-700/50">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase">
                                    {new Date(show.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </span>
                                <span className="text-sm font-bold text-white">{show.time}</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-white">{show.movie?.title}</p>
                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">{show.theaterId?.name}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                        </div>
                    ))}
                    {upcomingShows.length === 0 && <p className="text-zinc-500 text-center py-4 text-sm">No upcoming shows</p>}
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

