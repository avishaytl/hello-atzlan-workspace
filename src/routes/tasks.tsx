import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUp, Equal, Search, X, Layers, Plus, Diamond } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, EmptyState } from "@/components/shared/states";
import { Pill } from "@/components/shared/status-badges";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { useAppStore } from "@/stores/app-store";
import { useUI } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import type { Priority, Ticket, TicketStatus } from "@/types";

export const Route = createFileRoute("/tasks")({
  validateSearch: (s: Record<string, unknown>): { ticket?: string } => ({ ticket: typeof s.ticket === "string" ? s.ticket : undefined }),
  head: () => ({
    meta: [
      { title: "My Tasks · hello atzlan" },
      { name: "description", content: "Your tickets, linked to their workspaces." },
      { property: "og:title", content: "My Tasks · hello atzlan" },
      { property: "og:description", content: "Your tickets, linked to their workspaces." },
    ],
  }),
  component: TasksPage,
});

const prio: Record<Priority, { I: typeof ArrowUp; cls: string; rank: number }> = {
  highest: { I: ChevronsUp, cls: "text-danger", rank: 0 },
  high: { I: ArrowUp, cls: "text-warning", rank: 1 },
  medium: { I: Equal, cls: "text-info", rank: 2 },
  low: { I: ArrowDown, cls: "text-muted-foreground", rank: 3 },
};
const statusTone = (s: TicketStatus) => (s === "Done" ? "success" : s === "In Review" ? "info" : s === "In Progress" ? "warning" : "neutral") as "success";

function TicketCard({ t, selected, onClick, project }: { t: Ticket; selected: boolean; onClick: () => void; project?: string }) {
  const P = prio[t.priority];
  return (
    <button onClick={onClick} className={cn("flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-all hover:shadow-card", selected && "border-primary-border bg-primary-subtle/60")}>
      <P.I className={cn("size-4 shrink-0", P.cls)} aria-label={`${t.priority} priority`} />
      <span className="w-20 shrink-0 font-mono text-[12px] text-muted-foreground">{t.id}</span>
      <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-medium">{t.title}</p><p className="truncate text-[12px] text-muted-foreground">{project} · {t.assignee}</p></div>
      {t.workspaceId && <Layers className="size-4 text-primary" aria-label="Has linked workspace" />}
      <Pill tone={statusTone(t.status)}>{t.status}</Pill>
    </button>
  );
}

function TasksPage() {
  const { ticket } = Route.useSearch();
  const navigate = useNavigate();
  const { tickets, projects, repositories, workspaces, activity } = useAppStore();
  const openWizard = useUI((s) => s.openWizard);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [project, setProject] = useState("all");
  const [sort, setSort] = useState("priority");
  const pname = (id: string) => projects.find((p) => p.id === id)?.name;

  const list = useMemo(() => tickets
    .filter((t) => (status === "all" || t.status === status) && (project === "all" || t.projectId === project) && `${t.id} ${t.title} ${t.description}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (sort === "priority" ? prio[a.priority].rank - prio[b.priority].rank : sort === "id" ? a.id.localeCompare(b.id) : a.status.localeCompare(b.status))), [tickets, q, status, project, sort]);
  const sel = tickets.find((t) => t.id === ticket);
  const linked = sel?.workspaceId ? workspaces.find((w) => w.id === sel.workspaceId) : undefined;
  const select = (id?: string) => navigate({ to: "/tasks", search: id ? { ticket: id } : {} });

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader glow title="My Tasks" subtitle="Mock tickets — works without a real Jira connection." />
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative w-full max-w-xs"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search tasks" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks…" className="h-9 rounded-full pl-9" /></div>
        <Select value={status} onValueChange={setStatus}><SelectTrigger aria-label="Status" className="h-9 w-40 rounded-full bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{["To Do", "In Progress", "In Review", "Done"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
        <Select value={project} onValueChange={setProject}><SelectTrigger aria-label="Project" className="h-9 w-44 rounded-full bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All projects</SelectItem>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
        <Select value={sort} onValueChange={setSort}><SelectTrigger aria-label="Sort" className="h-9 w-40 rounded-full bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="priority">Sort: Priority</SelectItem><SelectItem value="id">Sort: Ticket ID</SelectItem><SelectItem value="status">Sort: Status</SelectItem></SelectContent></Select>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-2">
          {list.length === 0 && <EmptyState title="No matching workspaces or tasks found." />}
          {list.map((t) => <TicketCard key={t.id} t={t} project={pname(t.projectId)} selected={sel?.id === t.id} onClick={() => select(t.id)} />)}
        </div>
        {sel ? (
          <aside aria-label="Ticket details" className="h-fit rounded-2xl border bg-card p-5 shadow-card xl:sticky xl:top-0">
            <div className="flex items-start justify-between"><span className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground"><Diamond className="size-4 fill-info text-info" />{sel.id}</span><button aria-label="Close" onClick={() => select()} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button></div>
            <h2 className="mt-1 text-[20px] font-bold tracking-tight">{sel.title}</h2>
            <div className="mt-2 flex gap-2"><Pill tone={statusTone(sel.status)}>{sel.status}</Pill><Pill tone="neutral" className="capitalize">{sel.priority} priority</Pill></div>
            <p className="mt-4 text-[13.5px]">{sel.description}</p>
            <h3 className="mt-4 text-[13px] font-semibold">Acceptance criteria</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-[13px] text-muted-foreground">{sel.acceptance.map((c) => <li key={c}>{c}</li>)}</ul>
            <dl className="mt-4 grid grid-cols-[110px_1fr] gap-y-1.5 text-[13px]">
              <dt className="text-muted-foreground">Project</dt><dd>{pname(sel.projectId)}</dd>
              <dt className="text-muted-foreground">Repository</dt><dd>{repositories.find((r) => r.id === sel.repositoryId)?.name}</dd>
              <dt className="text-muted-foreground">Workspace</dt><dd>{linked ? linked.name : "Not linked"}</dd>
            </dl>
            <div className="mt-4">
              {linked ? <Button className="w-full" onClick={() => navigate({ to: "/workspaces/$workspaceId", params: { workspaceId: linked.id } })}><Layers /> Open Linked Workspace</Button>
                : <Button className="w-full" onClick={() => openWizard({ ticketId: sel.id })}><Plus /> Create Workspace from Ticket</Button>}
            </div>
            <h3 className="mt-5 mb-1 text-[13px] font-semibold">History (mock)</h3>
            <ActivityTimeline compact events={activity.filter((e) => linked && e.workspaceId === linked.id).slice(0, 4)} />
          </aside>
        ) : <div className="hidden xl:block"><EmptyState title="Select a ticket" description="See details, acceptance criteria and its workspace." /></div>}
      </div>
    </div>
  );
}
