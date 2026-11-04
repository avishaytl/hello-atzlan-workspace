import { Bot, CheckCircle2, GitBranch, GitCommitHorizontal, Layers, Play, Pause, Server, XCircle, Link2, FolderOpen, Archive } from "lucide-react";
import type { ActivityEvent } from "@/types";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const iconFor = (e: ActivityEvent) => {
  switch (e.type) {
    case "session_started": return { I: Play, c: "text-primary bg-primary-subtle" };
    case "session_completed": return { I: CheckCircle2, c: "text-success bg-success-subtle" };
    case "session_paused": return { I: Pause, c: "text-muted-foreground bg-secondary" };
    case "session_waiting": return { I: Bot, c: "text-warning bg-warning-subtle" };
    case "commit": return { I: GitCommitHorizontal, c: "text-foreground bg-secondary" };
    case "changes_detected": case "pr": return { I: GitBranch, c: "text-foreground bg-secondary" };
    case "build_completed": return { I: Server, c: "text-success bg-success-subtle" };
    case "build_failed": return { I: XCircle, c: "text-danger bg-danger-subtle" };
    case "task_linked": return { I: Link2, c: "text-info bg-info-subtle" };
    case "workspace_opened": return { I: FolderOpen, c: "text-foreground bg-secondary" };
    case "workspace_archived": return { I: Archive, c: "text-muted-foreground bg-secondary" };
    default: return { I: Layers, c: "text-foreground bg-secondary" };
  }
};

export function ActivityTimeline({ events, compact, renderMeta }: { events: ActivityEvent[]; compact?: boolean; renderMeta?: (e: ActivityEvent) => React.ReactNode }) {
  if (!events.length) return <p className="py-6 text-center text-[13px] text-muted-foreground">No activity yet.</p>;
  return (
    <ol className={cn("relative", !compact && "before:absolute before:top-2 before:bottom-2 before:left-[13px] before:w-px before:bg-border")}>
      {events.map((e) => {
        const { I, c } = iconFor(e);
        return (
          <li key={e.id} className={cn("relative flex items-center gap-3", compact ? "py-1.5" : "py-2")}>
            <span className={cn("z-10 grid size-7 shrink-0 place-items-center rounded-full", c)}><I className="size-3.5" aria-hidden /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px]">{e.title}</p>
              {renderMeta?.(e)}
            </div>
            <time dateTime={e.at} className="shrink-0 text-[11.5px] text-muted-foreground">{timeAgo(e.at)}</time>
          </li>
        );
      })}
    </ol>
  );
}
