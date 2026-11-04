import { Diamond, GitBranch, FolderGit2, Bot, FileDiff } from "lucide-react";
import { WorkspaceStatusBadge } from "@/components/shared/status-badges";
import { WorkspaceMenu } from "./workspace-menu";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";

export interface WorkspaceCardProps {
  w: Workspace;
  repoName?: string;
  sessionCount?: number;
  selected?: boolean;
  variant?: "compact" | "row" | "grid";
  onSelect?: () => void;
}

function TicketGlyph() {
  return (
    <div className="grid size-10 shrink-0 place-items-center rounded-full border bg-card shadow-sm">
      <Diamond className="size-4 fill-info text-info" aria-hidden />
    </div>
  );
}

export function WorkspaceCard({ w, repoName, sessionCount = 0, selected, variant = "compact", onSelect }: WorkspaceCardProps) {
  const base = cn(
    "group relative w-full cursor-pointer rounded-2xl border bg-card text-left transition-all duration-150 hover:border-primary-border/70 hover:shadow-card",
    selected && "border-primary-border bg-primary-subtle/60 ring-1 ring-primary-border",
    w.status === "archived" && "opacity-70",
  );
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect?.(); } };

  if (variant === "grid") {
    return (
      <div role="button" tabIndex={0} aria-pressed={selected} onClick={onSelect} onKeyDown={handleKey} className={cn(base, "flex flex-col gap-3 p-4")}>
        <div className="flex items-start justify-between gap-2">
          <TicketGlyph />
          <WorkspaceMenu w={w} />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-muted-foreground">{w.ticketId ?? "No ticket"}</p>
          <p className="truncate text-[15px] font-semibold">{w.name}</p>
          <p className="mt-1 flex items-center gap-1 truncate font-mono text-[11.5px] text-muted-foreground"><GitBranch className="size-3" />{w.branch}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
          <span className="flex items-center gap-1"><FolderGit2 className="size-3" />{repoName}</span>
          <span className="flex items-center gap-1"><Bot className="size-3" />{sessionCount} sessions</span>
          <span className="flex items-center gap-1"><FileDiff className="size-3" />{w.modifiedFiles} modified</span>
        </div>
        <div className="mt-auto flex items-center justify-between border-t pt-3">
          <WorkspaceStatusBadge status={w.status} claude={w.claudeState} git={w.gitState} />
          <span className="text-[11px] text-muted-foreground">{timeAgo(w.updatedAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div role="button" tabIndex={0} aria-pressed={selected} onClick={onSelect} onKeyDown={handleKey} className={cn(base, "flex items-center gap-3.5 px-4 py-3")}>
      <TicketGlyph />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">
          {w.ticketId && <span>{w.ticketId}</span>}
          {w.ticketId && <span className="mx-1.5 text-muted-foreground">·</span>}
          {w.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12.5px] text-muted-foreground">
          <span className="truncate">{w.branch}</span>
          <span aria-hidden>·</span>
          <span className="whitespace-nowrap">Updated {timeAgo(w.updatedAt)}</span>
          {variant === "row" && (
            <>
              <span aria-hidden>·</span><span className="hidden whitespace-nowrap md:inline">{repoName}</span>
              <span aria-hidden className="hidden xl:inline">·</span><span className="hidden truncate font-mono text-[11.5px] xl:inline">{w.worktreePath}</span>
            </>
          )}
        </p>
      </div>
      {variant === "row" && (
        <div className="hidden items-center gap-4 text-[12px] text-muted-foreground lg:flex">
          <span className="flex items-center gap-1" title="Claude sessions"><Bot className="size-3.5" />{sessionCount}</span>
          <span className={cn("flex items-center gap-1", w.modifiedFiles > 0 && "text-warning")} title="Modified files"><FileDiff className="size-3.5" />{w.modifiedFiles}</span>
        </div>
      )}
      {variant === "compact" && w.modifiedFiles > 0 && (
        <span className="hidden items-center gap-1 text-[11.5px] text-warning 2xl:flex" title="Modified files"><FileDiff className="size-3.5" />{w.modifiedFiles}</span>
      )}
      <WorkspaceStatusBadge status={w.status} claude={w.claudeState} git={w.gitState} />
      <WorkspaceMenu w={w} />
    </div>
  );
}
