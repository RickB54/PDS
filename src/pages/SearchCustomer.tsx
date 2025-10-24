import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CustomerModal from "@/components/customers/CustomerModal";
import { getCustomers, upsertCustomer, deleteCustomer as removeCustomer } from "@/lib/db";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
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

interface Customer {
  id?: string;
  name: string;
  phone: string;
  vehicle: string;
  model: string;
  year: string;
  color: string;
  mileage: string;
  vehicleType: string;
  conditionInside: string;
  conditionOutside: string;
  services: string[];
  lastService: string;
  duration: string;
  notes: string;
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Smith",
    phone: "(555) 123-4567",
    vehicle: "Toyota",
    model: "Camry",
    year: "2022",
    color: "Silver",
    mileage: "45000",
    vehicleType: "Compact/Sedan",
    conditionInside: "Good",
    conditionOutside: "Excellent",
    services: ["Full Exterior Detail", "Interior Cleaning"],
    lastService: "10/15/2025",
    duration: "2 hours",
    notes: "Prefers early morning appointments"
  },
  {
    id: "2",
    name: "Sarah Johnson",
    phone: "(555) 987-6543",
    vehicle: "BMW",
    model: "X5",
    year: "2023",
    color: "Black",
    mileage: "12000",
    vehicleType: "Luxury/High-End",
    conditionInside: "Excellent",
    conditionOutside: "Good",
    services: ["Premium Detail"],
    lastService: "10/20/2025",
    duration: "3.5 hours",
    notes: "Heavy dirt required extra time"
  },
];

const SearchCustomer = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [dateFilter, setDateFilter] = useState<"all" | "daily" | "weekly" | "monthly">("all");

  useEffect(() => {
    (async () => {
      const list = await getCustomers();
      if (!list.length) {
        setCustomers(mockCustomers);
      } else {
        setCustomers(list as Customer[]);
      }
    })();
  }, []);

  const refresh = async () => {
    const list = await getCustomers();
    setCustomers(list as Customer[]);
  };

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: Customer) => { setEditing(c); setModalOpen(true); };
  const onSaveModal = async (data: Customer) => {
    await upsertCustomer(data);
    await refresh();
    toast({ title: "Customer Saved", description: "Record stored locally." });
  };

  const filterByDate = (customer: Customer) => {
    if (dateFilter === "all") return true;
    if (!customer.lastService) return false;
    
    const serviceDate = new Date(customer.lastService);
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    
    if (dateFilter === "daily") return now.getTime() - serviceDate.getTime() < dayMs;
    if (dateFilter === "weekly") return now.getTime() - serviceDate.getTime() < 7 * dayMs;
    if (dateFilter === "monthly") return now.getTime() - serviceDate.getTime() < 30 * dayMs;
    return true;
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.year.includes(searchTerm);
    return matchesSearch && filterByDate(customer);
  });

  const handleDelete = async () => {
    if (!deleteCustomerId) return;
    await removeCustomer(deleteCustomerId);
    await refresh();
    toast({
      title: "Customer Deleted",
      description: "Customer record has been removed.",
    });
    setDeleteCustomerId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Customer Info" />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6 animate-fade-in">
          {/* Search Bar */}
          <Card className="p-6 bg-gradient-card border-border">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-foreground">Find Customer</h2>
                <div className="flex gap-2 items-center flex-wrap">
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
                  <Button className="bg-gradient-hero" onClick={openAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Customer
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, phone, vehicle make, model, or year..."
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>
          </Card>

          {/* Customer List */}
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="p-6 bg-gradient-card border-border hover:shadow-glow transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{customer.name}</h3>
                        <p className="text-muted-foreground">{customer.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(customer)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteCustomerId(customer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Vehicle</Label>
                        <p className="text-foreground font-medium">
                          {customer.year} {customer.vehicle} {customer.model}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-muted-foreground">Color</Label>
                        <p className="text-foreground font-medium">{customer.color || "N/A"}</p>
                      </div>

                      <div>
                        <Label className="text-muted-foreground">Mileage</Label>
                        <p className="text-foreground font-medium">{customer.mileage ? `${customer.mileage} miles` : "N/A"}</p>
                      </div>

                      <div>
                        <Label className="text-muted-foreground">Vehicle Type</Label>
                        <p className="text-foreground font-medium">{customer.vehicleType || "N/A"}</p>
                      </div>

                      <div>
                        <Label className="text-muted-foreground">Last Service</Label>
                        <p className="text-foreground font-medium">{customer.lastService}</p>
                      </div>

                      <div>
                        <Label className="text-muted-foreground">Condition (Inside)</Label>
                        <p className="text-foreground font-medium">{customer.conditionInside || "N/A"}</p>
                      </div>

                      <div>
                        <Label className="text-muted-foreground">Condition (Outside)</Label>
                        <p className="text-foreground font-medium">{customer.conditionOutside || "N/A"}</p>
                      </div>

                      <div className="md:col-span-2">
                        <Label className="text-muted-foreground">Services</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {customer.services.map((service, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-muted-foreground">Duration</Label>
                        <p className="text-foreground font-medium">{customer.duration}</p>
                      </div>
                    </div>

                    {customer.notes && (
                      <div>
                        <Label className="text-muted-foreground">Notes</Label>
                        <p className="text-foreground">{customer.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <Card className="p-12 bg-gradient-card border-border text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No customers found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or add a new customer
              </p>
            </Card>
          )}
        </div>
      </main>

      <AlertDialog open={deleteCustomerId !== null} onOpenChange={() => setDeleteCustomerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this customer record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SearchCustomer;
