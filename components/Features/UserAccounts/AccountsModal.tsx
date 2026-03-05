"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccountsForm } from "./AccountsForm";
import { UserAccount } from "@/types";

interface AccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: UserAccount | null;
  onSuccess?: (saved: UserAccount) => void;
}

export const AccountsModal = ({
  isOpen,
  onClose,
  account,
  onSuccess,
}: AccountsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#050505] border-gray-800 text-white max-w-lg p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {account ? "Edit Account" : "Add Account"}
        </DialogTitle>
        <div className="p-6">
          <AccountsForm
            account={account}
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
