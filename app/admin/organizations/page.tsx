"use client";

import DashboardLayout from "@/components/admin/DashboardLayout";
import { Building2 } from "lucide-react";

export default function AdminOrganizationsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-[60vh] text-center opacity-50">
        <Building2 className="w-24 h-24 mb-6 text-zinc-800" />
        <h1 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Organization Management</h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Module under development.</p>
      </div>
    </DashboardLayout>
  );
}
