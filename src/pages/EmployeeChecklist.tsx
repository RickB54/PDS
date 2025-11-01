import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { servicePackages, addOns, VehicleType } from "@/lib/services";
import { Mail } from "lucide-react";
import { toast } from "sonner";

interface ChecklistStep {
  id: string;
  name: string;
  category: string;
  checked: boolean;
  time: number; // seconds
}

const EmployeeChecklist = () => {
  const [currentJob, setCurrentJob] = useState<any>(null);
  const [steps, setSteps] = useState<ChecklistStep[]>([]);
  const [vehicleType, setVehicleType] = useState<VehicleType>('compact');
  const [selectedService, setSelectedService] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [customer, setCustomer] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (selectedService) {
      const service = servicePackages.find(s => s.id === selectedService);
      if (service) {
        const serviceSteps = service.steps.map(s => ({
          ...s,
          checked: false,
          time: 0
        }));
        
        // Add add-on steps
        const addOnSteps: ChecklistStep[] = selectedAddOns.map(id => ({
          id,
          name: addOns.find(a => a.id === id)?.name || id,
          category: 'exterior',
          checked: false,
          time: 0
        }));

        setSteps([...serviceSteps, ...addOnSteps]);
      }
    }
  }, [selectedService, selectedAddOns]);

  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.checked).length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const toggleStep = (id: string) => {
    setSteps(prev => prev.map(s => 
      s.id === id ? { ...s, checked: !s.checked } : s
    ));
  };

  const handleStartJob = () => {
    if (!selectedService || !customer || !vehicle) {
      toast.error("Please fill in all job details");
      return;
    }
    setIsRunning(true);
    toast.success("Job started!");
  };

  const handleFinishJob = () => {
    // Save job data
    const jobData = {
      jobId: `JOB-${Date.now()}`,
      employee: 'employee@primedetail.com',
      customer,
      vehicle,
      vehicleType,
      service: servicePackages.find(s => s.id === selectedService)?.name,
      addOns: selectedAddOns.map(id => addOns.find(a => a.id === id)?.name),
      steps: steps.map(s => ({ name: s.name, checked: s.checked, time: s.time })),
      completedSteps,
      totalSteps,
      finishedAt: new Date().toISOString()
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('completedJobs') || '[]');
    localStorage.setItem('completedJobs', JSON.stringify([...existing, jobData]));

    // Email functionality would go here
    toast.success("Job completed and saved!");
    
    // Reset
    setSelectedService('');
    setSelectedAddOns([]);
    setSteps([]);
    setCustomer('');
    setVehicle('');
    setIsRunning(false);
  };

  const exteriorSteps = steps.filter(s => s.category === 'exterior');
  const interiorSteps = steps.filter(s => s.category === 'interior');
  const finalSteps = steps.filter(s => s.category === 'final');

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Service Checklist" />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {!isRunning ? (
          <Card className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">Start New Job</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="Customer name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  placeholder="e.g., Tesla Model 3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Type</label>
                <Select value={vehicleType} onValueChange={(v) => setVehicleType(v as VehicleType)}>
                  <SelectTrigger>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Service Package</label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicePackages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} - ${pkg.pricing[vehicleType]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleStartJob} size="lg" className="w-full">
              Start Job
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Current Job: {vehicle} - {servicePackages.find(s => s.id === selectedService)?.name}</h2>
                  <p className="text-muted-foreground">Progress: {completedSteps}/{totalSteps} Complete</p>
                </div>
                <Button onClick={handleFinishJob} variant="default" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Email Progress
                </Button>
              </div>
              <Progress value={progress} className="h-3" />
            </Card>

            {exteriorSteps.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 text-red-500">Exterior</h3>
                <div className="space-y-3">
                  {exteriorSteps.map(step => (
                    <div key={step.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                      <Checkbox
                        checked={step.checked}
                        onCheckedChange={() => toggleStep(step.id)}
                      />
                      <span className={step.checked ? 'line-through text-muted-foreground' : ''}>
                        {step.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {interiorSteps.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 text-red-500">Interior</h3>
                <div className="space-y-3">
                  {interiorSteps.map(step => (
                    <div key={step.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                      <Checkbox
                        checked={step.checked}
                        onCheckedChange={() => toggleStep(step.id)}
                      />
                      <span className={step.checked ? 'line-through text-muted-foreground' : ''}>
                        {step.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {finalSteps.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 text-red-500">Final</h3>
                <div className="space-y-3">
                  {finalSteps.map(step => (
                    <div key={step.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                      <Checkbox
                        checked={step.checked}
                        onCheckedChange={() => toggleStep(step.id)}
                      />
                      <span className={step.checked ? 'line-through text-muted-foreground' : ''}>
                        {step.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Button onClick={handleFinishJob} size="lg" className="w-full">
              Finish Job
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeChecklist;
