import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import supabase from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { dataset, inferCategory, luxuryMakes, VehicleClassRow } from '@/data/vehicleClassification';
import localforage from 'localforage';
const DEBUG_VC = false;

type DbRow = {
  id: string;
  make: string;
  model: string;
  year_start: number | null;
  year_end: number | null;
  type_category: 'Compact / Sedan' | 'Mid-Size / SUV' | 'Truck / Van / Large SUV';
  is_luxury: boolean;
  notes: string | null;
};

export default function VehicleClassification() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const isAdmin = user?.role === 'admin';
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [result, setResult] = useState<VehicleClassRow | null>(null);
  const [luxury, setLuxury] = useState(false);
  const [overrideCategory, setOverrideCategory] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [rows, setRows] = useState<DbRow[]>([]);
  const [q, setQ] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterLuxury, setFilterLuxury] = useState<string>('');
  const [addOpen, setAddOpen] = useState(false);
  const [addMake, setAddMake] = useState('');
  const [addModel, setAddModel] = useState('');
  const [addYearStart, setAddYearStart] = useState('');
  const [addYearEnd, setAddYearEnd] = useState('');
  const [addType, setAddType] = useState('Mid-Size / SUV');
  const [addLuxury, setAddLuxury] = useState(false);
  const [addNotes, setAddNotes] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importRows, setImportRows] = useState<any[]>([]);
  const QUEUE_KEY = 'vehicle_classification_queue';
  const makes = useMemo(() => {
    const all = new Set<string>();
    rows.forEach(r => all.add(String(r.make).trim()));
    return Array.from(all).sort((a, b) => a.localeCompare(b));
  }, [rows]);
  const modelsForMake = useMemo(() => {
    const m = String(make).trim();
    const s = new Set<string>();
    rows.filter(r => String(r.make).trim() === m).forEach(r => s.add(String(r.model).trim()));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [make, rows]);
  const modelsForAddMake = useMemo(() => {
    const m = String(addMake).trim();
    const s = new Set<string>();
    rows.filter(r => String(r.make).trim() === m).forEach(r => s.add(String(r.model).trim()));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [addMake, rows]);

  useEffect(() => {
    (async () => { await refreshRows(); await syncQueue(); })();
  }, []);

  const refreshRows = async () => {
    let db: DbRow[] = [];
    try {
      const { data, error } = await supabase.from('vehicle_classification').select('*').limit(5000);
      if (!error && Array.isArray(data)) db = data as any;
    } catch {}
    let qLf: any[] = [];
    try { qLf = (await localforage.getItem<any[]>(QUEUE_KEY)) || []; } catch {}
    let qLs: any[] = [];
    try { qLs = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch {}
    const qAll = [...qLf, ...qLs];
    const byKey = new Map<string, any>();
    for (const r of db) byKey.set(`${String(r.make).trim().toLowerCase()}::${String(r.model).trim().toLowerCase()}`, r);
    qAll.forEach((r, i) => {
      const key = `${String(r.make).trim().toLowerCase()}::${String(r.model).trim().toLowerCase()}`;
      if (!byKey.has(key)) byKey.set(key, { ...r, id: r.id || `local_${i}_${Date.now()}` });
    });
    const merged: DbRow[] = Array.from(byKey.values()) as any;
    if (DEBUG_VC) console.log('[VehicleClassification] refreshRows', { dbCount: db.length, queueCount: qAll.length, mergedCount: merged.length });
    setRows(merged);
  };

  const syncQueue = async () => {
    let qLf: any[] = [];
    let qLs: any[] = [];
    try { qLf = (await localforage.getItem<any[]>(QUEUE_KEY)) || []; } catch {}
    try { qLs = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch {}
    const qAll = [...qLf, ...qLs];
    if (qAll.length === 0) return;
    let succeeded = 0;
    const remaining: any[] = [];
    for (const item of qAll) {
      try {
        const { error } = await supabase.from('vehicle_classification').upsert(item as any, { onConflict: 'make,model' } as any);
        if (error) throw error;
        succeeded++;
      } catch {
        remaining.push(item);
      }
    }
    try { await localforage.setItem(QUEUE_KEY, remaining); } catch {}
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining)); } catch {}
    if (succeeded > 0) await refreshRows();
  };

  const classify = async () => {
    const m = make.trim();
    const mo = model.trim();
    if (!m || !mo) {
      toast({ title: 'Enter make and model' });
      return;
    }
    const base = inferCategory(m, mo);
    let dbRows: DbRow[] = [];
    try {
      const { data, error } = await supabase
        .from('vehicle_classification')
        .select('*')
        .ilike('make', m)
        .ilike('model', mo);
      if (!error && Array.isArray(data)) dbRows = data as any;
    } catch {}
    const y = Number(String(year || '').trim()) || null;
    const inRange = (r: DbRow) => {
      if (y === null) return true;
      if (r.year_start == null && r.year_end == null) return true;
      const ys = r.year_start == null ? -Infinity : r.year_start;
      const ye = r.year_end == null ? Infinity : r.year_end;
      return y >= ys && y <= ye;
    };
    let dbMatch: DbRow | null = null;
    const rangedMatches = dbRows.filter(inRange);
    if (rangedMatches.length > 0) {
      dbMatch = rangedMatches[0];
    } else if (dbRows.length > 0) {
      if (y !== null) {
        let best: DbRow | null = null;
        let bestDist = Number.POSITIVE_INFINITY;
        for (const r of dbRows) {
          const ys = r.year_start == null ? y : r.year_start;
          const ye = r.year_end == null ? y : r.year_end;
          const mid = (Number(ys) + Number(ye)) / 2;
          const dist = Math.abs(mid - y);
          if (dist < bestDist) { bestDist = dist; best = r; }
        }
        dbMatch = best;
      } else {
        dbMatch = dbRows[0];
      }
    }
    const lux = luxuryMakes.some(x => m.toLowerCase().includes(x)) || base.is_luxury || Boolean(dbMatch?.is_luxury);
    const cat = (overrideCategory as any) || (dbMatch?.type_category as any) || base.type_category;
    setLuxury(lux);
    setResult({ make: m, model: mo, type_category: cat, is_luxury: lux });
    const r = cat === 'Truck / Van / Large SUV' ? `Vehicle footprint is large.
Interior volume consistent with trucks, vans, or full-size SUVs.` : cat === 'Compact / Sedan' ? 'Vehicle footprint consistent with compact sedans and small hatchbacks.' : 'Vehicle footprint and interior volume match mid-size standards.';
    setReason(r);
  };

  const save = async () => {
    if (!result) return;
    if (!isAdmin) {
      toast({ title: 'Admins only' });
      return;
    }
    const cap = (s: string) => (s ? (s.slice(0,1).toUpperCase() + s.slice(1).toLowerCase()) : s);
    const payload = {
      make: cap(result.make),
      model: cap(result.model),
      year_start: year ? Number(year) : null,
      year_end: year ? Number(year) : null,
      type_category: result.type_category,
      is_luxury: luxury,
      notes: ''
    } as any;
    try {
      const { error } = await supabase.from('vehicle_classification').upsert(payload, { onConflict: 'make,model' } as any);
      if (error) throw error;
      toast({ title: 'Saved' });
      await refreshRows();
    } catch (e: any) {
      const localItem = { ...payload, id: `local_${Date.now()}` };
      try {
        const q = (await localforage.getItem<any[]>(QUEUE_KEY)) || [];
        q.push(localItem);
        await localforage.setItem(QUEUE_KEY, q);
        setRows(prev => [...prev, localItem]);
        toast({ title: 'Saved locally', description: 'Will sync when server available.' });
      } catch (err) {
        toast({ title: 'Save failed', description: String(e?.message || e) });
      }
    }
  };

  const exportCsv = () => {
    const header = ['make','model','year_start','year_end','type_category','is_luxury','notes'];
    const lines = [header.join(',')];
    rows.forEach(r => {
      lines.push([
        r.make,
        r.model,
        String(r.year_start ?? ''),
        String(r.year_end ?? ''),
        r.type_category,
        r.is_luxury ? 'true' : 'false',
        (r.notes ?? '').replace(/\n/g,' ')
      ].join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vehicle_classification.csv';
    a.click();
  };

  const exportTemplateCsv = () => {
    const header = ['make','model','year_start','year_end','type_category','is_luxury','notes'];
    const blob = new Blob([header.join(',') + '\n\n'], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vehicle_classification_template.csv';
    a.click();
  };

  const importCsv = async (file: File) => {
    if (!isAdmin) { toast({ title: 'Admins only' }); return; }
    const text = await file.text();
    const linesRaw = text.split(/\r?\n/);
    const lines = linesRaw.filter(l => l.trim().length > 0);
    const header = lines.shift();
    const expected = 'make,model,year_start,year_end,type_category,is_luxury,notes';
    if (!header || header.trim() !== expected) { toast({ title: 'Invalid CSV header' }); return; }
    const parseBool = (v: string): boolean => {
      const s = String(v || '').trim().toLowerCase();
      return s === 'true' || s === '1' || s === 'yes';
    };
    const rowsParsed = lines.map(line => {
      const cols = line.split(',');
      const mk = String(cols[0] || '').trim();
      const md = String(cols[1] || '').trim();
      const ys = cols[2] ? Number(cols[2]) : null;
      const ye = cols[3] ? Number(cols[3]) : null;
      const tp = String(cols[4] || '').trim();
      const lux = parseBool(String(cols[5] || ''));
      const notes = String(cols[6] || '');
      return { make: mk, model: md, year_start: ys, year_end: ye, type_category: tp, is_luxury: lux, notes };
    });
    if (DEBUG_VC) console.log('[VehicleClassification] importCsv parsed', { parsedCount: rowsParsed.length });
    setImportRows(rowsParsed);
    setImportPreview(rowsParsed.slice(0, 10));
    setImportOpen(true);
  };

  const confirmImport = async () => {
    let inserted = 0;
    let rejected = 0;
    let queued = 0;
    for (const row of importRows) {
      const mk = String(row.make || '').trim();
      const md = String(row.model || '').trim();
      const tp = String(row.type_category || '').trim();
      if (!mk || !md || !tp) { rejected++; continue; }
      const payload = {
        make: mk,
        model: md,
        year_start: row.year_start ?? null,
        year_end: row.year_end ?? null,
        type_category: tp as any,
        is_luxury: Boolean(row.is_luxury),
        notes: String(row.notes || '')
      } as any;
      try {
        const { error } = await supabase.from('vehicle_classification').insert(payload);
        if (error) throw error;
        inserted++;
      } catch (e) {
        queued++;
        try {
          const item = { ...payload, id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}` };
          const qLf = (await localforage.getItem<any[]>(QUEUE_KEY)) || [];
          const qLs = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
          const next = [...qLf, ...qLs, item];
          await localforage.setItem(QUEUE_KEY, next);
          localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
        } catch {}
      }
    }
    if (DEBUG_VC) console.log('[VehicleClassification] confirmImport done', { inserted, queued });
    await refreshRows();
    setImportOpen(false);
    setImportPreview([]);
    setImportRows([]);
    toast({ title: `Import complete`, description: `${inserted} inserted, ${queued} queued, ${rejected} rejected` });
  };

  const filteredRows = rows.filter(r => {
    const qq = q.trim().toLowerCase();
    const byQ = !qq || r.make.toLowerCase().includes(qq) || r.model.toLowerCase().includes(qq);
    const byType = !filterType || filterType === 'all' || r.type_category === filterType;
    const byLux = !filterLuxury || filterLuxury === 'all' || (filterLuxury === 'luxury' ? r.is_luxury : !r.is_luxury);
    return byQ && byType && byLux;
  });
  useEffect(() => {
    if (DEBUG_VC) console.log('[VehicleClassification] table size', { uiCount: filteredRows.length });
  }, [filteredRows.length]);

  return (
    <div className="p-4 max-w-screen-2xl mx-auto">
      <Card className="p-4 bg-black border border-zinc-800">
        <div className="text-white text-xl font-bold mb-4">Client Intake Tools</div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {}}>
          Vehicle Classification
        </Button>
      </Card>

      <Card className="mt-4 p-4 bg-[#0f0f13] border border-zinc-800">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="text-white font-semibold">Make</div>
            <Select value={make} onValueChange={setMake}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select make" />
              </SelectTrigger>
              <SelectContent>
                {makes.map(m => (
                  <SelectItem value={m} key={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-white font-semibold">Model</div>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {modelsForMake.map(mo => (
                  <SelectItem value={mo} key={mo}>{mo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-white font-semibold">Year (optional)</div>
            <Input value={year} onChange={e => setYear(e.target.value)} placeholder="2021" className="bg-zinc-800 border-zinc-700 text-white" />
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={classify}>Classify Vehicle</Button>
          </div>
          <div className="space-y-4">
            <div className="text-white text-lg font-bold">Result</div>
            <div className="text-white">Category: {result?.type_category || ''}</div>
            <div className="flex items-center gap-2">
              <Checkbox checked={luxury} onCheckedChange={(v) => setLuxury(Boolean(v))} id="lux" />
              <label htmlFor="lux" className="text-white">Luxury / High-End</label>
            </div>
            <div className="text-zinc-300 whitespace-pre-line">{reason}</div>
              <div className="flex gap-2">
                <Select value={overrideCategory || ''} onValueChange={(v) => setOverrideCategory(v || null)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Override Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Compact / Sedan">Compact / Sedan</SelectItem>
                    <SelectItem value="Mid-Size / SUV">Mid-Size / SUV</SelectItem>
                    <SelectItem value="Truck / Van / Large SUV">Truck / Van / Large SUV</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-green-600 hover:bg-green-700" onClick={save}>Save Classification</Button>
              </div>
          </div>
        </div>
      </Card>

      <Card className="mt-6 p-4 bg-[#0f0f13] border border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white text-lg font-bold">Database</div>
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={exportCsv}>Export CSV</Button>
            <Button className="bg-zinc-700 hover:bg-zinc-600" onClick={exportTemplateCsv}>Download Template CSV</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setAddOpen(true); setAddMake(''); setAddModel(''); setAddYearStart(''); setAddYearEnd(''); setAddType('Mid-Size / SUV'); setAddLuxury(false); setAddNotes(''); }}>Add Vehicle</Button>
            <label className="inline-flex items-center gap-2 cursor-pointer bg-zinc-700 text-white px-3 py-2 rounded">
              <span>Import CSV</span>
              <input type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importCsv(f); }} />
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search make/model" className="bg-zinc-800 border-zinc-700 text-white" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Filter type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Compact / Sedan">Compact / Sedan</SelectItem>
              <SelectItem value="Mid-Size / SUV">Mid-Size / SUV</SelectItem>
              <SelectItem value="Truck / Van / Large SUV">Truck / Van / Large SUV</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterLuxury} onValueChange={setFilterLuxury}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Luxury" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="luxury">Luxury</SelectItem>
              <SelectItem value="non">Non-Luxury</SelectItem>
            </SelectContent>
          </Select>
          <div></div>
        </div>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-zinc-300">Make</TableHead>
                <TableHead className="text-zinc-300">Model</TableHead>
                <TableHead className="text-zinc-300">Type</TableHead>
                <TableHead className="text-zinc-300">Luxury</TableHead>
                <TableHead className="text-zinc-300">Year</TableHead>
                <TableHead className="text-zinc-300">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="text-white">{r.make}</TableCell>
                  <TableCell className="text-white">{r.model}</TableCell>
                  <TableCell className="text-white">{r.type_category}</TableCell>
                  <TableCell className="text-white">{r.is_luxury ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-white">{r.year_start || ''}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={async () => {
                      if (!isAdmin) { toast({ title: 'Admins only' }); return; }
                      const nextLux = !r.is_luxury;
                      const { error } = await supabase.from('vehicle_classification').update({ is_luxury: nextLux }).eq('id', r.id);
                      if (!error) {
                        setRows(rows.map(x => x.id === r.id ? { ...x, is_luxury: nextLux } : x));
                      }
                    }}>Toggle Luxury</Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-zinc-400 py-6">No rows</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-white font-semibold">Make</div>
            <Select value={addMake} onValueChange={setAddMake}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select make" />
              </SelectTrigger>
              <SelectContent>
                {makes.map(m => (
                  <SelectItem value={m} key={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={addMake} onChange={(e) => setAddMake(e.target.value)} placeholder="Enter custom make" className="bg-zinc-800 border-zinc-700 text-white" />
            <div className="text-white font-semibold">Model</div>
            <Select value={addModel} onValueChange={setAddModel}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {modelsForAddMake.map(mo => (
                  <SelectItem value={mo} key={mo}>{mo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={addModel} onChange={(e) => setAddModel(e.target.value)} placeholder="Enter custom model" className="bg-zinc-800 border-zinc-700 text-white" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={addYearStart} onChange={(e) => setAddYearStart(e.target.value)} placeholder="Year start" className="bg-zinc-800 border-zinc-700 text-white" />
              <Input value={addYearEnd} onChange={(e) => setAddYearEnd(e.target.value)} placeholder="Year end" className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="text-white font-semibold">Type Category</div>
            <Select value={addType} onValueChange={setAddType}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Compact / Sedan">Compact / Sedan</SelectItem>
                <SelectItem value="Mid-Size / SUV">Mid-Size / SUV</SelectItem>
                <SelectItem value="Truck / Van / Large SUV">Truck / Van / Large SUV</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Checkbox checked={addLuxury} onCheckedChange={(v) => setAddLuxury(Boolean(v))} id="addlux" />
              <label htmlFor="addlux" className="text-white">Luxury / High-End</label>
            </div>
            <Input value={addNotes} onChange={(e) => setAddNotes(e.target.value)} placeholder="Notes" className="bg-zinc-800 border-zinc-700 text-white" />
            <div className="flex gap-2 justify-end">
              <Button className="bg-green-600 hover:bg-green-700" onClick={async () => {
                if (!isAdmin) { toast({ title: 'Admins only' }); return; }
                const mkRaw = String(addMake || '').trim();
                const mdRaw = String(addModel || '').trim();
                const tp = String(addType || '').trim();
                if (!mkRaw || !mdRaw || !tp) { toast({ title: 'Make, Model, and Type required' }); return; }
                const cap = (s: string) => (s ? (s.slice(0,1).toUpperCase() + s.slice(1).toLowerCase()) : s);
                const mk = cap(mkRaw);
                const md = cap(mdRaw);
                const ys = String(addYearStart || '').trim();
                const ye = String(addYearEnd || '').trim();
                const payload: any = {
                  make: mk,
                  model: md,
                  year_start: ys ? Number(ys) : null,
                  year_end: ye ? Number(ye) : null,
                  type_category: tp as any,
                  is_luxury: Boolean(addLuxury),
                  notes: String(addNotes || '')
                };
                try {
                  const { error } = await supabase.from('vehicle_classification').insert(payload);
                  if (error) throw error;
                  await refreshRows();
                  setAddOpen(false);
                  setAddMake(''); setAddModel(''); setAddYearStart(''); setAddYearEnd(''); setAddType('Mid-Size / SUV'); setAddLuxury(false); setAddNotes('');
                  toast({ title: 'Vehicle added' });
                   if (DEBUG_VC) console.log('[VehicleClassification] modal save inserted');
                } catch (e: any) {
                  try {
                    const item = { ...payload, id: `local_${Date.now()}` };
                    const qLf = (await localforage.getItem<any[]>(QUEUE_KEY)) || [];
                    const qLs = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
                    const next = [...qLf, ...qLs, item];
                    await localforage.setItem(QUEUE_KEY, next);
                    localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
                    setRows(prev => [...prev, item]);
                    setAddOpen(false);
                    setAddMake(''); setAddModel(''); setAddYearStart(''); setAddYearEnd(''); setAddType('Mid-Size / SUV'); setAddLuxury(false); setAddNotes('');
                    toast({ title: 'Saved locally', description: 'Will sync when server available.' });
                     if (DEBUG_VC) console.log('[VehicleClassification] modal save queued');
                  } catch {
                    toast({ title: 'Save failed', description: String(e?.message || e) });
                  }
                }
              }}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Preview (first 10 rows)</DialogTitle>
          </DialogHeader>
          <div className="max-h-[40vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>make</TableHead>
                  <TableHead>model</TableHead>
                  <TableHead>year_start</TableHead>
                  <TableHead>year_end</TableHead>
                  <TableHead>type_category</TableHead>
                  <TableHead>is_luxury</TableHead>
                  <TableHead>notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importPreview.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.make}</TableCell>
                    <TableCell>{r.model}</TableCell>
                    <TableCell>{r.year_start ?? ''}</TableCell>
                    <TableCell>{r.year_end ?? ''}</TableCell>
                    <TableCell>{r.type_category}</TableCell>
                    <TableCell>{r.is_luxury ? 'true' : 'false'}</TableCell>
                    <TableCell>{r.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setImportOpen(false); setImportPreview([]); setImportRows([]); }}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={confirmImport}>Confirm Import</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
