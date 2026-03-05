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
import { Trash2, Edit, Key, ShieldPlus, Search, Copy } from "lucide-react";
import { toast } from "sonner";
import { deleteCredential } from "@/helper/credential";
import { CredentialsModal } from "./CredentialsModal";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Credential, UserAccount, PlatformWebsite } from "@/types";

interface CredentialWithJoined extends Credential {
  user_account?: UserAccount | null;
  platform_website?: PlatformWebsite | null;
}

interface CredentialsTableProps {
  initialCredentials: CredentialWithJoined[];
}

const CredentialsTable = ({ initialCredentials }: CredentialsTableProps) => {
  const router = useRouter();
  const [credentials, setCredentials] = useState<CredentialWithJoined[]>(initialCredentials);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<CredentialWithJoined | null>(null);
  const [credentialToDelete, setCredentialToDelete] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setCredentials(initialCredentials);
  }, [initialCredentials]);

  const confirmDelete = async () => {
    if (!credentialToDelete) return;
    const previousCredentials = [...credentials];
    setCredentials((prev) => prev.filter((c) => c.id !== credentialToDelete.id));

    try {
      await deleteCredential(credentialToDelete.id);
      toast.success("Credential deleted successfully");
    } catch (error) {
      setCredentials(previousCredentials);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete credential";
      toast.error(errorMessage);
    }
    setCredentialToDelete(null);
  };

  const handleEdit = (credential: CredentialWithJoined) => {
    setSelectedCredential(credential);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCredential(null);
    setIsModalOpen(true);
  };

  const filteredCredentials = credentials.filter(c => 
    `${c.user_account?.first_name} ${c.user_account?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.platform_website?.platform_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input 
            placeholder="Search by name, platform, or username..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#0A0A0A] border-gray-800 focus:border-purple-600 transition-all"
          />
        </div>
        <Button
          onClick={handleCreate}
          className="bg-purple-600 hover:bg-purple-500 text-white gap-2 shadow-lg shadow-purple-900/20 px-6 active:scale-95 transition-all"
        >
          <ShieldPlus className="w-4 h-4" />
          Add Credential
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
                Account Holder
              </TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider px-6 py-4">
                Platform
              </TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider px-6 py-4">
                Username
              </TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider px-6 py-4">
                Password
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCredentials.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-gray-500 italic border-gray-800"
                >
                  {searchQuery ? `No results found for "${searchQuery}"` : "No credentials found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredCredentials.map((c) => (
                <TableRow
                  key={c.id}
                  className="border-gray-800 hover:bg-gray-900/40 transition-colors group"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-400/70 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                        onClick={() => handleEdit(c)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                        onClick={() =>
                          setCredentialToDelete({
                            id: c.id,
                            name: `${c.user_account?.first_name} ${c.user_account?.last_name}`,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-200 font-semibold text-xs">
                        {c.user_account?.first_name} {c.user_account?.last_name}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">
                        {c.user_account?.id.substring(0, 8)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: c.platform_website?.bg_color || '#333' }}
                      />
                      <span className="text-gray-300 text-xs">
                        {c.platform_website?.platform_name || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-400 px-6 py-4 font-mono text-xs">
                    {c.username}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="relative group/pass inline-flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded border border-gray-800/50 min-w-[120px] justify-between">
                      <span className="text-[10px] text-gray-600 font-mono tracking-[0.2em] select-none">
                        ••••••••
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 transition-all opacity-0 group-hover/pass:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (c.password) {
                            navigator.clipboard.writeText(c.password);
                            toast.success("Password copied to clipboard", {
                              icon: <Key className="w-3 h-3 text-purple-400" />,
                              className: "bg-[#0A0A0A] border-gray-800 text-white",
                            });
                          }
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CredentialsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        credential={selectedCredential}
        onSuccess={(saved) => {
          if (selectedCredential) {
            setCredentials(prev => prev.map(c => c.id === saved.id ? { ...c, ...saved } : c));
          } else {
            setCredentials(prev => [saved as CredentialWithJoined, ...prev]);
          }
          router.refresh();
        }}
      />

      <Dialog open={!!credentialToDelete} onOpenChange={(open) => !open && setCredentialToDelete(null)}>
        <DialogContent className="bg-[#0A0A0A] border-gray-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete credentials for: <span className="text-white font-semibold">{credentialToDelete?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setCredentialToDelete(null)}
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Delete Credential
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CredentialsTable;
