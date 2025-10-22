import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";

const Invoicing = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Invoicing" />
      <main className="container mx-auto px-4 py-6">
        <Card className="p-8 bg-gradient-card border-border text-center animate-fade-in">
          <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Invoice Generation</h2>
          <p className="text-muted-foreground mb-6">
            Create and manage professional invoices for your services
          </p>
          <Button className="bg-gradient-hero">
            <Printer className="h-4 w-4 mr-2" />
            Create New Invoice
          </Button>
        </Card>
      </main>
    </div>
  );
};

export default Invoicing;
