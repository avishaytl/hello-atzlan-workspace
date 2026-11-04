import { useNavigate } from "@tanstack/react-router";
import { Archive, Copy, History, MoreHorizontal, Pencil, RotateCcw, Pause, Loader2, ExternalLink, Code2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SessionStatusBadge } from "@/components/shared/status-badges";
import { prompt, confirm } from "@/components/shared/confirm-dialog";
import { useAction } from "@/hooks/use-action";
import { services } from "@/services/mocks";
import { useAppStore } from "@/stores/app-store";
import { duration, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ClaudeSession } from "@/types";

export function useSessionActions() {
  const { pending, run } = useAction();
  const navigate = useNavigate();
  return {
    pending,
    resume: (s: ClaudeSession) => run(`res:${s.id}`, () => services.claude.resumeSession(s.id)),
    stop: (s: ClaudeSession) => run(`stop:${s.id}`, () => services.claude.stopSession(s.id)),
    rename: async (s: ClaudeSession) => {
      const name = await prompt({ title: "Rename session", description: "Give this Claude session a memorable name.", confirmLabel: "Rename", input: { label: "Session name", initial: s.name } });
      if (name) await run(`ren:${s.id}`, () => services.claude.renameSession(s.id, name), "Session renamed");
    },
    archive: async (s: ClaudeSession) => {
      if (await confirm({ title: "Archive session?", description: `“${s.name}” will be hidden from active lists.`, confirmLabel: "Archive" }))
        await run(`arc:${s.id}`, () => services.claude.archiveSession(s.id), "Session archived");
    },
    copyId: (s: ClaudeSession) => run(`cp:${s.id}`, () => services.platform.copyToClipboard(s.id), "Session ID copied"),
    history: (s: ClaudeSession) => navigate({ to: "/claude", search: { session: s.id } }),
    workspace: (s: ClaudeSession) => navigate({ to: "/workspaces/$workspaceId", params: { workspaceId: s.workspaceId } }),
    openIDE: (s: ClaudeSession) => run(`ide:${s.id}`, () => services.workspaces.openInIDE(s.workspaceId)),
  };
}

export function SessionMenu({ s, extended }: { s: ClaudeSession; extended?: boolean }) {
  const a = useSessionActions();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label={`Actions for session ${s.name}`} onClick={(e) => e.stopPropagation()} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"><MoreHorizontal className="size-4" /></button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl" onClick={(e) => e.stopPropagation()}>
        {s.status === "running" ? <DropdownMenuItem onSelect={() => a.stop(s)}><Pause /> Pause</DropdownMenuItem> : <DropdownMenuItem disabled={s.status === "archived"} onSelect={() => a.resume(s)}><RotateCcw /> Resume</DropdownMenuItem>}
        {extended && <DropdownMenuItem onSelect={() => a.workspace(s)}><ExternalLink /> View Workspace</DropdownMenuItem>}
        {extended && <DropdownMenuItem onSelect={() => a.openIDE(s)}><Code2 /> Open IDE</DropdownMenuItem>}
        <DropdownMenuItem onSelect={() => a.rename(s)}><Pencil /> Rename</DropdownMenuItem>
        {!extended && <DropdownMenuItem onSelect={() => a.history(s)}><History /> View History</DropdownMenuItem>}
        <DropdownMenuItem onSelect={() => a.copyId(s)}><Copy /> Copy Session ID</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={s.status === "archived"} onSelect={() => a.archive(s)}><Archive /> Archive</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SessionCard({ s, selected, onSelect, showWorkspace }: { s: ClaudeSession; selected?: boolean; onSelect?: () => void; showWorkspace?: boolean }) {
  const a = useSessionActions();
  const ws = useAppStore((st) => st.workspaces.find((w) => w.id === s.workspaceId));
  const repo = useAppStore((st) => st.repositories.find((r) => r.id === ws?.repositoryId));
  return (
    <div role={onSelect ? "button" : undefined} tabIndex={onSelect ? 0 : undefined} onClick={onSelect} onKeyDown={(e) => e.key === "Enter" && onSelect?.()}
      className={cn("flex items-center gap-4 rounded-2xl border bg-card px-4 py-3 transition-all duration-150", onSelect && "cursor-pointer hover:shadow-card", selected && "border-primary-border bg-primary-subtle/60 ring-1 ring-primary-border", s.status === "archived" && "opacity-60")}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[14.5px] font-semibold">{s.name}</p>
          <span className="hidden font-mono text-[11px] text-muted-foreground md:inline">{s.id}</span>
        </div>
        <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
          {showWorkspace && ws && <><span className="font-medium text-foreground/80">{ws.ticketId ?? ws.name}</span> · {repo?.name} · </>}
          {s.model} · {duration(s.durationMin)} · {timeAgo(s.updatedAt)}
        </p>
        <p className="mt-1 truncate text-[12.5px] italic text-muted-foreground">“{s.lastMessage}”</p>
      </div>
      <SessionStatusBadge status={s.status} />
      {s.status !== "running" && s.status !== "archived" && (
        <Button size="sm" variant="outline" className="hidden rounded-full sm:inline-flex" onClick={(e) => { e.stopPropagation(); a.resume(s); }} disabled={a.pending === `res:${s.id}`}>
          {a.pending === `res:${s.id}` ? <Loader2 className="animate-spin" /> : <RotateCcw />} Resume
        </Button>
      )}
      <SessionMenu s={s} extended={showWorkspace} />
    </div>
  );
}
