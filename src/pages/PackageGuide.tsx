import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import supabase from "@/lib/supabase";

type PackageItem = {
  name: string;
  description: string;
  includes: string[];
  bestFor: string;
  estimatedTime: string;
};

const PACKAGES: PackageItem[] = [
  {
    name: "Bronze Package",
    description: "Simple cleaning, wipe-down, vacuum — fast, basic maintenance.",
    includes: ["Exterior rinse", "Interior wipe-down", "Quick vacuum"],
    bestFor: "Routine upkeep and freshening between deep cleans",
    estimatedTime: "1–1.5 hours",
  },
  {
    name: "Silver Package",
    description: "Deep interior clean, moderate stain removal, exterior wash.",
    includes: ["Exterior wash", "Interior deep clean", "Moderate stain removal"],
    bestFor: "Families or commuters wanting a deeper refresh",
    estimatedTime: "2–3 hours",
  },
  {
    name: "Gold Package",
    description: "Full deep interior + premium exterior + machine polish.",
    includes: ["Premium exterior detail", "Full deep interior", "Machine polish"],
    bestFor: "Vehicles needing paint enhancement and complete interior reset",
    estimatedTime: "3–4 hours",
  },
  {
    name: "Platinum Package",
    description: "Full Gold Package + ceramic protection + odor reset + rejuvenation.",
    includes: ["Gold Package contents", "Ceramic protection", "Odor reset / ozone"],
    bestFor: "Long-term protection and maximum rejuvenation",
    estimatedTime: "4–6+ hours",
  },
];

export default function PackageGuide() {
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainText, setExplainText] = useState<string>("");

  const openExplain = (pkg: PackageItem) => {
    const text = `${pkg.name} — ${pkg.description}\n\nIncludes: ${pkg.includes.join(", ")}\n\nWhy it's useful: ${pkg.bestFor}\n\nEstimated time: ${pkg.estimatedTime}`;
    setExplainText(text);
    setExplainOpen(true);
  };

  const printExplain = () => {
    const w = window.open("", "print");
    if (!w) return;
    w.document.write(`<pre style="font-family: system-ui; white-space: pre-wrap;">${explainText}</pre>`);
    w.document.close();
    w.focus();
    w.print();
  };
  return (
    <div className="space-y-4">
      <PageHeader title="Package Explanation Guide" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PACKAGES.map((pkg) => (
          <Card key={pkg.name} className="p-6 bg-gradient-card border-border">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{pkg.name}</h2>
              <p className="text-sm text-muted-foreground">{pkg.description}</p>
              <div>
                <div className="font-medium mb-1">What's Included</div>
                <ul className="list-disc pl-6 space-y-1">
                  {pkg.includes.map((i) => (<li key={i}>{i}</li>))}
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">Best For</div>
                <p className="text-sm">{pkg.bestFor}</p>
              </div>
              <div className="pt-2">
                <Button variant="outline" onClick={() => { openExplain(pkg); (async () => { try { await supabase.from('packages_info').insert({ name: pkg.name, description: pkg.description, includes: pkg.includes, best_for: pkg.bestFor, estimated_time: pkg.estimatedTime }); } catch {} })(); }}>Explain to customer</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={explainOpen} onOpenChange={setExplainOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Explain to Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-4 rounded-md border border-border bg-background whitespace-pre-wrap">{explainText}</div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setExplainOpen(false)}>Close</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={printExplain}>Print</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Supabase placeholder
        await supabase.from('packages_info').insert({ ... })
      */}
    </div>
  );
}
