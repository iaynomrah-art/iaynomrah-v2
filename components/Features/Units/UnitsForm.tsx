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
import { createUnit, updateUnit } from "@/helper/units";
import { getFranchises } from "@/helper/franchise";
import { Unit, Franchise } from "@/types";

const unitSchema = z.object({
  unit_name: z.string().min(1, "Unit name is required"),
  api_base_url: z.string().url("Invalid API structure or URL").or(z.literal("")).optional(),
  franchise_id: z.string().optional(),
  guid: z.string().optional(),
  status: z.string().optional(),
});

type UnitFormValues = z.output<typeof unitSchema>;

interface UnitsFormProps {
  unit?: Unit | null;
  onSuccess?: (saved: Unit) => void;
  onCancel?: () => void;
}

export const UnitsForm = ({ unit, onSuccess, onCancel }: UnitsFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const isEdit = !!unit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof unitSchema>>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      unit_name: unit?.unit_name || "",
      api_base_url: unit?.api_base_url || "",
      franchise_id: unit?.franchise_id || "",
      guid: unit?.guid || "",
      status: unit?.status || "not connected",
    },
  });

  useEffect(() => {
    const fetchFranchises = async () => {
      const data = await getFranchises();
      setFranchises(data || []);
    };
    fetchFranchises();
  }, []);

  useEffect(() => {
    reset({
      unit_name: unit?.unit_name || "",
      api_base_url: unit?.api_base_url || "",
      franchise_id: unit?.franchise_id || "",
      guid: unit?.guid || "",
      status: unit?.status || "not connected",
    });
  }, [unit, reset]);

  const onSubmit = async (values: UnitFormValues) => {
    setIsPending(true);
    try {
      const dataToSave = {
        ...values,
      } as Omit<Unit, "id" | "created_at">;

      let saved: Unit;
      if (isEdit && unit?.id) {
        const result = await updateUnit(unit.id, dataToSave);
        saved = (result?.[0] || { ...unit, ...dataToSave }) as Unit;
        toast.success("Unit updated successfully");
      } else {
        const result = await createUnit(dataToSave);
        saved = result?.[0] as Unit;
        toast.success("Unit created successfully");
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
            {isEdit ? "Edit Unit" : "Add New Unit"}
          </h2>
          <p className="text-xs text-gray-500">
            {isEdit ? "Update unit configuration" : "Register a new server or trading unit"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="unit_name" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Unit Name</Label>
          <Input
            id="unit_name"
            placeholder="e.g. Unit-01"
            {...register("unit_name")}
            className="bg-[#111111] border-gray-800 focus:border-emerald-600 transition-all"
          />
          {errors.unit_name && <p className="text-[10px] text-red-500">{errors.unit_name.message}</p>}
        </div>



        <div className="space-y-2">
          <Label htmlFor="franchise_id" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Franchise Assignment</Label>
          <select
            id="franchise_id"
            {...register("franchise_id")}
            className="w-full h-10 px-3 py-2 bg-[#111111] border border-gray-800 rounded-md text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all outline-none"
          >
            <option value="">Unassigned</option>
            {franchises.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} {f.code ? `(${f.code})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Status</Label>
          <select
            id="status"
            {...register("status")}
            className="w-full h-10 px-3 py-2 bg-[#111111] border border-gray-800 rounded-md text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all outline-none"
          >
            <option value="not connected">Not Connected</option>
            <option value="connected">Connected</option>
            <option value="disabled">Disabled</option>
          </select>
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
          {isEdit ? "Update Unit" : "Save Unit"}
        </Button>
      </div>
    </form>
  );
};
