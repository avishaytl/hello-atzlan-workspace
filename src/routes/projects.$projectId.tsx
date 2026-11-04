import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, FolderGit2, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, Field, SettingsSection } from "@/components/shared/states";
import { WorkspaceCard } from "@/components/workspaces/workspace-card";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { useAppStore } from "@/stores/app-store";
import { useUI } from "@/stores/ui-store";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Project · hello atzlan" },
      { name: "description", content: "Repositories, workspaces and activity for a project." },
      { property: "og:title", content: "Project · hello atzlan" },
      { property: "og:description", content: "Repositories, workspaces and activity for a project." },
    ],
  }),
  component: ProjectDetail,
});

const tab = "rounded-none border-b-2 border-transparent px-3.5 pb-2.5 text-[13.5px] shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none";

function ProjectDetail() {
  const { projectId } = Route.useParams();
  const { projects, repositories, workspaces, sessions, activity, patch } = useAppStore();
  const openWizard = useUI((s) => s.openWizard);
  const navigate = useNavigate();
  const p = projects.find((x) => x.id === projectId);
  const [desc, setDesc] = useState(p?.description ?? "");
  if (!p) return <EmptyState title="Project not found" action={<Button asChild><Link to="/projects">Back</Link></Button>} />;
  const repos = repositories.filter((r) => r.projectId === p.id);
  const ws = workspaces.filter((w) => w.projectId === p.id);

  return (
    <div className="mx-auto max-w-[1300px]">
      <div className="bg-header-glow -mx-6 -mt-6 mb-5 px-6 pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12.5px] text-muted-foreground"><Link to="/projects" className="hover:text-foreground">Projects</Link><ChevronRight className="size-3.5" /><span className="text-foreground">{p.name}</span></nav>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div><p className="text-[12px] font-semibold text-muted-foreground">{p.key}</p><h1 className="text-[28px] font-bold tracking-tight">{p.name}</h1><p className="text-muted-foreground">{p.description}</p></div>
          <Button onClick={() => openWizard({ projectId: p.id })}><Plus /> New Workspace</Button>
        </div>
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-b bg-transparent p-0">
          {["overview", "repositories", "workspaces", "activity", "settings"].map((t) => <TabsTrigger key={t} value={t} className={`${tab} capitalize`}>{t}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="overview" className="mt-5">
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="mb-4 text-[15px] font-semibold">Project → Repositories → Workspaces</h2>
            <div className="space-y-4">
              {repos.map((r) => (
                <div key={r.id} className="grid gap-3 md:grid-cols-[240px_1fr]">
                  <div className="flex items-center gap-2 rounded-xl border bg-secondary/50 p-3"><FolderGit2 className="size-4 text-muted-foreground" /><div className="min-w-0"><p className="text-[13.5px] font-semibold">{r.name}</p><p className="truncate font-mono text-[11px] text-muted-foreground">{r.defaultBranch}</p></div></div>
                  <div className="flex flex-wrap gap-2">
                    {ws.filter((w) => w.repositoryId === r.id).map((w) => (
                      <Link key={w.id} to="/workspaces/$workspaceId" params={{ workspaceId: w.id }} className="rounded-full border px-3 py-1.5 text-[12.5px] hover:border-primary-border hover:bg-primary-subtle">{w.ticketId ?? w.name}</Link>
                    ))}
                    {ws.every((w) => w.repositoryId !== r.id) && <span className="py-1.5 text-[12.5px] text-muted-foreground">No workspaces</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="repositories" className="mt-5 space-y-2">
          {repos.length === 0 && <EmptyState title="No repositories" />}
          {repos.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3">
              <FolderGit2 className="size-4 text-muted-foreground" />
              <div className="min-w-0 flex-1"><p className="font-semibold">{r.name}</p><p className="truncate font-mono text-[12px] text-muted-foreground">{r.path}</p></div>
              <span className="font-mono text-[12px] text-muted-foreground">{r.defaultBranch}</span>
              <span className={r.available ? "text-[12px] text-success" : "text-[12px] text-warning"}>{r.available ? "Available" : "Not found (mock)"}</span>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="workspaces" className="mt-5 space-y-2">
          {ws.length === 0 && <EmptyState title="Your next great idea starts here." action={<Button onClick={() => openWizard({ projectId: p.id })}>Create Your First Workspace</Button>} />}
          {ws.map((w) => <WorkspaceCard key={w.id} w={w} variant="row" repoName={repositories.find((r) => r.id === w.repositoryId)?.name} sessionCount={sessions.filter((s) => s.workspaceId === w.id).length} onSelect={() => navigate({ to: "/workspaces/$workspaceId", params: { workspaceId: w.id } })} />)}
        </TabsContent>
        <TabsContent value="activity" className="mt-5"><div className="rounded-2xl border bg-card p-5"><ActivityTimeline events={activity.filter((e) => e.projectId === p.id)} /></div></TabsContent>
        <TabsContent value="settings" className="mt-5 max-w-3xl">
          <SettingsSection title="Project settings">
            <Field label="Description" htmlFor="pdesc"><Input id="pdesc" value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
            <div className="flex justify-end"><Button onClick={() => { patch((d) => ({ projects: d.projects.map((x) => (x.id === p.id ? { ...x, description: desc } : x)) })); toast.success("Project saved"); }}>Save</Button></div>
          </SettingsSection>
        </TabsContent>
      </Tabs>
    </div>
  );
}
