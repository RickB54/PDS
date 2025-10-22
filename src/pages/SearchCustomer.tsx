import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  model: string;
  year: string;
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
    services: ["Premium Detail"],
    lastService: "10/20/2025",
    duration: "3.5 hours",
    notes: "Heavy dirt required extra time"
  },
];

const SearchCustomer = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [customers] = useState<Customer[]>(mockCustomers);
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.year.includes(searchTerm)
  );

  const handleDelete = () => {
    toast({
      title: "Customer Deleted",
      description: "Customer record has been removed.",
    });
    setDeleteCustomerId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Search Customer" />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6 animate-fade-in">
          {/* Search Bar */}
          <Card className="p-6 bg-gradient-card border-border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Find Customer</h2>
                <Button className="bg-gradient-hero">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Customer
                </Button>
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
                        <Button variant="ghost" size="icon">
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
                        <Label className="text-muted-foreground">Last Service</Label>
                        <p className="text-foreground font-medium">{customer.lastService}</p>
                      </div>

                      <div>
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
