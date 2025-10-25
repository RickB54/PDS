import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClipboardCheck, Search, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/pds-final-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              Welcome To
            </h2>
            <img 
              src={logo} 
              alt="Prime Detail Solutions Logo" 
              className="w-[144px] mx-auto drop-shadow-glow"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12">
            <Link to="/checklist" className="group">
              <Card className="p-6 hover:shadow-glow transition-all duration-300 bg-gradient-card border-border h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-primary/20 rounded-full group-hover:bg-primary/30 transition-colors">
                    <ClipboardCheck className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Service Checklist</h3>
                  <p className="text-muted-foreground">
                    Create estimates with real-time pricing
                  </p>
                </div>
              </Card>
            </Link>

            <Link to="/customers" className="group">
              <Card className="p-6 hover:shadow-glow transition-all duration-300 bg-gradient-card border-border h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-primary/20 rounded-full group-hover:bg-primary/30 transition-colors">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Search Customer</h3>
                  <p className="text-muted-foreground">
                    Find and manage customer records
                  </p>
                </div>
              </Card>
            </Link>

            <Link to="/training" className="group">
              <Card className="p-6 hover:shadow-glow transition-all duration-300 bg-gradient-card border-border h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-primary/20 rounded-full group-hover:bg-primary/30 transition-colors">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Training Manual</h3>
                  <p className="text-muted-foreground">
                    Complete detailing reference guide
                  </p>
                </div>
              </Card>
            </Link>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link to="/checklist">
              <Button size="lg" className="bg-gradient-hero hover:opacity-90">
                Start New Estimate
              </Button>
            </Link>
            <Link to="/customers">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                View Customers
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
