import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderKanban, Plus, MoreHorizontal, Pencil, Archive, ExternalLink, FolderGit2, Layers, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader, EmptyState } from "@/components/shared/states";
import { prompt, confirm } from "@/components/shared/confirm-dialog";
import { useAppStore, uid } from "@/stores/app-store";
import { timeAgo } from "@/lib/format";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import type { Project } from "@/types";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects · hello atzlan" },
      { name: "description", content: "Projects, their repositories and workspaces." },
      { property: "og:title", content: "Projects · hello atzlan" },
      { property: "og:description", content: "Projects, their repositories and workspaces." },
    ],
  }),
  component: ProjectsPage,
});

export function useProjectActions() {
  const patch = useAppStore((s) => s.patch);
  return {
    create: async () => {
      const name = await prompt({ title: "New project", description: "Projects group repositories and workspaces.", confirmLabel: "Create", input: { label: "Project name", initial: "" } });
      if (!name) return;
      patch((d) => ({ projects: [...d.projects, { id: uid("p"), name, key: name.slice(0, 4).toUpperCase(), description: "New project", archived: false, updatedAt: new Date().toISOString() }] }));
      toast.success(`Project “${name}” created`);
    },
    rename: async (p: Project) => {
      const name = await prompt({ title: "Rename project", description: "", confirmLabel: "Rename", input: { label: "Project name", initial: p.name } });
      if (name) { patch((d) => ({ projects: d.projects.map((x) => (x.id === p.id ? { ...x, name } : x)) })); toast.success("Project renamed"); }
    },
    archive: async (p: Project) => {
      if (await confirm({ title: `Archive ${p.name}?`, description: "Archived projects are hidden from the wizard.", confirmLabel: "Archive" })) {
        patch((d) => ({ projects: d.projects.map((x) => (x.id === p.id ? { ...x, archived: !x.archived } : x)) }));
        toast.success("Project archived");
      }
    },
  };
}

function ProjectsPage() {
  const { projects, repositories, workspaces, sessions } = useAppStore();
  const a = useProjectActions();
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader glow title="Projects" subtitle="Repositories and workspaces, grouped by product area." actions={<Button onClick={a.create}><Plus /> New Project</Button>} />
      {projects.length === 0 && <EmptyState title="No projects yet" action={<Button onClick={a.create}>Create project</Button>} />}
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {projects.map((p) => {
          const ws = workspaces.filter((w) => w.projectId === p.id);
          return (
            <div key={p.id} className={`group rounded-2xl border bg-card p-5 shadow-card transition-shadow hover:shadow-pop ${p.archived ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="grid size-10 place-items-center rounded-xl bg-primary-subtle text-primary"><FolderKanban className="size-5" /></div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><button aria-label={`Actions for ${p.name}`} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent"><MoreHorizontal className="size-4" /></button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onSelect={() => navigate({ to: "/projects/$projectId", params: { projectId: p.id } })}><ExternalLink /> Open</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => a.rename(p)}><Pencil /> Rename</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => a.archive(p)}><Archive /> {p.archived ? "Unarchive" : "Archive"}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Link to="/projects/$projectId" params={{ projectId: p.id }} className="mt-3 block">
                <p className="text-[12px] font-semibold text-muted-foreground">{p.key}{p.archived && " · archived"}</p>
                <h2 className="text-[17px] font-semibold group-hover:underline">{p.name}</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">{p.description}</p>
              </Link>
              <div className="mt-4 flex flex-wrap gap-4 border-t pt-3 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1"><FolderGit2 className="size-3.5" />{repositories.filter((r) => r.projectId === p.id).length} repos</span>
                <span className="flex items-center gap-1"><Layers className="size-3.5" />{ws.filter((w) => w.status === "active").length} active</span>
                <span className="flex items-center gap-1"><Bot className="size-3.5" />{sessions.filter((s) => ws.some((w) => w.id === s.workspaceId)).length} sessions</span>
                <span className="ml-auto">{timeAgo(p.updatedAt)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
