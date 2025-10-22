import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Save, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
}

const services: Service[] = [
  { id: "basic-wash", name: "Basic Exterior Wash", price: 50, description: "Pre-rinse, foam cannon, two-bucket wash, drying" },
  { id: "full-exterior", name: "Full Exterior Detail", price: 150, description: "Basic wash + clay bar, iron remover, sealant/wax, tire dressing" },
  { id: "interior", name: "Interior Cleaning", price: 100, description: "Vacuum, APC cleaning, glass cleaning, UV protectant" },
  { id: "full-detail", name: "Full Detail (Interior + Exterior)", price: 225, description: "Combines Full Exterior + Interior" },
  { id: "premium", name: "Premium Detail", price: 350, description: "Full Detail + paint correction, ceramic spray" },
];

const addOns: Service[] = [
  { id: "wheel-cleaning", name: "Wheel Cleaning", price: 25, description: "Deep wheel and barrel cleaning" },
  { id: "leather", name: "Leather Conditioning", price: 30, description: "Clean and condition leather surfaces" },
  { id: "odor", name: "Odor Eliminator", price: 20, description: "Eliminate unwanted odors" },
  { id: "headlight", name: "Headlight Restoration", price: 40, description: "Restore clarity to headlights" },
];

const ServiceChecklist = () => {
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [customerName, setCustomerName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [notes, setNotes] = useState("");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const toggleService = (serviceId: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  };

  const calculateTotal = () => {
    let total = 0;
    [...services, ...addOns].forEach(service => {
      if (selectedServices.has(service.id)) {
        total += service.price;
      }
    });
    return total;
  };

  const handleSave = () => {
    toast({
      title: "Estimate Saved",
      description: "Service estimate has been saved successfully.",
    });
  };

  const handleDeleteNotes = () => {
    setNotes("");
    setShowDeleteAlert(false);
    toast({
      title: "Notes Deleted",
      description: "Notes have been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Service Checklist" />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6 animate-fade-in">
          {/* Customer Info */}
          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name">Customer Name</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle-type">Vehicle Type</Label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="sports">Sports Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Main Services */}
          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Services</h2>
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <Checkbox
                    id={service.id}
                    checked={selectedServices.has(service.id)}
                    onCheckedChange={() => toggleService(service.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={service.id} className="text-base font-medium cursor-pointer">
                      {service.name} - ${service.price}
                    </Label>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Add-Ons */}
          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Add-Ons</h2>
            <div className="space-y-3">
              {addOns.map((service) => (
                <div
                  key={service.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <Checkbox
                    id={service.id}
                    checked={selectedServices.has(service.id)}
                    onCheckedChange={() => toggleService(service.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={service.id} className="text-base font-medium cursor-pointer">
                      {service.name} - ${service.price}
                    </Label>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                </div>
              ))}
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
                  onClick={() => notes && setShowDeleteAlert(true)}
                  disabled={!notes}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes here..."
              className="min-h-[80px] bg-background border-border"
              maxLength={250}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {notes.length}/250 characters
            </p>
          </Card>

          {/* Total */}
          <Card className="p-6 bg-gradient-hero border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Service Estimate</h2>
                <p className="text-white/80">Total amount for selected services</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-white">
                  ${calculateTotal()}
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleSave} className="bg-gradient-hero">
              <Save className="h-4 w-4 mr-2" />
              Save Estimate
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <FileText className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </div>
      </main>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your notes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNotes} className="bg-destructive">
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceChecklist;
