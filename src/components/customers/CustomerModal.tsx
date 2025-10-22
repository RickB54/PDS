import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface Customer {
  id?: string;
  name: string;
  phone: string;
  vehicle: string;
  model: string;
  year: string;
  services: string[];
  lastService: string;
  duration: string;
  notes: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Customer | null;
  onSave: (data: Customer) => Promise<void> | void;
}

export default function CustomerModal({ open, onOpenChange, initial, onSave }: Props) {
  const [form, setForm] = useState<Customer>({
    id: undefined,
    name: "",
    phone: "",
    vehicle: "",
    model: "",
    year: "",
    services: [],
    lastService: "",
    duration: "",
    notes: "",
  });

  useEffect(() => {
    if (initial) {
      setForm({ ...initial, services: initial.services || [] });
    } else {
      setForm({ id: undefined, name: "", phone: "", vehicle: "", model: "", year: "", services: [], lastService: "", duration: "", notes: "" });
    }
  }, [initial, open]);

  const handleChange = (key: keyof Customer, value: string) => {
    if (key === "services") {
      setForm((f) => ({ ...f, services: value.split(",").map((s) => s.trim()).filter(Boolean) }));
    } else {
      setForm((f) => ({ ...f, [key]: value } as Customer));
    }
  };

  const handleSubmit = async () => {
    await onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Customer" : "Add Customer"}</DialogTitle>
          <DialogDescription>Update customer details and service history.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle">Vehicle Make</Label>
            <Input id="vehicle" value={form.vehicle} onChange={(e) => handleChange("vehicle", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input id="model" value={form.model} onChange={(e) => handleChange("model", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input id="year" value={form.year} onChange={(e) => handleChange("year", e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="services">Services (comma separated)</Label>
            <Input id="services" value={form.services.join(", ")} onChange={(e) => handleChange("services", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastService">Last Service Date</Label>
            <Input id="lastService" value={form.lastService} onChange={(e) => handleChange("lastService", e.target.value)} placeholder="MM/DD/YYYY" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input id="duration" value={form.duration} onChange={(e) => handleChange("duration", e.target.value)} placeholder="e.g., 2 hours" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} className="min-h-[80px]" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="bg-gradient-hero">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
