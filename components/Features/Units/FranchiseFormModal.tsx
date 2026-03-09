"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FranchiseForm } from "./FranchiseForm";
import { Franchise } from "@/types";

interface FranchiseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  franchise?: Franchise | null;
  onSuccess?: (saved: Franchise) => void;
}

export const FranchiseFormModal = ({ isOpen, onClose, franchise, onSuccess }: FranchiseFormModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#050505] border-gray-800 text-white max-w-lg p-0 overflow-hidden" aria-describedby={undefined}>
        <DialogTitle className="sr-only">
          {franchise ? "Edit Franchise" : "Add Franchise"}
        </DialogTitle>
        <div className="p-6">
          <FranchiseForm
            franchise={franchise}
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
