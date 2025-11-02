import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUser } from "@/lib/auth";
import { FileText, Download, Search, Filter } from "lucide-react";
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

interface PDFRecord {
  id: string;
  fileName: string;
  recordType: "Invoice" | "Estimate" | "Job" | "Checklist" | "Customer";
  customerName: string;
  date: string;
  timestamp: string;
  recordId: string;
  pdfData: string; // base64 or blob URL
}

const FileManager = () => {
  const user = getCurrentUser();
  const [records, setRecords] = useState<PDFRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    // Only admins can access
    if (user?.role !== 'admin') {
      window.location.href = '/';
      return;
    }
    loadRecords();
  }, [user]);

  const loadRecords = () => {
    const stored = localStorage.getItem('pdfArchive');
    if (stored) {
      setRecords(JSON.parse(stored));
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || record.recordType === typeFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const recordDate = new Date(record.timestamp);
      const now = new Date();
      if (dateFilter === "today") {
        matchesDate = recordDate.toDateString() === now.toDateString();
      } else if (dateFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = recordDate >= weekAgo;
      } else if (dateFilter === "month") {
        matchesDate = recordDate.getMonth() === now.getMonth() && 
                     recordDate.getFullYear() === now.getFullYear();
      }
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  const downloadPDF = (record: PDFRecord) => {
    // For now, create a simple download link
    const link = document.createElement('a');
    link.href = record.pdfData;
    link.download = record.fileName;
    link.click();
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="File Manager" />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">PDF Archive</h1>
            <div className="text-muted-foreground">
              {filteredRecords.length} of {records.length} files
            </div>
          </div>

          {/* Filters */}
          <Card className="p-4 bg-gradient-card border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by file name or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Invoice">Invoices</SelectItem>
                  <SelectItem value="Estimate">Estimates</SelectItem>
                  <SelectItem value="Job">Jobs</SelectItem>
                  <SelectItem value="Checklist">Checklists</SelectItem>
                  <SelectItem value="Customer">Customer Records</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* File List */}
          <Card className="bg-gradient-card border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No files found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.fileName}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                          {record.recordType}
                        </span>
                      </TableCell>
                      <TableCell>{record.customerName}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(record.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => downloadPDF(record)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FileManager;
