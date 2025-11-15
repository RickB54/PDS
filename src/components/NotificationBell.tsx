import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAlertsStore } from "@/store/alerts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NotificationBell() {
  const { alerts, latest, unreadCount, markAllRead, markRead, dismissAll, refresh } = useAlertsStore();
  const [ring, setRing] = useState(false);
  const prevUnreadRef = useRef(unreadCount);
  const location = useLocation();
  const isFileManagerView = location.pathname.startsWith('/file-manager');

  useEffect(() => {
    if (isFileManagerView) {
      // Suppress ring when viewing File Manager
      setRing(false);
      prevUnreadRef.current = unreadCount;
      return;
    }
    if (unreadCount > prevUnreadRef.current) {
      setRing(true);
      // Tiny sound via WebAudio
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine"; o.frequency.value = 880;
        g.gain.value = 0.02;
        o.connect(g); g.connect(ctx.destination);
        o.start(); setTimeout(() => { o.stop(); ctx.close(); }, 180);
      } catch {}
      setTimeout(() => setRing(false), 600);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, isFileManagerView]);

  // Keep dropdown in sync when alerts change in localStorage across tabs/actions
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'admin_alerts') {
        try { refresh(); } catch {}
      }
    };
    const onLocal = (e: Event) => { try { refresh(); } catch {} };
    window.addEventListener('storage', onStorage);
    window.addEventListener('admin_alerts_updated', onLocal as EventListener);
    try { refresh(); } catch {}
    return () => { 
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('admin_alerts_updated', onLocal as EventListener);
    };
  }, [refresh]);

  const items = useMemo(() => [...latest].reverse().slice(0, 10), [latest]);
  // Compute important unread using full AdminAlert objects, not mapped UI items
  const importantUnreadActual = useMemo(
    () => alerts.filter(a => !a.read && (a.type === 'exam_reminder' || a.type === 'admin_message')).length,
    [alerts]
  );
  const importantUnread = isFileManagerView ? 0 : importantUnreadActual;
  const displayUnreadCount = isFileManagerView ? 0 : unreadCount;
  const bellColorClass = importantUnread > 0 ? "text-yellow-400" : (displayUnreadCount > 0 ? "text-white" : "text-red-500");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className={`h-5 w-5 ${bellColorClass} ${ring ? 'animate-bounce' : ''}`} />
          {/* Show badge for important alerts; otherwise show unread count subtly */}
          {importantUnread > 0 ? (
            <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-black">{importantUnread}</Badge>
          ) : (
            <Badge className="absolute -top-1 -right-1 bg-zinc-700 text-white">{displayUnreadCount}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2 text-sm font-semibold">Alerts</div>
        {items.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">No alerts</div>
        ) : (
          items.map(a => (
            <DropdownMenuItem key={a.id} className="flex items-center justify-between">
              <div className="text-sm">{a.title}</div>
              <a href={a.href} className="text-xs text-blue-600 hover:underline" onClick={() => markRead(a.id)}>Open</a>
              <button className="text-xs text-muted-foreground hover:text-red-600" onClick={() => { try { useAlertsStore.getState().dismiss(a.id); } catch {} }}>Dismiss</button>
            </DropdownMenuItem>
          ))
        )}
        <div className="px-3 py-2">
          <Button variant="outline" size="sm" onClick={dismissAll} className="w-full">Dismiss all</Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
