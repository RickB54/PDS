import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import OrientationModal from "@/components/training/OrientationModal";
import jsPDF from "jspdf";
import { savePDFToArchive } from "@/lib/pdfArchive";
import { pushAdminAlert } from "@/lib/adminAlerts";
import { getCurrentUser } from "@/lib/auth";

const EmployeeDashboard = () => {
  const { toast } = useToast();
  const user = getCurrentUser();
  const [certifiedDate, setCertifiedDate] = useState<string | null>(null);
  const [orientationOpen, setOrientationOpen] = useState(false);

  // Notify Admin form state
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("URGENT");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const cert = localStorage.getItem("employee_training_certified");
    if (cert) setCertifiedDate(cert);
    // Remove any legacy task data from persistent storage
    try { localStorage.removeItem("employee_tasks"); } catch {}
  }, []);

  const handleNotifyAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Missing info", description: "Please enter a subject and message.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const actor = user?.name || user?.email || "Employee";
      const now = new Date();

      // Generate PDF for File Manager → Employee Contact
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Employee Contact", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.text(`Date: ${now.toLocaleString()}`, 20, 35);
      doc.text(`Employee: ${actor}`, 20, 45);
      doc.text(`Priority: ${priority}`, 20, 55);
      doc.text(`Subject: ${subject}`, 20, 65);
      doc.text("Message:", 20, 80);
      const lines = doc.splitTextToSize(message, 170);
      doc.text(lines, 20, 90);
      const pdfDataUrl = doc.output("dataurlstring");
      const fileName = `Employee_Contact_${now.toLocaleDateString().replace(/\//g, '-')}.pdf`;
      savePDFToArchive("Employee Contact", actor, `emp_contact_${Date.now()}`, pdfDataUrl, { fileName, path: "Employee Contact/" });

      // Alert admin
      pushAdminAlert("admin_email_sent", `Employee contact: ${subject}`, actor, { priority });

      // Attempt background email via local API (port 6061)
      try {
        await fetch("http://localhost:6061/api/email/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ from: actor, subject, message, priority, pdfDataUrl })
        });
      } catch {}

      // Open Gmail compose for reliability
      const body = `Priority: ${priority}\nEmployee: ${actor}\n\n${message}`;
      const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=primedetailsolutions.ma.nh@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailLink, "_blank");

      toast({ title: "Sent", description: "Your message was prepared; PDF saved in File Manager." });
      setSubject(""); setMessage(""); setPriority("URGENT");
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Employee Dashboard" />
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">Employee Dashboard</h1>
            {certifiedDate && (
              <Badge className="bg-green-600">Certified Detailer — {certifiedDate}</Badge>
            )}
          </div>

          {/* Big cards arranged in two rows (2 columns on md+) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/service-checklist" className="block">
              <Card className="p-6 bg-green-700 text-white rounded-xl">
                <div className="text-2xl font-bold">SERVICE CHECKLIST</div>
                <div className="text-sm opacity-90">Start Job • View Active Jobs</div>
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-green-900 text-xs">[ 0 Active Jobs ]</div>
              </Card>
            </Link>

            {/* Orientation box (orange) */}
            <button type="button" onClick={() => setOrientationOpen(true)} className="block text-left">
              <Card className="p-6 bg-orange-600 text-white rounded-xl">
                <div className="text-2xl font-bold">ORIENTATION</div>
                <div className="text-sm opacity-90">Company overview • Policies • Getting started</div>
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-orange-800 text-xs">New Employee</div>
              </Card>
            </button>

            <Link to="/services" className="block">
              <Card className="p-6 bg-blue-700 text-white rounded-xl">
                <div className="text-2xl font-bold">VIEW WEBSITE</div>
                <div className="text-sm opacity-90">To view our current package pricelist, add-ons and other website tools.</div>
              </Card>
            </Link>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link to="/bookings" className="block">
              <Card className="p-4 text-center bg-muted/30 hover:bg-muted/50 transition rounded-xl">
                <div className="font-semibold text-white">TO DO</div>
                <div className="text-xs text-muted-foreground">(Calendar)</div>
              </Card>
            </Link>
            <Link to="/search-customer" className="block">
              <Card className="p-4 text-center bg-muted/30 hover:bg-muted/50 transition rounded-xl">
                <div className="font-semibold text-white">ADD CUSTOMER</div>
              </Card>
            </Link>
            <Link to="/book-now" className="block">
              <Card className="p-4 text-center bg-muted/30 hover:bg-muted/50 transition rounded-xl">
                <div className="font-semibold text-white">NEW BOOKING</div>
              </Card>
            </Link>
          </div>

          {/* Notify Admin */}
          <Card className="p-6 bg-gradient-card border-border">
            <div className="text-xl font-bold text-foreground mb-4">NOTIFY ADMIN</div>
            <form onSubmit={handleNotifyAdmin} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URGENT">URGENT</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[140px]" />
              <div className="flex justify-end">
                <Button type="submit" disabled={sending} className="bg-red-600 hover:bg-red-700">
                  {sending ? "Sending..." : "Send"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
      {/* Orientation Modal */}
      <OrientationModal open={orientationOpen} onOpenChange={setOrientationOpen} />
    </div>
  );
};

export default EmployeeDashboard;
