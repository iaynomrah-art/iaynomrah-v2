"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Trash2, Server } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Unit, Franchise } from "@/types";
import { deleteUnit } from "@/helper/units";
import { UnitsCard } from "./UnitsCard";
import { UnitsModal } from "./UnitsModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UnitWithFranchise extends Unit {
  franchise?: Franchise | null;
}

interface UnitsListProps {
  initialUnits: UnitWithFranchise[];
}

const UnitsList = ({ initialUnits }: UnitsListProps) => {
  const router = useRouter();
  const [units, setUnits] = useState<UnitWithFranchise[]>(initialUnits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithFranchise | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setUnits(initialUnits);
  }, [initialUnits]);

  const confirmDelete = async () => {
    if (!unitToDelete) return;
    const previousUnits = [...units];
    setUnits((prev) => prev.filter((u) => u.id !== unitToDelete.id));

    try {
      await deleteUnit(unitToDelete.id);
      toast.success("Unit deleted successfully");
    } catch (error) {
      setUnits(previousUnits);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete unit";
      toast.error(errorMessage);
    }
    setUnitToDelete(null);
  };

  const handleEdit = (unit: UnitWithFranchise) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedUnit(null);
    setIsModalOpen(true);
  };

  const filteredUnits = units.filter(u => 
    u.unit_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.franchise?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input 
            placeholder="Search units or franchises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#0A0A0A] border-gray-800 focus:border-blue-600 transition-all h-10 w-full"
          />
        </div>
        <Button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-lg shadow-blue-900/20 px-6 h-10 active:scale-95 transition-all w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Unit
        </Button>
      </div>

      {/* Grid: 1 column on mobile, 2 on medium, 4 on large screens */}
      {filteredUnits.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[#0A0A0A] border border-gray-800 border-dashed rounded-xl shadow-inner">
          <Server className="w-12 h-12 text-gray-800 mb-4" />
          <p className="text-gray-500 italic">
            {searchQuery ? `No results found for "${searchQuery}"` : "No units have been created yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
          {filteredUnits.map((u) => (
            <div key={u.id} className="h-full">
              <UnitsCard 
                unit={u} 
                onEdit={handleEdit} 
                onDelete={(id, name) => setUnitToDelete({ id, name })} 
              />
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <UnitsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        unit={selectedUnit}
        onSuccess={(saved) => {
          if (selectedUnit) {
            setUnits(prev => prev.map(u => u.id === saved.id ? { ...u, ...saved } : u));
          } else {
            setUnits(prev => [saved as UnitWithFranchise, ...prev]);
          }
          router.refresh();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!unitToDelete} onOpenChange={(open) => !open && setUnitToDelete(null)}>
        <DialogContent className="bg-[#0A0A0A] border-gray-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete unit: <span className="text-white font-semibold">{unitToDelete?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setUnitToDelete(null)}
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Delete Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnitsList;
