"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Pencil, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { createFranchise, updateFranchise } from "@/helper/franchise";
import { Franchise } from "@/helper/franchise";

const franchiseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  investor_name: z.string().optional(),
});

type FranchiseFormValues = z.output<typeof franchiseSchema>;

interface FranchiseFormProps {
  franchise?: Franchise | null;
  onSuccess?: (saved: Franchise) => void;
  onCancel?: () => void;
}

export const FranchiseForm = ({ franchise, onSuccess, onCancel }: FranchiseFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const isEdit = !!franchise;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof franchiseSchema>>({
    resolver: zodResolver(franchiseSchema),
    defaultValues: {
      name: franchise?.name || "",
      code: franchise?.code || "",
      description: franchise?.description || "",
      investor_name: franchise?.investor_name || "",
    },
  });

  useEffect(() => {
    reset({
      name: franchise?.name || "",
      code: franchise?.code || "",
      description: franchise?.description || "",
      investor_name: franchise?.investor_name || "",
    });
  }, [franchise, reset]);

  const onSubmit = async (values: FranchiseFormValues) => {
    setIsPending(true);
    try {
      const dataToSave = {
        name: values.name,
        code: values.code || null,
        description: values.description || null,
        investor_name: values.investor_name || null,
      };

      let saved: Franchise;
      if (isEdit && franchise?.id) {
        const result = await updateFranchise(franchise.id, dataToSave);
        saved = (result?.[0] || { ...franchise, ...dataToSave }) as Franchise;
        toast.success("Franchise updated successfully");
      } else {
        const result = await createFranchise(dataToSave);
        saved = result?.[0] as Franchise;
        toast.success("Franchise created successfully");
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
        <div className={`p-2 rounded-lg ${isEdit ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
          {isEdit ? <Pencil className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            {isEdit ? "Edit Franchise" : "Add New Franchise"}
          </h2>
          <p className="text-xs text-gray-500">
            {isEdit ? "Update franchise details" : "Register a new franchise"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Franchise Name</Label>
          <Input
            id="name"
            placeholder="e.g. Awesome Franchise"
            {...register("name")}
            className="bg-[#111111] border-gray-800 focus:border-emerald-600 transition-all font-sans text-white h-10 w-full rounded-md px-3 py-2 text-sm"
          />
          {errors.name && <p className="text-[10px] text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Franchise Code</Label>
          <Input
            id="code"
            placeholder="e.g. AF-101"
            {...register("code")}
            className="bg-[#111111] border-gray-800 focus:border-emerald-600 transition-all font-sans text-white h-10 w-full rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="investor_name" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Investor Name</Label>
          <Input
            id="investor_name"
            placeholder="e.g. John Doe"
            {...register("investor_name")}
            className="bg-[#111111] border-gray-800 focus:border-emerald-600 transition-all font-sans text-white h-10 w-full rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Description</Label>
          <Input
            id="description"
            placeholder="Short description"
            {...register("description")}
            className="bg-[#111111] border-gray-800 focus:border-emerald-600 transition-all font-sans text-white h-10 w-full rounded-md px-3 py-2 text-sm"
          />
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
          className={`${isEdit ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white px-8 transition-all active:scale-95`}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isEdit ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  );
};
