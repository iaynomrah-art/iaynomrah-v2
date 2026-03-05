"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Globe, Pencil, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { createPlatformWebsite, updatePlatformWebsite } from "@/helper/platform_website";
import { PlatformWebsite } from "@/types";

const platformSchema = z.object({
  platform_name: z.string().min(1, "Platform name is required"),
  platform_website: z.string().url("Invalid website URL").or(z.literal("")).optional(),
  min_bet: z.string().nullable().optional(), // Hold as string for the input
  platform_code: z.string().optional(),
  text_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").or(z.literal("")).optional(),
  bg_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").or(z.literal("")).optional(),
});

type PlatformFormValues = z.output<typeof platformSchema>;

interface BettingPlatformFormProps {
  platform?: PlatformWebsite | null;
  onSuccess?: (saved: PlatformWebsite) => void;
  onCancel?: () => void;
}

export const BettingPlatformForm = ({ platform, onSuccess, onCancel }: BettingPlatformFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const isEdit = !!platform;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof platformSchema>>({
    resolver: zodResolver(platformSchema),
    defaultValues: {
      platform_name: platform?.platform_name || "",
      platform_website: platform?.platform_website || "",
      min_bet: platform?.min_bet?.toString() || "",
      platform_code: platform?.platform_code || "",
      text_color: platform?.text_color || "#FFFFFF",
      bg_color: platform?.bg_color || "#333333",
    },
  });

  const watchedBgColor = watch("bg_color");
  const watchedTextColor = watch("text_color");

  React.useEffect(() => {
    reset({
      platform_name: platform?.platform_name || "",
      platform_website: platform?.platform_website || "",
      min_bet: platform?.min_bet?.toString() || "",
      platform_code: platform?.platform_code || "",
      text_color: platform?.text_color || "#FFFFFF",
      bg_color: platform?.bg_color || "#333333",
    });
  }, [platform, reset]);

  const onSubmit = async (values: PlatformFormValues) => {
    setIsPending(true);
    try {
      const dataToSave = {
        ...values,
        min_bet: values.min_bet ? parseInt(values.min_bet) : null,
      } as Omit<PlatformWebsite, "id" | "created_at">;

      let saved: PlatformWebsite;
      if (isEdit && platform?.id) {
        const result = await updatePlatformWebsite(platform.id, dataToSave);
        // Ensure result is available, otherwise combine local data
        saved = (result?.[0] || { ...platform, ...dataToSave }) as PlatformWebsite;
        toast.success("Platform updated successfully");
      } else {
        const result = await createPlatformWebsite(dataToSave);
        saved = result?.[0] as PlatformWebsite;
        toast.success("Platform created successfully");
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
            {isEdit ? "Edit Betting Platform" : "Add New Platform"}
          </h2>
          <p className="text-xs text-gray-500">
            {isEdit ? "Update platform configuration" : "Register a new betting website/API"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="platform_name" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Platform Name</Label>
            <Input
              id="platform_name"
              placeholder="e.g. Bet365"
              {...register("platform_name")}
              className="bg-[#111111] border-gray-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
            />
            {errors.platform_name && <p className="text-[10px] text-red-500">{errors.platform_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform_code" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Platform Code</Label>
            <Input
              id="platform_code"
              placeholder="e.g. B365"
              {...register("platform_code")}
              className="bg-[#111111] border-gray-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="platform_website" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Website URL</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              id="platform_website"
              placeholder="https://..."
              {...register("platform_website")}
              className="pl-10 bg-[#111111] border-gray-800 focus:border-emerald-600 transition-all"
            />
          </div>
          {errors.platform_website && <p className="text-[10px] text-red-500">{errors.platform_website.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_bet" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Minimum Bet</Label>
          <Input
            id="min_bet"
            type="number"
            placeholder="0"
            {...register("min_bet")}
            className="bg-[#111111] border-gray-800 focus:border-emerald-600 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bg_color" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Brand Color (BG)</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={watchedBgColor || "#333333"}
                onChange={(e) => setValue("bg_color", e.target.value)}
                className="w-12 h-10 p-1 bg-[#111111] border border-gray-800 cursor-pointer rounded-md overflow-hidden"
              />
              <Input
                placeholder="#000000"
                {...register("bg_color")}
                className="flex-1 bg-[#111111] border-gray-800 font-mono text-xs uppercase"
              />
            </div>
            {errors.bg_color && <p className="text-[10px] text-red-500">{errors.bg_color.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="text_color" className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Text Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={watchedTextColor || "#FFFFFF"}
                onChange={(e) => setValue("text_color", e.target.value)}
                className="w-12 h-10 p-1 bg-[#111111] border border-gray-800 cursor-pointer rounded-md overflow-hidden"
              />
              <Input
                placeholder="#FFFFFF"
                {...register("text_color")}
                className="flex-1 bg-[#111111] border-gray-800 font-mono text-xs uppercase"
              />
            </div>
            {errors.text_color && <p className="text-[10px] text-red-500">{errors.text_color.message}</p>}
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
          className={`${isEdit ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white px-8 transition-all active:scale-95`}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isEdit ? "Update Platform" : "Save Platform"}
        </Button>
      </div>
    </form>
  );
};
