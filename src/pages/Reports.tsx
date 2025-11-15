import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Save, AlertTriangle } from "lucide-react";
import localforage from "localforage";
import DateRangeFilter, { DateRangeValue } from "@/components/filters/DateRangeFilter";
import jsPDF from "jspdf";
import { getCurrentUser } from "@/lib/auth";

const Reports = () => {
  const [dateFilter, setDateFilter] = useState<"all" | "daily" | "weekly" | "monthly">("all");
  const [dateRange, setDateRange] = useState<DateRangeValue>({});
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [chemicals, setChemicals] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.email.includes('admin');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const cust = (await localforage.getItem<any[]>("customers")) || [];
    const inv = (await localforage.getItem<any[]>("invoices")) || [];
    const chems = (await localforage.getItem<any[]>("chemicals")) || [];
    const mats = (await localforage.getItem<any[]>("materials")) || [];
    const jobsData = (await localforage.getItem<any[]>("completed-jobs")) || [];
    const estimatesData = (await localforage.getItem<any[]>("estimates")) || [];
    setCustomers(cust);
    setInvoices(inv);
    setChemicals(chems);
    setMaterials(mats);
    setJobs(jobsData);
    setEstimates(estimatesData);
  };

  const filterByDate = (items: any[], dateField = "createdAt") => {
    const now = new Date();
    return items.filter(item => {
      const itemDate = new Date(item[dateField] || item.date || item.createdAt || item.finishedAt);
      if (!itemDate || isNaN(itemDate.getTime())) return false;
      
      let passQuick = true;
      if (dateFilter === "daily") passQuick = itemDate.toDateString() === now.toDateString();
      else if (dateFilter === "weekly") passQuick = itemDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      else if (dateFilter === "monthly") passQuick = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();

      let passRange = true;
      if (dateRange.from) passRange = itemDate >= new Date(dateRange.from.setHours(0,0,0,0));
      if (passRange && dateRange.to) passRange = itemDate <= new Date(dateRange.to.setHours(23,59,59,999));

      return passQuick && passRange;
    });
  };

  const generateCustomerReport = (download = false) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Customer Report", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, { align: "center" });
    
    let y = 40;
    const filteredCustomers = filterByDate(customers);
    
    filteredCustomers.forEach((cust) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.text(`${cust.name}`, 20, y);
      y += 6;
      doc.setFontSize(9);
      doc.text(`Vehicle: ${cust.year || ''} ${cust.vehicle || ''} ${cust.model || ''} | Type: ${cust.vehicleType || 'N/A'}`, 20, y);
      y += 5;
      doc.text(`Email: ${cust.email || 'N/A'} | Phone: ${cust.phone || 'N/A'}`, 20, y);
      y += 5;
      doc.text(`Address: ${cust.address || 'N/A'}`, 20, y);
      y += 8;
    });

    if (download) doc.save(`CustomerReport_${new Date().toISOString().split('T')[0]}.pdf`);
    else window.open(doc.output('bloburl'), '_blank');
  };

  const generateInventoryReport = (download = false) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Inventory Report", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, { align: "center" });
    
    let y = 40;
    doc.setFontSize(14);
    doc.text("Chemical Inventory", 20, y);
    y += 8;
    
    chemicals.forEach(chem => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      const lowStock = chem.currentStock <= chem.threshold;
      doc.text(`${chem.name} - ${chem.bottleSize} - Stock: ${chem.currentStock} ${lowStock ? '(LOW STOCK)' : ''}`, 20, y);
      y += 6;
    });
    
    y += 5;
    doc.setFontSize(14);
    doc.text("Materials Inventory", 20, y);
    y += 8;
    
    materials.forEach(mat => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.text(`${mat.name} - Qty: ${mat.quantity}`, 20, y);
      y += 6;
    });

    if (download) doc.save(`InventoryReport_${new Date().toISOString().split('T')[0]}.pdf`);
    else window.open(doc.output('bloburl'), '_blank');
  };

  const generateEmployeeReport = (download = false) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Employee Performance Report", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, { align: "center" });
    
    let y = 40;
    const filteredJobs = filterByDate(jobs, 'finishedAt');
    
    doc.setFontSize(12);
    doc.text(`Total Jobs Completed: ${filteredJobs.length}`, 20, y);
    y += 10;
    
    filteredJobs.forEach(job => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.text(`Employee: ${job.employee || 'N/A'}`, 20, y);
      y += 5;
      doc.text(`Customer: ${job.customer || 'N/A'} | Vehicle: ${job.vehicle || 'N/A'}`, 20, y);
      y += 5;
      doc.text(`Service: ${job.service || 'N/A'} | Time: ${job.totalTime || 'N/A'}`, 20, y);
      y += 5;
      doc.text(`Date: ${job.finishedAt ? new Date(job.finishedAt).toLocaleString() : 'N/A'}`, 20, y);
      y += 8;
    });

    if (download) doc.save(`EmployeeReport_${new Date().toISOString().split('T')[0]}.pdf`);
    else window.open(doc.output('bloburl'), '_blank');
  };

  const generateEstimatesReport = (download = false) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Estimates & Quotes Report", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, { align: "center" });
    
    let y = 40;
    const filteredEstimates = filterByDate(estimates);
    
    doc.setFontSize(12);
    doc.text(`Total Estimates: ${filteredEstimates.length}`, 20, y);
    y += 10;
    
    filteredEstimates.forEach(est => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.text(`#${est.id || 'N/A'} - ${est.customerName || 'N/A'}`, 20, y);
      y += 5;
      doc.text(`Service: ${est.service || 'N/A'} | Total: $${est.total || 0}`, 20, y);
      y += 5;
      doc.text(`Status: ${est.status || 'Draft'}`, 20, y);
      y += 8;
    });

    if (download) doc.save(`EstimatesReport_${new Date().toISOString().split('T')[0]}.pdf`);
    else window.open(doc.output('bloburl'), '_blank');
  };

  // Admin-only check
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Reports" />
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <Card className="p-8 bg-destructive/10 border-destructive">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="h-16 w-16 text-destructive" />
              <h2 className="text-2xl font-bold text-foreground">Admin Access Required</h2>
              <p className="text-muted-foreground">
                Reports are only accessible to administrators. Please contact your system administrator.
              </p>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const lowStockChemicals = chemicals.filter(c => c.currentStock <= c.threshold);
  const totalInventoryValue = chemicals.reduce((sum, c) => sum + (c.costPerBottle * c.currentStock), 0);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Business Reports (Admin Only)" />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6 animate-fade-in">
          {/* Date Filters */}
          <Card className="p-4 bg-gradient-card border-border">
            <div className="flex gap-4 items-center flex-wrap">
              <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                </SelectContent>
              </Select>
              <DateRangeFilter value={dateRange} onChange={setDateRange} storageKey="reports-range" />
            </div>
          </Card>

          <Tabs defaultValue="customers" className="space-y-4">
<TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-5 bg-muted">
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="employee">Employee</TabsTrigger>
              <TabsTrigger value="estimates">Estimates</TabsTrigger>
            </TabsList>

            {/* Customer Report */}
            <TabsContent value="customers" className="space-y-4">
              <Card className="p-6 bg-gradient-card border-border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-foreground">Customer Report</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => generateCustomerReport(false)}>
                      <Printer className="h-4 w-4 mr-2" />Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => generateCustomerReport(true)}>
                      <Save className="h-4 w-4 mr-2" />Save PDF
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Total Customers: <span className="font-semibold text-foreground">{filterByDate(customers).length}</span>
                  </p>
                  
                  {/* Customer-Specific Report */}
                  <div className="pt-4 border-t border-border">
                    <label className="block text-sm font-medium mb-2">Select Customer for Detailed Report</label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger className="w-full max-w-md bg-background border-border">
                        <SelectValue placeholder="Choose a customer..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border z-50">
                        {customers.map(cust => (
                          <SelectItem key={cust.id} value={cust.id}>
                            {cust.name} - {cust.vehicle || 'No vehicle'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedCustomer && (() => {
                    const cust = customers.find(c => c.id === selectedCustomer);
                    const custInvoices = invoices.filter(inv => inv.customerId === selectedCustomer);
                    const totalSpent = custInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
                    const totalOwed = custInvoices.reduce((sum, inv) => sum + ((inv.total || 0) - (inv.paidAmount || 0)), 0);
                    
                    return (
                      <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                        <h3 className="font-bold text-lg mb-2">{cust?.name}</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Total Spent</p>
                            <p className="text-xl font-bold text-primary">${totalSpent.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Balance Owed</p>
                            <p className="text-xl font-bold text-destructive">${totalOwed.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="text-sm">Vehicle: {cust?.year} {cust?.vehicle} {cust?.model}</p>
                        <p className="text-sm">Total Services: {custInvoices.length}</p>
                      </div>
                    );
                  })()}
                </div>
              </Card>
            </TabsContent>

            {/* Invoice Report */}
            <TabsContent value="invoices" className="space-y-4">
              <Card className="p-6 bg-gradient-card border-border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-foreground">Invoice Report</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => generateCustomerReport(false)}>
                      <Printer className="h-4 w-4 mr-2" />Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => generateCustomerReport(true)}>
                      <Save className="h-4 w-4 mr-2" />Save PDF
                    </Button>
                  </div>
                </div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Invoices</p>
                    <p className="text-2xl font-bold text-foreground">{filterByDate(invoices).length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-primary">
                      ${filterByDate(invoices).reduce((sum, inv) => sum + (inv.total || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Paid</p>
                    <p className="text-2xl font-bold text-success">
                      ${filterByDate(invoices).reduce((sum, inv) => sum + (inv.paidAmount || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                    <p className="text-2xl font-bold text-destructive">
                      ${(filterByDate(invoices).reduce((sum, inv) => sum + (inv.total || 0), 0) - 
                         filterByDate(invoices).reduce((sum, inv) => sum + (inv.paidAmount || 0), 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Inventory Report */}
            <TabsContent value="inventory" className="space-y-4">
              <Card className="p-6 bg-gradient-card border-border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-foreground">Inventory Report</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => generateInventoryReport(false)}>
                      <Printer className="h-4 w-4 mr-2" />Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => generateInventoryReport(true)}>
                      <Save className="h-4 w-4 mr-2" />Save PDF
                    </Button>
                  </div>
                </div>
                
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Chemicals</p>
                    <p className="text-2xl font-bold text-foreground">{chemicals.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Low Stock Items</p>
                    <p className="text-2xl font-bold text-destructive">{lowStockChemicals.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold text-success">${totalInventoryValue.toFixed(2)}</p>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chemicals.map(chem => (
                      <TableRow key={chem.id}>
                        <TableCell className="font-medium">{chem.name}</TableCell>
                        <TableCell>{chem.bottleSize}</TableCell>
                        <TableCell className={chem.currentStock <= chem.threshold ? 'text-destructive font-bold' : ''}>
                          {chem.currentStock}
                        </TableCell>
                        <TableCell>
                          {chem.currentStock <= chem.threshold ? (
                            <span className="text-destructive font-semibold">⚠️ LOW STOCK</span>
                          ) : (
                            <span className="text-success">✓ OK</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Employee Performance Report */}
            <TabsContent value="employee" className="space-y-4">
              <Card className="p-6 bg-gradient-card border-border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-foreground">Employee Performance Report</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => generateEmployeeReport(false)}>
                      <Printer className="h-4 w-4 mr-2" />Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => generateEmployeeReport(true)}>
                      <Save className="h-4 w-4 mr-2" />Save PDF
                    </Button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">
                    Total Jobs Completed: <span className="font-semibold text-foreground">{filterByDate(jobs, 'finishedAt').length}</span>
                  </p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterByDate(jobs, 'finishedAt').map((job, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{job.employee || 'N/A'}</TableCell>
                        <TableCell>{job.customer || 'N/A'}</TableCell>
                        <TableCell>{job.service || 'N/A'}</TableCell>
                        <TableCell>{job.totalTime || 'N/A'}</TableCell>
                        <TableCell>{job.finishedAt ? new Date(job.finishedAt).toLocaleDateString() : 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                    {filterByDate(jobs, 'finishedAt').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No completed jobs for the selected period.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Estimates & Quotes Report */}
            <TabsContent value="estimates" className="space-y-4">
              <Card className="p-6 bg-gradient-card border-border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-foreground">Estimates & Quotes Report</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => generateEstimatesReport(false)}>
                      <Printer className="h-4 w-4 mr-2" />Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => generateEstimatesReport(true)}>
                      <Save className="h-4 w-4 mr-2" />Save PDF
                    </Button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">
                    Total Estimates: <span className="font-semibold text-foreground">{filterByDate(estimates).length}</span>
                  </p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterByDate(estimates).map((est) => (
                      <TableRow key={est.id}>
                        <TableCell className="font-medium">#{est.id || 'N/A'}</TableCell>
                        <TableCell>{est.customerName || 'N/A'}</TableCell>
                        <TableCell>{est.service || 'N/A'}</TableCell>
                        <TableCell className="text-primary font-semibold">${est.total || 0}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold 
                            ${est.status === 'Accepted' ? 'bg-success/20 text-success' : 
                              est.status === 'Sent' ? 'bg-primary/20 text-primary' : 
                              'bg-muted text-muted-foreground'}`}>
                            {est.status || 'Draft'}
                          </span>
                        </TableCell>
                        <TableCell>{est.createdAt ? new Date(est.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                    {filterByDate(estimates).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No estimates for the selected period.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Reports;
