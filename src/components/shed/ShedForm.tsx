/**
 * Form for creating or editing a shed.
 * Uses React Hook Form + Zod for validation.
 * Renders inside a Dialog on the Database page.
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Shed, CreateShedInput } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// Validation schema for shed fields
const shedSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").max(20),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  address: z.string(),
  imageUrl: z.string().optional(),
  soybeanType: z.enum(["meal", "whole", "hull", "other"]),
  soybeanCount: z.coerce.number().min(0),
  moisturePct: z.coerce.number().min(0).max(100),
  temperature: z.coerce.number(),
  capacityTonnes: z.coerce.number().min(0),
  status: z.enum(["operational", "maintenance", "offline"]),
});

interface ShedFormProps {
  shed?: Shed;
  onSubmit: (data: CreateShedInput) => void;
  onCancel: () => void;
}

export default function ShedForm({ shed, onSubmit, onCancel }: ShedFormProps) {
  const {
    register, handleSubmit, setValue, watch, formState: { errors },
  } = useForm<CreateShedInput>({
    resolver: zodResolver(shedSchema),
    defaultValues: shed
      ? {
          name: shed.name, code: shed.code, latitude: shed.latitude,
          longitude: shed.longitude, address: shed.address,
          imageUrl: shed.imageUrl ?? undefined, soybeanType: shed.soybeanType,
          soybeanCount: shed.soybeanCount, moisturePct: shed.moisturePct,
          temperature: shed.temperature, capacityTonnes: shed.capacityTonnes,
          status: shed.status,
        }
      : { soybeanType: "whole", status: "operational", soybeanCount: 0, moisturePct: 0, temperature: 0, capacityTonnes: 0 },
  });

  const soybeanType = watch("soybeanType");
  const status = watch("status");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input id="code" {...register("code")} placeholder="e.g. BR-042" />
          {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" type="number" step="any" {...register("latitude")} />
          {errors.latitude && <p className="text-xs text-destructive">{errors.latitude.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" type="number" step="any" {...register("longitude")} />
          {errors.longitude && <p className="text-xs text-destructive">{errors.longitude.message}</p>}
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register("address")} />
        </div>
        <div className="space-y-2">
          <Label>Soybean Type</Label>
          <Select value={soybeanType} onValueChange={(v) => setValue("soybeanType", v as CreateShedInput["soybeanType"])}>
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
          <Select value={status} onValueChange={(v) => setValue("status", v as CreateShedInput["status"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="soybeanCount">Soybean Count (tonnes)</Label>
          <Input id="soybeanCount" type="number" step="0.001" {...register("soybeanCount")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacityTonnes">Capacity (tonnes)</Label>
          <Input id="capacityTonnes" type="number" step="0.001" {...register("capacityTonnes")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="moisturePct">Moisture %</Label>
          <Input id="moisturePct" type="number" step="0.01" {...register("moisturePct")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature (C)</Label>
          <Input id="temperature" type="number" step="0.01" {...register("temperature")} />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{shed ? "Update Shed" : "Add Shed"}</Button>
      </div>
    </form>
  );
}
