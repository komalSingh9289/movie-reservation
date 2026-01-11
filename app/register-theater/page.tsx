"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, MapPin, Film, Plus, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function RegisterTheater() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getToken();
      const response = await fetch("http://localhost:5000/theaters/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin");
      } else {
        const error = await response.json();
        alert(error.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-purple-500/30">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3" /> Partner with MyShows
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-4">Register Your <span className="text-purple-500 italic">Theater</span></h1>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
                Join our platform to manage your movie screenings, track sales, and reach thousands of moviegoers.
            </p>
        </div>

        <Card className="bg-zinc-900/30 border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-xl">
            <CardHeader className="p-8 pb-4 border-b border-zinc-800/50">
                <CardTitle className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-purple-400" /> Theater Identity
                </CardTitle>
                <CardDescription className="text-zinc-500">Provide the essential details about your cinematic venue.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Theater Name</label>
                            <div className="relative group">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                                <Input 
                                    required
                                    placeholder="e.g. Grand Cineplex"
                                    className="h-12 pl-10 bg-zinc-800/30 border-zinc-800 focus:border-purple-500/50 transition-all rounded-xl text-white"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Location / Address</label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                                <Input 
                                    required
                                    placeholder="e.g. Downtown, Mumbai"
                                    className="h-12 pl-10 bg-zinc-800/30 border-zinc-800 focus:border-purple-500/50 transition-all rounded-xl text-white"
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Venue Description</label>
                        <Textarea 
                            placeholder="Briefly describe your theater facilities, screen types (IMAX, 4D), etc..."
                            className="min-h-[120px] bg-zinc-800/30 border-zinc-800 focus:border-purple-500/50 transition-all rounded-xl text-white p-4"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="pt-4">
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-purple-600/20 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Registering..." : (
                                <span className="flex items-center gap-2">
                                     Finalize Registration <Plus className="w-5 h-5" />
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>

        <p className="text-center text-zinc-600 text-xs mt-8">
            By registering, you agree to our platform's terms of service and administrative guidelines.
        </p>
      </main>
    </div>
  );
}
