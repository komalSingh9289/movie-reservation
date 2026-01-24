"use client";

import { 
  Users, 
  Film, 
  Ticket, 
  TrendingUp, 
  Calendar,
  Settings,
  LogOut,
  ChevronRight,
  Building2
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const superAdminItems = [
  { name: "Overview", icon: TrendingUp, href: "/admin" },
  { name: "Movies", icon: Film, href: "/admin/movies" },
  { name: "Categories", icon: Calendar, href: "/admin/categories" },
  { name: "Organizations", icon: Building2, href: "/admin/organizations" },
  { name: "Users", icon: Users, href: "/admin/users" },
];

const theaterAdminItems = [
  { name: "Theater Hub", icon: TrendingUp, href: "/admin" },
  { name: "Shows", icon: Calendar, href: "/admin/shows" },
  { name: "Movie Library", icon: Film, href: "/admin/movies" },
  { name: "Bookings", icon: Ticket, href: "/admin/bookings" },
  { name: "Settings", icon: Settings, href: "/admin/settings" },
];

export function AppSidebar({ role }: { role: string | null }) {
  const { user } = useUser();
  const pathname = usePathname();

  const menuItems = role === "super_admin" ? superAdminItems : theaterAdminItems;

  return (
   <Sidebar className="border-r border-zinc-800 bg-zinc-950 text-white dark">
      <SidebarHeader className="p-6">
        <Link href="/admin" className="flex items-center gap-3 active:scale-95 transition-transform group">
            <div className="bg-purple-600 p-2 rounded-lg shadow-lg shadow-purple-600/20 group-hover:scale-110 transition-transform">
                <Film className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white">
                    MyShows
                </span>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider -mt-1">
                    Management
                </span>
            </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 mt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] text-zinc-500 font-black uppercase tracking-widest px-3 mb-2">
            Platform Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`flex items-center gap-3 px-3 py-5 rounded-xl transition-all duration-300 ${
                        isActive 
                        ? "bg-zinc-900 text-white border border-white/5 shadow-xl shadow-black/20" 
                        : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40"
                      }`}
                    >
                      <Link href={item.href}>
                        <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-purple-400" : "group-hover:text-zinc-300"}`} />
                        <span className="font-bold text-sm tracking-tight">
                          {item.name}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto border-t border-zinc-900/50">
        <div className="flex flex-col gap-3">
            <div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                    <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 rounded-lg" } }} />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white truncate max-w-[80px]">
                            {user?.firstName || "Admin"}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">
                             {role?.replace('_', ' ') || 'Admin'}
                        </span>
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
            </div>

            <Button 
                variant="ghost" 
                asChild
                className="w-full h-10 flex items-center justify-start gap-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-3 transition-all text-[11px] font-bold uppercase tracking-wider"
            >
                <Link href="/">
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Exit to Website</span>
                </Link>
            </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
