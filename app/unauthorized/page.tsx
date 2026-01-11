"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 mb-4 animate-pulse">
           <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        
        <h1 className="text-4xl font-black text-white tracking-tight">
          Access Denied
        </h1>
        
        <p className="text-gray-400 text-lg">
          Oops! You don&apos;t have permission to access this page. This area is reserved for administrators only.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 h-12 font-bold">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="border-white/10 text-white hover:bg-white/5 rounded-full px-8 h-12 font-bold">
            <Link href="mailto:support@myshows.com">
              Contact Support
            </Link>
          </Button>
        </div>
        
        <div className="pt-8 text-sm text-gray-500">
           Error Code: 403_FORBIDDEN
        </div>
      </div>
    </div>
  );
}
