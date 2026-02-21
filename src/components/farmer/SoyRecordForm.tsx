/**
 * Form for creating or editing a soy sale record.
 * Uses React Hook Form + Zod for validation.
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SoyRecord, CreateSoyRecordInput } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const soyRecordSchema = z.object({
  shedId: z.string().min(1, "Shed is required"),
  buyerCompany: z.string().min(1, "Buyer company is required"),
  soyType: z.enum(["meal", "whole", "hull", "other"]),
  quantityTonnes: z.coerce.number().min(0.001, "Quantity must be greater than 0"),
  priceUsd: z.coerce.number().min(0, "Price must be non-negative"),
  shedLocation: z.string().min(1, "Shed location is required"),
  status: z.enum(["shipped", "delivered"]),
  soldAt: z.string().min(1, "Sale date is required"),
});

interface SoyRecordFormProps {
  record?: SoyRecord;
  onSubmit: (data: CreateSoyRecordInput) => void;
  onCancel: () => void;
}

export default function SoyRecordForm({ record, onSubmit, onCancel }: SoyRecordFormProps) {
  const {
    register, handleSubmit, setValue, watch, formState: { errors },
  } = useForm<CreateSoyRecordInput>({
    resolver: zodResolver(soyRecordSchema),
    defaultValues: record
      ? {
          shedId: record.shedId,
          buyerCompany: record.buyerCompany,
          soyType: record.soyType,
          quantityTonnes: record.quantityTonnes,
          priceUsd: record.priceUsd,
          shedLocation: record.shedLocation,
          status: record.status,
          soldAt: record.soldAt.slice(0, 10),
        }
      : { soyType: "whole", status: "shipped", quantityTonnes: 0, priceUsd: 0, shedLocation: "", soldAt: "", shedId: "", buyerCompany: "" },
  });

  const soyType = watch("soyType");
  const status = watch("status");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="buyerCompany">Buyer Company</Label>
          <Input id="buyerCompany" {...register("buyerCompany")} placeholder="e.g. Tyson Foods" />
          {errors.buyerCompany && <p className="text-xs text-destructive">{errors.buyerCompany.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="soldAt">Sale Date</Label>
          <Input id="soldAt" type="date" {...register("soldAt")} />
          {errors.soldAt && <p className="text-xs text-destructive">{errors.soldAt.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Soy Type</Label>
          <Select value={soyType} onValueChange={(v) => setValue("soyType", v as CreateSoyRecordInput["soyType"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="meal">Meal</SelectItem>
              <SelectItem value="whole">Whole</SelectItem>
              <SelectItem value="hull">Hull</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setValue("status", v as CreateSoyRecordInput["status"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantityTonnes">Quantity (tonnes)</Label>
          <Input id="quantityTonnes" type="number" step="0.001" {...register("quantityTonnes")} />
          {errors.quantityTonnes && <p className="text-xs text-destructive">{errors.quantityTonnes.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceUsd">Price (USD)</Label>
          <Input id="priceUsd" type="number" step="0.01" {...register("priceUsd")} />
          {errors.priceUsd && <p className="text-xs text-destructive">{errors.priceUsd.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="shedLocation">Shed Location</Label>
          <Input id="shedLocation" {...register("shedLocation")} placeholder="e.g. São Paulo, Brazil" />
          {errors.shedLocation && <p className="text-xs text-destructive">{errors.shedLocation.message}</p>}
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="shedId">Shed ID</Label>
          <Input id="shedId" {...register("shedId")} placeholder="UUID of the shed" />
          {errors.shedId && <p className="text-xs text-destructive">{errors.shedId.message}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{record ? "Update Record" : "Add Record"}</Button>
      </div>
    </form>
  );
}
