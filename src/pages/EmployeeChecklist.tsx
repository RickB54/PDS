import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { servicePackages, addOns, VehicleType } from "@/lib/services";
import { Mail, Clock, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { savePDFToArchive } from "@/lib/pdfArchive";

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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

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

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartJob = () => {
    if (!selectedService || !customer || !vehicle) {
      toast.error("Please fill in all job details");
      return;
    }
    setIsRunning(true);
    setElapsedSeconds(0);
    setIsPaused(false);
    toast.success("Job started! Timer running...");
  };

  const handleSaveProgress = () => {
    setIsPaused(true);
    const progressData = {
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
      elapsedTime: formatTime(elapsedSeconds),
      savedAt: new Date().toISOString(),
      status: 'paused'
    };
    
    const existing = JSON.parse(localStorage.getItem('pausedJobs') || '[]');
    localStorage.setItem('pausedJobs', JSON.stringify([...existing, progressData]));
    
    toast.success("Progress saved! You can resume later.");
  };

  const handleEmailProgress = () => {
    // Email progress WITHOUT stopping the job
    const progressData = {
      customer,
      vehicle,
      service: servicePackages.find(s => s.id === selectedService)?.name,
      completedSteps,
      totalSteps,
      progress: progress.toFixed(1),
      elapsedTime: formatTime(elapsedSeconds)
    };
    
    const emailBody = `
Job Progress Update

Customer: ${progressData.customer}
Vehicle: ${progressData.vehicle}
Service: ${progressData.service}
Progress: ${progressData.completedSteps}/${progressData.totalSteps} (${progressData.progress}%)
Time Elapsed: ${progressData.elapsedTime}

Job is still in progress.
    `;
    
    // Open email client
    window.location.href = `mailto:primedetailsolutions.ma.nh@gmail.com?subject=Job Progress - ${progressData.customer}&body=${encodeURIComponent(emailBody)}`;
    
    toast.success("Progress email prepared - job continues running!");
  };

  const handleFinishJob = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const totalTime = formatTime(elapsedSeconds);
    const service = servicePackages.find(s => s.id === selectedService);
    const servicePrice = service ? service.pricing[vehicleType] : 0;
    const addOnsTotal = selectedAddOns.reduce((sum, id) => {
      const addon = addOns.find(a => a.id === id);
      return sum + (addon ? addon.pricing[vehicleType] : 0);
    }, 0);
    const totalRevenue = servicePrice + addOnsTotal;
    
    // Save job data
    const jobData = {
      jobId: `JOB-${Date.now()}`,
      employee: 'employee@primedetail.com',
      customer,
      vehicle,
      vehicleType,
      service: service?.name,
      addOns: selectedAddOns.map(id => addOns.find(a => a.id === id)?.name),
      steps: steps.map(s => ({ name: s.name, checked: s.checked, time: s.time })),
      completedSteps,
      totalSteps,
      totalTime,
      totalRevenue,
      finishedAt: new Date().toISOString(),
      status: 'completed'
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('completedJobs') || '[]');
    localStorage.setItem('completedJobs', JSON.stringify([...existing, jobData]));

    // Generate PDF for File Manager
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Prime Detail Solutions", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Job Completion Report", 105, 30, { align: "center" });
    doc.text(`Job ID: ${jobData.jobId}`, 20, 45);
    doc.text(`Customer: ${customer}`, 20, 53);
    doc.text(`Vehicle: ${vehicle}`, 20, 61);
    doc.text(`Service: ${service?.name}`, 20, 69);
    doc.text(`Total Time: ${totalTime}`, 20, 77);
    doc.text(`Completed: ${new Date().toLocaleString()}`, 20, 85);
    
    const pdfUrl = doc.output('bloburl');
    savePDFToArchive('Job', customer, jobData.jobId, String(pdfUrl));

    // Email final report
    window.location.href = `mailto:primedetailsolutions.ma.nh@gmail.com?subject=Job Completed - ${customer}&body=Job ${jobData.jobId} completed for ${customer}. Total time: ${totalTime}`;
    
    toast.success("Job completed! PDF saved to File Manager.");
    
    // Reset
    setSelectedService('');
    setSelectedAddOns([]);
    setSteps([]);
    setCustomer('');
    setVehicle('');
    setIsRunning(false);
    setElapsedSeconds(0);
    setIsPaused(false);
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
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Current Job: {vehicle} - {servicePackages.find(s => s.id === selectedService)?.name}</h2>
                  <p className="text-muted-foreground">Progress: {completedSteps}/{totalSteps} Complete</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-xl font-mono font-bold text-primary">
                      {formatTime(elapsedSeconds)}
                    </span>
                    {isPaused && <span className="text-sm text-yellow-500">(PAUSED)</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleSaveProgress} variant="outline" className="gap-2" disabled={isPaused}>
                    <Save className="h-4 w-4" />
                    Save Progress
                  </Button>
                  <Button onClick={handleEmailProgress} variant="outline" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email Progress
                  </Button>
                </div>
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

            <div className="flex gap-4">
              {isPaused && (
                <Button onClick={() => setIsPaused(false)} size="lg" className="flex-1" variant="outline">
                  Resume Job
                </Button>
              )}
              <Button 
                onClick={handleFinishJob} 
                size="lg" 
                className={`bg-gradient-hero ${isPaused ? "flex-1" : "w-full"}`}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Finish Job
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeChecklist;
