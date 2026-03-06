"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, Pencil, Trash2, Loader2, Building2 } from "lucide-react";
import { Franchise, getFranchises, deleteFranchise } from "@/helper/franchise";
import { FranchiseFormModal } from "./FranchiseFormModal";
import { toast } from "sonner";

interface FranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FranchiseModal = ({ isOpen, onClose }: FranchiseModalProps) => {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);

  const fetchFranchises = async () => {
    setIsLoading(true);
    try {
      const data = await getFranchises();
      setFranchises(data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch franchises");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFranchises();
    }
  }, [isOpen]);

  const handleEdit = (franchise: Franchise) => {
    setSelectedFranchise(franchise);
    setIsFormModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedFranchise(null);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this franchise?")) return;
    try {
      await deleteFranchise(id);
      toast.success("Franchise deleted successfully");
      fetchFranchises();
    } catch (e) {
       console.error(e);
       toast.error("Failed to delete franchise");
    }
  };

  const filteredFranchises = franchises.filter(f => 
    f.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#050505] border-gray-800 text-white max-w-3xl flex flex-col h-[80vh]">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-gray-800 pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Building2 className="w-5 h-5 text-blue-500" />
              Manage Franchises
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 flex-1 overflow-hidden mt-2">
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input 
                  placeholder="Search franchises by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#111111] border-gray-800 focus:border-blue-600 transition-all h-10 w-full"
                />
              </div>
              <Button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-500 text-white gap-2 px-6 h-10 whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                Add Franchise
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto border border-gray-800 rounded-lg bg-[#0A0A0A]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                </div>
              ) : filteredFranchises.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 h-full text-center">
                  <Building2 className="w-12 h-12 text-gray-800 mb-4" />
                  <p className="text-gray-500 italic">No franchises found.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {filteredFranchises.map(franchise => (
                    <div key={franchise.id} className="flex items-center justify-between p-4 hover:bg-[#111111] transition-colors">
                      <div>
                        <h3 className="font-semibold text-white">{franchise.name} {franchise.code && <span className="text-gray-500 text-sm ml-2 font-normal">({franchise.code})</span>}</h3>
                        {(franchise.description || franchise.investor_name) && (
                          <div className="text-xs text-gray-500 mt-1 flex gap-3">
                            {franchise.investor_name && <span><span className="text-gray-600">Investor:</span> {franchise.investor_name}</span>}
                            {franchise.description && <span><span className="text-gray-600">Desc:</span> {franchise.description}</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(franchise)}
                          className="h-8 w-8 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(franchise.id)}
                          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FranchiseFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        franchise={selectedFranchise}
        onSuccess={() => fetchFranchises()}
      />
    </>
  );
};
