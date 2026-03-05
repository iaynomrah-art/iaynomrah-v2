"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { BettingPlatformForm } from "./BettingPlatformForm";
import { PlatformWebsite } from "@/types";

interface BettingPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform?: PlatformWebsite | null;
  onSuccess?: (saved: PlatformWebsite) => void;
}

export const BettingPlatformModal = ({
  isOpen,
  onClose,
  platform,
  onSuccess,
}: BettingPlatformModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#050505] border-gray-800 text-white max-w-lg p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {platform ? "Edit Betting Platform" : "Add Betting Platform"}
        </DialogTitle>
        <div className="p-6">
          <BettingPlatformForm
            platform={platform}
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
