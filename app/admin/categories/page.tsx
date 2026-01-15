"use client";

import DashboardLayout from "@/components/admin/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, Edit, Loader2, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUser();
  const { getToken } = useAuth();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const token = await getToken();
      const response = await api.get("/categories", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || "" });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await getToken();
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData, {
           headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post("/categories", formData, {
           headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
        alert(error.response?.data?.message || "Failed to save category");
    } finally {
        setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
        const token = await getToken();
        await api.delete(`/categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchCategories();
    } catch (error) {
        console.error("Error deleting category:", error);
    }
  };

  const filteredCategories = categories.filter((c: any) => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Categories</h1>
            <p className="text-zinc-500 text-sm mt-1">Manage movie categories and genres.</p>
          </div>
          <Button 
            onClick={() => handleOpenModal()} 
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-10 px-6 font-semibold transition-all shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
                placeholder="Search categories..."
                className="pl-10 bg-zinc-900/50 border-zinc-800 text-white focus:ring-purple-500/20 h-10 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category: any) => (
                <div key={category._id} className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 hover:bg-zinc-900/60 transition-colors group">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">{category.name}</h3>
                                <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{category.description || "No description"}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => handleOpenModal(category)}>
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-rose-400" onClick={() => handleDelete(category._id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
             {filteredCategories.length === 0 && !loading && (
                <div className="col-span-full py-12 text-center text-zinc-500 text-sm">
                    No categories found.
                </div>
            )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-900 sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">
                    {editingCategory ? "Edit Category" : "Add Category"}
                </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Name</label>
                    <Input 
                        placeholder="e.g. Science Fiction" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        className="bg-zinc-900 border-zinc-800 text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                    <Textarea 
                        placeholder="Optional description..." 
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="bg-zinc-900 border-zinc-800 text-white min-h-[100px]"
                    />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingCategory ? "Update" : "Create")}
                </Button>
            </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
