import { useRef } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleBackup = async () => {
    const { json } = await exportAll();
    const filename = `prime-detail-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    downloadBlob(filename, json);
    toast({
      title: "Backup Created",
      description: "All data has been backed up to a JSON file.",
    });
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await importAllFromJSON(text);
    toast({ title: "Data Restored", description: "Your data has been restored from backup." });
    e.currentTarget.value = "";
  };

  const handleRestore = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Settings" />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6 animate-fade-in">
          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">Data Management</h2>
                <p className="text-muted-foreground">Backup and restore your local data</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-background/50 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">Backup Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a backup of all your customer records, service checklists, invoices, and settings.
                </p>
                <Button onClick={handleBackup} className="bg-gradient-hero">
                  <Download className="h-4 w-4 mr-2" />
                  Backup Now
                </Button>
              </div>

              <div className="p-4 bg-background/50 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">Restore Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Restore your data from a previous backup file. This will replace all current data.
                </p>
                <Button onClick={handleRestore} variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  <Upload className="h-4 w-4 mr-2" />
                  Restore from File
                </Button>
                <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={onFileChange} />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">App Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version:</span>
                <span className="text-foreground font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Storage Used:</span>
                <span className="text-foreground font-medium">Local Device</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Backup:</span>
                <span className="text-foreground font-medium">Never</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
