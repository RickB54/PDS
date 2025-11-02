import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { Users, Clock, CheckCircle2, DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import jsPDF from "jspdf";

interface Employee {
  email: string;
  name: string;
  role: string;
}

interface JobRecord {
  jobId: string;
  employee: string;
  customer: string;
  vehicle: string;
  service: string;
  totalTime?: string;
  finishedAt: string;
  totalRevenue?: number;
}

const CompanyEmployees = () => {
  const user = getCurrentUser();
  const [employees] = useState<Employee[]>([
    { email: 'employee@gmail.com', name: 'Employee User', role: 'Employee' }
  ]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [jobRecords, setJobRecords] = useState<JobRecord[]>([]);

  useEffect(() => {
    // Only admins can access
    if (user?.role !== 'admin') {
      window.location.href = '/';
      return;
    }
    loadJobRecords();
  }, [user]);

  const loadJobRecords = () => {
    const completed = JSON.parse(localStorage.getItem('completedJobs') || '[]');
    setJobRecords(completed);
  };

  const filteredJobs = selectedEmployee
    ? jobRecords.filter(j => j.employee === selectedEmployee)
    : jobRecords;

  const totalJobs = filteredJobs.length;
  const totalRevenue = filteredJobs.reduce((sum, j) => sum + (j.totalRevenue || 0), 0);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Employee Work History", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    
    if (selectedEmployee) {
      const emp = employees.find(e => e.email === selectedEmployee);
      doc.text(`Employee: ${emp?.name || selectedEmployee}`, 20, 40);
    }
    
    let y = 50;
    doc.text("Job | Customer | Vehicle | Service | Date", 20, y);
    y += 7;
    
    filteredJobs.forEach((job) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(
        `${job.jobId} | ${job.customer} | ${job.vehicle} | ${job.service} | ${new Date(job.finishedAt).toLocaleDateString()}`,
        20,
        y
      );
      y += 7;
    });
    
    doc.save(`Employee_History_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Company Employees" />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Employee Management</h1>
            <Button onClick={generatePDF} variant="outline">
              Download Report
            </Button>
          </div>

          {/* Employee Selector */}
          <Card className="p-4 bg-gradient-card border-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <label className="font-medium">Select Employee:</label>
              </div>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Employees</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.email} value={emp.email}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-card border-border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <h3 className="text-2xl font-bold text-foreground">{totalJobs}</h3>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Generated</p>
                  <h3 className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</h3>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Jobs/Day</p>
                  <h3 className="text-2xl font-bold text-foreground">
                    {totalJobs > 0 ? (totalJobs / 30).toFixed(1) : '0'}
                  </h3>
                </div>
              </div>
            </Card>
          </div>

          {/* Work History Table */}
          <Card className="bg-gradient-card border-border">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Work History</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                        No work history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobs.map((job) => (
                      <TableRow key={job.jobId}>
                        <TableCell className="font-mono text-sm">{job.jobId}</TableCell>
                        <TableCell>{job.employee}</TableCell>
                        <TableCell>{job.customer}</TableCell>
                        <TableCell>{job.vehicle}</TableCell>
                        <TableCell>{job.service}</TableCell>
                        <TableCell>{job.totalTime || 'N/A'}</TableCell>
                        <TableCell>{new Date(job.finishedAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CompanyEmployees;
