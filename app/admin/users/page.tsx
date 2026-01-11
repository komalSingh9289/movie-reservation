"use client";

import DashboardLayout from "@/components/admin/DashboardLayout";
import { Users, Search, MoreVertical, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
            <p className="text-zinc-500 text-sm mt-1">Review accounts, permissions, and platform activity.</p>
          </div>
          
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-10 px-6 font-semibold transition-all">
             Audit All Users
          </Button>
        </div>

        {/* Search - Simple */}
        <div className="flex flex-col md:flex-row gap-4 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                <Input 
                  placeholder="Search by name, email, or role..." 
                  className="h-11 pl-11 bg-transparent border-none text-white text-sm focus:ring-0 placeholder:text-zinc-600" 
                />
            </div>
            <div className="flex items-center px-3 border-l border-zinc-800">
                <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">1,240 Users</span>
            </div>
        </div>

        {/* Clean Table */}
        <Card className="bg-zinc-900/30 border-zinc-800 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Identify</th>
                                <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Permission</th>
                                <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                                <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="group hover:bg-zinc-800/20 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700/50">
                                                <Users className="w-5 h-5 text-zinc-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-white">User Account {i}</span>
                                                <span className="text-[11px] text-zinc-500">user_{i}@example.com</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className={`w-3.5 h-3.5 ${i === 1 ? 'text-purple-400' : 'text-zinc-600'}`} />
                                            <span className={`text-[11px] font-bold uppercase tracking-wider ${i === 1 ? 'text-white' : 'text-zinc-500'}`}>
                                                {i === 1 ? 'Administrator' : 'General User'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400">
                                            Active
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

