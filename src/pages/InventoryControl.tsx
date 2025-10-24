import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import localforage from "localforage";

interface Chemical {
  id: string;
  name: string;
  bottleSize: string;
  costPerBottle: number;
  threshold: number;
  currentStock: number;
}

interface UsageHistory {
  id: string;
  chemicalId: string;
  chemicalName: string;
  serviceName: string;
  date: string;
}

const InventoryControl = () => {
  const { toast } = useToast();
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Chemical | null>(null);
  const [dateFilter, setDateFilter] = useState<"all" | "daily" | "weekly" | "monthly">("all");
  const [form, setForm] = useState({
    name: "",
    bottleSize: "",
    costPerBottle: "",
    threshold: "2",
    currentStock: "0"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const chems = (await localforage.getItem<Chemical[]>("chemicals")) || [];
    const usage = (await localforage.getItem<UsageHistory[]>("chemical-usage")) || [];
    setChemicals(chems);
    setUsageHistory(usage);
  };

  const saveChemicals = async (data: Chemical[]) => {
    await localforage.setItem("chemicals", data);
    setChemicals(data);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", bottleSize: "", costPerBottle: "", threshold: "2", currentStock: "0" });
    setModalOpen(true);
  };

  const openEdit = (chem: Chemical) => {
    setEditing(chem);
    setForm({
      name: chem.name,
      bottleSize: chem.bottleSize,
      costPerBottle: chem.costPerBottle.toString(),
      threshold: chem.threshold.toString(),
      currentStock: chem.currentStock.toString()
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const chemData: Chemical = {
      id: editing?.id || `chem-${Date.now()}`,
      name: form.name,
      bottleSize: form.bottleSize,
      costPerBottle: parseFloat(form.costPerBottle) || 0,
      threshold: parseInt(form.threshold) || 2,
      currentStock: parseInt(form.currentStock) || 0
    };

    let updated: Chemical[];
    if (editing) {
      updated = chemicals.map(c => c.id === editing.id ? chemData : c);
    } else {
      updated = [...chemicals, chemData];
    }

    await saveChemicals(updated);
    setModalOpen(false);
    toast({ title: "Chemical Saved", description: "Inventory updated successfully." });
  };

  const handleDelete = async (id: string) => {
    const updated = chemicals.filter(c => c.id !== id);
    await saveChemicals(updated);
    toast({ title: "Chemical Deleted", description: "Item removed from inventory." });
  };

  const filterByDate = (item: UsageHistory) => {
    if (dateFilter === "all") return true;
    const itemDate = new Date(item.date);
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    
    if (dateFilter === "daily") return now.getTime() - itemDate.getTime() < dayMs;
    if (dateFilter === "weekly") return now.getTime() - itemDate.getTime() < 7 * dayMs;
    if (dateFilter === "monthly") return now.getTime() - itemDate.getTime() < 30 * dayMs;
    return true;
  };

  const filteredHistory = usageHistory.filter(filterByDate);

  const lowStockChemicals = chemicals.filter(c => c.currentStock <= c.threshold);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Inventory Control" />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6 animate-fade-in">
          {lowStockChemicals.length > 0 && (
            <Card className="p-4 bg-destructive/10 border-destructive">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">
                  Low Inventory Alert: {lowStockChemicals.length} item(s) below threshold
                </span>
              </div>
              <ul className="mt-2 ml-7 text-sm">
                {lowStockChemicals.map(c => (
                  <li key={c.id}>{c.name} - {c.currentStock} remaining</li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Chemical Inventory</h2>
              <Button onClick={openAdd} className="bg-gradient-hero">
                <Plus className="h-4 w-4 mr-2" />
                Add Chemical
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chemical Name</TableHead>
                  <TableHead>Bottle Size</TableHead>
                  <TableHead>Cost per Bottle</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chemicals.map(chem => (
                  <TableRow key={chem.id}>
                    <TableCell className="font-medium">{chem.name}</TableCell>
                    <TableCell>{chem.bottleSize}</TableCell>
                    <TableCell>${chem.costPerBottle.toFixed(2)}</TableCell>
                    <TableCell className={chem.currentStock <= chem.threshold ? "text-destructive font-bold" : ""}>
                      {chem.currentStock}
                    </TableCell>
                    <TableCell>{chem.threshold}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(chem)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(chem.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {chemicals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No chemicals added yet. Click "Add Chemical" to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Usage History</h2>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Time</option>
                <option value="daily">Today</option>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
              </select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Chemical</TableHead>
                  <TableHead>Service</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.date).toLocaleString()}</TableCell>
                    <TableCell>{item.chemicalName}</TableCell>
                    <TableCell>{item.serviceName}</TableCell>
                  </TableRow>
                ))}
                {filteredHistory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No usage history found for the selected period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Chemical" : "Add Chemical"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Chemical Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Meguiar's Foam Soap"
              />
            </div>
            <div className="space-y-2">
              <Label>Bottle Size</Label>
              <Input
                value={form.bottleSize}
                onChange={(e) => setForm({ ...form, bottleSize: e.target.value })}
                placeholder="e.g., 16 oz"
              />
            </div>
            <div className="space-y-2">
              <Label>Cost per Bottle</Label>
              <Input
                type="number"
                step="0.01"
                value={form.costPerBottle}
                onChange={(e) => setForm({ ...form, costPerBottle: e.target.value })}
                placeholder="e.g., 8.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Current Stock</Label>
              <Input
                type="number"
                value={form.currentStock}
                onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                placeholder="Number of bottles"
              />
            </div>
            <div className="space-y-2">
              <Label>Low Inventory Threshold</Label>
              <Input
                type="number"
                value={form.threshold}
                onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                placeholder="Alert when stock reaches this number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="bg-gradient-hero">
              Save Chemical
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryControl;
