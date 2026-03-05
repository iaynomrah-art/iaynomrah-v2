"use client";

import React from "react";
import { Unit, Franchise, UserAccount, Bot } from "@/types";
import { Edit, Trash2, User } from "lucide-react";

interface UserAccountWithBots extends UserAccount {
  bot?: Bot[] | null;
}

interface UnitWithDetails extends Unit {
  franchise?: Franchise | null;
  user_account?: UserAccountWithBots[] | null;
}

interface UnitsCardProps {
  unit: UnitWithDetails;
  onEdit: (unit: UnitWithDetails) => void;
  onDelete: (id: string, name: string) => void;
}

export const UnitsCard = ({ unit, onEdit, onDelete }: UnitsCardProps) => {
  const isConnected = unit.status === "connected";
  
  // Try to find the first user account and its bot balance
  const primaryUser = unit.user_account?.[0];
  const primaryBot = primaryUser?.bot?.[0];
  const balance = primaryBot?.balance ?? 0;
  
  const userName = primaryUser
    ? `${primaryUser.first_name || ""} ${primaryUser.last_name || ""}`.trim()
    : "Unassigned";

  // Format balance exactly like the screenshot with the $ sign and green color
  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(balance).replace('$', '$ ');

  return (
    <div className="relative flex flex-col h-[180px] bg-[#1a202c] border border-gray-800 hover:border-blue-500/30 rounded-lg overflow-hidden transition-all group shadow-md justify-between">
      
      {/* Top Right Franchise Badge */}
      {unit.franchise?.code && (
        <div className="absolute top-2 right-2 px-2 py-[2px] rounded text-[10px] font-bold bg-[#1e293b] text-blue-400 border border-blue-900">
          {unit.franchise.code}
        </div>
      )}

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center pt-6 px-4">
        <h3 className="font-bold text-white text-[15px] tracking-wide mb-1" title={unit.unit_name || "Unknown Unit"}>
          {unit.unit_name || "Unnamed"}
        </h3>
        
        <div className="text-[#22c55e] font-bold text-[13px] mb-1">
          {formattedBalance}
        </div>
        
        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
          <User className="w-3.5 h-3.5" />
          <span className="truncate max-w-[150px]">{userName}</span>
        </div>
      </div>

      {/* Bottom Footer block */}
      <div className="px-4 pb-3 flex items-center justify-between">
        
        {/* Status */}
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-orange-500'}`} />
          <span className="text-[11px] text-gray-400">
            {isConnected ? 'Running' : 'Stopped'}
          </span>
        </div>

        {/* Actions - Always visible, but look like icons */}
        <div className="flex items-center gap-2">
          <button
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => onEdit(unit)}
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            className="text-red-400/80 hover:text-red-500 transition-colors"
            onClick={() => onDelete(unit.id, unit.unit_name || "Unknown")}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
