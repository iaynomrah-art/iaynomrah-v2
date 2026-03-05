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
import { Trash2, Edit, UserPlus, Search } from "lucide-react";
import { toast } from "sonner";
import { deleteUserAccount } from "@/helper/user_account";
import { AccountsModal } from "./AccountsModal";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { UserAccount, Unit, Franchise } from "@/types";

interface UnitWithFranchise extends Unit {
  franchise?: Franchise | null;
}

interface AccountWithUnit extends UserAccount {
  units?: UnitWithFranchise | null;
}

interface AccountsTableProps {
  initialAccounts: AccountWithUnit[];
}

const AccountsTable = ({ initialAccounts }: AccountsTableProps) => {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountWithUnit[]>(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountWithUnit | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setAccounts(initialAccounts);
  }, [initialAccounts]);

  const confirmDelete = async () => {
    if (!accountToDelete) return;
    const previousAccounts = [...accounts];
    setAccounts((prev) => prev.filter((acc) => acc.id !== accountToDelete.id));

    try {
      await deleteUserAccount(accountToDelete.id);
      toast.success("Account deleted successfully");
    } catch (error) {
      setAccounts(previousAccounts);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete account";
      toast.error(errorMessage);
    }
    setAccountToDelete(null);
  };

  const handleEdit = (account: AccountWithUnit) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedAccount(null);
    setIsModalOpen(true);
  };

  const filteredAccounts = accounts.filter(acc => 
    `${acc.first_name || ""} ${acc.last_name || ""}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.units?.unit_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input 
            placeholder="Search accounts, emails, or PCs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#0A0A0A] border-gray-800 focus:border-blue-600 transition-all"
          />
        </div>
        <Button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-lg shadow-blue-900/20 px-6 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Add Account
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
                Full Name
              </TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider px-6 py-4">
                Email
              </TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider text-center px-6 py-4">
                Contact Details
              </TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider px-6 py-4">
                Owned PC
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-gray-500 italic border-gray-800"
                >
                  {searchQuery ? `No results found for "${searchQuery}"` : "No accounts found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((account) => (
                <TableRow
                  key={account.id}
                  className="border-gray-800 hover:bg-gray-900/40 transition-colors group"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-400/70 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                        onClick={() =>
                          setAccountToDelete({
                            id: account.id,
                            name: `${account.first_name} ${account.last_name}`,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                      <span className="text-gray-200 font-semibold">
                        {account.first_name} {account.last_name}
                      </span>
                      
                  </TableCell>
                  <TableCell className="text-gray-400 px-6 py-4">
                    {account.email || <span className="text-gray-700 italic">No email</span>}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-gray-300 text-xs font-mono">{account.contact_number_1}</span>
                      {account.contact_number_2 && (
                        <span className="text-gray-500 text-[10px] font-mono">{account.contact_number_2}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {account.units?.unit_name ? (
                        <>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20 shadow-sm w-fit">
                            {account.units.unit_name}
                          </span>
                          {account.units.franchise?.name && (
                            <span className="text-[9px] text-gray-500 ml-1">
                              {account.units.franchise.name}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-600 italic text-[11px]">
                          Unassigned
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AccountsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        account={selectedAccount}
        onSuccess={(saved) => {
          if (selectedAccount) {
            setAccounts(prev => prev.map(a => a.id === saved.id ? { ...a, ...saved } : a));
          } else {
            setAccounts(prev => [saved as AccountWithUnit, ...prev]);
          }
          router.refresh();
        }}
      />

      <Dialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
        <DialogContent className="bg-[#0A0A0A] border-gray-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete account: <span className="text-white font-semibold">{accountToDelete?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setAccountToDelete(null)}
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountsTable;