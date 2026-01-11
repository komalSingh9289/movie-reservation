"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isLoaded) return;

      if (!user) {
        router.push("/sign-in");
        return;
      }

      try {
        const token = await getToken();
        const response = await fetch("http://localhost:5000/users/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clerkId: user.id,
            name: user.fullName || user.username || "Anonymous",
            email: user.primaryEmailAddress?.emailAddress,
            avatar: user.imageUrl,
          }),
        });

        const dbUser = await response.json();

        if (dbUser.role === "admin" || dbUser.role === "super_admin") {
          setIsAdmin(true);
          setRole(dbUser.role);
        } else {
          setIsAdmin(false);
          router.push("/unauthorized");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/");
      }
    };

    checkAdmin();
  }, [user, isLoaded, router, getToken]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-black text-zinc-100 selection:bg-purple-500/30">
        <AppSidebar role={role} />
        <SidebarInset className="flex-1 bg-[#050505]">
          <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-6 border-b border-zinc-900 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-zinc-400 hover:text-white transition-colors" />
              <div className="h-4 w-[1px] bg-zinc-900 mx-2" />
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <span>{role === "super_admin" ? "Super Admin" : "Theater Admin"}</span>
                <span className="text-zinc-900">/</span>
                <span className="text-purple-400">Dashboard</span>
              </div>
            </div>
          </header>
          <main className="p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
