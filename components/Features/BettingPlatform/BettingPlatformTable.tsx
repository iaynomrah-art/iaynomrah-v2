"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Globe, PlusCircle, Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { deletePlatformWebsite } from "@/helper/platform_website";
import { BettingPlatformModal } from "./BettingPlatformModal";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { PlatformWebsite } from "@/types";

interface BettingPlatformTableProps {
  initialPlatforms: PlatformWebsite[];
}

const BettingPlatformTable = ({ initialPlatforms }: BettingPlatformTableProps) => {
  const router = useRouter();
  const [platforms, setPlatforms] = useState<PlatformWebsite[]>(initialPlatforms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformWebsite | null>(null);
  const [platformToDelete, setPlatformToDelete] = useState<{ id: number; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setPlatforms(initialPlatforms);
  }, [initialPlatforms]);

  const confirmDelete = async () => {
    if (!platformToDelete) return;
    const previousPlatforms = [...platforms];
    setPlatforms((prev) => prev.filter((p) => p.id !== platformToDelete.id));

    try {
      await deletePlatformWebsite(platformToDelete.id);
      toast.success("Platform deleted successfully");
    } catch (error) {
      setPlatforms(previousPlatforms);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete platform";
      toast.error(errorMessage);
    }
    setPlatformToDelete(null);
  };

  const handleEdit = (platform: PlatformWebsite) => {
    setSelectedPlatform(platform);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPlatform(null);
    setIsModalOpen(true);
  };

  const filteredPlatforms = platforms.filter(p => 
    p.platform_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.platform_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.platform_website?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input 
            placeholder="Search platforms, codes, or URLs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#0A0A0A] border-gray-800 focus:border-emerald-600 transition-all"
          />
        </div>
        <Button
          onClick={handleCreate}
          className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg shadow-emerald-900/20 px-6 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Add Platform
        </Button>
      </div>

      <div className="rounded-xl border border-gray-800 bg-[#0A0A0A] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-[#111111]">
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider w-[120px] px-6 py-4">
                Actions
              </TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider px-6 py-4">
                Platform Name
              </TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider px-6 py-4">
                Website URL
              </TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-6 py-4">
                Min Bet
              </TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider px-6 py-4">
                Brand Colors
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlatforms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-gray-500 italic border-gray-800"
                >
                  {searchQuery ? `No results found for "${searchQuery}"` : "No platforms found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredPlatforms.map((p) => (
                <TableRow
                  key={p.id}
                  className="border-gray-800 hover:bg-gray-900/40 transition-colors group"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-400/70 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                        onClick={() => handleEdit(p)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                        onClick={() =>
                          setPlatformToDelete({
                            id: p.id,
                            name: p.platform_name || "Unknown",
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-200 font-semibold text-xs">
                        {p.platform_name}
                      </span>
                      {p.platform_code && (
                        <span className="text-[9px] text-gray-500 font-mono">
                          CODE: {p.platform_code}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {p.platform_website ? (
                      <a 
                        href={p.platform_website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-emerald-400/70 hover:text-emerald-400 text-xs transition-colors"
                      >
                        <Globe className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{p.platform_website.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span className="text-gray-700 italic text-xs">No link</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span className="text-gray-300 text-xs font-mono">
                      {p.min_bet !== null ? `$${p.min_bet}` : "-"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <div 
                          className="w-6 h-6 rounded border border-gray-800 shadow-sm"
                          style={{ backgroundColor: p.bg_color || '#333' }}
                          title="Background Color"
                        />
                        <span className="text-[8px] text-gray-500 font-mono uppercase">{p.bg_color}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div 
                          className="w-6 h-6 rounded border border-gray-800 shadow-sm"
                          style={{ backgroundColor: p.text_color || '#FFF' }}
                          title="Text Color"
                        />
                        <span className="text-[8px] text-gray-500 font-mono uppercase">{p.text_color}</span>
                      </div>
                      <div 
                        className="ml-2 px-2 py-1 rounded text-[10px] font-bold border"
                        style={{ backgroundColor: p.bg_color || '#333', color: p.text_color || '#FFF', borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        PREVIEW
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BettingPlatformModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        platform={selectedPlatform}
        onSuccess={(saved) => {
          if (selectedPlatform) {
            // Update existing
            setPlatforms(prev => prev.map(p => p.id === saved.id ? saved : p));
          } else {
            // Add new
            setPlatforms(prev => [...prev, saved]);
          }
          router.refresh();
        }}
      />

      <Dialog open={!!platformToDelete} onOpenChange={(open) => !open && setPlatformToDelete(null)}>
        <DialogContent className="bg-[#0A0A0A] border-gray-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete platform: <span className="text-white font-semibold">{platformToDelete?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setPlatformToDelete(null)}
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Delete Platform
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BettingPlatformTable;
