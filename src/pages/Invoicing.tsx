import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Printer, Save, Trash2, DollarSign } from "lucide-react";
import { getInvoices, upsertInvoice, getCustomers, deleteInvoice } from "@/lib/db";
import { Customer } from "@/components/customers/CustomerModal";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { PaymentDialog } from "@/components/invoicing/PaymentDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateRangeFilter, { DateRangeValue } from "@/components/filters/DateRangeFilter";
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
  paymentStatus?: "unpaid" | "partially-paid" | "paid";
  paidAmount?: number;
  paidDate?: string;
}

const Invoicing = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [services, setServices] = useState<{ name: string; price: number }[]>([]);
  const [newService, setNewService] = useState({ name: "", price: "" });
  const [dateFilter, setDateFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangeValue>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [paymentDialog, setPaymentDialog] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

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
      let passQuick = true;
      if (dateFilter === "daily") passQuick = invDate.toDateString() === now.toDateString();
      else if (dateFilter === "weekly") passQuick = invDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      else if (dateFilter === "monthly") passQuick = invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();

      let passRange = true;
      if (dateRange.from) passRange = invDate >= new Date(dateRange.from.setHours(0,0,0,0));
      if (passRange && dateRange.to) passRange = invDate <= new Date(dateRange.to.setHours(23,59,59,999));

      return passQuick && passRange;
    });
  };

  const totalOutstanding = filterInvoices()
    .filter(inv => (inv.paymentStatus || "unpaid") !== "paid")
    .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0);

  const updatePayment = async () => {
    if (!paymentDialog || !paymentAmount) return;
    const paid = parseFloat(paymentAmount);
    const newPaidAmount = (paymentDialog.paidAmount || 0) + paid;
    const newStatus: "unpaid" | "partially-paid" | "paid" = 
      newPaidAmount >= paymentDialog.total ? "paid" : newPaidAmount > 0 ? "partially-paid" : "unpaid";
    
    await upsertInvoice({
      ...paymentDialog,
      paidAmount: newPaidAmount,
      paymentStatus: newStatus,
      paidDate: new Date().toISOString()
    });
    
    await loadData();
    setPaymentDialog(null);
    setPaymentAmount("");
    toast({ title: "Payment Recorded", description: "Invoice payment updated." });
  };

  const generateListPDF = (download = false) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Invoice List", 20, 20);
    let y = 35;
    filterInvoices().forEach((inv) => {
      doc.setFontSize(10);
      const status = inv.paymentStatus || "unpaid";
      doc.text(`${inv.customerName} | $${inv.total} | ${status.toUpperCase()} | ${inv.date}`, 20, y);
      y += 7;
      if (y > 280) { doc.addPage(); y = 20; }
    });
    if (download) doc.save("invoices.pdf"); else window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Invoicing" />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6 animate-fade-in">
<div className="flex justify-between items-center flex-wrap gap-3">
            <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
            <div className="flex gap-3 items-center flex-wrap w-full md:w-auto">
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
              <DateRangeFilter value={dateRange} onChange={setDateRange} storageKey="invoices-range" />
              <Button variant="outline" size="sm" onClick={() => generateListPDF(false)}>
                <Printer className="h-4 w-4 mr-2" />Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => generateListPDF(true)}>
                <Save className="h-4 w-4 mr-2" />Save PDF
              </Button>
              <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-gradient-hero w-full md:w-auto">
                <FileText className="h-4 w-4 mr-2" />
                {showCreateForm ? "Cancel" : "Create Invoice"}
              </Button>
            </div>
          </div>

          {/* Outstanding Balance */}
          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Outstanding Balance</p>
                <h3 className="text-2xl font-bold text-foreground">${totalOutstanding.toFixed(2)}</h3>
              </div>
            </div>
          </Card>

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
                    <p className={`text-sm font-medium mt-1 ${
                      (inv.paymentStatus || "unpaid") === "paid" ? "text-success" :
                      (inv.paymentStatus || "unpaid") === "partially-paid" ? "text-yellow-500" :
                      "text-destructive"
                    }`}>
                      {(inv.paymentStatus || "unpaid").replace("-", " ").toUpperCase()}
                      {inv.paidAmount && inv.paidAmount > 0 ? ` ($${inv.paidAmount.toFixed(2)} paid)` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
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
                    {(inv.paymentStatus || "unpaid") !== "paid" && (
                      <Button size="sm" onClick={() => setPaymentDialog(inv)}>
                        <DollarSign className="h-4 w-4 mr-1" />
                        Record Payment
                      </Button>
                    )}
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

      <PaymentDialog
        open={paymentDialog !== null}
        onOpenChange={(open) => !open && setPaymentDialog(null)}
        invoice={paymentDialog}
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        onConfirm={updatePayment}
      />
    </div>
  );
};

export default Invoicing;
