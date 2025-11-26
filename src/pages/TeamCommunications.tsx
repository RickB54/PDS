import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import localforage from "localforage";
import { getCurrentUser } from "@/lib/auth";
import { pushAdminAlert } from "@/lib/adminAlerts";
import { pushEmployeeNotification } from "@/lib/employeeNotifications";

export default function TeamCommunications() {
  const user = getCurrentUser();
  const [employees, setEmployees] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<{ id: string; author: string; text: string; at: string; parentId?: string; to?: string }[]>([]);
  const [newChatText, setNewChatText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = (await localforage.getItem('task_chat')) || [];
        setChatMessages(Array.isArray(list) ? list : []);
      } catch { setChatMessages([]); }
      try {
        const emps = (await localforage.getItem('company-employees')) || [];
        setEmployees(Array.isArray(emps) ? emps as any[] : []);
      } catch { setEmployees([]); }
    })();
    const onStorage = async (e: StorageEvent) => {
      if (e.key === 'task_chat') {
        try {
          const list = (await localforage.getItem('task_chat')) || [];
          setChatMessages(Array.isArray(list) ? list : []);
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold">Team Communications</h1>
      <Card className="p-4">
        <div className="space-y-3">
          {chatMessages.filter(m => !m.parentId).map(m => (
            <div key={m.id} className="border border-zinc-800 rounded p-2">
              <div className="text-xs text-muted-foreground">{new Date(m.at).toLocaleString()} • {m.author}</div>
              <div className="text-sm">{m.text}</div>
              <div className="mt-2 space-y-1">
                {chatMessages.filter(r => r.parentId === m.id).map(r => (
                  <div key={r.id} className="ml-3 text-xs text-zinc-300">{new Date(r.at).toLocaleString()} • {r.author}: {r.text}</div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Input placeholder={`Reply to ${m.author}`} value={replyToId === m.id ? replyText : ""} onChange={(e)=>{ setReplyToId(m.id); setReplyText(e.target.value); }} />
                <Button variant="secondary" onClick={async ()=>{
                  const text = replyText.trim(); if (!text) return;
                  const msg = { id: `msg_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, author: String(user?.name || user?.email || 'Admin'), text, at: new Date().toISOString(), parentId: m.id, to: m.author };
                  const next = [...chatMessages, msg];
                  setChatMessages(next);
                  setReplyText(""); setReplyToId(null);
                  try { await localforage.setItem('task_chat', next); } catch {}
                  try {
                    const target = (employees || []).find(e => String(e.name || e.email || '').trim().toLowerCase() === String(m.author).trim().toLowerCase());
                    const key = String(target?.email || target?.name || m.author);
                    pushEmployeeNotification(key, `Reply from ${String(user?.name || 'Admin')}`, { text });
                  } catch {}
                }}>Send Reply</Button>
                <Button variant="outline" className="border-red-700 text-red-700 hover:bg-red-700/10" onClick={async ()=>{
                  const next = chatMessages.filter(x => x.id !== m.id && x.parentId !== m.id);
                  setChatMessages(next);
                  try { await localforage.setItem('task_chat', next); } catch {}
                }}>Delete</Button>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <Input placeholder="Type a message to the team" value={newChatText} onChange={(e)=>setNewChatText(e.target.value)} />
            <Button variant="secondary" onClick={async ()=>{
              const text = newChatText.trim(); if (!text) return;
              const msg = { id: `msg_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, author: String(user?.name || user?.email || 'User'), text, at: new Date().toISOString() };
              const next = [...chatMessages, msg];
              setChatMessages(next);
              setNewChatText('');
              try { await localforage.setItem('task_chat', next); } catch {}
              try { pushAdminAlert('todo_chat' as any, `New team message`, String(user?.email || user?.name || 'user'), { text, messageId: msg.id }); } catch {}
              try {
                (employees || []).forEach(e => {
                  const key = String(e.email || e.name || '').trim();
                  if (key && key !== String(user?.email || user?.name || '')) pushEmployeeNotification(key, `Team Message from ${String(user?.name || 'User')}`, { text });
                });
              } catch {}
            }}>Send</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
