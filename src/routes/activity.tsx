import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, EmptyState } from "@/components/shared/states";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { useAppStore } from "@/stores/app-store";
import { dayLabel } from "@/lib/format";
import type { ActivityEvent } from "@/types";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity · hello atzlan" },
      { name: "description", content: "A unified timeline across workspaces, Git and Claude." },
      { property: "og:title", content: "Activity · hello atzlan" },
      { property: "og:description", content: "A unified timeline across workspaces, Git and Claude." },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const { activity, projects, workspaces } = useAppStore();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [project, setProject] = useState("all");
  const [ws, setWs] = useState("all");
  const groups = useMemo(() => {
    const filtered = activity
      .filter((e) => (kind === "all" || e.kind === kind) && (project === "all" || e.projectId === project) && (ws === "all" || e.workspaceId === ws) && e.title.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.at.localeCompare(a.at));
    const m = new Map<string, ActivityEvent[]>();
    filtered.forEach((e) => { const k = dayLabel(e.at); m.set(k, [...(m.get(k) ?? []), e]); });
    return [...m.entries()];
  }, [activity, q, kind, project, ws]);
  const wsLabel = (id: string | null) => { const w = workspaces.find((x) => x.id === id); return w ? w.ticketId ?? w.name : null; };

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader glow title="Activity" subtitle="Everything that happened across your workspaces." />
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative w-full max-w-xs"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search activity" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search activity…" className="h-9 rounded-full pl-9" /></div>
        <Select value={kind} onValueChange={setKind}><SelectTrigger aria-label="Event type" className="h-9 w-36 rounded-full bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All types</SelectItem><SelectItem value="claude">Claude</SelectItem><SelectItem value="git">Git</SelectItem><SelectItem value="workspace">Workspace</SelectItem><SelectItem value="system">System</SelectItem></SelectContent></Select>
        <Select value={project} onValueChange={setProject}><SelectTrigger aria-label="Project" className="h-9 w-44 rounded-full bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All projects</SelectItem>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
        <Select value={ws} onValueChange={setWs}><SelectTrigger aria-label="Workspace" className="h-9 w-44 rounded-full bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All workspaces</SelectItem>{workspaces.map((w) => <SelectItem key={w.id} value={w.id}>{w.ticketId ?? w.name}</SelectItem>)}</SelectContent></Select>
      </div>
      {groups.length === 0 && <EmptyState title="No activity matches" />}
      <div className="space-y-5">
        {groups.map(([day, events]) => (
          <section key={day}>
            <h2 className="mb-2 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">{day}</h2>
            <div className="rounded-2xl border bg-card px-4 py-2 shadow-card">
              <ActivityTimeline events={events} renderMeta={(e) => wsLabel(e.workspaceId) && <p className="text-[11.5px] text-muted-foreground">{wsLabel(e.workspaceId)} · {e.kind}</p>} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
