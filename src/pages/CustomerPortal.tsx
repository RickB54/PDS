import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { servicePackages, addOns, VehicleType, getServicePrice, getAddOnPrice, calculateDestinationFee } from "@/lib/services";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

const CustomerPortal = () => {
  const [vehicleType, setVehicleType] = useState<VehicleType>('compact');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [distance, setDistance] = useState(0);
  const [addOnsExpanded, setAddOnsExpanded] = useState(false);
  const [learnMorePackage, setLearnMorePackage] = useState<typeof servicePackages[0] | null>(null);

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
      <div className="bg-gradient-hero py-8 mb-8">
        <h1 className="text-4xl font-bold text-white text-center">Premium Auto Detailing Services</h1>
      </div>
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Vehicle Type Selector - Centered */}
        <div className="flex justify-center mb-12">
          <div className="w-full max-w-md">
            <Label className="text-center block mb-3 text-lg font-semibold text-foreground">
              Select Your Vehicle Type
            </Label>
            <Select value={vehicleType} onValueChange={(v) => setVehicleType(v as VehicleType)}>
              <SelectTrigger className="w-full h-12 text-base bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="compact">Compact / Sedan</SelectItem>
                <SelectItem value="midsize">Midsize SUV</SelectItem>
                <SelectItem value="truck">Truck / Large SUV</SelectItem>
                <SelectItem value="luxury">Luxury Vehicle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Premium 6-Box Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {servicePackages.map((pkg, index) => {
            const isSelected = selectedService === pkg.id;
            const isBestValue = pkg.name.includes("BEST VALUE");
            
            return (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 group
                  ${isSelected 
                    ? 'border-primary ring-4 ring-primary/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]' 
                    : 'border-border hover:border-primary/50 shadow-card'
                  }
                  ${isBestValue ? 'border-primary/70' : ''}
                `}
                style={{
                  background: 'linear-gradient(180deg, hsl(0, 0%, 8%) 0%, hsl(0, 0%, 5%) 100%)',
                }}
                onClick={() => setSelectedService(pkg.id)}
              >
                {isBestValue && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-hero py-1 text-center">
                    <span className="text-xs font-bold text-white tracking-wider">★ BEST VALUE ★</span>
                  </div>
                )}
                
                <div className={`p-6 space-y-5 ${isBestValue ? 'pt-8' : ''}`}>
                  {/* Service Name & Check */}
                  <div className="flex items-start justify-between min-h-[60px]">
                    <h3 className="text-xl font-bold text-foreground leading-tight pr-2">
                      {pkg.name.replace(' (BEST VALUE)', '')}
                    </h3>
                    {isSelected && (
                      <div className="bg-primary rounded-full p-1 flex-shrink-0">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm min-h-[40px] leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Dynamic Price */}
                  <div className="py-3">
                    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      ${pkg.pricing[vehicleType]}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      For {vehicleType === 'compact' ? 'Compact/Sedan' : vehicleType === 'midsize' ? 'Midsize SUV' : vehicleType === 'truck' ? 'Truck/Large SUV' : 'Luxury Vehicle'}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <Button
                      className={`flex-1 h-12 font-semibold transition-all duration-300 
                        ${isSelected 
                          ? 'bg-gradient-hero text-white shadow-glow' 
                          : 'bg-secondary text-secondary-foreground hover:bg-gradient-hero hover:text-white'
                        }`}
                    >
                      {isSelected ? '✓ Selected' : 'Select'}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLearnMorePackage(pkg);
                      }}
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Add-Ons - Collapsible Dropdown */}
        <Card className="mb-12 bg-gradient-card border-border">
          <button
            onClick={() => setAddOnsExpanded(!addOnsExpanded)}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-muted/10 transition-colors"
          >
            <h2 className="text-2xl font-bold text-foreground">Add-On Services</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedAddOns.length > 0 && `${selectedAddOns.length} selected`}
              </span>
              {addOnsExpanded ? (
                <ChevronUp className="h-6 w-6 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
          </button>
          
          {addOnsExpanded && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addOns.map((addon) => {
                  const isSelected = selectedAddOns.includes(addon.id);
                  return (
                    <Card
                      key={addon.id}
                      className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg
                        ${isSelected ? 'border-primary ring-2 ring-primary/50 bg-primary/5' : 'border-border hover:border-primary/30'}
                      `}
                      onClick={() => toggleAddOn(addon.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground text-sm mb-1">{addon.name}</h4>
                          <p className="text-primary font-bold text-lg">${addon.pricing[vehicleType]}</p>
                        </div>
                        {isSelected && (
                          <div className="bg-primary rounded-full p-1">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Destination Fee Input */}
        <Card className="mb-12 p-6 bg-gradient-card border-border">
          <Label className="text-lg font-semibold text-foreground mb-3 block">
            Distance to Your Location (miles)
          </Label>
          <Input
            type="number"
            min="0"
            value={distance}
            onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
            placeholder="Enter distance in miles"
            className="w-full max-w-xs bg-background border-border"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {distance <= 5 && "Free within 5 miles"}
            {distance > 5 && distance <= 10 && `$10 destination fee (6-10 miles)`}
            {distance > 10 && distance <= 20 && `$${destinationFee} destination fee (11-20 miles)`}
            {distance > 20 && distance <= 30 && `$${destinationFee} destination fee (21-30 miles)`}
            {distance > 30 && distance <= 50 && `$${destinationFee} destination fee (31-50 miles)`}
            {distance > 50 && `$75 destination fee (50+ miles)`}
          </p>
        </Card>

        {/* Order Summary */}
        {selectedService && (
          <Card className="p-8 max-w-lg mx-auto bg-gradient-card border-border shadow-card">
            <h3 className="text-2xl font-bold mb-6 text-foreground text-center">
              [ ORDER SUMMARY ]
            </h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-start py-2 border-b border-border">
                <span className="text-foreground font-medium">Service:</span>
                <span className="text-right">
                  <div className="font-semibold text-foreground">{service?.name.replace(' (BEST VALUE)', '')}</div>
                  <div className="text-primary font-bold">${servicePrice}</div>
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-foreground font-medium">Vehicle:</span>
                <span className="text-foreground capitalize">{vehicleType === 'compact' ? 'Compact/Sedan' : vehicleType === 'midsize' ? 'Midsize SUV' : vehicleType === 'truck' ? 'Truck/Large SUV' : 'Luxury Vehicle'}</span>
              </div>

              {selectedAddOns.length > 0 && (
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-foreground font-medium">Add-Ons:</span>
                  <span className="text-primary font-bold">${addOnsTotal}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-foreground font-medium">
                  Destination: <span className="text-muted-foreground text-sm">{distance} mi</span>
                </span>
                <span className="text-primary font-bold">${destinationFee}</span>
              </div>

              <div className="border-t-2 border-primary pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-foreground">TOTAL</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ${total}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button className="w-full h-12 bg-gradient-hero text-white font-semibold text-lg shadow-glow hover:shadow-[0_0_40px_rgba(220,38,38,0.4)]">
                BOOK NOW → GET ESTIMATE
              </Button>
              <Button variant="outline" className="w-full h-12 border-primary text-primary hover:bg-primary/10">
                VIEW MY OFFERS
              </Button>
            </div>
          </Card>
        )}

        {/* Service & Pricing Disclaimer */}
        <Card className="mt-12 p-6 border-destructive bg-destructive/10">
          <h3 className="font-bold text-lg mb-3 text-foreground flex items-center gap-2">
            ⚠️ Service & Pricing Disclaimer
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Paint Protection & Ceramic Coating</strong> NOT included. Available only in Premium packages or add-ons.</p>
            <p>• We do <strong>NOT</strong> offer: → Biological Cleanup → Emergency Services</p>
            <p>• We focus on <strong>premium cosmetic and protective detailing</strong>.</p>
            <p className="font-semibold mt-4 text-foreground border-t border-border pt-3">
              Important: Final price may vary based on vehicle condition, size, or additional work required. 
              All quotes are estimates until vehicle is inspected.
            </p>
          </div>
          <Button variant="destructive" className="mt-4 w-full bg-destructive hover:bg-destructive/90">
            Got it
          </Button>
        </Card>
      </main>

      {/* Learn More Dialog */}
      <Dialog open={!!learnMorePackage} onOpenChange={() => setLearnMorePackage(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{learnMorePackage?.name.replace(' (BEST VALUE)', '')}</DialogTitle>
            <DialogDescription>
              ${learnMorePackage ? getServicePrice(learnMorePackage.id, vehicleType) : 0}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-foreground">Why Choose This Package?</h4>
              <p className="text-muted-foreground">{learnMorePackage?.description}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 text-foreground">What's Included:</h4>
              <ul className="space-y-2">
                {learnMorePackage?.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-muted-foreground">{typeof step === 'string' ? step : step.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                className="flex-1 bg-gradient-hero"
                onClick={() => {
                  if (learnMorePackage) {
                    setSelectedService(learnMorePackage.id);
                  }
                  setLearnMorePackage(null);
                }}
              >
                Add to Cart
              </Button>
              <Button variant="outline" onClick={() => setLearnMorePackage(null)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerPortal;
