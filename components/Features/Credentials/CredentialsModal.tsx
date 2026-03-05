"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { CredentialsForm } from "./CredentialsForm";
import { Credential } from "@/types";

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credential?: Credential | null;
  onSuccess?: (saved: Credential) => void;
}

export const CredentialsModal = ({
  isOpen,
  onClose,
  credential,
  onSuccess,
}: CredentialsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#050505] border-gray-800 text-white max-w-lg p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {credential ? "Edit Credential" : "Add Credential"}
        </DialogTitle>
        <div className="p-6">
          <CredentialsForm
            credential={credential}
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
