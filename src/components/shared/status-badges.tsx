import {
  AlertTriangle,
  Archive,
  Check,
  CircleDashed,
  CirclePause,
  CirclePlay,
  CircleDot,
  MessageCircleQuestion,
  XCircle,
} from "lucide-react";
import type { ClaudeState, GitState, SessionStatus, WorkspaceStatus } from "@/types";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "neutral" | "info";
const toneCls: Record<Tone, string> = {
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
  info: "bg-info-subtle text-info",
  neutral: "bg-secondary text-muted-foreground",
};

export function Pill({ tone, icon: Icon, children, className }: { tone: Tone; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-medium whitespace-nowrap", toneCls[tone], className)}>
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  );
}

const claudeMap: Record<ClaudeState, { label: string; tone: Tone; icon: typeof Check }> = {
  not_initialized: { label: "Not initialized", tone: "neutral", icon: CircleDashed },
  ready: { label: "Ready", tone: "info", icon: CircleDot },
  running: { label: "Claude Running", tone: "success", icon: CirclePlay },
  waiting: { label: "Waiting for input", tone: "warning", icon: MessageCircleQuestion },
  paused: { label: "Paused", tone: "neutral", icon: CirclePause },
  completed: { label: "Completed", tone: "neutral", icon: Check },
  error: { label: "Error", tone: "danger", icon: XCircle },
};

export function ClaudeStatusBadge({ state, className }: { state: ClaudeState; className?: string }) {
  const m = claudeMap[state];
  return <Pill tone={m.tone} icon={m.icon} className={className}><span className="sr-only">Claude status: </span>{m.label}</Pill>;
}

export function WorkspaceStatusBadge({ status, claude, git }: { status: WorkspaceStatus; claude: ClaudeState; git: GitState }) {
  if (status === "archived") return <Pill tone="neutral" icon={Archive}>Archived</Pill>;
  if (git === "ready_for_pr" && claude === "completed") return <Pill tone="neutral" icon={Check}>{status === "completed" ? "Done" : "Ready for PR"}</Pill>;
  return <ClaudeStatusBadge state={claude} />;
}

const sessionMap: Record<SessionStatus, { label: string; tone: Tone; icon: typeof Check }> = {
  running: { label: "Running", tone: "success", icon: CirclePlay },
  waiting: { label: "Waiting", tone: "warning", icon: MessageCircleQuestion },
  paused: { label: "Paused", tone: "neutral", icon: CirclePause },
  completed: { label: "Completed", tone: "info", icon: Check },
  error: { label: "Error", tone: "danger", icon: AlertTriangle },
  archived: { label: "Archived", tone: "neutral", icon: Archive },
};
export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const m = sessionMap[status];
  return <Pill tone={m.tone} icon={m.icon}>{m.label}</Pill>;
}

export function StatusDot({ tone, label }: { tone: Tone; label: string }) {
  const c = { success: "bg-success", warning: "bg-warning", danger: "bg-danger", neutral: "bg-muted-foreground/50", info: "bg-info" }[tone];
  return (
    <span className="inline-flex items-center" title={label}>
      <span className={cn("size-2 rounded-full", c)} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}
