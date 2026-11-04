import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, FolderGit2, FolderKanban, Loader2, Plus, CircleAlert } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { prompt } from "@/components/shared/confirm-dialog";
import { useAppStore, uid } from "@/stores/app-store";
import { useUI } from "@/stores/ui-store";
import { services } from "@/services/mocks";
import { slug } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STEPS = ["Project", "Repository", "Details", "Claude", "Review"];
const PROGRESS = ["Validating repository", "Preparing branch", "Creating worktree", "Preparing Claude session", "Workspace ready"];

interface Form {
  projectId: string; repositoryId: string; name: string; ticketId: string; description: string;
  baseBranch: string; branch: string; worktreePath: string; createSession: boolean; model: string; profile: string; tracking: boolean;
}

export function NewWorkspaceWizard() {
  const { wizardOpen, setWizardOpen, wizardTicketId, wizardProjectId } = useUI();
  const { projects, repositories, tickets, prefs, patch } = useAppStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState<number | null>(null);
  const empty: Form = { projectId: "", repositoryId: "", name: "", ticketId: "", description: "", baseBranch: "main", branch: "", worktreePath: "", createSession: true, model: prefs.claudeModel, profile: "default", tracking: true };
  const [f, setF] = useState<Form>(empty);
  const set = (p: Partial<Form>) => setF((s) => ({ ...s, ...p }));

  useEffect(() => {
    if (!wizardOpen) return;
    setProgress(null);
    const t = tickets.find((x) => x.id === wizardTicketId);
    if (t) {
      const repo = repositories.find((r) => r.id === t.repositoryId);
      setF({ ...empty, projectId: t.projectId, repositoryId: t.repositoryId, name: t.title, ticketId: t.id, description: t.description, baseBranch: repo?.defaultBranch ?? "main", branch: prefs.branchPattern.replace("{ticket}", t.id), worktreePath: `${prefs.workspaceLocation}/${t.id}` });
      setStep(2);
    } else {
      setF({ ...empty, projectId: wizardProjectId ?? "" });
      setStep(wizardProjectId ? 1 : 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardOpen]);

  const repos = repositories.filter((r) => r.projectId === f.projectId);
  const deriveBranch = (name: string, ticket: string) => {
    const key = ticket || slug(name) || "workspace";
    return { branch: prefs.branchPattern.replace("{ticket}", key), worktreePath: `${prefs.workspaceLocation}/${key}` };
  };

  const canNext = [!!f.projectId, !!f.repositoryId && !!repositories.find((r) => r.id === f.repositoryId)?.available, f.name.trim().length > 1 && !!f.branch, true, true][step];

  async function createProject() {
    const name = await prompt({ title: "New project", description: "Projects group repositories and workspaces.", confirmLabel: "Create project", input: { label: "Project name", initial: "" } });
    if (!name) return;
    const id = uid("p");
    patch((d) => ({ projects: [...d.projects, { id, name, key: name.slice(0, 4).toUpperCase(), description: "New project", archived: false, updatedAt: new Date().toISOString() }] }));
    set({ projectId: id, repositoryId: "" });
    toast.success(`Project “${name}” created`, { description: "Add a repository from the project page." });
  }

  async function submit() {
    setProgress(0);
    try {
      const w = await services.workspaces.create(
        { name: f.name.trim(), ticketId: f.ticketId.trim() || null, projectId: f.projectId, repositoryId: f.repositoryId, description: f.description, baseBranch: f.baseBranch, branch: f.branch, worktreePath: f.worktreePath, createSession: f.createSession, model: f.model },
        (i) => setProgress(i),
      );
      setProgress(5);
      await new Promise((r) => setTimeout(r, 400));
      setWizardOpen(false);
      toast.success(`Workspace ${w.ticketId ?? w.name} is ready`, { description: "Simulated — no worktree or branch was actually created." });
      navigate({ to: "/workspaces/$workspaceId", params: { workspaceId: w.id } });
    } catch {
      setProgress(null);
      toast.error("Unable to complete this simulated action.");
    }
  }

  return (
    <Dialog open={wizardOpen} onOpenChange={(o) => progress === null && setWizardOpen(o)}>
      <DialogContent className="gap-0 overflow-hidden rounded-[20px] p-0 sm:max-w-[680px]">
        <DialogHeader className="bg-header-glow border-b px-6 pt-5 pb-4">
          <DialogTitle className="text-[20px]">New Workspace</DialogTitle>
          <DialogDescription>One ticket · one branch · one worktree · many Claude sessions.</DialogDescription>
          <ol className="mt-3 flex items-center gap-1.5" aria-label="Wizard steps">
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-1.5">
                <span className={cn("grid size-5 shrink-0 place-items-center rounded-full text-[10.5px] font-semibold transition-colors", i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary-subtle text-primary ring-1 ring-primary-border" : "bg-secondary text-muted-foreground")} aria-current={i === step ? "step" : undefined}>
                  {i < step ? <Check className="size-3" /> : i + 1}
                </span>
                <span className={cn("hidden text-[12px] sm:inline", i === step ? "font-semibold" : "text-muted-foreground")}>{s}</span>
                {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
              </li>
            ))}
          </ol>
        </DialogHeader>

        <div className="max-h-[56vh] min-h-[300px] overflow-y-auto px-6 py-5">
          {progress !== null ? (
            <ul className="mx-auto max-w-sm space-y-3 py-4" aria-live="polite">
              {PROGRESS.map((p, i) => (
                <li key={p} className="flex items-center gap-3 text-[14px]">
                  <span className={cn("grid size-6 place-items-center rounded-full", i < progress ? "bg-success-subtle text-success" : i === progress ? "bg-primary-subtle text-primary" : "bg-secondary text-muted-foreground")}>
                    {i < progress ? <Check className="size-3.5" /> : i === progress ? <Loader2 className="size-3.5 animate-spin" /> : <span className="size-1.5 rounded-full bg-current" />}
                  </span>
                  <span className={cn(i > progress && "text-muted-foreground")}>{p}</span>
                </li>
              ))}
              <li className="pt-2 text-[12px] text-muted-foreground">UI simulation only — nothing runs on your machine.</li>
            </ul>
          ) : step === 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {projects.filter((p) => !p.archived).map((p) => (
                <button key={p.id} onClick={() => set({ projectId: p.id, repositoryId: "" })} className={cn("flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors hover:bg-accent", f.projectId === p.id && "border-primary-border bg-primary-subtle")}>
                  <FolderKanban className="mt-0.5 size-4 text-primary" />
                  <div><p className="text-[14px] font-semibold">{p.name}</p><p className="text-[12px] text-muted-foreground">{p.description}</p></div>
                </button>
              ))}
              <button onClick={createProject} className="flex items-center justify-center gap-2 rounded-xl border border-dashed p-3.5 text-[13px] text-muted-foreground hover:bg-accent"><Plus className="size-4" /> Create project</button>
            </div>
          ) : step === 1 ? (
            <div className="space-y-2">
              {repos.length === 0 && <p className="py-8 text-center text-[13px] text-muted-foreground">This project has no repositories yet.</p>}
              {repos.map((r) => (
                <button key={r.id} disabled={!r.available} onClick={() => { const rb = deriveBranch(f.name, f.ticketId); set({ repositoryId: r.id, baseBranch: r.defaultBranch, ...(f.branch ? {} : rb) }); }}
                  className={cn("flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60", f.repositoryId === r.id && "border-primary-border bg-primary-subtle")}>
                  <FolderGit2 className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1"><p className="text-[14px] font-semibold">{r.name}</p><p className="truncate font-mono text-[11.5px] text-muted-foreground">{r.path}</p></div>
                  <span className="font-mono text-[11.5px] text-muted-foreground">{r.defaultBranch}</span>
                  {r.available ? <span className="text-[11.5px] text-success">Available</span> : <span className="flex items-center gap-1 text-[11.5px] text-warning"><CircleAlert className="size-3" />Not found (mock)</span>}
                </button>
              ))}
            </div>
          ) : step === 2 ? (
            <div className="grid gap-3.5 sm:grid-cols-2">
              <L label="Workspace name" id="wz-name" className="sm:col-span-2"><Input id="wz-name" value={f.name} onChange={(e) => set({ name: e.target.value, ...deriveBranch(e.target.value, f.ticketId) })} placeholder="Fix authentication flow" /></L>
              <L label="Ticket ID (optional)" id="wz-ticket"><Input id="wz-ticket" value={f.ticketId} onChange={(e) => set({ ticketId: e.target.value.toUpperCase(), ...deriveBranch(f.name, e.target.value.toUpperCase()) })} placeholder="PROJ-200" /></L>
              <L label="Base branch" id="wz-base"><Input id="wz-base" value={f.baseBranch} onChange={(e) => set({ baseBranch: e.target.value })} /></L>
              <L label="New branch name" id="wz-branch"><Input id="wz-branch" className="font-mono text-[12.5px]" value={f.branch} onChange={(e) => set({ branch: e.target.value })} /></L>
              <L label="Worktree location" id="wz-path"><Input id="wz-path" className="font-mono text-[12.5px]" value={f.worktreePath} onChange={(e) => set({ worktreePath: e.target.value })} /></L>
              <L label="Description" id="wz-desc" className="sm:col-span-2"><Textarea id="wz-desc" rows={3} value={f.description} onChange={(e) => set({ description: e.target.value })} /></L>
            </div>
          ) : step === 3 ? (
            <div className="space-y-4">
              <Toggle label="Create Claude session" hint="Prepares a session record for this workspace (mock)." checked={f.createSession} onChange={(v) => set({ createSession: v })} />
              <L label="Preferred model (mock preference)" id="wz-model">
                <Select value={f.model} onValueChange={(v) => set({ model: v })}>
                  <SelectTrigger id="wz-model"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Claude Sonnet (mock)", "Claude Opus (mock)", "Claude Haiku (mock)"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </L>
              <L label="Workspace instructions profile" id="wz-profile">
                <Select value={f.profile} onValueChange={(v) => set({ profile: v })}>
                  <SelectTrigger id="wz-profile"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="default">Default (CLAUDE.md)</SelectItem><SelectItem value="frontend">Frontend conventions</SelectItem><SelectItem value="backend">Backend + tests first</SelectItem></SelectContent>
                </Select>
              </L>
              <Toggle label="Enable session tracking" hint="Track session history in hello atzlan." checked={f.tracking} onChange={(v) => set({ tracking: v })} />
              <p className="text-[12px] text-muted-foreground">These are stored preferences only — no real Claude installation is configured.</p>
            </div>
          ) : (
            <dl className="grid grid-cols-[150px_1fr] gap-y-2.5 text-[13px]">
              <dt className="text-muted-foreground">Project</dt><dd>{projects.find((p) => p.id === f.projectId)?.name}</dd>
              <dt className="text-muted-foreground">Repository</dt><dd>{repositories.find((r) => r.id === f.repositoryId)?.name}</dd>
              <dt className="text-muted-foreground">Workspace</dt><dd className="font-semibold">{f.ticketId && `${f.ticketId} · `}{f.name}</dd>
              <dt className="text-muted-foreground">Branch</dt><dd className="font-mono text-[12.5px]">{f.baseBranch} → {f.branch}</dd>
              <dt className="text-muted-foreground">Worktree</dt><dd className="font-mono text-[12.5px]">{f.worktreePath}</dd>
              <dt className="text-muted-foreground">Claude</dt><dd>{f.createSession ? `New session · ${f.model}` : "No session"}</dd>
            </dl>
          )}
        </div>

        {progress === null && (
          <div className="flex items-center justify-between border-t bg-secondary/40 px-6 py-3">
            <Button variant="ghost" onClick={() => (step === 0 ? setWizardOpen(false) : setStep(step - 1))}>{step === 0 ? "Cancel" : "Back"}</Button>
            {step < 4 ? <Button disabled={!canNext} onClick={() => setStep(step + 1)}>Continue</Button> : <Button onClick={submit}>Create Workspace</Button>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function L({ label, id, children, className }: { label: string; id: string; children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-1.5", className)}><label htmlFor={id} className="text-[12.5px] font-medium">{label}</label>{children}</div>;
}
function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border p-3.5">
      <span><span className="block text-[13.5px] font-medium">{label}</span><span className="text-[12px] text-muted-foreground">{hint}</span></span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
