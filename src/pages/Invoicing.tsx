import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Printer, Save, Trash2, Calendar } from "lucide-react";
import { getInvoices, upsertInvoice, getCustomers, deleteInvoice } from "@/lib/db";
import { Customer } from "@/components/customers/CustomerModal";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Invoice {
  id?: string;
  customerId: string;
  customerName: string;
  vehicle: string;
  services: { name: string; price: number }[];
  total: number;
  date: string;
  createdAt: string;
}

const Invoicing = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [services, setServices] = useState<{ name: string; price: number }[]>([]);
  const [newService, setNewService] = useState({ name: "", price: "" });
  const [dateFilter, setDateFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const invs = await getInvoices();
    const custs = await getCustomers();
    setInvoices(invs as Invoice[]);
    setCustomers(custs as Customer[]);
  };

  const addService = () => {
    if (newService.name && newService.price) {
      setServices([...services, { name: newService.name, price: parseFloat(newService.price) }]);
      setNewService({ name: "", price: "" });
    }
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const calculateTotal = () => services.reduce((sum, s) => sum + s.price, 0);

  const createInvoice = async () => {
    if (!selectedCustomer || services.length === 0) {
      toast({ title: "Error", description: "Please select a customer and add services", variant: "destructive" });
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) return;

    const invoice: Invoice = {
      customerId: selectedCustomer,
      customerName: customer.name,
      vehicle: `${customer.year} ${customer.vehicle} ${customer.model}`,
      services,
      total: calculateTotal(),
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
    };

    await upsertInvoice(invoice);
    toast({ title: "Success", description: "Invoice created successfully" });
    setSelectedCustomer("");
    setServices([]);
    setShowCreateForm(false);
    loadData();
  };

  const generatePDF = (invoice: Invoice, download = false) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Prime Detail Solutions", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Invoice", 105, 30, { align: "center" });
    doc.text(`Date: ${invoice.date}`, 20, 45);
    doc.text(`Customer: ${invoice.customerName}`, 20, 55);
    doc.text(`Vehicle: ${invoice.vehicle}`, 20, 65);
    
    let y = 80;
    doc.text("Services:", 20, y);
    y += 10;
    invoice.services.forEach((s) => {
      doc.text(`${s.name}: $${s.price.toFixed(2)}`, 30, y);
      y += 8;
    });
    
    y += 5;
    doc.setFontSize(14);
    doc.text(`Total: $${invoice.total.toFixed(2)}`, 20, y);

    if (download) {
      doc.save(`invoice-${invoice.id}.pdf`);
    } else {
      window.open(doc.output('bloburl'), '_blank');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    await deleteInvoice(id);
    setDeleteId(null);
    toast({ title: "Deleted", description: "Invoice deleted successfully" });
    loadData();
  };

  const filterInvoices = () => {
    const now = new Date();
    return invoices.filter(inv => {
      const invDate = new Date(inv.createdAt);
      if (dateFilter === "daily") {
        return invDate.toDateString() === now.toDateString();
      } else if (dateFilter === "weekly") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return invDate >= weekAgo;
      } else if (dateFilter === "monthly") {
        return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Invoicing" />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
            <div className="flex gap-3">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-gradient-hero">
                <FileText className="h-4 w-4 mr-2" />
                {showCreateForm ? "Cancel" : "Create Invoice"}
              </Button>
            </div>
          </div>

          {showCreateForm && (
            <Card className="p-6 bg-gradient-card border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">New Invoice</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer">Select Customer</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id!}>{c.name} - {c.vehicle} {c.model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t border-border pt-4">
                  <Label>Add Services</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      placeholder="Service name" 
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    />
                    <Input 
                      type="number" 
                      placeholder="Price" 
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      className="w-32"
                    />
                    <Button onClick={addService} variant="outline">Add</Button>
                  </div>
                </div>

                {services.length > 0 && (
                  <div className="space-y-2">
                    {services.map((s, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-background/50 rounded">
                        <span>{s.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">${s.price.toFixed(2)}</span>
                          <Button size="icon" variant="ghost" onClick={() => removeService(i)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="text-right text-xl font-bold text-primary pt-2 border-t">
                      Total: ${calculateTotal().toFixed(2)}
                    </div>
                  </div>
                )}

                <Button onClick={createInvoice} className="w-full bg-gradient-hero">
                  Create Invoice
                </Button>
              </div>
            </Card>
          )}

          <div className="grid gap-4">
            {filterInvoices().map((inv) => (
              <Card key={inv.id} className="p-4 bg-gradient-card border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-foreground">{inv.customerName}</h3>
                    <p className="text-sm text-muted-foreground">{inv.vehicle}</p>
                    <p className="text-sm text-muted-foreground">Date: {inv.date}</p>
                    <div className="mt-2 space-y-1">
                      {inv.services.map((s, i) => (
                        <p key={i} className="text-sm">• {s.name} - ${s.price.toFixed(2)}</p>
                      ))}
                    </div>
                    <p className="text-lg font-bold text-primary mt-2">Total: ${inv.total.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" onClick={() => generatePDF(inv, false)}>
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => generatePDF(inv, true)}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(inv.id!)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDeleteInvoice(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Invoicing;
