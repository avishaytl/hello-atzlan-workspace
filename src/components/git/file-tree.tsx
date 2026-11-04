import { useState } from "react";
import { ChevronRight, File, FileCode2, FileJson, FileText, Folder, FolderOpen } from "lucide-react";
import type { FileNode } from "@/types";
import { cn } from "@/lib/utils";

const fileIcon = (n: string) => (/\.(tsx?|jsx?)$/.test(n) ? FileCode2 : n.endsWith(".json") ? FileJson : n.endsWith(".md") ? FileText : File);

function Node({ node, depth, path, selected, onSelect }: { node: FileNode; depth: number; path: string; selected: string; onSelect: (p: string, n: FileNode) => void }) {
  const [open, setOpen] = useState(depth < 1);
  const full = `${path}/${node.name}`;
  if (node.type === "dir") {
    return (
      <li role="treeitem" aria-expanded={open}>
        <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-[13px] hover:bg-accent" style={{ paddingLeft: depth * 14 + 6 }}>
          <ChevronRight className={cn("size-3.5 text-muted-foreground transition-transform duration-150", open && "rotate-90")} />
          {open ? <FolderOpen className="size-4 text-warning" /> : <Folder className="size-4 text-warning" />}
          {node.name}
        </button>
        {open && <ul role="group">{node.children?.map((c) => <Node key={c.name} node={c} depth={depth + 1} path={full} selected={selected} onSelect={onSelect} />)}</ul>}
      </li>
    );
  }
  const I = fileIcon(node.name);
  return (
    <li role="treeitem" aria-selected={selected === full}>
      <button onClick={() => onSelect(full, node)} className={cn("flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-[13px] hover:bg-accent", selected === full && "bg-primary-subtle text-primary")} style={{ paddingLeft: depth * 14 + 26 }}>
        <I className="size-4 text-muted-foreground" />{node.name}
      </button>
    </li>
  );
}

export function FileTree({ tree }: { tree: FileNode[] }) {
  const [sel, setSel] = useState<{ path: string; node: FileNode } | null>(null);
  return (
    <div className="grid min-h-[380px] overflow-hidden rounded-2xl border bg-card shadow-card md:grid-cols-[280px_1fr]">
      <ul role="tree" aria-label="Worktree files" className="border-b p-2 md:border-r md:border-b-0">
        {tree.map((n) => <Node key={n.name} node={n} depth={0} path="" selected={sel?.path ?? ""} onSelect={(path, node) => setSel({ path, node })} />)}
      </ul>
      <div className="min-w-0">
        {sel ? (
          <>
            <div className="border-b px-4 py-2 font-mono text-[12px] text-muted-foreground">{sel.path.slice(1)}</div>
            <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-6">{sel.node.preview}</pre>
          </>
        ) : (
          <div className="grid h-full place-items-center p-8 text-[13px] text-muted-foreground">Select a file to preview · mock file system</div>
        )}
      </div>
    </div>
  );
}
