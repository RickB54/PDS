import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Pencil, Trash2, Printer, Save } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getInvoices, getExpenses, upsertExpense } from "@/lib/db";
import jsPDF from "jspdf";
import DateRangeFilter, { DateRangeValue } from "@/components/filters/DateRangeFilter";

interface Invoice {
  id?: string;
  total: number;
  createdAt: string;
}

interface Expense {
  id?: string;
  amount: number;
  description: string;
  createdAt: string;
}

const Accounting = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [notes, setNotes] = useState("");
  const [totalSpent, setTotalSpent] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [showDeleteExpense, setShowDeleteExpense] = useState(false);
  const [showDeleteNotes, setShowDeleteNotes] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangeValue>({});
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [invoiceList, setInvoiceList] = useState<Invoice[]>([]);

  useEffect(() => {
    loadData();
  }, [dateFilter]);

  const loadData = async () => {
    const invoices = await getInvoices();
    const expensesData = await getExpenses();
    setExpenseList(expensesData as Expense[]);
    setInvoiceList(invoices as Invoice[]);

    const now = new Date();
    const today = now.toDateString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let daily = 0, weekly = 0, monthly = 0, totalExp = 0;

    (invoices as Invoice[]).forEach(inv => {
      const invDate = new Date(inv.createdAt);
      if (invDate.toDateString() === today) daily += inv.total;
      if (invDate >= weekAgo) weekly += inv.total;
      if (invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear()) {
        monthly += inv.total;
      }
    });

    (expensesData as Expense[]).forEach(exp => {
      totalExp += exp.amount;
    });

    setDailyRevenue(daily);
    setWeeklyRevenue(weekly);
    setMonthlyRevenue(monthly);
    setTotalSpent(totalExp);
  };

  const calculateProfit = () => {
    // Compute filtered totals using quick filter + custom date range
    const now = new Date();
    const startQuick = dateFilter === 'daily' ? new Date(now.setHours(0,0,0,0))
      : dateFilter === 'weekly' ? new Date(Date.now() - 7*24*60*60*1000)
      : dateFilter === 'monthly' ? new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      : null;

    const within = (dStr: string) => {
      const d = new Date(dStr);
      if (startQuick && d < startQuick) return false;
      if (dateRange.from && d < new Date(dateRange.from.setHours(0,0,0,0))) return false;
      if (dateRange.to && d > new Date(dateRange.to.setHours(23,59,59,999))) return false;
      return true;
    };

    const revenue = invoiceList.filter(inv => within(inv.createdAt)).reduce((sum, i) => sum + (i.total || 0), 0);
    const exp = expenseList.filter(ex => within(ex.createdAt)).reduce((sum, e) => sum + (e.amount || 0), 0);
    return revenue - exp;
  };

  const handleAddExpense = async () => {
    const expense = parseFloat(expenses) || 0;
    if (expense === 0) return;

    await upsertExpense({
      amount: expense,
      description: expenseDesc || "Expense",
      createdAt: new Date().toISOString(),
    } as any);

    setExpenses("");
    setExpenseDesc("");
    toast({
      title: "Expense Added",
      description: `$${expense.toFixed(2)} added to total expenses.`,
    });
    loadData();
  };

  const generatePDF = (download = false) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Prime Detail Solutions", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Accounting Report", 105, 30, { align: "center" });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
    
    doc.text("Revenue:", 20, 60);
    doc.text(`Daily: $${dailyRevenue.toFixed(2)}`, 30, 70);
    doc.text(`Weekly: $${weeklyRevenue.toFixed(2)}`, 30, 78);
    doc.text(`Monthly: $${monthlyRevenue.toFixed(2)}`, 30, 86);
    
    doc.text(`Total Expenses: $${totalSpent.toFixed(2)}`, 20, 100);
    
    const profit = calculateProfit();
    doc.setFontSize(14);
    doc.text(`${profit >= 0 ? 'Profit' : 'Loss'}: $${Math.abs(profit).toFixed(2)}`, 20, 115);
    
    if (notes) {
      doc.setFontSize(10);
      doc.text("Notes:", 20, 130);
      doc.text(notes, 20, 138, { maxWidth: 170 });
    }

    if (download) {
      doc.save(`accounting-${new Date().toISOString().split('T')[0]}.pdf`);
    } else {
      window.open(doc.output('bloburl'), '_blank');
    }
  };

  const profit = calculateProfit();
  const profitPercent = monthlyRevenue > 0 ? ((profit / monthlyRevenue) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Accounting" />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h1 className="text-3xl font-bold text-foreground">Accounting</h1>
            <div className="flex gap-2 items-center flex-wrap">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                </SelectContent>
              </Select>
              <DateRangeFilter value={dateRange} onChange={setDateRange} storageKey="accounting-range" />
              <Button size="icon" variant="outline" onClick={() => generatePDF(false)}>
                <Printer className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => generatePDF(true)}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Revenue Tracking (Auto-Calculated)
            </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-background/50 rounded-lg border border-border">
                <Label className="text-muted-foreground">Daily Revenue</Label>
                <p className="text-3xl font-bold text-foreground mt-2">
                  ${dailyRevenue.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border border-border">
                <Label className="text-muted-foreground">Weekly Revenue</Label>
                <p className="text-3xl font-bold text-foreground mt-2">
                  ${weeklyRevenue.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border border-border">
                <Label className="text-muted-foreground">Monthly Revenue</Label>
                <p className="text-3xl font-bold text-foreground mt-2">
                  ${monthlyRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingDown className="h-6 w-6 text-primary" />
              Expense Tracking
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="job-expense">Add New Expense</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => expenses && setShowDeleteExpense(true)}
                      disabled={!expenses}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Input
                  id="expense-desc"
                  placeholder="Expense description"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="bg-background border-border"
                />
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="job-expense"
                      type="number"
                      value={expenses}
                      onChange={(e) => setExpenses(e.target.value)}
                      placeholder="Enter expense amount"
                      className="pl-10 bg-background border-border"
                    />
                  </div>
                  <Button onClick={handleAddExpense} className="bg-gradient-hero">
                    Add Expense
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-background/50 rounded-lg border border-border">
                <Label className="text-muted-foreground">Total Spent to Date</Label>
                <p className="text-3xl font-bold text-foreground mt-2">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card className={`p-6 border-border ${profit >= 0 ? 'bg-gradient-hero' : 'bg-destructive/20'}`}>
            <h2 className="text-2xl font-bold text-white mb-2">Profit/Loss Summary</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">
                ${Math.abs(profit).toFixed(2)}
              </span>
              <span className="text-white/80">
                {profit >= 0 ? 'Profit' : 'Loss'}
              </span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Profit/Loss Visualization</h2>
            <div className="flex justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 200 200" className="transform -rotate-90">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="hsl(var(--destructive))"
                    strokeWidth="40"
                    strokeDasharray={`${Math.max(0, -profitPercent) * 5.03} 503`}
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="hsl(var(--success))"
                    strokeWidth="40"
                    strokeDasharray={`${Math.max(0, profitPercent) * 5.03} 503`}
                    strokeDashoffset={`${Math.max(0, -profitPercent) * 5.03}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Net</p>
                    <p className="text-xl font-bold text-foreground">{Math.abs(profitPercent).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'hsl(var(--success))' }}></div>
                <span className="text-sm">Profit: ${Math.max(0, profit).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-destructive"></div>
                <span className="text-sm">Loss: ${Math.max(0, -profit).toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Notes</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => notes && setShowDeleteNotes(true)}
                  disabled={!notes}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add general accounting notes here..."
              className="min-h-[80px] bg-background border-border"
              maxLength={250}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {notes.length}/250 characters
            </p>
          </Card>
        </div>
      </main>

      <AlertDialog open={showDeleteExpense} onOpenChange={setShowDeleteExpense}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear the current expense input. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
<AlertDialogFooter className="button-group-responsive">
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setExpenses(""); setExpenseDesc(""); setShowDeleteExpense(false); }}>
              Yes
            </AlertDialogAction>
</AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteNotes} onOpenChange={setShowDeleteNotes}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your notes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
<AlertDialogFooter className="button-group-responsive">
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setNotes(""); setShowDeleteNotes(false); }}>
              Yes
            </AlertDialogAction>
</AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Accounting;
