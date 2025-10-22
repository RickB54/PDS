import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Pencil, Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

const Accounting = () => {
  const { toast } = useToast();
  const [revenue, setRevenue] = useState({ daily: "", weekly: "", monthly: "" });
  const [expenses, setExpenses] = useState("");
  const [notes, setNotes] = useState("");
  const [totalSpent, setTotalSpent] = useState(0);
  const [showDeleteExpense, setShowDeleteExpense] = useState(false);
  const [showDeleteNotes, setShowDeleteNotes] = useState(false);

  const calculateProfit = () => {
    const monthlyRev = parseFloat(revenue.monthly) || 0;
    const expense = parseFloat(expenses) || 0;
    return monthlyRev - expense - totalSpent;
  };

  const handleAddExpense = () => {
    const expense = parseFloat(expenses) || 0;
    setTotalSpent(prev => prev + expense);
    setExpenses("");
    toast({
      title: "Expense Added",
      description: `$${expense.toFixed(2)} added to total expenses.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Accounting" />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6 animate-fade-in">
          {/* Revenue Tracking */}
          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Revenue Tracking
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daily-revenue">Daily Revenue</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="daily-revenue"
                    type="number"
                    value={revenue.daily}
                    onChange={(e) => setRevenue({ ...revenue, daily: e.target.value })}
                    placeholder="0.00"
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekly-revenue">Weekly Revenue</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="weekly-revenue"
                    type="number"
                    value={revenue.weekly}
                    onChange={(e) => setRevenue({ ...revenue, weekly: e.target.value })}
                    placeholder="0.00"
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-revenue">Monthly Revenue</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="monthly-revenue"
                    type="number"
                    value={revenue.monthly}
                    onChange={(e) => setRevenue({ ...revenue, monthly: e.target.value })}
                    placeholder="0.00"
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Expense Tracking */}
          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingDown className="h-6 w-6 text-primary" />
              Expense Tracking
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="job-expense">Per Job Expense</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
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

          {/* Profit/Loss Summary */}
          <Card className={`p-6 border-border ${calculateProfit() >= 0 ? 'bg-gradient-hero' : 'bg-destructive/20'}`}>
            <h2 className="text-2xl font-bold text-white mb-2">Profit/Loss Summary</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">
                ${Math.abs(calculateProfit()).toFixed(2)}
              </span>
              <span className="text-white/80">
                {calculateProfit() >= 0 ? 'Profit' : 'Loss'}
              </span>
            </div>
          </Card>

          {/* Notes */}
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
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setExpenses(""); setShowDeleteExpense(false); }}>
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
          <AlertDialogFooter>
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
