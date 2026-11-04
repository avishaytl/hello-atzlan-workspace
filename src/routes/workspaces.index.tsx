import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, EmptyState } from "@/components/shared/states";
import { WorkspaceCard } from "@/components/workspaces/workspace-card";
import { WorkspaceInspector } from "@/components/workspaces/workspace-inspector";
import { useAppStore } from "@/stores/app-store";
import { useUI } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import type { ClaudeState, GitState, Workspace } from "@/types";

export const Route = createFileRoute("/workspaces/")({
  head: () => ({
    meta: [
      { title: "Workspaces · hello atzlan" },
      { name: "description", content: "Every branch, worktree and Claude session, in one place." },
      { property: "og:title", content: "Workspaces · hello atzlan" },
      { property: "og:description", content: "Every branch, worktree and Claude session, in one place." },
    ],
  }),
  component: WorkspacesPage,
});

const STATUS = ["All", "Active", "Paused", "Completed", "Archived"] as const;
type Sort = "updated" | "created" | "name" | "activity";

function WorkspacesPage() {
  const { workspaces, sessions, repositories, projects, selectedWorkspaceId, selectWorkspace } = useAppStore();
  const openWizard = useUI((s) => s.openWizard);
  const [status, setStatus] = useState<(typeof STATUS)[number]>("All");
  const [view, setView] = useState<"list" | "grid">("list");
  const [q, setQ] = useState("");
  const [project, setProject] = useState("all");
  const [repo, setRepo] = useState("all");
  const [claude, setClaude] = useState<"all" | ClaudeState>("all");
  const [git, setGit] = useState<"all" | GitState>("all");
  const [sort, setSort] = useState<Sort>("updated");

  const repoName = (id: string) => repositories.find((r) => r.id === id)?.name ?? "";
  const sessCount = (id: string) => sessions.filter((s) => s.workspaceId === id).length;

  const list = useMemo(() => {
    const matchStatus = (w: Workspace) => status === "All" ? w.status !== "archived" : w.status === status.toLowerCase();
    const needle = q.toLowerCase();
    const r = workspaces.filter((w) =>
      matchStatus(w) && (project === "all" || w.projectId === project) && (repo === "all" || w.repositoryId === repo) &&
      (claude === "all" || w.claudeState === claude) && (git === "all" || w.gitState === git) &&
      (!needle || `${w.name} ${w.ticketId} ${w.branch} ${repoName(w.repositoryId)}`.toLowerCase().includes(needle)));
    const cmp: Record<Sort, (a: Workspace, b: Workspace) => number> = {
      updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
      created: (a, b) => b.createdAt.localeCompare(a.createdAt),
      name: (a, b) => a.name.localeCompare(b.name),
      activity: (a, b) => sessCount(b.id) + b.modifiedFiles - (sessCount(a.id) + a.modifiedFiles),
    };
    return r.sort(cmp[sort]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces, sessions, status, q, project, repo, claude, git, sort]);

  const selected = list.find((w) => w.id === selectedWorkspaceId) ?? list[0];
  const anyWorkspaces = workspaces.length > 0;

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader glow title="Workspaces" subtitle="Everything you’re building, all in one place." actions={<Button onClick={() => openWizard()}><Plus /> New Workspace</Button>} />

      {!anyWorkspaces ? (
        <EmptyState title="Your next great idea starts here." description="Create a workspace to pair a ticket with its own branch, worktree and Claude sessions." action={<Button onClick={() => openWizard()}><Plus /> Create Your First Workspace</Button>} />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div role="tablist" aria-label="Status" className="inline-flex rounded-full border bg-card p-1 shadow-sm">
              {STATUS.map((s) => (
                <button key={s} role="tab" aria-selected={status === s} onClick={() => setStatus(s)} className={cn("rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors", status === s ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-accent")}>{s}</button>
              ))}
            </div>
            <div className="relative ml-auto w-full max-w-[260px]">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input aria-label="Filter workspaces" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name, ticket, branch…" className="h-9 rounded-full pl-9" />
            </div>
            <div className="inline-flex rounded-[10px] border bg-card p-0.5" role="radiogroup" aria-label="View">
              <button role="radio" aria-checked={view === "list"} aria-label="List view" onClick={() => setView("list")} className={cn("grid size-8 place-items-center rounded-lg text-muted-foreground", view === "list" && "bg-secondary text-foreground")}><List className="size-4" /></button>
              <button role="radio" aria-checked={view === "grid"} aria-label="Grid view" onClick={() => setView("grid")} className={cn("grid size-8 place-items-center rounded-lg text-muted-foreground", view === "grid" && "bg-secondary text-foreground")}><LayoutGrid className="size-4" /></button>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <F label="Project" value={project} onChange={setProject} items={[["all", "All projects"], ...projects.map((p) => [p.id, p.name] as [string, string])]} />
            <F label="Repository" value={repo} onChange={setRepo} items={[["all", "All repositories"], ...repositories.map((r) => [r.id, r.name] as [string, string])]} />
            <F label="Claude status" value={claude} onChange={(v) => setClaude(v as typeof claude)} items={[["all", "Any Claude status"], ["running", "Running"], ["waiting", "Waiting for input"], ["paused", "Paused"], ["completed", "Completed"], ["ready", "Ready"], ["not_initialized", "Not initialized"], ["error", "Error"]]} />
            <F label="Git status" value={git} onChange={(v) => setGit(v as typeof git)} items={[["all", "Any Git status"], ["clean", "Clean"], ["dirty", "Uncommitted changes"], ["ready_for_pr", "Ready for PR"]]} />
            <F label="Sort" value={sort} onChange={(v) => setSort(v as Sort)} items={[["updated", "Last updated"], ["created", "Recently created"], ["name", "Name"], ["activity", "Activity"]]} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className={cn(view === "grid" ? "grid gap-3 sm:grid-cols-2 2xl:grid-cols-3" : "space-y-2")}>
              {list.length === 0 && <EmptyState className="col-span-full" title="No matching workspaces or tasks found." description="Try clearing a filter." />}
              {list.map((w) => (
                <WorkspaceCard key={w.id} w={w} variant={view === "grid" ? "grid" : "row"} repoName={repoName(w.repositoryId)} sessionCount={sessCount(w.id)} selected={selected?.id === w.id} onSelect={() => selectWorkspace(w.id)} />
              ))}
            </div>
            <div className="hidden xl:block"><div className="sticky top-0">{selected && <WorkspaceInspector w={selected} />}</div></div>
          </div>
        </>
      )}
    </div>
  );
}

function F({ label, value, onChange, items }: { label: string; value: string; onChange: (v: string) => void; items: [string, string][] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className={cn("h-8 w-auto gap-2 rounded-full bg-card text-[12.5px]", value !== "all" && value !== "updated" && "border-primary-border text-primary")}><SelectValue /></SelectTrigger>
      <SelectContent>{items.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
    </Select>
  );
}
