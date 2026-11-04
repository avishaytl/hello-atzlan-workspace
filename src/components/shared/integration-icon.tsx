import { Bot, GitBranch, Diamond, Hammer, BarChart3, ToggleRight, Layers } from "lucide-react";
import type { IntegrationId, Integration } from "@/types";
import { cn } from "@/lib/utils";

const map: Record<IntegrationId, { icon: typeof Bot; cls: string }> = {
  claude: { icon: Bot, cls: "text-primary" },
  git: { icon: GitBranch, cls: "text-warning" },
  jira: { icon: Diamond, cls: "text-info" },
  jenkins: { icon: Hammer, cls: "text-muted-foreground" },
  mixpanel: { icon: BarChart3, cls: "text-info" },
  statsig: { icon: ToggleRight, cls: "text-foreground" },
  contentful: { icon: Layers, cls: "text-warning" },
};

export function IntegrationIcon({ id, className }: { id: IntegrationId; className?: string }) {
  const { icon: I, cls } = map[id];
  return <I className={cn("size-4", cls, className)} aria-hidden />;
}

export const integrationStatus = (s: Integration["status"]) =>
  s === "demo_connected"
    ? { tone: "success" as const, label: "Demo: connected" }
    : s === "demo_attention"
      ? { tone: "warning" as const, label: "Demo: needs attention" }
      : { tone: "neutral" as const, label: "Not configured" };
