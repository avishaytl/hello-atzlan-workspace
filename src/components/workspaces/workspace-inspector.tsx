import { Link } from "@tanstack/react-router";
import { ArrowRight, Code2, Copy, Diamond, ExternalLink, FolderGit2, GitBranch, GitPullRequest, Loader2, RotateCcw, Terminal, FolderTree, Clock, GitCompare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BrandIcon } from "@/components/shared/brand-logo";
import { ClaudeStatusBadge } from "@/components/shared/status-badges";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { WorkspaceMenu } from "./workspace-menu";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";
import { useAppStore } from "@/stores/app-store";
import { sampleChanges } from "@/data/mock";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5 text-[13px]">
      <span className="text-muted-foreground">{icon}</span>
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
    </div>
  );
}

function QuickAction({ icon, label, onClick, loading, primary }: { icon: React.ReactNode; label: string; onClick: () => void; loading?: boolean; primary?: boolean }) {
  return (
    <button onClick={onClick} disabled={loading} className={cn(
      "flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-[12.5px] font-medium transition-all duration-150 hover:-translate-y-px hover:shadow-card disabled:opacity-60",
      primary ? "border-primary-border bg-primary-subtle text-primary" : "bg-card hover:bg-accent",
    )}>
      {loading ? <Loader2 className="size-5 animate-spin" /> : icon}
      <span className="text-center leading-tight">{label}</span>
    </button>
  );
}

export function WorkspaceInspector({ w }: { w: Workspace }) {
  const a = useWorkspaceActions();
  const activity = useAppStore((s) => s.activity.filter((e) => e.workspaceId === w.id).slice(0, 5));
  const repo = useAppStore((s) => s.repositories.find((r) => r.id === w.repositoryId));
  const project = useAppStore((s) => s.projects.find((p) => p.id === w.projectId));
  const sessions = useAppStore((s) => s.sessions.filter((x) => x.workspaceId === w.id && x.status !== "archived"));
  const running = sessions.find((x) => x.status === "running");

  return (
    <aside aria-label="Workspace inspector" className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground"><Diamond className="size-4 fill-info text-info" />{w.ticketId ?? "No ticket"}</div>
          <Link to="/workspaces/$workspaceId" params={{ workspaceId: w.id }} className="group mt-1 flex items-center gap-2">
            <h2 className="truncate text-[22px] font-bold tracking-tight group-hover:underline">{w.name}</h2>
            <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        </div>
        <div className="flex items-center gap-1"><WorkspaceMenu w={w} /></div>
      </div>
      <div className="mt-2"><ClaudeStatusBadge state={w.claudeState} /></div>

      <Tabs defaultValue="workspace" className="mt-4">
        <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-b bg-transparent p-0">
          {["workspace", "activity", "files", "details"].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-none border-b-2 border-transparent px-3 pb-2 text-[13px] capitalize shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="workspace" className="mt-4 space-y-5">
          <div className="divide-y rounded-xl border">
            <Row icon={<GitBranch className="size-4" />} label="Branch">
              <span className="truncate font-mono text-[12.5px]">{w.branch}</span>
              <button aria-label="Copy branch" onClick={() => a.copy(w.branch, "Branch copied")} className="text-muted-foreground hover:text-foreground"><Copy className="size-3.5" /></button>
            </Row>
            <Row icon={<FolderTree className="size-4" />} label="Worktree">
              <span className="truncate font-mono text-[12.5px]">{w.worktreePath}</span>
              <button aria-label="Copy worktree path" onClick={() => a.copyPath(w)} className="text-muted-foreground hover:text-foreground"><Copy className="size-3.5" /></button>
            </Row>
            <Row icon={<BrandIcon size={16} />} label="Claude">
              <span className="truncate">{running ? `Running (since ${timeAgo(running.createdAt).replace(" ago", "")} ago)` : `${sessions.length} session${sessions.length === 1 ? "" : "s"}`}</span>
              <Button size="sm" variant="outline" className="ml-auto h-7 rounded-full" onClick={() => a.resume(w)} disabled={a.pending === `resume:${w.id}`}>
                {a.pending === `resume:${w.id}` ? <Loader2 className="animate-spin" /> : <RotateCcw />} Resume
              </Button>
            </Row>
          </div>

          <div>
            <h3 className="mb-2 text-[15px] font-semibold">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <QuickAction primary icon={<Code2 className="size-5" />} label="Open in IDE" onClick={() => a.openIDE(w)} loading={a.pending === `ide:${w.id}`} />
              <QuickAction icon={<BrandIcon size={20} />} label="Resume Claude" onClick={() => a.resume(w)} loading={a.pending === `resume:${w.id}`} />
              <QuickAction icon={<Terminal className="size-5" />} label="Open Terminal" onClick={() => a.terminal(w)} loading={a.pending === `term:${w.id}`} />
              <QuickAction icon={<GitPullRequest className="size-5" />} label="Create PR" onClick={() => a.createPR(w)} loading={a.pending === `pr:${w.id}`} />
            </div>
            <button onClick={() => a.viewChanges(w)} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-2 text-[12.5px] text-muted-foreground hover:bg-accent hover:text-foreground">
              <GitCompare className="size-3.5" /> View Changes ({w.modifiedFiles} modified)
            </button>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold">Recent Activity</h3>
              <Link to="/activity" className="flex items-center gap-1 text-[12.5px] font-semibold text-primary">View All <ArrowRight className="size-3.5" /></Link>
            </div>
            <ActivityTimeline events={activity.slice(0, 3)} compact />
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4"><ActivityTimeline events={activity} /></TabsContent>

        <TabsContent value="files" className="mt-4 space-y-1">
          {sampleChanges.slice(0, Math.max(1, Math.min(3, w.modifiedFiles))).map((c) => (
            <div key={c.path} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[12.5px] hover:bg-accent">
              <span className="truncate font-mono">{c.path}</span>
              <span className="text-[11px] capitalize text-muted-foreground">{c.status}</span>
            </div>
          ))}
          <Button variant="link" className="px-2" onClick={() => a.viewChanges(w)}>Open diff viewer</Button>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <dl className="grid grid-cols-[110px_1fr] gap-y-2 text-[13px]">
            <dt className="text-muted-foreground">Project</dt><dd>{project?.name}</dd>
            <dt className="text-muted-foreground">Repository</dt><dd className="flex items-center gap-1"><FolderGit2 className="size-3.5" />{repo?.name}</dd>
            <dt className="text-muted-foreground">Base branch</dt><dd className="font-mono text-[12.5px]">{w.baseBranch}</dd>
            <dt className="text-muted-foreground">Ahead / behind</dt><dd>{w.ahead} / {w.behind}</dd>
            <dt className="text-muted-foreground">Last commit</dt><dd className="truncate">{w.lastCommit}</dd>
            <dt className="text-muted-foreground">Last activity</dt><dd className="flex items-center gap-1"><Clock className="size-3.5" />{timeAgo(w.updatedAt)}</dd>
          </dl>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
