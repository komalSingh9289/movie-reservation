"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function SyncUser() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const sync = async () => {
      if (isLoaded && user) {
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

          if (response.ok) {
            const dbUser = await response.json();
            if (dbUser.role === "admin" && pathname === "/") {
              router.push("/admin");
            }
          } else {
            console.error("Failed to sync user to DB");
          }
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      }
    };

    sync();
  }, [user, isLoaded, pathname, router]);

  return null;
}
