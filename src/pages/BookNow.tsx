import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { savePDFToArchive } from "@/lib/pdfArchive";
import jsPDF from "jspdf";

const BookNow = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    make: "",
    model: "",
    year: "",
    datetime: "",
    package: "",
    message: ""
  });
  
  const [addOns, setAddOns] = useState<string[]>([]);

  const packages = [
    "Basic Exterior Wash - $50-$90",
    "Interior Only - $80-$120",
    "Exterior Only - $100-$150",
    "Express Detail - $150-$200",
    "Full Detail - $200-$300",
    "Premium Detail - $300-$450"
  ];

  const availableAddOns = [
    "Engine Bay Cleaning - $30-$50",
    "Headlight Restoration - $40-$60",
    "Pet Hair Removal - $25-$40",
    "Clay Bar Treatment - $50-$75",
    "Ceramic Coating - $150-$300"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-create customer account
    const autoPassword = `PDS${Math.random().toString(36).slice(2, 10)}`;
    console.log(`Customer account created: ${formData.email} / ${autoPassword}`);
    console.log(`Portal link: ${window.location.origin}/portal?token=auto-${Date.now()}`);

    // Create PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Prime Detail Solutions", 20, 20);
    doc.setFontSize(12);
    doc.text("NEW BOOKING REQUEST", 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
    doc.text("", 20, 50);
    doc.text(`Customer: ${formData.name}`, 20, 60);
    doc.text(`Email: ${formData.email}`, 20, 70);
    doc.text(`Phone: ${formData.phone}`, 20, 80);
    doc.text(`Vehicle: ${formData.year} ${formData.make} ${formData.model}`, 20, 90);
    doc.text(`Preferred Date/Time: ${formData.datetime}`, 20, 100);
    doc.text(`Package: ${formData.package}`, 20, 110);
    
    if (addOns.length > 0) {
      doc.text("Add-ons:", 20, 120);
      addOns.forEach((addon, idx) => {
        doc.text(`  - ${addon}`, 20, 130 + (idx * 10));
      });
    }
    
    if (formData.message) {
      doc.text("Message:", 20, 150);
      const splitMessage = doc.splitTextToSize(formData.message, 170);
      doc.text(splitMessage, 20, 160);
    }

    const pdfData = doc.output('dataurlstring');
    savePDFToArchive("Estimate", formData.name, `BOOKING_${Date.now()}`, pdfData);

    // Send email (simulated)
    console.log("Email sent to: primedetailsolutions.ma.nh@gmail.com");
    console.log("Subject: New Booking:", formData.name, "-", formData.package);
    console.log("Booking data:", { ...formData, addOns });

    toast({
      title: "Booking Received!",
      description: "We'll send confirmation within 24 hours.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      make: "",
      model: "",
      year: "",
      datetime: "",
      package: "",
      message: ""
    });
    setAddOns([]);

    setTimeout(() => navigate("/"), 2000);
  };

  const toggleAddOn = (addon: string) => {
    setAddOns(prev => 
      prev.includes(addon) ? prev.filter(a => a !== addon) : [...prev, addon]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Link>
        </Button>

        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-4">
            <Calendar className="h-16 w-16 mx-auto text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Book Your Detail</h1>
            <p className="text-muted-foreground text-lg">Fill out the form below to request an appointment</p>
          </div>

          <Card className="p-8 bg-gradient-card border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="make">Vehicle Make *</Label>
                  <Input
                    id="make"
                    placeholder="e.g., Toyota"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Vehicle Model *</Label>
                  <Input
                    id="model"
                    placeholder="e.g., Camry"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    placeholder="e.g., 2020"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="datetime">Preferred Date/Time (Optional)</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={formData.datetime}
                  onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="package">Package *</Label>
                <Select value={formData.package} onValueChange={(val) => setFormData({ ...formData, package: val })}>
                  <SelectTrigger id="package">
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Add-Ons (Optional)</Label>
                <div className="space-y-2 p-4 border border-border rounded-md">
                  {availableAddOns.map((addon) => (
                    <div key={addon} className="flex items-center space-x-2">
                      <Checkbox
                        id={addon}
                        checked={addOns.includes(addon)}
                        onCheckedChange={() => toggleAddOn(addon)}
                      />
                      <label htmlFor={addon} className="text-sm cursor-pointer">
                        {addon}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Additional Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Any special requests or questions?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-hero text-lg py-6">
                Submit Booking Request
              </Button>
            </form>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            By submitting this form, you agree to be contacted by Prime Detail Solutions regarding your booking.
          </p>
        </div>
      </main>
    </div>
  );
};

export default BookNow;
