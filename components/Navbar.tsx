"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
  useUser,
  useAuth,
} from "@clerk/nextjs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Clapperboard, LayoutDashboard, Ticket, Heart, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();
  const { getToken } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  // 🔐 Fetch user role safely (no getToken in deps)
  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;

      try {
        const token = await getToken();
        const res = await fetch("http://localhost:5000/users/sync", {
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

        const dbUser = await res.json();
        setUserRole(dbUser.role);
      } catch (err) {
        console.error("Navbar role fetch failed:", err);
      }
    };

    fetchRole();
  }, [user]); // ✅ correct dependency

  // 🌊 Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between transition-all duration-300",
        scrolled
          ? "bg-black/80 backdrop-blur-lg border-b border-white/10 py-3"
          : "bg-transparent"
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-bold text-xl">
        <Clapperboard className="h-7 w-7 text-purple-500" />
        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent font-black text-2xl">
          MyShows
        </span>
      </Link>

      {/* Desktop Menu */}
      {!isMobile && (
        <NavigationMenu>
          <NavigationMenuList className="gap-2">
            {["Home", "Movies"].map((item) => (
              <NavigationMenuItem key={item}>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent text-white hover:bg-white/10 hover:text-purple-400"
                  )}
                >
                  <Link href={item === "Home" ? "/" : "/movies"}>
                    {item}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      )}

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="ghost" className="text-white hover:text-purple-400">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="bg-purple-600 hover:bg-purple-700 rounded-full px-6">
              Sign Up
            </Button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          {/* Role-based links */}
          {(userRole === "admin" || userRole === "super_admin") && (
            <Link
              href="/admin"
              className="flex items-center gap-1 text-sm text-white hover:text-purple-400"
            >
              <LayoutDashboard className="w-4 h-4" />
              {userRole === "super_admin" ? "Platform Control" : "Theater Hub"}
            </Link>
          )}

          {userRole === "user" && (
            <>
              <Link
                href="/register-theater"
                className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 font-bold"
              >
                <Building2 className="w-4 h-4" />
                Register as Admin
              </Link>

              <Link
                href="/bookings"
                className="flex items-center gap-1 text-sm text-white hover:text-purple-400"
              >
                <Ticket className="w-4 h-4" />
                My Bookings
              </Link>

              <Link
                href="/favourites"
                className="flex items-center gap-1 text-sm text-white hover:text-purple-400"
              >
                <Heart className="w-4 h-4" />
                Favourites
              </Link>
            </>
          )}

          {/* Clerk Profile Button */}
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox:
                  "w-10 h-10 border-2 border-purple-500/50 hover:border-purple-500 transition-all",
              },
            }}
          />
        </SignedIn>
      </div>
    </nav>
  );
}
