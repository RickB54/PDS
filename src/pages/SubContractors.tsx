import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentUser, isSupabaseEnabled } from "@/lib/auth";
import { servicePackages, addOns, getServicePrice, getAddOnPrice } from "@/lib/services";
import { useSearchParams } from "react-router-dom";
import supabase from "@/lib/supabase";
import api from "@/lib/api";
import { savePDFToArchive } from "@/lib/pdfArchive";
import jsPDF from "jspdf";

type Contractor = {
  id: string;
  created_at?: string;
  full_name: string;
  business_name: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  services: string;
  notes?: string;
  rating?: number;
  availability?: string;
};

type Vendor = {
  id: string;
  created_at?: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  category?: string;
  notes?: string;
  rating?: number;
};

const SERVICE_TYPES = [
  "Auto Detailing",
  "Paint Correction",
  "Ceramic Coating",
  "Interior Shampoo",
  "Headlight Restoration",
  "Mobile Detailing",
];

export default function SubContractors() {
  const user = getCurrentUser();
  const canEdit = user?.role === 'admin';
  const [params] = useSearchParams();
  const [list, setList] = useState<Contractor[]>([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Contractor | null>(null);
  const [searchQ, setSearchQ] = useState('');
  const [areaQ, setAreaQ] = useState('Methuen, MA 01844');
  const [importResults, setImportResults] = useState<any[]>([]);
  const [importSelected, setImportSelected] = useState<Record<string, boolean>>({});
  const [tableSelected, setTableSelected] = useState<Record<string, boolean>>({});
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoCompany, setInfoCompany] = useState<any | null>(null);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [vehicleType, setVehicleType] = useState<'compact'|'midsize'|'truck'|'luxury'>('compact');
  const [vendorsOpen, setVendorsOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorArea, setVendorArea] = useState('Methuen, MA 01844');
  const [vendorEditOpen, setVendorEditOpen] = useState(false);
  const [vendorEditing, setVendorEditing] = useState<Vendor | null>(null);
  const [vendorResults, setVendorResults] = useState<any[]>([]);
  const [vendorSelected, setVendorSelected] = useState<Record<string, boolean>>({});

  const loadList = async () => {
    try { const res = await api('/api/sub-contractors', { method: 'GET' }); setList(Array.isArray(res) ? res as any : []); } catch { setList([]); }
  };

  useEffect(() => { loadList(); }, []);

  useEffect(() => {
    const v = params.get('vendors');
    if (v && v !== '0') setVendorsOpen(true);
  }, [params]);

  const loadVendors = async () => {
    try {
      const res = await api('/api/vendors', { method: 'GET' });
      setVendors(Array.isArray(res) ? res as any : []);
    } catch { setVendors([]); }
  };

  useEffect(() => { if (vendorsOpen) loadVendors(); }, [vendorsOpen]);

  const filteredVendors = useMemo(() => {
    const q = vendorSearch.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter(v => (`${v.name} ${v.contact} ${v.city} ${v.state} ${v.zip} ${v.category}`).toLowerCase().includes(q));
  }, [vendors, vendorSearch]);

  const onVendorEdit = (v?: Vendor) => {
    setVendorEditing(v ? { ...v } : { id: '', name: '', contact: '', phone: '', email: '', website: '', address: '', city: '', state: '', zip: '', category: 'Supplies', notes: '', rating: 0 });
    setVendorEditOpen(true);
  };

  const saveVendor = async () => {
    if (!vendorEditing) return;
    const payload = { ...vendorEditing };
    try {
      if (payload.id) {
        await api(`/api/vendors/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        const res = await api('/api/vendors', { method: 'POST', body: JSON.stringify(payload) });
        const rec = (res && typeof res === 'object' && (res as any).record) ? (res as any).record : null;
        if (rec) payload.id = rec.id;
      }
      setVendorEditOpen(false);
      await loadVendors();
    } catch {}
  };

  const deleteVendor = async (id: string) => {
    if (!confirm('Delete this vendor?')) return;
    try { await api(`/api/vendors/${id}`, { method: 'DELETE' }); await loadVendors(); } catch {}
  };

  const runVendorAreaSearch = async () => {
    try {
      const res = await api(`/api/vendors/search?area=${encodeURIComponent(vendorArea)}&limit=10`, { method: 'GET' });
      const arr = Array.isArray(res) ? res : [];
      setVendorResults(arr);
      setVendorSelected({});
    } catch { setVendorResults([]); setVendorSelected({}); }
  };

  const onEdit = (c?: Contractor) => { setEditing(c ? { ...c } : {
    id: '', full_name:'', business_name:'', phone:'', email:'', website:'', address:'', city:'', state:'', zip:'', services:'Auto Detailing', notes:'', rating:0, availability:''
  }); setOpenEdit(true); };

  const saveEdit = async () => {
    if (!editing) return;
    const payload = { ...editing };
    try {
      if (payload.id) {
        await api(`/api/sub-contractors/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        const res = await api('/api/sub-contractors', { method: 'POST', body: JSON.stringify(payload) });
        const rec = (res && typeof res === 'object' && (res as any).record) ? (res as any).record : null;
        if (rec) payload.id = rec.id;
      }
      setOpenEdit(false); await loadList();
    } catch {}
  };

  const deleteRow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contractor?')) return;
    try { await api(`/api/sub-contractors/${id}`, { method: 'DELETE' }); await loadList(); } catch {}
  };

  const filtered = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return list;
    return list.filter(c => (`${c.business_name} ${c.full_name} ${c.city} ${c.state} ${c.zip}`).toLowerCase().includes(q));
  }, [list, searchQ]);

  const runAreaSearch = async () => {
    try {
      const res = await api(`/api/sub-contractors/search?area=${encodeURIComponent(areaQ)}&limit=10`, { method: 'GET' });
      const arr = Array.isArray(res) ? res : [];
      setImportResults(arr);
      setImportSelected({});
    } catch { setImportResults([]); setImportSelected({}); }
  };

  const importSelectedRows = async () => {
    const picks = importResults.filter((r:any) => importSelected[`${r.full_name}-${r.business_name}-${r.phone}`]);
    for (const r of picks) {
      const payload: Partial<Contractor> = {
        full_name: String(r.full_name || ''),
        business_name: String(r.business_name || r.full_name || ''),
        phone: String(r.phone || ''),
        email: String(r.email || ''),
        website: String(r.website || ''),
        address: String(r.address || ''),
        city: String(r.city || ''),
        state: String(r.state || ''),
        zip: String(r.zip || ''),
        services: 'Auto Detailing',
        notes: '',
        rating: Number(r.rating || 0),
        availability: '',
      };
      try {
        if (isSupabaseEnabled()) {
          const { error } = await supabase.from('sub_contractors' as any).insert([{ ...payload }]);
          if (error) throw error;
        } else {
          await api('/api/sub-contractors', { method: 'POST', body: JSON.stringify(payload) });
        }
      } catch {}
    }
    await loadList();
    setImportResults([]);
    setImportSelected({});
  };

  const exportSelected = async () => {
    const picksTable = filtered.filter((c:any) => tableSelected[c.id]);
    const picksImport = importResults.filter((r:any) => importSelected[`${r.full_name}-${r.business_name}-${r.phone}`]);
    const toExport = (picksTable.length ? picksTable : ((picksImport.length ? picksImport : importResults.length ? importResults : filtered)));
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Sub-Contractors', 105, 20, { align: 'center' });
    doc.setFontSize(11);
    let y = 32;
    if (!toExport || toExport.length === 0) {
      doc.text('No data to export', 20, y);
    } else {
      toExport.forEach((c:any, idx:number) => {
        const name = `${String(c.full_name||'').trim()} — ${String(c.business_name||'').trim()}`.trim();
        const phoneEmail = `${String(c.phone||'')} • ${String(c.email||'')}`.trim();
        const addr = `${String(c.address||'')}, ${String(c.city||'')}, ${String(c.state||'')} ${String(c.zip||'')}`.trim();
        const web = `Website: ${String(c.website||'')}`.trim();
        const svc = `Service: ${String(c.services||'')} • Rating: ${String(c.rating||0)}`.trim();
        doc.text(name, 20, y); y+=6;
        doc.text(phoneEmail, 20, y); y+=6;
        doc.text(addr, 20, y); y+=6;
        doc.text(web, 20, y); y+=6;
        doc.text(svc, 20, y); y+=8;
        if (y > 270 && idx < toExport.length-1) { doc.addPage(); y = 20; }
      });
    }
    const pdf = doc.output('dataurlstring');
    const fileName = `sub-contractors-${Date.now()}.pdf`;
    savePDFToArchive('Sub Contractors' as any, 'Company', `sub-contractors-${Date.now()}`, pdf, { fileName, path: 'Sub Contractors/' });
    alert('Exported PDF saved to File Manager → Sub Contractors');
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Sub‑Contractors</h1>
      <Card className="p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Input placeholder="Search" value={searchQ} onChange={(e)=>setSearchQ(e.target.value)} className="w-64" />
            {canEdit && (<Button className="bg-blue-600 hover:bg-blue-700" onClick={()=>onEdit()}>Add Contractor</Button>)}
          </div>
          <div className="flex gap-2 items-center">
            <Input placeholder="City, State or ZIP" value={areaQ} onChange={(e)=>setAreaQ(e.target.value)} className="w-64" />
            <Button variant="outline" onClick={runAreaSearch}>Search Contractors in This Area</Button>
            <Button variant="outline" onClick={exportSelected}>Export to PDF</Button>
            <Button variant="outline" onClick={()=>setVendorsOpen(true)}>Detailing Vendors</Button>
          </div>
        </div>
        <div className="mt-3 w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Select</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Contact Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Zip Code</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <input type="checkbox" checked={!!tableSelected[c.id]} onChange={(e)=> setTableSelected(prev => ({ ...prev, [c.id]: e.target.checked }))} />
                  </TableCell>
                  <TableCell>{c.business_name}</TableCell>
                  <TableCell>{c.full_name}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.address}</TableCell>
                  <TableCell>{c.city}</TableCell>
                  <TableCell>{c.state}</TableCell>
                  <TableCell>{c.zip}</TableCell>
                  <TableCell>{c.services}</TableCell>
                  <TableCell>
                    {canEdit ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={()=>onEdit(c)}>Edit</Button>
                        <Button size="sm" variant="outline" className="border-red-700 text-red-700 hover:bg-red-700/10" onClick={()=>deleteRow(c.id)}>Delete</Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">View only</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-muted-foreground">No subcontractors</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {importResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="font-semibold">Search Results — {areaQ}</div>
            <div className="max-h-40 overflow-auto space-y-2">
              {importResults.map((r:any, i:number) => {
                const key = `${r.full_name}-${r.business_name}-${r.phone}`;
                return (
                  <div key={i} className="flex items-center justify-between p-2 rounded border border-zinc-800">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={!!importSelected[key]} onChange={(e)=> setImportSelected(prev => ({ ...prev, [key]: e.target.checked }))} />
                      <span className="text-sm">
                        {r.full_name} — 
                        <button type="button" className="text-blue-400 underline hover:text-blue-300"
                          onClick={() => { setInfoCompany(r); setInfoOpen(true); }}>
                          {r.business_name}
                        </button>
                      </span>
                    </label>
                    <div className="text-xs text-zinc-300">
                      {r.phone} • {r.website ? (
                        <a href={(String(r.website).startsWith('http') ? r.website : `https://${r.website}`)} target="_blank" rel="noreferrer" className="text-blue-400 underline">{r.website}</a>
                      ) : '—'} • {r.address}, {r.city}, {r.state} {r.zip}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end">
              {canEdit && (<Button className="bg-blue-600 hover:bg-blue-700" onClick={importSelectedRows}>Import</Button>)}
            </div>
          </div>
        )}
      </Card>

      {/* Company Services & Pricing Modal */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{infoCompany?.business_name || 'Company Info'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Contact:</span> {infoCompany?.full_name || ''} • {infoCompany?.phone || ''} • {infoCompany?.email || ''}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Website:</span> {infoCompany?.website ? (
                <a href={(String(infoCompany.website).startsWith('http') ? infoCompany.website : `https://${infoCompany.website}`)} target="_blank" rel="noreferrer" className="text-blue-400 underline">{infoCompany.website}</a>
              ) : '—'}
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Services</div>
              <ul className="list-disc pl-5 text-sm">
                {SERVICE_TYPES.map((s) => (<li key={s}>{s}</li>))}
              </ul>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setPricingOpen(true)}>View Pricing</Button>
              <Button variant="outline" onClick={() => { if (infoCompany?.website) window.open(String(infoCompany.website).startsWith('http') ? infoCompany.website : `https://${infoCompany.website}`, '_blank'); }}>Open Website</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={vendorsOpen} onOpenChange={setVendorsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detailing Vendors</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2 items-center">
                <Input placeholder="Search" value={vendorSearch} onChange={(e)=>setVendorSearch(e.target.value)} className="w-64" />
                {canEdit && (<Button className="bg-blue-600 hover:bg-blue-700" onClick={()=>onVendorEdit()}>Add Vendor</Button>)}
              </div>
              <div className="flex gap-2 items-center">
                <Input placeholder="City, State or ZIP" value={vendorArea} onChange={(e)=>setVendorArea(e.target.value)} className="w-64" />
                <Button variant="outline" onClick={runVendorAreaSearch}>Search Vendors in This Area</Button>
              </div>
            </div>

            {/* Saved Vendors Table */}
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Zip</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.name}</TableCell>
                      <TableCell>{v.contact || '—'}</TableCell>
                      <TableCell>{v.phone || '—'}</TableCell>
                      <TableCell>{v.email || '—'}</TableCell>
                      <TableCell>{v.website ? (<a href={(String(v.website).startsWith('http') ? v.website : `https://${v.website}`)} target="_blank" rel="noreferrer" className="text-blue-400 underline">{v.website}</a>) : '—'}</TableCell>
                      <TableCell>{v.city || '—'}</TableCell>
                      <TableCell>{v.state || '—'}</TableCell>
                      <TableCell>{v.zip || '—'}</TableCell>
                      <TableCell>{v.category || '—'}</TableCell>
                      <TableCell>
                        {canEdit ? (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={()=>onVendorEdit(v)}>Edit</Button>
                            <Button size="sm" variant="outline" className="border-red-700 text-red-700 hover:bg-red-700/10" onClick={()=>deleteVendor(v.id)}>Delete</Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">View only</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredVendors.length === 0 && (
                    <TableRow><TableCell colSpan={10} className="text-muted-foreground">No vendors</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Area Search Results — mirror Sub‑Contractors style */}
            {vendorResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="font-semibold">Search Results — {vendorArea}</div>
                <div className="max-h-40 overflow-auto space-y-2">
                  {vendorResults.map((r:any, i:number) => {
                    const key = `${r.name}-${r.contact}-${r.phone}`;
                    return (
                      <div key={i} className="flex items-center justify-between p-2 rounded border border-zinc-800">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={!!vendorSelected[key]} onChange={(e)=> setVendorSelected(prev => ({ ...prev, [key]: e.target.checked }))} />
                          <span className="text-sm">
                            {r.name} — 
                            {r.website ? (
                              <a href={(String(r.website).startsWith('http') ? r.website : `https://${r.website}`)} target="_blank" rel="noreferrer" className="text-blue-400 underline">{r.website}</a>
                            ) : '—'}
                          </span>
                        </label>
                        <div className="text-xs text-zinc-300">
                          {r.phone || '—'} • {r.address || '—'}, {r.city || '—'}, {r.state || '—'} {r.zip || '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={vendorEditOpen} onOpenChange={setVendorEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{vendorEditing?.id ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
          </DialogHeader>
          {vendorEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Vendor Name" value={vendorEditing.name} onChange={(e)=>setVendorEditing({ ...(vendorEditing as any), name: e.target.value })} />
              <Input placeholder="Contact Name" value={vendorEditing.contact || ''} onChange={(e)=>setVendorEditing({ ...(vendorEditing as any), contact: e.target.value })} />
              <Input placeholder="Phone" value={vendorEditing.phone || ''} onChange={(e)=>setVendorEditing({ ...(vendorEditing as any), phone: e.target.value })} />
              <Input placeholder="Email" value={vendorEditing.email || ''} onChange={(e)=>setVendorEditing({ ...(vendorEditing as any), email: e.target.value })} />
              <Input placeholder="Website" value={vendorEditing.website || ''} onChange={(e)=>setVendorEditing({ ...(vendorEditing as any), website: e.target.value })} />
              <Input placeholder="Street Address" value={vendorEditing.address || ''} onChange={(e)=>setVendorEditing({ ...(vendorEditing as any), address: e.target.value })} />
              <Input placeholder="City" value={vendorEditing.city || ''} onChange={(e)=>setVendorEditing({ ...(vendorEditing as any), city: e.target.value })} />
              <Input placeholder="State" value={vendorEditing.state || ''} onChange={(e)=>setVendorEditing({ ...(vendorEditing as any), state: e.target.value })} />
              <Input placeholder="Zip Code" value={vendorEditing.zip || ''} onChange={(e)=>setVendorEditing({ ...(vendorEditing as any), zip: e.target.value })} />
              <Select value={vendorEditing.category || 'Supplies'} onValueChange={(v)=>setVendorEditing({ ...(vendorEditing as any), category: v })}>
                <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {['Chemicals','Materials','Equipment','Tools','Supplies'].map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
              <Input placeholder="Notes" value={vendorEditing.notes || ''} onChange={(e)=>setVendorEditing({ ...(vendorEditing as any), notes: e.target.value })} />
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button variant="outline" onClick={()=>setVendorEditOpen(false)}>Cancel</Button>
                {canEdit && (<Button className="bg-blue-600 hover:bg-blue-700" onClick={saveVendor}>Save</Button>)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pricing Modal */}
      <Dialog open={pricingOpen} onOpenChange={setPricingOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Services & Add‑Ons Pricing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Vehicle Type:</span>
              <Select value={vehicleType} onValueChange={(v)=>setVehicleType(v as any)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="midsize">Midsize</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-sm font-semibold mb-2">Packages</div>
              <div className="space-y-2">
                {servicePackages.map((p:any) => (
                  <div key={p.id} className="border border-zinc-800 rounded p-2">
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.description}</div>
                    <div className="text-xs mt-1">Price: ${getServicePrice(p.id, vehicleType)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-2">Add‑Ons</div>
              <div className="space-y-2">
                {addOns.map((a:any) => (
                  <div key={a.id} className="border border-zinc-800 rounded p-2">
                    <div className="text-sm font-medium">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.description || '—'}</div>
                    <div className="text-xs mt-1">Price: ${getAddOnPrice(a.id, vehicleType)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={()=>setPricingOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit Sub‑Contractor' : 'Add Sub‑Contractor'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Company Name" value={editing.business_name} onChange={(e)=>setEditing({ ...(editing as any), business_name: e.target.value })} />
              <Input placeholder="Contact Name" value={editing.full_name} onChange={(e)=>setEditing({ ...(editing as any), full_name: e.target.value })} />
              <Input placeholder="Phone" value={editing.phone} onChange={(e)=>setEditing({ ...(editing as any), phone: e.target.value })} />
              <Input placeholder="Email" value={editing.email} onChange={(e)=>setEditing({ ...(editing as any), email: e.target.value })} />
              <Input placeholder="Street Address" value={editing.address} onChange={(e)=>setEditing({ ...(editing as any), address: e.target.value })} />
              <Input placeholder="City" value={editing.city} onChange={(e)=>setEditing({ ...(editing as any), city: e.target.value })} />
              <Input placeholder="State" value={editing.state} onChange={(e)=>setEditing({ ...(editing as any), state: e.target.value })} />
              <Input placeholder="Zip Code" value={editing.zip} onChange={(e)=>setEditing({ ...(editing as any), zip: e.target.value })} />
              <Select value={editing.services} onValueChange={(v)=>setEditing({ ...(editing as any), services: v })}>
                <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Service Type" /></SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
              <Input placeholder="Website" value={editing.website || ''} onChange={(e)=>setEditing({ ...(editing as any), website: e.target.value })} />
              <Input placeholder="Notes" value={editing.notes || ''} onChange={(e)=>setEditing({ ...(editing as any), notes: e.target.value })} />
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button variant="outline" onClick={()=>setOpenEdit(false)}>Cancel</Button>
                {canEdit && (<Button className="bg-blue-600 hover:bg-blue-700" onClick={saveEdit}>Save</Button>)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
