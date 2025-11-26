import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentUser } from "@/lib/auth";
import api from "@/lib/api";
import jsPDF from "jspdf";
import { savePDFToArchive } from "@/lib/pdfArchive";

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

export default function Vendors() {
  const user = getCurrentUser();
  const canEdit = user?.role === 'admin';
  const [list, setList] = useState<Vendor[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [areaQ, setAreaQ] = useState('Methuen, MA 01844');
  const [tableSelected, setTableSelected] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<any[]>([]);
  const [importSelected, setImportSelected] = useState<Record<string, boolean>>({});
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);

  const loadList = async () => {
    try { const res = await api('/api/vendors', { method: 'GET' }); setList(Array.isArray(res) ? res as any : []); } catch { setList([]); }
  };

  useEffect(() => { loadList(); }, []);

  const filtered = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return list;
    return list.filter(c => (`${c.name} ${c.contact} ${c.city} ${c.state} ${c.zip} ${c.category}`).toLowerCase().includes(q));
  }, [list, searchQ]);

  const runAreaSearch = async () => {
    try {
      const res = await api(`/api/vendors/search?area=${encodeURIComponent(areaQ)}&limit=10`, { method: 'GET' });
      const arr = Array.isArray(res) ? res : [];
      setResults(arr);
      setImportSelected({});
    } catch { setResults([]); setImportSelected({}); }
  };

  const onEdit = (v?: Vendor) => {
    setEditing(v ? { ...v } : { id: '', name:'', contact:'', phone:'', email:'', website:'', address:'', city:'', state:'', zip:'', category:'Supplies', notes:'', rating:0 });
    setOpenEdit(true);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const payload = { ...editing };
    try {
      if (payload.id) {
        await api(`/api/vendors/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        const res = await api('/api/vendors', { method: 'POST', body: JSON.stringify(payload) });
        const rec = (res && typeof res === 'object' && (res as any).record) ? (res as any).record : null;
        if (rec) payload.id = rec.id;
      }
      setOpenEdit(false);
      await loadList();
    } catch {}
  };

  const deleteRow = async (id: string) => {
    if (!confirm('Delete this vendor?')) return;
    try { await api(`/api/vendors/${id}`, { method: 'DELETE' }); await loadList(); } catch {}
  };

  const importSelectedRows = async () => {
    const picks = results.filter((r:any) => importSelected[`${r.name}-${r.contact}-${r.phone}`]);
    for (const r of picks) {
      const payload: Partial<Vendor> = {
        name: String(r.name || ''),
        contact: String(r.contact || ''),
        phone: String(r.phone || ''),
        email: String(r.email || ''),
        website: String(r.website || ''),
        address: String(r.address || ''),
        city: String(r.city || ''),
        state: String(r.state || ''),
        zip: String(r.zip || ''),
        category: String(r.category || 'Supplies'),
        notes: '',
        rating: Number(r.rating || 0),
      };
      try { await api('/api/vendors', { method: 'POST', body: JSON.stringify(payload) }); } catch {}
    }
    await loadList();
    setResults([]);
    setImportSelected({});
  };

  const exportSelected = async () => {
    const picksTable = filtered.filter((c:any) => tableSelected[c.id]);
    const picksImport = results.filter((r:any) => importSelected[`${r.name}-${r.contact}-${r.phone}`]);
    const toExport = (picksTable.length ? picksTable : ((picksImport.length ? picksImport : results.length ? results : filtered)));
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Detailing Vendors', 105, 20, { align: 'center' } as any);
    doc.setFontSize(11);
    let y = 32;
    if (!toExport || toExport.length === 0) { doc.text('No data to export', 20, y); }
    else {
      toExport.forEach((c:any, idx:number) => {
        const name = `${String(c.name||'').trim()}`.trim();
        const phoneEmail = `${String(c.phone||'')} • ${String(c.email||'')}`.trim();
        const addr = `${String(c.address||'')}, ${String(c.city||'')}, ${String(c.state||'')} ${String(c.zip||'')}`.trim();
        const web = `Website: ${String(c.website||'')}`.trim();
        const cat = `Category: ${String(c.category||'')}`.trim();
        doc.text(name, 20, y); y+=6;
        doc.text(phoneEmail, 20, y); y+=6;
        doc.text(addr, 20, y); y+=6;
        doc.text(web, 20, y); y+=6;
        doc.text(cat, 20, y); y+=8;
        if (y > 270 && idx < toExport.length-1) { doc.addPage(); y = 20; }
      });
    }
    const pdf = doc.output('dataurlstring');
    const fileName = `vendors-${Date.now()}.pdf`;
    savePDFToArchive('Inventory' as any, 'Admin Updates', `vendors-${Date.now()}`, pdf, { fileName, path: 'Admin Updates/' });
    alert('Exported PDF saved to File Manager → Admin Updates');
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Detailing Vendors</h1>
      <Card className="p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Input placeholder="Search" value={searchQ} onChange={(e)=>setSearchQ(e.target.value)} className="w-64" />
            {canEdit && (<Button className="bg-blue-600 hover:bg-blue-700" onClick={()=>onEdit()}>Add Vendor</Button>)}
          </div>
          <div className="flex gap-2 items-center">
            <Input placeholder="City, State or ZIP" value={areaQ} onChange={(e)=>setAreaQ(e.target.value)} className="w-64" />
            <Button variant="outline" onClick={runAreaSearch}>Search Vendors in This Area</Button>
            <Button variant="outline" onClick={exportSelected}>Export to PDF</Button>
          </div>
        </div>
        <div className="mt-3 w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Select</TableHead>
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
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <input type="checkbox" checked={!!tableSelected[c.id]} onChange={(e)=> setTableSelected(prev => ({ ...prev, [c.id]: e.target.checked }))} />
                  </TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.contact || '—'}</TableCell>
                  <TableCell>{c.phone || '—'}</TableCell>
                  <TableCell>{c.email || '—'}</TableCell>
                  <TableCell>{c.website ? (
                    <a href={(String(c.website).startsWith('http') ? c.website : `https://${c.website}`)} target="_blank" rel="noreferrer" className="text-blue-400 underline">{c.website}</a>
                  ) : '—'}</TableCell>
                  <TableCell>{c.city || '—'}</TableCell>
                  <TableCell>{c.state || '—'}</TableCell>
                  <TableCell>{c.zip || '—'}</TableCell>
                  <TableCell>{c.category || '—'}</TableCell>
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
                <TableRow><TableCell colSpan={11} className="text-muted-foreground">No vendors</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {results.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="font-semibold">Search Results — {areaQ}</div>
            <div className="max-h-40 overflow-auto space-y-2">
              {results.map((r:any, i:number) => {
                const key = `${r.name}-${r.contact}-${r.phone}`;
                return (
                  <div key={i} className="flex items-center justify-between p-2 rounded border border-zinc-800">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={!!importSelected[key]} onChange={(e)=> setImportSelected(prev => ({ ...prev, [key]: e.target.checked }))} />
                      <span className="text-sm">
                        {r.name} — {r.website ? (
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
            <div className="flex justify-end">
              {canEdit && (<Button className="bg-blue-600 hover:bg-blue-700" onClick={importSelectedRows}>Import</Button>)}
            </div>
          </div>
        )}
      </Card>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Vendor Name" value={editing.name} onChange={(e)=>setEditing({ ...(editing as any), name: e.target.value })} />
              <Input placeholder="Contact Name" value={editing.contact || ''} onChange={(e)=>setEditing({ ...(editing as any), contact: e.target.value })} />
              <Input placeholder="Phone" value={editing.phone || ''} onChange={(e)=>setEditing({ ...(editing as any), phone: e.target.value })} />
              <Input placeholder="Email" value={editing.email || ''} onChange={(e)=>setEditing({ ...(editing as any), email: e.target.value })} />
              <Input placeholder="Website" value={editing.website || ''} onChange={(e)=>setEditing({ ...(editing as any), website: e.target.value })} />
              <Input placeholder="Street Address" value={editing.address || ''} onChange={(e)=>setEditing({ ...(editing as any), address: e.target.value })} />
              <Input placeholder="City" value={editing.city || ''} onChange={(e)=>setEditing({ ...(editing as any), city: e.target.value })} />
              <Input placeholder="State" value={editing.state || ''} onChange={(e)=>setEditing({ ...(editing as any), state: e.target.value })} />
              <Input placeholder="Zip Code" value={editing.zip || ''} onChange={(e)=>setEditing({ ...(editing as any), zip: e.target.value })} />
              <Select value={editing.category || 'Supplies'} onValueChange={(v)=>setEditing({ ...(editing as any), category: v })}>
                <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {['Chemicals','Materials','Equipment','Tools','Supplies'].map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
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

