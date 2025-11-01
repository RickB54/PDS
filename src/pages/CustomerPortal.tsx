import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { servicePackages, addOns, VehicleType, getServicePrice, getAddOnPrice, calculateDestinationFee } from "@/lib/services";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const CustomerPortal = () => {
  const [vehicleType, setVehicleType] = useState<VehicleType>('compact');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [distance, setDistance] = useState(0);

  const service = servicePackages.find(s => s.id === selectedService);
  const servicePrice = service ? getServicePrice(service.id, vehicleType) : 0;
  const addOnsTotal = selectedAddOns.reduce((sum, id) => sum + getAddOnPrice(id, vehicleType), 0);
  const destinationFee = calculateDestinationFee(distance);
  const total = servicePrice + addOnsTotal + destinationFee;

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Book Your Service" />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Vehicle Type Selector */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-sm">
            <label className="block text-sm font-medium mb-2 text-center">Select Vehicle Type</label>
            <Select value={vehicleType} onValueChange={(v) => setVehicleType(v as VehicleType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact / Sedan</SelectItem>
                <SelectItem value="midsize">Midsize SUV</SelectItem>
                <SelectItem value="truck">Truck / Large SUV</SelectItem>
                <SelectItem value="luxury">Luxury Vehicle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Service Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {servicePackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                selectedService === pkg.id ? 'border-primary ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedService(pkg.id)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-bold text-foreground">{pkg.name}</h3>
                  {selectedService === pkg.id && (
                    <Check className="h-6 w-6 text-primary" />
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{pkg.description}</p>
                <div className="text-3xl font-bold text-primary">
                  ${pkg.pricing[vehicleType]}
                </div>
                <Button
                  className="w-full"
                  variant={selectedService === pkg.id ? "default" : "outline"}
                >
                  {selectedService === pkg.id ? 'Selected' : 'Select Service'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Add-Ons */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Add-On Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addOns.map((addon) => (
              <Card
                key={addon.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedAddOns.includes(addon.id) ? 'border-primary ring-2 ring-primary' : ''
                }`}
                onClick={() => toggleAddOn(addon.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{addon.name}</h4>
                    <p className="text-primary font-bold">${addon.pricing[vehicleType]}</p>
                  </div>
                  {selectedAddOns.includes(addon.id) && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        {selectedService && (
          <Card className="p-6 max-w-md mx-auto bg-muted/50">
            <h3 className="text-xl font-bold mb-4 text-foreground">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Service: {service?.name}</span>
                <span>${servicePrice}</span>
              </div>
              {selectedAddOns.length > 0 && (
                <div className="flex justify-between">
                  <span>Add-Ons</span>
                  <span>${addOnsTotal}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Destination Fee</span>
                <span>${destinationFee}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>TOTAL</span>
                  <span className="text-primary">${total}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <Button className="w-full" size="lg">
                Book Now → Get Estimate
              </Button>
              <Button variant="outline" className="w-full">
                View My Offers
              </Button>
            </div>
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="mt-8 p-6 border-destructive bg-destructive/5">
          <h3 className="font-bold text-lg mb-3 text-foreground">Service & Pricing Disclaimer</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Paint Protection & Ceramic Coating NOT included. Available only in Premium packages or add-ons.</p>
            <p>• We do NOT offer: → Biological Cleanup → Emergency Services</p>
            <p>• We focus on premium cosmetic and protective detailing.</p>
            <p className="font-semibold mt-3 text-foreground">
              Important: Final price may vary based on vehicle condition, size, or additional work required. 
              All quotes are estimates until vehicle is inspected.
            </p>
          </div>
          <Button variant="destructive" className="mt-4 w-full">Got it</Button>
        </Card>
      </main>
    </div>
  );
};

export default CustomerPortal;
