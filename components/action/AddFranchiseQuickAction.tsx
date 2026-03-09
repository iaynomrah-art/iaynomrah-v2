"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FranchiseModal } from "@/components/Features/Units/FranchiseModal";

export function AddFranchiseQuickAction() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="h-12 bg-[#0d0d0d] border border-[#1a1a1a] hover:bg-[#141414] hover:border-blue-500/50 text-white flex items-center justify-start px-4 gap-4 transition-all w-full group/btn"
        variant="outline"
      >
        <Plus className="h-5 w-5 text-blue-500 group-hover/btn:scale-110 transition-transform" />
        <span className="text-sm font-medium">Add Franchise</span>
      </Button>

      <FranchiseModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
