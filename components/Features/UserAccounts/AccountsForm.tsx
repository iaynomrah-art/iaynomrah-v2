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
import { Save, Loader2, UserPlus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { createUserAccount, updateUserAccount } from "@/helper/user_account";
import { getUnits } from "@/helper/units";
import { UserAccount, Unit, Franchise } from "@/types";

const accountSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  contact_number_1: z.string().min(1, "Contact number 1 is required"),
  contact_number_2: z.string().optional(),
  unit_id: z.string().nullable().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

// Define a type for the joined unit data we might receive
interface UnitWithFranchise extends Unit {
  franchise?: Franchise | null;
}

interface AccountsFormProps {
  account?: UserAccount | null;
  onSuccess?: (saved: UserAccount) => void;
  onCancel?: () => void;
}

export const AccountsForm = ({ account, onSuccess, onCancel }: AccountsFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const [units, setUnits] = useState<UnitWithFranchise[]>([]);
  const isEdit = !!account;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      first_name: account?.first_name || "",
      last_name: account?.last_name || "",
      email: account?.email || "",
      contact_number_1: account?.contact_number_1?.toString() || "",
      contact_number_2: account?.contact_number_2?.toString() || "",
      unit_id: account?.unit_id || null,
    },
  });

  const selectedUnitId = watch("unit_id");

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const data = await getUnits();
        setUnits(data || []);
      } catch (error) {
        console.error("Failed to fetch units:", error);
      }
    };
    fetchUnits();
  }, []);

  const onSubmit = async (values: AccountFormValues) => {
    setIsPending(true);
    try {
      const dataToSave = {
        ...values,
        contact_number_1: values.contact_number_1 ? parseInt(values.contact_number_1) : null,
        contact_number_2: values.contact_number_2 ? parseInt(values.contact_number_2) : null,
        middle_name: account?.middle_name || null, // Preserve if exists
      };

      let saved: UserAccount;
      if (isEdit && account?.id) {
        const result = await updateUserAccount(account.id, dataToSave);
        saved = (result?.[0] || { ...account, ...dataToSave }) as UserAccount;
        toast.success("Account updated successfully");
      } else {
        const result = await createUserAccount(dataToSave as Omit<UserAccount, "id" | "created_at">);
        saved = result?.[0] as UserAccount;
        toast.success("Account created successfully");
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
        <div className={`p-2 rounded-lg ${isEdit ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
          {isEdit ? <Pencil className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            {isEdit ? "Edit Betting Account" : "Add New Betting Account"}
          </h2>
          <p className="text-xs text-gray-500">
            {isEdit ? "Update account details below" : "Fill in the details for the new account"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">First Name</Label>
          <Input
            id="first_name"
            placeholder="John"
            {...register("first_name")}
            className="bg-[#111111] border-gray-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
          {errors.first_name && <p className="text-[10px] text-red-500">{errors.first_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Last Name</Label>
          <Input
            id="last_name"
            placeholder="Doe"
            {...register("last_name")}
            className="bg-[#111111] border-gray-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
          {errors.last_name && <p className="text-[10px] text-red-500">{errors.last_name.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="john.doe@example.com"
          {...register("email")}
          className="bg-[#111111] border-gray-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
        />
        {errors.email && <p className="text-[10px] text-red-500">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_number_1" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Contact Number 1</Label>
          <Input
            id="contact_number_1"
            placeholder="09123456789"
            {...register("contact_number_1")}
            className="bg-[#111111] border-gray-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
          {errors.contact_number_1 && <p className="text-[10px] text-red-500">{errors.contact_number_1.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_number_2" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Contact Number 2</Label>
          <Input
            id="contact_number_2"
            placeholder="Optional"
            {...register("contact_number_2")}
            className="bg-[#111111] border-gray-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Owned PC (Unit)</Label>
        <Select
          value={selectedUnitId || "none"}
          onValueChange={(val) => setValue("unit_id", val === "none" ? null : val)}
        >
          <SelectTrigger className="bg-[#111111] border-gray-800">
            <SelectValue placeholder="Select a PC" />
          </SelectTrigger>
          <SelectContent className="bg-[#0A0A0A] border-gray-800 text-white">
            <SelectItem value="none" className="text-gray-500 italic">None / Unassigned</SelectItem>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.unit_name} {unit.franchise?.name ? `(${unit.franchise.name})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          className={`${isEdit ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'} text-white px-8 transition-all active:scale-95`}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isEdit ? "Update Account" : "Create Account"}
        </Button>
      </div>
    </form>
  );
};
