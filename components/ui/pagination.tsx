"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8 py-4">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded-xl"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2">
                {getPageNumbers().map(page => (
                    <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => onPageChange(page)}
                        className={`min-w-[40px] h-10 rounded-xl font-bold transition-all ${
                            currentPage === page 
                                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20" 
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                        }`}
                    >
                        {page}
                    </Button>
                ))}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded-xl"
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
