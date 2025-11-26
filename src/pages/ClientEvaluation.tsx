import { useState } from "react";
import supabase from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type EvalItem = {
  id: string;
  vehicleCondition: number;
  exterior: number;
  interior: number;
  odor: "None" | "Mild" | "Strong";
  petHair: "None" | "Light" | "Heavy";
  stains: "None" | "Light" | "Heavy";
  expectedTime: string;
  difficulty: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export default function ClientEvaluation() {
  const [vehicleCondition, setVehicleCondition] = useState<number>(3);
  const [exterior, setExterior] = useState<number>(3);
  const [interior, setInterior] = useState<number>(3);
  const [odor, setOdor] = useState<"None" | "Mild" | "Strong">("None");
  const [petHair, setPetHair] = useState<"None" | "Light" | "Heavy">("None");
  const [stains, setStains] = useState<"None" | "Light" | "Heavy">("None");
  const [expectedTime, setExpectedTime] = useState<string>("");
  const [difficulty, setDifficulty] = useState<number>(3);
  const [notes, setNotes] = useState<string>("");
  const [evaluations, setEvaluations] = useState<EvalItem[]>([]);
  const [viewItem, setViewItem] = useState<EvalItem | null>(null);
  const [editItem, setEditItem] = useState<EvalItem | null>(null);

  const saveEvaluation = () => {
    const now = new Date().toISOString();
    const item: EvalItem = {
      id: Math.random().toString(36).slice(2),
      vehicleCondition,
      exterior,
      interior,
      odor,
      petHair,
      stains,
      expectedTime,
      difficulty,
      notes: notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    setEvaluations(prev => [item, ...prev]);
    setVehicleCondition(3); setExterior(3); setInterior(3); setOdor("None"); setPetHair("None"); setStains("None"); setExpectedTime(""); setDifficulty(3); setNotes("");
    (async () => {
      try {
        await supabase.from('client_evaluations').insert({ vehicle_condition: vehicleCondition, exterior_condition: exterior, interior_condition: interior, odor_level: odor, pet_hair_level: petHair, stains_level: stains, expected_time: expectedTime, difficulty_rating: difficulty, notes });
      } catch {}
    })();
  };

  const updateEvaluation = () => {
    if (!editItem) return;
    const now = new Date().toISOString();
    setEvaluations(prev => prev.map(it => it.id === editItem.id ? { ...editItem, updatedAt: now } : it));
    setEditItem(null);
  };

  const deleteEvaluation = (id: string) => {
    setEvaluations(prev => prev.filter(it => it.id !== id));
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Client Evaluation" />
      <Card className="p-6 bg-gradient-card border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Overall Vehicle Condition (1–5)</Label>
            <Input type="number" min={1} max={5} value={vehicleCondition} onChange={(e) => setVehicleCondition(Number(e.target.value))} className="mt-2" />
          </div>
          <div>
            <Label>Exterior Condition (1–5)</Label>
            <Input type="number" min={1} max={5} value={exterior} onChange={(e) => setExterior(Number(e.target.value))} className="mt-2" />
          </div>
          <div>
            <Label>Interior Condition (1–5)</Label>
            <Input type="number" min={1} max={5} value={interior} onChange={(e) => setInterior(Number(e.target.value))} className="mt-2" />
          </div>
          <div>
            <Label>Odor Level</Label>
            <Select value={odor} onValueChange={(v: any) => setOdor(v)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Mild">Mild</SelectItem>
                <SelectItem value="Strong">Strong</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Pet Hair Level</Label>
            <Select value={petHair} onValueChange={(v: any) => setPetHair(v)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Light">Light</SelectItem>
                <SelectItem value="Heavy">Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Stains</Label>
            <Select value={stains} onValueChange={(v: any) => setStains(v)}>
              <SelectTrigger className="mt-2"><SelectValue placeholder="Choose" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Light">Light</SelectItem>
                <SelectItem value="Heavy">Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Expected Time</Label>
            <Input value={expectedTime} onChange={(e) => setExpectedTime(e.target.value)} className="mt-2" placeholder="e.g., 2–3 hours" />
          </div>
          <div>
            <Label>Difficulty (1–5)</Label>
            <Input type="number" min={1} max={5} value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} className="mt-2" />
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2" placeholder="Observation notes" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={saveEvaluation}>Save Evaluation</Button>
          <Button variant="outline" onClick={() => { setVehicleCondition(3); setExterior(3); setInterior(3); setOdor("None"); setPetHair("None"); setStains("None"); setExpectedTime(""); setDifficulty(3); setNotes(""); }}>Reset</Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Past Evaluations</h2>
          <span className="text-sm text-muted-foreground">{evaluations.length} total</span>
        </div>
        <div className="mt-4 space-y-3">
          {evaluations.map((it) => (
            <div key={it.id} className="p-3 rounded-md border border-border bg-background flex items-center justify-between">
              <div>
                <div className="font-medium">Vehicle {it.vehicleCondition}/5 • Exterior {it.exterior}/5 • Interior {it.interior}/5</div>
                <div className="text-sm text-muted-foreground">Odor {it.odor} • Pet Hair {it.petHair} • Stains {it.stains} • Time {it.expectedTime || '—'} • Difficulty {it.difficulty}/5</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setViewItem(it)}>View</Button>
                <Button variant="outline" onClick={() => setEditItem(it)}>Edit</Button>
                <Button variant="destructive" onClick={() => deleteEvaluation(it.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {evaluations.length === 0 && (
            <div className="text-sm text-muted-foreground">No evaluations yet</div>
          )}
        </div>
      </Card>

      <Dialog open={viewItem !== null} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evaluation Details</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-2">
              <div>Vehicle: {viewItem.vehicleCondition}/5</div>
              <div>Exterior: {viewItem.exterior}/5</div>
              <div>Interior: {viewItem.interior}/5</div>
              <div>Odor: {viewItem.odor}</div>
              <div>Pet Hair: {viewItem.petHair}</div>
              <div>Stains: {viewItem.stains}</div>
              <div>Expected Time: {viewItem.expectedTime || '—'}</div>
              <div>Difficulty: {viewItem.difficulty}/5</div>
              <div>Notes: {viewItem.notes || '—'}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editItem !== null} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Evaluation</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Vehicle (1–5)</Label>
                <Input type="number" min={1} max={5} value={editItem.vehicleCondition} onChange={(e) => setEditItem({ ...editItem, vehicleCondition: Number(e.target.value) })} className="mt-2" />
              </div>
              <div>
                <Label>Exterior (1–5)</Label>
                <Input type="number" min={1} max={5} value={editItem.exterior} onChange={(e) => setEditItem({ ...editItem, exterior: Number(e.target.value) })} className="mt-2" />
              </div>
              <div>
                <Label>Interior (1–5)</Label>
                <Input type="number" min={1} max={5} value={editItem.interior} onChange={(e) => setEditItem({ ...editItem, interior: Number(e.target.value) })} className="mt-2" />
              </div>
              <div>
                <Label>Odor</Label>
                <Select value={editItem.odor} onValueChange={(v: any) => setEditItem({ ...editItem, odor: v })}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Mild">Mild</SelectItem>
                    <SelectItem value="Strong">Strong</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stains</Label>
                <Select value={editItem.stains} onValueChange={(v: any) => setEditItem({ ...editItem, stains: v })}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Light">Light</SelectItem>
                    <SelectItem value="Heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expected Time</Label>
                <Input value={editItem.expectedTime} onChange={(e) => setEditItem({ ...editItem, expectedTime: e.target.value })} className="mt-2" />
              </div>
              <div>
                <Label>Difficulty (1–5)</Label>
                <Input type="number" min={1} max={5} value={editItem.difficulty} onChange={(e) => setEditItem({ ...editItem, difficulty: Number(e.target.value) })} className="mt-2" />
              </div>
              <div>
                <Label>Pet Hair</Label>
                <Select value={editItem.petHair} onValueChange={(v: any) => setEditItem({ ...editItem, petHair: v })}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Light">Light</SelectItem>
                    <SelectItem value="Heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Input value={editItem.notes || ''} onChange={(e) => setEditItem({ ...editItem, notes: e.target.value })} className="mt-2" />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button onClick={updateEvaluation} className="bg-blue-600 hover:bg-blue-700">Save</Button>
                <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
