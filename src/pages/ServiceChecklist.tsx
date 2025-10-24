import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Save, FileText, Info } from "lucide-react";
import { addEstimate, getCustomers } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Service {
  id: string;
  name: string;
  prices: { [key: string]: number };
  description: string;
  chemicals: string[];
}

interface Customer {
  id?: string;
  name: string;
  vehicleType: string;
}

const coreServices: Service[] = [
  {
    id: "basic-wash",
    name: "Basic Exterior Wash",
    prices: { "Compact/Sedan": 40, "Mid-Size/SUV": 50, "Truck/Van/Large SUV": 60, "Luxury/High-End": 75 },
    description: "Pre-rinse, foam cannon, two-bucket wash, drying",
    chemicals: ["Meguiar's Foam Soap", "Chemical Guys Tire Dressing"]
  },
  {
    id: "express-wash-wax",
    name: "Express Wash & Wax",
    prices: { "Compact/Sedan": 60, "Mid-Size/SUV": 75, "Truck/Van/Large SUV": 90, "Luxury/High-End": 110 },
    description: "Quick exterior wash with spray wax (30-45 min)",
    chemicals: ["Meguiar's Foam Soap", "Turtle Wax Spray Wax"]
  },
  {
    id: "full-exterior",
    name: "Full Exterior Detail",
    prices: { "Compact/Sedan": 120, "Mid-Size/SUV": 150, "Truck/Van/Large SUV": 180, "Luxury/High-End": 210 },
    description: "Basic wash + clay bar, iron remover, sealant/wax, tire dressing",
    chemicals: ["Meguiar's Foam Soap", "Mothers Clay Lube", "3M Sealant", "Chemical Guys Tire Dressing"]
  },
  {
    id: "interior-cleaning",
    name: "Interior Cleaning",
    prices: { "Compact/Sedan": 80, "Mid-Size/SUV": 100, "Truck/Van/Large SUV": 120, "Luxury/High-End": 150 },
    description: "Vacuum, APC cleaning, glass cleaning, UV protectant",
    chemicals: ["APC Cleaner", "Glass Cleaner", "UV Protectant Spray"]
  },
  {
    id: "full-detail",
    name: "Full Detail (Interior + Exterior)",
    prices: { "Compact/Sedan": 180, "Mid-Size/SUV": 225, "Truck/Van/Large SUV": 270, "Luxury/High-End": 320 },
    description: "Combines Full Exterior + Interior",
    chemicals: ["Meguiar's Foam Soap", "Mothers Clay Lube", "3M Sealant", "Chemical Guys Tire Dressing", "APC Cleaner", "Glass Cleaner", "UV Protectant Spray"]
  },
  {
    id: "premium-detail",
    name: "Premium Detail",
    prices: { "Compact/Sedan": 280, "Mid-Size/SUV": 350, "Truck/Van/Large SUV": 420, "Luxury/High-End": 500 },
    description: "Full Detail + paint correction, ceramic spray",
    chemicals: ["Meguiar's Foam Soap", "Mothers Clay Lube", "3M Sealant", "Chemical Guys Tire Dressing", "APC Cleaner", "Glass Cleaner", "UV Protectant Spray", "Griot's Polishing Compound", "Ceramic Pro Spray"]
  }
];

const addOnServices: Service[] = [
  {
    id: "wheel-cleaning",
    name: "Wheel Cleaning",
    prices: { "Compact/Sedan": 20, "Mid-Size/SUV": 25, "Truck/Van/Large SUV": 30, "Luxury/High-End": 40 },
    description: "Deep wheel and barrel cleaning",
    chemicals: ["P21S Wheel Cleaner"]
  },
  {
    id: "leather-conditioning",
    name: "Leather Conditioning",
    prices: { "Compact/Sedan": 25, "Mid-Size/SUV": 30, "Truck/Van/Large SUV": 35, "Luxury/High-End": 45 },
    description: "Clean and condition leather surfaces",
    chemicals: ["Lexol Leather Conditioner"]
  },
  {
    id: "odor-eliminator",
    name: "Odor Eliminator",
    prices: { "Compact/Sedan": 15, "Mid-Size/SUV": 20, "Truck/Van/Large SUV": 25, "Luxury/High-End": 35 },
    description: "Eliminate unwanted odors",
    chemicals: ["Ozium Odor Eliminator"]
  },
  {
    id: "headlight-restoration",
    name: "Headlight Restoration",
    prices: { "Compact/Sedan": 35, "Mid-Size/SUV": 40, "Truck/Van/Large SUV": 50, "Luxury/High-End": 65 },
    description: "Restore clarity to headlights",
    chemicals: ["3M Polishing Compound", "Meguiar's UV Sealant"]
  },
  {
    id: "ceramic-trim",
    name: "Ceramic Trim Coat Restoration",
    prices: { "Compact/Sedan": 60, "Mid-Size/SUV": 75, "Truck/Van/Large SUV": 95, "Luxury/High-End": 125 },
    description: "Restores faded black plastic trim with ceramic coating",
    chemicals: ["Cerakote Trim Coat"]
  },
  {
    id: "engine-bay",
    name: "Engine Bay Cleaning",
    prices: { "Compact/Sedan": 70, "Mid-Size/SUV": 85, "Truck/Van/Large SUV": 100, "Luxury/High-End": 120 },
    description: "Degreases and dresses engine compartment, low-water method",
    chemicals: ["Simple Green Degreaser", "Chemical Guys Dressing"]
  },
  {
    id: "wheel-rim-detail",
    name: "Wheel & Rim Detailing",
    prices: { "Compact/Sedan": 50, "Mid-Size/SUV": 60, "Truck/Van/Large SUV": 75, "Luxury/High-End": 90 },
    description: "Removes brake dust, polishes alloys, applies sealant",
    chemicals: ["P21S Wheel Cleaner", "Meguiar's Sealant"]
  },
  {
    id: "clay-bar",
    name: "Clay Bar Decontamination",
    prices: { "Compact/Sedan": 65, "Mid-Size/SUV": 80, "Truck/Van/Large SUV": 95, "Luxury/High-End": 120 },
    description: "Removes embedded contaminants from paint",
    chemicals: ["Mothers Clay Lube"]
  },
  {
    id: "paint-sealant",
    name: "Paint Sealant Application",
    prices: { "Compact/Sedan": 90, "Mid-Size/SUV": 110, "Truck/Van/Large SUV": 130, "Luxury/High-End": 160 },
    description: "Synthetic sealant for 3-6 months protection",
    chemicals: ["3M Sealant"]
  },
  {
    id: "pet-hair",
    name: "Pet Hair Removal",
    prices: { "Compact/Sedan": 55, "Mid-Size/SUV": 70, "Truck/Van/Large SUV": 85, "Luxury/High-End": 100 },
    description: "Deep vacuuming and enzyme treatment for pet dander/hair",
    chemicals: ["Enzyme Pet Cleaner"]
  },
  {
    id: "paint-touchup",
    name: "Minor Paint Touch-Up",
    prices: { "Compact/Sedan": 75, "Mid-Size/SUV": 90, "Truck/Van/Large SUV": 110, "Luxury/High-End": 140 },
    description: "Buffs light scratches/swirls, applies touch-up paint",
    chemicals: ["Griot's Polishing Compound", "Dupli-Color Touch-Up Paint"]
  },
  {
    id: "destination-fee",
    name: "Destination Fee",
    prices: { "Compact/Sedan": 0, "Mid-Size/SUV": 0, "Truck/Van/Large SUV": 0, "Luxury/High-End": 0 },
    description: "Transportation fee (0-5 mi: Free, 6-10 mi: $10, 11-20 mi: $15-25, 21-30 mi: $30-45, 31-50 mi: $50-75, 50+ mi: Custom)",
    chemicals: []
  }
];

const ServiceChecklist = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [vehicleType, setVehicleType] = useState("Mid-Size/SUV");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [addOnsExpanded, setAddOnsExpanded] = useState(false);
  const [discountType, setDiscountType] = useState<"percent" | "dollar">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [destinationFee, setDestinationFee] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    (async () => {
      const list = await getCustomers();
      setCustomers(list as Customer[]);
    })();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      const customer = customers.find(c => c.id === selectedCustomer);
      if (customer?.vehicleType) {
        setVehicleType(customer.vehicleType);
      }
    }
  }, [selectedCustomer, customers]);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const calculateSubtotal = () => {
    const allServices = [...coreServices, ...addOnServices];
    return selectedServices.reduce((sum, id) => {
      const service = allServices.find(s => s.id === id);
      return sum + (service?.prices[vehicleType] || 0);
    }, 0) + destinationFee;
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (!discountValue) return 0;
    const value = parseFloat(discountValue);
    if (discountType === "percent") {
      return (subtotal * value) / 100;
    }
    return value;
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - calculateDiscount());
  };

  const handleSave = async () => {
    const customer = customers.find(c => c.id === selectedCustomer);
    const allServices = [...coreServices, ...addOnServices];
    const selectedItems = selectedServices.map(id => {
      const service = allServices.find(s => s.id === id);
      return {
        name: service?.name || "",
        price: service?.prices[vehicleType] || 0,
        chemicals: service?.chemicals || []
      };
    });

    await addEstimate({
      customerName: customer?.name || "Unknown",
      customerId: selectedCustomer,
      vehicleType,
      items: selectedItems,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      total: calculateTotal(),
      notes,
      date: new Date().toISOString(),
    });

    toast({ title: "Estimate Saved", description: "Service checklist saved to local storage." });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const customer = customers.find(c => c.id === selectedCustomer);
    
    doc.setFontSize(18);
    doc.text("Prime Detail Solutions - Service Estimate", 20, 20);
    doc.setFontSize(12);
    doc.text(`Customer: ${customer?.name || "N/A"}`, 20, 35);
    doc.text(`Vehicle Type: ${vehicleType}`, 20, 42);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 49);

    let y = 60;
    doc.setFontSize(14);
    doc.text("Selected Services:", 20, y);
    y += 8;
    
    const allServices = [...coreServices, ...addOnServices];
    selectedServices.forEach(id => {
      const service = allServices.find(s => s.id === id);
      if (service) {
        doc.setFontSize(11);
        doc.text(`${service.name}: $${service.prices[vehicleType]}`, 25, y);
        y += 6;
      }
    });

    if (destinationFee > 0) {
      doc.text(`Destination Fee: $${destinationFee}`, 25, y);
      y += 6;
    }

    y += 5;
    doc.setFontSize(12);
    doc.text(`Subtotal: $${calculateSubtotal().toFixed(2)}`, 20, y);
    y += 7;
    if (calculateDiscount() > 0) {
      doc.text(`Discount: -$${calculateDiscount().toFixed(2)}`, 20, y);
      y += 7;
    }
    doc.setFontSize(14);
    doc.text(`Total: $${calculateTotal().toFixed(2)}`, 20, y);

    if (notes) {
      y += 12;
      doc.setFontSize(12);
      doc.text("Notes:", 20, y);
      y += 6;
      doc.setFontSize(10);
      const splitNotes = doc.splitTextToSize(notes, 170);
      doc.text(splitNotes, 20, y);
    }

    doc.save(`service-estimate-${new Date().getTime()}.pdf`);
    toast({ title: "PDF Generated", description: "Service estimate has been downloaded." });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Service Checklist" />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6 animate-fade-in">
          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Customer & Vehicle Info</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Select Customer</Label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Vehicle Type</Label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Compact/Sedan">Compact/Sedan</option>
                  <option value="Mid-Size/SUV">Mid-Size/SUV</option>
                  <option value="Truck/Van/Large SUV">Truck/Van/Large SUV</option>
                  <option value="Luxury/High-End">Luxury/High-End</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Core Services */}
          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Core Services</h2>
            <div className="space-y-3">
              {coreServices.map(service => (
                <TooltipProvider key={service.id}>
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium text-base cursor-pointer">
                          {service.name}
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-semibold">Chemicals:</p>
                            <ul className="text-xs">
                              {service.chemicals.map((chem, i) => (
                                <li key={i}>• {chem}</li>
                              ))}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                    <span className="font-bold text-primary">${service.prices[vehicleType]}</span>
                  </div>
                </TooltipProvider>
              ))}
            </div>
          </Card>

          {/* Add-Ons */}
          <Card className="p-6 bg-gradient-card border-border">
            <button
              onClick={() => setAddOnsExpanded(!addOnsExpanded)}
              className="w-full flex items-center justify-between text-2xl font-bold text-foreground mb-4"
            >
              <span>Add-On Services</span>
              {addOnsExpanded ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {addOnsExpanded && (
              <div className="space-y-3">
                {addOnServices.map(service => (
                  <TooltipProvider key={service.id}>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium text-base cursor-pointer">
                            {service.name}
                          </Label>
                          {service.chemicals.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-semibold">Chemicals:</p>
                                <ul className="text-xs">
                                  {service.chemicals.map((chem, i) => (
                                    <li key={i}>• {chem}</li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <span className="font-bold text-primary">
                        {service.id === "destination-fee" ? "Varies" : `$${service.prices[vehicleType]}`}
                      </span>
                    </div>
                  </TooltipProvider>
                ))}
                
                {selectedServices.includes("destination-fee") && (
                  <div className="ml-8 mt-2">
                    <Label>Enter Destination Fee</Label>
                    <Input
                      type="number"
                      placeholder="Enter fee amount"
                      value={destinationFee || ""}
                      onChange={(e) => setDestinationFee(parseFloat(e.target.value) || 0)}
                      className="max-w-xs"
                    />
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Discount & Total */}
          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Discount & Total</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>Discount Type</Label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "percent" | "dollar")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="dollar">Dollar Amount ($)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <Label>Discount Value</Label>
                  <Input
                    type="number"
                    placeholder={discountType === "percent" ? "e.g., 10" : "e.g., 20"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 text-lg">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">${calculateSubtotal().toFixed(2)}</span>
                </div>
                {calculateDiscount() > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Discount:</span>
                    <span className="font-bold">-${calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl border-t pt-2">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-primary">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-6 bg-gradient-card border-border">
            <Label>Additional Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions or notes..."
              className="mt-2 min-h-[100px]"
            />
          </Card>

          {/* Actions */}
          <div className="flex gap-4 flex-wrap">
            <Button onClick={handleSave} className="bg-gradient-hero">
              <Save className="h-4 w-4 mr-2" />
              Save Estimate
            </Button>
            <Button onClick={generatePDF} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceChecklist;
