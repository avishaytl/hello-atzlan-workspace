import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Code2, Copy, Diamond, FolderGit2, Loader2, Plus, RotateCcw, Terminal, GitCommitHorizontal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { WorkspaceStatusBadge, ClaudeStatusBadge } from "@/components/shared/status-badges";
import { EmptyState, Field, SettingsSection } from "@/components/shared/states";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { DiffViewer } from "@/components/git/diff-viewer";
import { FileTree } from "@/components/git/file-tree";
import { SessionCard } from "@/components/claude/session-card";
import { WorkspaceMenu } from "@/components/workspaces/workspace-menu";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";
import { useAction } from "@/hooks/use-action";
import { services } from "@/services/mocks";
import { useAppStore } from "@/stores/app-store";
import { sampleChanges, sampleTree } from "@/data/mock";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActivityKind, Workspace } from "@/types";

const TABS = ["overview", "claude", "git", "files", "activity", "settings"] as const;
type Tab = (typeof TABS)[number];

export const Route = createFileRoute("/workspaces/$workspaceId")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } => ({ tab: TABS.includes(s.tab as Tab) ? (s.tab as Tab) : undefined }),
  head: () => ({
    meta: [
      { title: "Workspace · hello atzlan" },
      { name: "description", content: "Branch, worktree, Claude sessions and changes for one task." },
      { property: "og:title", content: "Workspace · hello atzlan" },
      { property: "og:description", content: "Branch, worktree, Claude sessions and changes for one task." },
    ],
  }),
  component: WorkspaceDetail,
});

function WorkspaceDetail() {
  const { workspaceId } = Route.useParams();
  const { tab = "overview" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const w = useAppStore((s) => s.workspaces.find((x) => x.id === workspaceId));
  const a = useWorkspaceActions();

  if (!w) return <EmptyState title="Workspace not found" description="It may have been deleted, or demo data was reset." action={<Button asChild><Link to="/workspaces">Back to Workspaces</Link></Button>} />;

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="bg-header-glow relative -mx-6 -mt-6 mb-5 px-6 pt-6 pb-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12.5px] text-muted-foreground">
          <Link to="/workspaces" className="hover:text-foreground">Workspaces</Link><ChevronRight className="size-3.5" /><span className="text-foreground">{w.ticketId ?? w.name}</span>
        </nav>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
              <Diamond className="size-4 fill-info text-info" />{w.ticketId ?? "No ticket"}
              <span>·</span><FolderGit2 className="size-3.5" /><RepoName id={w.repositoryId} />
            </div>
            <h1 className="mt-1 text-[30px] font-bold tracking-tight">{w.name}</h1>
            <div className="mt-2"><WorkspaceStatusBadge status={w.status} claude={w.claudeState} git={w.gitState} /></div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => a.resume(w)} disabled={a.pending === `resume:${w.id}`}>{a.pending === `resume:${w.id}` ? <Loader2 className="animate-spin" /> : <RotateCcw />} Resume Claude</Button>
            <Button onClick={() => a.openIDE(w)} disabled={a.pending === `ide:${w.id}`}>{a.pending === `ide:${w.id}` ? <Loader2 className="animate-spin" /> : <Code2 />} Open in IDE</Button>
            <WorkspaceMenu w={w} />
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => navigate({ search: { tab: v as Tab }, replace: true })}>
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b bg-transparent p-0">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-none border-b-2 border-transparent px-3.5 pb-2.5 text-[13.5px] capitalize shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
              {t === "git" ? "Git Changes" : t}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview" className="mt-5"><OverviewTab w={w} /></TabsContent>
        <TabsContent value="claude" className="mt-5"><ClaudeTab w={w} /></TabsContent>
        <TabsContent value="git" className="mt-5">{w.modifiedFiles + w.untrackedFiles === 0 && w.ahead === 0 ? <EmptyState title="Working tree clean" description="No changes detected in this worktree (mock)." /> : <DiffViewer changes={sampleChanges} />}</TabsContent>
        <TabsContent value="files" className="mt-5"><FileTree tree={sampleTree} /></TabsContent>
        <TabsContent value="activity" className="mt-5"><ActivityTab w={w} /></TabsContent>
        <TabsContent value="settings" className="mt-5"><SettingsTab w={w} /></TabsContent>
      </Tabs>
    </div>
  );
}

function RepoName({ id }: { id: string }) {
  return <>{useAppStore((s) => s.repositories.find((r) => r.id === id)?.name)}</>;
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-2xl border bg-card p-5 shadow-card", className)}><h2 className="mb-3 text-[15px] font-semibold">{title}</h2>{children}</section>;
}
function KV({ items }: { items: [string, React.ReactNode][] }) {
  return <dl className="grid grid-cols-[130px_1fr] gap-y-2 text-[13px]">{items.map(([k, v]) => <><dt key={k} className="text-muted-foreground">{k}</dt><dd key={k + "v"} className="min-w-0 truncate">{v}</dd></>)}</dl>;
}

function OverviewTab({ w }: { w: Workspace }) {
  const a = useWorkspaceActions();
  const sessions = useAppStore((s) => s.sessions.filter((x) => x.workspaceId === w.id));
  const latest = [...sessions].sort((x, y) => y.updatedAt.localeCompare(x.updatedAt))[0];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Workspace Information">
        <KV items={[["Repository", <RepoName id={w.repositoryId} />], ["Branch", <span className="font-mono text-[12.5px]">{w.branch}</span>], ["Worktree path", <span className="font-mono text-[12.5px]">{w.worktreePath}</span>], ["Base branch", <span className="font-mono text-[12.5px]">{w.baseBranch}</span>], ["Created", new Date(w.createdAt).toLocaleDateString()], ["Last opened", timeAgo(w.lastOpenedAt)]]} />
      </Card>
      <Card title="Claude Summary">
        <KV items={[["Sessions", sessions.length], ["Active", sessions.filter((s) => s.status === "running").length], ["Last prompt", latest ? timeAgo(latest.updatedAt) : "—"], ["Current state", <ClaudeStatusBadge state={w.claudeState} />], ["Latest", <span className="italic text-muted-foreground">{latest?.lastMessage ?? "No sessions yet"}</span>]]} />
      </Card>
      <Card title="Git Summary">
        <KV items={[["Modified files", w.modifiedFiles], ["Untracked files", w.untrackedFiles], ["Commits ahead", w.ahead], ["Commits behind", w.behind], ["Last commit", <span className="flex items-center gap-1"><GitCommitHorizontal className="size-3.5" />{w.lastCommit}</span>]]} />
      </Card>
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => a.openIDE(w)}><Code2 /> Open IDE</Button>
          <Button variant="outline" onClick={() => a.resume(w)}><RotateCcw /> Resume Claude</Button>
          <Button variant="outline" onClick={() => a.terminal(w)}><Terminal /> Open Terminal</Button>
          <Button variant="outline" onClick={() => a.copyPath(w)}><Copy /> Copy Worktree Path</Button>
        </div>
        <p className="mt-3 text-[11.5px] text-muted-foreground">Actions are simulated in this preview — nothing runs on your machine.</p>
      </Card>
    </div>
  );
}

function ClaudeTab({ w }: { w: Workspace }) {
  const sessions = useAppStore((s) => s.sessions.filter((x) => x.workspaceId === w.id));
  const { pending, run } = useAction();
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">{sessions.length} sessions in this workspace</p>
        <Button size="sm" onClick={() => run("new", () => services.claude.startSession(w.id))} disabled={pending === "new"}>{pending === "new" ? <Loader2 className="animate-spin" /> : <Plus />} New session</Button>
      </div>
      <div className="space-y-2">
        {sessions.length === 0 && <EmptyState title="No Claude sessions yet." description="Start one to begin working with Claude in this worktree." />}
        {sessions.map((s) => <SessionCard key={s.id} s={s} />)}
      </div>
    </div>
  );
}

function ActivityTab({ w }: { w: Workspace }) {
  const events = useAppStore((s) => s.activity.filter((e) => e.workspaceId === w.id));
  const [kind, setKind] = useState<ActivityKind | "all">("all");
  const list = events.filter((e) => kind === "all" || e.kind === kind);
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(["all", "claude", "git", "workspace", "system"] as const).map((k) => (
          <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)} className={cn("rounded-full border px-3 py-1 text-[12.5px] capitalize", kind === k ? "border-primary-border bg-primary-subtle text-primary" : "hover:bg-accent")}>{k}</button>
        ))}
      </div>
      <ActivityTimeline events={list} />
    </div>
  );
}

function SettingsTab({ w }: { w: Workspace }) {
  const patch = useAppStore((s) => s.patch);
  const [name, setName] = useState(w.name);
  const [ide, setIde] = useState(w.preferredIde);
  const { run } = useAction();
  const save = () => run("save", async () => {
    await services.workspaces.rename(w.id, name.trim() || w.name);
    patch((d) => ({ workspaces: d.workspaces.map((x) => (x.id === w.id ? { ...x, preferredIde: ide } : x)) }));
  }, "Workspace settings saved");
  return (
    <div className="max-w-3xl space-y-4">
      <SettingsSection title="Workspace" description="Saved locally in this browser.">
        <Field label="Display name" htmlFor="ws-name"><Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Preferred IDE" htmlFor="ws-ide">
          <Select value={ide} onValueChange={setIde}><SelectTrigger id="ws-ide"><SelectValue /></SelectTrigger><SelectContent>{["Cursor", "VS Code", "WebStorm", "Zed"].map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select>
        </Field>
        <Field label="Default Claude model" hint="Mock preference"><Select defaultValue="sonnet"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sonnet">Claude Sonnet (mock)</SelectItem><SelectItem value="opus">Claude Opus (mock)</SelectItem></SelectContent></Select></Field>
        <Field label="Resume last session on open"><Switch defaultChecked /></Field>
        <Field label="Show in Overview"><Switch defaultChecked /></Field>
        <div className="flex justify-end"><Button onClick={save}>Save changes</Button></div>
      </SettingsSection>
    </div>
  );
}
