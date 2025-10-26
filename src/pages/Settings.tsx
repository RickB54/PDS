import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Download, Upload, Trash2 } from "lucide-react";
import localforage from "localforage";

const Settings = () => {
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("");

  const handleBackup = async () => {
    try {
      const allData: any = {};
      const keys = await localforage.keys();
      for (const key of keys) {
        allData[key] = await localforage.getItem(key);
      }
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pds-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Backup Created", description: "Your data has been backed up successfully." });
    } catch (error) {
      toast({ title: "Backup Failed", description: "Could not create backup.", variant: "destructive" });
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      for (const key in data) {
        await localforage.setItem(key, data[key]);
      }
      toast({ title: "Restore Complete", description: "Your data has been restored successfully." });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast({ title: "Restore Failed", description: "Could not restore data.", variant: "destructive" });
    }
  };

  const deleteData = async (type: string) => {
    try {
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);

      if (type === "customers") {
        const customers: any[] = await localforage.getItem("customers") || [];
        const filtered = customers.filter((c: any) => {
          const date = new Date(c.createdAt || c.updatedAt || "");
          return date > cutoffDate;
        });
        await localforage.setItem("customers", filtered);
      } else if (type === "invoices") {
        const invoices: any[] = await localforage.getItem("invoices") || [];
        const filtered = invoices.filter((inv: any) => {
          const date = new Date(inv.createdAt || "");
          return date > cutoffDate;
        });
        await localforage.setItem("invoices", filtered);
      } else if (type === "accounting") {
        const expenses: any[] = await localforage.getItem("expenses") || [];
        const filtered = expenses.filter((exp: any) => {
          const date = new Date(exp.date || "");
          return date > cutoffDate;
        });
        await localforage.setItem("expenses", filtered);
      } else if (type === "inventory") {
        const usage: any[] = await localforage.getItem("chemicalUsage") || [];
        const filtered = usage.filter((u: any) => {
          const date = new Date(u.date || "");
          return date > cutoffDate;
        });
        await localforage.setItem("chemicalUsage", filtered);
      } else if (type === "all") {
        await localforage.clear();
      }

      toast({ title: "Data Deleted", description: `${type} data has been removed.` });
      setDeleteDialog(null);
      setTimeRange("");
    } catch (error) {
      toast({ title: "Delete Failed", description: "Could not delete data.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Settings" />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6 animate-fade-in">
          {/* Backup & Restore */}
          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Backup & Restore</h2>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground mb-4">Download a backup of all your data or restore from a previous backup.</p>
                <div className="flex gap-4 flex-wrap">
                  <Button onClick={handleBackup} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Backup
                  </Button>
                  <label>
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Restore Backup
                      </span>
                    </Button>
                    <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 bg-gradient-card border-destructive border-2">
            <h2 className="text-2xl font-bold text-destructive mb-4">⚠️ Danger Zone</h2>
            <p className="text-muted-foreground mb-6">These actions cannot be undone. Proceed with caution.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">Delete Customer Records</h3>
                  <p className="text-sm text-muted-foreground">Remove customer records older than specified days</p>
                </div>
                <Button variant="destructive" onClick={() => setDeleteDialog("customers")}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Customers
                </Button>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">Delete Accounting Records</h3>
                  <p className="text-sm text-muted-foreground">Remove expense records older than specified days</p>
                </div>
                <Button variant="destructive" onClick={() => setDeleteDialog("accounting")}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Accounting
                </Button>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">Delete Invoices</h3>
                  <p className="text-sm text-muted-foreground">Remove invoices older than specified days</p>
                </div>
                <Button variant="destructive" onClick={() => setDeleteDialog("invoices")}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Invoices
                </Button>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">Delete Inventory Data</h3>
                  <p className="text-sm text-muted-foreground">Remove inventory usage older than specified days</p>
                </div>
                <Button variant="destructive" onClick={() => setDeleteDialog("inventory")}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Inventory
                </Button>
              </div>

              <div className="border-t border-destructive/50 pt-4 mt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-bold text-destructive text-lg">DELETE ALL DATA</h3>
                    <p className="text-sm text-muted-foreground">Permanently remove ALL application data</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="bg-destructive text-destructive-foreground font-bold"
                    onClick={() => setDeleteDialog("all")}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    DELETE EVERYTHING
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <AlertDialog open={deleteDialog !== null} onOpenChange={() => { setDeleteDialog(null); setTimeRange(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog === "all" 
                ? "This will permanently delete ALL of your data. This action cannot be undone."
                : "This will permanently delete the selected data. This action cannot be undone."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteDialog !== "all" && (
            <div className="py-4">
              <Label htmlFor="timeRange">Delete records older than (days):</Label>
              <Input
                id="timeRange"
                type="number"
                placeholder="e.g., 30, 90, 365"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="mt-2"
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteData(deleteDialog!)}
              className="bg-destructive"
              disabled={deleteDialog !== "all" && !timeRange}
            >
              Yes, Delete {deleteDialog === "all" ? "Everything" : "Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
