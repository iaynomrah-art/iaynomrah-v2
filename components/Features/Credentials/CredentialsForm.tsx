"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Loader2, Pencil, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { createCredential, updateCredential } from "@/helper/credential";
import { getUserAccounts } from "@/helper/user_account";
import { getPlatformWebsites } from "@/helper/platform_website";
import { Credential, UserAccount, PlatformWebsite } from "@/types";

const credentialSchema = z.object({
  user_id: z.string().min(1, "User is required"),
  platform_id: z.string().min(1, "Platform is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type CredentialFormValues = z.infer<typeof credentialSchema>;

interface CredentialsFormProps {
  credential?: Credential | null;
  onSuccess?: (saved: Credential) => void;
  onCancel?: () => void;
}

export const CredentialsForm = ({ credential, onSuccess, onCancel }: CredentialsFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [platforms, setPlatforms] = useState<PlatformWebsite[]>([]);
  const isEdit = !!credential;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      user_id: credential?.user_id || "",
      platform_id: credential?.platform_id?.toString() || "",
      username: credential?.username || "",
      password: credential?.password || "",
    },
  });

  const selectedUserId = watch("user_id");
  const selectedPlatformId = watch("platform_id");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, platformData] = await Promise.all([
          getUserAccounts(),
          getPlatformWebsites(),
        ]);
        setUsers(userData || []);
        setPlatforms(platformData || []);
      } catch (error) {
        console.error("Failed to fetch form data:", error);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (values: CredentialFormValues) => {
    setIsPending(true);
    try {
      const dataToSave = {
        ...values,
        platform_id: parseInt(values.platform_id),
      };

      let saved: Credential;
      if (isEdit && credential?.id) {
        const result = await updateCredential(credential.id, dataToSave);
        saved = (result?.[0] || { ...credential, ...dataToSave }) as Credential;
        toast.success("Credential updated successfully");
      } else {
        const result = await createCredential(dataToSave as Omit<Credential, "id" | "created_at">);
        saved = result?.[0] as Credential;
        toast.success("Credential created successfully");
      }

      if (onSuccess && saved) onSuccess(saved);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${isEdit ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
          {isEdit ? <Pencil className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            {isEdit ? "Edit Credential" : "Add New Credential"}
          </h2>
          <p className="text-xs text-gray-500">
            {isEdit ? "Update platform access details" : "Grant a user access to a betting platform"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">User Account</Label>
          <Select
            value={selectedUserId}
            onValueChange={(val) => setValue("user_id", val)}
          >
            <SelectTrigger className="bg-[#111111] border-gray-800 focus:ring-purple-600">
              <SelectValue placeholder="Select User" />
            </SelectTrigger>
            <SelectContent className="bg-[#0A0A0A] border-gray-800 text-white">
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.user_id && <p className="text-[10px] text-red-500">{errors.user_id.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Betting Platform</Label>
          <Select
            value={selectedPlatformId}
            onValueChange={(val) => setValue("platform_id", val)}
          >
            <SelectTrigger className="bg-[#111111] border-gray-800 focus:ring-purple-600">
              <SelectValue placeholder="Select Platform" />
            </SelectTrigger>
            <SelectContent className="bg-[#0A0A0A] border-gray-800 text-white">
              {platforms.map((platform) => (
                <SelectItem key={platform.id} value={platform.id.toString()}>
                  {platform.platform_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.platform_id && <p className="text-[10px] text-red-500">{errors.platform_id.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Username</Label>
            <Input
              id="username"
              placeholder="Username"
              {...register("username")}
              className="bg-[#111111] border-gray-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all"
            />
            {errors.username && <p className="text-[10px] text-red-500">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Password</Label>
            <Input
              id="password"
              type="text"
              placeholder="••••••••"
              {...register("password")}
              className="bg-[#111111] border-gray-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all"
            />
            {errors.password && <p className="text-[10px] text-red-500">{errors.password.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-900">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isPending}
          className="text-gray-400 hover:text-white hover:bg-gray-900"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className={`${isEdit ? 'bg-blue-600 hover:bg-blue-500' : 'bg-purple-600 hover:bg-purple-500'} text-white px-8 transition-all active:scale-95`}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isEdit ? "Update Credential" : "Create Credential"}
        </Button>
      </div>
    </form>
  );
};
