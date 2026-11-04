import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layers, Play, GitBranch, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard, EmptyState } from "@/components/shared/states";
import { WorkspaceCard } from "@/components/workspaces/workspace-card";
import { WorkspaceInspector } from "@/components/workspaces/workspace-inspector";
import { useAppStore } from "@/stores/app-store";
import { useUI } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/overview")({
  head: () => ({
    meta: [
      { title: "Overview · hello atzlan" },
      { name: "description", content: "Pick up where you left off across every workspace." },
      { property: "og:title", content: "Overview · hello atzlan" },
      { property: "og:description", content: "Pick up where you left off across every workspace." },
    ],
  }),
  component: Overview,
});

const FILTERS = ["All", "Active", "Paused", "Done"] as const;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Overview() {
  const { workspaces, sessions, repositories, selectedWorkspaceId, selectWorkspace } = useAppStore();
  const openWizard = useUI((s) => s.openWizard);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const live = workspaces.filter((w) => w.status !== "archived");
  const list = live
    .filter((w) => filter === "All" || (filter === "Active" && w.status === "active") || (filter === "Paused" && w.status === "paused") || (filter === "Done" && w.status === "completed"))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const selected = live.find((w) => w.id === selectedWorkspaceId) ?? list[0];

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="relative -mx-6 -mt-20 mb-6 px-6 pt-20 pb-2 bg-header-glow">
        <h1 className="text-[30px] font-bold tracking-tight">{greeting()}, Avishay <span aria-hidden>👋</span></h1>
        <p className="mt-0.5 text-[15px] text-muted-foreground">Pick up where you left off.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard icon={Layers} value={live.filter((w) => w.status === "active").length} label="Active workspaces" />
          <MetricCard icon={Play} value={sessions.filter((s) => s.status === "running").length} label="Running Claude" hint={`${sessions.filter((s) => s.status === "waiting").length} waiting for input`} />
          <MetricCard icon={GitBranch} value={live.length} label="Branches" hint={`across ${new Set(live.map((w) => w.repositoryId)).size} repositories`} />
          <MetricCard icon={Check} tone="success" value={live.filter((w) => w.gitState === "ready_for_pr").length} label="Ready for PR" />
        </div>
      </div>

      <div className="grid gap-6 border-t pt-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,1fr)]">
        <section aria-labelledby="ws-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="ws-heading" className="text-[22px] font-bold tracking-tight">Workspaces</h2>
            <Button onClick={() => openWizard()}><Plus /> New Workspace</Button>
          </div>
          <div role="tablist" aria-label="Filter workspaces" className="mb-3 inline-flex rounded-full border bg-card p-1 shadow-sm">
            {FILTERS.map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn("rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-150", filter === f ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-accent")}>{f}</button>
            ))}
          </div>
          <div className="space-y-2">
            {list.length === 0 && <EmptyState title="Nothing here yet" description="No workspaces match this filter." />}
            {list.map((w) => (
              <WorkspaceCard key={w.id} w={w} repoName={repositories.find((r) => r.id === w.repositoryId)?.name} sessionCount={sessions.filter((s) => s.workspaceId === w.id).length} selected={selected?.id === w.id} onSelect={() => selectWorkspace(w.id)} />
            ))}
          </div>
          <Link to="/workspaces" className="mt-3 inline-block text-[13px] font-semibold text-primary">See all workspaces →</Link>
        </section>
        <div className="hidden xl:block">
          <div className="sticky top-0">{selected ? <WorkspaceInspector w={selected} /> : <EmptyState title="Select a workspace" />}</div>
        </div>
      </div>
    </div>
  );
}
