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
  { name: "Global Overview", icon: TrendingUp, href: "/admin" },
  { name: "Theaters", icon: Building2, href: "/admin/theaters" },
  { name: "User Directory", icon: Users, href: "/admin/users" },
  { name: "Platform Settings", icon: Settings, href: "/admin/settings" },
];

const theaterAdminItems = [
  { name: "Theater Hub", icon: TrendingUp, href: "/admin" },
  { name: "My Movies", icon: Film, href: "/admin/movies" },
  { name: "Show Times", icon: Calendar, href: "/admin/shows" },
  { name: "Local Users", icon: Users, href: "/admin/users" },
  { name: "Venue Settings", icon: Settings, href: "/admin/settings" },
];

export function AppSidebar({ role }: { role: string | null }) {
  const { user } = useUser();
  const pathname = usePathname();

  const menuItems = role === "super_admin" ? superAdminItems : theaterAdminItems;

  return (
    <Sidebar className="border-r border-zinc-900 bg-black">
      <SidebarHeader className="p-6">
        <Link href="/admin" className="flex items-center gap-3 active:scale-95 transition-transform">
            <div className="bg-purple-600 p-2 rounded-lg shadow-lg shadow-purple-600/20">
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
          <SidebarGroupLabel className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-3 mb-2">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`flex items-center gap-3 px-3 py-5 rounded-lg transition-colors ${
                        isActive 
                        ? "bg-zinc-900 text-white" 
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                      }`}
                    >
                      <Link href={item.href}>
                        <item.icon className={`w-4 h-4 ${isActive ? "text-purple-400" : ""}`} />
                        <span className="font-medium text-sm">
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

      <SidebarFooter className="p-4 mt-auto border-t border-zinc-900">
        <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-zinc-900/30 border border-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white truncate max-w-[80px]">
                            {user?.firstName || "Admin"}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium">
                            Admin Role
                        </span>
                    </div>
                </div>
            </div>

            <Button 
                variant="ghost" 
                asChild
                className="w-full h-10 flex items-center justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg px-3 transition-colors text-xs"
            >
                <Link href="/">
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Exit to Website</span>
                </Link>
            </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
