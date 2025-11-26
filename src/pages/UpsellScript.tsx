import { useMemo, useState } from "react";
import supabase from "@/lib/supabase";
import jsPDF from "jspdf";
import { savePDFToArchive } from "@/lib/pdfArchive";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const COMPLAINTS = [
  "Stains",
  "Scratches",
  "Pet Hair",
  "Bad Odor",
  "Dull Paint",
] as const;
const GOALS = ["Fast turnaround","Deep interior","Paint enhancement","Odor elimination","Budget-friendly","Long-term protection"] as const;
const VEHICLE_TYPES = ["Compact/Sedan","Mid-Size/SUV","Truck/Van/Large SUV","Luxury/High-End"] as const;

const RECS: Record<string, string[]> = {
  "Stains": ["Shampoo extraction", "Targeted stain treatment"],
  "Scratches": ["Machine polish", "Paint correction (as needed)"],
  "Pet Hair": ["Deep interior detail", "Pet hair removal"],
  "Bad Odor": ["Ozone treatment", "Deep interior clean"],
  "Dull Paint": ["Machine polish", "Premium exterior detail"],
};

export default function UpsellScript() {
  const [selected, setSelected] = useState<string[]>([]);
  const [vehicleType, setVehicleType] = useState<string>(VEHICLE_TYPES[1]);
  const [condition, setCondition] = useState<number>(3);
  const [goals, setGoals] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>("");

  const recommended = useMemo(() => {
    const out = new Set<string>();
    selected.forEach(s => (RECS[s] || []).forEach(r => out.add(r)));
    if (condition <= 2) {
      out.add("Deep interior detail"); out.add("Machine polish");
    }
    if (vehicleType === "Truck/Van/Large SUV") {
      out.add("Wheel well deep clean"); out.add("Large-vehicle surcharge");
    }
    if (goals.includes("Long-term protection")) out.add("Ceramic coating");
    if (goals.includes("Budget-friendly")) { out.add("Express exterior"); out.add("Basic interior"); }
    if (goals.includes("Paint enhancement")) out.add("Machine polish");
    if (goals.includes("Odor elimination")) out.add("Ozone treatment");
    return Array.from(out);
  }, [selected, condition, vehicleType, goals]);

  const script = useMemo(() => {
    const items = selected.length ? selected.join(", ") : "general concerns";
    const goalText = goals.length ? ` and your goals (${goals.join(", ")})` : "";
    const vt = vehicleType;
    const reccos = recommended.join(", ") || "a tailored package";
    return `Based on your vehicle type (${vt}), condition (${condition}/5)${goalText} and ${items}, I recommend: ${reccos}.`;
  }, [selected, recommended, goals, vehicleType, condition]);

  const toggle = (name: string) => {
    setSelected(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
  };

  const printScript = () => {
    const w = window.open("", "print");
    if (!w) return;
    w.document.write(`<pre style="font-family: system-ui; white-space: pre-wrap;">${script}</pre>`);
    w.document.close();
    w.focus();
    w.print();
  };
  const saveScript = async () => {
    try {
      await supabase.from('upsell_recommendations').insert({ complaints: selected, vehicle_type: vehicleType, condition_rating: condition, goals, notes, recommendations: recommended });
    } catch {}
    try {
      const doc = new jsPDF();
      doc.setFontSize(16); doc.text('Addon Upsell Script', 105, 20, { align: 'center' });
      doc.setFontSize(11);
      let y = 34;
      doc.text(`Vehicle Type: ${vehicleType}`, 20, y); y += 6;
      doc.text(`Condition: ${condition}/5`, 20, y); y += 6;
      doc.text(`Complaints: ${selected.join(', ') || 'None'}`, 20, y); y += 6;
      doc.text(`Goals: ${goals.join(', ') || 'None'}`, 20, y); y += 6;
      if (notes) { doc.text(`Notes: ${notes}`, 20, y); y += 6; }
      y += 4;
      doc.setFontSize(13); doc.text('Recommended Upsells', 20, y); y += 6; doc.setFontSize(11);
      if (recommended.length === 0) { doc.text('None', 20, y); y += 6; }
      recommended.forEach((r) => { doc.text(`• ${r}`, 24, y); y += 6; if (y > 280) { doc.addPage(); y = 20; } });
      y += 6; doc.setFontSize(13); doc.text('Script', 20, y); y += 6; doc.setFontSize(11);
      const lines = doc.splitTextToSize(script, 170);
      lines.forEach((ln) => { doc.text(ln, 20, y); y += 6; if (y > 280) { doc.addPage(); y = 20; } });
      const dataUrl = doc.output('dataurlstring');
      const fileName = `Upsell_Script_${new Date().toISOString().split('T')[0]}.pdf`;
      savePDFToArchive('Upsell Script' as any, 'Customer', `upsell_${Date.now()}`, dataUrl, { fileName, path: 'Upsell Script/' });
    } catch {}
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Addon Upsell Script" />

      <Card className="p-6 bg-gradient-card border-border">
        <h2 className="text-xl font-semibold mb-3">Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-sm text-muted-foreground">Vehicle Type</label>
            <Select value={vehicleType} onValueChange={(v) => setVehicleType(v)}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {VEHICLE_TYPES.map(v => (<SelectItem key={v} value={v}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Condition (1–5)</label>
            <Input type="number" min={1} max={5} value={condition} onChange={(e) => setCondition(Number(e.target.value))} className="mt-2" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">Customer Complaints</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {COMPLAINTS.map(name => (
            <label key={name} className="flex items-center gap-2 p-3 rounded-md border border-border bg-background">
              <Checkbox checked={selected.includes(name)} onCheckedChange={() => toggle(name)} />
              <span>{name}</span>
            </label>
          ))}
        </div>
        <h3 className="text-lg font-semibold mt-4 mb-2">Customer Goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {GOALS.map(name => (
            <label key={name} className="flex items-center gap-2 p-3 rounded-md border border-border bg-background">
              <Checkbox checked={goals.includes(name)} onCheckedChange={() => setGoals(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name])} />
              <span>{name}</span>
            </label>
          ))}
        </div>
        <div className="mt-3">
          <label className="text-sm text-muted-foreground">Additional Notes</label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2" placeholder="Any extra preferences or constraints" />
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card border-border">
        <h2 className="text-xl font-semibold mb-3">Recommended Upsells</h2>
        {recommended.length > 0 ? (
          <ul className="list-disc pl-6 space-y-1">
            {recommended.map((r) => (<li key={r}>{r}</li>))}
          </ul>
        ) : (
          <div className="text-sm text-muted-foreground">No recommendations yet</div>
        )}
      </Card>

      <Card className="p-6 bg-gradient-card border-border">
        <h2 className="text-xl font-semibold mb-3">Script</h2>
        <div className="p-4 rounded-md border border-border bg-background">
          {script}
        </div>
        <div className="mt-3 flex gap-2">
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => { printScript(); saveScript(); }}>Print Script</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={saveScript}>Save Script</Button>
          <Button variant="outline" onClick={() => { setSelected([]); setGoals([]); setNotes(""); setCondition(3); setVehicleType(VEHICLE_TYPES[1]); }}>Reset</Button>
        </div>
      </Card>

      {/* Supabase placeholder
        await supabase.from('upsell_recommendations').insert({ complaints: selected, recommendations: recommended });
      */}
    </div>
  );
}
