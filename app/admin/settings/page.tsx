"use client";

import DashboardLayout from "@/components/admin/DashboardLayout";
import { Settings, Shield, Bell, Database, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
            <p className="text-zinc-500 text-sm mt-1">Configure global platform parameters and security protocols.</p>
          </div>
          
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-10 px-6 font-semibold transition-all">
            <Save className="w-4 h-4 mr-2" /> Save Configuration
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl overflow-hidden group">
                <CardHeader className="p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-zinc-800 rounded-xl group-hover:bg-zinc-700 transition-colors">
                            <Shield className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Security Architecture</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Authentication Key (Read Only)</Label>
                        <Input 
                            disabled 
                            value="sk_production_8472_v9_secure_endpoint" 
                            className="h-10 bg-zinc-800/50 border-zinc-700 text-zinc-400 font-mono text-xs rounded-lg" 
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl overflow-hidden group">
                <CardHeader className="p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-zinc-800 rounded-xl group-hover:bg-zinc-700 transition-colors">
                            <Bell className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">System Alerts</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                        <p className="text-xs text-zinc-500 font-medium">Notification services are operating at peak efficiency. No critical alerts reported.</p>
                        <Button variant="link" className="text-blue-400 font-bold text-[10px] uppercase tracking-wider p-0 h-auto mt-3">Browse Alert Logs →</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800 rounded-2xl overflow-hidden group">
                <CardHeader className="p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-zinc-800 rounded-xl group-hover:bg-zinc-700 transition-colors">
                            <Database className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Vault Integrity</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 flex flex-col md:flex-row gap-4">
                    <Button variant="outline" className="flex-1 h-11 rounded-lg border-zinc-800 hover:bg-zinc-800 font-bold text-xs transition-all">
                        <Database className="w-4 h-4 mr-2 text-emerald-400" /> Create System Snapshot
                    </Button>
                    <Button variant="ghost" className="flex-1 h-11 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-bold text-xs transition-all">
                        Flush Cache Buffers
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

