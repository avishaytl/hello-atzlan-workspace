import { useNavigate } from "@tanstack/react-router";
import { services } from "@/services/mocks";
import { confirm, prompt } from "@/components/shared/confirm-dialog";
import { useAction } from "./use-action";
import type { Workspace } from "@/types";
import { toast } from "sonner";

/** Application-layer workflows for workspace actions (UI stays logic-free). */
export function useWorkspaceActions() {
  const { pending, run } = useAction();
  const navigate = useNavigate();
  return {
    pending,
    openIDE: (w: Workspace) => run(`ide:${w.id}`, () => services.workspaces.openInIDE(w.id)),
    resume: (w: Workspace) => run(`resume:${w.id}`, () => services.claude.resumeLatest(w.id)),
    terminal: (w: Workspace) => run(`term:${w.id}`, () => services.platform.openTerminal(w.worktreePath)),
    createPR: (w: Workspace) => run(`pr:${w.id}`, () => services.platform.createPullRequest(w.id)),
    copyPath: (w: Workspace) => run(`copy:${w.id}`, () => services.platform.copyToClipboard(w.worktreePath), "Worktree path copied"),
    copy: (text: string, label = "Copied") => run(`copy:${text}`, () => services.platform.copyToClipboard(text), label),
    open: (w: Workspace, tab?: string) => navigate({ to: "/workspaces/$workspaceId", params: { workspaceId: w.id }, search: tab ? { tab } : {} }),
    viewChanges: (w: Workspace) => navigate({ to: "/workspaces/$workspaceId", params: { workspaceId: w.id }, search: { tab: "git" } }),
    rename: async (w: Workspace) => {
      const name = await prompt({ title: "Rename workspace", description: "Only the display name changes; branch and worktree stay the same.", confirmLabel: "Rename", input: { label: "Workspace name", initial: w.name } });
      if (name) await run(`rename:${w.id}`, () => services.workspaces.rename(w.id, name), "Workspace renamed");
    },
    archive: async (w: Workspace) => {
      if (await confirm({ title: `Archive ${w.ticketId ?? w.name}?`, description: "The workspace will be hidden from active lists. (Simulated — no worktree is removed.)", confirmLabel: "Archive" }))
        await run(`archive:${w.id}`, () => services.workspaces.archive(w.id), "Workspace archived");
    },
    remove: async (w: Workspace) => {
      if (await confirm({ title: `Delete ${w.ticketId ?? w.name}?`, description: "This removes the workspace and its sessions from the demo data. In the real app this would also remove the Git worktree.", confirmLabel: "Delete workspace", destructive: true })) {
        await services.workspaces.remove(w.id);
        toast.success("Workspace deleted", { description: "Simulated action · preview only" });
        navigate({ to: "/workspaces" });
      }
    },
  };
}
