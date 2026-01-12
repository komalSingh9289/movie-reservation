"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Building2, Save, Plus, Trash2, MapPin, Film, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useUser } from "@clerk/nextjs";

export default function SettingsPage() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        organizationName: "",
        organizationDescription: "",
        name: "",
        location: "",
        description: "",
        screens: [] as { name: string; capacity: number }[],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getToken();
                // We'll use the sync endpoint to get current dbUser which has org/theater IDs
                const res = await fetch("http://localhost:5000/users/sync", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        clerkId: user?.id,
                        name: user?.fullName,
                        email: user?.primaryEmailAddress?.emailAddress,
                        avatar: user?.imageUrl,
                    }),
                });
                const dbUser = await res.json();

                if (dbUser.organizationId && dbUser.theaterId) {
                    // Fetch organization and theater details
                    // Assuming we have a way to get theater details, let's just fetch all theaters and find ours for now or add a GET /theaters/me
                    // For simplicity, let's assume registration gave us the data, but here we need to fetch.
                    // I realized I didn't add GET /theaters/me. Let me add it quickly or just use the update route to "get" if I modify it.
                    // Better to just fetch the specific theater.
                    
                    const theaterRes = await fetch(`http://localhost:5000/theaters/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const myTheater = await theaterRes.json();
                    
                    if (myTheater && !myTheater.message) {
                        setFormData({
                            organizationName: myTheater.organizationId?.name || "",
                            organizationDescription: myTheater.organizationId?.description || "",
                            name: myTheater.name,
                            location: myTheater.location,
                            description: myTheater.description || "",
                            screens: myTheater.screens || [],
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setFetching(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, getToken]);

    const handleAddScreen = () => {
        setFormData({
            ...formData,
            screens: [...formData.screens, { name: `Screen ${formData.screens.length + 1}`, capacity: 100 }],
        });
    };

    const handleRemoveScreen = (index: number) => {
        const updatedScreens = formData.screens.filter((_, i) => i !== index);
        setFormData({ ...formData, screens: updatedScreens });
    };

    const handleScreenChange = (index: number, field: string, value: any) => {
        const updatedScreens = [...formData.screens];
        updatedScreens[index] = { ...updatedScreens[index], [field]: value };
        setFormData({ ...formData, screens: updatedScreens });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = await getToken();
            const response = await fetch("http://localhost:5000/theaters/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Settings updated successfully!");
            } else {
                const error = await response.json();
                alert(error.message || "Update failed");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                            <Sparkles className="w-3 h-3" /> Management Console
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Venue & Organization</h1>
                        <p className="text-zinc-500 text-sm mt-1">Configure your cinematic entity and theater infrastructure.</p>
                    </div>
                    
                    <Button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 px-8 font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Syncing..." : (
                            <>
                                <Save className="w-4 h-4 mr-2" /> Save Changes
                            </>
                        )}
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Organization Details */}
                    <Card className="bg-zinc-900/40 border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-xl">
                        <CardHeader className="p-8 pb-4 border-b border-zinc-800/50">
                            <CardTitle className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-purple-400" /> Organization Profile
                            </CardTitle>
                            <CardDescription className="text-zinc-500 font-medium">Global identity of your cinema group.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-1">Organization Name</Label>
                                <Input 
                                    placeholder="e.g. Celestial Cinema Group"
                                    className="h-12 bg-zinc-800/30 border-zinc-800 focus:border-purple-500/50 transition-all rounded-xl text-white"
                                    value={formData.organizationName}
                                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-1">Organization Description</Label>
                                <Textarea 
                                    placeholder="Brief narrative of your cinema group..."
                                    className="min-h-[100px] bg-zinc-800/30 border-zinc-800 focus:border-purple-500/50 transition-all rounded-xl text-white p-4"
                                    value={formData.organizationDescription}
                                    onChange={(e) => setFormData({ ...formData, organizationDescription: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Theater details */}
                    <Card className="bg-zinc-900/40 border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-xl">
                        <CardHeader className="p-8 pb-4 border-b border-zinc-800/50">
                            <CardTitle className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3">
                                <Film className="w-5 h-5 text-blue-400" /> Theater Identity
                            </CardTitle>
                            <CardDescription className="text-zinc-500 font-medium">Specific venue configuration and location.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-1">Theater Name</Label>
                                    <Input 
                                        placeholder="e.g. Grand Cineplex"
                                        className="h-12 bg-zinc-800/30 border-zinc-800 focus:border-purple-500/50 transition-all rounded-xl text-white"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-1">Location / Address</Label>
                                    <Input 
                                        placeholder="e.g. Downtown, Mumbai"
                                        className="h-12 bg-zinc-800/30 border-zinc-800 focus:border-purple-500/50 transition-all rounded-xl text-white"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-1">Venue Bio</Label>
                                <Textarea 
                                    placeholder="Describe the cinematic experience at this theater..."
                                    className="min-h-[100px] bg-zinc-800/30 border-zinc-800 focus:border-purple-500/50 transition-all rounded-xl text-white p-4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Screen Management */}
                    <Card className="bg-zinc-900/40 border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-xl">
                        <CardHeader className="p-8 pb-4 border-b border-zinc-800/50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3">
                                    <Info className="w-5 h-5 text-emerald-400" /> Screen Infrastructure
                                </CardTitle>
                                <CardDescription className="text-zinc-500 font-medium">Manage individual screens and their seating capacities.</CardDescription>
                            </div>
                            <Button 
                                onClick={handleAddScreen}
                                variant="outline" 
                                className="border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800 text-white rounded-xl h-10 px-4 font-bold text-xs"
                            >
                                <Plus className="w-4 h-4 mr-2 text-emerald-400" /> Add Screen
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formData.screens.map((screen, index) => (
                                    <div 
                                        key={index}
                                        className="p-5 rounded-2xl bg-zinc-800/30 border border-zinc-800/50 border-white/5 group hover:border-purple-500/30 transition-all space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Screen {index + 1}</span>
                                            <Button 
                                                onClick={() => handleRemoveScreen(index)}
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-1">Screen Name</Label>
                                                <Input 
                                                    placeholder="e.g. IMAX Hall"
                                                    className="h-10 bg-zinc-900/50 border-zinc-800 focus:border-purple-500/30 transition-all rounded-lg text-white text-sm"
                                                    value={screen.name}
                                                    onChange={(e) => handleScreenChange(index, "name", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-1">Seat Capacity</Label>
                                                <Input 
                                                    type="number"
                                                    placeholder="e.g. 240"
                                                    className="h-10 bg-zinc-900/50 border-zinc-800 focus:border-purple-500/30 transition-all rounded-lg text-white text-sm"
                                                    value={screen.capacity}
                                                    onChange={(e) => handleScreenChange(index, "capacity", parseInt(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {formData.screens.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-zinc-800/50 rounded-3xl">
                                    <div className="bg-zinc-800/50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Info className="w-6 h-6 text-zinc-600" />
                                    </div>
                                    <p className="text-zinc-500 text-sm font-medium">No screens configured for this theater yet.</p>
                                    <Button 
                                        onClick={handleAddScreen}
                                        variant="link" 
                                        className="text-purple-400 font-bold text-xs uppercase tracking-wider mt-2"
                                    >
                                        Initialize Infrastructure →
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
