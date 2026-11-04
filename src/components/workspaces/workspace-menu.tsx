import { MoreHorizontal, ExternalLink, Code2, RotateCcw, Terminal, GitCompare, Pencil, Archive, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaceActions } from "@/hooks/use-workspace-actions";
import type { Workspace } from "@/types";

export function WorkspaceMenu({ w }: { w: Workspace }) {
  const a = useWorkspaceActions();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label={`Actions for ${w.name}`} onClick={(e) => e.stopPropagation()} className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-xl" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => a.open(w)}><ExternalLink /> Open Workspace</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => a.openIDE(w)}><Code2 /> Open in IDE</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => a.resume(w)}><RotateCcw /> Resume Claude</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => a.terminal(w)}><Terminal /> Open Terminal</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => a.viewChanges(w)}><GitCompare /> View Git Changes</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => a.rename(w)}><Pencil /> Rename</DropdownMenuItem>
        {w.status !== "archived" && <DropdownMenuItem onSelect={() => a.archive(w)}><Archive /> Archive</DropdownMenuItem>}
        <DropdownMenuItem onSelect={() => a.remove(w)} className="text-danger focus:text-danger"><Trash2 /> Delete Workspace</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
