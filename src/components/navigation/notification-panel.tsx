import { useNavigate } from "@tanstack/react-router";
import { Bell, Bot, GitBranch, Layers, Plug, Server, CheckCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppStore } from "@/stores/app-store";
import type { NotificationCategory } from "@/types";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useState } from "react";

const icons: Record<NotificationCategory, typeof Bot> = { claude: Bot, git: GitBranch, workspace: Layers, integrations: Plug, system: Server };

export function NotificationPanel() {
  const items = useAppStore((s) => s.notifications);
  const patch = useAppStore((s) => s.patch);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const unread = items.filter((n) => !n.read).length;
  const markRead = (id: string) => patch((d) => ({ notifications: d.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button aria-label={`Notifications, ${unread} unread`} className="relative grid size-9 place-items-center rounded-full border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground">
          <Bell className="size-4" />
          {unread > 0 && <span className="absolute top-1.5 right-2 size-2 rounded-full bg-primary ring-2 ring-card" />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] rounded-[18px] p-0 shadow-pop">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div><p className="text-[14px] font-semibold">Notifications</p><p className="text-[11px] text-muted-foreground">Simulated demo notifications</p></div>
          <button disabled={!unread} onClick={() => patch((d) => ({ notifications: d.notifications.map((n) => ({ ...n, read: true })) }))} className="inline-flex items-center gap-1 text-[12px] font-medium text-primary disabled:opacity-40">
            <CheckCheck className="size-3.5" /> Mark all as read
          </button>
        </div>
        <div className="max-h-[420px] overflow-y-auto p-1.5">
          {items.length === 0 && <p className="py-10 text-center text-[13px] text-muted-foreground">You're all caught up.</p>}
          {items.map((n) => {
            const I = icons[n.category];
            return (
              <div key={n.id} className={cn("group flex gap-3 rounded-xl p-2.5 hover:bg-accent", !n.read && "bg-primary-subtle/50")}>
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary"><I className="size-4 text-muted-foreground" /></div>
                <button className="min-w-0 flex-1 text-left" onClick={() => { markRead(n.id); setOpen(false); if (n.workspaceId) navigate({ to: "/workspaces/$workspaceId", params: { workspaceId: n.workspaceId } }); }}>
                  <p className="text-[13px] font-medium">{n.title}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{n.body}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 capitalize">{n.category} · {timeAgo(n.at)}</p>
                </button>
                {!n.read && <button onClick={() => markRead(n.id)} aria-label="Mark as read" className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
