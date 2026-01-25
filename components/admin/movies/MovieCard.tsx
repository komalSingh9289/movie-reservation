"use client";

import { Globe, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MovieCardProps {
  movie: any;
  isAdded?: boolean;
  isSuperAdmin?: boolean;
  onAdd?: (id: string) => void;
  addingId?: string | null;
  onEdit?: (movie: any) => void;
  onDelete?: (id: string) => void;
}

export default function MovieCard({
  movie,
  isAdded,
  isSuperAdmin,
  onAdd,
  addingId,
  onEdit,
  onDelete,
}: MovieCardProps) {
  return (
    <Card className="bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all rounded-2xl overflow-hidden w-full max-w-[260px]">

      {/* Poster */}
      <div className="relative h-[300px] overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {isAdded && !isSuperAdmin && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1.5 rounded-lg shadow-md">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}

        {/* Meta */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          <span className="px-2 py-0.5 bg-black/60 rounded-md text-[9px] font-bold uppercase text-white flex items-center gap-1">
            <Globe className="w-3 h-3 text-purple-400" />
            {movie.language}
          </span>
          <span className="px-2 py-0.5 bg-black/60 rounded-md text-[9px] font-bold uppercase text-white flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400" />
            {movie.duration}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="text-sm font-semibold text-white line-clamp-1">
          {movie.title}
        </h3>

        <p className="text-[11px] text-zinc-500 line-clamp-1 italic">
          {movie.description}
        </p>

        {!isSuperAdmin ? (
          <Button
            onClick={() => !isAdded && onAdd?.(movie._id)}
            disabled={isAdded || addingId === movie._id}
            className={`w-full h-9 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all ${
              isAdded
                ? "bg-zinc-800/50 text-zinc-500 cursor-default"
                : "bg-white text-black hover:bg-purple-500 hover:text-white"
            }`}
          >
            {addingId === movie._id
              ? "Processing..."
              : isAdded
              ? "Enabled"
              : "Add"}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              className="flex-1 h-8 text-[9px] uppercase tracking-widest border-zinc-700 hover:bg-zinc-800 text-white"
              onClick={() => onEdit?.(movie)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-[9px] uppercase tracking-widest border-zinc-700 text-rose-400 hover:bg-rose-500/10 hover:text-rose-400"
              onClick={() => onDelete?.(movie._id)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
