"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { UnitsForm } from "./UnitsForm";
import { Unit } from "@/types";

interface UnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: Unit | null;
  onSuccess?: (saved: Unit) => void;
}

export const UnitsModal = ({ isOpen, onClose, unit, onSuccess }: UnitsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#050505] border-gray-800 text-white max-w-lg p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {unit ? "Edit Unit" : "Add Unit"}
        </DialogTitle>
        <div className="p-6">
          <UnitsForm
            unit={unit}
            onSuccess={(saved) => {
              if (onSuccess) onSuccess(saved);
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
