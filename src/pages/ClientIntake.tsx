import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Client = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as any).randomUUID();
  }
  return `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ClientIntake() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [notes, setNotes] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const vehicleSummary = (c: Client) => {
    const mk = c.vehicleMake?.trim();
    const md = c.vehicleModel?.trim();
    const yr = c.vehicleYear?.trim();
    const parts = [mk, md, yr].filter(Boolean);
    return parts.length ? parts.join(" ") : "—";
  };

  const truncate = (s?: string, n = 40) => {
    const t = String(s || "");
    return t.length > n ? `${t.slice(0, n)}…` : t || "—";
  };

  const resetForm = () => {
    setName(""); setPhone(""); setEmail(""); setAddress("");
    setVehicleMake(""); setVehicleModel(""); setVehicleYear(""); setNotes("");
  };

  const saveClient = () => {
    const nm = name.trim();
    const ph = phone.trim();
    if (!nm || !ph) {
      toast({ title: "Name and Phone are required" });
      return;
    }
    const now = new Date().toISOString();
    const next: Client = {
      id: genId(),
      name: nm,
      phone: ph,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      vehicleMake: vehicleMake.trim() || undefined,
      vehicleModel: vehicleModel.trim() || undefined,
      vehicleYear: vehicleYear.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    setClients((prev) => [next, ...prev]);
    resetForm();
    toast({ title: "Client saved" });
    // TODO: enable Supabase sync once authentication is fixed
    // const { data, error } = await supabase.from('clients').insert(next);
  };

  const openDetails = (c: Client) => {
    setEditClient({ ...c });
    setDetailOpen(true);
  };

  const saveEdit = () => {
    if (!editClient) return;
    const nm = editClient.name.trim();
    const ph = editClient.phone.trim();
    if (!nm || !ph) {
      toast({ title: "Name and Phone are required" });
      return;
    }
    const now = new Date().toISOString();
    const updated: Client = { ...editClient, name: nm, phone: ph, updatedAt: now };
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setDetailOpen(false);
    setEditClient(null);
    toast({ title: "Client updated" });
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Client deleted" });
  };

  return (
    <div className="p-4 max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4 bg-[#0f0f13] border border-zinc-800">
          <div className="text-white text-xl font-bold mb-4">Client Intake</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">Client Name *</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <Label className="text-zinc-300">Phone Number *</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-5555" />
            </div>
            <div>
              <Label className="text-zinc-300">Email</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@email.com" />
            </div>
            <div>
              <Label className="text-zinc-300">Address</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City, State" />
            </div>
            <div>
              <Label className="text-zinc-300">Vehicle Make</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-2" value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} placeholder="e.g., Toyota" />
            </div>
            <div>
              <Label className="text-zinc-300">Vehicle Model</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-2" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder="e.g., Camry" />
            </div>
            <div>
              <Label className="text-zinc-300">Vehicle Year</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-2" value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value)} placeholder="e.g., 2021" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-zinc-300">Notes</Label>
              <Textarea className="bg-zinc-800 border-zinc-700 text-white mt-2 min-h-[120px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Customer preferences, vehicle condition, special requests…" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="bg-green-600 hover:bg-green-700" onClick={saveClient}>Save Client</Button>
            <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={resetForm}>Reset</Button>
          </div>
        </Card>

        <Card className="p-4 bg-[#0f0f13] border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white text-xl font-bold">Client List</div>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or phone" className="bg-zinc-800 border-zinc-700 text-white w-64" />
          </div>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-zinc-300">Name</TableHead>
                  <TableHead className="text-zinc-300">Phone</TableHead>
                  <TableHead className="text-zinc-300">Vehicle</TableHead>
                  <TableHead className="text-zinc-300">Notes</TableHead>
                  <TableHead className="text-zinc-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-white">{c.name}</TableCell>
                    <TableCell className="text-white">{c.phone}</TableCell>
                    <TableCell className="text-white">{vehicleSummary(c)}</TableCell>
                    <TableCell className="text-white">{truncate(c.notes)}</TableCell>
                    <TableCell className="text-white">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-blue-700 text-blue-700 hover:bg-blue-700/10" onClick={() => openDetails(c)}>View Details</Button>
                        <Button size="sm" variant="outline" className="border-red-700 text-red-700 hover:bg-red-700/10" onClick={() => deleteClient(c.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-zinc-400 py-6">No clients</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">Client Name *</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-2" value={editClient?.name || ""} onChange={(e) => setEditClient((prev) => prev ? { ...prev, name: e.target.value } : prev)} />
            </div>
            <div>
              <Label className="text-zinc-300">Phone Number *</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-2" value={editClient?.phone || ""} onChange={(e) => setEditClient((prev) => prev ? { ...prev, phone: e.target.value } : prev)} />
            </div>
            <div>
              <Label className="text-zinc-300">Email</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-2" value={editClient?.email || ""} onChange={(e) => setEditClient((prev) => prev ? { ...prev, email: e.target.value } : prev)} />
            </div>
            <div>
              <Label className="text-zinc-300">Address</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-2" value={editClient?.address || ""} onChange={(e) => setEditClient((prev) => prev ? { ...prev, address: e.target.value } : prev)} />
            </div>
            <div>
              <Label className="text-zinc-300">Vehicle Make</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-2" value={editClient?.vehicleMake || ""} onChange={(e) => setEditClient((prev) => prev ? { ...prev, vehicleMake: e.target.value } : prev)} />
            </div>
            <div>
              <Label className="text-zinc-300">Vehicle Model</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-2" value={editClient?.vehicleModel || ""} onChange={(e) => setEditClient((prev) => prev ? { ...prev, vehicleModel: e.target.value } : prev)} />
            </div>
            <div>
              <Label className="text-zinc-300">Vehicle Year</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-2" value={editClient?.vehicleYear || ""} onChange={(e) => setEditClient((prev) => prev ? { ...prev, vehicleYear: e.target.value } : prev)} />
            </div>
            <div className="md:col-span-2">
              <Label className="text-zinc-300">Notes</Label>
              <Textarea className="bg-zinc-800 border-zinc-700 text-white mt-2 min-h-[120px]" value={editClient?.notes || ""} onChange={(e) => setEditClient((prev) => prev ? { ...prev, notes: e.target.value } : prev)} />
            </div>
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => { setDetailOpen(false); setEditClient(null); }}>Close</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={saveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
