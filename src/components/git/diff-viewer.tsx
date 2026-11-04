import { useState } from "react";
import { FilePlus2, FileMinus2, FileDiff } from "lucide-react";
import type { DiffLine, GitChange } from "@/types";
import { cn } from "@/lib/utils";

const KW = /\b(const|let|export|function|return|class|private|async|await|try|finally|if|import|from|new)\b/g;
function highlight(text: string) {
  const parts = text.split(/(\/\/.*$|"[^"]*"|'[^']*'|\b(?:const|let|export|function|return|class|private|async|await|try|finally|if|import|from|new)\b)/g);
  return parts.map((p, i) => {
    if (!p) return null;
    if (p.startsWith("//")) return <span key={i} className="text-muted-foreground italic">{p}</span>;
    if (/^["']/.test(p)) return <span key={i} className="text-success">{p}</span>;
    if (KW.test(p)) { KW.lastIndex = 0; return <span key={i} className="text-primary">{p}</span>; }
    return <span key={i}>{p}</span>;
  });
}

const statusMeta = {
  added: { I: FilePlus2, cls: "text-success", label: "A" },
  modified: { I: FileDiff, cls: "text-warning", label: "M" },
  deleted: { I: FileMinus2, cls: "text-danger", label: "D" },
};

function Line({ l, side }: { l?: DiffLine; side?: "old" | "new" }) {
  if (!l) return <div className="h-5 bg-secondary/40" />;
  const bg = l.type === "add" ? "bg-diff-add" : l.type === "del" ? "bg-diff-del" : l.type === "hunk" ? "bg-info-subtle text-info" : "";
  const no = side === "old" ? l.oldNo : side === "new" ? l.newNo : undefined;
  return (
    <div className={cn("flex min-h-5 font-mono text-[12px] leading-5", bg)}>
      {l.type !== "hunk" && (side ? (
        <span className="w-10 shrink-0 pr-2 text-right text-muted-foreground/70 select-none">{no ?? ""}</span>
      ) : (
        <>
          <span className="w-9 shrink-0 pr-2 text-right text-muted-foreground/70 select-none">{l.oldNo ?? ""}</span>
          <span className="w-9 shrink-0 pr-2 text-right text-muted-foreground/70 select-none">{l.newNo ?? ""}</span>
        </>
      ))}
      <span className="w-4 shrink-0 text-center text-muted-foreground select-none">{l.type === "add" ? "+" : l.type === "del" ? "−" : ""}</span>
      <span className="pr-4 whitespace-pre">{l.type === "hunk" ? <span className="px-2">{l.text}</span> : highlight(l.text)}</span>
    </div>
  );
}

function sideBySide(lines: DiffLine[]) {
  const rows: [DiffLine | undefined, DiffLine | undefined][] = [];
  let dels: DiffLine[] = [], adds: DiffLine[] = [];
  const flush = () => { const n = Math.max(dels.length, adds.length); for (let i = 0; i < n; i++) rows.push([dels[i], adds[i]]); dels = []; adds = []; };
  for (const l of lines) {
    if (l.type === "del") dels.push(l);
    else if (l.type === "add") adds.push(l);
    else { flush(); rows.push([l, l]); }
  }
  flush();
  return rows;
}

export function DiffViewer({ changes }: { changes: GitChange[] }) {
  const [sel, setSel] = useState(0);
  const [mode, setMode] = useState<"unified" | "split">("unified");
  const c = changes[sel];
  if (!c) return null;
  const counts = { added: changes.filter((x) => x.status === "added").length, modified: changes.filter((x) => x.status === "modified").length, deleted: changes.filter((x) => x.status === "deleted").length };
  return (
    <div className="grid min-h-[420px] overflow-hidden rounded-2xl border bg-card shadow-card md:grid-cols-[260px_1fr]">
      <div className="border-b md:border-r md:border-b-0">
        <div className="flex gap-3 border-b px-3 py-2.5 text-[11.5px] text-muted-foreground">
          <span className="text-success">+{counts.added} added</span><span className="text-warning">~{counts.modified} modified</span><span className="text-danger">−{counts.deleted} deleted</span>
        </div>
        <ul className="p-1.5" role="listbox" aria-label="Changed files">
          {changes.map((f, i) => {
            const m = statusMeta[f.status];
            return (
              <li key={f.path}>
                <button role="option" aria-selected={i === sel} onClick={() => setSel(i)} className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px] hover:bg-accent", i === sel && "bg-primary-subtle")}>
                  <m.I className={cn("size-3.5 shrink-0", m.cls)} />
                  <span className="min-w-0 flex-1 truncate font-mono text-[12px]">{f.path.split("/").pop()}</span>
                  <span className={cn("text-[10px] font-bold", m.cls)} aria-label={f.status}>{m.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
          <div className="min-w-0 truncate font-mono text-[12px]">{c.path} <span className="ml-2 text-success">+{c.additions}</span> <span className="text-danger">−{c.deletions}</span></div>
          <div role="radiogroup" aria-label="Diff layout" className="flex rounded-lg bg-secondary p-0.5 text-[11.5px]">
            {(["unified", "split"] as const).map((m) => (
              <button key={m} role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={cn("rounded-md px-2.5 py-1 capitalize text-muted-foreground", mode === m && "bg-card text-foreground shadow-sm")}>{m === "split" ? "Side by side" : "Unified"}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto py-1">
          {mode === "unified" ? c.diff.map((l, i) => <Line key={i} l={l} />) : (
            <div className="grid min-w-[640px] grid-cols-2 divide-x">
              <div>{sideBySide(c.diff).map(([o], i) => <Line key={i} l={o?.type === "add" ? undefined : o} side="old" />)}</div>
              <div>{sideBySide(c.diff).map(([, n], i) => <Line key={i} l={n?.type === "del" ? undefined : n} side="new" />)}</div>
            </div>
          )}
        </div>
        <p className="border-t px-4 py-2 text-[11px] text-muted-foreground">Read-only sample diff · no Git commands were run.</p>
      </div>
    </div>
  );
}
