import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CirclePause, CirclePlay, Check, MessageCircleQuestion, Code2, ExternalLink, RotateCcw, Archive, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, MetricCard, EmptyState } from "@/components/shared/states";
import { SessionStatusBadge } from "@/components/shared/status-badges";
import { SessionCard, useSessionActions } from "@/components/claude/session-card";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { useAppStore } from "@/stores/app-store";
import { duration, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SessionStatus } from "@/types";

export const Route = createFileRoute("/claude")({
  validateSearch: (s: Record<string, unknown>): { session?: string } => ({ session: typeof s["session"] === "string" ? s["session"] : undefined }),
  head: () => ({
    meta: [
      { title: "Claude Sessions · hello atzlan" },
      { name: "description", content: "See what your AI development sessions are working on." },
      { property: "og:title", content: "Claude Sessions · hello atzlan" },
      { property: "og:description", content: "See what your AI development sessions are working on." },
    ],
  }),
  component: ClaudePage,
});

function ClaudePage() {
  const { session } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { sessions, workspaces, activity } = useAppStore();
  const [filter, setFilter] = useState<SessionStatus | "all">("all");
  const a = useSessionActions();
  const live = sessions.filter((s) => s.status !== "archived");
  const attention = live.filter((s) => s.attention);
  const list = sessions.filter((s) => (filter === "all" ? s.status !== "archived" : s.status === filter)).sort((x, y) => y.updatedAt.localeCompare(x.updatedAt));
  const sel = sessions.find((s) => s.id === session) ?? list[0];
  const ws = sel && workspaces.find((w) => w.id === sel.workspaceId);
  const count = (st: SessionStatus) => live.filter((s) => s.status === st).length;

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader glow title="Claude Sessions" subtitle="See what your AI development sessions are working on." />
      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard icon={CirclePlay} value={count("running")} label="Running sessions" tone="success" />
        <MetricCard icon={MessageCircleQuestion} value={count("waiting")} label="Waiting for input" />
        <MetricCard icon={CirclePause} value={count("paused")} label="Paused sessions" />
        <MetricCard icon={Check} value={count("completed")} label="Completed sessions" tone="success" />
      </div>

      {attention.length > 0 && (
        <section aria-labelledby="attn" className="mb-6 rounded-2xl border border-warning/30 bg-warning-subtle/60 p-4">
          <h2 id="attn" className="mb-3 flex items-center gap-2 text-[15px] font-semibold"><AlertTriangle className="size-4 text-warning" /> Attention required</h2>
          <div className="grid gap-2 lg:grid-cols-3">
            {attention.map((s) => {
              const w = workspaces.find((x) => x.id === s.workspaceId);
              return (
                <button key={s.id} onClick={() => navigate({ search: { session: s.id } })} className="rounded-xl border bg-card p-3 text-left transition-shadow hover:shadow-card">
                  <div className="flex items-center justify-between gap-2"><span className="text-[12px] font-semibold text-muted-foreground">{w?.ticketId}</span><SessionStatusBadge status={s.status} /></div>
                  <p className="mt-1 text-[13.5px] font-semibold">{s.attention}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{s.name}</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {(["all", "running", "waiting", "paused", "completed", "error", "archived"] as const).map((k) => (
              <button key={k} aria-pressed={filter === k} onClick={() => setFilter(k)} className={cn("rounded-full border px-3 py-1 text-[12.5px] capitalize", filter === k ? "border-primary-border bg-primary-subtle text-primary" : "bg-card hover:bg-accent")}>{k}</button>
            ))}
          </div>
          <div className="space-y-2">
            {list.length === 0 && <EmptyState title="No Claude sessions yet." description="Sessions appear here once you start one from a workspace." />}
            {list.map((s) => <SessionCard key={s.id} s={s} showWorkspace selected={sel?.id === s.id} onSelect={() => navigate({ search: { session: s.id } })} />)}
          </div>
        </div>
        {sel && (
          <aside aria-label="Session inspector" className="h-fit rounded-2xl border bg-card p-5 shadow-card xl:sticky xl:top-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0"><p className="font-mono text-[11.5px] text-muted-foreground">{sel.id}</p><h2 className="text-[19px] font-bold tracking-tight">{sel.name}</h2></div>
              <SessionStatusBadge status={sel.status} />
            </div>
            <dl className="mt-4 grid grid-cols-[110px_1fr] gap-y-2 text-[13px]">
              <dt className="text-muted-foreground">Workspace</dt><dd>{ws ? `${ws.ticketId ?? ""} · ${ws.name}` : "—"}</dd>
              <dt className="text-muted-foreground">Model</dt><dd>{sel.model}</dd>
              <dt className="text-muted-foreground">Duration</dt><dd>{duration(sel.durationMin)}</dd>
              <dt className="text-muted-foreground">Created</dt><dd>{timeAgo(sel.createdAt)}</dd>
              <dt className="text-muted-foreground">Last activity</dt><dd>{timeAgo(sel.updatedAt)}</dd>
            </dl>
            <div className="mt-4 rounded-xl bg-secondary p-3 text-[13px]"><p className="mb-1 text-[11.5px] font-medium text-muted-foreground">Latest message (mock)</p>{sel.lastMessage}</div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button onClick={() => a.resume(sel)} disabled={sel.status === "running" || sel.status === "archived"}><RotateCcw /> Resume</Button>
              <Button variant="outline" onClick={() => a.workspace(sel)}><ExternalLink /> View Workspace</Button>
              <Button variant="outline" onClick={() => a.openIDE(sel)}><Code2 /> Open IDE</Button>
              <Button variant="outline" onClick={() => a.rename(sel)}><Pencil /> Rename</Button>
              <Button variant="ghost" className="col-span-2" onClick={() => a.archive(sel)} disabled={sel.status === "archived"}><Archive /> Archive</Button>
            </div>
            <h3 className="mt-5 mb-1 text-[14px] font-semibold">Workspace history</h3>
            <ActivityTimeline compact events={activity.filter((e) => e.workspaceId === sel.workspaceId && e.kind === "claude").slice(0, 5)} />
          </aside>
        )}
      </div>
    </div>
  );
}
